import { db } from '../../lib/db.js';
import { SEGMENT_RULES } from '../../config/segmentRules.js';

export const orderService = {
  getAll: (filters = {}) => {
    let orders = db.get('orders');

    if (filters.status && filters.status !== 'All') {
      orders = orders.filter(o => o.status.toLowerCase() === filters.status.toLowerCase());
    }

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      orders = orders.filter(o => 
        (o.number && o.number.includes(q)) ||
        (o.billingEmail && o.billingEmail.toLowerCase().includes(q)) ||
        (o.billing?.firstName && o.billing.firstName.toLowerCase().includes(q)) ||
        (o.billing?.lastName && o.billing.lastName.toLowerCase().includes(q))
      );
    }

    // Sort descending by date
    orders = [...orders].sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));

    return orders.map(o => ({
      ...o,
      isQualifying: SEGMENT_RULES.QUALIFYING_STATUSES.includes(o.status.toLowerCase()),
    }));
  },

  getById: (id) => {
    const order = db.findById('orders', id) || db.findOne('orders', o => o.number === id || o.wooOrderId === parseInt(id, 10));
    if (!order) return null;

    const customer = order.customerId ? db.findById('customers', order.customerId) : null;

    return {
      ...order,
      isQualifying: SEGMENT_RULES.QUALIFYING_STATUSES.includes(order.status.toLowerCase()),
      customer,
    };
  }
};
