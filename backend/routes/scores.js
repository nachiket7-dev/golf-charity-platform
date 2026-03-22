import express from 'express';
import { getScores, addScore, updateScore, deleteScore } from '../controllers/scoreController.js';
import { protect, subscriberOnly } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);
router.get('/', getScores);
router.post('/', subscriberOnly, addScore);
router.put('/:scoreId', subscriberOnly, updateScore);
router.delete('/:scoreId', subscriberOnly, deleteScore);

export default router;
