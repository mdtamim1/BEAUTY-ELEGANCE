import { Router } from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/productsController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', authenticateToken, requireRole(['Super Admin', 'Admin', 'Staff']), createProduct);
router.put('/:id', authenticateToken, requireRole(['Super Admin', 'Admin', 'Staff']), updateProduct);
router.delete('/:id', authenticateToken, requireRole(['Super Admin', 'Admin']), deleteProduct);

export default router;
