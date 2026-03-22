import Draw from '../models/Draw.js';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';

// Helper: Generate random draw numbers (5 unique from 1-45)
const generateRandomNumbers = () => {
  const nums = new Set();
  while (nums.size < 5) {
    nums.add(Math.floor(Math.random() * 45) + 1);
  }
  return Array.from(nums).sort((a, b) => a - b);
};

// Helper: Algorithmic draw — weighted by score frequency
const generateAlgorithmicNumbers = async () => {
  const users = await User.find({
    subscriptionStatus: 'active',
    'scores.4': { $exists: true }, // has 5 scores
  }).select('scores');

  // Count frequency of each score value across all active users
  const frequency = new Array(46).fill(0); // index 1-45
  for (const user of users) {
    for (const score of user.scores) {
      frequency[score.value]++;
    }
  }

  const totalScores = frequency.reduce((sum, f) => sum + f, 0);
  if (totalScores === 0) return generateRandomNumbers();

  // Weighted random selection (higher frequency = higher chance)
  const selected = new Set();
  const maxAttempts = 1000;
  let attempts = 0;

  while (selected.size < 5 && attempts < maxAttempts) {
    attempts++;
    const rand = Math.random() * totalScores;
    let cumulative = 0;
    for (let i = 1; i <= 45; i++) {
      cumulative += frequency[i];
      if (rand <= cumulative) {
        selected.add(i);
        break;
      }
    }
  }

  // Fallback if not enough
  while (selected.size < 5) selected.add(Math.floor(Math.random() * 45) + 1);

  return Array.from(selected).sort((a, b) => a - b);
};

// Helper: Match user scores against winning numbers
const getMatchCount = (userScores, winningNumbers) => {
  const scoreValues = userScores.map((s) => s.value);
  return scoreValues.filter((v) => winningNumbers.includes(v)).length;
};

// Helper: Calculate prize pool for current month
const calculatePrizePool = async (jackpotRollover = 0) => {
  const activeSubscriptions = await Subscription.find({ status: 'active' });
  const totalPool = activeSubscriptions.reduce((sum, sub) => sum + (sub.prizePoolContribution || 0), 0);

  const jackpot = Math.round(totalPool * 0.4) + jackpotRollover;
  const fourMatch = Math.round(totalPool * 0.35);
  const threeMatch = Math.round(totalPool * 0.25);

  return { totalPool, jackpot, fourMatch, threeMatch };
};

// GET /api/draws — list draws
export const getDraws = async (req, res, next) => {
  try {
    const draws = await Draw.find({ status: 'published' })
      .sort({ year: -1, month: -1 })
      .limit(12)
      .populate('winners.user', 'name avatar');
    res.json({ draws });
  } catch (err) {
    next(err);
  }
};

// GET /api/draws/latest — latest published draw
export const getLatestDraw = async (req, res, next) => {
  try {
    const draw = await Draw.findOne({ status: 'published' })
      .sort({ year: -1, month: -1 })
      .populate('winners.user', 'name avatar');
    res.json({ draw });
  } catch (err) {
    next(err);
  }
};

// GET /api/draws/:id
export const getDraw = async (req, res, next) => {
  try {
    const draw = await Draw.findById(req.params.id).populate('winners.user', 'name avatar');
    if (!draw) return res.status(404).json({ error: 'Draw not found' });
    res.json({ draw });
  } catch (err) {
    next(err);
  }
};

