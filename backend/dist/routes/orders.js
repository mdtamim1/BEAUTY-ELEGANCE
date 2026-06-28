import { Router } from 'express';
import { getOrders, getOrderById, createOrder, updateOrderStatus, updateOrder } from '../controllers/ordersController';
import { authenticateToken, requireRole } from '../middleware/auth';
const router = Router();
// Customer can place orders directly
router.post('/', createOrder);
// Admin / staff can view and manage orders
router.get('/', authenticateToken, requireRole(['Super Admin', 'Admin', 'Staff']), getOrders);
router.get('/:id', authenticateToken, requireRole(['Super Admin', 'Admin', 'Staff']), getOrderById);
router.put('/:id', authenticateToken, requireRole(['Super Admin', 'Admin', 'Staff']), updateOrder);
router.put('/:id/status', authenticateToken, requireRole(['Super Admin', 'Admin', 'Staff']), updateOrderStatus);
export default router;
