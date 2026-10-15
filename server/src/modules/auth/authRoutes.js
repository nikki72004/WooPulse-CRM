import { Router } from 'express';
import { authController } from './authController.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.post('/login', authController.login);
router.post('/demo-login', authController.demoLogin);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.me);

export default router;
