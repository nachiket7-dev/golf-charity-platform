import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Trophy, AlertCircle } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

function ScoreBar({ value }) {
  const pct = ((value - 1) / 44) * 100;
  const color = value >= 30 ? '#22c55e' : value >= 20 ? '#f59e0b' : '#ef4444';
  return (
    <div className="w-full bg-white/5 rounded-full h-1.5 mt-2">
      <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export default function ScoreEntry({ onUpdate }) {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ value: '', date: format(new Date(), 'yyyy-MM-dd') });
  const [saving, setSaving] = useState(false);

  const fetchScores = async () => {
    try {
      const { data } = await api.get('/scores');
      setScores(data.scores);
    } catch (err) {
      toast.error('Failed to load scores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchScores(); }, []);

  const handleAdd = async () => {
    if (!form.value || !form.date) return toast.error('Enter value and date');
    setSaving(true);
    try {
      const { data } = await api.post('/scores', { value: Number(form.value), date: form.date });
      setScores(data.scores);
      setAdding(false);
      setForm({ value: '', date: format(new Date(), 'yyyy-MM-dd') });
      onUpdate?.();
      toast.success('Score added!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add score');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (scoreId) => {
    setSaving(true);
    try {
      const { data } = await api.put(`/scores/${scoreId}`, { value: Number(form.value), date: form.date });
      setScores(data.scores);
      setEditId(null);
      onUpdate?.();
      toast.success('Score updated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update score');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (scoreId) => {
    if (!confirm('Remove this score?')) return;
    try {
      await api.delete(`/scores/${scoreId}`);
      setScores(prev => prev.filter(s => s._id !== scoreId));
      onUpdate?.();
      toast.success('Score removed');
    } catch (err) {
      toast.error('Failed to remove score');
    }
  };

  const startEdit = (score) => {
    setEditId(score._id);
    setAdding(false);
    setForm({ value: score.value.toString(), date: format(new Date(score.date), 'yyyy-MM-dd') });
  };

  const scoreCount = scores.length;
  const canAdd = scoreCount < 5;

  return (
    <div className="glass-panel p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-display font-bold text-white text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-brand-400" /> My Scores
          </h3>
          <p className="text-white/40 text-xs mt-0.5">Stableford format · Last 5 rounds</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
            scoreCount === 5 ? 'bg-brand-900/40 text-brand-400 border-brand-700/40' : 'bg-white/5 text-white/40 border-white/10'
          }`}>
            {scoreCount}/5
          </div>
          {canAdd && !adding && (
            <button onClick={() => { setAdding(true); setEditId(null); }} className="btn-primary text-xs py-2 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Add Score
            </button>
          )}
        </div>
      </div>

      {/* Draw eligibility banner */}
      {scoreCount < 5 && (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-gold-900/20 border border-gold-700/30 mb-5">
          <AlertCircle className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gold-300">
            You need <strong>{5 - scoreCount} more score{5 - scoreCount !== 1 ? 's' : ''}</strong> to be eligible for the monthly draw.
          </p>
        </div>
      )}

      {/* Add form */}
      {adding && (
        <div className="bg-brand-950/40 border border-brand-700/30 rounded-xl p-4 mb-4">
          <p className="text-xs text-brand-300 font-semibold mb-3">New Score</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label text-xs">Stableford Points (1–45)</label>
              <input
                type="number" min="1" max="45" className="input text-sm py-2.5"
                placeholder="e.g. 34" value={form.value}
                onChange={e => setForm(p => ({ ...p, value: e.target.value }))}
              />
            </div>
            <div>
              <label className="label text-xs">Date Played</label>
              <input
                type="date" className="input text-sm py-2.5"
                value={form.date}
                onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                max={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={handleAdd} disabled={saving} className="btn-primary text-xs py-2 flex items-center gap-1.5">
              <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save Score'}
            </button>
            <button onClick={() => setAdding(false)} className="btn-secondary text-xs py-2 flex items-center gap-1.5">
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Scores list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-xl shimmer" />)}
        </div>
      ) : scores.length === 0 ? (
        <div className="text-center py-10 text-white/30">
          <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No scores yet. Add your first round!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {scores.map((score, idx) => (
            <div key={score._id} className="group relative">
              {editId === score._id ? (
                <div className="bg-brand-950/40 border border-brand-700/30 rounded-xl p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label text-xs">Points</label>
                      <input type="number" min="1" max="45" className="input text-sm py-2.5" value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} />
                    </div>
                    <div>
                      <label className="label text-xs">Date</label>
                      <input type="date" className="input text-sm py-2.5" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} max={format(new Date(), 'yyyy-MM-dd')} />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => handleUpdate(score._id)} disabled={saving} className="btn-primary text-xs py-2 flex items-center gap-1.5">
                      <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Update'}
                    </button>
                    <button onClick={() => setEditId(null)} className="btn-secondary text-xs py-2 flex items-center gap-1.5">
                      <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/4 border border-white/8 hover:border-white/15 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-brand-900/60 border border-brand-700/30 flex items-center justify-center flex-shrink-0">
                    <span className="font-display font-bold text-brand-300 text-sm">{score.value}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-white">{score.value} pts</span>
                      <span className="text-xs text-white/30">{format(new Date(score.date), 'dd MMM yyyy')}</span>
                    </div>
                    <ScoreBar value={score.value} />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(score)} className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(score._id)} className="p-1.5 rounded-lg text-white/50 hover:text-red-400 hover:bg-red-900/20 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {scoreCount === 5 && (
        <p className="text-xs text-white/30 text-center mt-4">
          Adding a new score will replace your oldest round automatically.
        </p>
      )}
    </div>
  );
}
