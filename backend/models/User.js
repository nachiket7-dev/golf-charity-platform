import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const scoreSchema = new mongoose.Schema({
  value: { type: Number, required: true, min: 1, max: 45 },
  date: { type: Date, required: true },
  enteredAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 8 },
  role: { type: String, enum: ['subscriber', 'admin'], default: 'subscriber' },

  // Subscription info
  subscriptionStatus: {
    type: String,
    enum: ['active', 'inactive', 'cancelled', 'lapsed', 'trialing'],
    default: 'inactive',
  },
  subscriptionPlan: { type: String, enum: ['monthly', 'yearly', null], default: null },
  stripeCustomerId: { type: String },
  stripeSubscriptionId: { type: String },
  subscriptionRenewalDate: { type: Date },
  subscriptionStartDate: { type: Date },

  // Golf scores (max 5, rolling)
  scores: {
    type: [scoreSchema],
    validate: {
      validator: (arr) => arr.length <= 5,
      message: 'Maximum 5 scores allowed.',
    },
  },

  // Charity
  selectedCharity: { type: mongoose.Schema.Types.ObjectId, ref: 'Charity' },
  charityPercentage: {
    type: Number,
    default: 10,
    min: 10,
    max: 100,
  },

  // Profile
  avatar: { type: String },
  phone: { type: String },
  country: { type: String, default: 'IE' },

  // Winner tracking
  totalWon: { type: Number, default: 0 },

  // Email verification
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.updatedAt = Date.now();
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Add score with rolling logic (max 5, replaces oldest)
userSchema.methods.addScore = function (value, date) {
  const newScore = { value, date, enteredAt: new Date() };
  if (this.scores.length >= 5) {
    // Sort by date, remove oldest
    this.scores.sort((a, b) => new Date(a.date) - new Date(b.date));
    this.scores.shift();
  }
  this.scores.push(newScore);
  // Sort newest first for display
  this.scores.sort((a, b) => new Date(b.date) - new Date(a.date));
};

// Check if user can participate in draw (active subscription + 5 scores)
userSchema.virtual('canParticipateDraw').get(function () {
  return this.subscriptionStatus === 'active' && this.scores.length === 5;
});

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.emailVerificationToken;
  delete obj.passwordResetToken;
  delete obj.stripeCustomerId;
  return obj;
};

export default mongoose.model('User', userSchema);
