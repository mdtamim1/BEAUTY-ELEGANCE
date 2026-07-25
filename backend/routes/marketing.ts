import { Router } from 'express';
import {
  getCoupons,
  createCoupon,
  deleteCoupon,
  validateCoupon,
  getCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getCustomerCoupons
} from '../controllers/marketingController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Public customer routes
router.get('/coupons/validate/:code', validateCoupon);
router.get('/campaigns', getCampaigns);
router.get('/my-coupons', getCustomerCoupons);

// Protected admin/moderator routes
router.get('/coupons', authenticateToken, requireRole(['Super Admin', 'Admin']), getCoupons);
router.post('/coupons', authenticateToken, requireRole(['Super Admin', 'Admin']), createCoupon);
router.delete('/coupons/:code', authenticateToken, requireRole(['Super Admin', 'Admin']), deleteCoupon);

router.post('/campaigns', authenticateToken, requireRole(['Super Admin', 'Admin']), createCampaign);
router.put('/campaigns/:id', authenticateToken, requireRole(['Super Admin', 'Admin']), updateCampaign);
router.delete('/campaigns/:id', authenticateToken, requireRole(['Super Admin', 'Admin']), deleteCampaign);

export default router;
