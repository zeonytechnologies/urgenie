import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Menu, X, PlusCircle, User as UserIcon, Shield, LogOut, ChevronDown, Heart, Package } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import logoImg from '../../assets/img/logo.png';

const DEFAULT_NAV_LOCATIONS = [
  'Hosur Town Center',
  'SIPCOT Phase 1',
  'SIPCOT Phase 2',
  'Mathigiri',
  'Bagalur Road',
  'Denkanikottai Road',
  'Rayakottai Road',
  'Nallur',
  'Attibele Border',
  'Zuzuvadi'
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Hosur');
  const [locations, setLocations] = useState<string[]>(DEFAULT_NAV_LOCATIONS);
  const { user, profile, isAdmin, isSeller, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLiveLocations = async () => {
      try {
        const { data, error } = await (supabase.from('locations') as any)
          .select('name')
          .eq('is_active', true)
          .order('name', { ascending: true });
        
        if (!error && data && data.length > 0) {
          const names = data.map((l: any) => l.name);
          setLocations(names);
        }
      } catch (err) {
        console.warn('Navbar using default locations');
      }
    };
    fetchLiveLocations();
  }, []);

  const handleLocationChange = (newLoc: string) => {
    setSelectedLocation(newLoc);
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (newLoc && newLoc !== 'Hosur') {
      params.set('location', newLoc);
    } else if (newLoc === 'Hosur') {
      params.set('location', 'Hosur');
    }
    navigate(`/browse?${params.toString()}`);
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (selectedLocation && selectedLocation !== 'Hosur') {
      params.set('location', selectedLocation);
    } else if (selectedLocation === 'Hosur') {
      params.set('location', 'Hosur');
    }
    navigate(`/browse?${params.toString()}`);
  };

  const handleSignOut = async () => {
    await signOut();
    setIsDropdownOpen(false);
    navigate('/');
  };

  const userInitial = profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : (user?.email?.charAt(0).toUpperCase() || 'U');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/70 bg-white/90 backdrop-blur-xl transition-all shadow-xs">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex h-18 items-center justify-between gap-4">
          {/* Logo & Category Nav */}
          <div className="flex items-center gap-6 lg:gap-8">
            <Link to="/" className="flex items-center gap-2 group transition-transform duration-200 active:scale-95">
              <img src={logoImg} alt="URGENIE" className="h-10 w-auto object-contain max-w-[150px] transition-transform group-hover:scale-[1.02]" />
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link to="/browse" className="px-3 py-1.5 text-sm font-bold text-slate-600 hover:text-blue-600 hover:bg-slate-100/70 rounded-xl transition-all">
                Browse All
              </Link>
              <Link to="/category/jobs" className="px-3 py-1.5 text-sm font-bold text-slate-600 hover:text-blue-600 hover:bg-slate-100/70 rounded-xl transition-all">
                Jobs
              </Link>
              <Link to="/category/property" className="px-3 py-1.5 text-sm font-bold text-slate-600 hover:text-blue-600 hover:bg-slate-100/70 rounded-xl transition-all">
                Property
              </Link>
              <Link to="/category/vehicles" className="px-3 py-1.5 text-sm font-bold text-slate-600 hover:text-blue-600 hover:bg-slate-100/70 rounded-xl transition-all">
                Vehicles
              </Link>
            </nav>
          </div>

          {/* Search & Location (Desktop) */}
          <form onSubmit={handleSearch} className="hidden flex-1 items-center justify-center px-4 md:flex max-w-xl">
            <div className="flex w-full items-center rounded-2xl border border-slate-200 bg-slate-50/80 p-1 pl-3 shadow-xs focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
              <div className="flex items-center gap-1.5 border-r border-slate-200 pr-3 text-slate-500">
                <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <select
                  value={selectedLocation}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer max-w-[125px] truncate"
                >
                  <option value="Hosur">All Hosur</option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs, bikes, houses, services..." 
                className="w-full bg-transparent px-3 py-1 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
              />
              <button 
                type="submit" 
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm hover:from-blue-700 hover:to-indigo-700 transition-all active:scale-95"
                title="Search"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-full hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold flex items-center justify-center text-sm shadow-sm ring-2 ring-white">
                    {userInitial}
                  </div>
                  <div className="text-left hidden xl:block">
                    <div className="text-xs font-black text-slate-900 truncate max-w-[110px]">
                      {profile?.full_name || 'My Account'}
                    </div>
                    <div className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">
                      {profile?.role || 'Member'}
                    </div>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                {/* User Dropdown */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-[11px] text-slate-400 font-semibold">Signed in as</p>
                      <p className="text-xs font-bold text-slate-900 truncate">{profile?.email || user.email}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                        isAdmin ? 'bg-purple-100 text-purple-700' :
                        isSeller ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {profile?.role || 'User'}
                      </span>
                    </div>

                    {isAdmin && (
                      <Link 
                        to="/admin" 
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-purple-700 hover:bg-purple-50 transition-colors"
                      >
                        <Shield className="h-4 w-4 text-purple-600" />
                        Admin Dashboard
                      </Link>
                    )}

                    <Link 
                      to="/profile" 
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <UserIcon className="h-4 w-4 text-slate-400" />
                      My Profile
                    </Link>
                    <Link 
                      to="/profile/ads" 
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Package className="h-4 w-4 text-slate-400" />
                      My Advertisements
                    </Link>
                    <Link 
                      to="/profile/saved" 
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Heart className="h-4 w-4 text-slate-400" />
                      Saved Bookmarks
                    </Link>

                    <hr className="my-1.5 border-slate-100" />

                    <button 
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2.5 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5">
                <Link to="/login" className="px-3 py-2 text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-100/80 rounded-xl transition-all">
                  Sign In
                </Link>
                <Link to="/register" className="px-3.5 py-2 text-xs font-bold text-blue-600 bg-blue-50/90 hover:bg-blue-100/90 rounded-xl transition-all">
                  Register
                </Link>
              </div>
            )}

            <Link 
              to="/post-ad" 
              className="btn btn-primary gap-2 rounded-2xl px-5 py-2.5 shadow-md shadow-blue-600/20 text-xs uppercase tracking-wider font-extrabold hover:scale-102 transition-transform"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Post Free Ad</span>
            </Link>

            {/* Mobile Menu Toggle */}
            <button 
              className="lg:hidden p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle Navigation"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={clsx("lg:hidden border-t border-slate-200 bg-white/98 backdrop-blur-xl px-4 py-4 space-y-4", isMenuOpen ? "block" : "hidden")}>
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ads in Hosur..."
            className="input-field py-2 text-sm"
          />
          <button type="submit" className="btn btn-primary py-2 px-3">
            <Search className="h-4 w-4" />
          </button>
        </form>

        <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100">
          <Link to="/browse" onClick={() => setIsMenuOpen(false)} className="px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-xl">Browse All Ads</Link>
          <Link to="/category/jobs" onClick={() => setIsMenuOpen(false)} className="px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-xl">Jobs</Link>
          <Link to="/category/property" onClick={() => setIsMenuOpen(false)} className="px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-xl">Property</Link>
          <Link to="/category/vehicles" onClick={() => setIsMenuOpen(false)} className="px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-xl">Vehicles</Link>
          
          <hr className="border-slate-100 my-1" />
          
          {user ? (
            <>
              {isAdmin && (
                <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="px-3 py-2 text-sm font-bold text-purple-700 hover:bg-purple-50 rounded-xl flex items-center gap-2">
                  <Shield className="h-4 w-4" /> Admin Dashboard
                </Link>
              )}
              <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-xl">My Profile</Link>
              <Link to="/profile/ads" onClick={() => setIsMenuOpen(false)} className="px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-xl">My Ads</Link>
              <Link to="/profile/saved" onClick={() => setIsMenuOpen(false)} className="px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-xl">Saved Ads</Link>
              <button onClick={handleSignOut} className="px-3 py-2 text-left text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl">
                Sign Out
              </button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link to="/login" onClick={() => setIsMenuOpen(false)} className="btn btn-outline flex-1 justify-center py-2 text-xs font-bold">
                Sign In
              </Link>
              <Link to="/register" onClick={() => setIsMenuOpen(false)} className="btn btn-primary flex-1 justify-center py-2 text-xs font-bold">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
