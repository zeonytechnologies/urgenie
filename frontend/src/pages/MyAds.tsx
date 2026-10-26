import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Eye, PlusCircle, CheckCircle, ExternalLink, RefreshCw, AlertCircle, RotateCcw } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { removeAdFromLocalStorage, getDeletedAdIds, purgeDeletedAndStaleLocalAds, getLocalAds, updateAdStatusInLocalStorage } from '../utils/adStorage';

interface AdItem {
  id: string;
  title: string;
  price: string;
  image: string;
  status: string;
  created_at: string;
  views_count?: number;
}

function getInitialUserAds(user: any, profile: any): AdItem[] {
  if (!user) return [];
  const local = getLocalAds();
  const deletedIds = getDeletedAdIds();
  const userLocalAds = local.filter((a: any) => 
    (a.user_id === user.id || a.contact_phone === profile?.phone || a.user_id === 'd12fc73e-2b3c-4371-b22c-ce3181ec864a') &&
    !deletedIds.has(a.id) &&
    (!a.slug || !deletedIds.has(a.slug))
  );

  return userLocalAds.map((item: any) => ({
    id: item.id || item.slug,
    title: item.title,
    price: item.listing_type === 'free' ? 'FREE' : `₹${Number(item.price || 0).toLocaleString()}`,
    image: item.images?.[0] || 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=500',
    status: item.status || 'active',
    created_at: item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recently',
    views_count: item.views_count || 0,
  }));
}

