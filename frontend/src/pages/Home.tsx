import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, ChevronRight, Sparkles, ShieldCheck, Tag, PlusCircle, Package } from 'lucide-react';
import * as Icons from 'lucide-react';
import AdCard from '../components/ui/AdCard';
import { supabase } from '../lib/supabase';
import { getDeletedAdIds, purgeDeletedAndStaleLocalAds } from '../utils/adStorage';

interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  count: number;
}

interface AdItem {
  id: string;
  title: string;
  price: string;
  location: string;
  image: string;
  category: string;
  postedAt: string;
}

const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'vehicles', name: 'Vehicles & Bikes', icon: 'Car', count: 620 },
  { id: 'property', name: 'Houses & Properties', icon: 'Building2', count: 850 },
  { id: 'mobiles', name: 'Mobiles & Tech', icon: 'Smartphone', count: 740 },
  { id: 'electronics', name: 'Electronics & Appliances', icon: 'Tv', count: 590 },
  { id: 'jobs', name: 'Jobs & Careers', icon: 'Briefcase', count: 1240 },
  { id: 'business', name: 'Business', icon: 'Store', count: 210 },
  { id: 'services', name: 'Local Services', icon: 'Wrench', count: 420 },
  { id: 'buy-sell', name: 'Buy & Sell', icon: 'ShoppingBag', count: 980 },
  { id: 'furniture', name: 'Home & Furniture', icon: 'Sofa', count: 460 },
  { id: 'commercial', name: 'Commercial & Industrial', icon: 'Factory', count: 320 },
  { id: 'community', name: 'Community', icon: 'Users', count: 85 },
];

