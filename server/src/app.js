import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { captureRawBody } from './middleware/rawBody.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authenticate } from './middleware/auth.js';
import { db } from './lib/db.js';
import { segmentService } from './modules/segments/segmentService.js';

// Route imports
import authRoutes from './modules/auth/authRoutes.js';
import customerRoutes from './modules/customers/customerRoutes.js';
import orderRoutes from './modules/orders/orderRoutes.js';
import noteRoutes from './modules/notes/noteRoutes.js';
import taskRoutes from './modules/tasks/taskRoutes.js';
import commRoutes from './modules/communications/commRoutes.js';
import syncRoutes from './modules/sync/syncRoutes.js';
import webhookRoutes from './modules/webhooks/webhookRoutes.js';
import agentRoutes from './modules/agent/agentRoutes.js';
import dashboardRoutes from './modules/dashboard/dashboardRoutes.js';
import insightRoutes from './modules/insights/insightRoutes.js';
import settingsRoutes from './modules/settings/settingsRoutes.js';

const app = express();

// Security and CORS
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));

app.use(cookieParser());

// Preserve raw body buffer for WooCommerce webhook HMAC verification
app.use(express.json({ verify: captureRawBody }));
app.use(express.urlencoded({ extended: true, verify: captureRawBody }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'WooPulse CRM API', timestamp: new Date().toISOString() });
});

// Global ⌘K Search
app.get('/api/search', authenticate, (req, res) => {
  const q = (req.query.q || '').toLowerCase().trim();
  if (!q) return res.json({ results: [] });

  const customers = segmentService.enrichAll().filter(c => 
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
    c.email?.toLowerCase().includes(q) ||
    (c.phone && c.phone.includes(q))
  ).slice(0, 5);

  const orders = db.get('orders').filter(o => 
    o.number.includes(q) ||
    o.billingEmail?.toLowerCase().includes(q) ||
    (o.billing?.firstName && o.billing.firstName.toLowerCase().includes(q))
  ).slice(0, 5);

  const results = [
    ...customers.map(c => ({
      id: c.id,
      type: 'CUSTOMER',
      title: `${c.firstName} ${c.lastName}`,
      subtitle: `${c.email} · ${c.segment} Segment · $${c.lifetimeOrderValue.toFixed(2)}`,
      link: `/customers/${c.id}`,
    })),
    ...orders.map(o => ({
      id: o.id,
      type: 'ORDER',
      title: `Order #${o.number} (${o.status})`,
      subtitle: `${o.billingEmail} · $${parseFloat(o.total).toFixed(2)}`,
      link: `/orders?selected=${o.id}`,
    }))
  ];

  res.json({ results });
});

// Module routers
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/communications', commRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/insights', insightRoutes);
app.use('/api/settings', settingsRoutes);

// Error handling middleware
app.use(errorHandler);

export default app;
