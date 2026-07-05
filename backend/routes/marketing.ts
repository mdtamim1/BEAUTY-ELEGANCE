import { Router } from 'express';
import {
  getCoupons,
  createCoupon,
  deleteCoupon,
  validateCoupon,
  getSubscribers,
  subscribeEmail,
  deleteSubscriber,
  getCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getSpinWheelConfig,
  spinWheelPlay,
  updateSpinWheelConfig
} from '../controllers/marketingController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Public customer routes
router.post('/subscribers/subscribe', subscribeEmail);
router.get('/coupons/validate/:code', validateCoupon);
router.get('/campaigns', getCampaigns); // Public: so storefront visitors can sync active campaigns!
router.get('/spin-wheel', getSpinWheelConfig); // Public: fetch spin wheel config
router.post('/spin-wheel/spin', spinWheelPlay); // Public: server weighted outcome picker

// Protected admin/moderator routes
router.post('/spin-wheel/settings', authenticateToken, requireRole(['Super Admin', 'Admin']), updateSpinWheelConfig);

router.get('/coupons', authenticateToken, requireRole(['Super Admin', 'Admin']), getCoupons);
router.post('/coupons', authenticateToken, requireRole(['Super Admin', 'Admin']), createCoupon);
router.delete('/coupons/:code', authenticateToken, requireRole(['Super Admin', 'Admin']), deleteCoupon);

router.get('/subscribers', authenticateToken, requireRole(['Super Admin', 'Admin']), getSubscribers);
router.delete('/subscribers/:id', authenticateToken, requireRole(['Super Admin', 'Admin']), deleteSubscriber);

router.post('/campaigns', authenticateToken, requireRole(['Super Admin', 'Admin']), createCampaign);
router.put('/campaigns/:id', authenticateToken, requireRole(['Super Admin', 'Admin']), updateCampaign);
router.delete('/campaigns/:id', authenticateToken, requireRole(['Super Admin', 'Admin']), deleteCampaign);

export default router;
