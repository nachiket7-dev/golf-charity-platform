import { useState, useEffect } from 'react';
import { Users, Trophy, Heart, DollarSign, TrendingUp } from 'lucide-react';
import api from '../../utils/api';

function StatCard({ label, value, icon: Icon, color, bg, sub }) {
  return (
    <div className="glass-panel p-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-white/50">{label}</span>
        <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
          <Icon className={`w-4.5 h-4.5 ${color}`} style={{ width: 18, height: 18 }} />
        </div>
      </div>
      <div className="font-display font-bold text-3xl text-white">{value}</div>
      {sub && <div className="text-xs text-white/30 mt-1">{sub}</div>}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(r => { setStats(r.data.stats); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-white/5 rounded-xl w-48" /><div className="grid grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="h-32 bg-white/5 rounded-2xl" />)}</div></div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-white mb-1">Dashboard</h1>
        <p className="text-white/40 text-sm">Platform overview and key metrics</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Users" value={stats?.totalUsers?.toLocaleString() || '0'} icon={Users} color="text-brand-400" bg="bg-brand-900/40" />
        <StatCard label="Active Subscribers" value={stats?.activeSubscribers?.toLocaleString() || '0'} icon={TrendingUp} color="text-green-400" bg="bg-green-900/30" sub="Currently subscribed" />
        <StatCard label="Monthly Revenue" value={stats?.monthlyRevenue ? `€${(stats.monthlyRevenue / 100).toFixed(0)}` : '€0'} icon={DollarSign} color="text-gold-400" bg="bg-gold-900/30" sub="From active subscriptions" />
        <StatCard label="Total Prize Pool" value={stats?.totalPrizePool ? `€${(stats.totalPrizePool / 100).toFixed(0)}` : '€0'} icon={Trophy} color="text-gold-400" bg="bg-gold-900/30" />
        <StatCard label="Charity Contributions" value={stats?.totalCharity ? `€${(stats.totalCharity / 100).toFixed(0)}` : '€0'} icon={Heart} color="text-pink-400" bg="bg-pink-900/30" />
        <StatCard label="Active Charities" value={stats?.totalCharities || '0'} icon={Heart} color="text-brand-400" bg="bg-brand-900/40" />
      </div>

      <div className="glass-panel p-6">
        <h2 className="font-display font-bold text-white text-lg mb-2">Quick Links</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {[
            { label: 'Run New Draw', to: '/admin/draws', color: 'bg-gold-900/30 text-gold-400 border-gold-700/30' },
            { label: 'Verify Winners', to: '/admin/winners', color: 'bg-brand-900/40 text-brand-400 border-brand-700/30' },
            { label: 'Manage Users', to: '/admin/users', color: 'bg-white/8 text-white/70 border-white/10' },
            { label: 'Add Charity', to: '/admin/charities', color: 'bg-pink-900/30 text-pink-400 border-pink-700/30' },
          ].map(({ label, to, color }) => (
            <a key={label} href={to} className={`px-4 py-3 rounded-xl border text-sm font-medium text-center transition-all hover:scale-[1.02] ${color}`}>
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
