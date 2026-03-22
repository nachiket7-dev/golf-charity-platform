import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Heart, Zap, ArrowRight, Star, Users, DollarSign, CheckCircle } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import api from '../utils/api';

const NUMBERS = [7, 14, 22, 31, 38];

function AnimatedNumber({ n, delay }) {
  return (
    <div
      className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-brand-600/40 to-brand-800/40 border border-brand-500/40 flex items-center justify-center ball-drop font-display font-bold text-2xl text-brand-300"
      style={{ animationDelay: `${delay}ms` }}
    >
      {n}
    </div>
  );
}

function StatCard({ value, label, icon: Icon, color }) {
  return (
    <div className="glass-panel p-6 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <div className="text-2xl font-display font-bold text-white">{value}</div>
        <div className="text-sm text-white/50">{label}</div>
      </div>
    </div>
  );
}

const HOW_IT_WORKS = [
  { step: '01', title: 'Subscribe', desc: 'Choose a monthly or yearly plan and join thousands of members making an impact through golf.', icon: Zap },
  { step: '02', title: 'Enter Your Scores', desc: 'Log your last 5 Stableford golf scores. The system keeps only your 5 most recent rounds.', icon: Trophy },
  { step: '03', title: 'Monthly Draw', desc: 'Your scores are entered into a monthly draw. Match 3, 4, or all 5 numbers to win prize money.', icon: Star },
  { step: '04', title: 'Give Back', desc: 'A portion of every subscription goes directly to your chosen charity. Golf with purpose.', icon: Heart },
];

const PRIZES = [
  { match: '5 Numbers', pool: '40%', badge: 'Jackpot', color: 'from-gold-500/20 to-gold-700/10 border-gold-500/30', textColor: 'text-gold-400', rollover: true },
  { match: '4 Numbers', pool: '35%', badge: 'Second Prize', color: 'from-brand-600/20 to-brand-800/10 border-brand-500/30', textColor: 'text-brand-400', rollover: false },
  { match: '3 Numbers', pool: '25%', badge: 'Third Prize', color: 'from-white/8 to-white/3 border-white/15', textColor: 'text-white/70', rollover: false },
];

