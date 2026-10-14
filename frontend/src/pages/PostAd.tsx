import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight, CheckCircle2, AlertCircle, ArrowLeft, Image as ImageIcon, Tag, Car, Building2, Smartphone, Tv, Briefcase, Wrench, Sofa, Store, Upload, Loader2, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const DEFAULT_CATEGORIES = [
  { id: 'vehicles', name: 'Vehicles & Bikes', icon: Car },
  { id: 'property', name: 'Houses & Plots', icon: Building2 },
  { id: 'mobiles', name: 'Mobiles & Tablets', icon: Smartphone },
  { id: 'electronics', name: 'Electronics & Appliances', icon: Tv },
  { id: 'jobs', name: 'Jobs & Openings', icon: Briefcase },
  { id: 'services', name: 'Local Services', icon: Wrench },
  { id: 'furniture', name: 'Home & Furniture', icon: Sofa },
  { id: 'commercial', name: 'Commercial & Industrial', icon: Store },
];

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
  const { user, profile, signIn } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<any[]>(DEFAULT_CATEGORIES);
  const [locationsList, setLocationsList] = useState<string[]>(DEFAULT_LOCATIONS);
  const [selectedCategory, setSelectedCategory] = useState<string>('vehicles');
  
  // Basic Info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('like_new');
  const [isNegotiable, setIsNegotiable] = useState(true);
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [location, setLocation] = useState('Hosur Town Center');
  const [sellerName, setSellerName] = useState(profile?.full_name || 'Seller');
  const [phone, setPhone] = useState(profile?.phone || '9876543210');
  const [allowWhatsapp, setAllowWhatsapp] = useState(true);

  useEffect(() => {
    if (profile) {
      if (profile.full_name) setSellerName(profile.full_name);
      if (profile.phone) setPhone(profile.phone);
    }
  }, [profile]);

  // Category Specific Attributes
  // 1. Vehicles
  const [vehicleType, setVehicleType] = useState('Motorcycle / Bike');
  const [vehicleBrand, setVehicleBrand] = useState('Royal Enfield');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState('2022');
  const [vehicleFuel, setVehicleFuel] = useState('Petrol');
  const [vehicleKm, setVehicleKm] = useState('');
  const [vehicleOwners, setVehicleOwners] = useState('1st Owner');

  // 2. Properties
  const [propertyType, setPropertyType] = useState('Independent House');
  const [propertyListingType, setPropertyListingType] = useState('For Rent');
  const [propertyBhk, setPropertyBhk] = useState('2 BHK');
  const [propertyArea, setPropertyArea] = useState('');
  const [propertyFurnishing, setPropertyFurnishing] = useState('Semi-Furnished');
  const [propertyWater, setPropertyWater] = useState('24/7 Cauvery & Borewell');

  // 3. Jobs
  const [jobRole, setJobRole] = useState('');
  const [jobType, setJobType] = useState('Full Time');
  const [jobExperience, setJobExperience] = useState('1-2 Years');
  const [jobEducation, setJobEducation] = useState('ITI / Diploma');
  const [jobShift, setJobShift] = useState('Day Shift');
  const [companyName, setCompanyName] = useState('');

  // 4. Mobiles
  const [mobileBrand, setMobileBrand] = useState('Apple');
  const [mobileModel, setMobileModel] = useState('');
  const [mobileStorage, setMobileStorage] = useState('128GB');
  const [mobileRam, setMobileRam] = useState('8GB');
  const [mobileBatteryHealth, setMobileBatteryHealth] = useState('95%');

  // 5. Electronics
  const [electronicsType, setElectronicsType] = useState('Smart TV');
  const [electronicsBrand, setElectronicsBrand] = useState('Sony');
  const [electronicsAge, setElectronicsAge] = useState('1-2 Years');
  const [electronicsWarranty, setElectronicsWarranty] = useState('Under Warranty');

  // 6. Services
  const [serviceType, setServiceType] = useState('Electrician');
  const [servicePricing, setServicePricing] = useState('Fixed Rate');

  // 7. Furniture
  const [furnitureType, setFurnitureType] = useState('Sofa Set');
  const [furnitureMaterial, setFurnitureMaterial] = useState('Teak Wood');

  // 8. Commercial
  const [commercialType, setCommercialType] = useState('Industrial Shed / Warehouse');
  const [commercialPower, setCommercialPower] = useState('50 HP');
  const [commercialArea, setCommercialArea] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdAdId, setCreatedAdId] = useState<string | null>(null);
  const [postedSuccess, setPostedSuccess] = useState(false);

  useEffect(() => {
    // 1. Fetch live categories from Supabase
    const fetchLiveCategoriesAndLocations = async () => {
      try {
        const { data: catData } = await (supabase.from('categories') as any).select('*').order('sort_order', { ascending: true });
        if (catData && catData.length > 0) {
          setCategories(catData.map((c: any) => ({
            id: c.id,
            name: c.name,
            icon: c.id === 'vehicles' ? Car :
                  c.id === 'property' ? Building2 :
                  c.id === 'mobiles' ? Smartphone :
                  c.id === 'electronics' ? Tv :
                  c.id === 'jobs' ? Briefcase :
                  c.id === 'services' ? Wrench :
                  c.id === 'furniture' ? Sofa :
                  c.id === 'commercial' ? Store : Tag,
          })));
        }

        const { data: locData } = await (supabase.from('locations') as any).select('name').order('name', { ascending: true });
        if (locData && locData.length > 0) {
          setLocationsList(locData.map((l: any) => l.name));
        }
      } catch (err) {
        console.warn('Using default categories/locations');
      }
    };
    fetchLiveCategoriesAndLocations();
  }, []);

  useEffect(() => {
    // Preset image recommendations based on category
    if (selectedCategory === 'vehicles') {
      setImageUrl('https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600');
    } else if (selectedCategory === 'property') {
      setImageUrl('https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600');
    } else if (selectedCategory === 'jobs') {
      setImageUrl('https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600');
    } else if (selectedCategory === 'mobiles') {
      setImageUrl('https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=600');
    } else if (selectedCategory === 'electronics') {
      setImageUrl('https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600');
    } else if (selectedCategory === 'commercial') {
      setImageUrl('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600');
    }
  }, [selectedCategory]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image size must be less than 10MB');
      return;
    }

    setUploadingImage(true);
    setUploadError(null);

    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `ad-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error: uploadErr } = await supabase.storage
        .from('ad-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadErr) {
        console.warn('Storage bucket note:', uploadErr.message);
        // Fallback to local preview URL
        const localUrl = URL.createObjectURL(file);
        setImageUrl(localUrl);
      } else if (data) {
        const { data: publicData } = supabase.storage
          .from('ad-images')
          .getPublicUrl(filePath);
        
        if (publicData?.publicUrl) {
          setImageUrl(publicData.publicUrl);
        }
      }
    } catch (err: any) {
      console.error('File upload error:', err);
      setUploadError(err.message || 'Failed to upload photo');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleQuickDemoLogin = async (email: string) => {
    setError(null);
    const { error: loginErr } = await signIn(email, 'password123');
    if (loginErr) {
      setError(loginErr);
    }
  };

  const handleSubmitAd = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('You must be signed in to publish an advertisement in Hosur. Please sign in below.');
      return;
    }

    setSubmitting(true);

    const generatedSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);

    // Build structured specifications text
    let specsSummary = '';
    if (selectedCategory === 'vehicles') {
      specsSummary = `\n\n📌 Vehicle Details:\n• Type: ${vehicleType}\n• Brand: ${vehicleBrand}\n• Model: ${vehicleModel || 'Standard'}\n• Year: ${vehicleYear}\n• Fuel: ${vehicleFuel}\n• KM Driven: ${vehicleKm || 'N/A'}\n• Owners: ${vehicleOwners}`;
    } else if (selectedCategory === 'property') {
      specsSummary = `\n\n📌 Property Details:\n• Type: ${propertyType} (${propertyListingType})\n• Configuration: ${propertyBhk}\n• Area: ${propertyArea ? `${propertyArea} Sq.Ft` : 'Standard'}\n• Furnishing: ${propertyFurnishing}\n• Water: ${propertyWater}`;
    } else if (selectedCategory === 'jobs') {
      specsSummary = `\n\n📌 Job Openings Details:\n• Designation: ${jobRole || title}\n• Employment Type: ${jobType}\n• Experience: ${jobExperience}\n• Education: ${jobEducation}\n• Shift: ${jobShift}\n• Company: ${companyName || 'Reputed Company in Hosur'}`;
    } else if (selectedCategory === 'mobiles') {
      specsSummary = `\n\n📌 Mobile Specifications:\n• Brand: ${mobileBrand}\n• Model: ${mobileModel || 'Standard'}\n• Storage: ${mobileStorage} | RAM: ${mobileRam}\n• Battery Health: ${mobileBatteryHealth}`;
    } else if (selectedCategory === 'electronics') {
      specsSummary = `\n\n📌 Electronics Details:\n• Device: ${electronicsType}\n• Brand: ${electronicsBrand}\n• Usage Age: ${electronicsAge}\n• Warranty: ${electronicsWarranty}`;
    } else if (selectedCategory === 'services') {
      specsSummary = `\n\n📌 Service Details:\n• Service: ${serviceType}\n• Pricing: ${servicePricing}`;
    } else if (selectedCategory === 'furniture') {
      specsSummary = `\n\n📌 Furniture Details:\n• Item: ${furnitureType}\n• Material: ${furnitureMaterial}`;
    } else if (selectedCategory === 'commercial') {
      specsSummary = `\n\n📌 Commercial Details:\n• Type: ${commercialType}\n• Power: ${commercialPower}\n• Area: ${commercialArea ? `${commercialArea} Sq.Ft` : 'Standard'}`;
    }

    const fullDescription = `${description.trim()}${specsSummary}`;

    try {
      // Ensure user_id is a valid UUID
      let targetUserId = user.id;
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetUserId);
      if (!isUuid) {
        targetUserId = '00000000-0000-0000-0000-000000000002';
      }

      // Ensure profile exists in public.profiles for targetUserId
      try {
        await (supabase.from('profiles') as any).upsert({
          id: targetUserId,
          full_name: sellerName.trim() || profile?.full_name || 'Verified Seller',
          phone: phone.trim() || profile?.phone || '',
          email: user.email || '',
          city: location || 'Hosur, Tamil Nadu',
          role: profile?.role || 'seller',
        }, { onConflict: 'id' });
      } catch {
        // Ignored
      }

      const newAdData = {
        user_id: targetUserId,
        category_id: selectedCategory,
        title: title.trim(),
        slug: generatedSlug,
        description: fullDescription,
        price: parseFloat(price) || 0,
        is_negotiable: isNegotiable,
        condition: condition,
        location_name: location,
        location_text: location,
        contact_name: sellerName.trim() || profile?.full_name || 'Verified Seller',
        contact_phone: phone.trim() || profile?.phone || '',
        allow_whatsapp: allowWhatsapp,
        images: imageUrl ? [imageUrl] : ['https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=500'],
        status: 'active',
        views_count: 0,
        is_featured: false,
      };

      const { data, error: insertError } = await (supabase.from('ads') as any)
        .insert(newAdData)
        .select()
        .single();

      if (insertError) {
        console.error('Supabase insert error:', insertError);
        setError(insertError.message || 'Failed to save advertisement. Please try again.');
        setSubmitting(false);
        return;
      }

      const newId = data?.id || generatedSlug;
      setCreatedAdId(newId);
      setPostedSuccess(true);

      setTimeout(() => {
        navigate(data?.id ? `/ad/${data.id}` : '/profile/ads');
      }, 2000);
    } catch (err: any) {
      console.error('Submission error:', err);
      setError(err.message || 'Unexpected error occurred while publishing ad');
    } finally {
      setSubmitting(false);
    }
  };

  const getPriceLabel = () => {
    if (selectedCategory === 'jobs') return 'Salary Offered (₹ / Month) *';
    if (selectedCategory === 'property' && propertyListingType === 'For Rent') return 'Monthly Rent (₹) *';
    return 'Price (₹) *';
  };

  const getTitlePlaceholder = () => {
    switch (selectedCategory) {
      case 'vehicles': return 'e.g. Royal Enfield Classic 350 - 2022 Model (Single Owner)';
      case 'property': return 'e.g. 2 BHK Independent House for Rent near SIPCOT Phase 1';
      case 'jobs': return 'e.g. CNC VMC Machine Operator & Programmer Wanted';
      case 'mobiles': return 'e.g. iPhone 14 Pro Max 256GB Space Black with Bill';
      case 'electronics': return 'e.g. Sony Bravia 55 inch 4K Ultra HD Smart Google TV';
      case 'commercial': return 'e.g. Industrial Shed 8000 Sqft with 100 HP Power for Lease';
      default: return 'e.g. Premium item in Hosur with excellent condition';
    }
  };

  return (
    <div className="container mx-auto px-4 lg:px-6 py-8 max-w-3xl">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="text-xs font-black uppercase tracking-widest text-blue-600 mb-1">Hosur Community Marketplace</div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">Post a Free Ad</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">Reach thousands of genuine local buyers across Hosur & SIPCOT</p>
        </div>
        {!user ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Not logged in?</span>
            <Link to="/login?redirect=/post-ad" className="text-xs font-bold text-blue-600 hover:underline">
              Sign In
            </Link>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('seller@urgenie.com')}
              className="text-xs font-extrabold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200 transition-colors cursor-pointer"
            >
              1-Click Demo Login
            </button>
          </div>
        ) : (
          <div className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 self-start sm:self-auto shadow-2xs">
            Posting as <span className="font-black">{profile?.full_name || user.email}</span>
          </div>
        )}
      </div>

      {!user && (
        <div className="mb-6 p-4 bg-amber-50/90 border border-amber-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-black uppercase tracking-wider">Authentication Required</p>
              <p className="text-xs text-amber-800 mt-0.5 font-medium">
                Sign in so buyers in Hosur can contact you directly and you can edit or delete your listings.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('seller@urgenie.com')}
              className="btn btn-primary text-xs py-2 px-3 shadow-xs whitespace-nowrap font-extrabold"
            >
              Sign In (Demo Seller)
            </button>
            <Link to="/login?redirect=/post-ad" className="btn btn-outline text-xs py-2 px-3 bg-white whitespace-nowrap font-bold">
              Sign In / Register
            </Link>
          </div>
        </div>
      )}

      {/* Step Indicators */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`h-2 rounded-full flex-1 transition-all duration-300 ${s <= step ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-xs' : 'bg-slate-200'}`} />
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-xs font-bold shadow-xs">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {postedSuccess ? (
        <div className="bg-white rounded-3xl shadow-card border border-slate-200/80 p-12 text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Ad Published Successfully!</h2>
          <p className="text-slate-600 text-xs sm:text-sm mb-6 max-w-md mx-auto font-medium">
            Your advertisement is now live on URGENIE for buyers in Hosur. Redirecting to your ad...
          </p>
          <Link to={createdAdId ? `/ad/${createdAdId}` : '/profile/ads'} className="btn btn-primary px-8 py-3 font-black text-xs uppercase tracking-wider shadow-md">
            View Live Ad
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-card border border-slate-200/80 p-6 md:p-8">
          {/* STEP 1: Select Category */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Select Category</h2>
              <p className="text-sm text-gray-500 mb-6">Choose the category to unlock tailored attributes for your listing</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categories.map((category) => {
                  const IconComp = category.icon || Tag;
                  const isSelected = selectedCategory === category.id;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-brand bg-brand-light/30 ring-2 ring-brand font-bold text-brand shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 text-gray-800 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isSelected ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600'}`}>
                          <IconComp className="h-4 w-4" />
                        </div>
                        <span className="text-sm">{category.name}</span>
                      </div>
                      {isSelected ? (
                        <CheckCircle2 className="h-5 w-5 text-brand" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn btn-primary px-8 py-3 rounded-xl font-bold shadow-sm"
                >
                  Continue to Details
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Category Specific Ad Details */}
          {step === 2 && (
            <div>
              <div className="flex items-center justify-between gap-4 mb-2">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedCategory === 'vehicles' && '🚗 Vehicle Specifications'}
                  {selectedCategory === 'property' && '🏠 Property Specifications'}
                  {selectedCategory === 'jobs' && '💼 Job Opening Details'}
                  {selectedCategory === 'mobiles' && '📱 Mobile Device Details'}
                  {selectedCategory === 'electronics' && '📺 Electronics & Appliances'}
                  {selectedCategory === 'services' && '🛠️ Service Details'}
                  {selectedCategory === 'furniture' && '🛋️ Furniture Details'}
                  {selectedCategory === 'commercial' && '🏭 Commercial Asset Details'}
                </h2>
                <span className="px-3 py-1 bg-brand-light/40 text-brand text-xs font-bold rounded-full capitalize">
                  {selectedCategory}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-6">Fill in these details to make your ad rank higher and receive verified leads</p>

              <div className="space-y-5">
                {/* 1. Category Specific Dynamic Inputs */}
                {selectedCategory === 'vehicles' && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Vehicle Profile</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Vehicle Type</label>
                        <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className="input-field py-2 text-sm">
                          <option value="Motorcycle / Bike">Motorcycle / Bike</option>
                          <option value="Scooter">Scooter / Scooty</option>
                          <option value="Car / Hatchback">Car / Hatchback</option>
                          <option value="Car / Sedan / SUV">Car / Sedan / SUV</option>
                          <option value="Commercial Vehicle / Auto">Commercial Vehicle / Auto</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Brand / Make</label>
                        <select value={vehicleBrand} onChange={(e) => setVehicleBrand(e.target.value)} className="input-field py-2 text-sm">
                          <option value="Royal Enfield">Royal Enfield</option>
                          <option value="Honda">Honda</option>
                          <option value="Yamaha">Yamaha</option>
                          <option value="TVS">TVS</option>
                          <option value="Bajaj">Bajaj</option>
                          <option value="Hyundai">Hyundai</option>
                          <option value="Maruti Suzuki">Maruti Suzuki</option>
                          <option value="Tata Motors">Tata Motors</option>
                          <option value="Other">Other Brand</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Model / Variant</label>
                        <input type="text" value={vehicleModel} onChange={(e) => setVehicleModel(e.target.value)} placeholder="e.g. Classic 350 Stealth Black" className="input-field py-2 text-sm" />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Registration Year</label>
                        <select value={vehicleYear} onChange={(e) => setVehicleYear(e.target.value)} className="input-field py-2 text-sm">
                          {['2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015'].map(y => (
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
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">KM Driven</label>
                        <input type="number" value={vehicleKm} onChange={(e) => setVehicleKm(e.target.value)} placeholder="e.g. 18500" className="input-field py-2 text-sm" />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Number of Owners</label>
                        <select value={vehicleOwners} onChange={(e) => setVehicleOwners(e.target.value)} className="input-field py-2 text-sm">
                          <option value="1st Owner">1st Owner (Single Owner)</option>
                          <option value="2nd Owner">2nd Owner</option>
                          <option value="3rd Owner">3rd Owner</option>
                          <option value="4+ Owners">4+ Owners</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {selectedCategory === 'property' && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Real Estate Specification</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Listing Type</label>
                        <select value={propertyListingType} onChange={(e) => setPropertyListingType(e.target.value)} className="input-field py-2 text-sm">
                          <option value="For Rent">For Rent</option>
                          <option value="For Sale">For Sale</option>
                          <option value="Lease">Lease</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Property Type</label>
                        <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className="input-field py-2 text-sm">
                          <option value="Independent House">Independent House / Villa</option>
                          <option value="Apartment / Flat">Apartment / Flat</option>
                          <option value="Residential Plot">Residential Plot / Land</option>
                          <option value="Commercial Space">Commercial Space / Shop</option>
                          <option value="PG / Hostel">PG / Coliving</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Configuration (BHK)</label>
                        <select value={propertyBhk} onChange={(e) => setPropertyBhk(e.target.value)} className="input-field py-2 text-sm">
                          <option value="1 RK">1 RK</option>
                          <option value="1 BHK">1 BHK</option>
                          <option value="2 BHK">2 BHK</option>
                          <option value="3 BHK">3 BHK</option>
                          <option value="4+ BHK">4+ BHK / Villa</option>
                          <option value="Plot / Land">Plot / Land</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Built-up Area (Sq.Ft)</label>
                        <input type="number" value={propertyArea} onChange={(e) => setPropertyArea(e.target.value)} placeholder="e.g. 1200" className="input-field py-2 text-sm" />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Furnishing Status</label>
                        <select value={propertyFurnishing} onChange={(e) => setPropertyFurnishing(e.target.value)} className="input-field py-2 text-sm">
                          <option value="Semi-Furnished">Semi-Furnished</option>
                          <option value="Fully Furnished">Fully Furnished</option>
                          <option value="Unfurnished">Unfurnished</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Water Facility</label>
                        <select value={propertyWater} onChange={(e) => setPropertyWater(e.target.value)} className="input-field py-2 text-sm">
                          <option value="24/7 Cauvery & Borewell">24/7 Cauvery & Borewell</option>
                          <option value="Borewell Only">Borewell Only</option>
                          <option value="Water Tanker Facility">Water Tanker Facility</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {selectedCategory === 'jobs' && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Job Opening Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Designation / Role *</label>
                        <input type="text" value={jobRole} onChange={(e) => setJobRole(e.target.value)} placeholder="e.g. CNC VMC Machine Operator" className="input-field py-2 text-sm" />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Company / Hiring Unit</label>
                        <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. Auto Components Pvt Ltd" className="input-field py-2 text-sm" />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Employment Type</label>
                        <select value={jobType} onChange={(e) => setJobType(e.target.value)} className="input-field py-2 text-sm">
                          <option value="Full Time">Full Time</option>
                          <option value="Part Time">Part Time</option>
                          <option value="Contract / Temporary">Contract / Temporary</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Experience Required</label>
                        <select value={jobExperience} onChange={(e) => setJobExperience(e.target.value)} className="input-field py-2 text-sm">
                          <option value="Fresher / Entry Level">Fresher / Entry Level</option>
                          <option value="1-2 Years">1-2 Years</option>
                          <option value="3-5 Years">3-5 Years</option>
                          <option value="5+ Years">5+ Years</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Minimum Education</label>
                        <select value={jobEducation} onChange={(e) => setJobEducation(e.target.value)} className="input-field py-2 text-sm">
                          <option value="10th / 12th Pass">10th / 12th Pass</option>
                          <option value="ITI / Diploma">ITI / Diploma</option>
                          <option value="Graduate (B.E / B.Sc / B.Com)">Graduate (Degree)</option>
                          <option value="Post Graduate">Post Graduate</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Work Shift</label>
                        <select value={jobShift} onChange={(e) => setJobShift(e.target.value)} className="input-field py-2 text-sm">
                          <option value="Day Shift">Day Shift</option>
                          <option value="Night Shift">Night Shift</option>
                          <option value="Rotational Shift">Rotational Shift</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {selectedCategory === 'mobiles' && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Mobile Phone Specifications</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Brand</label>
                        <select value={mobileBrand} onChange={(e) => setMobileBrand(e.target.value)} className="input-field py-2 text-sm">
                          <option value="Apple">Apple iPhone</option>
                          <option value="Samsung">Samsung</option>
                          <option value="OnePlus">OnePlus</option>
                          <option value="Xiaomi / Redmi">Xiaomi / Redmi</option>
                          <option value="Vivo">Vivo</option>
                          <option value="Oppo">Oppo</option>
                          <option value="Realme">Realme</option>
                          <option value="Google Pixel">Google Pixel</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Model Name</label>
                        <input type="text" value={mobileModel} onChange={(e) => setMobileModel(e.target.value)} placeholder="e.g. 14 Pro Max" className="input-field py-2 text-sm" />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Internal Storage</label>
                        <select value={mobileStorage} onChange={(e) => setMobileStorage(e.target.value)} className="input-field py-2 text-sm">
                          <option value="64GB">64GB</option>
                          <option value="128GB">128GB</option>
                          <option value="256GB">256GB</option>
                          <option value="512GB">512GB</option>
                          <option value="1TB">1TB</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">RAM</label>
                        <select value={mobileRam} onChange={(e) => setMobileRam(e.target.value)} className="input-field py-2 text-sm">
                          <option value="4GB">4GB</option>
                          <option value="6GB">6GB</option>
                          <option value="8GB">8GB</option>
                          <option value="12GB">12GB</option>
                          <option value="16GB">16GB</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Battery Health (%)</label>
                        <input type="text" value={mobileBatteryHealth} onChange={(e) => setMobileBatteryHealth(e.target.value)} placeholder="e.g. 94%" className="input-field py-2 text-sm" />
                      </div>
                    </div>
                  </div>
                )}

                {selectedCategory === 'electronics' && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Electronics & Appliance Specs</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Device / Appliance Type</label>
                        <select value={electronicsType} onChange={(e) => setElectronicsType(e.target.value)} className="input-field py-2 text-sm">
                          <option value="Smart TV">Smart TV / Android TV</option>
                          <option value="Refrigerator">Refrigerator / Fridge</option>
                          <option value="Washing Machine">Washing Machine</option>
                          <option value="AC / Air Cooler">AC / Air Cooler</option>
                          <option value="Laptop / Desktop PC">Laptop / Desktop PC</option>
                          <option value="Audio / Home Theatre">Audio / Home Theatre</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Brand / Manufacturer</label>
                        <select value={electronicsBrand} onChange={(e) => setElectronicsBrand(e.target.value)} className="input-field py-2 text-sm">
                          <option value="Sony">Sony</option>
                          <option value="LG">LG</option>
                          <option value="Samsung">Samsung</option>
                          <option value="Whirlpool">Whirlpool</option>
                          <option value="Dell / HP">Dell / HP</option>
                          <option value="Voltas / Daikin">Voltas / Daikin</option>
                          <option value="Other">Other Brand</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Age / Usage</label>
                        <select value={electronicsAge} onChange={(e) => setElectronicsAge(e.target.value)} className="input-field py-2 text-sm">
                          <option value="Less than 1 Year">Less than 1 Year</option>
                          <option value="1-2 Years">1-2 Years</option>
                          <option value="2-3 Years">2-3 Years</option>
                          <option value="3+ Years">3+ Years</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Warranty Status</label>
                        <select value={electronicsWarranty} onChange={(e) => setElectronicsWarranty(e.target.value)} className="input-field py-2 text-sm">
                          <option value="Under Warranty">Under Brand Warranty</option>
                          <option value="Extended Warranty">Extended Warranty Available</option>
                          <option value="Out of Warranty">Out of Warranty</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {selectedCategory === 'services' && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Local Service Profile</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Service Type</label>
                        <select value={serviceType} onChange={(e) => setServiceType(e.target.value)} className="input-field py-2 text-sm">
                          <option value="Electrician">Electrician & Wiring</option>
                          <option value="Plumber">Plumber & Sanitary</option>
                          <option value="AC Service & Repair">AC Service & Repair</option>
                          <option value="House Painter">House Painting & Whitewash</option>
                          <option value="Carpentry & Woodwork">Carpentry & Woodwork</option>
                          <option value="Packers & Movers">Packers & Movers</option>
                          <option value="Deep Home Cleaning">Deep Home Cleaning</option>
                          <option value="Vehicle Mechanic">Vehicle Mechanic / Towing</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Pricing Model</label>
                        <select value={servicePricing} onChange={(e) => setServicePricing(e.target.value)} className="input-field py-2 text-sm">
                          <option value="Fixed Rate">Fixed Rate per Job</option>
                          <option value="Inspection + Work Cost">Inspection Fee + Material</option>
                          <option value="Hourly Rate">Hourly Labor Charge</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {selectedCategory === 'furniture' && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Furniture Specifications</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Furniture Item</label>
                        <select value={furnitureType} onChange={(e) => setFurnitureType(e.target.value)} className="input-field py-2 text-sm">
                          <option value="Sofa Set">Sofa Set (3+1+1 / L-Shape)</option>
                          <option value="Cot & Bed">Wooden / Metal Bed with Mattress</option>
                          <option value="Dining Table">Dining Table with Chairs</option>
                          <option value="Wardrobe">Wardrobe / Cupboard</option>
                          <option value="Office / Study Desk">Office Desk & Ergonomic Chair</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Material</label>
                        <select value={furnitureMaterial} onChange={(e) => setFurnitureMaterial(e.target.value)} className="input-field py-2 text-sm">
                          <option value="Teak Wood">Solid Teak Wood</option>
                          <option value="Sheesham Wood">Sheesham / Rosewood</option>
                          <option value="Engineered Wood / Plywood">Engineered Wood / Plywood</option>
                          <option value="Metal / Steel">Steel / Iron Frame</option>
                          <option value="Leatherette / Fabric">Fabric / Leatherette</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {selectedCategory === 'commercial' && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Commercial & Industrial Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Commercial Asset</label>
                        <select value={commercialType} onChange={(e) => setCommercialType(e.target.value)} className="input-field py-2 text-sm">
                          <option value="Industrial Shed / Warehouse">Industrial Shed / Warehouse</option>
                          <option value="Heavy Machinery (CNC / VMC / Lathe)">Heavy Machinery (CNC / VMC / Lathe)</option>
                          <option value="Commercial Office Space">Commercial Office Space</option>
                          <option value="Retail Shop / Showroom">Retail Shop / Showroom</option>
                          <option value="Industrial Land / Plot">Industrial Land / Plot</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Power Connection</label>
                        <select value={commercialPower} onChange={(e) => setCommercialPower(e.target.value)} className="input-field py-2 text-sm">
                          <option value="25 HP">25 HP Commercial</option>
                          <option value="50 HP">50 HP Industrial HT/LT</option>
                          <option value="100+ HP">100+ HP Heavy Industrial</option>
                          <option value="Standard Commercial Meter">Standard Commercial Meter</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Total Carpet Area (Sq.Ft)</label>
                        <input type="number" value={commercialArea} onChange={(e) => setCommercialArea(e.target.value)} placeholder="e.g. 5000" className="input-field py-2 text-sm" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Common Main Fields */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Ad Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input-field py-2.5 font-medium"
                    placeholder={getTitlePlaceholder()}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Description *</label>
                  <textarea
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input-field py-2.5 text-sm"
                    placeholder="Describe condition, reason for selling, features, service history, key highlights..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">{getPriceLabel()}</label>
                    <input
                      type="number"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="input-field py-2.5 font-bold text-brand"
                      placeholder="145000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">Condition *</label>
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      className="input-field py-2.5"
                    >
                      <option value="new">Brand New / Unused</option>
                      <option value="like_new">Used - Like New (Mint)</option>
                      <option value="good">Used - Good Condition</option>
                      <option value="fair">Used - Fair Condition</option>
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={isNegotiable}
                    onChange={(e) => setIsNegotiable(e.target.checked)}
                    className="h-4 w-4 rounded text-brand focus:ring-brand"
                  />
                  <span className="text-sm font-medium text-gray-700">Price is negotiable</span>
                </label>
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn btn-outline px-6 py-2.5 flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  type="button"
                  disabled={!title.trim() || !price}
                  onClick={() => setStep(3)}
                  className="btn btn-primary px-8 py-2.5 font-bold disabled:opacity-50 shadow-sm"
                >
                  Continue to Photos
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Photos & Media Upload */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Photo & Media</h2>
              <p className="text-sm text-gray-500 mb-6">Upload photos from your device to the <strong>ad-images</strong> storage</p>

              {uploadError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              <div className="space-y-6 mb-6">
                {/* File Upload Box */}
                <div className="border-2 border-dashed border-gray-300 hover:border-brand rounded-2xl p-6 text-center bg-gray-50/50 hover:bg-brand-light/10 transition-colors">
                  <input
                    type="file"
                    id="ad-image-file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                  <label htmlFor="ad-image-file" className="cursor-pointer flex flex-col items-center justify-center">
                    <div className="w-14 h-14 bg-brand/10 text-brand rounded-2xl flex items-center justify-center mb-3 shadow-inner">
                      {uploadingImage ? (
                        <Loader2 className="h-7 w-7 animate-spin text-brand" />
                      ) : (
                        <Upload className="h-7 w-7 text-brand" />
                      )}
                    </div>
                    <span className="text-sm font-bold text-gray-900 mb-1">
                      {uploadingImage ? 'Uploading image to storage...' : 'Click to Upload Photo from Device'}
                    </span>
                    <span className="text-xs text-gray-500">Supports JPG, PNG, WEBP up to 10MB</span>
                  </label>
                </div>

                {/* Preview Display */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Photo Preview</label>
                    {imageUrl && (
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="text-xs text-red-500 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <X className="h-3.5 w-3.5" /> Clear Photo
                      </button>
                    )}
                  </div>

                  <div className="aspect-video w-full max-w-md mx-auto bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 relative group shadow-sm">
                    {imageUrl ? (
                      <img src={imageUrl} alt="Ad Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        <ImageIcon className="h-10 w-10 mb-2 opacity-50" />
                        <span className="text-xs">No image selected</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Direct Image URL input */}
                <div className="pt-4 border-t border-gray-100">
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Or paste Direct Image URL</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="input-field py-2 text-xs flex-1"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn btn-outline px-6 py-2.5 flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="btn btn-primary px-8 py-2.5 font-bold shadow-sm"
                >
                  Continue to Contact
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Contact & Publish */}
          {step === 4 && (
            <form onSubmit={handleSubmitAd}>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Contact & Location</h2>
              <p className="text-sm text-gray-500 mb-6">How should buyers in Hosur reach you?</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Location in Hosur *</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="input-field py-2.5 text-sm"
                  >
                    {locationsList.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">Contact Name *</label>
                    <input
                      type="text"
                      required
                      value={sellerName}
                      onChange={(e) => setSellerName(e.target.value)}
                      className="input-field py-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="input-field py-2.5 text-sm"
                      placeholder="9876543210"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={allowWhatsapp}
                    onChange={(e) => setAllowWhatsapp(e.target.checked)}
                    className="h-4 w-4 rounded text-brand focus:ring-brand"
                  />
                  <span className="text-sm font-medium text-gray-700">Allow buyers to chat on WhatsApp</span>
                </label>

                {!user && (
                  <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
                    <span className="text-xs font-semibold text-amber-900">
                      ⚡ Quick Step: Sign in to activate your listing for Hosur
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuickDemoLogin('seller@urgenie.com')}
                      className="btn btn-primary text-xs py-1.5 px-3 whitespace-nowrap shadow-sm"
                    >
                      Instant Demo Sign In
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="btn btn-outline px-6 py-2.5 flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary px-8 py-3 rounded-xl font-bold shadow-md bg-green-600 hover:bg-green-700 text-white border-transparent disabled:opacity-50"
                >
                  {submitting ? 'Publishing...' : user ? 'Publish Free Ad' : 'Sign In & Publish Ad'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
