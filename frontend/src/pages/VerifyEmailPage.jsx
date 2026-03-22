import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Trophy, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../utils/api';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);
  const [state, setState] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    let isMounted = true;

    const verify = async () => {
      if (!token) {
        if (!isMounted) return;
        setState('error');
        setMessage('Invalid verification link.');
        return;
      }

      try {
        const { data } = await api.post('/auth/verify-email', { token });
        if (!isMounted) return;
        setState('success');
        setMessage(data.message || 'Email verified successfully.');
      } catch (err) {
        if (!isMounted) return;
        setState('error');
        setMessage(err.response?.data?.error || 'Email verification failed.');
      }
    };

    verify();
    return () => { isMounted = false; };
  }, [token]);

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-white text-xl">Golf<span className="text-brand-400">Charity</span></span>
        </Link>

        <div className="glass-panel p-8 text-center">
          {state === 'loading' && <div className="w-8 h-8 mx-auto border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-4" />}
          {state === 'success' && <CheckCircle2 className="w-10 h-10 text-brand-400 mx-auto mb-4" />}
          {state === 'error' && <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />}

          <h1 className="font-display font-bold text-2xl text-white mb-2">Email verification</h1>
          <p className={`text-sm ${state === 'error' ? 'text-red-300' : 'text-white/70'}`}>{message}</p>

          <div className="mt-6">
            <Link to="/login" className="btn-primary w-full inline-block">Go to sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
