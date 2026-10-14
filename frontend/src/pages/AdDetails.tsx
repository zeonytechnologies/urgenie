import { useState, useEffect } from 'react';
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
  Package
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { LISTING_TYPES } from '../data/categories';

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
  const [loading, setLoading] = useState(true);

  const [ad, setAd] = useState<any>(null);

  useEffect(() => {
    const fetchDbAd = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
        const query = (supabase.from('ads') as any).select('*, profiles:user_id(full_name, phone, city, role, is_phone_verified)');
        const { data, error } = isUuid 
          ? await query.or(`id.eq.${slug},slug.eq.${slug}`).maybeSingle()
          : await query.eq('slug', slug).maybeSingle();

        if (!error && data) {
          setAd({
            id: data.id,
            title: data.title,
            price: data.listing_type === 'free' ? 'FREE' : `₹${Number(data.price || 0).toLocaleString()}`,
            category: data.category_id || 'General',
            subcategory: data.subcategory_id || '',
            listing_type: data.listing_type || 'preowned',
            attributes: data.attributes || {},
            location: data.location_name || data.city || 'Hosur',
            postedAt: new Date(data.created_at).toLocaleDateString(),
            image: data.images?.[0] || 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=500',
            description: data.description,
            condition: data.condition || 'Used - Good',
            seller: data.contact_name || data.profiles?.full_name || 'Verified Seller',
            phone: data.contact_phone || data.profiles?.phone || '9876543210',
            allow_whatsapp: data.allow_whatsapp !== false,
            user_id: data.user_id,
            views_count: data.views_count || 1,
          });

          // Increment views count in database
          try {
            await (supabase.from('ads') as any)
              .update({ views_count: (data.views_count || 0) + 1 })
              .eq('id', data.id);
          } catch {
            // Ignored
          }
        } else {
          // Check local storage for recently posted ad
          try {
            const localAds = JSON.parse(localStorage.getItem('urgenie_local_ads') || '[]');
            const found = localAds.find((a: any) => a.id === slug || a.slug === slug);
            if (found) {
              setAd({
                id: found.id,
                title: found.title,
                price: found.listing_type === 'free' ? 'FREE' : `₹${Number(found.price || 0).toLocaleString()}`,
                category: found.category_id || 'General',
                subcategory: found.subcategory_id || '',
                listing_type: found.listing_type || 'preowned',
                attributes: found.attributes || {},
                location: found.location_name || found.city || 'Hosur',
                postedAt: found.created_at ? new Date(found.created_at).toLocaleDateString() : 'Recently',
                image: found.images?.[0] || 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=500',
                description: found.description,
                condition: found.condition || 'Used - Good',
                seller: found.contact_name || 'Verified Seller',
                phone: found.contact_phone || '9876543210',
                allow_whatsapp: found.allow_whatsapp !== false,
                user_id: found.user_id,
                views_count: 1,
              });
            }
          } catch (e) {}
        }
      } catch (err) {
        console.error('Error fetching ad details:', err);
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

  const handleDeleteAd = async () => {
    if (!confirm('Are you sure you want to delete this advertisement?')) return;
    try {
      await (supabase.from('ads') as any).delete().eq('id', ad.id);
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
            {ad.category || 'Classifieds'}
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

          {/* Ad Details Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {ad.listing_type && (
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      LISTING_TYPES[ad.listing_type]?.bgLight || 'bg-blue-50 text-blue-700'
                    } ${LISTING_TYPES[ad.listing_type]?.color || 'border-blue-200'}`}>
                      {LISTING_TYPES[ad.listing_type]?.badge || ad.listing_type}
                    </span>
                  )}
                  {ad.subcategory && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 capitalize">
                      {ad.subcategory}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 leading-snug">{ad.title}</h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 font-semibold">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span>{ad.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Clock className="h-4 w-4" />
                    <span>Posted {ad.postedAt}</span>
                  </div>
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {ad.price}
              </div>
            </div>

            {/* Dynamic Attributes & Category Specs */}
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-3">Specifications & Details</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/60">
              <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-2xs">
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Category</span>
                <span className="font-extrabold text-slate-900 text-xs sm:text-sm capitalize">{ad.category}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-2xs">
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Listing Type</span>
                <span className="font-extrabold text-blue-600 text-xs sm:text-sm capitalize">
                  {LISTING_TYPES[ad.listing_type]?.label || ad.listing_type}
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-2xs">
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Condition</span>
                <span className="font-extrabold text-slate-900 text-xs sm:text-sm capitalize">{ad.condition}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-2xs">
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Location</span>
                <span className="font-extrabold text-slate-900 text-xs sm:text-sm truncate block">{ad.location}</span>
              </div>

              {/* Parsed Custom Category Specifications & Attributes */}
              {(() => {
                const lines = ((ad.description as string) || '').split('\n');
                const specList: { label: string; value: string }[] = [];
                lines.forEach((l: string) => {
                  const m = l.match(/^[•\-]\s*([^:]+):\s*(.+)$/);
                  if (m) {
                    specList.push({ label: m[1].trim(), value: m[2].trim() });
                  }
                });

                // Include attributes jsonb if present
                if (ad.attributes && typeof ad.attributes === 'object') {
                  Object.entries(ad.attributes).forEach(([k, v]) => {
                    if (v && typeof v !== 'object') {
                      const cleanLabel = k.replace(/_/g, ' ');
                      const alreadyInList = specList.some(s => s.label.toLowerCase() === cleanLabel.toLowerCase());
                      if (!alreadyInList) {
                        specList.push({ label: cleanLabel, value: String(v) });
                      }
                    }
                  });
                }

                return specList.map((item, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-xl border border-slate-100 shadow-2xs">
                    <span className="text-[10px] text-blue-600 block font-bold uppercase tracking-wider truncate capitalize">{item.label}</span>
                    <span className="font-extrabold text-slate-900 text-xs sm:text-sm truncate block">{item.value}</span>
                  </div>
                ));
              })()}
            </div>

            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-3">Item Description</h3>
            <div className="text-slate-700 leading-relaxed space-y-4 mb-8 whitespace-pre-line text-sm font-medium">
              <p>
                {(() => {
                  const lines = ((ad.description as string) || '').split('\n');
                  const clean = lines.filter((l: string) => !l.startsWith('📌') && !l.match(/^[•\-]\s*[^:]+:/)).join('\n').trim();
                  return clean || ad.description;
                })()}
              </p>
            </div>

            {/* Management or Report Bar */}
            <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <span className="text-xs text-slate-400 font-mono font-bold">Listing Ref: URGENIE-{ad.id?.slice(0, 8)}</span>
              
              <div className="flex items-center gap-3">
                {canManage && (
                  <button
                    onClick={handleDeleteAd}
                    className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-black px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" /> Delete Listing
                  </button>
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

            <div className="space-y-3">
              {/* WhatsApp Button with Glow */}
              <a
                href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Hi, I am interested in your ad "${ad.title}" on URGENIE.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn w-full py-3.5 gap-2 bg-[#25D366] text-white hover:bg-[#1fb858] rounded-2xl shadow-lg shadow-emerald-500/20 text-sm font-black justify-center transition-all hover:scale-102"
              >
                <MessageCircle className="h-5 w-5" /> Chat on WhatsApp
              </a>

              {/* Show Phone Number */}
              <button
                onClick={() => setShowNumber(true)}
                className="btn btn-outline w-full py-3 gap-2 rounded-2xl text-xs sm:text-sm font-extrabold justify-center"
              >
                <Phone className="h-4 w-4 text-blue-600" />
                {showNumber ? phoneNumber : 'Show Phone Number'}
              </button>
            </div>

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
