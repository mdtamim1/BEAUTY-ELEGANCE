import { Router } from 'express';
import { chatWithAI, getAIAnalytics } from '../controllers/aiController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// POST /api/v1/ai/chat — Customer AI chatbot endpoint
// No auth required (public-facing for customers)
router.post('/chat', chatWithAI);

// GET /api/v1/ai/analytics — Get AI chatbot usage metrics
router.get('/analytics', authenticateToken, getAIAnalytics);

export default router;