export default function MyAds() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('active');
  const [ads, setAds] = useState<AdItem[]>(() => getInitialUserAds(user, profile));
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const tabs = ['active', 'pending', 'sold'];

  const fetchUserAds = async () => {
    setActionError(null);
    try {
      if (!user) {
        setAds([]);
        setLoading(false);
        return;
      }

      let query = (supabase.from('ads') as any).select('*');
      if (profile?.phone) {
        query = query.or(`user_id.eq.${user.id},contact_phone.eq.${profile.phone}`);
      } else {
        query = query.eq('user_id', user.id);
      }

      let remoteAds: any[] = [];
      let remoteFetchSucceeded = false;
      try {
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1000));
        const res: any = await Promise.race([query.order('created_at', { ascending: false }), timeoutPromise]);
        if (res && !res.error && Array.isArray(res.data)) {
          remoteAds = res.data;
          remoteFetchSucceeded = true;
        }
      } catch (e) {}

      // Get tombstone deleted ad IDs
      const deletedIds = getDeletedAdIds();

      // Live remote IDs
      const liveRemoteIds = new Set(remoteAds.map((r: any) => r.id));

      // Purge stale local ads that were deleted in Supabase ONLY IF remote fetch succeeded
      const validLocal = purgeDeletedAndStaleLocalAds(liveRemoteIds, remoteFetchSucceeded);
      const userLocalAds = validLocal.filter((a: any) => 
        (a.user_id === user.id || a.contact_phone === profile?.phone || a.user_id === 'd12fc73e-2b3c-4371-b22c-ce3181ec864a') &&
        !deletedIds.has(a.id) &&
        (!a.slug || !deletedIds.has(a.slug))
      );

      const mergedMap = new Map();
      userLocalAds.forEach((item: any) => {
        if (item && (item.id || item.slug) && !deletedIds.has(item.id)) {
          mergedMap.set(item.id || item.slug, item);
        }
      });
      remoteAds.forEach((item: any) => {
        if (item && (item.id || item.slug) && !deletedIds.has(item.id)) {
          mergedMap.set(item.id || item.slug, item);
        }
      });

      const combinedList = Array.from(mergedMap.values());
      setAds(combinedList.map((item: any) => ({
        id: item.id || item.slug,
        title: item.title,
        price: item.listing_type === 'free' ? 'FREE' : `₹${Number(item.price || 0).toLocaleString()}`,
        image: item.images?.[0] || 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=500',
        status: item.status || 'active',
        created_at: item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recently',
        views_count: item.views_count || 0,
      })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserAds();
  }, [user]);

  const handleMarkSold = async (id: string) => {
    try {
      updateAdStatusInLocalStorage(id, 'sold');
      setAds(prev => prev.map(a => a.id === id ? { ...a, status: 'sold' } : a));
      const { error } = await (supabase.from('ads') as any).update({ status: 'sold' }).eq('id', id);
      if (error) {
        console.warn('Status update warning:', error.message);
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to update ad status');
    }
  };

  const handleMarkActive = async (id: string) => {
    try {
      updateAdStatusInLocalStorage(id, 'active');
      setAds(prev => prev.map(a => a.id === id ? { ...a, status: 'active' } : a));
      const { error } = await (supabase.from('ads') as any).update({ status: 'active' }).eq('id', id);
      if (error) {
        console.warn('Status update warning:', error.message);
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to reactivate ad');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this listing?')) return;
    try {
      setAds(prev => prev.filter(a => a.id !== id));
      // Remove from localStorage and add to deleted tombstone list
      removeAdFromLocalStorage(id);
      const { error } = await (supabase.from('ads') as any).delete().eq('id', id);
      if (error) {
        console.warn('Delete warning:', error.message);
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete ad');
    }
  };

  const filteredAds = ads.filter(ad => ad.status === activeTab);

  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">My Advertisements</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage and track your live listings in Hosur</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchUserAds} 
            className="p-2.5 text-gray-500 hover:text-brand bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors" 
            title="Refresh listings"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-brand' : ''}`} />
          </button>
          <Link to="/post-ad" className="btn btn-primary px-4 py-2.5 text-sm gap-2 font-bold shadow-sm">
            <PlusCircle className="h-4 w-4" /> Post New Ad
          </Link>
        </div>
      </div>

      {actionError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}
      
      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-gray-200 mb-6 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              "px-6 py-3 text-sm font-bold capitalize whitespace-nowrap border-b-2 transition-colors",
              activeTab === tab 
                ? "border-brand text-brand" 
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            {tab} ({ads.filter(a => a.status === tab).length})
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-16 text-center text-gray-400">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-3 text-brand" />
          <p className="text-sm font-medium">Loading your listings from database...</p>
        </div>
      )}

      {/* Ads List */}
      {!loading && (
        <div className="space-y-4">
          {filteredAds.map((ad) => (
            <div key={ad.id} className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-100 rounded-2xl hover:border-brand-light hover:shadow-sm transition-all group bg-white">
              <div className="w-full sm:w-36 h-28 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                <img src={ad.image} alt={ad.title} className="w-full h-full object-cover" />
              </div>
              
              <div className="flex-1 flex flex-col justify-between py-1">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-bold text-gray-900 line-clamp-1">{ad.title}</h3>
                    <p className="font-black text-brand text-lg mt-1">{ad.price}</p>
                  </div>
                  
                  <span className={clsx(
                    "px-2.5 py-0.5 rounded-full text-xs font-bold capitalize",
                    ad.status === 'active' ? "bg-green-100 text-green-700" : 
                    ad.status === 'pending' ? "bg-amber-100 text-amber-700" : 
                    "bg-gray-100 text-gray-700"
                  )}>
                    {ad.status}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center justify-between mt-4 border-t border-gray-50 pt-3 gap-2">
                  <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                    <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {ad.views_count || 0} Views</span>
                    <span>Listed: {ad.created_at}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/ad/${ad.id}`}
                      className="p-1.5 text-gray-500 hover:text-brand bg-gray-50 hover:bg-brand-light/30 rounded-lg text-xs font-semibold flex items-center gap-1 px-2.5"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> View
                    </Link>

                    {ad.status === 'active' && (
                      <button
                        onClick={() => handleMarkSold(ad.id)}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg text-xs font-semibold flex items-center gap-1 px-2.5"
                      >
                        <CheckCircle className="h-3.5 w-3.5" /> Mark Sold
                      </button>
                    )}

                    {ad.status === 'sold' && (
                      <button
                        onClick={() => handleMarkActive(ad.id)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-semibold flex items-center gap-1 px-2.5"
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Reactivate
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(ad.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg text-xs font-semibold flex items-center gap-1 px-2.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {filteredAds.length === 0 && (
            <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-gray-500 font-medium mb-3">No {activeTab} advertisements found.</p>
              <Link to="/post-ad" className="btn btn-primary px-5 py-2 text-sm font-bold">
                Post an Ad Now
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
