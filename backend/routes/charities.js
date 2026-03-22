import express from 'express';
import {
  getCharities, getCharity, selectCharity,
  createCharity, updateCharity, deleteCharity,
} from '../controllers/charityController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();
router.get('/', getCharities);
router.get('/:slug', getCharity);
router.put('/select', protect, selectCharity);

// Admin
router.post('/', protect, adminOnly, createCharity);
router.put('/:id', protect, adminOnly, updateCharity);
router.delete('/:id', protect, adminOnly, deleteCharity);

export default router;
