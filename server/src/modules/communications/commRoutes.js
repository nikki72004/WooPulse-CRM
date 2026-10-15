import { Router } from 'express';
import { db } from '../../lib/db.js';
import { emailService } from '../../lib/resendClient.js';
import { segmentService } from '../segments/segmentService.js';
import { authenticate } from '../../middleware/auth.js';
import { formatCurrency } from '../../utils/helpers.js';

const router = Router();
router.use(authenticate);

function interpolate(text, customer) {
  if (!text) return '';
  const lastOrderDateStr = customer.lastOrderDate 
    ? new Date(customer.lastOrderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'recent acquisition';
  
  return text
    .replace(/\{\{firstName\}\}/g, customer.firstName || 'Valued Patron')
    .replace(/\{\{lastName\}\}/g, customer.lastName || '')
    .replace(/\{\{totalSpend\}\}/g, formatCurrency(customer.lifetimeOrderValue || 0))
    .replace(/\{\{lastOrderDate\}\}/g, lastOrderDateStr)
    .replace(/\{\{storeName\}\}/g, 'Demo Boutique');
}

router.get('/history', (req, res) => {
  const comms = db.get('communications').map(c => {
    const customer = db.findById('customers', c.customerId);
    return {
      ...c,
      customer: customer ? { id: customer.id, name: `${customer.firstName} ${customer.lastName}`, email: customer.email } : null,
    };
  });
  comms.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
  res.json({ communications: comms });
});

router.get('/templates', (req, res) => {
  res.json({ templates: db.get('emailTemplates') });
});

router.post('/preview', (req, res) => {
  const { customerId, templateId, customSubject, customBody } = req.body;
  if (!customerId) {
    return res.status(400).json({ error: 'Customer ID is required.' });
  }

  const raw = db.findById('customers', customerId);
  if (!raw) {
    return res.status(404).json({ error: 'Customer not found.' });
  }

  const customer = segmentService.enrichCustomer(raw);

  let template = null;
  if (templateId) {
    template = db.findById('emailTemplates', templateId);
  }

  const subjectTemplate = customSubject || template?.subject || '';
  const bodyTemplate = customBody || template?.body || '';

  const renderedSubject = interpolate(subjectTemplate, customer);
  const renderedBody = interpolate(bodyTemplate, customer);

  const hasConsent = customer.emailConsent === true && !customer.unsubscribedAt;

  res.json({
    recipient: {
      id: customer.id,
      name: `${customer.firstName} ${customer.lastName}`,
      email: customer.email,
      emailConsent: customer.emailConsent,
      unsubscribedAt: customer.unsubscribedAt,
      hasConsent,
    },
    renderedSubject,
    renderedBody,
    consentWarning: !hasConsent ? 'Notice: This recipient has revoked email consent or unsubscribed. Dispatch is blocked to maintain CAN-SPAM / GDPR compliance.' : null,
  });
});

router.post('/send', async (req, res) => {
  const { customerId, templateId, subject, body, taskId } = req.body;
  if (!customerId || !subject || !body) {
    return res.status(400).json({ error: 'Customer ID, subject, and body are required.' });
  }

  const raw = db.findById('customers', customerId);
  if (!raw) {
    return res.status(404).json({ error: 'Customer not found.' });
  }

  const customer = segmentService.enrichCustomer(raw);

  // Consent enforcement guard
  if (!customer.emailConsent || customer.unsubscribedAt) {
    return res.status(403).json({
      error: 'Dispatch blocked: Customer has revoked marketing consent or unsubscribed.',
    });
  }

  try {
    const renderedSubject = interpolate(subject, customer);
    const renderedBody = interpolate(body, customer);

    const result = await emailService.sendEmail({
      to: customer.email,
      subject: renderedSubject,
      text: renderedBody,
    });

    const comm = db.insert('communications', {
      customerId: customer.id,
      type: 'EMAIL',
      subject: renderedSubject,
      body: renderedBody,
      status: 'DELIVERED',
      providerMessageId: result.id,
      error: null,
      taskId: taskId || null,
      sentAt: new Date().toISOString(),
    });

    if (taskId) {
      db.update('tasks', taskId, { status: 'COMPLETED' });
    }

    db.logActivity('COMMUNICATION', `Sent email "${renderedSubject}" to ${customer.firstName} ${customer.lastName} (${customer.email}).`, customer.id);

    res.json({
      success: true,
      communication: comm,
      providerMessageId: result.id,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to dispatch email' });
  }
});

export default router;
