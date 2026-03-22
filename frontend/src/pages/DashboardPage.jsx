import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Trophy, Heart, CreditCard, Calendar, TrendingUp,
  AlertCircle, CheckCircle, ExternalLink, Upload
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ScoreEntry from '../components/dashboard/ScoreEntry';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

function StatCard({ label, value, sub, icon: Icon, color = 'text-brand-400', bg = 'bg-brand-900/40' }) {
  return (
    <div className="glass-panel p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <div className="text-xs text-white/40 mb-1">{label}</div>
        <div className="font-display font-bold text-white text-xl">{value}</div>
        {sub && <div className="text-xs text-white/30 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

function SubscriptionCard({ user, onCancel }) {
  const isActive = user.subscriptionStatus === 'active';
  return (
    <div className="glass-panel p-6">
      <h3 className="font-display font-bold text-white text-lg mb-4 flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-brand-400" /> Subscription
      </h3>
      <div className={`flex items-center gap-2 mb-3 ${isActive ? 'text-brand-400' : 'text-red-400'}`}>
        {isActive ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
        <span className="font-semibold capitalize">{user.subscriptionStatus}</span>
        {user.subscriptionPlan && <span className="text-white/30 text-sm">· {user.subscriptionPlan}</span>}
      </div>
      {user.subscriptionRenewalDate && (
        <p className="text-sm text-white/50 mb-4">
          {isActive ? 'Renews' : 'Expires'}: {format(new Date(user.subscriptionRenewalDate), 'dd MMM yyyy')}
        </p>
      )}
      {isActive ? (
        <button onClick={onCancel} className="btn-secondary text-sm w-full flex items-center justify-center gap-2 text-red-400 hover:bg-red-500/10 border-red-500/20">
          <AlertCircle className="w-4 h-4" /> Cancel Subscription
        </button>
      ) : (
        <Link to="/subscribe" className="btn-primary text-sm w-full text-center block">Subscribe Now</Link>
      )}
    </div>
  );
}

function CharityCard({ user }) {
  return (
    <div className="glass-panel p-6">
      <h3 className="font-display font-bold text-white text-lg mb-4 flex items-center gap-2">
        <Heart className="w-5 h-5 text-brand-400" /> My Charity
      </h3>
      {user.selectedCharity ? (
        <>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-brand-900/50 flex items-center justify-center overflow-hidden">
              {user.selectedCharity.logo
                ? <img src={user.selectedCharity.logo} alt="" className="w-full h-full object-cover" />
                : <Heart className="w-5 h-5 text-brand-400" />}
            </div>
            <div>
              <div className="font-semibold text-white text-sm">{user.selectedCharity.name}</div>
              <div className="text-xs text-brand-400">{user.charityPercentage}% of subscription</div>
            </div>
          </div>
          <Link to="/charities" className="btn-secondary text-sm w-full text-center block">Change Charity</Link>
        </>
      ) : (
        <>
          <p className="text-white/50 text-sm mb-4">No charity selected yet.</p>
          <Link to="/charities" className="btn-primary text-sm w-full text-center block">Choose a Charity</Link>
        </>
      )}
    </div>
  );
}

function WinsCard({ wins }) {
  if (!wins || wins.length === 0) return (
    <div className="glass-panel p-6">
      <h3 className="font-display font-bold text-white text-lg mb-2 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-gold-400" /> My Winnings
      </h3>
      <div className="text-center py-6 text-white/30">
        <Trophy className="w-8 h-8 mx-auto mb-2 opacity-30" />
        <p className="text-sm">No wins yet — keep playing!</p>
      </div>
    </div>
  );

  return (
    <div className="glass-panel p-6">
      <h3 className="font-display font-bold text-white text-lg mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-gold-400" /> My Winnings
      </h3>
      <div className="space-y-3">
        {wins.map((w, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gold-900/20 border border-gold-700/20">
            <div>
              <div className="text-sm font-semibold text-white">
                {new Date(0, w.month - 1).toLocaleString('default', { month: 'long' })} {w.year}
              </div>
              <div className="text-xs text-gold-400">{w.winner?.matchType}</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-gold-400">€{(w.winner?.prizeAmount / 100).toFixed(2)}</div>
              <div className={`text-xs capitalize ${
                w.winner?.paymentStatus === 'paid' ? 'text-brand-400'
                : w.winner?.paymentStatus === 'rejected' ? 'text-red-400'
                : 'text-white/40'
              }`}>{w.winner?.paymentStatus}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, refreshUser } = useAuth();
  const [wins, setWins] = useState([]);
  const [latestDraw, setLatestDraw] = useState(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('subscription') === 'success') {
      toast.success('Subscription activated! Welcome to GolfCharity 🏆');
      refreshUser();
    }
  }, [searchParams]);

  useEffect(() => {
    api.get('/users/my-draws').then(r => setWins(r.data.wins)).catch(() => {});
    api.get('/draws/latest').then(r => setLatestDraw(r.data.draw)).catch(() => {});
  }, []);

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription?')) return;
    try {
      await api.post('/subscriptions/cancel');
      toast.success('Subscription cancelled successfully.');
      refreshUser();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to cancel subscription');
    }
  };

  const scoreCount = user?.scores?.length || 0;
  const isEligible = user?.subscriptionStatus === 'active' && scoreCount === 5;
  const totalWon = wins.reduce((s, w) => s + (w.winner?.prizeAmount || 0), 0);

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Welcome header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-bold text-3xl md:text-4xl text-white mb-1">
              Hey, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-white/50">Your golf charity dashboard</p>
          </div>
          {isEligible && (
            <div className="hidden md:flex badge-green items-center gap-2 px-4 py-2">
              <CheckCircle className="w-4 h-4" /> Draw Eligible
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Subscription" value={user?.subscriptionStatus === 'active' ? 'Active' : 'Inactive'}
            sub={user?.subscriptionPlan} icon={CreditCard}
            color={user?.subscriptionStatus === 'active' ? 'text-brand-400' : 'text-red-400'}
            bg={user?.subscriptionStatus === 'active' ? 'bg-brand-900/40' : 'bg-red-900/30'} />
          <StatCard label="Scores Entered" value={`${scoreCount}/5`}
            sub={scoreCount === 5 ? 'Draw eligible!' : `${5 - scoreCount} more needed`}
            icon={TrendingUp} />
          <StatCard label="Total Winnings" value={totalWon > 0 ? `€${(totalWon / 100).toFixed(2)}` : '—'}
            icon={Trophy} color="text-gold-400" bg="bg-gold-900/30" />
          <StatCard label="Next Draw"
            value={latestDraw ? `${new Date(0, latestDraw.month - 1).toLocaleString('default', { month: 'short' })} ${latestDraw.year}` : 'Monthly'}
            sub="Upcoming" icon={Calendar} />
        </div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Score entry (takes 2 cols) */}
          <div className="lg:col-span-2">
            <ScoreEntry onUpdate={refreshUser} />
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            <SubscriptionCard user={user} onCancel={handleCancelSubscription} />
            <CharityCard user={user} />
          </div>
        </div>

        {/* Wins section */}
        <div className="mt-6">
          <WinsCard wins={wins} />
        </div>

        {/* Latest draw numbers */}
        {latestDraw && (
          <div className="mt-6 glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-white text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-gold-400" />
                Latest Draw — {new Date(0, latestDraw.month - 1).toLocaleString('default', { month: 'long' })} {latestDraw.year}
              </h3>
              <Link to="/draws" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">View all draws →</Link>
            </div>
            <div className="flex gap-3 flex-wrap">
              {latestDraw.winningNumbers?.map((n, i) => (
                <div key={i} className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-600/30 to-brand-800/30 border border-brand-500/40 flex items-center justify-center font-display font-bold text-xl text-brand-300">
                  {n}
                </div>
              ))}
            </div>
            {user?.scores?.length > 0 && (
              <div className="mt-4 p-4 rounded-xl bg-white/4 border border-white/8">
                <p className="text-xs text-white/50 mb-2">Your scores vs draw numbers:</p>
                <div className="flex gap-2 flex-wrap">
                  {user.scores.map(s => (
                    <div key={s._id} className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-sm border ${
                      latestDraw.winningNumbers?.includes(s.value)
                        ? 'bg-brand-700/40 border-brand-500/60 text-brand-300'
                        : 'bg-white/5 border-white/10 text-white/40'
                    }`}>
                      {s.value}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
