import { Router } from 'express';
import {
  sendOrderToSteadfast,
  bulkSendToSteadfast,
  getSteadfastStatus,
  getSteadfastBalance,
  checkUniversalFraud
} from '../controllers/courierController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.post('/send-order', requireRole(['Super Admin', 'Admin', 'Manager', 'Order Handler']), sendOrderToSteadfast);
router.post('/bulk-send', requireRole(['Super Admin', 'Admin', 'Manager', 'Order Handler']), bulkSendToSteadfast);
router.get('/status/:id', getSteadfastStatus);
router.get('/balance', getSteadfastBalance);
router.get('/universal-fraud-check/:phone', checkUniversalFraud);

export default router;