export default function HomePage() {
  const [latestDraw, setLatestDraw] = useState(null);
  const [charities, setCharities] = useState([]);
  const heroRef = useRef(null);

  useEffect(() => {
    api.get('/draws/latest').then(r => setLatestDraw(r.data.draw)).catch(() => {});
    api.get('/charities?featured=true').then(r => setCharities(r.data.charities?.slice(0, 3) || [])).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />

      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-600/8 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gold-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left copy */}
            <div className="page-enter">
              <div className="badge-green mb-6 w-fit">
                <Heart className="w-3 h-3" /> Charity-First Golf Platform
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white leading-[1.05] mb-6">
                Play Golf.<br />
                <span className="text-brand-400">Win Prizes.</span><br />
                Change Lives.
              </h1>
              <p className="text-xl text-white/60 leading-relaxed mb-8 max-w-lg">
                The world's first subscription golf platform where every round matters. Track your Stableford scores, enter monthly prize draws, and fund charities you believe in.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="btn-gold flex items-center justify-center gap-2 text-base">
                  Start Playing <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/draws" className="btn-secondary flex items-center justify-center gap-2 text-base">
                  See Latest Draw
                </Link>
              </div>
              {/* Trust badges */}
              <div className="flex items-center gap-6 mt-8 text-white/40 text-sm">
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-brand-500" /> Cancel anytime</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-brand-500" /> Secure payments</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-brand-500" /> 10% min. to charity</span>
              </div>
            </div>

            {/* Right — Draw card */}
            <div className="relative">
              <div className="glass-panel p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Latest Draw Numbers</div>
                    <div className="font-display font-bold text-white text-lg">
                      {latestDraw
                        ? `${new Date(0, latestDraw.month - 1).toLocaleString('default', { month: 'long' })} ${latestDraw.year}`
                        : 'Monthly Draw'}
                    </div>
                  </div>
                  <div className="badge-gold"><Trophy className="w-3 h-3" /> Live Results</div>
                </div>

                {/* Numbers */}
                <div className="flex gap-3 mb-6">
                  {(latestDraw?.winningNumbers || NUMBERS).map((n, i) => (
                    <AnimatedNumber key={i} n={n} delay={i * 120} />
                  ))}
                </div>

                {/* Prize tiers */}
                <div className="space-y-3">
                  {PRIZES.map(({ match, pool, badge, color, textColor, rollover }) => (
                    <div key={match} className={`flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r ${color} border`}>
                      <div className="flex items-center gap-3">
                        <div className={`text-sm font-bold ${textColor}`}>{match}</div>
                        {rollover && <span className="text-xs bg-gold-900/40 text-gold-400 border border-gold-700/30 px-1.5 py-0.5 rounded-md">Jackpot Rollover</span>}
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-bold ${textColor}`}>{pool} of pool</div>
                        <div className="text-xs text-white/30">{badge}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <Link to="/subscribe" className="btn-primary w-full text-center mt-6 block">
                  Join Next Draw — from €19.99/mo
                </Link>
              </div>

              {/* Floating charity badge */}
              <div className="absolute -bottom-4 -left-4 glass-panel px-4 py-3 flex items-center gap-2.5 shadow-xl">
                <div className="w-8 h-8 bg-brand-700/50 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-brand-400" />
                </div>
                <div>
                  <div className="text-xs text-white/50">This month's charity</div>
                  <div className="text-sm font-semibold text-white">€{latestDraw?.totalCharityContributions ? (latestDraw.totalCharityContributions / 100).toFixed(0) : '2,400'}+ donated</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard value="2,800+" label="Active Members" icon={Users} color="bg-brand-900/50 text-brand-400" />
            <StatCard value="€48K+" label="Total Prize Pool" icon={Trophy} color="bg-gold-900/40 text-gold-400" />
            <StatCard value="€12K+" label="Charity Donated" icon={Heart} color="bg-pink-900/30 text-pink-400" />
            <StatCard value="24" label="Charities Supported" icon={DollarSign} color="bg-blue-900/30 text-blue-400" />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="badge-green mx-auto mb-4 w-fit">Simple Process</div>
            <h2 className="section-title">How GolfCharity Works</h2>
            <p className="section-sub mx-auto text-center">Four steps from signup to making a difference</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map(({ step, title, desc, icon: Icon }, i) => (
              <div key={step} className="card p-6 relative group hover:border-brand-700/40 transition-all duration-300">
                <div className="absolute top-4 right-4 text-4xl font-display font-bold text-white/5 group-hover:text-white/8 transition-colors">
                  {step}
                </div>
                <div className="w-12 h-12 bg-brand-900/60 border border-brand-700/40 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-brand-400" />
                </div>
                <h3 className="font-display font-bold text-white text-lg mb-2">{title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
                {i < 3 && (
                  <ArrowRight className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 text-brand-700/60 hidden lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Charities */}
      {charities.length > 0 && (
        <section className="py-24 border-t border-white/8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <div>
                <div className="badge-green mb-4 w-fit">Giving Back</div>
                <h2 className="section-title">Featured Charities</h2>
                <p className="section-sub">Your subscription directly funds causes that matter</p>
              </div>
              <Link to="/charities" className="hidden md:flex items-center gap-2 text-brand-400 hover:text-brand-300 font-medium transition-colors">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {charities.map(charity => (
                <Link key={charity._id} to={`/charities/${charity.slug}`} className="card-hover p-6 group block">
                  <div className="w-12 h-12 rounded-xl bg-brand-900/50 border border-brand-700/30 flex items-center justify-center mb-4 overflow-hidden">
                    {charity.logo
                      ? <img src={charity.logo} alt={charity.name} className="w-full h-full object-cover rounded-xl" />
                      : <Heart className="w-6 h-6 text-brand-400" />}
                  </div>
                  <div className="badge-gray mb-3 w-fit capitalize">{charity.category}</div>
                  <h3 className="font-display font-bold text-white text-lg mb-2 group-hover:text-brand-300 transition-colors">{charity.name}</h3>
                  <p className="text-white/50 text-sm leading-relaxed line-clamp-3">{charity.shortDescription || charity.description}</p>
                  <div className="mt-4 flex items-center gap-2 text-brand-400 text-sm font-medium">
                    Learn more <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="glass-panel p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-600/10 to-transparent pointer-events-none" />
            <h2 className="section-title mb-4 relative z-10">Ready to Play for Good?</h2>
            <p className="section-sub mx-auto text-center mb-8 relative z-10">
              Join thousands of golfers who are winning prizes and funding charities every month.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <Link to="/register" className="btn-gold flex items-center justify-center gap-2 text-base">
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/charities" className="btn-secondary flex items-center justify-center gap-2 text-base">
                <Heart className="w-4 h-4" /> Browse Charities
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
