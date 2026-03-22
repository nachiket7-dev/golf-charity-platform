import crypto from 'crypto';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';

export const handleWebhook = async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || '')
    .update(rawBody)
    .digest('hex');

  if (!signature || signature !== expected) {
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

  const event = JSON.parse(rawBody.toString('utf8'));

  try {
    switch (event.type) {
      case 'subscription.activated':
      case 'subscription.charged':
      case 'subscription.authenticated': {
        const entity = event.payload?.subscription?.entity;
        const userId = entity?.notes?.userId;
        const plan = entity?.notes?.plan || 'monthly';
        if (!userId || !entity?.id) break;

        await User.findByIdAndUpdate(userId, {
          subscriptionStatus: 'active',
          subscriptionPlan: plan,
          stripeSubscriptionId: entity.id,
          subscriptionStartDate: new Date(),
          subscriptionRenewalDate: entity.current_end
            ? new Date(entity.current_end * 1000)
            : undefined,
        });

        const planAmount = plan === 'monthly'
          ? parseInt(process.env.MONTHLY_PLAN_AMOUNT || 1999, 10)
          : parseInt(process.env.YEARLY_PLAN_AMOUNT || 19999, 10);

        const user = await User.findById(userId);
        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: entity.id },
          {
            user: userId,
            plan,
            stripeSubscriptionId: entity.id,
            status: 'active',
            amount: planAmount,
            charityPercentage: user?.charityPercentage || 10,
            selectedCharity: user?.selectedCharity,
            currentPeriodStart: entity.current_start
              ? new Date(entity.current_start * 1000)
              : undefined,
            currentPeriodEnd: entity.current_end
              ? new Date(entity.current_end * 1000)
              : undefined,
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        break;
      }

      case 'subscription.pending':
      case 'payment.failed': {
        const entity = event.payload?.subscription?.entity;
        if (!entity?.id) break;
        await User.findOneAndUpdate(
          { stripeSubscriptionId: entity.id },
          { subscriptionStatus: 'lapsed' }
        );
        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: entity.id },
          { status: 'past_due' }
        );
        break;
      }

      case 'subscription.cancelled': {
        const entity = event.payload?.subscription?.entity;
        if (!entity?.id) break;
        await User.findOneAndUpdate(
          { stripeSubscriptionId: entity.id },
          { subscriptionStatus: 'cancelled', stripeSubscriptionId: null }
        );
        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: entity.id },
          { status: 'cancelled', cancelledAt: new Date() }
        );
        break;
      }

      case 'subscription.completed': {
        const entity = event.payload?.subscription?.entity;
        if (!entity?.id) break;
        await User.findOneAndUpdate(
          { stripeSubscriptionId: entity.id },
          { subscriptionStatus: 'cancelled' }
        );
        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: entity.id },
          { status: 'cancelled', cancelledAt: new Date() }
        );
        break;
      }

      default:
        break;
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};