// POST /api/draws/simulate — admin: create/simulate a draw
export const simulateDraw = async (req, res, next) => {
  try {
    const { month, year, drawType = 'random' } = req.body;

    if (!month || !year) return res.status(400).json({ error: 'Month and year required' });

    // Check for existing draw
    let draw = await Draw.findOne({ month, year });

    // Get rollover from previous month if applicable
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const prevDraw = await Draw.findOne({ month: prevMonth, year: prevYear, status: 'published' });

    let jackpotRollover = 0;
    if (prevDraw && !prevDraw.winners.some((w) => w.matchType === '5-match')) {
      jackpotRollover = prevDraw.jackpotPool;
    }

    const { totalPool, jackpot, fourMatch, threeMatch } = await calculatePrizePool(jackpotRollover);

    // Generate numbers
    const winningNumbers =
      drawType === 'algorithmic'
        ? await generateAlgorithmicNumbers()
        : generateRandomNumbers();

    // Find eligible participants
    const eligibleUsers = await User.find({
      subscriptionStatus: 'active',
      'scores.4': { $exists: true }, // exactly 5 scores
    }).select('scores name email');

    const participantCount = eligibleUsers.length;

    // Calculate winners
    const fiveMatchWinners = [];
    const fourMatchWinners = [];
    const threeMatchWinners = [];

    for (const user of eligibleUsers) {
      const matches = getMatchCount(user.scores, winningNumbers);
      if (matches >= 5) fiveMatchWinners.push(user);
      else if (matches >= 4) fourMatchWinners.push(user);
      else if (matches >= 3) threeMatchWinners.push(user);
    }

    // Split prizes equally within tier
    const buildWinners = (users, matchType, totalPrize) => {
      if (users.length === 0) return [];
      const each = Math.round(totalPrize / users.length);
      return users.map((u) => ({
        user: u._id,
        matchType,
        prizeAmount: each,
        paymentStatus: 'pending',
      }));
    };

    const winners = [
      ...buildWinners(fiveMatchWinners, '5-match', jackpot),
      ...buildWinners(fourMatchWinners, '4-match', fourMatch),
      ...buildWinners(threeMatchWinners, '3-match', threeMatch),
    ];

    // If no 5-match, jackpot rolls over (keep pool in next draw)
    const newJackpotPool = fiveMatchWinners.length > 0 ? 0 : jackpot;

    if (draw) {
      draw.drawType = drawType;
      draw.winningNumbers = winningNumbers;
      draw.totalPrizePool = totalPool;
      draw.jackpotPool = jackpot;
      draw.fourMatchPool = fourMatch;
      draw.threeMatchPool = threeMatch;
      draw.jackpotRollover = jackpotRollover;
      draw.participantCount = participantCount;
      draw.winners = winners;
      draw.status = 'simulated';
      draw.simulatedAt = new Date();
      draw.executedBy = req.user._id;
    } else {
      draw = new Draw({
        month,
        year,
        drawType,
        winningNumbers,
        totalPrizePool: totalPool,
        jackpotPool: jackpot,
        fourMatchPool: fourMatch,
        threeMatchPool: threeMatch,
        jackpotRollover,
        participantCount,
        totalSubscribers: await User.countDocuments({ subscriptionStatus: 'active' }),
        winners,
        status: 'simulated',
        simulatedAt: new Date(),
        executedBy: req.user._id,
      });
    }

    await draw.save();
    res.json({ draw, message: 'Draw simulated successfully. Review before publishing.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/draws/:id/publish — admin: publish draw
export const publishDraw = async (req, res, next) => {
  try {
    const draw = await Draw.findById(req.params.id).populate('winners.user', 'name email');
    if (!draw) return res.status(404).json({ error: 'Draw not found' });
    if (draw.status === 'published') return res.status(400).json({ error: 'Draw already published' });

    draw.status = 'published';
    draw.publishedAt = new Date();
    await draw.save();

    res.json({ draw, message: 'Draw published manually without email notification.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/draws/winners/:winnerId/upload-proof
export const uploadWinnerProof = async (req, res, next) => {
  try {
    const { proofUrl } = req.body;
    const draw = await Draw.findOne({ 'winners._id': req.params.winnerId });
    if (!draw) return res.status(404).json({ error: 'Winner record not found' });

    const winner = draw.winners.id(req.params.winnerId);
    if (winner.user.toString() !== req.user._id.toString())
      return res.status(403).json({ error: 'Not authorised' });

    winner.proofUrl = proofUrl;
    winner.paymentStatus = 'pending';
    await draw.save();

    res.json({ message: 'Proof uploaded. Admin will review shortly.' });
  } catch (err) {
    next(err);
  }
};
