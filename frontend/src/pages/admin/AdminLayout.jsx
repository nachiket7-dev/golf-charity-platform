import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Trophy, Heart, Medal, LogOut, Trophy as Logo } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/draws', label: 'Draws', icon: Trophy },
  { to: '/admin/charities', label: 'Charities', icon: Heart },
  { to: '/admin/winners', label: 'Winners', icon: Medal },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen gradient-bg flex">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 bg-black/40 border-r border-white/10 flex flex-col fixed top-0 bottom-0 left-0 z-40">
        {/* Logo */}
        <div className="flex items-center gap-2 p-6 border-b border-white/10">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <Logo className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-display font-bold text-white text-sm">GolfCharity</div>
            <div className="text-xs text-gold-400">Admin Panel</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  isActive
                    ? 'bg-brand-900/60 text-brand-300 border border-brand-700/40'
                    : 'text-white/60 hover:text-white hover:bg-white/8'
                }`
              }
            >
              <Icon className="w-4 h-4" /> {label}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-gold-800/60 flex items-center justify-center text-xs font-bold text-gold-300">
              {user?.name?.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="text-sm text-white font-medium truncate">{user?.name}</div>
              <div className="text-xs text-gold-400">Administrator</div>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-900/20 transition-colors">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-60 p-8 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
