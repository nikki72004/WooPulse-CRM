import { db } from '../../lib/db.js';
import { wooClient } from '../../lib/wooClient.js';
import { normalizeEmail } from '../../utils/helpers.js';
import { logger } from '../../lib/logger.js';
import { v4 as uuidv4 } from 'uuid';

export const syncService = {
  isSyncing: false,
  currentRun: null,

  getStatus: () => {
    const history = db.get('syncRuns');
    const lastRun = history.length > 0 ? history[history.length - 1] : null;
    return {
      isSyncing: syncService.isSyncing,
      lastSync: lastRun ? lastRun.finishedAt || lastRun.startedAt : null,
      lastStatus: lastRun ? lastRun.status : 'IDLE',
      currentRun: syncService.currentRun,
    };
  },

  getHistory: () => {
    const history = [...db.get('syncRuns')];
    history.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
    return history;
  },

  triggerSync: async (type = 'incremental') => {
    if (syncService.isSyncing) {
      return { success: false, message: 'A sync run is already in progress.' };
    }

    syncService.isSyncing = true;
    const startTime = new Date().toISOString();
    const runId = `sync-${uuidv4().slice(0, 8)}`;

    const syncRecord = db.insert('syncRuns', {
      id: runId,
      type,
      status: 'IN_PROGRESS',
      startedAt: startTime,
      finishedAt: null,
      counts: { customersSynced: 0, ordersSynced: 0, duplicatesDetected: 0 },
      error: null,
    });

    syncService.currentRun = syncRecord;

    try {
      let customersCount = 0;
      let ordersCount = 0;
      let duplicatesCount = 0;

      if (wooClient.isLiveConfigured) {
        logger.info(`Starting live WooCommerce ${type} sync...`);
        const lastSuccess = db.find('syncRuns', r => r.status === 'SUCCESS').pop();
        const modifiedAfter = type === 'incremental' && lastSuccess ? lastSuccess.startedAt : null;

        const wooCustomers = await wooClient.fetchCustomers(modifiedAfter);
        const wooOrders = await wooClient.fetchOrders(modifiedAfter);

        customersCount = wooCustomers.length;
        ordersCount = wooOrders.length;

        // Ingest into internal db
        wooCustomers.forEach(wc => {
          const existing = db.findOne('customers', c => c.wooCustomerId === wc.id || (wc.email && c.email === normalizeEmail(wc.email)));
          if (existing) {
            db.update('customers', existing.id, {
              wooCustomerId: wc.id,
              firstName: wc.first_name || existing.firstName,
              lastName: wc.last_name || existing.lastName,
              billing: wc.billing || existing.billing,
              wooDateModified: wc.date_modified || new Date().toISOString(),
            });
          } else {
            db.insert('customers', {
              wooCustomerId: wc.id,
              email: normalizeEmail(wc.email),
              firstName: wc.first_name,
              lastName: wc.last_name,
              phone: wc.billing?.phone || '',
              billing: wc.billing || {},
              emailConsent: true,
              unsubscribedAt: null,
              source: 'woo',
              wooDateModified: wc.date_modified || new Date().toISOString(),
              createdAt: wc.date_created || new Date().toISOString(),
            });
          }
        });

        wooOrders.forEach(wo => {
          const existing = db.findOne('orders', o => o.wooOrderId === wo.id);
          const matchedCust = db.findOne('customers', c => c.wooCustomerId === wo.customer_id || (wo.billing?.email && c.email === normalizeEmail(wo.billing.email)));

          if (existing) {
            db.update('orders', existing.id, {
              status: wo.status,
              total: parseFloat(wo.total) || 0,
              dateModified: wo.date_modified,
              rawSyncedAt: new Date().toISOString(),
            });
          } else {
            db.insert('orders', {
              wooOrderId: wo.id,
              number: String(wo.number || wo.id),
              status: wo.status,
              currency: wo.currency || 'USD',
              total: parseFloat(wo.total) || 0,
              dateCreated: wo.date_created,
              dateModified: wo.date_modified,
              customerId: matchedCust ? matchedCust.id : null,
              billingEmail: normalizeEmail(wo.billing?.email),
              billing: wo.billing || {},
              lineItems: (wo.line_items || []).map(li => ({
                id: li.id,
                name: li.name,
                quantity: li.quantity,
                price: parseFloat(li.price) || 0,
                total: parseFloat(li.total) || 0,
              })),
              rawSyncedAt: new Date().toISOString(),
            });
          }
        });
      } else {
        // Simulated incremental scan
        const customers = db.get('customers');
        const orders = db.get('orders');
        customersCount = customers.length;
        ordersCount = orders.length;

        // Touch sync timestamp
        orders.forEach(o => {
          o.rawSyncedAt = new Date().toISOString();
        });
        db.save();
      }

      // Check duplicates
      const allCustomers = db.get('customers');
      const emailMap = new Map();
      allCustomers.forEach(c => {
        if (!c.email) return;
        const norm = normalizeEmail(c.email);
        if (emailMap.has(norm)) {
          const other = emailMap.get(norm);
          const existingCand = db.findOne('duplicateCandidates', dc => 
            (dc.customerAId === other.id && dc.customerBId === c.id) ||
            (dc.customerAId === c.id && dc.customerBId === other.id)
          );
          if (!existingCand) {
            db.insert('duplicateCandidates', {
              customerAId: other.id,
              customerBId: c.id,
              reason: `Identical normalized email address: ${norm}`,
              status: 'OPEN',
              createdAt: new Date().toISOString(),
            });
            duplicatesCount++;
          }
        } else {
          emailMap.set(norm, c);
        }
      });

      const finishTime = new Date().toISOString();
      const updatedRun = db.update('syncRuns', runId, {
        status: 'SUCCESS',
        finishedAt: finishTime,
        counts: {
          customersSynced: customersCount,
          ordersSynced: ordersCount,
          duplicatesDetected: duplicatesCount,
        },
      });

      db.logActivity('SYNC', `Completed ${type} synchronization with WooCommerce (${customersCount} customers, ${ordersCount} orders).`);

      syncService.isSyncing = false;
      syncService.currentRun = null;

      return {
        success: true,
        run: updatedRun,
      };
    } catch (err) {
      logger.error('Sync run failed:', { error: err.message });
      const failedRun = db.update('syncRuns', runId, {
        status: 'FAILED',
        finishedAt: new Date().toISOString(),
        error: err.message,
      });

      syncService.isSyncing = false;
      syncService.currentRun = null;

      return {
        success: false,
        error: err.message,
        run: failedRun,
      };
    }
  }
};
