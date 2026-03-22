import User from '../models/User.js';

// GET /api/scores — get current user's scores
export const getScores = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('scores');
    // Return sorted newest first
    const sorted = [...user.scores].sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json({ scores: sorted });
  } catch (err) {
    next(err);
  }
};

// POST /api/scores — add a new score
export const addScore = async (req, res, next) => {
  try {
    const { value, date } = req.body;

    if (!value || !date) return res.status(400).json({ error: 'Score value and date are required' });

    const numValue = Number(value);
    if (isNaN(numValue) || numValue < 1 || numValue > 45)
      return res.status(400).json({ error: 'Score must be between 1 and 45 (Stableford format)' });

    const scoreDate = new Date(date);
    if (isNaN(scoreDate.getTime())) return res.status(400).json({ error: 'Invalid date' });
    if (scoreDate > new Date()) return res.status(400).json({ error: 'Score date cannot be in the future' });

    const user = await User.findById(req.user._id);
    user.addScore(numValue, scoreDate);
    await user.save();

    const sorted = [...user.scores].sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json({ scores: sorted, message: 'Score added successfully' });
  } catch (err) {
    next(err);
  }
};

// PUT /api/scores/:scoreId — update an existing score
export const updateScore = async (req, res, next) => {
  try {
    const { value, date } = req.body;
    const user = await User.findById(req.user._id);

    const score = user.scores.id(req.params.scoreId);
    if (!score) return res.status(404).json({ error: 'Score not found' });

    if (value !== undefined) {
      const numValue = Number(value);
      if (isNaN(numValue) || numValue < 1 || numValue > 45)
        return res.status(400).json({ error: 'Score must be between 1 and 45' });
      score.value = numValue;
    }

    if (date) {
      const scoreDate = new Date(date);
      if (isNaN(scoreDate.getTime())) return res.status(400).json({ error: 'Invalid date' });
      score.date = scoreDate;
    }

    await user.save();
    const sorted = [...user.scores].sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json({ scores: sorted, message: 'Score updated' });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/scores/:scoreId — delete a score
export const deleteScore = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const score = user.scores.id(req.params.scoreId);
    if (!score) return res.status(404).json({ error: 'Score not found' });

    user.scores.pull(req.params.scoreId);
    await user.save();
    res.json({ message: 'Score deleted' });
  } catch (err) {
    next(err);
  }
};
