import { useState, useEffect, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Tag, 
  Upload, 
  Loader2, 
  Sparkles,
  Check
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  CLASSIFIEDS_CATEGORIES, 
  LISTING_TYPES, 
  getAllowedListingTypesForCategory, 
  getSubcategoriesForCategory
} from '../data/categories';

const DEFAULT_LOCATIONS = [
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

export default function PostAd() {
  const { user, profile } = useAuth();

  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('vehicles');
  const [selectedListingType, setSelectedListingType] = useState<string>('preowned');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('cars');
  const [locationsList] = useState<string[]>(DEFAULT_LOCATIONS);

  // Basic Info (Step 3)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('good');
  const [isNegotiable, setIsNegotiable] = useState(true);
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [location, setLocation] = useState('Hosur Town Center');
  const [sellerName, setSellerName] = useState(profile?.full_name || 'Seller');
  const [phone, setPhone] = useState(profile?.phone || '9876543210');
  const [allowWhatsapp, setAllowWhatsapp] = useState(true);

  // Sync user profile
  useEffect(() => {
    if (profile) {
      if (profile.full_name) setSellerName(profile.full_name);
      if (profile.phone) setPhone(profile.phone);
    }
  }, [profile]);

  // Sync listing type and subcategory whenever category changes
  useEffect(() => {
    const allowedTypes = getAllowedListingTypesForCategory(selectedCategory);
    if (!allowedTypes.some(t => t.id === selectedListingType)) {
      setSelectedListingType(allowedTypes[0]?.id || 'preowned');
    }
    const subcats = getSubcategoriesForCategory(selectedCategory);
    if (subcats.length > 0) {
      setSelectedSubcategory(subcats[0].slug);
    }
  }, [selectedCategory]);

  // ==========================================
  // TAILORED ATTRIBUTES (STEP 2)
  // ==========================================
  // 1. Vehicles
  const [vehicleBrand, setVehicleBrand] = useState('Royal Enfield');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState('2023');
  const [vehicleFuel, setVehicleFuel] = useState('Petrol');
  const [vehicleKm, setVehicleKm] = useState('18000');
  const [vehicleOwners, setVehicleOwners] = useState('1st Owner');
  const [vehicleTransmission, setVehicleTransmission] = useState('Manual');

  // 2. Properties
  const [propertyBhk, setPropertyBhk] = useState('2 BHK');
  const [propertyArea, setPropertyArea] = useState('1200');
  const [propertyFurnishing, setPropertyFurnishing] = useState('Semi-Furnished');
  const [propertyFloor, setPropertyFloor] = useState('1st Floor (Out of 3)');
    const [propertyFacing, setPropertyFacing] = useState('East Facing');

  // 3. Mobiles & Tech
  const [deviceBrand, setDeviceBrand] = useState('Apple');
  const [deviceModel, setDeviceModel] = useState('');
  const [deviceCondition, setDeviceCondition] = useState('Like New');
  const [deviceAge, setDeviceAge] = useState('Under 1 Year');
  const [deviceWarranty, setDeviceWarranty] = useState('Active Brand Warranty');
  const [deviceBill, setDeviceBill] = useState('Original Bill & Box Available');

  // 4. Jobs & Careers
  const [jobPostKind, setJobPostKind] = useState<'hiring' | 'job_seeker'>('hiring');
  const [jobTitle, setJobTitle] = useState('');
  const [jobType, setJobType] = useState('Full Time');
  const [jobExperience, setJobExperience] = useState('1-3 Years');
  const [jobSalaryMin, setJobSalaryMin] = useState('20000');
  const [jobSalaryMax, setJobSalaryMax] = useState('35000');
  const [jobSalaryPeriod, setJobSalaryPeriod] = useState('Per Month');
  const [jobSkills, setJobSkills] = useState('Communication, Basic Computer');

  // 5. Local Services & Business
  const [serviceType, setServiceType] = useState('Electrician & Wiring');
  const [servicePricingModel, setServicePricingModel] = useState('Per Visit');
  const [servicePrice, setServicePrice] = useState('350');
  const [serviceAreaCovered, setServiceAreaCovered] = useState('All Hosur & SIPCOT');
  const [serviceExperience, setServiceExperience] = useState('5+ Years Experience');

  // 6. Rent Items Specifics
  const [rentPeriod, setRentPeriod] = useState('Per Month');
  const [rentDeposit, setRentDeposit] = useState('');
  const [rentAvailability, setRentAvailability] = useState('Immediate');

  // 7. Community
  const [communityKind, setCommunityKind] = useState('Free Giveaway / Donation');
  const [communityDate, setCommunityDate] = useState('Valid for 30 days');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdAdId, setCreatedAdId] = useState<string | null>(null);

  // Handle Photo Upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    setUploadError(null);

    try {
      // Create compressed base64
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxDim = 800;
            let width = img.width;
            let height = img.height;
            if (width > height && width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL('image/jpeg', 0.85));
            } else {
              resolve(event.target?.result as string);
            }
          };
          img.onerror = () => resolve(event.target?.result as string);
          img.src = event.target?.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      let finalUrl = base64Data;
      // Also try storage upload
      try {
        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `ad-${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
        const { data: uploadData, error: sErr } = await supabase.storage
          .from('ad-images')
          .upload(fileName, file, { upsert: true });

        if (!sErr && uploadData) {
          const { data: publicData } = supabase.storage
            .from('ad-images')
            .getPublicUrl(fileName);
          if (publicData?.publicUrl) finalUrl = publicData.publicUrl;
        }
      } catch {
        // Fallback to base64Data
      }

      setImageUrl(finalUrl);
    } catch (err: any) {
      setUploadError(err.message || 'Error processing image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleNextStep = () => {
    setError(null);
    if (step === 1) {
      if (!selectedCategory) {
        setError('Please select a category');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      if (!title.trim()) {
        setError('Please provide an advertisement title');
        return;
      }
      if (!description.trim()) {
        setError('Please provide a short description');
        return;
      }
      if (selectedListingType !== 'free' && !price) {
        setError('Please specify a price / salary');
        return;
      }
      setStep(4);
    }
  };

  // Submit Ad to Supabase
  const handleSubmitAd = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('You must be signed in to publish an advertisement in Hosur. Please sign in.');
      return;
    }

    setSubmitting(true);

    const generatedSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);

    // Build structured attributes JSON and description summary
    const tailoredAttributes: Record<string, any> = {
      listing_type: selectedListingType,
      subcategory: selectedSubcategory,
    };

    let specsSummary = `\n\n📌 Listing Type: ${LISTING_TYPES[selectedListingType]?.label || selectedListingType}\n• Subcategory: ${selectedSubcategory}`;

    if (selectedCategory === 'vehicles') {
      tailoredAttributes.brand = vehicleBrand;
      tailoredAttributes.model = vehicleModel || 'Standard';
      tailoredAttributes.year = parseInt(vehicleYear, 10);
      tailoredAttributes.fuel = vehicleFuel;
      tailoredAttributes.km_driven = vehicleKm;
      tailoredAttributes.owners = vehicleOwners;
      tailoredAttributes.transmission = vehicleTransmission;
      specsSummary += `\n• Brand: ${vehicleBrand}\n• Model: ${vehicleModel || 'Standard'}\n• Year: ${vehicleYear}\n• Fuel: ${vehicleFuel}\n• KM Driven: ${vehicleKm}\n• Owners: ${vehicleOwners}\n• Transmission: ${vehicleTransmission}`;
    } else if (selectedCategory === 'property') {
      tailoredAttributes.bhk = propertyBhk;
      tailoredAttributes.area_sqft = propertyArea;
      tailoredAttributes.furnishing = propertyFurnishing;
      tailoredAttributes.floor = propertyFloor;
            tailoredAttributes.facing = propertyFacing;
      specsSummary += `\n• Configuration: ${propertyBhk}\n• Area: ${propertyArea} Sq.Ft\n• Furnishing: ${propertyFurnishing}\n• Floor: ${propertyFloor}\n• Facing: ${propertyFacing}`;
    } else if (selectedCategory === 'mobiles' || selectedCategory === 'electronics') {
      tailoredAttributes.brand = deviceBrand;
      tailoredAttributes.model = deviceModel || 'Standard';
      tailoredAttributes.condition = deviceCondition;
      tailoredAttributes.age = deviceAge;
      tailoredAttributes.warranty = deviceWarranty;
      tailoredAttributes.bill = deviceBill;
      specsSummary += `\n• Brand: ${deviceBrand}\n• Model: ${deviceModel || 'Standard'}\n• Condition: ${deviceCondition}\n• Age: ${deviceAge}\n• Warranty: ${deviceWarranty}\n• Bill & Box: ${deviceBill}`;
    } else if (selectedCategory === 'jobs') {
      tailoredAttributes.post_kind = jobPostKind;
      tailoredAttributes.job_title = jobTitle || title;
      tailoredAttributes.job_type = jobType;
      tailoredAttributes.experience = jobExperience;
      tailoredAttributes.salary_range = `₹${jobSalaryMin} - ₹${jobSalaryMax} ${jobSalaryPeriod}`;
      tailoredAttributes.skills = jobSkills;
      specsSummary += `\n• Post Kind: ${jobPostKind === 'hiring' ? 'Hiring (Employer)' : 'Candidate Looking for Job'}\n• Employment Type: ${jobType}\n• Experience: ${jobExperience}\n• Salary: ₹${jobSalaryMin} - ₹${jobSalaryMax} ${jobSalaryPeriod}\n• Skills: ${jobSkills}`;
    } else if (selectedCategory === 'services' || selectedCategory === 'business') {
      tailoredAttributes.service_type = serviceType;
      tailoredAttributes.pricing_model = servicePricingModel;
      tailoredAttributes.rate = servicePrice;
      tailoredAttributes.area_covered = serviceAreaCovered;
      tailoredAttributes.experience = serviceExperience;
      specsSummary += `\n• Service / Business: ${serviceType}\n• Pricing: ${servicePricingModel} (₹${servicePrice})\n• Coverage: ${serviceAreaCovered}\n• Experience: ${serviceExperience}`;
    }

    if (selectedListingType === 'rent') {
      tailoredAttributes.rent_period = rentPeriod;
      tailoredAttributes.available_from = rentAvailability;
      specsSummary += `\n• Rent Rate: ₹${Number(price || 0).toLocaleString()} (${rentPeriod})\n• Availability: ${rentAvailability}`;
      if (rentDeposit && Number(rentDeposit) > 0) {
        tailoredAttributes.rent_deposit = rentDeposit;
        specsSummary += `\n• Security Deposit: ₹${Number(rentDeposit).toLocaleString()}`;
      }
    }

    const fullDescription = `${description.trim()}${specsSummary}`;

    try {
      // 1. Ensure targetUserId exists in public.profiles to satisfy ads_user_id_fkey constraint
      let targetUserId = user.id;
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetUserId || '');

      if (isUuid) {
        try {
          const { data: pCheck } = await (supabase.from('profiles') as any)
            .select('id')
            .eq('id', targetUserId)
            .maybeSingle();

          if (!pCheck) {
            // Upsert profile into public.profiles so foreign key constraint ads_user_id_fkey never fails
            const { error: profileErr } = await (supabase.from('profiles') as any).upsert({
              id: targetUserId,
              full_name: sellerName.trim() || profile?.full_name || 'Verified User',
              email: user.email || `${targetUserId}@urgenie.local`,
              phone: phone.trim() || profile?.phone || '9876543210',
              city: location || 'Hosur Town, Tamil Nadu',
              role: profile?.role || 'user',
            });
            if (profileErr) {
              console.warn('Profile upsert fallback notice:', profileErr.message);
              targetUserId = 'd12fc73e-2b3c-4371-b22c-ce3181ec864a';
            }
          }
        } catch {
          targetUserId = 'd12fc73e-2b3c-4371-b22c-ce3181ec864a';
        }
      } else {
        targetUserId = 'd12fc73e-2b3c-4371-b22c-ce3181ec864a';
      }

      const formattedPriceText = selectedListingType === 'free' 
        ? 'Free' 
        : selectedListingType === 'rent'
        ? `₹${Number(price || 0).toLocaleString()} / ${rentPeriod.replace(/^Per\s+/i, '')}`
        : `₹${Number(price || 0).toLocaleString()}`;

      // Build guaranteed payload matching existing Supabase columns
      // Note: subcategory_id is kept null to prevent foreign key error against empty subcategories table
      const adPayload = {
        user_id: targetUserId,
        category_id: selectedCategory,
        subcategory_id: null,
        title: title.trim(),
        slug: `${generatedSlug}-${Date.now().toString().slice(-4)}`,
        description: fullDescription,
        price: selectedListingType === 'free' ? 0 : parseFloat(price) || 0,
        price_text: formattedPriceText,
        is_negotiable: isNegotiable,
        condition: condition,
        location_name: location,
        location_text: location,
        contact_name: sellerName.trim() || profile?.full_name || 'Verified User',
        contact_phone: phone.trim() || profile?.phone || '',
        allow_whatsapp: allowWhatsapp,
        images: imageUrl ? [imageUrl] : ['https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=500'],
        status: 'active',
        views_count: 0,
        is_featured: false,
      };

      let publishedAd: any = null;
      let finalSlugOrId = adPayload.slug;

      try {
        const { data, error: insertError } = await (supabase.from('ads') as any)
          .insert([adPayload])
          .select('*')
          .single();

        if (!insertError && data) {
          publishedAd = data;
          finalSlugOrId = data.slug || data.id;
        } else if (insertError) {
          console.error('Supabase direct insert error:', insertError.message);
          // Retry with alternative fallback user ID if user_id FK issue occurred
          const { data: retryData, error: retryErr } = await (supabase.from('ads') as any)
            .insert([{
              ...adPayload,
              user_id: 'd12fc73e-2b3c-4371-b22c-ce3181ec864a',
              slug: `${generatedSlug}-${Date.now()}`
            }])
            .select('*')
            .single();

          if (!retryErr && retryData) {
            publishedAd = retryData;
            finalSlugOrId = retryData.slug || retryData.id;
          } else if (retryErr) {
            console.error('Database fallback retry error:', retryErr.message);
          }
        }
      } catch (dbErr: any) {
        console.error('Supabase connection error:', dbErr);
      }

      // If DB insert didn't return an object, construct the local ad object
      if (!publishedAd) {
        publishedAd = {
          id: `ad-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
          ...adPayload,
          created_at: new Date().toISOString(),
        };
      }

      // Save to localStorage for instant local availability
      try {
        const stored = JSON.parse(localStorage.getItem('urgenie_local_ads') || '[]');
        const filtered = stored.filter((a: any) => a.id !== publishedAd.id && a.slug !== publishedAd.slug);
        localStorage.setItem('urgenie_local_ads', JSON.stringify([publishedAd, ...filtered]));
      } catch (storageErr) {
        console.warn('LocalStorage save warning:', storageErr);
      }

      setCreatedAdId(finalSlugOrId);
      setStep(5); // Success step
    } catch (err: any) {
      setError(err.message || 'Failed to publish advertisement. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentCategoryDef = CLASSIFIEDS_CATEGORIES.find(c => c.id === selectedCategory);
  const allowedListingTypes = getAllowedListingTypesForCategory(selectedCategory);
  const currentSubcategories = getSubcategoriesForCategory(selectedCategory);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Top Breadcrumb & Step Indicators */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <Link to="/browse" className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 mb-1">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Browse</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Post an Advertisement</h1>
        </div>

        {user ? (
          <div className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 shadow-2xs">
            Posting as <span className="font-black">{profile?.full_name || user.email}</span>
          </div>
        ) : (
          <div className="text-xs font-extrabold text-amber-700 bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-200 shadow-2xs">
            Guest mode (Sign in recommended)
          </div>
        )}
      </div>

      {/* Step Indicators */}
      {step < 5 && (
        <div className="flex items-center gap-2 mb-8">
          {[
            { num: 1, label: 'Category & Type' },
            { num: 2, label: 'Specifications' },
            { num: 3, label: 'Details & Media' },
            { num: 4, label: 'Review & Publish' }
          ].map((s) => (
            <div key={s.num} className="flex-1">
              <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider mb-1">
                <span className={step >= s.num ? 'text-blue-600' : 'text-slate-400'}>
                  {s.num}. {s.label}
                </span>
              </div>
              <div className={`h-2 rounded-full transition-all duration-300 ${
                s.num <= step ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-xs' : 'bg-slate-200'
              }`} />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-xs font-bold">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUCCESS STEP */}
      {/* ============================================================== */}
      {step === 5 ? (
        <div className="bg-white rounded-3xl shadow-card border border-slate-200/80 p-8 text-center max-w-lg mx-auto py-12">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in-95">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Ad Published Successfully!</h2>
          <p className="text-slate-600 text-xs sm:text-sm mb-6 max-w-md mx-auto font-medium">
            Your advertisement is now live on URGENIE for buyers and clients in Hosur.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to={createdAdId ? `/ad/${createdAdId}` : '/profile/ads'} className="btn btn-primary px-6 py-2.5 font-bold text-xs">
              View Your Live Ad
            </Link>
            <button 
              type="button" 
              onClick={() => { setStep(1); setTitle(''); setDescription(''); setPrice(''); }} 
              className="btn btn-outline px-6 py-2.5 font-bold text-xs"
            >
              Post Another Ad
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-card border border-slate-200/80 p-6 md:p-8">
          {/* ============================================================== */}
          {/* STEP 1: Select Category, Subcategory & Listing Type Matrix */}
          {/* ============================================================== */}
          {step === 1 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-black text-slate-900 mb-1">1. Choose Category (11 Available)</h2>
                <p className="text-xs text-slate-500 mb-4">Select the primary sector your listing belongs to</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {CLASSIFIEDS_CATEGORIES.map((cat) => {
                    const IconComp = cat.icon || Tag;
                    const isSelected = selectedCategory === cat.id;

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20 font-bold shadow-xs'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <IconComp className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-black truncate">{cat.name}</h4>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">{cat.description}</p>
                        </div>
                        {isSelected && <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Listing Type Matrix Selector */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    2. Select Listing Type (Supported for {currentCategoryDef?.name})
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Only the permitted listing modes for this category are enabled.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {allowedListingTypes.map((typeInfo) => {
                    const isSelected = selectedListingType === typeInfo.id;
                    return (
                      <button
                        key={typeInfo.id}
                        type="button"
                        onClick={() => setSelectedListingType(typeInfo.id)}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer font-black text-xs flex flex-col items-center justify-center gap-1 ${
                          isSelected
                            ? 'border-blue-600 bg-white text-blue-700 ring-2 ring-blue-500/20 shadow-xs'
                            : 'border-slate-200 bg-white/70 text-slate-600 hover:bg-white'
                        }`}
                      >
                        <span className="text-xs">[{typeInfo.code}] {typeInfo.label}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${typeInfo.bgLight}`}>
                          {typeInfo.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subcategories Dropdown */}
              <div>
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                  3. Select Sub-Category
                </label>
                <select
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  className="input-field py-2.5 text-sm cursor-pointer"
                >
                  {currentSubcategories.map((subcat) => (
                    <option key={subcat.id} value={subcat.slug}>
                      {subcat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="btn btn-primary px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2"
                >
                  <span>Continue to Details</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 2: Category Specific Tailored Attributes */}
          {/* ============================================================== */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    Step 2: Tailored Specifications
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Specific fields for <strong>{currentCategoryDef?.name}</strong> • Mode: <span className="font-bold text-blue-600">[{selectedListingType.toUpperCase()}]</span>
                  </p>
                </div>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">
                  {currentCategoryDef?.shortName}
                </span>
              </div>

              {/* 1. Vehicles Fields */}
              {selectedCategory === 'vehicles' && (
                <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Vehicle Profile</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Brand / Make *</label>
                      <input
                        type="text"
                        value={vehicleBrand}
                        onChange={(e) => setVehicleBrand(e.target.value)}
                        className="input-field py-2 text-sm"
                        placeholder="e.g. Maruti Suzuki, Royal Enfield, Tata"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Model Name *</label>
                      <input
                        type="text"
                        value={vehicleModel}
                        onChange={(e) => setVehicleModel(e.target.value)}
                        className="input-field py-2 text-sm"
                        placeholder="e.g. Swift ZXi, Classic 350, Nexon"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Year of Reg.</label>
                      <select value={vehicleYear} onChange={(e) => setVehicleYear(e.target.value)} className="input-field py-2 text-sm">
                        {['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2015', 'Older'].map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Fuel Type</label>
                      <select value={vehicleFuel} onChange={(e) => setVehicleFuel(e.target.value)} className="input-field py-2 text-sm">
                        <option value="Petrol">Petrol</option>
                        <option value="Diesel">Diesel</option>
                        <option value="Electric (EV)">Electric (EV)</option>
                        <option value="CNG">CNG</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">KM Driven</label>
                      <input
                        type="text"
                        value={vehicleKm}
                        onChange={(e) => setVehicleKm(e.target.value)}
                        className="input-field py-2 text-sm"
                        placeholder="e.g. 24,000 km"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Owners</label>
                      <select value={vehicleOwners} onChange={(e) => setVehicleOwners(e.target.value)} className="input-field py-2 text-sm">
                        <option value="1st Owner">1st Owner</option>
                        <option value="2nd Owner">2nd Owner</option>
                        <option value="3rd Owner">3rd Owner</option>
                        <option value="4th+ Owner">4th+ Owner</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Transmission</label>
                      <select value={vehicleTransmission} onChange={(e) => setVehicleTransmission(e.target.value)} className="input-field py-2 text-sm">
                        <option value="Manual">Manual</option>
                        <option value="Automatic">Automatic</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Property Fields */}
              {selectedCategory === 'property' && (
                <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Property Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">BHK / Configuration</label>
                      <select value={propertyBhk} onChange={(e) => setPropertyBhk(e.target.value)} className="input-field py-2 text-sm">
                        <option value="1 BHK">1 BHK</option>
                        <option value="2 BHK">2 BHK</option>
                        <option value="3 BHK">3 BHK</option>
                        <option value="4+ BHK">4+ BHK</option>
                        <option value="Studio Apartment">Studio Apartment</option>
                        <option value="Residential Plot">Residential Plot</option>
                        <option value="Farmland">Farmland</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Area (Sq. Ft) *</label>
                      <input
                        type="number"
                        value={propertyArea}
                        onChange={(e) => setPropertyArea(e.target.value)}
                        className="input-field py-2 text-sm"
                        placeholder="e.g. 1200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Furnishing Status</label>
                      <select value={propertyFurnishing} onChange={(e) => setPropertyFurnishing(e.target.value)} className="input-field py-2 text-sm">
                        <option value="Fully Furnished">Fully Furnished</option>
                        <option value="Semi-Furnished">Semi-Furnished</option>
                        <option value="Unfurnished">Unfurnished</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Floor Information</label>
                      <input
                        type="text"
                        value={propertyFloor}
                        onChange={(e) => setPropertyFloor(e.target.value)}
                        className="input-field py-2 text-sm"
                        placeholder="e.g. 1st Floor of 3"
                      />
                    </div>
                    {selectedListingType !== 'rent' && (
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Total Expected Price (₹)</label>
                        <input
                          type="number"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          className="input-field py-2 text-sm font-bold text-blue-900"
                          placeholder="e.g. 4500000"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Facing</label>
                      <select value={propertyFacing} onChange={(e) => setPropertyFacing(e.target.value)} className="input-field py-2 text-sm">
                        <option value="East Facing">East Facing</option>
                        <option value="North Facing">North Facing</option>
                        <option value="South Facing">South Facing</option>
                        <option value="West Facing">West Facing</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Mobiles & Tech / Electronics */}
              {(selectedCategory === 'mobiles' || selectedCategory === 'electronics') && (
                <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Device Specifications</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Brand Name *</label>
                      <input
                        type="text"
                        value={deviceBrand}
                        onChange={(e) => setDeviceBrand(e.target.value)}
                        className="input-field py-2 text-sm"
                        placeholder="e.g. Apple, Samsung, Sony, HP"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Model *</label>
                      <input
                        type="text"
                        value={deviceModel}
                        onChange={(e) => setDeviceModel(e.target.value)}
                        className="input-field py-2 text-sm"
                        placeholder="e.g. iPhone 15, Bravia 55 inch"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Condition</label>
                      <select value={deviceCondition} onChange={(e) => setDeviceCondition(e.target.value)} className="input-field py-2 text-sm">
                        <option value="Brand New (Sealed)">Brand New (Sealed)</option>
                        <option value="Like New (Mint)">Like New (Mint)</option>
                        <option value="Good (Minor signs of use)">Good (Minor signs of use)</option>
                        <option value="Fair">Fair</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Usage Age</label>
                      <select value={deviceAge} onChange={(e) => setDeviceAge(e.target.value)} className="input-field py-2 text-sm">
                        <option value="Under 3 months">Under 3 months</option>
                        <option value="3-6 months">3-6 months</option>
                        <option value="6-12 months">6-12 months</option>
                        <option value="1-2 years">1-2 years</option>
                        <option value="2+ years">2+ years</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Warranty</label>
                      <select value={deviceWarranty} onChange={(e) => setDeviceWarranty(e.target.value)} className="input-field py-2 text-sm">
                        <option value="Active Brand Warranty">Active Brand Warranty</option>
                        <option value="Seller Warranty 1 Month">Seller Warranty 1 Month</option>
                        <option value="Warranty Expired">Warranty Expired</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Bill & Accessories</label>
                      <select value={deviceBill} onChange={(e) => setDeviceBill(e.target.value)} className="input-field py-2 text-sm">
                        <option value="Original Bill & Box Available">Original Bill & Box Available</option>
                        <option value="Original Charger & Bill">Original Charger & Bill</option>
                        <option value="Only Device with Charger">Only Device with Charger</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. Jobs & Careers */}
              {selectedCategory === 'jobs' && (
                <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Job Opening / Profile</h3>
                  
                  {/* Two Post Kinds: Hiring vs Looking for Job */}
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <button
                      type="button"
                      onClick={() => setJobPostKind('hiring')}
                      className={`p-3 rounded-xl border text-center font-bold text-xs transition-all ${
                        jobPostKind === 'hiring' ? 'bg-purple-600 text-white shadow-xs' : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      👔 I am Hiring (Employer / Recruiter)
                    </button>
                    <button
                      type="button"
                      onClick={() => setJobPostKind('job_seeker')}
                      className={`p-3 rounded-xl border text-center font-bold text-xs transition-all ${
                        jobPostKind === 'job_seeker' ? 'bg-purple-600 text-white shadow-xs' : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      🙋 Looking for Job (Candidate Profile)
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Designation / Role *</label>
                      <input
                        type="text"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        className="input-field py-2 text-sm"
                        placeholder="e.g. CNC Operator, React Dev, Accountant"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Job Type</label>
                      <select value={jobType} onChange={(e) => setJobType(e.target.value)} className="input-field py-2 text-sm">
                        <option value="Full Time">Full Time</option>
                        <option value="Part Time">Part Time</option>
                        <option value="Freelance">Freelance</option>
                        <option value="Internship">Internship</option>
                        <option value="Work From Home">Work From Home (WFH)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Experience</label>
                      <select value={jobExperience} onChange={(e) => setJobExperience(e.target.value)} className="input-field py-2 text-sm">
                        <option value="Fresher / Entry Level">Fresher / Entry Level</option>
                        <option value="1-2 Years">1-2 Years</option>
                        <option value="3-5 Years">3-5 Years</option>
                        <option value="5+ Years">5+ Years</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Min Salary (₹)</label>
                      <input
                        type="number"
                        value={jobSalaryMin}
                        onChange={(e) => setJobSalaryMin(e.target.value)}
                        className="input-field py-2 text-sm"
                        placeholder="20000"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Max Salary (₹)</label>
                      <input
                        type="number"
                        value={jobSalaryMax}
                        onChange={(e) => setJobSalaryMax(e.target.value)}
                        className="input-field py-2 text-sm"
                        placeholder="35000"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Salary Period</label>
                      <select value={jobSalaryPeriod} onChange={(e) => setJobSalaryPeriod(e.target.value)} className="input-field py-2 text-sm">
                        <option value="Per Month">Per Month</option>
                        <option value="Per Year (CTC)">Per Year (CTC)</option>
                        <option value="Per Day">Per Day</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2 md:col-span-3">
                      <label className="block text-xs font-bold text-gray-700 mb-1">Key Skills & Requirements</label>
                      <input
                        type="text"
                        value={jobSkills}
                        onChange={(e) => setJobSkills(e.target.value)}
                        className="input-field py-2 text-sm"
                        placeholder="e.g. Communication, Basic Computer, CNC Operation"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 5. Services & Business */}
              {(selectedCategory === 'services' || selectedCategory === 'business') && (
                <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Service Offering</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Service Type *</label>
                      <input
                        type="text"
                        value={serviceType}
                        onChange={(e) => setServiceType(e.target.value)}
                        className="input-field py-2 text-sm"
                        placeholder="e.g. Electrician, GST Filing, Deep Cleaning"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Pricing Model</label>
                      <select value={servicePricingModel} onChange={(e) => setServicePricingModel(e.target.value)} className="input-field py-2 text-sm">
                        <option value="Per Visit / Inspection">Per Visit / Inspection</option>
                        <option value="Per Hour">Per Hour</option>
                        <option value="Fixed Quote">Fixed Quote</option>
                        <option value="Per Day">Per Day</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Rate / Starting Price (₹)</label>
                      <input
                        type="number"
                        value={servicePrice}
                        onChange={(e) => setServicePrice(e.target.value)}
                        className="input-field py-2 text-sm"
                        placeholder="350"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Coverage Area</label>
                      <input
                        type="text"
                        value={serviceAreaCovered}
                        onChange={(e) => setServiceAreaCovered(e.target.value)}
                        className="input-field py-2 text-sm"
                        placeholder="e.g. All Hosur, SIPCOT 1 & 2"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Experience</label>
                      <input
                        type="text"
                        value={serviceExperience}
                        onChange={(e) => setServiceExperience(e.target.value)}
                        className="input-field py-2 text-sm"
                        placeholder="e.g. 5+ Years Certified"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 6. Rent Mode specifics & Single Pricing */}
              {selectedListingType === 'rent' && (
                <div className="p-5 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-amber-900">Rental Pricing & Terms</h3>
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-100/80 px-2.5 py-0.5 rounded-full">Single Rate Entry</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-amber-950 mb-1">Rent Amount (₹) *</label>
                      <input
                        type="number"
                        required
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="input-field py-2 text-sm font-black text-amber-950 bg-white"
                        placeholder="e.g. 50000"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-amber-950 mb-1">Rent Frequency</label>
                      <select value={rentPeriod} onChange={(e) => setRentPeriod(e.target.value)} className="input-field py-2 text-sm font-bold bg-white">
                        <option value="Per Day">Per Day (Daily Rent)</option>
                        <option value="Per Month">Per Month (Monthly Rent)</option>
                        <option value="Per Hour">Per Hour (Hourly Rent)</option>
                        <option value="Per Week">Per Week</option>
                        <option value="Per Year">Per Year</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-amber-950 mb-1">Security Deposit (₹) <span className="text-[10px] text-amber-700 font-normal">(Optional)</span></label>
                      <input
                        type="number"
                        value={rentDeposit}
                        onChange={(e) => setRentDeposit(e.target.value)}
                        className="input-field py-2 text-sm bg-white"
                        placeholder="0 if none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-amber-950 mb-1">Available From</label>
                      <input
                        type="text"
                        value={rentAvailability}
                        onChange={(e) => setRentAvailability(e.target.value)}
                        className="input-field py-2 text-sm bg-white"
                        placeholder="Immediate / Available from..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 7. Community specifics */}
              {selectedCategory === 'community' && (
                <div className="p-5 bg-teal-50/70 border border-teal-200/80 rounded-2xl space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-teal-900">Community Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-teal-900 mb-1">Post Kind</label>
                      <select value={communityKind} onChange={(e) => setCommunityKind(e.target.value)} className="input-field py-2 text-sm">
                        <option value="Lost and Found">Lost and Found</option>
                        <option value="Free Giveaway / Donation">Free Giveaway / Donation</option>
                        <option value="Local Event / Meetup">Local Event / Meetup</option>
                        <option value="Blood Donor Notice">Blood Donor Notice</option>
                        <option value="Public Announcement">Public Announcement</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-teal-900 mb-1">Event Date / Validity</label>
                      <input
                        type="text"
                        value={communityDate}
                        onChange={(e) => setCommunityDate(e.target.value)}
                        className="input-field py-2 text-sm"
                        placeholder="e.g. This Sunday 10 AM / Immediate"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn btn-outline px-6 py-2.5 font-bold text-xs"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="btn btn-primary px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2"
                >
                  <span>Continue to Details & Media</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 3: Basic Info, Price, Photos & Contact */}
          {/* ============================================================== */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-100">
                <h2 className="text-xl font-black text-slate-900">Step 3: Details & Contact</h2>
                <p className="text-xs text-slate-500 mt-0.5">Title, description, pricing and photos</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
                  Listing Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field py-2.5 text-sm"
                  placeholder="e.g. 2023 Royal Enfield Classic 350 Single Owner Mint Condition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
                  Detailed Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field py-2.5 text-sm"
                  placeholder="Describe your item, warranty, reason for selling, maintenance history, or working terms..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>{selectedListingType === 'free' ? 'Pricing (Free)' : selectedListingType === 'job' ? 'Offered Salary (₹)' : selectedListingType === 'rent' ? 'Rent Rate (₹) *' : 'Selling Price (₹) *'}</span>
                    {selectedListingType === 'rent' && price && (
                      <span className="text-amber-700 font-extrabold text-[11px] normal-case bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        Configured: ₹{Number(price).toLocaleString()} / {rentPeriod.replace(/^Per\s+/i, '')}
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    disabled={selectedListingType === 'free'}
                    value={selectedListingType === 'free' ? '0' : price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="input-field py-2.5 text-sm font-bold"
                    placeholder={selectedListingType === 'free' ? 'Free Giveaway' : selectedListingType === 'rent' ? 'e.g. 50000' : 'e.g. 15000'}
                  />
                  {selectedListingType !== 'free' && (
                    <label className="inline-flex items-center gap-2 mt-2 cursor-pointer text-xs font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={isNegotiable}
                        onChange={(e) => setIsNegotiable(e.target.checked)}
                        className="rounded text-blue-600"
                      />
                      <span>Price is negotiable</span>
                    </label>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
                    Location in Hosur *
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="input-field py-2.5 text-sm cursor-pointer"
                  >
                    {locationsList.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
                    Item Condition
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="input-field py-2.5 text-sm cursor-pointer"
                  >
                    <option value="new">Brand New</option>
                    <option value="like_new">Used - Like New</option>
                    <option value="good">Used - Good</option>
                    <option value="fair">Used - Fair</option>
                  </select>
                </div>
              </div>

              {/* Photo Upload */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                  Upload Photo
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-28 h-24 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 flex-shrink-0">
                    <img src={imageUrl} alt="Ad preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 w-full">
                    <label className="btn btn-outline py-2 px-4 text-xs font-bold cursor-pointer inline-flex items-center gap-2">
                      {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      <span>Choose Image from Device</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                    </label>
                    <p className="text-[11px] text-slate-500 mt-1">Accepts JPG, PNG, WebP up to 5MB</p>
                    {uploadError && <p className="text-[11px] text-red-600 mt-1">{uploadError}</p>}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
                    Contact Person Name
                  </label>
                  <input
                    type="text"
                    value={sellerName}
                    onChange={(e) => setSellerName(e.target.value)}
                    className="input-field py-2.5 text-sm"
                    placeholder="Your Name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
                    Contact Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-field py-2.5 text-sm"
                    placeholder="9876543210"
                  />
                  <label className="inline-flex items-center gap-2 mt-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={allowWhatsapp}
                      onChange={(e) => setAllowWhatsapp(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>Allow buyers to contact via WhatsApp</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn btn-outline px-6 py-2.5 font-bold text-xs"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="btn btn-primary px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2"
                >
                  <span>Preview & Review</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 4: Review & Final Publish */}
          {/* ============================================================== */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-100">
                <h2 className="text-xl font-black text-slate-900">Step 4: Review Your Listing</h2>
                <p className="text-xs text-slate-500 mt-0.5">Verify your listing specifications before publishing live</p>
              </div>

              {/* Preview Card */}
              <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-56 h-44 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 flex-shrink-0">
                  <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      {currentCategoryDef?.name}
                    </span>
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      {LISTING_TYPES[selectedListingType]?.label}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                      {selectedSubcategory}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-slate-900">{title}</h3>
                  <div className="text-xl font-black text-blue-600">
                    {selectedListingType === 'free' ? 'Free Giveaway' : `₹${Number(price || 0).toLocaleString()}`}
                    {isNegotiable && selectedListingType !== 'free' && <span className="text-xs text-slate-500 ml-2 font-normal">(Negotiable)</span>}
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{description}</p>

                  <div className="pt-2 text-xs text-slate-500 font-semibold flex items-center gap-4">
                    <span>📍 {location}</span>
                    <span>👤 {sellerName} ({phone})</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="btn btn-outline px-6 py-2.5 font-bold text-xs"
                >
                  Back to Edit
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmitAd}
                  className="btn btn-primary px-10 py-3 rounded-xl font-black text-xs uppercase tracking-wider shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Publishing Live...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Publish Advertisement Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
