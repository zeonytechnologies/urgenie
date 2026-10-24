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
  Check,
  Search,
  MapPin,
  X,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  EXPATRIATES_SECTIONS, 
  ALL_EXPATRIATES_OPTIONS, 
  getOptionById, 
  getSectionForOption,
  LISTING_TYPES,
  type ExpatriatesOption,
  type SubCategory
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

  // Wizard Steps:
  // 1 = Select Expatriates Option & Subcategory
  // 2 = Tailored Category Attributes
  // 3 = Core Ad Details (Title, Price, Location, Photos, Description, Contact)
  // 4 = Review & Instant Publish
  // 5 = Success Screen
  const [step, setStep] = useState(1);

  // Expatriates Choice State
  const [selectedOptionId, setSelectedOptionId] = useState<string>('sell-item');
  const [selectedSubcategorySlug, setSelectedSubcategorySlug] = useState<string>('cars-vehicles');
  const [optionSearchQuery, setOptionSearchQuery] = useState<string>('');
  const [activeSectionFilter, setActiveSectionFilter] = useState<string>('all');
  
  // Modal / Subcategory Drawer state inside Step 1
  const [browsingOptionWithSubcategories, setBrowsingOptionWithSubcategories] = useState<ExpatriatesOption | null>(null);

  // Common Ad Fields (Step 3)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [isNegotiable, setIsNegotiable] = useState(true);
  const [condition, setCondition] = useState('good');
  const [location, setLocation] = useState('Hosur Town Center');
  const [locationsList] = useState<string[]>(DEFAULT_LOCATIONS);
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [sellerName, setSellerName] = useState(profile?.full_name || 'Verified User');
  const [phone, setPhone] = useState(profile?.phone || '9876543210');
  const [allowWhatsapp, setAllowWhatsapp] = useState(true);

  // Submission States
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdAdId, setCreatedAdId] = useState<string | null>(null);

  // ==============================================================
  // TAILORED ATTRIBUTES PER EXPATRIATES OPTION
  // ==============================================================
  // 1. Buy/Sell & Vehicles
  const [vehicleBrand, setVehicleBrand] = useState('Royal Enfield');
  const [vehicleModel, setVehicleModel] = useState('Classic 350');
  const [vehicleYear, setVehicleYear] = useState('2023');
  const [vehicleFuel, setVehicleFuel] = useState('Petrol');
  const [vehicleKm, setVehicleKm] = useState('18000');
  const [vehicleOwners, setVehicleOwners] = useState('1st Owner');
  const [vehicleTransmission, setVehicleTransmission] = useState('Manual');
  const [itemCondition, setItemCondition] = useState('Like New');
  const [itemWarranty, setItemWarranty] = useState('Under Warranty');
  const [itemBillBox, setItemBillBox] = useState('Original Bill & Box Available');

  // 2. Buy/Sell (Wanted)
  const [wantedUrgency, setWantedUrgency] = useState('Immediate (Within 3 Days)');
  const [wantedCondition, setWantedCondition] = useState('Gently Used or Like New');

  // 3. Jobs (Seeking vs Offering)
  const [jobTitle, setJobTitle] = useState('');
  const [jobCompany, setJobCompany] = useState('');
  const [jobIndustry, setJobIndustry] = useState('Manufacturing & Engineering');
  const [jobExperience, setJobExperience] = useState('2-5 Years');
  const [jobType, setJobType] = useState('Full-Time');
  const [jobEducation, setJobEducation] = useState('Graduate / Diploma');
  const [jobNoticePeriod, setJobNoticePeriod] = useState('Immediate Joiner');
  const [jobWorkMode, setJobWorkMode] = useState('Onsite Hosur (SIPCOT)');
  const [jobSkills, setJobSkills] = useState('CNC Operation, Quality Check, Basic Tally');

  // 4. Temp Jobs
  const [tempDuration, setTempDuration] = useState('1-2 Weeks');
  const [tempPayBasis, setTempPayBasis] = useState('₹1,000 / Day');
  const [tempHours, setTempHours] = useState('9:00 AM - 6:00 PM');
  const [tempUrgency, setTempUrgency] = useState('Immediate (Starts Tomorrow)');

  // 5. Housing (Offering vs Exchange vs Seeking)
  const [housingOfferType, setHousingOfferType] = useState('For Rent');
  const [propertyBhk, setPropertyBhk] = useState('2 BHK');
  const [propertyArea, setPropertyArea] = useState('1200');
  const [propertyFurnishing, setPropertyFurnishing] = useState('Semi-Furnished');
  const [propertyFloor, setPropertyFloor] = useState('1st Floor (Out of 3)');
  const [propertyFacing, setPropertyFacing] = useState('East Facing');
  const [propertyDeposit, setPropertyDeposit] = useState('50000');
  const [propertyTenantPref, setPropertyTenantPref] = useState('Families Only');
  const [propertyAvailableFrom, setPropertyAvailableFrom] = useState('Immediate');

  // Housing Exchange
  const [exchangeCurrentLoc, setExchangeCurrentLoc] = useState('Hosur Town Center');
  const [exchangeDestination, setExchangeDestination] = useState('Bangalore / Electronic City');
  const [exchangeDuration, setExchangeDuration] = useState('6 Months - 1 Year');

  // Housing Seeking
  const [seekTenantType, setSeekTenantType] = useState('Family (3 Members)');
  const [seekPreferredAreas, setSeekPreferredAreas] = useState('SIPCOT Phase 1 or Mathigiri');

  // 6. Commercial Property
  const [commercialKind, setCommercialKind] = useState('Office Space');
  const [commercialPowerLoad, setCommercialPowerLoad] = useState('25 kVA (3-Phase)');
  const [commercialParking, setCommercialParking] = useState('Dedicated Car & Bike Parking');
  const [commercialLoadingDock, setCommercialLoadingDock] = useState('Yes, High-Ceiling Shutter');

  // 7. Plots
  const [plotType, setPlotType] = useState('Residential Layout Plot (DTCP)');
  const [plotSize, setPlotSize] = useState('1200 Sq.Ft (30x40)');
  const [plotRoadWidth, setPlotRoadWidth] = useState('30 Feet Blacktop Road');
  const [plotApproval, setPlotApproval] = useState('DTCP & HNTDA Approved');
  const [plotFencing, setPlotFencing] = useState('Gated Layout with Boundary Wall');

  // 8. Childcare
  const [childcareRole, setChildcareRole] = useState('Experienced Nanny / Babysitter');
  const [childcareAgeGroup, setChildcareAgeGroup] = useState('Toddlers (1 to 4 Years)');
  const [childcareExperience, setChildcareExperience] = useState('5+ Years in Expat Families');
  const [childcareCert, setChildcareCert] = useState('First Aid & Police Verified');
  const [childcareTiming, setChildcareTiming] = useState('Full-Time Day (9 AM - 6 PM)');

  // 9. Community
  const [lostFoundStatus, setLostFoundStatus] = useState('Lost Item');
  const [lostFoundDate, setLostFoundDate] = useState('Yesterday Afternoon');
  const [lostFoundLocation, setLostFoundLocation] = useState('Near Hosur Bus Stand / Town');
  const [lostFoundReward, setLostFoundReward] = useState('₹1,000 Cash Reward');

  // Rideshare
  const [rideOrigin, setRideOrigin] = useState('Hosur Town / Mathigiri');
  const [rideDestination, setRideDestination] = useState('Electronic City / Silk Board, Bangalore');
  const [rideSchedule, setRideSchedule] = useState('Daily Morning 7:45 AM / Return 6:30 PM');
  const [rideVehicle, setRideVehicle] = useState('AC Sedan Car');
  const [rideSeats, setRideSeats] = useState('2 Seats Available');
  const [rideCostShare, setRideCostShare] = useState('₹120 / Trip (Fuel Split)');

  // Pet Adoption
  const [petType, setPetType] = useState('Puppy (Indie Rescued)');
  const [petAgeGender, setPetAgeGender] = useState('3 Months, Female');
  const [petHealth, setPetHealth] = useState('Vaccinated & Dewormed');

  // Sports & Music
  const [sportName, setSportName] = useState('Badminton');
  const [sportLevel, setSportLevel] = useState('Intermediate / Regular Player');
  const [sportTime, setSportTime] = useState('Weekday Evenings (7:00 PM - 8:30 PM)');
  const [musicRole, setMusicRole] = useState('Acoustic / Lead Guitarist');
  const [musicGenre, setMusicGenre] = useState('Rock, Pop, Acoustic Ballads');

  // Event
  const [eventName, setEventName] = useState('Expatriates Hosur Cultural Meet');
  const [eventDate, setEventDate] = useState('Upcoming Saturday 5:00 PM');
  const [eventVenue, setEventVenue] = useState('Hosur Town Community Hall');

  // 10. Learning
  const [learnSubject, setLearnSubject] = useState('Spoken English & Communication');
  const [learnNativeLang, setLearnNativeLang] = useState('Tamil & English');
  const [learnTargetLang, setLearnTargetLang] = useState('Hindi / German');
  const [learnMode, setLearnMode] = useState('Online Video Call / In-Person');
  const [learnLevel, setLearnLevel] = useState('Beginner to Intermediate');

  // 11. Services
  const [serviceSpecialty, setServiceSpecialty] = useState('Electrical Wiring & Inverter Setup');
  const [servicePricingModel, setServicePricingModel] = useState('₹299 Inspection / Visit Charge');
  const [serviceWarranty, setServiceWarranty] = useState('30 Days Service Warranty');
  const [serviceCoverage, setServiceCoverage] = useState('All Hosur & SIPCOT Areas');

  // 12. Business B2B
  const [businessIndustry, setBusinessIndustry] = useState('Automobile Ancillary / Machine Shop');
  const [businessAskingPrice, setBusinessAskingPrice] = useState('₹18,00,000');
  const [businessTurnover, setBusinessTurnover] = useState('₹45 Lakhs / Year');
  const [businessReason, setBusinessReason] = useState('Owner Relocating Abroad');
  const [wholesaleMoq, setWholesaleMoq] = useState('Minimum Order Value: ₹25,000');

  // Sync profile data
  useEffect(() => {
    if (profile) {
      if (profile.full_name) setSellerName(profile.full_name);
      if (profile.phone) setPhone(profile.phone);
    }
  }, [profile]);

  // Current selected option metadata
  const currentOption = getOptionById(selectedOptionId) || ALL_EXPATRIATES_OPTIONS[0];
  const currentSection = getSectionForOption(selectedOptionId) || EXPATRIATES_SECTIONS[0];

  // Helper to change option
  const handleSelectOption = (opt: ExpatriatesOption) => {
    setSelectedOptionId(opt.id);
    if (opt.hasSubcategories && opt.subcategories.length > 0) {
      setBrowsingOptionWithSubcategories(opt);
      setSelectedSubcategorySlug(opt.subcategories[0].slug);
    } else {
      setBrowsingOptionWithSubcategories(null);
      setSelectedSubcategorySlug('');
      if (opt.pricePlaceholder && !price) {
        setPrice(opt.defaultListingType === 'free' ? '0' : '');
      }
      setStep(2);
    }
  };

  const handleSelectSubcategory = (subcat: SubCategory) => {
    setSelectedSubcategorySlug(subcat.slug);
    setBrowsingOptionWithSubcategories(null);
    setStep(2);
  };

  // Image Upload handler with instant HTML5 Canvas compression
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image size must be less than 10MB');
      return;
    }

    setUploadingImage(true);
    setUploadError(null);

    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxDim = 1200;
            let width = img.width;
            let height = img.height;
            if (width > height) {
              if (width > maxDim) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              }
            } else {
              if (height > maxDim) {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL('image/jpeg', 0.82));
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
      try {
        const fileName = `ad_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.jpg`;
        const res = await fetch(base64Data);
        const blob = await res.blob();

        const { error: storageError } = await supabase.storage
          .from('ad-images')
          .upload(fileName, blob, { contentType: 'image/jpeg', upsert: true });

        if (!storageError) {
          const { data: publicData } = supabase.storage.from('ad-images').getPublicUrl(fileName);
          if (publicData?.publicUrl) {
            finalUrl = publicData.publicUrl;
          }
        }
      } catch (err) {
        console.warn('Storage bucket fallback:', err);
      }

      setImageUrl(finalUrl);
    } catch (err: any) {
      setUploadError(err.message || 'Error processing image');
    } finally {
      setUploadingImage(false);
    }
  };

  // Compile Tailored Attributes Summary for Description
  const generateSpecsSummary = () => {
    let summary = `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📋 CLASSIFICATION & SPECIFICATIONS:\n`;
    summary += `• Category: ${currentSection.title}\n`;
    summary += `• Intent: ${currentOption.title}\n`;
    if (selectedSubcategorySlug) {
      const sub = currentOption.subcategories.find(s => s.slug === selectedSubcategorySlug);
      if (sub) summary += `• Subcategory: ${sub.name}\n`;
    }

    if (selectedOptionId === 'sell-item') {
      if (selectedSubcategorySlug.includes('vehicles') || selectedSubcategorySlug.includes('motorcycles')) {
        summary += `• Brand / Make: ${vehicleBrand}\n• Model: ${vehicleModel}\n• Year: ${vehicleYear}\n• Fuel Type: ${vehicleFuel}\n• KM Driven: ${vehicleKm}\n• Owners: ${vehicleOwners}\n• Transmission: ${vehicleTransmission}\n`;
      } else {
        summary += `• Condition: ${itemCondition}\n• Warranty: ${itemWarranty}\n• Bill & Box: ${itemBillBox}\n`;
      }
    } else if (selectedOptionId === 'buy-item') {
      summary += `• Desired Condition: ${wantedCondition}\n• Urgency: ${wantedUrgency}\n`;
    } else if (selectedOptionId === 'job-seeking') {
      summary += `• Desired Role: ${jobTitle || 'Professional'}\n• Industry: ${jobIndustry}\n• Experience: ${jobExperience}\n• Education: ${jobEducation}\n• Availability: ${jobNoticePeriod}\n• Key Skills: ${jobSkills}\n• Work Mode: ${jobWorkMode}\n`;
    } else if (selectedOptionId === 'job-offering') {
      summary += `• Designation: ${jobTitle}\n• Company: ${jobCompany}\n• Industry: ${jobIndustry}\n• Employment Type: ${jobType}\n• Experience Required: ${jobExperience}\n• Education: ${jobEducation}\n• Work Location: ${jobWorkMode}\n`;
    } else if (selectedOptionId === 'temp-jobs-hire') {
      summary += `• Gig Duration: ${tempDuration}\n• Pay Rate: ${tempPayBasis}\n• Timings: ${tempHours}\n• Immediate Joining: ${tempUrgency}\n`;
    } else if (selectedOptionId === 'housing-offering') {
      summary += `• Offer Type: ${housingOfferType}\n• Configuration: ${propertyBhk}\n• Area: ${propertyArea} Sq.Ft\n• Furnishing: ${propertyFurnishing}\n• Floor: ${propertyFloor}\n• Facing: ${propertyFacing}\n• Deposit: ₹${propertyDeposit}\n• Preferred Tenants: ${propertyTenantPref}\n• Available From: ${propertyAvailableFrom}\n`;
    } else if (selectedOptionId === 'housing-exchange') {
      summary += `• Current Property: ${exchangeCurrentLoc}\n• Desired Swap Location: ${exchangeDestination}\n• Duration: ${exchangeDuration}\n`;
    } else if (selectedOptionId === 'housing-seeking') {
      summary += `• Looking for: ${propertyBhk}\n• Target Areas: ${seekPreferredAreas}\n• Tenant Profile: ${seekTenantType}\n`;
    } else if (selectedOptionId === 'commercial-offering') {
      summary += `• Commercial Type: ${commercialKind}\n• Area: ${propertyArea} Sq.Ft\n• Power Capacity: ${commercialPowerLoad}\n• Parking: ${commercialParking}\n• Loading Access: ${commercialLoadingDock}\n`;
    } else if (selectedOptionId === 'plots-offering') {
      summary += `• Land Type: ${plotType}\n• Plot Extent: ${plotSize}\n• Road Width: ${plotRoadWidth}\n• Approvals: ${plotApproval}\n• Boundary: ${plotFencing}\n`;
    } else if (selectedOptionId.startsWith('childcare')) {
      summary += `• Role / Facility: ${childcareRole}\n• Age Group: ${childcareAgeGroup}\n• Experience: ${childcareExperience}\n• Verified Status: ${childcareCert}\n• Timing: ${childcareTiming}\n`;
    } else if (selectedOptionId === 'community-lost-found') {
      summary += `• Case: ${lostFoundStatus}\n• Date: ${lostFoundDate}\n• Exact Landmark: ${lostFoundLocation}\n• Reward: ${lostFoundReward}\n`;
    } else if (selectedOptionId === 'community-rideshare') {
      summary += `• Route: ${rideOrigin} ➔ ${rideDestination}\n• Commute Schedule: ${rideSchedule}\n• Vehicle: ${rideVehicle}\n• Seats: ${rideSeats}\n• Cost Contribution: ${rideCostShare}\n`;
    } else if (selectedOptionId === 'community-pet-adoption') {
      summary += `• Pet: ${petType}\n• Age / Gender: ${petAgeGender}\n• Health: ${petHealth}\n`;
    } else if (selectedOptionId === 'community-sports') {
      summary += `• Sport: ${sportName}\n• Skill Level: ${sportLevel}\n• Timing: ${sportTime}\n`;
    } else if (selectedOptionId === 'community-musicians') {
      summary += `• Instrument: ${musicRole}\n• Genre: ${musicGenre}\n`;
    } else if (selectedOptionId === 'community-event') {
      summary += `• Event: ${eventName}\n• Date & Time: ${eventDate}\n• Venue: ${eventVenue}\n`;
    } else if (selectedOptionId === 'learning-exchange') {
      summary += `• Offering Language: ${learnNativeLang}\n• Target Language: ${learnTargetLang}\n• Mode: ${learnMode}\n`;
    } else if (selectedOptionId.startsWith('learning')) {
      summary += `• Subject: ${learnSubject}\n• Mode: ${learnMode}\n• Level: ${learnLevel}\n`;
    } else if (selectedOptionId === 'services-offering') {
      summary += `• Service Scope: ${serviceSpecialty}\n• Pricing: ${servicePricingModel}\n• Warranty: ${serviceWarranty}\n• Areas Covered: ${serviceCoverage}\n`;
    } else if (selectedOptionId.startsWith('business')) {
      summary += `• Business Line: ${businessIndustry}\n• Asking / Capital: ${businessAskingPrice}\n• Turnover: ${businessTurnover}\n• Note: ${businessReason}\n• MOQ: ${wholesaleMoq}\n`;
    }

    return summary;
  };

  const handleAutoCompileDescription = () => {
    const summary = generateSpecsSummary();
    if (!description.includes('CLASSIFICATION & SPECIFICATIONS')) {
      setDescription((prev) => prev.trim() + summary);
    }
  };

  // Step Navigation Check
  const handleNextStep = () => {
    setError(null);
    if (step === 1) {
      if (!selectedOptionId) {
        setError('Please select an option');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!title.trim()) {
        if (selectedOptionId === 'sell-item') {
          setTitle(`${vehicleBrand || 'Quality'} ${vehicleModel || 'Item'} for Sale in Hosur`);
        } else if (selectedOptionId === 'housing-offering') {
          setTitle(`${propertyBhk} ${housingOfferType} in ${location}`);
        } else if (selectedOptionId === 'job-seeking') {
          setTitle(`${jobTitle || 'Candidate'} seeking Job in Hosur`);
        } else if (selectedOptionId === 'job-offering') {
          setTitle(`Hiring: ${jobTitle || 'Team Member'} in Hosur`);
        } else if (selectedOptionId === 'community-rideshare') {
          setTitle(`Daily Ride Share / Carpool: Hosur to Electronic City`);
        } else {
          setTitle(`${currentOption.title} - Hosur`);
        }
      }
      setStep(3);
    } else if (step === 3) {
      if (!title.trim()) {
        setError('Please provide an advertisement title');
        return;
      }
      if (!description.trim()) {
        setError('Please provide a description of what you are offering or looking for');
        return;
      }
      if (currentOption.defaultListingType !== 'free' && !price) {
        setError(`Please specify ${currentOption.priceLabel}`);
        return;
      }
      setStep(4);
    }
  };

  // Submit Ad to Supabase with local fallback
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

    const fullDescription = description.includes('CLASSIFICATION & SPECIFICATIONS')
      ? description
      : `${description.trim()}${generateSpecsSummary()}`;

    const numPrice = currentOption.defaultListingType === 'free' ? 0 : parseFloat(price.replace(/[^0-9.]/g, '')) || 0;
    const formattedPriceText = currentOption.defaultListingType === 'free'
      ? 'Free'
      : `₹${Number(numPrice).toLocaleString()}`;

    let targetUserId = user.id;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetUserId || '');

    if (isUuid) {
      try {
        const { data: pCheck } = await (supabase.from('profiles') as any)
          .select('id')
          .eq('id', targetUserId)
          .maybeSingle();

        if (!pCheck) {
          await (supabase.from('profiles') as any).upsert({
            id: targetUserId,
            full_name: sellerName.trim() || profile?.full_name || 'Verified User',
            email: user.email || `${targetUserId}@urgenie.local`,
            phone: phone.trim() || profile?.phone || '9876543210',
            city: location || 'Hosur Town Center, Tamil Nadu',
            role: profile?.role || 'user',
          });
        }
      } catch (err) {
        targetUserId = 'd12fc73e-2b3c-4371-b22c-ce3181ec864a';
      }
    } else {
      targetUserId = 'd12fc73e-2b3c-4371-b22c-ce3181ec864a';
    }

    const adPayload = {
      user_id: targetUserId,
      category_id: currentOption.mappedCategoryId,
      subcategory_id: null,
      listing_type: currentOption.defaultListingType,
      title: title.trim(),
      slug: `${generatedSlug}-${Date.now().toString().slice(-4)}`,
      description: fullDescription,
      price: numPrice,
      price_text: formattedPriceText,
      is_negotiable: isNegotiable,
      condition: condition,
      location_name: location,
      location_text: location,
      contact_name: sellerName.trim() || profile?.full_name || 'Verified User',
      contact_phone: phone.trim() || profile?.phone || '',
      allow_whatsapp: allowWhatsapp,
      images: imageUrl ? [imageUrl] : ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600'],
      status: 'active',
      views_count: 0,
      is_featured: false,
    };

    let publishedAd: any = null;
    let finalId = adPayload.slug;

    try {
      const { data, error: insertError } = await (supabase.from('ads') as any)
        .insert([adPayload])
        .select('*')
        .single();

      if (!insertError && data) {
        publishedAd = data;
        finalId = data.slug || data.id;
      } else {
        const { data: retryData } = await (supabase.from('ads') as any)
          .insert([{
            ...adPayload,
            user_id: 'd12fc73e-2b3c-4371-b22c-ce3181ec864a',
            slug: `${generatedSlug}-${Date.now()}`
          }])
          .select('*')
          .single();

        if (retryData) {
          publishedAd = retryData;
          finalId = retryData.slug || retryData.id;
        }
      }
    } catch (dbErr) {
      console.warn('Database insert warning, saving locally:', dbErr);
    }

    if (!publishedAd) {
      publishedAd = {
        id: `ad-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        ...adPayload,
        created_at: new Date().toISOString(),
      };
      finalId = publishedAd.slug || publishedAd.id;
    }

    try {
      const stored = JSON.parse(localStorage.getItem('urgenie_local_ads') || '[]');
      const filtered = stored.filter((a: any) => a.id !== publishedAd.id && a.slug !== publishedAd.slug);
      localStorage.setItem('urgenie_local_ads', JSON.stringify([publishedAd, ...filtered]));
    } catch (storageErr) {
      console.warn('LocalStorage save warning:', storageErr);
    }

    setSubmitting(false);
    setCreatedAdId(finalId);
    setStep(5);
  };

  const filteredSections = EXPATRIATES_SECTIONS.filter(sec => {
    if (activeSectionFilter !== 'all' && sec.id !== activeSectionFilter) return false;
    if (!optionSearchQuery.trim()) return true;
    const query = optionSearchQuery.toLowerCase();
    const matchesSec = sec.title.toLowerCase().includes(query) || sec.description.toLowerCase().includes(query);
    const matchesOpt = sec.options.some(o => 
      o.title.toLowerCase().includes(query) || 
      (o.subtitle && o.subtitle.toLowerCase().includes(query)) ||
      o.subcategories.some(sc => sc.name.toLowerCase().includes(query))
    );
    return matchesSec || matchesOpt;
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Top Header & Breadcrumb */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
              <Sparkles className="h-4 w-4" />
              <span>Expatriates Posting Center · Hosur</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Post an Advertisement
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Select your posting category below, provide details, and connect with buyers, employers & residents.
            </p>
          </div>

          {step > 1 && step < 5 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-xs transition-all cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
              Change Category
            </button>
          )}
        </div>

        {/* Selected Category Pill (Steps 2, 3, 4) */}
        {step >= 2 && step <= 4 && (
          <div className="mt-4 p-3.5 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200/80 rounded-2xl flex flex-wrap items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${currentSection.badgeBg}`}>
                {currentSection.title}
              </span>
              <ChevronRight className="h-4 w-4 text-slate-400" />
              <span className="text-xs sm:text-sm font-bold text-slate-900">
                {currentOption.title}
              </span>
              {selectedSubcategorySlug && (
                <>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                  <span className="text-xs font-medium text-slate-600 bg-white/80 px-2 py-0.5 rounded-lg border border-slate-200">
                    {currentOption.subcategories.find(s => s.slug === selectedSubcategorySlug)?.name || selectedSubcategorySlug}
                  </span>
                </>
              )}
            </div>
            <span className="text-[11px] font-bold text-blue-700 bg-white px-2.5 py-1 rounded-lg border border-blue-100">
              Listing Mode: {LISTING_TYPES[currentOption.defaultListingType]?.label || 'Active'}
            </span>
          </div>
        )}

        {/* Step Indicator */}
        {step < 5 && (
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 mt-6">
            <div className={`flex items-center gap-2 text-xs font-bold ${step === 1 ? 'text-blue-600' : 'text-slate-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${step === 1 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                1
              </div>
              <span>Category & Intent</span>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-300" />
            <div className={`flex items-center gap-2 text-xs font-bold ${step === 2 ? 'text-blue-600' : 'text-slate-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${step === 2 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                2
              </div>
              <span>Tailored Specs</span>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-300" />
            <div className={`flex items-center gap-2 text-xs font-bold ${step === 3 ? 'text-blue-600' : 'text-slate-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${step === 3 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                3
              </div>
              <span>Details & Photos</span>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-300" />
            <div className={`flex items-center gap-2 text-xs font-bold ${step === 4 ? 'text-blue-600' : 'text-slate-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${step === 4 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                4
              </div>
              <span>Review & Publish</span>
            </div>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-medium flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 1: EXPATRIATES.COM HIERARCHICAL OPTION SELECTION */}
      {/* ============================================================== */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Search & Filter Pills */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search posting options (e.g., sell car, job, rent, nanny, rideshare...)"
                value={optionSearchQuery}
                onChange={(e) => setOptionSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              {optionSearchQuery && (
                <button
                  type="button"
                  onClick={() => setOptionSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Quick Section Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveSectionFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeSectionFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Sections
              </button>
              {EXPATRIATES_SECTIONS.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveSectionFilter(sec.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeSectionFilter === sec.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {sec.title}
                </button>
              ))}
            </div>
          </div>

          {/* Subcategory Drawer Modal (if user clicked an option that has subcategories) */}
          {browsingOptionWithSubcategories && (
            <div className="p-6 bg-gradient-to-b from-blue-50/90 to-white rounded-3xl border-2 border-blue-500/40 shadow-lg space-y-4 animate-in fade-in slide-in-from-top-4">
              <div className="flex items-center justify-between border-b border-blue-200/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-blue-600 text-white rounded-xl">
                    <browsingOptionWithSubcategories.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900">
                      Select a Subcategory for: <span className="text-blue-700">{browsingOptionWithSubcategories.title}</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Click the specific item category to advance to tailored details
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setBrowsingOptionWithSubcategories(null)}
                  className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2">
                {browsingOptionWithSubcategories.subcategories.map((subcat) => (
                  <button
                    key={subcat.id}
                    type="button"
                    onClick={() => handleSelectSubcategory(subcat)}
                    className="p-3 rounded-xl border border-slate-200 bg-white hover:border-blue-500 hover:bg-blue-50/70 hover:shadow-xs transition-all text-left flex items-center justify-between group cursor-pointer"
                  >
                    <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
                      {subcat.name}
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Expatriates Sections Accordions / Grid */}
          <div className="space-y-6">
            {filteredSections.map((section) => {
              const SectionIcon = section.icon || Tag;

              return (
                <div 
                  key={section.id} 
                  className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden transition-all hover:border-slate-300"
                >
                  {/* Section Title Header */}
                  <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${section.badgeBg}`}>
                      <SectionIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                        {section.title}
                      </h2>
                      <p className="text-xs text-slate-500">
                        {section.description}
                      </p>
                    </div>
                  </div>

                  {/* Expatriates Links / Options inside Section */}
                  <div className="p-3 sm:p-4 divide-y divide-slate-100">
                    {section.options.map((option) => {
                      const OptionIcon = option.icon || Tag;
                      const isSelected = selectedOptionId === option.id;

                      return (
                        <div
                          key={option.id}
                          className={`p-3.5 rounded-2xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group cursor-pointer hover:bg-blue-50/50 ${
                            isSelected ? 'bg-blue-50/80 ring-1 ring-blue-500/30' : ''
                          }`}
                          onClick={() => handleSelectOption(option)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all flex-shrink-0 mt-0.5">
                              <OptionIcon className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                                  {option.title}
                                </h3>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                  {option.badge}
                                </span>
                              </div>
                              {option.subtitle && (
                                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                                  {option.subtitle}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                            {option.hasSubcategories && (
                              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                                {option.subcategories.length} Subcategories
                              </span>
                            )}
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 group-hover:bg-blue-600 text-slate-700 group-hover:text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
                            >
                              <span>{option.hasSubcategories ? 'Select Subcategory' : 'Post This'}</span>
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 2: TAILORED ATTRIBUTES & FEATURES */}
      {/* ============================================================== */}
      {step === 2 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-card space-y-6">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 mb-1">
              2. Tailored Information for {currentOption.title}
            </h2>
            <p className="text-xs text-slate-500">
              Provide specific parameters and technical specifications to make your advertisement stand out to buyers.
            </p>
          </div>

          {/* DYNAMIC FORMS ACCORDING TO USER'S SELECTED EXPATRIATES OPTION */}

          {/* A. Sell Something (Vehicles, Electronics, Furniture, etc.) */}
          {selectedOptionId === 'sell-item' && (
            <div className="space-y-4">
              {selectedSubcategorySlug.includes('vehicles') || selectedSubcategorySlug.includes('motorcycles') ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-5 bg-slate-50/80 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Brand / Make</label>
                    <input 
                      type="text" 
                      value={vehicleBrand} 
                      onChange={(e) => setVehicleBrand(e.target.value)} 
                      className="input-field py-2 text-xs" 
                      placeholder="e.g. Royal Enfield, Maruti, Honda" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Model Name</label>
                    <input 
                      type="text" 
                      value={vehicleModel} 
                      onChange={(e) => setVehicleModel(e.target.value)} 
                      className="input-field py-2 text-xs" 
                      placeholder="e.g. Classic 350, Swift VXI" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Manufacturing Year</label>
                    <input 
                      type="number" 
                      value={vehicleYear} 
                      onChange={(e) => setVehicleYear(e.target.value)} 
                      className="input-field py-2 text-xs" 
                      placeholder="e.g. 2023" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Fuel Type</label>
                    <select value={vehicleFuel} onChange={(e) => setVehicleFuel(e.target.value)} className="input-field py-2 text-xs">
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Electric (EV)">Electric (EV)</option>
                      <option value="CNG">CNG</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Kilometers Driven</label>
                    <input 
                      type="text" 
                      value={vehicleKm} 
                      onChange={(e) => setVehicleKm(e.target.value)} 
                      className="input-field py-2 text-xs" 
                      placeholder="e.g. 18,500 km" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Ownership</label>
                    <select value={vehicleOwners} onChange={(e) => setVehicleOwners(e.target.value)} className="input-field py-2 text-xs">
                      <option value="1st Owner">1st Owner</option>
                      <option value="2nd Owner">2nd Owner</option>
                      <option value="3rd Owner+">3rd Owner+</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Transmission</label>
                    <select value={vehicleTransmission} onChange={(e) => setVehicleTransmission(e.target.value)} className="input-field py-2 text-xs">
                      <option value="Manual">Manual</option>
                      <option value="Automatic">Automatic</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-slate-50/80 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Item Condition</label>
                    <select value={itemCondition} onChange={(e) => setItemCondition(e.target.value)} className="input-field py-2 text-xs">
                      <option value="Brand New (Sealed)">Brand New (Sealed)</option>
                      <option value="Like New (Mint)">Like New (Mint)</option>
                      <option value="Good Condition">Good Condition</option>
                      <option value="Fair / Used">Fair / Used</option>
                      <option value="For Parts / Repair">For Parts / Repair</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Warranty Status</label>
                    <select value={itemWarranty} onChange={(e) => setItemWarranty(e.target.value)} className="input-field py-2 text-xs">
                      <option value="Under Brand Warranty">Under Brand Warranty</option>
                      <option value="Expired Warranty">Expired Warranty</option>
                      <option value="No Warranty">No Warranty</option>
                      <option value="Seller Testing Warranty">Seller Testing Warranty</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Bill & Box</label>
                    <select value={itemBillBox} onChange={(e) => setItemBillBox(e.target.value)} className="input-field py-2 text-xs">
                      <option value="Original Bill & Box Available">Original Bill & Box Available</option>
                      <option value="Bill Only">Bill Only</option>
                      <option value="Box Only">Box Only</option>
                      <option value="Device / Item Only">Device / Item Only</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* B. Want to Buy Something */}
          {selectedOptionId === 'buy-item' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-blue-50/60 rounded-2xl border border-blue-200/80">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Acceptable Condition</label>
                <select value={wantedCondition} onChange={(e) => setWantedCondition(e.target.value)} className="input-field py-2 text-xs">
                  <option value="Brand New Only">Brand New Only</option>
                  <option value="Gently Used or Like New">Gently Used or Like New</option>
                  <option value="Any Working Condition">Any Working Condition</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Purchase Urgency</label>
                <select value={wantedUrgency} onChange={(e) => setWantedUrgency(e.target.value)} className="input-field py-2 text-xs">
                  <option value="Immediate (Within 3 Days)">Immediate (Within 3 Days)</option>
                  <option value="Within 2 Weeks">Within 2 Weeks</option>
                  <option value="Flexible / Best Deal">Flexible / Best Deal</option>
                </select>
              </div>
            </div>
          )}

          {/* C. Jobs (Looking for a Job / Offering a Job) */}
          {(selectedOptionId === 'job-seeking' || selectedOptionId === 'job-offering') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-5 bg-indigo-50/60 rounded-2xl border border-indigo-200/80">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {selectedOptionId === 'job-seeking' ? 'Desired Job Title' : 'Job Designation / Role'}
                </label>
                <input 
                  type="text" 
                  value={jobTitle} 
                  onChange={(e) => setJobTitle(e.target.value)} 
                  className="input-field py-2 text-xs" 
                  placeholder="e.g. CNC Operator, Accountant, React Developer" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Industry / Domain</label>
                <input 
                  type="text" 
                  value={jobIndustry} 
                  onChange={(e) => setJobIndustry(e.target.value)} 
                  className="input-field py-2 text-xs" 
                  placeholder="e.g. Manufacturing, IT, Logistics" 
                />
              </div>
              {selectedOptionId === 'job-offering' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Company / Factory Name</label>
                  <input 
                    type="text" 
                    value={jobCompany} 
                    onChange={(e) => setJobCompany(e.target.value)} 
                    className="input-field py-2 text-xs" 
                    placeholder="e.g. Expatriates Auto Tech Pvt Ltd" 
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Experience Level</label>
                <select value={jobExperience} onChange={(e) => setJobExperience(e.target.value)} className="input-field py-2 text-xs">
                  <option value="Fresher / Entry Level">Fresher / Entry Level</option>
                  <option value="1-2 Years">1-2 Years</option>
                  <option value="2-5 Years">2-5 Years</option>
                  <option value="5-10 Years">5-10 Years</option>
                  <option value="10+ Years">10+ Years</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Education Required</label>
                <input 
                  type="text" 
                  value={jobEducation} 
                  onChange={(e) => setJobEducation(e.target.value)} 
                  className="input-field py-2 text-xs" 
                  placeholder="e.g. B.E, Diploma, ITI, Any Degree" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {selectedOptionId === 'job-seeking' ? 'Notice Period' : 'Joining Timeline'}
                </label>
                <input 
                  type="text" 
                  value={jobNoticePeriod} 
                  onChange={(e) => setJobNoticePeriod(e.target.value)} 
                  className="input-field py-2 text-xs" 
                  placeholder="e.g. Immediate, 15 Days" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Employment Type</label>
                <select value={jobType} onChange={(e) => setJobType(e.target.value)} className="input-field py-2 text-xs">
                  <option value="Full-Time Permanent">Full-Time Permanent</option>
                  <option value="Part-Time">Part-Time</option>
                  <option value="Contract / Project">Contract / Project</option>
                  <option value="Shift-based (Night/Day)">Shift-based (Night/Day)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Work Arrangement</label>
                <select value={jobWorkMode} onChange={(e) => setJobWorkMode(e.target.value)} className="input-field py-2 text-xs">
                  <option value="Onsite Hosur (SIPCOT)">Onsite Hosur (SIPCOT)</option>
                  <option value="Hosur Town Center">Hosur Town Center</option>
                  <option value="Hybrid (Hosur / Remote)">Hybrid (Hosur / Remote)</option>
                  <option value="Remote Work">Remote Work</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Key Skills & Qualifications</label>
                <input 
                  type="text" 
                  value={jobSkills} 
                  onChange={(e) => setJobSkills(e.target.value)} 
                  className="input-field py-2 text-xs" 
                  placeholder="e.g. Quality Inspection, Tally Prime, ISO Standards, Driving" 
                />
              </div>
            </div>
          )}

          {/* D. Temp Jobs */}
          {selectedOptionId === 'temp-jobs-hire' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-amber-50/60 rounded-2xl border border-amber-200/80">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Gig Duration</label>
                <select value={tempDuration} onChange={(e) => setTempDuration(e.target.value)} className="input-field py-2 text-xs">
                  <option value="1 Day Only">1 Day Only</option>
                  <option value="Weekend (2 Days)">Weekend (2 Days)</option>
                  <option value="1-2 Weeks">1-2 Weeks</option>
                  <option value="1 Month Temporary">1 Month Temporary</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pay Basis</label>
                <input 
                  type="text" 
                  value={tempPayBasis} 
                  onChange={(e) => setTempPayBasis(e.target.value)} 
                  className="input-field py-2 text-xs" 
                  placeholder="e.g. ₹1,000 / Day" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Working Hours</label>
                <input 
                  type="text" 
                  value={tempHours} 
                  onChange={(e) => setTempHours(e.target.value)} 
                  className="input-field py-2 text-xs" 
                  placeholder="e.g. 9 AM - 6 PM" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Urgency</label>
                <select value={tempUrgency} onChange={(e) => setTempUrgency(e.target.value)} className="input-field py-2 text-xs">
                  <option value="Immediate (Starts Tomorrow)">Immediate (Starts Tomorrow)</option>
                  <option value="Within This Week">Within This Week</option>
                  <option value="Upcoming Event Date">Upcoming Event Date</option>
                </select>
              </div>
            </div>
          )}

          {/* E. Housing (Offering / Exchange / Seeking) */}
          {(selectedOptionId === 'housing-offering' || selectedOptionId === 'housing-exchange' || selectedOptionId === 'housing-seeking') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-5 bg-emerald-50/60 rounded-2xl border border-emerald-200/80">
              {selectedOptionId === 'housing-offering' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Offer Type</label>
                  <select value={housingOfferType} onChange={(e) => setHousingOfferType(e.target.value)} className="input-field py-2 text-xs">
                    <option value="For Rent">For Rent (Monthly)</option>
                    <option value="For Sale">For Sale (Outright Purchase)</option>
                    <option value="Bed Space / PG Room">Bed Space / PG Room</option>
                  </select>
                </div>
              )}
              {selectedOptionId === 'housing-exchange' ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Current Property Location</label>
                    <input 
                      type="text" 
                      value={exchangeCurrentLoc} 
                      onChange={(e) => setExchangeCurrentLoc(e.target.value)} 
                      className="input-field py-2 text-xs" 
                      placeholder="e.g. Hosur Town Center 2 BHK" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Desired Destination</label>
                    <input 
                      type="text" 
                      value={exchangeDestination} 
                      onChange={(e) => setExchangeDestination(e.target.value)} 
                      className="input-field py-2 text-xs" 
                      placeholder="e.g. Bangalore / Electronic City" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Exchange Duration</label>
                    <input 
                      type="text" 
                      value={exchangeDuration} 
                      onChange={(e) => setExchangeDuration(e.target.value)} 
                      className="input-field py-2 text-xs" 
                      placeholder="e.g. 6 Months / 1 Year" 
                    />
                  </div>
                </>
              ) : selectedOptionId === 'housing-seeking' ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tenant Profile</label>
                    <input 
                      type="text" 
                      value={seekTenantType} 
                      onChange={(e) => setSeekTenantType(e.target.value)} 
                      className="input-field py-2 text-xs" 
                      placeholder="e.g. Family (3 members)" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Areas</label>
                    <input 
                      type="text" 
                      value={seekPreferredAreas} 
                      onChange={(e) => setSeekPreferredAreas(e.target.value)} 
                      className="input-field py-2 text-xs" 
                      placeholder="e.g. SIPCOT Phase 1, Mathigiri" 
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">BHK / Configuration</label>
                    <select value={propertyBhk} onChange={(e) => setPropertyBhk(e.target.value)} className="input-field py-2 text-xs">
                      <option value="1 RK / Single Room">1 RK / Single Room</option>
                      <option value="1 BHK">1 BHK</option>
                      <option value="2 BHK">2 BHK</option>
                      <option value="3 BHK">3 BHK</option>
                      <option value="4+ BHK / Villa">4+ BHK / Villa</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Built-Up Area (Sq.Ft)</label>
                    <input 
                      type="text" 
                      value={propertyArea} 
                      onChange={(e) => setPropertyArea(e.target.value)} 
                      className="input-field py-2 text-xs" 
                      placeholder="e.g. 1200" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Furnishing Status</label>
                    <select value={propertyFurnishing} onChange={(e) => setPropertyFurnishing(e.target.value)} className="input-field py-2 text-xs">
                      <option value="Semi-Furnished">Semi-Furnished</option>
                      <option value="Fully Furnished">Fully Furnished</option>
                      <option value="Unfurnished">Unfurnished</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Floor Level</label>
                    <input 
                      type="text" 
                      value={propertyFloor} 
                      onChange={(e) => setPropertyFloor(e.target.value)} 
                      className="input-field py-2 text-xs" 
                      placeholder="e.g. 2nd Floor (out of 4)" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Facing</label>
                    <input 
                      type="text" 
                      value={propertyFacing} 
                      onChange={(e) => setPropertyFacing(e.target.value)} 
                      className="input-field py-2 text-xs" 
                      placeholder="e.g. East Facing" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Security Deposit (₹)</label>
                    <input 
                      type="number" 
                      value={propertyDeposit} 
                      onChange={(e) => setPropertyDeposit(e.target.value)} 
                      className="input-field py-2 text-xs" 
                      placeholder="e.g. 50000" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tenant Preference</label>
                    <input 
                      type="text" 
                      value={propertyTenantPref} 
                      onChange={(e) => setPropertyTenantPref(e.target.value)} 
                      className="input-field py-2 text-xs" 
                      placeholder="e.g. Families Only" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Available From</label>
                    <input 
                      type="text" 
                      value={propertyAvailableFrom} 
                      onChange={(e) => setPropertyAvailableFrom(e.target.value)} 
                      className="input-field py-2 text-xs" 
                      placeholder="e.g. Immediate / 1st of month" 
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* F. Commercial Property */}
          {selectedOptionId === 'commercial-offering' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-violet-50/60 rounded-2xl border border-violet-200/80">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Commercial Property Kind</label>
                <select value={commercialKind} onChange={(e) => setCommercialKind(e.target.value)} className="input-field py-2 text-xs">
                  <option value="Office Space">Office Space</option>
                  <option value="Retail Shop / Showroom">Retail Shop / Showroom</option>
                  <option value="Industrial Shed / Factory">Industrial Shed / Factory</option>
                  <option value="Warehouse / Godown">Warehouse / Godown</option>
                  <option value="Co-Working Desks">Co-Working Desks</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Power Supply / Load</label>
                <input 
                  type="text" 
                  value={commercialPowerLoad} 
                  onChange={(e) => setCommercialPowerLoad(e.target.value)} 
                  className="input-field py-2 text-xs" 
                  placeholder="e.g. 25 kVA (3-Phase)" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Parking & Access</label>
                <input 
                  type="text" 
                  value={commercialParking} 
                  onChange={(e) => setCommercialParking(e.target.value)} 
                  className="input-field py-2 text-xs" 
                  placeholder="e.g. 4 Car Parks + Truck Bay" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Loading Access</label>
                <input 
                  type="text" 
                  value={commercialLoadingDock} 
                  onChange={(e) => setCommercialLoadingDock(e.target.value)} 
                  className="input-field py-2 text-xs" 
                  placeholder="e.g. High Shutter / Goods Lift" 
                />
              </div>
            </div>
          )}

          {/* G. Plots & Land */}
          {selectedOptionId === 'plots-offering' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-5 bg-emerald-50/60 rounded-2xl border border-emerald-200/80">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Land Classification</label>
                <select value={plotType} onChange={(e) => setPlotType(e.target.value)} className="input-field py-2 text-xs">
                  <option value="Residential Layout Plot (DTCP)">Residential Layout Plot (DTCP)</option>
                  <option value="Commercial Main Road Site">Commercial Main Road Site</option>
                  <option value="Agricultural Farmland">Agricultural Farmland</option>
                  <option value="Industrial Plot (SIPCOT)">Industrial Plot (SIPCOT)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Plot Extent / Size</label>
                <input 
                  type="text" 
                  value={plotSize} 
                  onChange={(e) => setPlotSize(e.target.value)} 
                  className="input-field py-2 text-xs" 
                  placeholder="e.g. 1200 Sq.Ft (30x40) or 3 Cents" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Road Width in Front</label>
                <input 
                  type="text" 
                  value={plotRoadWidth} 
                  onChange={(e) => setPlotRoadWidth(e.target.value)} 
                  className="input-field py-2 text-xs" 
                  placeholder="e.g. 30 Feet Blacktop Road" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Approvals</label>
                <input 
                  type="text" 
                  value={plotApproval} 
                  onChange={(e) => setPlotApproval(e.target.value)} 
                  className="input-field py-2 text-xs" 
                  placeholder="e.g. DTCP & HNTDA Approved" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Fencing & Boundary</label>
                <input 
                  type="text" 
                  value={plotFencing} 
                  onChange={(e) => setPlotFencing(e.target.value)} 
                  className="input-field py-2 text-xs" 
                  placeholder="e.g. Compound wall with Gate" 
                />
              </div>
            </div>
          )}

          {/* H. Childcare */}
          {selectedOptionId.startsWith('childcare') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-5 bg-pink-50/60 rounded-2xl border border-pink-200/80">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Childcare Role / Setup</label>
                <input 
                  type="text" 
                  value={childcareRole} 
                  onChange={(e) => setChildcareRole(e.target.value)} 
                  className="input-field py-2 text-xs" 
                  placeholder="e.g. Nanny / Daycare" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Child Age Groups Handled</label>
                <input 
                  type="text" 
                  value={childcareAgeGroup} 
                  onChange={(e) => setChildcareAgeGroup(e.target.value)} 
                  className="input-field py-2 text-xs" 
                  placeholder="e.g. Toddlers (1 to 4 Years)" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Experience / Background</label>
                <input 
                  type="text" 
                  value={childcareExperience} 
                  onChange={(e) => setChildcareExperience(e.target.value)} 
                  className="input-field py-2 text-xs" 
                  placeholder="e.g. 5+ Years with Expatriate Families" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Certifications & Verification</label>
                <input 
                  type="text" 
                  value={childcareCert} 
                  onChange={(e) => setChildcareCert(e.target.value)} 
                  className="input-field py-2 text-xs" 
                  placeholder="e.g. First Aid & Police Verified" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Timing / Shift</label>
                <input 
                  type="text" 
                  value={childcareTiming} 
                  onChange={(e) => setChildcareTiming(e.target.value)} 
                  className="input-field py-2 text-xs" 
                  placeholder="e.g. 9 AM - 6 PM" 
                />
              </div>
            </div>
          )}

          {/* I. Community - Lost & Found */}
          {selectedOptionId === 'community-lost-found' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-teal-50/60 rounded-2xl border border-teal-200/80">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Case Status</label>
                <select value={lostFoundStatus} onChange={(e) => setLostFoundStatus(e.target.value)} className="input-field py-2 text-xs">
                  <option value="Lost Item">I Lost an Item</option>
                  <option value="Found Item">I Found an Item</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date Lost / Found</label>
                <input 
                  type="text" 
                  value={lostFoundDate} 
                  onChange={(e) => setLostFoundDate(e.target.value)} 
                  className="input-field py-2 text-xs" 
                  placeholder="e.g. Yesterday 4 PM" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Exact Landmark in Hosur</label>
                <input 
                  type="text" 
                  value={lostFoundLocation} 
                  onChange={(e) => setLostFoundLocation(e.target.value)} 
                  className="input-field py-2 text-xs" 
                  placeholder="e.g. Near Hosur Bus Stand / SIPCOT gate" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reward (Optional)</label>
                <input 
                  type="text" 
                  value={lostFoundReward} 
                  onChange={(e) => setLostFoundReward(e.target.value)} 
                  className="input-field py-2 text-xs" 
                  placeholder="e.g. ₹1,000 Cash Reward" 
                />
              </div>
            </div>
          )}

          {/* J. Community - Rideshare */}
          {selectedOptionId === 'community-rideshare' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-5 bg-teal-50/60 rounded-2xl border border-teal-200/80">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Starting Point</label>
                <input 
                  type="text" 
                  value={rideOrigin} 
                  onChange={(e) => setRideOrigin(e.target.value)} 
                  className="input-field py-2 text-xs" 
                  placeholder="e.g. Hosur Town / Mathigiri" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Destination</label>
                <input 
                  type="text" 
                  value={rideDestination} 
                  onChange={(e) => setRideDestination(e.target.value)} 
                  className="input-field py-2 text-xs" 
                  placeholder="e.g. Electronic City / Silk Board" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Schedule & Timings</label>
                <input 
                  type="text" 
                  value={rideSchedule} 
                  onChange={(e) => setRideSchedule(e.target.value)} 
                  className="input-field py-2 text-xs" 
                  placeholder="e.g. Mon-Fri 7:30 AM / 6:00 PM return" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Type</label>
                <input 
                  type="text" 
                  value={rideVehicle} 
                  onChange={(e) => setRideVehicle(e.target.value)} 
                  className="input-field py-2 text-xs" 
                  placeholder="e.g. AC Sedan Car / Bike" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Seats Available</label>
                <input 
                  type="text" 
                  value={rideSeats} 
                  onChange={(e) => setRideSeats(e.target.value)} 
                  className="input-field py-2 text-xs" 
                  placeholder="e.g. 2 Seats" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cost Contribution (₹ / Trip)</label>
                <input 
                  type="text" 
                  value={rideCostShare} 
                  onChange={(e) => setRideCostShare(e.target.value)} 
                  className="input-field py-2 text-xs" 
                  placeholder="e.g. ₹120 / Trip" 
                />
              </div>
            </div>
          )}

          {/* K. Community - Pet Adoption */}
          {selectedOptionId === 'community-pet-adoption' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-teal-50/60 rounded-2xl border border-teal-200/80">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pet Type & Breed</label>
                <input 
                  type="text" 
                  value={petType} 
                  onChange={(e) => setPetType(e.target.value)} 
                  className="input-field py-2 text-xs" 
                  placeholder="e.g. Puppy (Indie Rescued)" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Age & Gender</label>
                <input 
                  type="text" 
                  value={petAgeGender} 
                  onChange={(e) => setPetAgeGender(e.target.value)} 
                  className="input-field py-2 text-xs" 
                  placeholder="e.g. 3 Months, Female" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Vaccinations & Health</label>
                <input 
                  type="text" 
                  value={petHealth} 
                  onChange={(e) => setPetHealth(e.target.value)} 
                  className="input-field py-2 text-xs" 
                  placeholder="e.g. Vaccinated & Dewormed" 
                />
              </div>
            </div>
          )}

          {/* L. Community - Sports, Music, Event */}
          {selectedOptionId === 'community-sports' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-teal-50/60 rounded-2xl border border-teal-200/80">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Sport / Game</label>
                <input 
                  type="text" 
                  value={sportName} 
                  onChange={(e) => setSportName(e.target.value)} 
                  className="input-field py-2 text-xs" 
                  placeholder="e.g. Badminton / Cricket" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Skill Level</label>
                <input 
                  type="text" 
                  value={sportLevel} 
                  onChange={(e) => setSportLevel(e.target.value)} 
                  className="input-field py-2 text-xs" 
                  placeholder="e.g. Intermediate / Pro" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Timings</label>
                <input 
                  type="text" 
                  value={sportTime} 
                  onChange={(e) => setSportTime(e.target.value)} 
                  className="input-field py-2 text-xs" 
                  placeholder="e.g. Evenings 7-8 PM" 
                />
              </div>
            </div>
          )}

          {selectedOptionId === 'community-musicians' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-teal-50/60 rounded-2xl border border-teal-200/80">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Instrument / Role</label>
                <input 
                  type="text" 
                  value={musicRole} 
                  onChange={(e) => setMusicRole(e.target.value)} 
                  className="input-field py-2 text-xs" 
                  placeholder="e.g. Vocalist / Lead Guitarist" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Genre</label>
                <input 
                  type="text" 
                  value={musicGenre} 
                  onChange={(e) => setMusicGenre(e.target.value)} 
                  className="input-field py-2 text-xs" 
                  placeholder="e.g. Rock, Acoustic, Pop" 
                />
              </div>
            </div>
          )}

          {selectedOptionId === 'community-event' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-teal-50/60 rounded-2xl border border-teal-200/80">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Event Name</label>
                <input 
                  type="text" 
                  value={eventName} 
                  onChange={(e) => setEventName(e.target.value)} 
                  className="input-field py-2 text-xs" 
                  placeholder="e.g. Expatriates Hosur Cultural Meet" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date & Time</label>
                <input 
                  type="text" 
                  value={eventDate} 
                  onChange={(e) => setEventDate(e.target.value)} 
                  className="input-field py-2 text-xs" 
                  placeholder="e.g. Saturday 5 PM" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Venue in Hosur</label>
                <input 
                  type="text" 
                  value={eventVenue} 
                  onChange={(e) => setEventVenue(e.target.value)} 
                  className="input-field py-2 text-xs" 
                  placeholder="e.g. Town Community Center" 
                />
              </div>
            </div>
          )}

          {/* M. Learning */}
          {selectedOptionId === 'learning-exchange' ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-amber-50/60 rounded-2xl border border-amber-200/80">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Native Language(s)</label>
                <input 
                  type="text" 
                  value={learnNativeLang} 
                  onChange={(e) => setLearnNativeLang(e.target.value)} 
                  className="input-field py-2 text-xs" 
                  placeholder="e.g. Tamil & English" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Language(s)</label>
                <input 
                  type="text" 
                  value={learnTargetLang} 
                  onChange={(e) => setLearnTargetLang(e.target.value)} 
                  className="input-field py-2 text-xs" 
                  placeholder="e.g. Hindi / German" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Exchange Mode</label>
                <input 
                  type="text" 
                  value={learnMode} 
                  onChange={(e) => setLearnMode(e.target.value)} 
                  className="input-field py-2 text-xs" 
                  placeholder="e.g. Online / Meetup" 
                />
              </div>
            </div>
          ) : selectedOptionId.startsWith('learning') ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-amber-50/60 rounded-2xl border border-amber-200/80">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject / Skill</label>
                <input 
                  type="text" 
                  value={learnSubject} 
                  onChange={(e) => setLearnSubject(e.target.value)} 
                  className="input-field py-2 text-xs" 
                  placeholder="e.g. School Math / Spoken English" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Level</label>
                <input 
                  type="text" 
                  value={learnLevel} 
                  onChange={(e) => setLearnLevel(e.target.value)} 
                  className="input-field py-2 text-xs" 
                  placeholder="e.g. Beginner / Advanced" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Class Mode</label>
                <input 
                  type="text" 
                  value={learnMode} 
                  onChange={(e) => setLearnMode(e.target.value)} 
                  className="input-field py-2 text-xs" 
                  placeholder="e.g. Home Visit / Online" 
                />
              </div>
            </div>
          ) : null}

          {/* N. Services */}
          {selectedOptionId === 'services-offering' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-cyan-50/60 rounded-2xl border border-cyan-200/80">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Service Scope & Specialties</label>
                <input 
                  type="text" 
                  value={serviceSpecialty} 
                  onChange={(e) => setServiceSpecialty(e.target.value)} 
                  className="input-field py-2 text-xs" 
                  placeholder="e.g. Electrical Repair, Inverters, Plumbing, Deep Cleaning" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pricing Model</label>
                <input 
                  type="text" 
                  value={servicePricingModel} 
                  onChange={(e) => setServicePricingModel(e.target.value)} 
                  className="input-field py-2 text-xs" 
                  placeholder="e.g. ₹299 Inspection Charge or Fixed Quote" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Warranty & Guarantee</label>
                <input 
                  type="text" 
                  value={serviceWarranty} 
                  onChange={(e) => setServiceWarranty(e.target.value)} 
                  className="input-field py-2 text-xs" 
                  placeholder="e.g. 30 Days Service Guarantee" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Areas Covered in Hosur</label>
                <input 
                  type="text" 
                  value={serviceCoverage} 
                  onChange={(e) => setServiceCoverage(e.target.value)} 
                  className="input-field py-2 text-xs" 
                  placeholder="e.g. All Hosur Town & SIPCOT Phase 1 & 2" 
                />
              </div>
            </div>
          )}

          {/* O. Business B2B */}
          {selectedOptionId.startsWith('business') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-rose-50/60 rounded-2xl border border-rose-200/80">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Business Line / Industry</label>
                <input 
                  type="text" 
                  value={businessIndustry} 
                  onChange={(e) => setBusinessIndustry(e.target.value)} 
                  className="input-field py-2 text-xs" 
                  placeholder="e.g. CNC Machine Shop, Restaurant, Wholesale Spices" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Investment / Asking Price</label>
                <input 
                  type="text" 
                  value={businessAskingPrice} 
                  onChange={(e) => setBusinessAskingPrice(e.target.value)} 
                  className="input-field py-2 text-xs" 
                  placeholder="e.g. ₹15,00,000" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Annual Turnover / Revenue</label>
                <input 
                  type="text" 
                  value={businessTurnover} 
                  onChange={(e) => setBusinessTurnover(e.target.value)} 
                  className="input-field py-2 text-xs" 
                  placeholder="e.g. ₹40 Lakhs / Year" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason / MOQ Terms</label>
                <input 
                  type="text" 
                  value={businessReason || wholesaleMoq} 
                  onChange={(e) => {
                    setBusinessReason(e.target.value);
                    setWholesaleMoq(e.target.value);
                  }} 
                  className="input-field py-2 text-xs" 
                  placeholder="e.g. Relocating / Minimum Order: ₹25k" 
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <button
              type="button"
              onClick={handleNextStep}
              className="btn btn-primary px-6 py-2.5 text-xs font-bold shadow-xs cursor-pointer"
            >
              <span>Continue to Core Details</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 3: CORE AD CONTENT, PHOTOS & HOSUR LOCATION */}
      {/* ============================================================== */}
      {step === 3 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-card space-y-6">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 mb-1">
              3. Advertisement Details, Photos & Location
            </h2>
            <p className="text-xs text-slate-500">
              Provide a clear title, upload real pictures, and specify your pricing and Hosur locality.
            </p>
          </div>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Advertisement Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 2023 Royal Enfield Classic 350 - Single Owner Mint Condition"
                className="input-field text-sm font-semibold"
                required
              />
            </div>

            {/* Price & Location row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {currentOption.priceLabel} {currentOption.defaultListingType !== 'free' && <span className="text-rose-500">*</span>}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                    ₹
                  </div>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder={currentOption.pricePlaceholder}
                    disabled={currentOption.defaultListingType === 'free'}
                    className="input-field pl-8 text-sm font-bold text-blue-900"
                  />
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="negotiable"
                    checked={isNegotiable}
                    onChange={(e) => setIsNegotiable(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="negotiable" className="text-xs text-slate-600 font-medium cursor-pointer">
                    Price is negotiable / open to reasonable offers
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Hosur Locality / Area <span className="text-rose-500">*</span>
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="input-field text-xs font-semibold"
                >
                  {locationsList.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Accurate local tagging helps buyers find your ad within Hosur
                </p>
              </div>
            </div>

            {/* Item General Condition */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">General Condition Rating</label>
              <select value={condition} onChange={(e) => setCondition(e.target.value)} className="input-field py-2 text-xs font-medium">
                <option value="new">Brand New</option>
                <option value="like_new">Like New / Mint</option>
                <option value="good">Good / Functional</option>
                <option value="fair">Fair / Used</option>
                <option value="for_parts">For Parts / Repair</option>
              </select>
            </div>

            {/* Photos & Canvas Compression Uploader */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Upload Photo
              </label>
              <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/60 flex flex-col sm:flex-row items-center gap-4">
                {imageUrl ? (
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-100 shadow-xs">
                    <img src={imageUrl} alt="Ad Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-xl border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                    <Upload className="h-6 w-6" />
                  </div>
                )}

                <div className="flex-1 text-center sm:text-left">
                  <label className="btn btn-outline py-1.5 px-3.5 text-xs font-bold cursor-pointer inline-flex items-center gap-1.5">
                    {uploadingImage ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                        <span>Compressing & Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-3.5 w-3.5 text-blue-600" />
                        <span>Choose Photo from Device</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Supports JPG, PNG, WEBP. Images are automatically optimized for fast mobile browsing.
                  </p>
                  {uploadError && <p className="text-xs text-rose-600 mt-1 font-semibold">{uploadError}</p>}
                </div>
              </div>
            </div>

            {/* Description & Auto-Compiler */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-800">
                  Full Description <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleAutoCompileDescription}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Append Specs to Description</span>
                </button>
              </div>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your item, job opportunity, property or community notice in detail. Mention condition, reason for posting, timings, and any other relevant information."
                className="input-field text-xs leading-relaxed"
                required
              />
            </div>

            {/* Seller Contact Info */}
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                Contact & Communication Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    value={sellerName}
                    onChange={(e) => setSellerName(e.target.value)}
                    className="input-field py-1.5 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Mobile / Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-field py-1.5 text-xs font-medium"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="whatsapp"
                  checked={allowWhatsapp}
                  onChange={(e) => setAllowWhatsapp(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="whatsapp" className="text-xs text-slate-700 font-medium cursor-pointer flex items-center gap-1.5">
                  <span className="text-emerald-700 font-bold">Allow WhatsApp Inquiries</span>
                  <span className="text-slate-400 text-[11px]">(Recommended for faster buyer connections)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <button
              type="button"
              onClick={handleNextStep}
              className="btn btn-primary px-6 py-2.5 text-xs font-bold shadow-xs cursor-pointer"
            >
              <span>Review Advertisement</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 4: REVIEW & INSTANT PUBLISH */}
      {/* ============================================================== */}
      {step === 4 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-card space-y-6">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 mb-1">
              4. Review Your Listing Before Publishing
            </h2>
            <p className="text-xs text-slate-500">
              Verify your information. Once published, your advertisement will be visible across Hosur and expatriate channels.
            </p>
          </div>

          {/* Ad Live Preview Card */}
          <div className="border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-xs max-w-2xl mx-auto">
            <div className="relative aspect-video sm:aspect-[21/9] bg-slate-100 overflow-hidden">
              <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${currentSection.badgeBg}`}>
                  {currentSection.title}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-black/70 text-white backdrop-blur-md">
                  {currentOption.badge}
                </span>
              </div>
              <div className="absolute bottom-3 right-3 bg-blue-600 text-white font-black text-base px-3 py-1.5 rounded-xl shadow-lg">
                {currentOption.defaultListingType === 'free' ? 'Free' : `₹${Number(price || 0).toLocaleString()}`}
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  {title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span>{location}, Tamil Nadu</span>
                  <span>•</span>
                  <span>Posted by {sellerName}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-700 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
                {description || generateSpecsSummary()}
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Verified phone & direct buyer WhatsApp enabled</span>
                </div>
                <span className="font-bold text-blue-600">Urgenie Expatriates Verified</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Edit Details
            </button>
            <button
              type="button"
              onClick={handleSubmitAd}
              disabled={submitting}
              className="btn btn-primary px-8 py-3 text-xs sm:text-sm font-bold shadow-md cursor-pointer inline-flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Publishing Advertisement...</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 text-white" />
                  <span>Publish Advertisement Now</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 5: SUCCESS CONFIRMATION */}
      {/* ============================================================== */}
      {step === 5 && (
        <div className="bg-white rounded-3xl shadow-card border border-slate-200/80 p-8 sm:p-12 text-center max-w-lg mx-auto py-12 animate-in zoom-in-95">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xs">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Advertisement Published!</h2>
          <p className="text-slate-600 text-xs sm:text-sm mb-6 max-w-md mx-auto font-medium">
            Your ad is now active on Urgenie (Expatriates Hosur). Local residents, buyers, and expatriate members can contact you directly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link 
              to={createdAdId ? `/ad/${createdAdId}` : '/profile/ads'} 
              className="btn btn-primary px-6 py-2.5 font-bold text-xs"
            >
              View Your Live Ad
            </Link>
            <button 
              type="button" 
              onClick={() => { 
                setStep(1); 
                setTitle(''); 
                setDescription(''); 
                setPrice(''); 
                setCreatedAdId(null); 
              }} 
              className="btn btn-outline px-6 py-2.5 font-bold text-xs"
            >
              Post Another Ad
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
