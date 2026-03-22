import mongoose from 'mongoose';

const winnerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  matchType: { type: String, enum: ['5-match', '4-match', '3-match'], required: true },
  prizeAmount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['pending', 'verified', 'paid', 'rejected'], default: 'pending' },
  proofUrl: { type: String },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: { type: Date },
  paidAt: { type: Date },
  adminNotes: { type: String },
});

const drawSchema = new mongoose.Schema({
  month: { type: Number, required: true }, // 1-12
  year: { type: Number, required: true },
  drawType: { type: String, enum: ['random', 'algorithmic'], default: 'random' },
  status: {
    type: String,
    enum: ['scheduled', 'simulated', 'published', 'cancelled'],
    default: 'scheduled',
  },

  // The winning numbers drawn (5 numbers from 1-45)
  winningNumbers: {
    type: [Number],
    validate: {
      validator: (arr) => arr.length === 5 && arr.every((n) => n >= 1 && n <= 45),
      message: 'Draw must have exactly 5 numbers between 1-45',
    },
  },

  // Prize pool breakdown (calculated at draw time)
  totalPrizePool: { type: Number, default: 0 },
  jackpotPool: { type: Number, default: 0 },   // 40% (+ rollover)
  fourMatchPool: { type: Number, default: 0 },  // 35%
  threeMatchPool: { type: Number, default: 0 }, // 25%

  // Jackpot rollover from previous month (if no 5-match winner)
  jackpotRollover: { type: Number, default: 0 },

  // Eligible participant count
  participantCount: { type: Number, default: 0 },
  totalSubscribers: { type: Number, default: 0 },

  // Winners per tier
  winners: [winnerSchema],

  // Admin who ran the draw
  executedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  simulatedAt: { type: Date },
  publishedAt: { type: Date },

  // Charity contributions for this draw period
  totalCharityContributions: { type: Number, default: 0 },

  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Unique constraint: one draw per month/year
drawSchema.index({ month: 1, year: 1 }, { unique: true });

export default mongoose.model('Draw', drawSchema);
