import { useState, useEffect } from 'react';
import { Trophy, Users, DollarSign, Calendar } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import api from '../utils/api';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function DrawCard({ draw }) {
  const winnersByType = {
    '5-match': draw.winners?.filter(w => w.matchType === '5-match') || [],
    '4-match': draw.winners?.filter(w => w.matchType === '4-match') || [],
    '3-match': draw.winners?.filter(w => w.matchType === '3-match') || [],
  };
  const hasJackpotWinner = winnersByType['5-match'].length > 0;

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-display font-bold text-white text-xl">
            {MONTH_NAMES[draw.month - 1]} {draw.year} Draw
          </h3>
          <p className="text-white/40 text-sm">{draw.participantCount} participants</p>
        </div>
        <div className={hasJackpotWinner ? 'badge-gold' : 'badge-gray'}>
          {hasJackpotWinner ? '🏆 Jackpot Won' : draw.jackpotPool > 0 ? '🔄 Jackpot Rolled Over' : 'Completed'}
        </div>
      </div>

      {/* Winning numbers */}
      <div className="mb-5">
        <p className="text-xs text-white/40 mb-3 uppercase tracking-wider">Winning Numbers</p>
        <div className="flex gap-2.5">
          {draw.winningNumbers?.map((n, i) => (
            <div key={i} className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-600/30 to-brand-800/30 border border-brand-500/40 flex items-center justify-center font-display font-bold text-lg text-brand-300">
              {n}
            </div>
          ))}
        </div>
      </div>

      {/* Prize breakdown */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Jackpot', pool: draw.jackpotPool, count: winnersByType['5-match'].length, color: 'text-gold-400' },
          { label: '4-Match', pool: draw.fourMatchPool, count: winnersByType['4-match'].length, color: 'text-brand-400' },
          { label: '3-Match', pool: draw.threeMatchPool, count: winnersByType['3-match'].length, color: 'text-white/60' },
        ].map(({ label, pool, count, color }) => (
          <div key={label} className="bg-white/4 border border-white/8 rounded-xl p-3 text-center">
            <div className={`font-bold text-sm ${color}`}>€{(pool / 100).toFixed(0)}</div>
            <div className="text-xs text-white/30 mt-0.5">{label}</div>
            <div className="text-xs text-white/50 mt-1">{count} winner{count !== 1 ? 's' : ''}</div>
          </div>
        ))}
      </div>

      {/* Winners */}
      {draw.winners?.length > 0 && (
        <div>
          <p className="text-xs text-white/40 mb-3 uppercase tracking-wider">Winners</p>
          <div className="space-y-2">
            {draw.winners.slice(0, 5).map((w, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-brand-900/60 flex items-center justify-center text-xs font-bold text-brand-300">
                    {w.user?.name?.charAt(0) || '?'}
                  </div>
                  <span className="text-white/60">{w.user?.name || 'Anonymous'}</span>
                </div>
                <div className="text-right">
                  <span className={`font-semibold ${w.matchType === '5-match' ? 'text-gold-400' : w.matchType === '4-match' ? 'text-brand-400' : 'text-white/50'}`}>
                    €{(w.prizeAmount / 100).toFixed(2)}
                  </span>
                  <span className="text-white/30 text-xs ml-2">{w.matchType}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DrawsPage() {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/draws').then(r => {
      setDraws(r.data.draws || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="text-center mb-12">
          <div className="badge-gold mx-auto mb-4 w-fit"><Trophy className="w-3 h-3" /> Monthly Prize Draws</div>
          <h1 className="section-title mb-3">Draw Results</h1>
          <p className="section-sub mx-auto text-center">5 winning numbers drawn every month. Match 3, 4, or 5 to win.</p>
        </div>

        {/* How draws work */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Jackpot (5 match)', pct: '40%', icon: Trophy, color: 'text-gold-400', bg: 'bg-gold-900/30' },
            { label: 'Second (4 match)', pct: '35%', icon: DollarSign, color: 'text-brand-400', bg: 'bg-brand-900/40' },
            { label: 'Third (3 match)', pct: '25%', icon: Users, color: 'text-white/60', bg: 'bg-white/8' },
          ].map(({ label, pct, icon: Icon, color, bg }) => (
            <div key={label} className="glass-panel p-4 text-center">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mx-auto mb-3`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div className={`font-display font-bold text-2xl ${color}`}>{pct}</div>
              <div className="text-xs text-white/40 mt-1">{label}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => <div key={i} className="h-80 rounded-2xl shimmer" />)}
          </div>
        ) : draws.length === 0 ? (
          <div className="text-center py-20 text-white/30">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No draws published yet. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {draws.map(draw => <DrawCard key={draw._id} draw={draw} />)}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
