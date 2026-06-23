import { Router } from 'express';
import { chatWithAI } from '../controllers/aiController';

const router = Router();

// POST /api/v1/ai/chat — Customer AI chatbot endpoint
// No auth required (public-facing for customers)
router.post('/chat', chatWithAI);

export default router;
