import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Trophy, Heart, LayoutDashboard, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout, isAdmin, isSubscribed } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setOpen(false); setDropdownOpen(false); }, [location]);

  const handleLogout = () => { logout(); navigate('/'); };

  const navLinks = [
    { to: '/charities', label: 'Charities', icon: Heart },
    { to: '/draws', label: 'Draws', icon: Trophy },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/10' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center group-hover:bg-brand-500 transition-colors">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-white text-lg">Golf<span className="text-brand-400">Charity</span></span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname.startsWith(to)
                  ? 'text-brand-400 bg-brand-900/40'
                  : 'text-white/70 hover:text-white hover:bg-white/8'
              }`}>
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {!isSubscribed && (
                  <Link to="/subscribe" className="btn-primary text-sm py-2">Subscribe</Link>
                )}
                {/* Avatar dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/8 border border-white/10 hover:bg-white/12 transition-all"
                  >
                    <div className="w-7 h-7 rounded-full bg-brand-700 flex items-center justify-center text-xs font-bold text-brand-200">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-white/80 max-w-[100px] truncate">{user.name}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-white/50" />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 glass-panel py-1 shadow-xl">
                      <Link to="/dashboard" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/8 transition-colors">
                        <LayoutDashboard className="w-4 h-4 text-brand-400" /> Dashboard
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/8 transition-colors">
                          <Settings className="w-4 h-4 text-gold-400" /> Admin Panel
                        </Link>
                      )}
                      <div className="border-t border-white/10 my-1" />
                      <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-white/8 transition-colors">
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-white/70 hover:text-white px-4 py-2 transition-colors">Sign in</Link>
                <Link to="/register" className="btn-primary text-sm py-2">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/10 px-4 py-4 space-y-1">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/8 transition-colors">
              <Icon className="w-4 h-4" /> {label}
            </Link>
          ))}
          {user ? (
            <>
              <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/8 transition-colors">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              {isAdmin && (
                <Link to="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/8 transition-colors">
                  <Settings className="w-4 h-4" /> Admin
                </Link>
              )}
              {!isSubscribed && (
                <Link to="/subscribe" className="btn-primary w-full text-center mt-2">Subscribe Now</Link>
              )}
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-white/8 transition-colors mt-2">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </>
          ) : (
            <div className="flex gap-3 mt-2">
              <Link to="/login" className="btn-secondary flex-1 text-center text-sm py-2.5">Sign in</Link>
              <Link to="/register" className="btn-primary flex-1 text-center text-sm py-2.5">Get Started</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
