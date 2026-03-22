import express from 'express';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';
import Draw from '../models/Draw.js';

const router = express.Router();
router.use(protect);

// GET /api/users/profile
router.get('/profile', async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('selectedCharity', 'name logo slug')
      .select('-password');
    res.json({ user });
  } catch (err) { next(err); }
});

// PUT /api/users/profile
router.put('/profile', async (req, res, next) => {
  try {
    const allowed = ['name', 'phone', 'country', 'avatar'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true })
      .populate('selectedCharity', 'name logo slug')
      .select('-password');
    res.json({ user });
  } catch (err) { next(err); }
});

// PUT /api/users/change-password
router.put('/change-password', async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(401).json({ error: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) { next(err); }
});

// GET /api/users/my-draws — user's draw participation history
router.get('/my-draws', async (req, res, next) => {
  try {
    const draws = await Draw.find({
      status: 'published',
      'winners.user': req.user._id,
    }).sort({ year: -1, month: -1 }).limit(12);

    const myWins = draws.map(d => ({
      month: d.month,
      year: d.year,
      drawId: d._id,
      winningNumbers: d.winningNumbers,
      winner: d.winners.find(w => w.user.toString() === req.user._id.toString()),
    }));

    res.json({ wins: myWins });
  } catch (err) { next(err); }
});

export default router;
