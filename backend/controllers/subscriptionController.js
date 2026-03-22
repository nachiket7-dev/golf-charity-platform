import jwt from 'jsonwebtoken';
import Razorpay from 'razorpay';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';

const isMockPayments = () =>
  process.env.MOCK_PAYMENTS === 'true' || process.env.PAYMENT_MODE === 'mock';

const getRazorpayClient = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return null;
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

const PLAN_PRICES = {
  monthly: {
    planId: process.env.RAZORPAY_MONTHLY_PLAN_ID,
    amount: parseInt(process.env.MONTHLY_PLAN_AMOUNT || 1999, 10),
  },
  yearly: {
    planId: process.env.RAZORPAY_YEARLY_PLAN_ID,
    amount: parseInt(process.env.YEARLY_PLAN_AMOUNT || 19999, 10),
  },
};

// POST /api/subscriptions/create-checkout — Razorpay subscription link OR mock checkout URL
export const createCheckout = async (req, res, next) => {
  try {
    const { plan } = req.body;
    if (!['monthly', 'yearly'].includes(plan))
      return res.status(400).json({ error: 'Invalid plan. Choose monthly or yearly.' });

    const user = await User.findById(req.user._id);
    const priceData = PLAN_PRICES[plan];

    // —— Mock payment (no Razorpay) — development / demos only ——
    if (isMockPayments()) {
      if (!process.env.JWT_SECRET) {
        return res.status(500).json({ error: 'JWT_SECRET is required for mock payments.' });
      }
      const mockSubId = `mock_sub_${user._id}_${Date.now()}`;
      const checkoutToken = jwt.sign(
        {
          purpose: 'mock_checkout',
          userId: user._id.toString(),
          plan,
          subscriptionId: mockSubId,
        },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );
      const clientBase = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/+$/, '');
      const url = `${clientBase}/mock-payment?token=${encodeURIComponent(checkoutToken)}`;
      return res.json({
        url,
        mock: true,
        subscriptionId: mockSubId,
      });
    }

    const razorpay = getRazorpayClient();
    if (!razorpay) {
      return res.status(500).json({
        error:
          'Razorpay is not configured. Set RAZORPAY_* in .env or enable MOCK_PAYMENTS=true for local testing.',
      });
    }

    if (!priceData.planId) {
      return res.status(500).json({ error: `Missing Razorpay plan ID for ${plan} plan` });
    }

    const subscription = await razorpay.subscriptions.create({
      plan_id: priceData.planId,
      customer_notify: 1,
      total_count: plan === 'monthly' ? 120 : 20,
      notes: {
        userId: user._id.toString(),
        plan,
      },
    });

    user.stripeSubscriptionId = subscription.id;
    user.subscriptionStatus = 'inactive';
    user.subscriptionPlan = plan;
    await user.save({ validateBeforeSave: false });

    await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: subscription.id },
      {
        user: user._id,
        plan,
        stripeSubscriptionId: subscription.id,
        amount: priceData.amount,
        charityPercentage: user?.charityPercentage || 10,
        selectedCharity: user?.selectedCharity,
        status: 'incomplete',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    if (!subscription.short_url) {
      return res.status(500).json({ error: 'Razorpay did not return a checkout URL' });
    }

    res.json({ url: subscription.short_url, subscriptionId: subscription.id });
  } catch (err) {
    next(err);
  }
};

// POST /api/subscriptions/mock-complete — finish mock checkout (JWT from create-checkout)
export const mockCompletePayment = async (req, res, next) => {
  try {
    if (!isMockPayments()) {
      return res.status(403).json({ error: 'Mock payments are disabled.' });
    }
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Checkout token required' });
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'JWT_SECRET is not configured' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ error: 'Invalid or expired checkout link' });
    }

    if (decoded.purpose !== 'mock_checkout' || decoded.userId !== req.user._id.toString()) {
      return res.status(403).json({ error: 'This checkout does not belong to your account' });
    }

    const { plan, subscriptionId } = decoded;
    if (!['monthly', 'yearly'].includes(plan) || !subscriptionId) {
      return res.status(400).json({ error: 'Invalid checkout data' });
    }

    const dbUser = await User.findById(req.user._id);
    if (!dbUser) return res.status(404).json({ error: 'User not found' });

    const priceData = PLAN_PRICES[plan];
    const renewal = new Date();
    if (plan === 'monthly') renewal.setMonth(renewal.getMonth() + 1);
    else renewal.setFullYear(renewal.getFullYear() + 1);

    await User.findByIdAndUpdate(req.user._id, {
      subscriptionStatus: 'active',
      subscriptionPlan: plan,
      stripeSubscriptionId: subscriptionId,
      subscriptionStartDate: new Date(),
      subscriptionRenewalDate: renewal,
    });

    await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: subscriptionId },
      {
        user: req.user._id,
        plan,
        stripeSubscriptionId: subscriptionId,
        amount: priceData.amount,
        charityPercentage: dbUser.charityPercentage || 10,
        selectedCharity: dbUser.selectedCharity,
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: renewal,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ message: 'Mock payment successful. Subscription activated.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/subscriptions/cancel
export const cancelSubscription = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.stripeSubscriptionId)
      return res.status(400).json({ error: 'No active subscription found' });

    const subId = user.stripeSubscriptionId;

    if (isMockPayments() || String(subId).startsWith('mock_sub_')) {
      user.subscriptionStatus = 'cancelled';
      user.stripeSubscriptionId = undefined;
      await user.save({ validateBeforeSave: false });
      await Subscription.findOneAndUpdate(
        { stripeSubscriptionId: subId },
        { status: 'cancelled', cancelledAt: new Date() }
      );
      return res.json({ message: 'Subscription cancelled (mock).' });
    }

    const razorpay = getRazorpayClient();
    if (!razorpay) {
      return res.status(500).json({ error: 'Razorpay is not configured on server.' });
    }

    await razorpay.subscriptions.cancel(subId, {
      cancel_at_cycle_end: 1,
    });

    user.subscriptionStatus = 'cancelled';
    await user.save({ validateBeforeSave: false });

    await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: subId },
      { status: 'cancelled', cancelledAt: new Date(), cancelAtPeriodEnd: true }
    );

    res.json({ message: 'Subscription cancelled.' });
  } catch (err) {
    next(err);
  }
};

// GET /api/subscriptions/status
export const getSubscriptionStatus = async (req, res, next) => {
  try {
    const razorpay = getRazorpayClient();
    const user = await User.findById(req.user._id).select(
      'subscriptionStatus subscriptionPlan subscriptionRenewalDate stripeSubscriptionId'
    );

    let razorpayData = null;
    if (user.stripeSubscriptionId && String(user.stripeSubscriptionId).startsWith('mock_sub_')) {
      return res.json({
        status: user.subscriptionStatus,
        plan: user.subscriptionPlan,
        renewalDate: user.subscriptionRenewalDate,
        cancelAtPeriodEnd: false,
        mock: true,
      });
    }
    if (user.stripeSubscriptionId && razorpay) {
      try {
        razorpayData = await razorpay.subscriptions.fetch(user.stripeSubscriptionId);
      } catch (_) {}
    }

    res.json({
      status: user.subscriptionStatus,
      plan: user.subscriptionPlan,
      renewalDate: user.subscriptionRenewalDate,
      cancelAtPeriodEnd: Boolean(razorpayData?.remaining_count === 0),
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/subscriptions/portal — not supported by Razorpay
export const createPortalSession = async (req, res, next) => {
  try {
    return res.status(400).json({
      error: 'Self-serve billing portal is not available with current payment provider.',
    });
  } catch (err) {
    next(err);
  }
};
