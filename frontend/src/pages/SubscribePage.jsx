import { useState } from 'react';
import { Check, Trophy, Zap, Shield } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import api from '../utils/api';
import toast from 'react-hot-toast';

const PLANS = [
  {
    id: 'monthly',
    label: 'Monthly',
    price: '€19.99',
    period: '/month',
    saving: null,
    features: [
      'Full score tracking (5 scores)',
      'Monthly prize draw entry',
      'Choose your charity',
      'Winners dashboard',
      'Cancel anytime',
    ],
  },
  {
    id: 'yearly',
    label: 'Yearly',
    price: '€199.99',
    period: '/year',
    saving: 'Save €40/year',
    popular: true,
    features: [
      'Everything in Monthly',
      '2 months free',
      'Priority support',
      'Exclusive yearly badge',
      'Early access to features',
    ],
  },
];

export default function SubscribePage() {
  const [selected, setSelected] = useState('yearly');
  const [loading, setLoading] = useState(false);
  const isMockPayments = import.meta.env.VITE_MOCK_PAYMENTS === 'true';

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/subscriptions/create-checkout', { plan: selected });
      window.location.href = data.url;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to start checkout');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        {/* Header */}
        <div className="text-center mb-12">
          {isMockPayments && (
            <div className="mb-4 rounded-xl border border-amber-500/40 bg-amber-950/30 px-4 py-3 text-left text-sm text-amber-100/90 max-w-xl mx-auto">
              <strong className="text-amber-200">Demo mode:</strong> set <code className="text-amber-300">MOCK_PAYMENTS=true</code> in backend <code className="text-amber-300">.env</code>. Checkout will open a mock payment page (no Razorpay).
            </div>
          )}
          <div className="badge-green mx-auto mb-4 w-fit"><Trophy className="w-3 h-3" /> Choose Your Plan</div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            Join the Draw
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            Subscribe to enter monthly prize draws, track your golf scores, and support charities you love.
          </p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {PLANS.map(plan => (
            <button
              key={plan.id}
              onClick={() => setSelected(plan.id)}
              className={`text-left p-6 rounded-2xl border-2 transition-all duration-200 relative ${
                selected === plan.id
                  ? 'border-brand-500 bg-brand-950/40'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 badge-gold text-xs px-3 py-1">
                  <Zap className="w-3 h-3" /> Most Popular
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-sm text-white/50 mb-1">{plan.label}</div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display font-bold text-3xl text-white">{plan.price}</span>
                    <span className="text-white/40 text-sm">{plan.period}</span>
                  </div>
                  {plan.saving && (
                    <div className="text-brand-400 text-sm font-semibold mt-1">{plan.saving}</div>
                  )}
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-1 ${
                  selected === plan.id ? 'border-brand-500 bg-brand-500' : 'border-white/30'
                }`}>
                  {selected === plan.id && <Check className="w-3 h-3 text-white" />}
                </div>
              </div>

              <ul className="space-y-2.5">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-white/70">
                    <Check className="w-4 h-4 text-brand-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        {/* Trust */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8 text-white/40 text-sm">
          <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-brand-500" /> {isMockPayments ? 'Mock checkout (no real charge)' : 'Secure payments via Razorpay'}</span>
          <span className="flex items-center gap-2"><Check className="w-4 h-4 text-brand-500" /> Cancel anytime</span>
          <span className="flex items-center gap-2"><Check className="w-4 h-4 text-brand-500" /> 10%+ to your chosen charity</span>
        </div>

        <button onClick={handleSubscribe} disabled={loading} className="btn-gold w-full text-center text-lg py-4">
          {loading ? 'Redirecting to checkout...' : `Subscribe ${selected === 'monthly' ? 'Monthly — €19.99' : 'Yearly — €199.99'}`}
        </button>

        <p className="text-center text-xs text-white/30 mt-4">
          {isMockPayments
            ? 'You will open a local mock payment screen — for development only.'
            : "You'll be redirected to Razorpay's secure checkout. Your payment info is never stored on our servers."}
        </p>
      </div>
    </div>
  );
}
