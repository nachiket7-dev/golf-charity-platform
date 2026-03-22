import express from 'express';
import {
  getDraws, getLatestDraw, getDraw,
  simulateDraw, publishDraw, uploadWinnerProof,
} from '../controllers/drawController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();
router.get('/', getDraws);
router.get('/latest', getLatestDraw);
router.get('/:id', getDraw);

// Admin
router.post('/simulate', protect, adminOnly, simulateDraw);
router.post('/:id/publish', protect, adminOnly, publishDraw);

// Winner proof
router.post('/winners/:winnerId/upload-proof', protect, uploadWinnerProof);

export default router;
