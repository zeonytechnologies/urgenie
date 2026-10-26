import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Clock, 
  Share2, 
  Heart, 
  AlertTriangle, 
  MessageCircle, 
  Phone, 
  CheckCircle2, 
  Trash2, 
  ArrowLeft,
  ShieldAlert,
  Check,
  Package,
  Eye
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { LISTING_TYPES, resolvePrimaryCategory, getCategoryDisplayName } from '../data/categories';
import { 
  removeAdFromLocalStorage, 
  isAdDeletedLocally, 
  getLocalAds,
  incrementAdViews,
  updateAdStatusInLocalStorage
} from '../utils/adStorage';

function mapDbAdToDisplayAd(data: any, sellerProfile?: any) {
  let lType = (data.listing_type || '').toLowerCase();
  if (!lType && data.description) {
    if (/Listing Type:\s*Rent/i.test(data.description) || (data.price_text && data.price_text.includes('/'))) {
      lType = 'rent';
    } else if (/Listing Type:\s*Sell New/i.test(data.description)) {
      lType = 'new';
    } else if (/Listing Type:\s*Job/i.test(data.description) || data.category_id === 'jobs') {
      lType = 'job';
    } else if (/Listing Type:\s*Service/i.test(data.description) || data.category_id === 'services') {
      lType = 'service';
    } else {
      lType = 'preowned';
    }
  }
  if (!lType) lType = 'preowned';

  const priceVal = Number(data.price || 0);
  let formattedPrice = `₹${priceVal.toLocaleString()}`;
  if (lType === 'free') {
    formattedPrice = 'FREE';
  } else if (data.price_text) {
    formattedPrice = data.price_text;
  } else if (lType === 'rent') {
    const period = (data.attributes?.rent_period || data.attributes?.['Rent Period'] || 'Month').replace(/^Per\s+/i, '');
    formattedPrice = `₹${priceVal.toLocaleString()} / ${period}`;
  }

  const rawCat = data.category_id || data.category || '';
  const rawSub = data.subcategory_id || data.subcategory || '';
  const resolvedCat = resolvePrimaryCategory(rawCat, rawSub);

  // Gather category-specific attributes only
  const mergedAttrs = { ...(data.attributes || {}) };
  const isVehicle = resolvedCat === 'vehicles';
  const isProperty = resolvedCat === 'property' || resolvedCat === 'commercial';
  const isJob = resolvedCat === 'jobs';

  if (isVehicle) {
    if (data.brand && !mergedAttrs['Make / Brand']) mergedAttrs['Make / Brand'] = data.brand;
    if (data.model && !mergedAttrs['Model']) mergedAttrs['Model'] = data.model;
    if (data.year && !mergedAttrs['Year']) mergedAttrs['Year'] = String(data.year);
    if (data.fuel_type && !mergedAttrs['Fuel Type']) mergedAttrs['Fuel Type'] = data.fuel_type;
    if (data.km_driven && !mergedAttrs['KM Driven']) mergedAttrs['KM Driven'] = `${data.km_driven.toLocaleString()} km`;
    if (data.transmission && !mergedAttrs['Transmission']) mergedAttrs['Transmission'] = data.transmission;
    if (data.owners_count && !mergedAttrs['Ownership']) mergedAttrs['Ownership'] = data.owners_count;
  }

  if (isProperty) {
    if (data.bhk && !mergedAttrs['Configuration']) mergedAttrs['Configuration'] = data.bhk;
    if (data.area_sqft && !mergedAttrs['Built-up Area']) mergedAttrs['Built-up Area'] = `${data.area_sqft} Sq.Ft`;
    if (data.furnishing && !mergedAttrs['Furnishing']) mergedAttrs['Furnishing'] = data.furnishing;
    if (data.deposit_amount && !mergedAttrs['Security Deposit']) mergedAttrs['Security Deposit'] = `₹${Number(data.deposit_amount).toLocaleString()}`;
  }

  if (isJob) {
    if (data.job_type && !mergedAttrs['Employment Type']) mergedAttrs['Employment Type'] = data.job_type;
  }

  return {
    id: data.id || data.slug,
    slug: data.slug || data.id,
    title: data.title,
    price: formattedPrice,
    category: resolvedCat,
    categoryName: getCategoryDisplayName(resolvedCat),
    subcategory: rawSub || '',
    listing_type: lType,
    attributes: mergedAttrs,
    location: data.location_name || data.location_text || data.city || 'Hosur',
    postedAt: data.created_at ? new Date(data.created_at).toLocaleDateString() : 'Recently',
    image: data.images?.[0] || 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=500',
    description: data.description,
    condition: data.condition || '',
    seller: data.contact_name || sellerProfile?.full_name || 'Verified Seller',
    phone: data.contact_phone || sellerProfile?.phone || '9876543210',
    allow_whatsapp: data.allow_whatsapp !== false,
    user_id: data.user_id,
    status: data.status || 'active',
    views_count: typeof data.views_count === 'number' ? data.views_count : 1,
  };
}

