import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Heart, X, Save } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['health','environment','education','sports','animals','community','international','other'];

const emptyForm = { name: '', shortDescription: '', description: '', category: 'other', website: '', logo: '', isFeatured: false, isActive: true };

function CharityForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || emptyForm);
  const [saving, setSaving] = useState(false);
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try { await onSave(form); } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel p-6 mb-6">
      <h3 className="font-display font-bold text-white text-lg mb-4">{initial ? 'Edit Charity' : 'Add Charity'}</h3>
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div><label className="label">Name *</label><input required className="input" value={form.name} onChange={set('name')} /></div>
        <div><label className="label">Category</label>
          <select className="input" value={form.category} onChange={set('category')}>
            {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
          </select>
        </div>
        <div><label className="label">Website</label><input type="url" className="input" value={form.website} onChange={set('website')} placeholder="https://..." /></div>
        <div><label className="label">Logo URL</label><input type="url" className="input" value={form.logo} onChange={set('logo')} placeholder="https://..." /></div>
      </div>
      <div className="mb-4"><label className="label">Short Description (max 200 chars)</label><input maxLength={200} className="input" value={form.shortDescription} onChange={set('shortDescription')} /></div>
      <div className="mb-4"><label className="label">Full Description *</label><textarea required rows={4} className="input resize-none" value={form.description} onChange={set('description')} /></div>
      <div className="flex items-center gap-6 mb-4">
        <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
          <input type="checkbox" className="accent-brand-500" checked={form.isFeatured} onChange={set('isFeatured')} /> Featured on homepage
        </label>
        <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
          <input type="checkbox" className="accent-brand-500" checked={form.isActive} onChange={set('isActive')} /> Active (visible to users)
        </label>
      </div>
      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2"><Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save Charity'}</button>
        <button type="button" onClick={onCancel} className="btn-secondary flex items-center gap-2"><X className="w-4 h-4" />Cancel</button>
      </div>
    </form>
  );
}

export default function AdminCharities() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCharity, setEditCharity] = useState(null);

  const fetch = () => api.get('/charities').then(r => { setCharities(r.data.charities || []); setLoading(false); }).catch(() => setLoading(false));
  useEffect(() => { fetch(); }, []);

  const handleCreate = async (form) => {
    try { await api.post('/charities', form); toast.success('Charity added'); setShowForm(false); fetch(); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed to add charity'); }
  };

  const handleUpdate = async (form) => {
    try { await api.put(`/charities/${editCharity._id}`, form); toast.success('Charity updated'); setEditCharity(null); fetch(); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed to update'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this charity?')) return;
    try { await api.delete(`/charities/${id}`); toast.success('Charity removed'); fetch(); }
    catch { toast.error('Failed to remove charity'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-white mb-1">Charities</h1>
          <p className="text-white/40 text-sm">{charities.length} charities listed</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditCharity(null); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Charity
        </button>
      </div>

      {showForm && !editCharity && <CharityForm onSave={handleCreate} onCancel={() => setShowForm(false)} />}
      {editCharity && <CharityForm initial={editCharity} onSave={handleUpdate} onCancel={() => setEditCharity(null)} />}

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-40 rounded-2xl shimmer" />)}</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {charities.map(charity => (
            <div key={charity._id} className="glass-panel p-5 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-900/50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {charity.logo ? <img src={charity.logo} alt="" className="w-full h-full object-cover" /> : <Heart className="w-6 h-6 text-brand-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-white text-sm">{charity.name}</h3>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => { setEditCharity(charity); setShowForm(false); }} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(charity._id)} className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-900/20 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <div className="flex gap-2 mb-2">
                  <span className="badge-gray text-xs capitalize">{charity.category}</span>
                  {charity.isFeatured && <span className="badge-gold text-xs">Featured</span>}
                  {!charity.isActive && <span className="badge-red text-xs">Inactive</span>}
                </div>
                <p className="text-xs text-white/40 line-clamp-2">{charity.shortDescription || charity.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
