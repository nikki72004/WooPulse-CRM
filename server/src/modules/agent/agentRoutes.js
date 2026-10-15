import { Router } from 'express';
import { agentService } from './agentService.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/recommendations', (req, res) => {
  const customerId = req.query.customerId || null;
  const recommendations = agentService.getRecommendations(customerId);
  res.json({ recommendations });
});

router.post('/actions/execute', async (req, res) => {
  const { actionType, payload } = req.body;
  if (!actionType || !payload) {
    return res.status(400).json({ error: 'Action type and payload are required.' });
  }

  const result = await agentService.executeAction(actionType, payload);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json(result);
});

export default router;
