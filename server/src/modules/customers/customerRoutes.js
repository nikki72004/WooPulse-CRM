import { Router } from 'express';
import { customerController } from './customerController.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', customerController.getCustomers);
router.get('/duplicates', customerController.getDuplicates);
router.post('/duplicates/:id/resolve', customerController.resolveDuplicate);
router.get('/:id', customerController.getCustomerById);
router.patch('/:id', customerController.updateCustomer);

export default router;
