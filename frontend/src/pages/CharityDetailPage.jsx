import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, Globe, Calendar, ArrowLeft, Check } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function CharityDetailPage() {
  const { slug } = useParams();
  const { user, refreshUser, isSubscribed } = useAuth();
  const [charity, setCharity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);
  const [pct, setPct] = useState(10);

  useEffect(() => {
    api.get(`/charities/${slug}`).then(r => {
      setCharity(r.data.charity);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [slug]);

  const isSelected = user?.selectedCharity?._id === charity?._id || user?.selectedCharity === charity?._id;

  const handleSelect = async () => {
    if (!isSubscribed) return toast.error('You need an active subscription to choose a charity');
    setSelecting(true);
    try {
      await api.put('/charities/select', { charityId: charity._id, percentage: pct });
      await refreshUser();
      toast.success(`${charity.name} selected as your charity!`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to select charity');
    } finally {
      setSelecting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-16">
        <div className="h-96 rounded-2xl shimmer" />
      </div>
    </div>
  );

  if (!charity) return (
    <div className="min-h-screen gradient-bg flex items-center justify-center">
      <Navbar />
      <div className="text-center text-white/40">Charity not found.</div>
    </div>
  );

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Back */}
        <Link to="/charities" className="flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors w-fit">
          <ArrowLeft className="w-4 h-4" /> All Charities
        </Link>

        {/* Hero */}
        <div className="glass-panel p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-brand-900/50 border border-brand-700/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {charity.logo
                ? <img src={charity.logo} alt={charity.name} className="w-full h-full object-cover" />
                : <Heart className="w-10 h-10 text-brand-400" />}
            </div>
            <div className="flex-1">
              {charity.isFeatured && <div className="badge-gold mb-2 w-fit text-xs">Featured Charity</div>}
              <h1 className="font-display font-bold text-3xl text-white mb-1">{charity.name}</h1>
              <div className="flex items-center gap-4 text-sm text-white/50 mb-4">
                <span className="badge-gray capitalize">{charity.category}</span>
                {charity.website && (
                  <a href={charity.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-brand-400 hover:text-brand-300 transition-colors">
                    <Globe className="w-3.5 h-3.5" /> Website
                  </a>
                )}
                {charity.registrationNumber && (
                  <span>Reg: {charity.registrationNumber}</span>
                )}
              </div>
              {charity.totalReceived > 0 && (
                <div className="text-brand-400 font-semibold">
                  €{(charity.totalReceived / 100).toFixed(0)} raised through GolfCharity
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Description */}
          <div className="md:col-span-2 space-y-4">
            <div className="glass-panel p-6">
              <h2 className="font-display font-bold text-white text-lg mb-3">About</h2>
              <p className="text-white/60 leading-relaxed">{charity.description}</p>
            </div>

            {/* Images */}
            {charity.images?.length > 0 && (
              <div className="glass-panel p-6">
                <h2 className="font-display font-bold text-white text-lg mb-3">Gallery</h2>
                <div className="grid grid-cols-2 gap-3">
                  {charity.images.slice(0, 4).map((img, i) => (
                    <img key={i} src={img} alt="" className="w-full h-40 object-cover rounded-xl" />
                  ))}
                </div>
              </div>
            )}

            {/* Events */}
            {charity.events?.length > 0 && (
              <div className="glass-panel p-6">
                <h2 className="font-display font-bold text-white text-lg mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-brand-400" /> Upcoming Events
                </h2>
                <div className="space-y-3">
                  {charity.events.filter(e => new Date(e.date) >= new Date()).map((event, i) => (
                    <div key={i} className="p-4 rounded-xl bg-white/4 border border-white/8">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-semibold text-white text-sm">{event.title}</h4>
                          {event.location && <p className="text-xs text-white/40 mt-0.5">{event.location}</p>}
                          {event.description && <p className="text-xs text-white/50 mt-2">{event.description}</p>}
                        </div>
                        <div className="text-xs text-brand-400 whitespace-nowrap">{format(new Date(event.date), 'dd MMM yyyy')}</div>
                      </div>
                      {event.link && (
                        <a href={event.link} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-400 hover:text-brand-300 mt-2 inline-block">Learn more →</a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Select widget */}
          <div>
            <div className="glass-panel p-6 sticky top-24">
              <h3 className="font-display font-bold text-white text-lg mb-4">Support This Charity</h3>

              {isSelected ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-brand-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Check className="w-6 h-6 text-brand-400" />
                  </div>
                  <p className="text-brand-400 font-semibold mb-1">Currently selected</p>
                  <p className="text-white/40 text-sm">{user?.charityPercentage}% of your subscription goes here</p>
                </div>
              ) : (
                <>
                  <p className="text-white/50 text-sm mb-4 leading-relaxed">
                    Choose this charity to receive a portion of your monthly subscription fee.
                  </p>

                  <div className="mb-4">
                    <label className="label">Contribution percentage</label>
                    <div className="flex items-center gap-3">
                      <input type="range" min="10" max="100" step="5" value={pct} onChange={e => setPct(Number(e.target.value))} className="flex-1 accent-brand-500" />
                      <span className="text-brand-400 font-bold w-12 text-right">{pct}%</span>
                    </div>
                    <p className="text-xs text-white/30 mt-1">Minimum 10% required</p>
                  </div>

                  {isSubscribed ? (
                    <button onClick={handleSelect} disabled={selecting} className="btn-primary w-full flex items-center justify-center gap-2">
                      <Heart className="w-4 h-4" /> {selecting ? 'Selecting...' : 'Select This Charity'}
                    </button>
                  ) : (
                    <div>
                      <Link to="/subscribe" className="btn-primary w-full text-center block mb-3">Subscribe to Choose</Link>
                      <p className="text-xs text-white/30 text-center">Active subscription required</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