function findLocalAd(targetSlug?: string) {
  if (!targetSlug || isAdDeletedLocally(targetSlug)) return null;
  try {
    const localAds = getLocalAds();
    const found = localAds.find((a: any) => a.id === targetSlug || a.slug === targetSlug);
    if (found) {
      return mapDbAdToDisplayAd(found);
    }
  } catch {}
  return null;
}

export default function AdDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [showNumber, setShowNumber] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('spam');
  const [reportDetails, setReportDetails] = useState('');
  const [reported, setReported] = useState(false);

  // Synchronous 0ms local hydration
  const initialAd = useMemo(() => findLocalAd(slug), [slug]);
  const [ad, setAd] = useState<any>(initialAd);
  const [loading, setLoading] = useState<boolean>(!initialAd);

  useEffect(() => {
    // If ad is already loaded from local cache, keep loading = false so user sees it in 0ms!
    if (initialAd) {
      setAd(initialAd);
      setLoading(false);
    }

    // Immediately increment and persist views for this ad
    if (slug) {
      const updatedViews = incrementAdViews(slug);
      if (updatedViews) {
        setAd((prev: any) => prev ? { ...prev, views_count: updatedViews } : prev);
      }
    }

    const fetchDbAd = async () => {
      if (!slug || isAdDeletedLocally(slug)) {
        setAd(null);
        setLoading(false);
        return;
      }

      // Only show full-page loading if we do not even have a local copy
      if (!initialAd && !ad) {
        setLoading(true);
      }

      try {
        let data: any = null;
        let sellerProfile: any = null;

        // Try Supabase with rapid 600ms race
        try {
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 600));
          const query = (supabase.from('ads') as any).select('*');
          const fetchPromise = isUuid 
            ? query.or(`id.eq.${slug},slug.eq.${slug}`).maybeSingle()
            : query.eq('slug', slug).maybeSingle();

          const res: any = await Promise.race([fetchPromise, timeoutPromise]);
          if (res && !res.error && res.data) {
            data = res.data;
          }
        } catch {
          // Fall back gracefully
        }

        // If not found in Supabase, search local storage
        if (!data) {
          const localAds = getLocalAds();
          data = localAds.find((a: any) => a.id === slug || a.slug === slug);
        }

        if (data) {
          if (data.user_id && !sellerProfile) {
            try {
              const { data: pData } = await (supabase.from('profiles') as any)
                .select('full_name, phone, city, role, is_phone_verified')
                .eq('id', data.user_id)
                .maybeSingle();
              if (pData) sellerProfile = pData;
            } catch {}
          }

          const mapped = mapDbAdToDisplayAd(data, sellerProfile);
          // Retain whichever view count is higher (local storage vs db)
          const storedViews = Number(localStorage.getItem(`urgenie_views_${data.id || slug}`)) || 0;
          mapped.views_count = Math.max(mapped.views_count || 1, storedViews, 1);
          setAd(mapped);

          // Increment views count in database in background if possible
          if (data.id) {
            try {
              (supabase.from('ads') as any)
                .update({ views_count: (data.views_count || 0) + 1 })
                .eq('id', data.id)
                .then(() => {});
            } catch {}
          }
        } else if (!initialAd) {
          setAd(null);
        }
      } catch (err) {
        if (!initialAd) {
          console.error('Error fetching ad details:', err);
          setAd(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDbAd();
  }, [slug]);

  // Check if saved
  useEffect(() => {
    const checkSavedStatus = async () => {
      if (user && ad?.id) {
        try {
          const { data } = await (supabase.from('saved_ads') as any)
            .select('id')
            .eq('user_id', user.id)
            .eq('ad_id', ad.id)
            .single();
          if (data) setIsSaved(true);
        } catch {
          // Ignored
        }
      }
    };
    checkSavedStatus();
  }, [user, ad?.id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSave = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);

    try {
      if (nextSaved) {
        await (supabase.from('saved_ads') as any).insert({
          user_id: user.id,
          ad_id: ad.id,
        });
      } else {
        await (supabase.from('saved_ads') as any)
          .delete()
          .eq('user_id', user.id)
          .eq('ad_id', ad.id);
      }
    } catch {
      // Ignored
    }
  };

  const handleToggleSold = async () => {
    const nextStatus = ad.status === 'sold' ? 'active' : 'sold';
    setAd((prev: any) => prev ? { ...prev, status: nextStatus } : prev);

    // Persist immediately to localStorage
    if (ad.id) updateAdStatusInLocalStorage(ad.id, nextStatus);
    if (ad.slug && ad.slug !== ad.id) updateAdStatusInLocalStorage(ad.slug, nextStatus);
    if (slug && slug !== ad.id && slug !== ad.slug) updateAdStatusInLocalStorage(slug, nextStatus);

    try {
      if (ad.id) {
        await (supabase.from('ads') as any).update({ status: nextStatus }).eq('id', ad.id);
      }
    } catch {
      // Ignored
    }
  };

  const handleDeleteAd = async () => {
    if (!confirm('Are you sure you want to delete this advertisement?')) return;
    try {
      if (ad?.id) {
        removeAdFromLocalStorage(ad.id, ad.slug);
        await (supabase.from('ads') as any).delete().eq('id', ad.id);
      }
      navigate('/browse');
    } catch (err) {
      console.error(err);
      navigate('/browse');
    }
  };

  const handleReport = async () => {
    if (user && ad?.id) {
      try {
        await (supabase.from('reports') as any).insert({
          ad_id: ad.id,
          reporter_id: user.id,
          reason: reportReason,
          details: reportDetails,
        });
      } catch {
        // Ignored
      }
    }
    setReported(true);
    setTimeout(() => {
      setReportModalOpen(false);
      setReported(false);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 font-semibold">Loading listing details...</p>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md">
        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-gray-900 mb-2">Listing Not Found</h2>
        <p className="text-gray-500 mb-6">This advertisement may have been sold or removed by the seller.</p>
        <Link to="/browse" className="btn btn-primary px-6 py-2.5 font-bold">
          Browse All Classifieds
        </Link>
      </div>
    );
  }

  const isOwner = user && ad.user_id === user.id;
  const canManage = isOwner || isAdmin;
  const phoneNumber = ad.phone || '9876543210';
  const rawDigits = phoneNumber.replace(/[^\d]/g, '');
  const waNumber = rawDigits.startsWith('91') ? rawDigits : `91${rawDigits}`;

  return (
    <div className="container mx-auto px-4 lg:px-6 py-8 max-w-6xl">
      {/* Breadcrumbs */}
      <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-6 font-semibold">
        <div className="flex items-center gap-2 truncate">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <span className="text-slate-300">/</span>
          <Link to={`/category/${ad.category || 'all'}`} className="hover:text-blue-600 capitalize">
            {ad.categoryName || getCategoryDisplayName(ad.category)}
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 truncate font-bold">{ad.title}</span>
        </div>

        <Link to="/browse" className="text-xs font-black text-blue-600 hover:text-blue-700 flex items-center gap-1 flex-shrink-0">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to listings
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Image Gallery */}
          <div className="bg-white rounded-3xl p-3 border border-slate-200/80 shadow-xs mb-6">
            <div className="aspect-[4/3] md:aspect-[16/10] bg-slate-100 rounded-2xl overflow-hidden relative group">
              <img src={ad.image} alt={ad.title} className="w-full h-full object-cover" />
              
              {/* Sold Out Watermark Stamp */}
              {ad.status === 'sold' && (
                <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
                  <div className="border-4 border-red-500 text-red-500 font-black text-3xl sm:text-4xl tracking-widest px-6 py-2 rounded-xl rotate-[-12deg] bg-black/60 shadow-2xl uppercase">
                    SOLD OUT
                  </div>
                </div>
              )}

              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  onClick={handleShare}
                  className="w-10 h-10 rounded-2xl bg-white/90 backdrop-blur-md shadow-md flex items-center justify-center text-slate-700 hover:text-blue-600 hover:bg-white transition-all cursor-pointer"
                  title="Share Ad"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}
                </button>
                <button 
                  onClick={handleToggleSave}
                  className={`w-10 h-10 rounded-2xl bg-white/90 backdrop-blur-md shadow-md flex items-center justify-center transition-all cursor-pointer ${
                    isSaved ? 'text-red-500 fill-red-500' : 'text-slate-700 hover:text-red-500 hover:bg-white'
                  }`}
                  title={isSaved ? 'Remove Bookmark' : 'Save Bookmark'}
                >
                  <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Sold Out Alert Banner */}
          {ad.status === 'sold' && (
            <div className="mb-6 p-4.5 bg-red-50 border-2 border-red-500/40 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black text-xs uppercase tracking-wider shadow-md shadow-red-500/20 flex-shrink-0">
                  SOLD
                </div>
                <div>
                  <h4 className="font-black text-red-950 text-sm">This Listing is Sold Out</h4>
                  <p className="text-xs text-red-700 font-medium">The seller has marked this item as completed or sold. Inquiries are closed.</p>
                </div>
              </div>
              {canManage && (
                <button
                  onClick={handleToggleSold}
                  className="self-start sm:self-auto text-xs font-black text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Reactivate Listing
                </button>
              )}
            </div>
          )}

          {/* Ad Details Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {ad.status === 'sold' && (
                    <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600 text-white shadow-xs">
                      Sold Out
                    </span>
                  )}
                  {ad.listing_type && (
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      LISTING_TYPES[ad.listing_type]?.bgLight || 'bg-blue-50 text-blue-700'
                    } ${LISTING_TYPES[ad.listing_type]?.color || 'border-blue-200'}`}>
                      {LISTING_TYPES[ad.listing_type]?.badge || ad.listing_type}
                    </span>
                  )}
                  {ad.subcategory && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 capitalize">
                      {ad.subcategory.replace(/-/g, ' ')}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 leading-snug">{ad.title}</h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 font-semibold">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <span>{ad.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Clock className="h-4 w-4 flex-shrink-0" />
                    <span>Posted {ad.postedAt}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-blue-700 bg-blue-50/80 px-2.5 py-0.5 rounded-full border border-blue-200/50">
                    <Eye className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                    <span>{ad.views_count || 1} views</span>
                  </div>
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {ad.price}
              </div>
            </div>

            {/* Dynamic Attributes & Category Specs */}
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-3">Specifications & Details</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 mb-8 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/60">
              {ad.subcategory && (
                <div className="p-3.5 bg-white rounded-xl border border-slate-100 shadow-2xs flex flex-col justify-center">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider leading-tight mb-1">Subcategory</span>
                  <span className="font-extrabold text-slate-900 text-xs sm:text-sm capitalize break-words leading-snug">
                    {ad.subcategory.replace(/-/g, ' ')}
                  </span>
                </div>
              )}

              {/* Only show condition for physical goods categories, not jobs/services/property */}
              {(() => {
                const isPhysicalGoods = ['vehicles', 'mobiles', 'electronics', 'furniture', 'buy-sell', 'commercial'].includes((ad.category || '').toLowerCase());
                const isInvalidCondition = !ad.condition || ['hiring', 'job', 'service', 'rent'].includes(ad.condition.toLowerCase());
                if (!isPhysicalGoods || isInvalidCondition) return null;
                return (
                  <div className="p-3.5 bg-white rounded-xl border border-slate-100 shadow-2xs flex flex-col justify-center">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider leading-tight mb-1">Condition</span>
                    <span className="font-extrabold text-slate-900 text-xs sm:text-sm capitalize break-words leading-snug">
                      {ad.condition}
                    </span>
                  </div>
                );
              })()}

              {/* Parsed Custom Category Specifications & Attributes */}
              {(() => {
                const specList: { label: string; value: string }[] = [];
                const seenLabels = new Set<string>(['category', 'listing type', 'subcategory', 'condition', 'location']);
                const cat = (ad.category || '').toLowerCase();

                // Cross-category exclusion sets to ensure unrelated data is never displayed
                const VEHICLE_KEYS = new Set([
                  'make / brand', 'make', 'brand', 'model', 'year', 'fuel type', 'km driven', 'transmission', 
                  'ownership', 'owners', 'registration state', 'body type'
                ]);
                const PROPERTY_KEYS = new Set([
                  'configuration', 'bhk', 'built-up area', 'area', 'furnishing', 'security deposit', 'deposit', 
                  'floor', 'facing', 'preferred tenants', 'available from', 'land type', 'plot extent', 'road width', 
                  'approvals', 'boundary fencing', 'commercial type', 'power capacity', 'loading access', 'offer type', 
                  'target areas', 'tenant profile', 'looking for'
                ]);
                const JOB_KEYS = new Set([
                  'desired role', 'designation', 'company', 'industry', 'experience', 'experience required', 
                  'employment type', 'education', 'work location', 'work mode', 'notice period', 'availability', 
                  'key skills', 'gig duration', 'pay rate', 'timings', 'immediate joining'
                ]);

                const isAllowedForCategory = (label: string): boolean => {
                  const l = label.toLowerCase();
                  if (cat === 'jobs') {
                    if (VEHICLE_KEYS.has(l) || PROPERTY_KEYS.has(l)) return false;
                  } else if (cat === 'vehicles') {
                    if (JOB_KEYS.has(l) || PROPERTY_KEYS.has(l)) return false;
                  } else if (cat === 'property' || cat === 'commercial') {
                    if (JOB_KEYS.has(l) || VEHICLE_KEYS.has(l)) return false;
                  } else if (['mobiles', 'electronics', 'furniture', 'services', 'community', 'business', 'buy-sell'].includes(cat)) {
                    if (JOB_KEYS.has(l) || PROPERTY_KEYS.has(l)) return false;
                    if (['fuel type', 'km driven', 'transmission', 'ownership'].includes(l)) return false;
                  }
                  return true;
                };

                // 1. Include attributes dictionary
                if (ad.attributes && typeof ad.attributes === 'object') {
                  const ignoredKeys = new Set([
                    'section', 'intent', 'subcategory', 'section_id', 'option_id', 
                    'subcategory_slug', 'category', 'status', 'id', 'views_count', 
                    'slug', 'images', 'created_at', 'updated_at', 'user_id', 
                    'contact_name', 'contact_phone', 'price', 'price_text', 
                    'title', 'description', 'location_name', 'location_text', 'city', 'state'
                  ]);
                  Object.entries(ad.attributes).forEach(([k, v]) => {
                    if (v && typeof v !== 'object' && !ignoredKeys.has(k.toLowerCase())) {
                      const cleanLabel = k.replace(/_/g, ' ');
                      const valStr = String(v).trim();
                      if (valStr && !seenLabels.has(cleanLabel.toLowerCase()) && isAllowedForCategory(cleanLabel)) {
                        seenLabels.add(cleanLabel.toLowerCase());
                        specList.push({ label: cleanLabel, value: valStr });
                      }
                    }
                  });
                }

                // 2. Only parse bullet points from description if attributes dictionary is empty
                if (specList.length === 0) {
                  const lines = ((ad.description as string) || '').split('\n');
                  lines.forEach((l: string) => {
                    const m = l.match(/^[•\-*]\s*([^:]+):\s*(.+)$/);
                    if (m) {
                      const label = m[1].trim();
                      const value = m[2].trim();
                      if (!seenLabels.has(label.toLowerCase()) && isAllowedForCategory(label)) {
                        seenLabels.add(label.toLowerCase());
                        specList.push({ label, value });
                      }
                    }
                  });
                }

                return specList.map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-white rounded-xl border border-slate-100 shadow-2xs hover:border-blue-200 transition-colors flex flex-col justify-center">
                    <span className="text-[10px] text-blue-600 block font-bold uppercase tracking-wider leading-tight mb-1">
                      {item.label}
                    </span>
                    <span className="font-extrabold text-slate-900 text-xs sm:text-sm break-words leading-snug">
                      {item.value}
                    </span>
                  </div>
                ));
              })()}
            </div>

            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-3">Item Description</h3>
            <div className="text-slate-700 leading-relaxed space-y-4 mb-8 whitespace-pre-line text-sm font-medium">
              <p>
                {(() => {
                  const lines = ((ad.description as string) || '').split('\n');
                  const clean = lines.filter((l: string) => 
                    !l.startsWith('📌') && 
                    !l.includes('━━━━━━') && 
                    !l.includes('CLASSIFICATION & SPECIFICATIONS') && 
                    !l.match(/^[•\-*]\s*[^:]+:/)
                  ).join('\n').trim();
                  return clean || ad.description;
                })()}
              </p>
            </div>

            {/* Management or Report Bar */}
            <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <span className="text-xs text-slate-400 font-mono font-bold">Listing Ref: URGENIE-{ad.id?.slice(0, 8)}</span>
              
              <div className="flex items-center gap-3">
                {canManage && (
                  <>
                    <button
                      onClick={handleToggleSold}
                      className={`flex items-center gap-1.5 text-xs font-black px-3.5 py-2 rounded-xl transition-colors cursor-pointer ${
                        ad.status === 'sold'
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {ad.status === 'sold' ? 'Mark as Active' : 'Mark as Sold Out'}
                    </button>

                    <button
                      onClick={handleDeleteAd}
                      className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-black px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" /> Delete Listing
                    </button>
                  </>
                )}
                
                <button
                  onClick={() => setReportModalOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                >
                  <AlertTriangle className="h-3.5 w-3.5" /> Report Listing
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Contact Card */}
        <div className="lg:w-88 flex-shrink-0 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card sticky top-24">
            <h3 className="font-black text-slate-900 mb-4 text-xs uppercase tracking-widest">Seller Profile</h3>
            
            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xl font-black shadow-md">
                {(ad.seller || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">{ad.seller}</h4>
                <div className="flex items-center gap-1 text-xs text-emerald-600 font-extrabold mt-0.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Verified Hosur Seller</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 mb-5 font-semibold">Active community seller on URGENIE Hosur</p>

            {ad.status === 'sold' ? (
              <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl text-center space-y-2">
                <span className="inline-block px-3 py-1 bg-red-100 text-red-700 font-black text-xs rounded-full uppercase tracking-wider">
                  Item Sold Out
                </span>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  Direct inquiries and WhatsApp messaging are closed because this advertisement has been marked as sold.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* WhatsApp Button with Glow */}
                {ad.allow_whatsapp !== false && (
                  <a
                    href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Hi, I am interested in your ad "${ad.title}" on URGENIE.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn w-full py-3.5 gap-2 bg-[#25D366] text-white hover:bg-[#1fb858] rounded-2xl shadow-lg shadow-emerald-500/20 text-sm font-black justify-center transition-all hover:scale-102"
                  >
                    <MessageCircle className="h-5 w-5" /> Chat on WhatsApp
                  </a>
                )}

                {/* Show Phone Number */}
                <button
                  onClick={() => setShowNumber(true)}
                  className="btn btn-outline w-full py-3 gap-2 rounded-2xl text-xs sm:text-sm font-extrabold justify-center"
                >
                  <Phone className="h-4 w-4 text-blue-600" />
                  {showNumber ? phoneNumber : 'Show Phone Number'}
                </button>
              </div>
            )}

            <div className="mt-6 p-4 bg-amber-50/80 rounded-2xl border border-amber-200/70 text-xs text-amber-900 flex items-start gap-2.5 font-medium">
              <ShieldAlert className="h-4 w-4 flex-shrink-0 text-amber-600 mt-0.5" />
              <p>Safety tip: Inspect the item in person around Hosur before transferring money.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Report Advertisement</h3>
            <p className="text-sm text-gray-500 mb-4">Why are you reporting this listing?</p>

            {reported ? (
              <div className="py-8 text-center text-green-600">
                <CheckCircle2 className="h-10 w-10 mx-auto mb-2" />
                <p className="font-bold">Thank you. Report received for review.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  {['spam', 'fraud', 'inappropriate', 'duplicate', 'wrong_category'].map((reason) => (
                    <label key={reason} className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer capitalize text-sm font-semibold">
                      <input
                        type="radio"
                        name="reason"
                        value={reason}
                        checked={reportReason === reason}
                        onChange={(e) => setReportReason(e.target.value)}
                        className="text-brand focus:ring-brand"
                      />
                      <span>{reason.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>

                <textarea
                  rows={2}
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Additional details (optional)..."
                  className="input-field py-2 text-xs"
                />

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setReportModalOpen(false)}
                    className="btn btn-outline flex-1 py-2 text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReport}
                    className="btn btn-primary flex-1 py-2 text-sm bg-red-600 hover:bg-red-700 text-white border-transparent font-bold"
                  >
                    Submit Report
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
