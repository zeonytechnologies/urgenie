import { useState, useEffect } from 'react';
import { Heart, Trash2, ArrowRight, RefreshCw, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface SavedAdItem {
  id: string;
  ad_id: string;
  title: string;
  price: string;
  location: string;
  image: string;
}

export default function SavedAds() {
  const { user } = useAuth();
  const [savedAds, setSavedAds] = useState<SavedAdItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedAds = async () => {
    setLoading(true);
    try {
      // 1. Check local saved ids
      const localIds: string[] = JSON.parse(localStorage.getItem('urgenie_saved_ads') || '[]');
      
      let dbAds: any[] = [];

      if (user) {
        const { data: savedRows, error } = await (supabase.from('saved_ads') as any)
          .select('id, ad_id')
          .eq('user_id', user.id);

        if (!error && savedRows && savedRows.length > 0) {
          const adIds = savedRows.map((r: any) => r.ad_id);
          const { data: adDetails } = await (supabase.from('ads') as any)
            .select('*')
            .in('id', adIds);

          if (adDetails) {
            dbAds = adDetails.map((ad: any) => ({
              id: ad.id,
              ad_id: ad.id,
              title: ad.title,
              price: `₹${Number(ad.price || 0).toLocaleString()}`,
              location: ad.location_name || 'Hosur',
              image: ad.images?.[0] || 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=500',
            }));
          }
        }
      }

      // If no DB saved ads found but local IDs exist, fetch those
      if (dbAds.length === 0 && localIds.length > 0) {
        const { data: adDetails } = await (supabase.from('ads') as any)
          .select('*')
          .in('id', localIds);

        if (adDetails && adDetails.length > 0) {
          dbAds = adDetails.map((ad: any) => ({
            id: ad.id,
            ad_id: ad.id,
            title: ad.title,
            price: `₹${Number(ad.price || 0).toLocaleString()}`,
            location: ad.location_name || 'Hosur',
            image: ad.images?.[0] || 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=500',
          }));
        }
      }

      setSavedAds(dbAds);
    } catch (err) {
      console.error('Error fetching saved ads:', err);
      setSavedAds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedAds();
  }, [user]);

  const handleRemove = async (adId: string) => {
    setSavedAds(prev => prev.filter(ad => ad.ad_id !== adId && ad.id !== adId));
    
    // Remove from localStorage
    try {
      const local = JSON.parse(localStorage.getItem('urgenie_saved_ads') || '[]');
      const filtered = local.filter((id: string) => id !== adId);
      localStorage.setItem('urgenie_saved_ads', JSON.stringify(filtered));
    } catch (e) {}

    // Remove from Supabase if user is logged in
    if (user) {
      try {
        await (supabase.from('saved_ads') as any)
          .delete()
          .eq('user_id', user.id)
          .eq('ad_id', adId);
      } catch (err) {
        console.error('Error removing bookmark from Supabase:', err);
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 shadow-sm">
            <Heart className="h-5 w-5 fill-current" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Saved Advertisements</h1>
            <p className="text-xs text-gray-500">Quickly revisit ads you bookmarked in Hosur</p>
          </div>
        </div>

        <button 
          onClick={fetchSavedAds}
          className="p-2.5 text-gray-500 hover:text-brand bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors self-start sm:self-auto"
          title="Refresh saved ads"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-brand' : ''}`} />
        </button>
      </div>

      {loading && (
        <div className="py-16 text-center text-gray-400">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-3 text-brand" />
          <p className="text-sm font-medium">Loading your bookmarked ads...</p>
        </div>
      )}

      {!loading && savedAds.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedAds.map((ad) => (
            <div key={ad.id} className="relative group bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all overflow-hidden flex flex-col">
              <Link to={`/ad/${ad.ad_id || ad.id}`} className="flex flex-col flex-1">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                  <img 
                    src={ad.image} 
                    alt={ad.title} 
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col flex-1 p-4">
                  <h3 className="text-xl font-black text-brand mb-1">{ad.price}</h3>
                  <p className="text-sm font-semibold text-gray-900 line-clamp-2 mb-4">{ad.title}</p>
                  <div className="text-xs text-gray-500 mt-auto flex items-center justify-between">
                    <span>{ad.location}</span>
                    <span className="text-brand font-bold text-xs flex items-center gap-1">
                      <Eye className="h-3 w-3" /> View Ad
                    </span>
                  </div>
                </div>
              </Link>
              
              {/* Remove from saved button */}
              <button 
                onClick={() => handleRemove(ad.ad_id || ad.id)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 backdrop-blur shadow-md flex items-center justify-center text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors z-10" 
                title="Remove from bookmarks"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {!loading && savedAds.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">No saved ads yet</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">Click the bookmark heart icon on any ad to save it here for quick access later.</p>
          <Link to="/browse" className="btn btn-primary px-6 py-2.5 inline-flex items-center gap-2 text-sm font-bold shadow-sm">
            Explore Ads <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
