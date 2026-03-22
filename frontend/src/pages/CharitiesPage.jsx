import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Search, Filter, ArrowRight } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import api from '../utils/api';

const CATEGORIES = ['all', 'health', 'environment', 'education', 'sports', 'animals', 'community', 'international', 'other'];

export default function CharitiesPage() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    const params = new URLSearchParams();
    if (category !== 'all') params.set('category', category);
    if (search) params.set('search', search);
    api.get(`/charities?${params}`).then(r => {
      setCharities(r.data.charities || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [category, search]);

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="badge-green mx-auto mb-4 w-fit"><Heart className="w-3 h-3" /> Making a Difference</div>
          <h1 className="section-title mb-3">Supported Charities</h1>
          <p className="section-sub mx-auto text-center">
            Every subscription contributes to a cause you choose. Browse our verified charity partners.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text" placeholder="Search charities..."
              className="input pl-10" value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all ${
                  category === cat ? 'bg-brand-600 text-white' : 'bg-white/8 text-white/60 hover:bg-white/12 border border-white/10'
                }`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="h-64 rounded-2xl shimmer" />)}
          </div>
        ) : charities.length === 0 ? (
          <div className="text-center py-20 text-white/30">
            <Heart className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No charities found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {charities.map(charity => (
              <Link key={charity._id} to={`/charities/${charity.slug}`} className="card-hover p-6 group block">
                {charity.isFeatured && (
                  <div className="badge-gold mb-3 w-fit text-xs">Featured</div>
                )}
                <div className="w-14 h-14 rounded-xl bg-brand-900/50 border border-brand-700/30 flex items-center justify-center mb-4 overflow-hidden">
                  {charity.logo
                    ? <img src={charity.logo} alt={charity.name} className="w-full h-full object-cover" />
                    : <Heart className="w-7 h-7 text-brand-400" />}
                </div>
                <div className="badge-gray mb-2 w-fit capitalize text-xs">{charity.category}</div>
                <h3 className="font-display font-bold text-white text-lg mb-2 group-hover:text-brand-300 transition-colors">
                  {charity.name}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed line-clamp-3 mb-4">
                  {charity.shortDescription || charity.description}
                </p>
                {charity.totalReceived > 0 && (
                  <div className="text-xs text-brand-400 font-semibold mb-3">
                    €{(charity.totalReceived / 100).toFixed(0)} raised through GolfCharity
                  </div>
                )}
                <div className="flex items-center gap-2 text-brand-400 text-sm font-medium">
                  View charity <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
