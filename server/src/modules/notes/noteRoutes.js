import { Router } from 'express';
import { db } from '../../lib/db.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.post('/', (req, res) => {
  const { customerId, body } = req.body;
  if (!customerId || !body || !body.trim()) {
    return res.status(400).json({ error: 'Customer ID and note body are required.' });
  }

  const customer = db.findById('customers', customerId);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found.' });
  }

  const now = new Date().toISOString();
  const note = db.insert('notes', {
    customerId,
    body: body.trim(),
    createdAt: now,
    updatedAt: now,
  });

  db.logActivity('NOTE', `Added private CRM note for ${customer.firstName} ${customer.lastName}.`, customerId);

  res.status(201).json({ note });
});

router.delete('/:id', (req, res) => {
  const note = db.findById('notes', req.params.id);
  if (!note) {
    return res.status(404).json({ error: 'Note not found.' });
  }

  db.delete('notes', req.params.id);
  res.json({ success: true, message: 'Note deleted.' });
});

export default router;
