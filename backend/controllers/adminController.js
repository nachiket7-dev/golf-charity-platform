import User from '../models/User.js';
import Draw from '../models/Draw.js';
import Subscription from '../models/Subscription.js';
import Charity from '../models/Charity.js';

// GET /api/admin/stats — dashboard overview
export const getStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      activeSubscribers,
      totalCharities,
      latestDraw,
      subscriptions,
    ] = await Promise.all([
      User.countDocuments({ role: 'subscriber' }),
      User.countDocuments({ subscriptionStatus: 'active' }),
      Charity.countDocuments({ isActive: true }),
      Draw.findOne({ status: 'published' }).sort({ year: -1, month: -1 }),
      Subscription.find({ status: 'active' }),
    ]);

    const monthlyRevenue = subscriptions.reduce((sum, s) => sum + (s.amount || 0), 0);
    const totalPrizePool = subscriptions.reduce((sum, s) => sum + (s.prizePoolContribution || 0), 0);
    const totalCharity = subscriptions.reduce((sum, s) => sum + (s.charityContribution || 0), 0);

    res.json({
      stats: {
        totalUsers,
        activeSubscribers,
        totalCharities,
        monthlyRevenue,
        totalPrizePool,
        totalCharity,
        latestDraw: latestDraw ? `${latestDraw.month}/${latestDraw.year}` : null,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/users
export const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const query = {};
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
    if (status) query.subscriptionStatus = status;

    const users = await User.find(query)
      .populate('selectedCharity', 'name')
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);
    res.json({ users, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/users/:id — edit user
export const updateUser = async (req, res, next) => {
  try {
    const allowed = ['name', 'email', 'subscriptionStatus', 'role', 'charityPercentage', 'selectedCharity'];
    const updates = {};
    allowed.forEach((key) => { if (req.body[key] !== undefined) updates[key] = req.body[key]; });

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/users/:id/scores — admin edit user scores
export const updateUserScores = async (req, res, next) => {
  try {
    const { scores } = req.body;
    if (!Array.isArray(scores)) return res.status(400).json({ error: 'Scores must be an array' });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.scores = scores.slice(0, 5).map((s) => ({
      value: Number(s.value),
      date: new Date(s.date),
      enteredAt: new Date(),
    }));
    await user.save();
    res.json({ scores: user.scores });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/winners — all winners pending verification
export const getWinners = async (req, res, next) => {
  try {
    const { status } = req.query;
    const matchFilter = status ? { 'winners.paymentStatus': status } : {};

    const draws = await Draw.find({ status: 'published', ...matchFilter })
      .populate('winners.user', 'name email avatar')
      .sort({ year: -1, month: -1 });

    const allWinners = [];
    for (const draw of draws) {
      for (const winner of draw.winners) {
        if (!status || winner.paymentStatus === status) {
          allWinners.push({
            drawId: draw._id,
            month: draw.month,
            year: draw.year,
            winner,
          });
        }
      }
    }

    res.json({ winners: allWinners });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/winners/:drawId/:winnerId/verify
export const verifyWinner = async (req, res, next) => {
  try {
    const { status, notes } = req.body; // status: 'verified' | 'rejected' | 'paid'
    const draw = await Draw.findById(req.params.drawId);
    if (!draw) return res.status(404).json({ error: 'Draw not found' });

    const winner = draw.winners.id(req.params.winnerId);
    if (!winner) return res.status(404).json({ error: 'Winner not found' });

    winner.paymentStatus = status;
    winner.verifiedBy = req.user._id;
    winner.verifiedAt = new Date();
    if (notes) winner.adminNotes = notes;
    if (status === 'paid') {
      winner.paidAt = new Date();
      // Update user total won
      await User.findByIdAndUpdate(winner.user, {
        $inc: { totalWon: winner.prizeAmount },
      });
    }

    await draw.save();
    res.json({ message: `Winner status updated to: ${status}` });
  } catch (err) {
    next(err);
  }
};
