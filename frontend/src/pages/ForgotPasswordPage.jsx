import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Mail } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      toast.success('If your email exists, a reset link has been sent.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to request reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-white text-xl">Golf<span className="text-brand-400">Charity</span></span>
        </Link>

        <div className="glass-panel p-8">
          <h1 className="font-display font-bold text-2xl text-white mb-1">Forgot password</h1>
          <p className="text-white/50 mb-6 text-sm">We will email you a password reset link.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <input
                  type="email"
                  className="input pr-10"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Mail className="w-4 h-4 text-white/30 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </form>

          {submitted && (
            <p className="text-brand-300 text-xs mt-4">
              Check your inbox and spam folder for the reset email.
            </p>
          )}

          <p className="text-center text-sm text-white/50 mt-6">
            Remembered it?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">Back to sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
