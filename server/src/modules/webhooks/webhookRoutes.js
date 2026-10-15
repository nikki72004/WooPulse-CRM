import { Router } from 'express';
import { webhookService } from './webhookService.js';
import { db } from '../../lib/db.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

// Public webhook listener for WooCommerce
router.post('/woocommerce', async (req, res) => {
  const rawBody = req.rawBody || JSON.stringify(req.body);
  const result = await webhookService.processWebhook(rawBody, req.headers, req.body);
  return res.status(result.status || 200).json(result);
});

// Authenticated management endpoints
router.get('/events', authenticate, (req, res) => {
  const events = [...db.get('webhookEvents')].sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt));
  res.json({ events });
});

router.post('/simulate', authenticate, async (req, res) => {
  const type = req.body.type || 'order.updated';
  const result = await webhookService.simulateEvent(type);
  res.json(result);
});

export default router;
