import { useState, useEffect } from 'react';
import { Medal, Check, X, Eye, Filter } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  pending:  { color: 'badge-gold', label: 'Pending' },
  verified: { color: 'badge-green', label: 'Verified' },
  paid:     { color: 'bg-blue-900/40 text-blue-400 border border-blue-700/30 badge', label: 'Paid' },
  rejected: { color: 'badge-red', label: 'Rejected' },
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AdminWinners() {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [updating, setUpdating] = useState(null);
  const [notes, setNotes] = useState({});
  const [expandedProof, setExpandedProof] = useState(null);

  const fetchWinners = async () => {
    setLoading(true);
    try {
      const params = filter ? `?status=${filter}` : '';
      const { data } = await api.get(`/admin/winners${params}`);
      setWinners(data.winners || []);
    } catch { toast.error('Failed to load winners'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchWinners(); }, [filter]);

  const updateStatus = async (drawId, winnerId, status) => {
    setUpdating(winnerId);
    try {
      await api.put(`/admin/winners/${drawId}/${winnerId}/verify`, { status, notes: notes[winnerId] });
      toast.success(`Winner marked as ${status}`);
      fetchWinners();
    } catch { toast.error('Failed to update'); }
    finally { setUpdating(null); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-white mb-1">Winners</h1>
          <p className="text-white/40 text-sm">Verify submissions and manage payouts</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-white/40" />
          <select className="input py-2 text-sm w-36" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="">All status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="paid">Paid</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-40 rounded-2xl shimmer" />)}</div>
      ) : winners.length === 0 ? (
        <div className="text-center py-20 text-white/30">
          <Medal className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No winners to review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {winners.map(({ drawId, month, year, winner }) => {
            const cfg = STATUS_CONFIG[winner.paymentStatus] || STATUS_CONFIG.pending;
            return (
              <div key={winner._id} className="glass-panel p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-brand-900/60 flex items-center justify-center text-lg font-bold text-brand-300 flex-shrink-0">
                      {winner.user?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{winner.user?.name || 'Unknown'}</div>
                      <div className="text-sm text-white/50">{winner.user?.email}</div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs text-white/40">{MONTHS[month - 1]} {year}</span>
                        <span className={`badge text-xs ${
                          winner.matchType === '5-match' ? 'badge-gold' :
                          winner.matchType === '4-match' ? 'badge-green' : 'badge-gray'
                        }`}>{winner.matchType}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="font-display font-bold text-2xl text-white mb-1">
                      €{(winner.prizeAmount / 100).toFixed(2)}
                    </div>
                    <span className={cfg.color}>{cfg.label}</span>
                  </div>
                </div>

                {/* Proof */}
                {winner.proofUrl && (
                  <div className="mb-4 p-3 rounded-xl bg-white/4 border border-white/8">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-white/50 font-semibold">Proof Submitted</span>
                      <a href={winner.proofUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-400 flex items-center gap-1 hover:text-brand-300">
                        <Eye className="w-3.5 h-3.5" /> View proof
                      </a>
                    </div>
                    <p className="text-xs text-white/40 truncate">{winner.proofUrl}</p>
                  </div>
                )}

                {/* Admin notes */}
                <div className="mb-4">
                  <label className="label text-xs">Admin notes (optional)</label>
                  <input className="input text-sm py-2" placeholder="Internal notes..." value={notes[winner._id] || ''} onChange={e => setNotes(p => ({ ...p, [winner._id]: e.target.value }))} />
                </div>

                {/* Actions */}
                {winner.paymentStatus !== 'paid' && (
                  <div className="flex gap-2 flex-wrap">
                    {winner.paymentStatus === 'pending' && (
                      <>
                        <button onClick={() => updateStatus(drawId, winner._id, 'verified')} disabled={updating === winner._id} className="btn-primary text-sm py-2 flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5" /> Verify
                        </button>
                        <button onClick={() => updateStatus(drawId, winner._id, 'rejected')} disabled={updating === winner._id} className="bg-red-900/30 border border-red-700/40 text-red-400 text-sm py-2 px-4 rounded-xl flex items-center gap-1.5 hover:bg-red-900/50 transition-colors">
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      </>
                    )}
                    {winner.paymentStatus === 'verified' && (
                      <button onClick={() => updateStatus(drawId, winner._id, 'paid')} disabled={updating === winner._id} className="bg-blue-900/40 border border-blue-700/40 text-blue-400 text-sm py-2 px-4 rounded-xl flex items-center gap-1.5 hover:bg-blue-900/60 transition-colors">
                        <Check className="w-3.5 h-3.5" /> Mark as Paid
                      </button>
                    )}
                  </div>
                )}

                {winner.paymentStatus === 'paid' && winner.paidAt && (
                  <p className="text-xs text-blue-400">Paid on {new Date(winner.paidAt).toLocaleDateString()}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