const DEFAULT_HOME_LOCATIONS = [
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

const CATEGORY_COLOR_MAP: Record<string, { bg: string; text: string; ring: string }> = {
  vehicles: { bg: 'bg-indigo-500/10', text: 'text-indigo-600', ring: 'group-hover:border-indigo-500' },
  property: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', ring: 'group-hover:border-emerald-500' },
  mobiles: { bg: 'bg-blue-500/10', text: 'text-blue-600', ring: 'group-hover:border-blue-500' },
  electronics: { bg: 'bg-amber-500/10', text: 'text-amber-600', ring: 'group-hover:border-amber-500' },
  jobs: { bg: 'bg-purple-500/10', text: 'text-purple-600', ring: 'group-hover:border-purple-500' },
  business: { bg: 'bg-rose-500/10', text: 'text-rose-600', ring: 'group-hover:border-rose-500' },
  services: { bg: 'bg-cyan-500/10', text: 'text-cyan-600', ring: 'group-hover:border-cyan-500' },
  'buy-sell': { bg: 'bg-pink-500/10', text: 'text-pink-600', ring: 'group-hover:border-pink-500' },
  furniture: { bg: 'bg-orange-500/10', text: 'text-orange-600', ring: 'group-hover:border-orange-500' },
  commercial: { bg: 'bg-slate-500/10', text: 'text-slate-700', ring: 'group-hover:border-slate-500' },
  community: { bg: 'bg-teal-500/10', text: 'text-teal-600', ring: 'group-hover:border-teal-500' },
};

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Hosur');
  const [locations, setLocations] = useState<string[]>(DEFAULT_HOME_LOCATIONS);
  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);
  const [latestAds, setLatestAds] = useState<AdItem[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      try {
        // 1. Fetch real ads from Supabase & local storage
        let remoteAds = [];
        try {
          const { data: adsData, error: adsError } = await (supabase.from('ads') as any)
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);
          if (!adsError && Array.isArray(adsData)) {
            remoteAds = adsData.filter((a: any) => a.status !== 'deleted' && a.status !== 'archived');
          }
        } catch (e) {
          console.warn('Home ads fetch notice:', e);
        }

        // Filter out tombstoned deleted ads
        const deletedIds = getDeletedAdIds();
        remoteAds = remoteAds.filter((a: any) => !deletedIds.has(a.id) && (!a.slug || !deletedIds.has(a.slug)));

        // Purge stale local ads that were deleted in Supabase
        const liveRemoteIds = new Set(remoteAds.map((r: any) => r.id));
        const localAds = purgeDeletedAndStaleLocalAds(liveRemoteIds).filter((a: any) => 
          !deletedIds.has(a.id) && (!a.slug || !deletedIds.has(a.slug))
        );

        const mergedMap = new Map();
        localAds.forEach((ad: any) => {
          if (ad && (ad.id || ad.slug) && !deletedIds.has(ad.id)) {
            mergedMap.set(ad.id || ad.slug, ad);
          }
        });
        remoteAds.forEach((ad: any) => {
          if (ad && (ad.id || ad.slug) && !deletedIds.has(ad.id)) {
            mergedMap.set(ad.id || ad.slug, ad);
          }
        });

        const combinedList = Array.from(mergedMap.values());
        if (combinedList.length > 0) {
          const mappedAds: AdItem[] = combinedList.slice(0, 8).map((item: any) => {
            let lType = (item.listing_type || '').toLowerCase();
            if (!lType && item.description) {
              if (/Listing Type:\s*Rent/i.test(item.description) || /per day|per month/i.test(item.description)) {
                lType = 'rent';
              } else if (/Listing Type:\s*Sell New/i.test(item.description)) {
                lType = 'new';
              }
            }
            const priceVal = Number(item.price || 0);
            let displayPrice = `₹${priceVal.toLocaleString()}`;
            if (lType === 'free') {
              displayPrice = 'FREE';
            } else if (item.price_text) {
              displayPrice = item.price_text;
            } else if (lType === 'rent') {
              const period = (item.attributes?.rent_period || 'Month').replace(/^Per\s+/i, '');
              displayPrice = `₹${priceVal.toLocaleString()} / ${period}`;
            }

            return {
              id: item.id || item.slug,
              title: item.title,
              price: displayPrice,
              location: item.location_name || item.location_text || 'Hosur',
              image: item.images?.[0] || 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=500',
              category: item.category_id || 'General',
              postedAt: item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recently',
            };
          });
          setLatestAds(mappedAds);
        }

        // 2. Fetch categories and calculate live counts across all listings
        const { data: allAdsCount } = await (supabase.from('ads') as any)
          .select('category_id')
          .neq('status', 'deleted');

        const { data: catData } = await (supabase.from('categories') as any)
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (catData && catData.length > 0) {
          const updated = catData.map((c: any) => {
            const count = allAdsCount?.filter((a: any) => a.category_id === c.id).length || 0;
            return {
              id: c.id,
              name: c.name,
              icon: c.icon || 'Tag',
              count,
            };
          });
          setCategories(updated);
        }

        // 3. Fetch live locations from Supabase
        const { data: locData } = await (supabase.from('locations') as any)
          .select('name')
          .eq('is_active', true)
          .order('name', { ascending: true });

        if (locData && locData.length > 0) {
          const names = locData.map((l: any) => l.name);
          setLocations(names);
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleLocationChange = (newLoc: string) => {
    setSelectedLocation(newLoc);
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set('q', searchTerm.trim());
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
    if (searchTerm.trim()) params.set('q', searchTerm.trim());
    if (selectedLocation && selectedLocation !== 'Hosur') {
      params.set('location', selectedLocation);
    } else if (selectedLocation === 'Hosur') {
      params.set('location', 'Hosur');
    }
    navigate(`/browse?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-16 pb-20">
      {/* Premium Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-slate-50 to-slate-50 pt-16 pb-16 border-b border-slate-200/50">
        {/* Subtle Ambient Radial Glow Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-blue-400/10 via-indigo-400/10 to-teal-400/10 blur-3xl pointer-events-none rounded-full" />

        <div className="container relative mx-auto px-4 text-center">
          {/* Badge Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-blue-700 text-xs font-black mb-6 border border-blue-100 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Hosur's Premier Local Classifieds & Marketplace</span>
          </div>
          
          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight mb-5 leading-tight max-w-4xl mx-auto">
            Find, Buy & Sell Everything <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 bg-clip-text text-transparent">
              Locally in Hosur
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
            Connect directly with verified locals in SIPCOT, Mathigiri, Bagalur Road, and across Hosur for jobs, rentals, vehicles, and services.
          </p>
          
          {/* Main Search Bar Island */}
          <form 
            onSubmit={handleSearch} 
            className="max-w-3xl mx-auto bg-white/95 backdrop-blur-xl p-2 sm:p-2.5 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 flex flex-col sm:flex-row items-center gap-2.5 transition-all focus-within:shadow-2xl focus-within:border-blue-400"
          >
            {/* Location Selector */}
            <div className="flex w-full sm:w-2/5 items-center gap-2 px-3.5 py-2.5 bg-slate-50/90 rounded-2xl border border-slate-200/70 text-slate-700">
              <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <select 
                value={selectedLocation}
                onChange={(e) => handleLocationChange(e.target.value)}
                className="bg-transparent w-full outline-none text-xs sm:text-sm font-bold cursor-pointer text-slate-800 truncate"
              >
                <option value="Hosur">All Hosur Areas</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Search Input */}
            <div className="flex-1 w-full flex items-center gap-2 px-3.5 py-2.5 bg-slate-50/90 rounded-2xl border border-slate-200/70 focus-within:bg-white focus-within:border-blue-500 transition-all">
              <Search className="h-4 w-4 text-slate-400 flex-shrink-0" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search jobs, bikes, flats, mobile phones..." 
                className="w-full bg-transparent outline-none text-xs sm:text-sm placeholder:text-slate-400 font-medium text-slate-900"
              />
            </div>
            
            {/* Submit Button */}
            <button 
              type="submit" 
              className="w-full sm:w-auto btn btn-primary py-3.5 px-8 rounded-2xl text-sm uppercase tracking-wider font-black shadow-md hover:scale-102 transition-transform"
            >
              Search
            </button>
          </form>
          
          {/* Trending Tags */}
          <div className="mt-8 flex flex-wrap justify-center items-center gap-2 text-xs text-slate-500 font-semibold">
            <span className="font-extrabold text-slate-700 flex items-center gap-1">
              <Tag className="h-3.5 w-3.5 text-blue-600" /> Popular in Hosur:
            </span>
            <Link to="/category/jobs" className="px-3 py-1 rounded-full bg-white border border-slate-200/80 hover:border-blue-400 hover:text-blue-600 transition-all shadow-2xs">
              Industrial Jobs
            </Link>
            <Link to="/category/property" className="px-3 py-1 rounded-full bg-white border border-slate-200/80 hover:border-blue-400 hover:text-blue-600 transition-all shadow-2xs">
              Houses for Rent
            </Link>
            <Link to="/category/vehicles" className="px-3 py-1 rounded-full bg-white border border-slate-200/80 hover:border-blue-400 hover:text-blue-600 transition-all shadow-2xs">
              Second-Hand Bikes
            </Link>
            <Link to="/category/services" className="px-3 py-1 rounded-full bg-white border border-slate-200/80 hover:border-blue-400 hover:text-blue-600 transition-all shadow-2xs">
              Home Services
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Badges Banner */}
      <section className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">100% Verified Hosur Ads</h4>
              <p className="text-xs text-slate-500 font-medium">Screened listings from real local people</p>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Direct WhatsApp Chat</h4>
              <p className="text-xs text-slate-500 font-medium">Connect instantly without middleman fees</p>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Hosur & SIPCOT Focused</h4>
              <p className="text-xs text-slate-500 font-medium">Tailored for our local township community</p>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Categories Grid */}
      <section className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-widest text-blue-600 mb-1">Browse by Sector</div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Explore Categories</h2>
          </div>
          <Link to="/browse" className="text-xs sm:text-sm font-extrabold text-blue-600 hover:text-blue-700 flex items-center gap-1 group">
            <span>View All Categories</span>
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((category) => {
            const Icon = (Icons as any)[category.icon] || Tag;
            const style = CATEGORY_COLOR_MAP[category.id] || { bg: 'bg-blue-50', text: 'text-blue-600', ring: 'group-hover:border-blue-400' };

            return (
              <Link 
                key={category.id} 
                to={`/category/${category.id}`}
                className={`group flex flex-col items-center justify-center p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-card-hover ${style.ring} hover:-translate-y-1 transition-all duration-200`}
              >
                <div className={`w-12 h-12 rounded-2xl ${style.bg} ${style.text} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200 shadow-2xs`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xs sm:text-sm font-black text-slate-900 text-center mb-0.5 group-hover:text-blue-600 transition-colors">
                  {category.name}
                </h3>
                <span className="text-[11px] text-slate-400 font-bold">{category.count} listings</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Fresh Recommendations Listings */}
      <section className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 mb-1">Live in Hosur</div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Fresh Recommendations</h2>
          </div>
          <Link to="/browse" className="text-xs sm:text-sm font-extrabold text-blue-600 hover:text-blue-700 flex items-center gap-1 group">
            <span>Explore All Ads</span>
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="bg-slate-100 animate-pulse rounded-2xl h-80" />
            ))}
          </div>
        ) : latestAds.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestAds.map(ad => (
              <AdCard key={ad.id} ad={ad} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center max-w-xl mx-auto shadow-xs">
            <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-black text-slate-900 mb-1">No active listings yet</h3>
            <p className="text-xs text-slate-500 mb-6 font-medium">
              Be the first in Hosur to post a classified advertisement on URGENIE!
            </p>
            <Link to="/post-ad" className="btn btn-primary px-6 py-2.5 inline-flex items-center gap-2 text-xs uppercase font-extrabold">
              <PlusCircle className="h-4 w-4" /> Post Free Ad
            </Link>
          </div>
        )}
      </section>
      
      {/* Luxury Call to Action Banner */}
      <section className="container mx-auto px-4">
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl overflow-hidden shadow-2xl text-white relative border border-white/10">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="px-8 py-12 md:px-16 md:py-16 flex flex-col md:flex-row items-center justify-between relative z-10 gap-8">
            <div className="text-center md:text-left max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-300 text-xs font-bold mb-3 border border-white/10">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Zero Listing Fees &bull; Instant WhatsApp Reach</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black mb-3 tracking-tight">Have something to sell or offer in Hosur?</h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Post your classified ad on URGENIE in under 2 minutes and connect with genuine local buyers and service seekers.
              </p>
            </div>
            
            <div className="flex-shrink-0">
              <Link 
                to="/post-ad" 
                className="btn bg-white text-slate-900 hover:bg-slate-100 text-sm uppercase tracking-wider px-8 py-4 font-black rounded-2xl shadow-xl hover:scale-105 transition-transform inline-flex items-center gap-2"
              >
                <PlusCircle className="h-4 w-4 text-blue-600" />
                <span>Post Free Ad Now</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
