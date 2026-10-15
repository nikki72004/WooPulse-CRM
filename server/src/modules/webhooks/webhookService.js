import { db } from '../../lib/db.js';
import { normalizeEmail, verifyWooWebhookSignature } from '../../utils/helpers.js';
import { ENV } from '../../config/env.js';
import { logger } from '../../lib/logger.js';
import crypto from 'crypto';

export const webhookService = {
  processWebhook: async (rawBody, headers, payload) => {
    const deliveryId = headers['x-wc-webhook-delivery-id'] || `del-${Date.now()}`;
    const topic = headers['x-wc-webhook-topic'] || payload.topic || 'unknown';
    const signature = headers['x-wc-webhook-signature'];

    logger.info(`Received webhook: topic=${topic}, deliveryId=${deliveryId}`);

    // Verify signature if secret configured and signature provided
    if (ENV.WOO_WEBHOOK_SECRET && signature) {
      const isValid = verifyWooWebhookSignature(rawBody, signature, ENV.WOO_WEBHOOK_SECRET);
      if (!isValid) {
        logger.warn('Webhook signature mismatch', { deliveryId, topic });
        return { success: false, status: 401, error: 'Signature verification failed' };
      }
    }

    // Idempotency check on delivery ID
    const existingEvent = db.findOne('webhookEvents', e => e.deliveryId === deliveryId);
    if (existingEvent) {
      logger.info('Duplicate webhook delivery received, acknowledging idempotently', { deliveryId });
      return { success: true, status: 200, message: 'Already processed (idempotent)', deliveryId };
    }

    // Record webhook event
    const eventRecord = db.insert('webhookEvents', {
      deliveryId,
      topic,
      resourceId: payload.id || null,
      status: 'PROCESSING',
      error: null,
      receivedAt: new Date().toISOString(),
    });

    try {
      if (topic.startsWith('order.')) {
        await webhookService.handleOrderEvent(payload);
      } else if (topic.startsWith('customer.')) {
        await webhookService.handleCustomerEvent(payload);
      }

      db.update('webhookEvents', eventRecord.id, { status: 'PROCESSED' });
      return { success: true, status: 200, message: 'Processed successfully', deliveryId };
    } catch (err) {
      logger.error('Error handling webhook payload:', { error: err.message });
      db.update('webhookEvents', eventRecord.id, { status: 'FAILED', error: err.message });
      return { success: false, status: 500, error: err.message };
    }
  },

  handleOrderEvent: async (orderPayload) => {
    const existing = db.findOne('orders', o => o.wooOrderId === orderPayload.id);

    // Timestamp check: if incoming date_modified is not newer than stored, skip update
    if (existing && orderPayload.date_modified) {
      const storedTime = new Date(existing.dateModified || 0).getTime();
      const incomingTime = new Date(orderPayload.date_modified).getTime();
      if (incomingTime <= storedTime) {
        logger.info(`Skipping order #${orderPayload.id} update: incoming date_modified (${orderPayload.date_modified}) is not newer than stored.`);
        return;
      }
    }

    // Match customer
    let matchedCustomer = null;
    if (orderPayload.customer_id) {
      matchedCustomer = db.findOne('customers', c => c.wooCustomerId === orderPayload.customer_id);
    }
    if (!matchedCustomer && orderPayload.billing?.email) {
      const norm = normalizeEmail(orderPayload.billing.email);
      matchedCustomer = db.findOne('customers', c => c.email === norm);
    }

    if (existing) {
      db.update('orders', existing.id, {
        status: orderPayload.status,
        total: parseFloat(orderPayload.total) || existing.total,
        dateModified: orderPayload.date_modified || new Date().toISOString(),
        rawSyncedAt: new Date().toISOString(),
      });
      db.logActivity('WEBHOOK', `Order #${orderPayload.id} updated to status "${orderPayload.status}" via webhook.`, matchedCustomer?.id);
    } else {
      db.insert('orders', {
        wooOrderId: orderPayload.id,
        number: String(orderPayload.number || orderPayload.id),
        status: orderPayload.status || 'processing',
        currency: orderPayload.currency || 'USD',
        total: parseFloat(orderPayload.total) || 0,
        dateCreated: orderPayload.date_created || new Date().toISOString(),
        dateModified: orderPayload.date_modified || new Date().toISOString(),
        customerId: matchedCustomer ? matchedCustomer.id : null,
        billingEmail: normalizeEmail(orderPayload.billing?.email),
        billing: orderPayload.billing || {},
        lineItems: (orderPayload.line_items || []).map(li => ({
          id: li.id,
          name: li.name,
          quantity: li.quantity,
          price: parseFloat(li.price) || 0,
          total: parseFloat(li.total) || 0,
        })),
        rawSyncedAt: new Date().toISOString(),
      });
      db.logActivity('WEBHOOK', `New order #${orderPayload.id} ingested via webhook ($${orderPayload.total || '0.00'}).`, matchedCustomer?.id);
    }
  },

  handleCustomerEvent: async (custPayload) => {
    const existing = db.findOne('customers', c => c.wooCustomerId === custPayload.id);
    const normEmail = normalizeEmail(custPayload.email);

    if (existing) {
      db.update('customers', existing.id, {
        firstName: custPayload.first_name || existing.firstName,
        lastName: custPayload.last_name || existing.lastName,
        billing: custPayload.billing || existing.billing,
        wooDateModified: custPayload.date_modified || new Date().toISOString(),
      });
      db.logActivity('WEBHOOK', `Customer #${custPayload.id} profile updated via webhook.`, existing.id);
    } else {
      const newCust = db.insert('customers', {
        wooCustomerId: custPayload.id,
        email: normEmail,
        firstName: custPayload.first_name || 'Guest',
        lastName: custPayload.last_name || '',
        phone: custPayload.billing?.phone || '',
        billing: custPayload.billing || {},
        emailConsent: true,
        unsubscribedAt: null,
        source: 'woo',
        wooDateModified: custPayload.date_modified || new Date().toISOString(),
        createdAt: custPayload.date_created || new Date().toISOString(),
      });
      db.logActivity('WEBHOOK', `New customer #${custPayload.id} created via webhook.`, newCust.id);
    }
  },

  simulateEvent: async (type = 'order.updated') => {
    const deliveryId = `sim_del_${Date.now()}`;
    const orders = db.get('orders');
    const targetOrder = orders[0];

    const payload = {
      id: targetOrder.wooOrderId,
      number: targetOrder.number,
      status: targetOrder.status === 'completed' ? 'processing' : 'completed',
      total: targetOrder.total,
      currency: targetOrder.currency,
      date_created: targetOrder.dateCreated,
      date_modified: new Date().toISOString(),
      billing: targetOrder.billing,
      line_items: targetOrder.lineItems,
    };

    const raw = JSON.stringify(payload);
    const signature = crypto
      .createHmac('sha256', ENV.WOO_WEBHOOK_SECRET)
      .update(raw)
      .digest('base64');

    const headers = {
      'x-wc-webhook-delivery-id': deliveryId,
      'x-wc-webhook-topic': type,
      'x-wc-webhook-signature': signature,
    };

    return webhookService.processWebhook(raw, headers, payload);
  }
};
