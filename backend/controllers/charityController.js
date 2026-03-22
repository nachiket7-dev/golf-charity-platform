import Charity from '../models/Charity.js';
import User from '../models/User.js';

// GET /api/charities
export const getCharities = async (req, res, next) => {
  try {
    const { category, search, featured } = req.query;
    const query = { isActive: true };

    if (category) query.category = category;
    if (featured === 'true') query.isFeatured = true;
    if (search) query.$text = { $search: search };

    const charities = await Charity.find(query).sort({ isFeatured: -1, name: 1 });
    res.json({ charities });
  } catch (err) {
    next(err);
  }
};

// GET /api/charities/:slug
export const getCharity = async (req, res, next) => {
  try {
    const charity = await Charity.findOne({ slug: req.params.slug, isActive: true });
    if (!charity) return res.status(404).json({ error: 'Charity not found' });
    res.json({ charity });
  } catch (err) {
    next(err);
  }
};

// PUT /api/charities/select — user selects a charity
export const selectCharity = async (req, res, next) => {
  try {
    const { charityId, percentage } = req.body;

    if (!charityId) return res.status(400).json({ error: 'Charity ID required' });

    const charity = await Charity.findById(charityId);
    if (!charity || !charity.isActive) return res.status(404).json({ error: 'Charity not found' });

    const pct = Number(percentage) || 10;
    if (pct < 10 || pct > 100) return res.status(400).json({ error: 'Charity percentage must be between 10 and 100' });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { selectedCharity: charityId, charityPercentage: pct },
      { new: true }
    ).populate('selectedCharity', 'name logo slug');

    res.json({ user, message: 'Charity updated successfully' });
  } catch (err) {
    next(err);
  }
};

// POST /api/charities — admin: create charity
export const createCharity = async (req, res, next) => {
  try {
    const charity = await Charity.create(req.body);
    res.status(201).json({ charity });
  } catch (err) {
    next(err);
  }
};

// PUT /api/charities/:id — admin: update charity
export const updateCharity = async (req, res, next) => {
  try {
    const charity = await Charity.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!charity) return res.status(404).json({ error: 'Charity not found' });
    res.json({ charity });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/charities/:id — admin: soft delete
export const deleteCharity = async (req, res, next) => {
  try {
    const charity = await Charity.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!charity) return res.status(404).json({ error: 'Charity not found' });
    res.json({ message: 'Charity removed' });
  } catch (err) {
    next(err);
  }
};
