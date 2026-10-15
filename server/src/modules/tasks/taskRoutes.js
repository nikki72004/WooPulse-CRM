import { Router } from 'express';
import { db } from '../../lib/db.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/', (req, res) => {
  let tasks = db.get('tasks');

  if (req.query.customerId) {
    tasks = tasks.filter(t => t.customerId === req.query.customerId);
  }

  if (req.query.status) {
    tasks = tasks.filter(t => t.status === req.query.status);
  }

  // Enrich with customer details
  const enriched = tasks.map(t => {
    const customer = db.findById('customers', t.customerId);
    const isOverdue = t.status === 'PENDING' && new Date(t.dueDate) < new Date();
    return {
      ...t,
      customer: customer ? { id: customer.id, name: `${customer.firstName} ${customer.lastName}`, email: customer.email } : null,
      isOverdue,
    };
  });

  enriched.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  res.json({ tasks: enriched });
});

router.post('/', (req, res) => {
  const { customerId, title, description, dueDate, createdBy = 'user' } = req.body;
  if (!customerId || !title) {
    return res.status(400).json({ error: 'Customer ID and task title are required.' });
  }

  const customer = db.findById('customers', customerId);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found.' });
  }

  const now = new Date().toISOString();
  const task = db.insert('tasks', {
    customerId,
    title: title.trim(),
    description: description ? description.trim() : '',
    dueDate: dueDate || new Date(Date.now() + 3 * 86400000).toISOString(),
    status: 'PENDING',
    createdBy,
    createdAt: now,
  });

  db.logActivity('TASK', `Created task: "${title}" for ${customer.firstName} ${customer.lastName}.`, customerId);

  res.status(201).json({ task });
});

router.patch('/:id', (req, res) => {
  const task = db.findById('tasks', req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found.' });
  }

  const updates = {};
  if (req.body.status !== undefined) updates.status = req.body.status;
  if (req.body.title !== undefined) updates.title = req.body.title;
  if (req.body.dueDate !== undefined) updates.dueDate = req.body.dueDate;

  const updated = db.update('tasks', req.params.id, updates);
  res.json({ task: updated });
});

router.delete('/:id', (req, res) => {
  const task = db.findById('tasks', req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found.' });
  }

  db.delete('tasks', req.params.id);
  res.json({ success: true, message: 'Task deleted.' });
});

export default router;
