import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Filter, SlidersHorizontal, X, Search, RotateCcw, Package, PlusCircle, Sparkles } from 'lucide-react';
import AdCard from '../components/ui/AdCard';
import { supabase } from '../lib/supabase';
import { CATEGORIES, LISTING_TYPES } from '../data/categories';

interface AdDisplayItem {
  id: string;
  title: string;
  price: string;
  priceNum: number;
  category: string;
  subcategory?: string;
  listingType?: string;
  location: string;
  condition?: string;
  image: string;
  postedAt: string;
}

interface CategoryItem {
  id: string;
  name: string;
}

const DEFAULT_CATEGORIES: CategoryItem[] = CATEGORIES.map((cat: any) => ({
  id: cat.id,
  name: cat.name,
}));

export default function Browse() {
  const { category: paramCategory } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filter States
  const [selectedListingType, setSelectedListingType] = useState<string>(
    searchParams.get('type') || 'all'
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    paramCategory ? [paramCategory] : []
  );
  const [selectedLocations, setSelectedLocations] = useState<string[]>(
    searchParams.get('location') ? [searchParams.get('location')!] : []
  );
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [searchTerm, setSearchTerm] = useState<string>(searchParams.get('q') || '');
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  // Real Supabase data states
  const [dbAds, setDbAds] = useState<AdDisplayItem[]>([]);
  const [categoriesList, setCategoriesList] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);
  const [locationsList, setLocationsList] = useState<string[]>([
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
  ]);
  const [loading, setLoading] = useState(true);

  // Sync params on change
  useEffect(() => {
    if (paramCategory && !selectedCategories.includes(paramCategory)) {
      setSelectedCategories([paramCategory]);
    }
  }, [paramCategory]);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setSearchTerm(q);
    const loc = searchParams.get('location');
    if (loc && !selectedLocations.includes(loc)) {
      setSelectedLocations([loc]);
    }
    const typeParam = searchParams.get('type');
    if (typeParam) {
      setSelectedListingType(typeParam);
    }
  }, [searchParams]);

  // Fetch real Supabase ads, categories, and locations
  useEffect(() => {
    const fetchBrowseData = async () => {
      setLoading(true);
      try {
        // 1. Fetch real ads from Supabase
        let remoteAds: any[] = [];
        try {
          const { data: adsData, error: adsError } = await (supabase.from('ads') as any)
            .select('id, title, price, location_name, location_text, category_id, subcategory_id, listing_type, condition, images, created_at')
            .eq('status', 'active')
            .order('created_at', { ascending: false });

          if (!adsError && adsData) {
            remoteAds = adsData;
          }
        } catch (fetchErr) {
          console.warn('Remote ads fetch notice:', fetchErr);
        }

        // 2. Fetch locally saved ads from localStorage
        let localAds: any[] = [];
        try {
          localAds = JSON.parse(localStorage.getItem('urgenie_local_ads') || '[]');
        } catch {}

        // Combine and deduplicate
        const mergedMap = new Map<string, any>();
        localAds.forEach((ad: any) => {
          if (ad && (ad.id || ad.slug)) {
            mergedMap.set(ad.id || ad.slug, ad);
          }
        });
        remoteAds.forEach((ad: any) => {
          if (ad && (ad.id || ad.slug)) {
            mergedMap.set(ad.id || ad.slug, ad);
          }
        });

        const combinedList = Array.from(mergedMap.values());
        const mapped: AdDisplayItem[] = combinedList.map((item: any) => ({
          id: item.id || item.slug,
          title: item.title,
          price: item.listing_type === 'free'
            ? 'FREE'
            : item.price_text
            ? item.price_text
            : item.listing_type === 'rent'
            ? `₹${Number(item.price || 0).toLocaleString()} / ${(item.attributes?.rent_period || 'Month').replace(/^Per\s+/i, '')}`
            : `₹${Number(item.price || 0).toLocaleString()}`,
          priceNum: Number(item.price) || 0,
          category: item.category_id || 'General',
          subcategory: item.subcategory_id || undefined,
          listingType: item.listing_type || 'preowned',
          location: item.location_name || item.location_text || 'Hosur',
          condition: item.condition || 'good',
          image: item.images?.[0] || 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=500',
          postedAt: item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recently',
        }));
        setDbAds(mapped);

        // 2. Fetch categories
        const { data: catData } = await (supabase.from('categories') as any)
          .select('id, name')
          .order('sort_order', { ascending: true });

        if (catData && catData.length > 0) {
          setCategoriesList(catData);
        }

        // 3. Fetch locations
        const { data: locData } = await (supabase.from('locations') as any)
          .select('name')
          .order('name', { ascending: true });

        if (locData && locData.length > 0) {
          setLocationsList(locData.map((l: any) => l.name));
        }
      } catch (err) {
        console.error('Error fetching browse data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBrowseData();
  }, []);

  // Apply filters on real Supabase ads only
  const filteredAds = useMemo(() => {
    return dbAds.filter((ad) => {
      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase();
        const matchTitle = (ad.title || '').toLowerCase().includes(term);
        const matchCat = (ad.category || '').toLowerCase().includes(term);
        const matchLoc = (ad.location || '').toLowerCase().includes(term);
        if (!matchTitle && !matchCat && !matchLoc) return false;
      }

      // Listing Type
      if (selectedListingType !== 'all') {
        const adType = (ad.listingType || '').toLowerCase();
        if (adType !== selectedListingType.toLowerCase()) return false;
      }

      // Categories
      if (selectedCategories.length > 0) {
        const matchCategory = selectedCategories.some((cat) => {
          const c = cat.toLowerCase();
          const ac = (ad.category || '').toLowerCase();
          return ac.includes(c) || c.includes(ac);
        });
        if (!matchCategory) return false;
      }

      // Location
      if (selectedLocations.length > 0) {
        const isGeneralHosur = selectedLocations.length === 1 && (
          selectedLocations[0].toLowerCase() === 'hosur' || 
          selectedLocations[0].toLowerCase() === 'all' ||
          selectedLocations[0].toLowerCase() === 'hosur town'
        );
        if (!isGeneralHosur) {
          const matchLoc = selectedLocations.some((loc) => {
            const l = loc.toLowerCase();
            const al = (ad.location || '').toLowerCase();
            return al.includes(l) || l.includes(al);
          });
          if (!matchLoc) return false;
        }
      }

      // Price Range
      const min = minPrice ? parseFloat(minPrice) : 0;
      const max = maxPrice ? parseFloat(maxPrice) : Infinity;
      if (ad.priceNum < min || ad.priceNum > max) return false;

      // Condition
      if (selectedCondition !== 'all' && ad.condition && ad.condition !== selectedCondition) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.priceNum - b.priceNum;
      if (sortBy === 'price-high') return b.priceNum - a.priceNum;
      return 0; // default newest
    });
  }, [dbAds, searchTerm, selectedListingType, selectedCategories, selectedLocations, minPrice, maxPrice, selectedCondition, sortBy]);

  // Pagination calculation
  const itemsPerPage = 9;
  const totalPages = Math.ceil(filteredAds.length / itemsPerPage) || 1;
  const paginatedAds = filteredAds.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleCategory = (catId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    );
    setCurrentPage(1);
  };

  const toggleLocation = (loc: string) => {
    setSelectedLocations((prev) =>
      prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc]
    );
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSelectedListingType('all');
    setSelectedCategories([]);
    setSelectedLocations([]);
    setMinPrice('');
    setMaxPrice('');
    setSelectedCondition('all');
    setSearchTerm('');
    setSortBy('newest');
    setCurrentPage(1);
    setSearchParams({});
  };

  return (
    <div className="container mx-auto px-4 lg:px-6 py-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
        <div>
          <div className="text-xs font-black uppercase tracking-widest text-blue-600 mb-1">Hosur Classifieds Directory</div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 capitalize">
            {paramCategory ? `${paramCategory.replace('-', ' ')} in Hosur` : 'All Classifieds & Listings'}
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Showing <strong className="text-slate-900 font-extrabold">{filteredAds.length}</strong> active listings in Hosur & surrounding areas
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setIsMobileFilterOpen(true)}
            className="md:hidden btn btn-outline gap-2 text-xs font-bold py-2 px-4 rounded-xl"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters ({selectedCategories.length + selectedLocations.length + (minPrice || maxPrice ? 1 : 0)})</span>
          </button>

          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span className="text-slate-500 font-bold">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="font-extrabold text-slate-800 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs outline-none cursor-pointer focus:border-blue-500"
            >
              <option value="newest">Newest Listed First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Listing Type Matrix Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
        {[
          { id: 'all', label: 'All Listings' },
          { id: 'new', label: 'Sell New (N)' },
          { id: 'preowned', label: 'Pre-owned (P)' },
          { id: 'rent', label: 'Rent / Lease (R)' },
          { id: 'job', label: 'Job Openings (J)' },
          { id: 'service', label: 'Services (S)' },
          { id: 'free', label: 'Community Free' },
        ].map((type) => (
          <button
            key={type.id}
            onClick={() => {
              setSelectedListingType(type.id);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              selectedListingType === type.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80 shadow-2xs'
            }`}
          >
            {type.id === 'all' ? <Sparkles className="h-3 w-3" /> : null}
            <span>{type.label}</span>
          </button>
        ))}
      </div>

      {/* Active Filter Chips */}
      {(selectedListingType !== 'all' || selectedCategories.length > 0 || selectedLocations.length > 0 || minPrice || maxPrice || searchTerm) && (
        <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-blue-50/50 rounded-2xl border border-blue-100/70">
          <span className="text-xs font-bold text-slate-500 mr-1">Active filters:</span>
          
          {selectedListingType !== 'all' && (
            <span className="badge-chip bg-amber-100 text-amber-900 border border-amber-200 font-extrabold">
              Listing: {LISTING_TYPES[selectedListingType]?.label || selectedListingType}
              <button onClick={() => setSelectedListingType('all')} className="hover:text-red-500 ml-1">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {searchTerm && (
            <span className="badge-chip bg-white text-slate-800 border border-slate-200 shadow-2xs">
              Keyword: "{searchTerm}"
              <button onClick={() => setSearchTerm('')} className="hover:text-red-500 ml-1">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {selectedCategories.map((c) => (
            <span key={c} className="badge-chip bg-blue-100 text-blue-800 border border-blue-200">
              {categoriesList.find(x => x.id === c)?.name || c}
              <button onClick={() => toggleCategory(c)} className="hover:text-red-500 ml-1">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          {selectedLocations.map((l) => (
            <span key={l} className="badge-chip bg-emerald-100 text-emerald-800 border border-emerald-200">
              {l}
              <button onClick={() => toggleLocation(l)} className="hover:text-red-500 ml-1">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          {(minPrice || maxPrice) && (
            <span className="badge-chip bg-purple-100 text-purple-800 border border-purple-200">
              ₹{minPrice || 0} - ₹{maxPrice || '∞'}
              <button onClick={() => { setMinPrice(''); setMaxPrice(''); }} className="hover:text-red-500 ml-1">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          <button 
            onClick={clearAllFilters}
            className="text-xs font-extrabold text-blue-600 hover:text-blue-800 ml-auto flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" /> Reset all
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar (Desktop) */}
        <aside className="hidden md:block w-72 flex-shrink-0">
          <div className="bg-white rounded-3xl shadow-card border border-slate-200/80 p-6 sticky top-24 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                <Filter className="h-4 w-4 text-blue-600" /> Filter Options
              </h3>
              <button 
                onClick={clearAllFilters}
                className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" /> Reset
              </button>
            </div>

            {/* Keyword Search */}
            <div>
              <label className="block font-black text-xs text-slate-700 uppercase tracking-wider mb-2">Search Query</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Filter by title..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="input-field py-2 pl-8 text-xs font-medium"
                />
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')} 
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Categories */}
            <div>
              <h4 className="font-black text-xs text-slate-700 uppercase tracking-wider mb-3">Categories</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {categoriesList.map((cat) => (
                  <label key={cat.id} className="flex items-center gap-2.5 text-xs font-bold text-slate-600 cursor-pointer hover:text-slate-900 transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat.id)}
                      onChange={() => toggleCategory(cat.id)}
                      className="rounded-lg text-blue-600 focus:ring-blue-500 h-4 w-4 border-slate-300"
                    />
                    <span className="truncate">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <h4 className="font-black text-xs text-slate-700 uppercase tracking-wider mb-3">Location in Hosur</h4>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {locationsList.map((loc) => (
                  <label key={loc} className="flex items-center gap-2.5 text-xs font-bold text-slate-600 cursor-pointer hover:text-slate-900 transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedLocations.includes(loc)}
                      onChange={() => toggleLocation(loc)}
                      className="rounded-lg text-blue-600 focus:ring-blue-500 h-4 w-4 border-slate-300"
                    />
                    <span className="truncate">{loc}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h4 className="font-black text-xs text-slate-700 uppercase tracking-wider mb-3">Price Range (₹)</h4>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min ₹"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="input-field py-1.5 px-3 text-xs font-bold w-1/2"
                />
                <span className="text-slate-400 font-bold">-</span>
                <input
                  type="number"
                  placeholder="Max ₹"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="input-field py-1.5 px-3 text-xs font-bold w-1/2"
                />
              </div>
            </div>

            {/* Condition */}
            <div>
              <h4 className="font-black text-xs text-slate-700 uppercase tracking-wider mb-3">Condition</h4>
              <select
                value={selectedCondition}
                onChange={(e) => {
                  setSelectedCondition(e.target.value);
                  setCurrentPage(1);
                }}
                className="input-field py-2 text-xs font-bold text-slate-800 cursor-pointer"
              >
                <option value="all">Any Condition</option>
                <option value="new">Brand New</option>
                <option value="like_new">Used - Like New</option>
                <option value="good">Used - Good</option>
                <option value="fair">Used - Fair</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Ad Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="bg-slate-100 animate-pulse rounded-2xl h-80" />
              ))}
            </div>
          ) : paginatedAds.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedAds.map((ad) => (
                <AdCard key={ad.id} ad={ad as any} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center shadow-xs">
              <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-black text-slate-900 mb-2">No advertisements match your filters</h3>
              <p className="text-slate-500 text-xs mb-6 max-w-sm mx-auto font-medium">
                Try widening your price range, choosing different categories, or clearing search keywords.
              </p>
              <div className="flex justify-center gap-3">
                <button onClick={clearAllFilters} className="btn btn-outline px-5 py-2 text-xs font-extrabold">
                  Clear Filters
                </button>
                <Link to="/post-ad" className="btn btn-primary px-5 py-2 text-xs font-extrabold inline-flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" /> Post Free Ad
                </Link>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center">
              <div className="flex items-center gap-1.5 bg-white rounded-2xl border border-slate-200 p-1.5 shadow-xs">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3.5 py-1.5 text-xs font-black text-slate-600 hover:text-blue-600 disabled:opacity-30 rounded-xl"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    onClick={() => setCurrentPage(num)}
                    className={`w-9 h-9 flex items-center justify-center text-xs font-black rounded-xl transition-all ${
                      currentPage === num
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {num}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3.5 py-1.5 text-xs font-black text-slate-600 hover:text-blue-600 disabled:opacity-30 rounded-xl"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-end md:hidden">
          <div className="w-full max-w-xs bg-white h-full p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <h3 className="font-bold text-lg text-gray-900">Filters</h3>
              <button onClick={() => setIsMobileFilterOpen(false)} className="p-1 text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div>
              <h4 className="font-bold text-sm text-gray-900 mb-2">Categories</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {categoriesList.map((cat) => (
                  <label key={cat.id} className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat.id)}
                      onChange={() => toggleCategory(cat.id)}
                      className="rounded text-brand"
                    />
                    <span>{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-sm text-gray-900 mb-2">Location</h4>
              <div className="space-y-2">
                {locationsList.map((loc) => (
                  <label key={loc} className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={selectedLocations.includes(loc)}
                      onChange={() => toggleLocation(loc)}
                      className="rounded text-brand"
                    />
                    <span>{loc}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-sm text-gray-900 mb-2">Price Range</h4>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="input-field py-1 text-sm w-1/2"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="input-field py-1 text-sm w-1/2"
                />
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button onClick={clearAllFilters} className="btn btn-outline flex-1 py-2 text-sm">
                Reset
              </button>
              <button onClick={() => setIsMobileFilterOpen(false)} className="btn btn-primary flex-1 py-2 text-sm font-bold">
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
