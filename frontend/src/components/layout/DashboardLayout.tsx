import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { User, Package, Heart, LogOut, Shield } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../../contexts/AuthContext';

export default function DashboardLayout() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Profile Details', path: '/profile', icon: User },
    { name: 'My Advertisements', path: '/profile/ads', icon: Package },
    { name: 'Saved Favorites', path: '/profile/saved', icon: Heart },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';
  const displayRole = profile?.role || 'user';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="md:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 text-center">
              <div className="w-20 h-20 bg-brand text-white rounded-full mx-auto flex items-center justify-center text-3xl font-black mb-3 shadow-md">
                {initial}
              </div>
              <h2 className="font-bold text-gray-900 text-lg line-clamp-1">{displayName}</h2>
              <p className="text-xs text-gray-500 mb-2">{profile?.city || 'Hosur, Tamil Nadu'}</p>
              
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                displayRole === 'admin' ? 'bg-purple-100 text-purple-800' :
                displayRole === 'seller' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
              }`}>
                {displayRole}
              </span>
            </div>
            
            <nav className="p-3 space-y-1">
              {isAdmin && (
                <NavLink
                  to="/admin"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors mb-2"
                >
                  <Shield className="h-5 w-5 text-purple-600" />
                  Admin Console
                </NavLink>
              )}

              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === '/profile'}
                  className={({ isActive }) => clsx(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-brand text-white shadow-sm" 
                      : "text-gray-600 hover:bg-gray-50 hover:text-brand"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </NavLink>
              ))}
              
              <div className="pt-4 mt-4 border-t border-gray-100">
                <button 
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </button>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
