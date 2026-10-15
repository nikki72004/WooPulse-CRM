import { db } from '../../lib/db.js';
import { segmentService } from '../segments/segmentService.js';
import { normalizeEmail } from '../../utils/helpers.js';

export const customerService = {
  getAll: (filters = {}) => {
    let list = segmentService.enrichAll();

    // Filter by search query
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(c => 
        (c.firstName && c.firstName.toLowerCase().includes(q)) ||
        (c.lastName && c.lastName.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q))
      );
    }

    // Filter by segment
    if (filters.segment && filters.segment !== 'All') {
      list = list.filter(c => c.segment.toLowerCase() === filters.segment.toLowerCase());
    }

    // Sort
    if (filters.sortBy === 'spend') {
      list.sort((a, b) => b.lifetimeOrderValue - a.lifetimeOrderValue);
    } else if (filters.sortBy === 'orders') {
      list.sort((a, b) => b.qualifyingOrderCount - a.qualifyingOrderCount);
    } else if (filters.sortBy === 'recent') {
      list.sort((a, b) => new Date(b.lastOrderDate || 0) - new Date(a.lastOrderDate || 0));
    } else {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return list;
  },

  getById: (id) => {
    const raw = db.findById('customers', id);
    if (!raw) return null;
    const enriched = segmentService.enrichCustomer(raw);

    // Fetch related CRM objects
    const orders = db.find('orders', o => 
      o.customerId === id || 
      (o.billingEmail && o.billingEmail.toLowerCase() === raw.email?.toLowerCase())
    ).sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));

    const notes = db.find('notes', n => n.customerId === id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const tasks = db.find('tasks', t => t.customerId === id)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    const communications = db.find('communications', c => c.customerId === id)
      .sort((a, b) => new Date(b.sentAt || b.createdAt) - new Date(a.sentAt || a.createdAt));

    // Construct unified timeline
    const timeline = [];

    orders.forEach(o => {
      timeline.push({
        id: `tl-ord-${o.id}`,
        type: 'ORDER',
        title: `Order #${o.number} placed (${o.status})`,
        description: `Order value: $${parseFloat(o.total).toFixed(2)} - ${o.lineItems?.length || 0} items`,
        timestamp: o.dateCreated,
        meta: { orderId: o.id, status: o.status, total: o.total }
      });
    });

    notes.forEach(n => {
      timeline.push({
        id: `tl-note-${n.id}`,
        type: 'NOTE',
        title: 'Staff note added',
        description: n.body,
        timestamp: n.createdAt,
      });
    });

    communications.forEach(c => {
      timeline.push({
        id: `tl-comm-${c.id}`,
        type: 'EMAIL',
        title: `Email sent: ${c.subject}`,
        description: `Status: ${c.status}`,
        timestamp: c.sentAt,
      });
    });

    tasks.forEach(t => {
      timeline.push({
        id: `tl-task-${t.id}`,
        type: 'TASK',
        title: `Task created: ${t.title}`,
        description: `Due: ${new Date(t.dueDate).toLocaleDateString()} (${t.status})`,
        timestamp: t.createdAt,
      });
    });

    timeline.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return {
      ...enriched,
      orders,
      notes,
      tasks,
      communications,
      timeline,
    };
  },

  updateCrmFields: (id, updates) => {
    // Only allow updating CRM-managed fields, NEVER WooCommerce source fields
    const allowed = ['emailConsent', 'phone'];
    const filtered = {};
    allowed.forEach(k => {
      if (updates[k] !== undefined) filtered[k] = updates[k];
    });

    if (updates.emailConsent === false) {
      filtered.unsubscribedAt = new Date().toISOString();
    } else if (updates.emailConsent === true) {
      filtered.unsubscribedAt = null;
    }

    const updated = db.update('customers', id, filtered);
    if (updated) {
      db.logActivity('CUSTOMER', `Updated CRM profile attributes for ${updated.firstName} ${updated.lastName}.`, id);
    }
    return updated;
  },

  getDuplicates: () => {
    const candidates = db.get('duplicateCandidates');
    return candidates.map(cand => {
      const custA = segmentService.enrichCustomer(db.findById('customers', cand.customerAId));
      const custB = segmentService.enrichCustomer(db.findById('customers', cand.customerBId));
      return {
        ...cand,
        customerA: custA,
        customerB: custB,
      };
    });
  },

  resolveDuplicate: (candidateId, action) => {
    const candidate = db.findById('duplicateCandidates', candidateId);
    if (!candidate) return { success: false, error: 'Candidate not found' };

    if (action === 'DISMISS') {
      db.update('duplicateCandidates', candidateId, { status: 'DISMISSED' });
      db.logActivity('DUPLICATE', `Dismissed duplicate candidate record ${candidateId}.`);
      return { success: true, message: 'Dismissed candidate successfully' };
    }

    if (action === 'MERGE') {
      const custA = db.findById('customers', candidate.customerAId);
      const custB = db.findById('customers', candidate.customerBId);

      // Prefer WooCommerce registered customer over guest account
      const primary = custA.wooCustomerId ? custA : custB;
      const secondary = primary.id === custA.id ? custB : custA;

      // Re-link secondary customer's orders, notes, tasks, communications to primary
      ['orders', 'notes', 'tasks', 'communications'].forEach(coll => {
        db.find(coll, item => item.customerId === secondary.id).forEach(item => {
          db.update(coll, item.id, { customerId: primary.id });
        });
      });

      // Remove secondary customer record
      db.delete('customers', secondary.id);
      db.update('duplicateCandidates', candidateId, { status: 'MERGED' });

      db.logActivity('DUPLICATE', `Merged duplicate customer accounts into ${primary.firstName} ${primary.lastName} (${primary.id}).`, primary.id);
      return { success: true, message: 'Merged accounts successfully' };
    }

    return { success: false, error: 'Invalid action. Use MERGE or DISMISS.' };
  }
};
