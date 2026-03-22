import express from 'express';
import {
  getStats, getUsers, updateUser, updateUserScores,
  getWinners, verifyWinner, getAllDraws
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();
router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/draws', getAllDraws);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.put('/users/:id/scores', updateUserScores);
router.get('/winners', getWinners);
router.put('/winners/:drawId/:winnerId/verify', verifyWinner);

export default router;
