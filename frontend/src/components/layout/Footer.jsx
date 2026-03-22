import { Link } from 'react-router-dom';
import { Trophy, Heart, Github, Twitter, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/40 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-white text-lg">Golf<span className="text-brand-400">Charity</span></span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              The platform that combines the thrill of golf competition with the joy of giving back. Play, win, and make a difference.
            </p>
            <div className="flex gap-3 mt-4">
              {[Twitter, Instagram, Github].map((Icon, i) => (
                <button key={i} className="w-8 h-8 rounded-lg bg-white/8 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/15 transition-colors">
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Platform</h4>
            <ul className="space-y-2">
              {[['How it works', '/'], ['Charities', '/charities'], ['Monthly Draws', '/draws'], ['Subscribe', '/subscribe']].map(([label, to]) => (
                <li key={to}><Link to={to} className="text-sm text-white/50 hover:text-white/80 transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Support</h4>
            <ul className="space-y-2">
              {[['FAQ', '/'], ['Contact', '/'], ['Privacy Policy', '/'], ['Terms of Service', '/']].map(([label, to]) => (
                <li key={label}><Link to={to} className="text-sm text-white/50 hover:text-white/80 transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-white/30 text-xs">© 2026 GolfCharity. All rights reserved.</p>
          <p className="text-white/30 text-xs flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-brand-500" /> for a better world
          </p>
        </div>
      </div>
    </footer>
  );
}
