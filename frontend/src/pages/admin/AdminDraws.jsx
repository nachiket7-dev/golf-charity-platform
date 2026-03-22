import { useState, useEffect } from 'react';
import { Trophy, Play, Send, Eye } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function AdminDraws() {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simForm, setSimForm] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), drawType: 'random' });
  const [simulating, setSimulating] = useState(false);
  const [publishing, setPublishing] = useState(null);

  const fetchDraws = () => {
    api.get('/admin/draws').then(r => { setDraws(r.data.draws || []); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchDraws(); }, []);

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      const { data } = await api.post('/draws/simulate', simForm);
      toast.success('Draw simulated! Review before publishing.');
      fetchDraws();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Simulation failed');
    } finally {
      setSimulating(false);
    }
  };

  const handlePublish = async (drawId) => {
    if (!confirm('Publish this draw? Winners will be notified by email.')) return;
    setPublishing(drawId);
    try {
      await api.post(`/draws/${drawId}/publish`);
      toast.success('Draw published! Winners notified.');
      fetchDraws();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to publish');
    } finally {
      setPublishing(null);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-white mb-1">Draw Management</h1>
        <p className="text-white/40 text-sm">Simulate and publish monthly prize draws</p>
      </div>

      {/* Simulate form */}
      <div className="glass-panel p-6 mb-8">
        <h2 className="font-display font-bold text-white text-lg mb-4 flex items-center gap-2">
          <Play className="w-5 h-5 text-brand-400" /> Run Draw Simulation
        </h2>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="label">Month</label>
            <select className="input" value={simForm.month} onChange={e => setSimForm(p => ({ ...p, month: Number(e.target.value) }))}>
              {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Year</label>
            <input type="number" className="input" value={simForm.year} onChange={e => setSimForm(p => ({ ...p, year: Number(e.target.value) }))} min="2024" max="2030" />
          </div>
          <div>
            <label className="label">Draw Type</label>
            <select className="input" value={simForm.drawType} onChange={e => setSimForm(p => ({ ...p, drawType: e.target.value }))}>
              <option value="random">Random</option>
              <option value="algorithmic">Algorithmic (Weighted)</option>
            </select>
          </div>
        </div>
        <p className="text-xs text-white/30 mb-4">
          Random: standard lottery. Algorithmic: weighted by frequency of scores across all active users.
        </p>
        <button onClick={handleSimulate} disabled={simulating} className="btn-primary flex items-center gap-2">
          <Play className="w-4 h-4" /> {simulating ? 'Simulating...' : 'Simulate Draw'}
        </button>
      </div>

      {/* Draws list */}
      <div className="space-y-4">
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="h-48 rounded-2xl shimmer" />)
        ) : draws.length === 0 ? (
          <div className="text-center py-20 text-white/30">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No draws yet. Simulate your first draw above.</p>
          </div>
        ) : (
          draws.map(draw => (
            <div key={draw._id} className="glass-panel p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-display font-bold text-white text-lg">{MONTHS[draw.month - 1]} {draw.year}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`badge text-xs ${
                      draw.status === 'published' ? 'badge-green' :
                      draw.status === 'simulated' ? 'badge-gold' : 'badge-gray'
                    }`}>{draw.status}</span>
                    <span className="text-xs text-white/40">{draw.participantCount} participants · {draw.drawType}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {draw.status === 'simulated' && (
                    <button onClick={() => handlePublish(draw._id)} disabled={publishing === draw._id} className="btn-primary text-sm flex items-center gap-2 py-2">
                      <Send className="w-3.5 h-3.5" /> {publishing === draw._id ? 'Publishing...' : 'Publish'}
                    </button>
                  )}
                </div>
              </div>

              {/* Winning numbers */}
              {draw.winningNumbers?.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-white/40 mb-2 uppercase tracking-wider">Winning Numbers</p>
                  <div className="flex gap-2">
                    {draw.winningNumbers.map((n, i) => (
                      <div key={i} className="w-12 h-12 rounded-xl bg-brand-900/60 border border-brand-700/40 flex items-center justify-center font-display font-bold text-lg text-brand-300">{n}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prize pools */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: 'Jackpot (5)', amount: draw.jackpotPool, winners: draw.winners?.filter(w => w.matchType === '5-match').length || 0 },
                  { label: '4-Match', amount: draw.fourMatchPool, winners: draw.winners?.filter(w => w.matchType === '4-match').length || 0 },
                  { label: '3-Match', amount: draw.threeMatchPool, winners: draw.winners?.filter(w => w.matchType === '3-match').length || 0 },
                ].map(({ label, amount, winners }) => (
                  <div key={label} className="bg-white/4 rounded-xl p-3 text-center">
                    <div className="font-bold text-white text-sm">€{(amount / 100).toFixed(0)}</div>
                    <div className="text-xs text-white/40">{label}</div>
                    <div className="text-xs text-brand-400 mt-1">{winners} winner{winners !== 1 ? 's' : ''}</div>
                  </div>
                ))}
              </div>

              {draw.jackpotRollover > 0 && (
                <div className="text-xs text-gold-400 bg-gold-900/20 border border-gold-700/20 rounded-lg px-3 py-2">
                  Includes €{(draw.jackpotRollover / 100).toFixed(0)} jackpot rollover from previous month
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
