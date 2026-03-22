import { useState, useEffect } from 'react';
import { Search, Edit2, Check, X } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const STATUS_BADGE = {
  active: 'badge-green',
  inactive: 'badge-gray',
  cancelled: 'badge-red',
  lapsed: 'badge-red',
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      const { data } = await api.get(`/admin/users?${params}`);
      setUsers(data.users);
      setTotal(data.total);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [page, search, status]);

  const startEdit = (user) => {
    setEditId(user._id);
    setEditForm({ name: user.name, email: user.email, subscriptionStatus: user.subscriptionStatus, role: user.role });
  };

  const handleUpdate = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}`, editForm);
      toast.success('User updated');
      setEditId(null);
      fetchUsers();
    } catch { toast.error('Failed to update user'); }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-white mb-1">Users</h1>
        <p className="text-white/40 text-sm">{total} total users</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input type="text" placeholder="Search name or email..." className="input pl-10 py-2.5 text-sm"
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="input py-2.5 text-sm w-40" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="cancelled">Cancelled</option>
          <option value="lapsed">Lapsed</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                {['Name', 'Email', 'Status', 'Plan', 'Scores', 'Role', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    {[...Array(8)].map((_, j) => <td key={j} className="px-4 py-4"><div className="h-4 bg-white/5 rounded shimmer" /></td>)}
                  </tr>
                ))
              ) : users.map(user => (
                <tr key={user._id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  {editId === user._id ? (
                    <>
                      <td className="px-4 py-3"><input className="input py-1.5 text-sm w-32" value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} /></td>
                      <td className="px-4 py-3"><input className="input py-1.5 text-sm w-40" value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} /></td>
                      <td className="px-4 py-3">
                        <select className="input py-1.5 text-sm w-28" value={editForm.subscriptionStatus} onChange={e => setEditForm(p => ({ ...p, subscriptionStatus: e.target.value }))}>
                          {['active','inactive','cancelled','lapsed'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-white/50 text-sm">{user.subscriptionPlan || '—'}</td>
                      <td className="px-4 py-3 text-white/50 text-sm">{user.scores?.length || 0}/5</td>
                      <td className="px-4 py-3">
                        <select className="input py-1.5 text-sm w-24" value={editForm.role} onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))}>
                          <option value="subscriber">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-white/50 text-sm">{format(new Date(user.createdAt), 'dd MMM yy')}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => handleUpdate(user._id)} className="p-1.5 rounded-lg bg-brand-900/50 text-brand-400 hover:bg-brand-800/50 transition-colors"><Check className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setEditId(null)} className="p-1.5 rounded-lg bg-white/5 text-white/40 hover:bg-white/10 transition-colors"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-brand-900/60 flex items-center justify-center text-xs font-bold text-brand-300 flex-shrink-0">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm text-white font-medium">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-white/60">{user.email}</td>
                      <td className="px-4 py-4"><span className={STATUS_BADGE[user.subscriptionStatus] || 'badge-gray'}>{user.subscriptionStatus}</span></td>
                      <td className="px-4 py-4 text-sm text-white/50 capitalize">{user.subscriptionPlan || '—'}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          <div className="w-16 bg-white/10 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full bg-brand-500 transition-all" style={{ width: `${((user.scores?.length || 0) / 5) * 100}%` }} />
                          </div>
                          <span className="text-xs text-white/40">{user.scores?.length || 0}/5</span>
                        </div>
                      </td>
                      <td className="px-4 py-4"><span className={user.role === 'admin' ? 'badge-gold text-xs' : 'badge-gray text-xs'}>{user.role}</span></td>
                      <td className="px-4 py-4 text-sm text-white/40">{format(new Date(user.createdAt), 'dd MMM yy')}</td>
                      <td className="px-4 py-4">
                        <button onClick={() => startEdit(user)} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 15 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
            <span className="text-xs text-white/40">Showing {(page - 1) * 15 + 1}–{Math.min(page * 15, total)} of {total}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40">Previous</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page * 15 >= total} className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
