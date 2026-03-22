import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CreditCard, Shield, Trophy, CheckCircle } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

/**
 * Demo checkout — only used when backend has MOCK_PAYMENTS=true.
 * Simulates a successful payment and activates the subscription via API.
 */
export default function MockPaymentPage() {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const complete = async () => {
    if (!token) return;
    setLoading(true);
    try {
      await api.post('/subscriptions/mock-complete', { token });
      await refreshUser();
      setDone(true);
      toast.success('Demo payment complete — subscription active');
      setTimeout(() => navigate('/dashboard?subscription=success'), 800);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not complete demo payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 pt-28 pb-20">
        <div className="glass-panel p-8 text-center">
          <div className="badge-gold mx-auto mb-4 w-fit text-xs">Demo / mock payment</div>
          <div className="w-14 h-14 rounded-2xl bg-brand-900/50 flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-7 h-7 text-brand-400" />
          </div>
          <h1 className="font-display font-bold text-2xl text-white mb-2">Mock checkout</h1>
          <p className="text-white/60 text-sm mb-6">
            No real payment is processed. This screen exists for local development when you do not use Razorpay.
          </p>

          {!token && (
            <p className="text-red-300 text-sm mb-4">Missing checkout token. Go back to Subscribe and try again.</p>
          )}

          {done && (
            <div className="flex items-center justify-center gap-2 text-brand-400 mb-4">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Redirecting to dashboard…</span>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={complete}
              disabled={loading || !token || done}
              className="btn-gold w-full py-3 flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4" />
              {loading ? 'Processing…' : 'Simulate successful payment'}
            </button>
            <Link to="/subscribe" className="btn-secondary w-full text-center py-3 block text-sm">
              Back to plans
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 text-left text-xs text-white/40 space-y-2">
            <p className="flex items-start gap-2">
              <Trophy className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
              Enable mock mode in <code className="text-brand-300">backend/.env</code>:{' '}
              <code className="text-white/70">MOCK_PAYMENTS=true</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
