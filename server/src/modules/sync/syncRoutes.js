import { Router } from 'express';
import { syncService } from './syncService.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/status', (req, res) => {
  res.json(syncService.getStatus());
});

router.get('/history', (req, res) => {
  res.json({ history: syncService.getHistory() });
});

router.post('/run', async (req, res) => {
  const type = req.body.type || 'incremental';
  const result = await syncService.triggerSync(type);
  if (!result.success && result.message) {
    return res.status(409).json(result);
  }
  res.json(result);
});

export default router;
