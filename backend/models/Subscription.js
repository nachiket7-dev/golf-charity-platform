import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: String, enum: ['monthly', 'yearly'], required: true },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'past_due', 'trialing', 'incomplete'],
    default: 'active',
  },
  stripeSubscriptionId: { type: String, required: true },
  stripeCustomerId: { type: String },
  amount: { type: Number, required: true }, // in pence/cents
  currency: { type: String, default: 'eur' },

  // Prize pool contribution: 80% of subscription after charity
  prizePoolContribution: { type: Number },
  charityContribution: { type: Number },
  charityPercentage: { type: Number, default: 10 },
  selectedCharity: { type: mongoose.Schema.Types.ObjectId, ref: 'Charity' },

  currentPeriodStart: { type: Date },
  currentPeriodEnd: { type: Date },
  cancelledAt: { type: Date },
  cancelAtPeriodEnd: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now },
});

// Calculate contributions when a subscription is created/updated
subscriptionSchema.pre('save', function (next) {
  if (this.amount) {
    const charityPct = (this.charityPercentage || 10) / 100;
    this.charityContribution = Math.round(this.amount * charityPct);
    this.prizePoolContribution = this.amount - this.charityContribution;
  }
  next();
});

export default mongoose.model('Subscription', subscriptionSchema);
