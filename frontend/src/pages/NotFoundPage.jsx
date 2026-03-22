import { Link } from 'react-router-dom';
import { Trophy, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-20 h-20 bg-brand-900/50 border border-brand-700/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Trophy className="w-10 h-10 text-brand-400/50" />
        </div>
        <h1 className="font-display font-bold text-6xl text-white mb-3">404</h1>
        <p className="text-white/50 text-lg mb-8">Page not found. Looks like this shot went out of bounds.</p>
        <Link to="/" className="btn-primary flex items-center justify-center gap-2 w-fit mx-auto">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    </div>
  );
}
