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
  RotateCcw,
  Camera,
  Lock,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  EXPATRIATES_SECTIONS, 
  ALL_EXPATRIATES_OPTIONS, 
  getOptionById, 
  getSectionForOption,
  LISTING_TYPES,
  getResolvedCategoryId,
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

// Helper to determine if an option represents physical goods / merchandise
export const isPhysicalGoodOption = (optionId: string) => {
  return optionId === 'sell-item' || optionId === 'buy-item';
};

// Dynamic default cover image based on section and option
export const getDefaultImageForCategory = (sectionId: string, optionId?: string, subcatSlug?: string) => {
  if (sectionId === 'plots') {
    return 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800'; // Land / green field
  }
  if (sectionId === 'housing') {
    return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'; // Modern apartment / house
  }
  if (sectionId === 'commercial-property') {
    return 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'; // Commercial office / shop
  }
  if (sectionId === 'jobs' || sectionId === 'temp-jobs') {
    return 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800'; // Workplace / hiring
  }
  if (sectionId === 'services') {
    return 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800'; // Professional tools / repair
  }
  if (sectionId === 'childcare') {
    return 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800'; // Childcare / learning
  }
  if (sectionId === 'learning') {
    return 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800'; // Education / study
  }
  if (sectionId === 'community') {
    if (optionId === 'community-pet-adoption') {
      return 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800'; // Puppy / pet
    }
    if (optionId === 'community-rideshare') {
      return 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800'; // Carpool / driving
    }
    if (optionId === 'community-musicians') {
      return 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800'; // Music instrument
    }
    if (optionId === 'community-sports') {
      return 'https://images.unsplash.com/photo-1526676037777-05a232554f77?w=800'; // Badminton / sports
    }
    return 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800'; // Community gathering
  }
  if (sectionId === 'buy-sell') {
    if (subcatSlug && (subcatSlug.includes('vehicles') || subcatSlug.includes('motorcycles'))) {
      return 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800'; // Motorcycle / vehicle
    }
    if (subcatSlug && (subcatSlug.includes('mobile') || subcatSlug.includes('computers'))) {
      return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800'; // Tech gadget
    }
    return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'; // Merchandise
  }
  return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800';
};

// Category and Subcategory Tailored Title Placeholders
export const getTitlePlaceholder = (optionId: string, subcatSlug?: string) => {
  if (optionId === 'plots-offering') {
    if (subcatSlug === 'residential-plots') return 'e.g. 1200 Sq.Ft (30x40) DTCP Approved Plot for Sale near Mathigiri';
    if (subcatSlug === 'commercial-land') return 'e.g. 3,500 Sq.Ft Commercial Main Road Site near SIPCOT Phase 2';
    if (subcatSlug === 'agricultural-farmland') return 'e.g. 2 Acres Fertile Farmland with Borewell & Road Access near Hosur';
    if (subcatSlug === 'industrial-plots') return 'e.g. 1 Acre Industrial Plot in SIPCOT Zone with 40ft Road Access';
    return 'e.g. 1200 Sq.Ft Layout Plot for Sale in Hosur';
  }
  if (optionId === 'housing-offering') {
    if (subcatSlug === 'apartments-rent') return 'e.g. Semi-Furnished 2 BHK Apartment for Rent on Bagalur Road';
    if (subcatSlug === 'houses-rent') return 'e.g. Independent 3 BHK Villa with Car Parking for Rent in Mathigiri';
    if (subcatSlug === 'rooms-shared-rent') return 'e.g. Furnished Single Room in 3 BHK Flat for Working Professional';
    if (subcatSlug === 'pg-hostels') return "e.g. Executive Men's / Women's PG with 3 Times Food & Wi-Fi near SIPCOT";
    if (subcatSlug === 'apartments-sale') return 'e.g. Newly Constructed 3 BHK Luxury Flat with Lift & Parking for Sale';
    if (subcatSlug === 'houses-sale') return 'e.g. Independent 3 BHK Duplex House with Gated Security for Sale';
    if (subcatSlug === 'short-term-rentals') return 'e.g. Fully Furnished 2 BHK Flat for Short-Term / Monthly Stay';
    return 'e.g. 2 BHK House / Apartment in Hosur';
  }
  if (optionId === 'housing-seeking') return 'e.g. Family looking for 2 BHK Flat / House for Rent near SIPCOT Phase 1';
  if (optionId === 'housing-exchange') return 'e.g. House Exchange: 3 BHK House in Hosur for 2 BHK Flat in Bangalore';
  if (optionId === 'commercial-offering') {
    if (subcatSlug === 'commercial-offices') return 'e.g. 1200 Sq.Ft Furnished Office Space for Rent in Hosur Town';
    if (subcatSlug === 'retail-shops') return 'e.g. Main Road Ground Floor Retail Shop / Showroom for Rent';
    if (subcatSlug === 'warehouses-godowns') return 'e.g. 5,000 Sq.Ft Industrial Warehouse / Godown near Highway';
    if (subcatSlug === 'industrial-sheds') return 'e.g. 10,000 Sq.Ft Industrial Shed with 50 kVA Power in SIPCOT';
    return 'e.g. Commercial Space / Shop for Rent in Hosur';
  }
  if (optionId === 'job-seeking') return 'e.g. Experienced CNC Machine Operator / Quality Engineer seeking Job in Hosur';
  if (optionId === 'job-offering') return 'e.g. Hiring: Full-Time Production Supervisor & Maintenance Engineer in Hosur';
  if (optionId === 'temp-jobs-hire') return 'e.g. Urgent: Event Staff / Delivery Driver needed for 2 Days in Hosur';
  if (optionId === 'childcare-seeking') return 'e.g. Experienced Nanny & Babysitter available for Childcare in Hosur';
  if (optionId === 'childcare-hire') return 'e.g. Seeking Trusted Full-Time Babysitter for 2-Year-Old Child in Hosur';
  if (optionId === 'childcare-daycare') return 'e.g. Safe & Loving Daycare and Playgroup Services near Hosur Town Center';
  if (optionId === 'community-rideshare') return 'e.g. Daily Carpool / Rideshare: Hosur to Electronic City (8:00 AM / 6:00 PM)';
  if (optionId === 'community-pet-adoption') return 'e.g. Healthy 2-Month Indie Rescued Puppy looking for a loving home';
  if (optionId === 'community-lost-found') return 'e.g. Lost Black Leather Wallet near Hosur Bus Stand on Monday';
  if (optionId === 'community-sports') return 'e.g. Looking for Badminton Partners for Evening Games in Hosur';
  if (optionId === 'community-musicians') return 'e.g. Lead Guitarist seeking Vocalist & Drummer for Classic Rock Band';
  if (optionId === 'community-event') return 'e.g. Weekend Hosur Expat & Community Cultural Meetup';
  if (optionId === 'community-artists') return 'e.g. Looking for Digital Artists & Illustrators for Hosur Project';
  if (optionId === 'community-general') return 'e.g. Hosur Neighbourhood Cleanliness & Greening Initiative';
  if (optionId === 'community-help') return 'e.g. Volunteer Assistance & Senior Citizen Support in Hosur';
  if (optionId === 'community-news') return 'e.g. Local Civic Update: Road Works on Bagalur Road';
  if (optionId === 'community-permit-transfer') return 'e.g. Seeking Mutual Permit / Relocation Transfer Information';
  if (optionId === 'learning-exchange') return 'e.g. Native Tamil Speaker looking for German / Hindi Language Exchange';
  if (optionId === 'learning-offering') return 'e.g. Experienced Math & Science Tutor for Classes 8 to 12 in Hosur';
  if (optionId === 'learning-seeking') return 'e.g. Looking for Spoken English or French Tutor for Beginners';
  if (optionId === 'services-offering') {
    if (subcatSlug === 'home-repairs') return 'e.g. Professional Electrician & Plumbing Repairs in Hosur with Quick Visit';
    if (subcatSlug === 'appliance-repair') return 'e.g. AC Repair, Washing Machine & Refrigerator Service with Warranty';
    if (subcatSlug === 'cleaning-pest') return 'e.g. Deep Home Cleaning & Professional Pest Control in Hosur';
    if (subcatSlug === 'movers-packers') return 'e.g. Reliable Movers & Packers / Mini Truck Shifting Services';
    if (subcatSlug === 'computer-tech') return 'e.g. Computer, Laptop & CCTV Installation and Repair Services';
    if (subcatSlug === 'accounting-legal') return 'e.g. GST Registration, Income Tax Filing & Company Incorporation';
    if (subcatSlug === 'salon-beauty') return 'e.g. Professional Bridal Makeup & Salon at Home Services in Hosur';
    if (subcatSlug === 'events-photography') return 'e.g. Candid Wedding & Birthday Event Photography in Hosur';
    if (subcatSlug === 'domestic-help') return 'e.g. Trusted Cook & Housekeeper Maid Services for Families';
    if (subcatSlug === 'auto-repair') return 'e.g. Car Mechanic, Doorstep Foam Wash & Detailing Services';
    return 'e.g. Professional On-Demand Services in Hosur';
  }
  if (optionId === 'sell-item') {
    if (subcatSlug && (subcatSlug.includes('vehicles') || subcatSlug.includes('motorcycles'))) {
      return 'e.g. 2023 Royal Enfield Classic 350 - Single Owner Mint Condition';
    }
    if (subcatSlug && (subcatSlug.includes('mobile') || subcatSlug.includes('phones'))) {
      return 'e.g. iPhone 14 128GB Blue - 100% Battery Health with Bill & Box';
    }
    if (subcatSlug && (subcatSlug.includes('computers') || subcatSlug.includes('laptops'))) {
      return 'e.g. Dell Latitude 14-inch Laptop i5 16GB RAM 512GB SSD in Excellent Condition';
    }
    if (subcatSlug && (subcatSlug.includes('appliances') || subcatSlug.includes('home-appliances'))) {
      return 'e.g. LG 260L Inverter Double Door Refrigerator - 2 Years Old';
    }
    if (subcatSlug && (subcatSlug.includes('furniture'))) {
      return 'e.g. Solid Sheesham Wood 6-Seater Dining Table with Cushioned Chairs';
    }
    return 'e.g. Brand / Model Item Name in Good Working Condition';
  }
  if (optionId === 'buy-item') return 'e.g. Looking to Buy Used Scooter (Activa/Jupiter) in Good Condition';
  return 'e.g. Enter a clear and descriptive title for your advertisement';
};

// Category Tailored Description Placeholders
export const getDescriptionPlaceholder = (optionId: string) => {
  if (optionId === 'plots-offering') {
    return 'Describe the land / plot: exact dimensions, survey number / patta status, facing (East/North), access road width, water/electricity connection, distance from highway/bus stand, and clear title details.';
  }
  if (optionId === 'housing-offering') {
    return 'Describe the property: room count, built-up area, flooring, water source (Cauvery / Borewell), car parking availability, power backup, security, nearby schools/companies, and move-in terms.';
  }
  if (optionId === 'housing-seeking') {
    return 'Describe your requirement: family / bachelor size, preferred BHK, required amenities (parking, lift), budget limit, preferred localities in Hosur, and intended move-in date.';
  }
  if (optionId === 'commercial-offering') {
    return 'Describe the commercial space: floor area, frontage, main road visibility, power supply capacity (kVA), parking space for visitors/trucks, suitable businesses, and lease terms.';
  }
  if (optionId === 'job-seeking') {
    return 'Describe your career profile: total years of experience, past employers, core technical/functional skills, highest education, certifications, notice period, and preferred role/location in Hosur.';
  }
  if (optionId === 'job-offering') {
    return 'Describe the job vacancy: roles and responsibilities, required qualifications and experience, work timings / shifts, salary breakdown and benefits, work location, and interview process.';
  }
  if (optionId === 'temp-jobs-hire') {
    return 'Describe the gig: specific task to be done, duration (hours/days), date and timing, pay per hour/day, reporting location in Hosur, and any tools/skills needed.';
  }
  if (optionId === 'services-offering') {
    return 'Describe your service: scope of work, years of experience, visit charges / pricing details, guarantee/warranty provided, service area coverage in Hosur, and typical response time.';
  }
  if (optionId.startsWith('childcare')) {
    return 'Describe your childcare needs or offering: age of children, timings and daily routine, background/experience, police verification, meal preparation, and expectations.';
  }
  if (optionId === 'community-rideshare') {
    return 'Describe the carpool: daily route and pickup/drop points, exact departure and return timings, vehicle model (AC/Non-AC), luggage capacity, and fuel contribution details.';
  }
  if (optionId === 'community-pet-adoption') {
    return 'Describe the pet: breed, age, gender, temperament with children/other pets, vaccination and deworming history, diet habits, and adoption requirements.';
  }
  if (optionId === 'community-lost-found') {
    return 'Describe the lost or found item: exact description, brand/color, date, time, landmark/location where lost or found, identification marks, and how owner can contact or claim.';
  }
  if (optionId.startsWith('community')) {
    return 'Describe your community announcement, initiative, meetup, or event in detail: schedule, venue, who should join, guidelines, and contact instructions.';
  }
  if (optionId.startsWith('learning')) {
    return 'Describe the learning offering or requirement: subjects/languages, syllabus (CBSE/ICSE/State), experience level, online or in-person class schedule, and fees.';
  }
  if (optionId === 'sell-item') {
    return 'Describe your item: brand, model, age, working condition, any cosmetic wear or flaws, included accessories (cables, box, bill), reason for selling, and testing availability.';
  }
  if (optionId === 'buy-item') {
    return 'Describe the item you want to purchase: preferred brand/model, acceptable condition, budget range, urgency, and preferred meetup location in Hosur.';
  }
  return 'Provide comprehensive details about your advertisement. Clear descriptions receive significantly higher responses from genuine Hosur buyers and community members.';
};

// Filter out old legacy dummy strings from stale local drafts
const OLD_DUMMY_VALUES = new Set([
  '30 Feet Blacktop Road',
  'DTCP & HNTDA Approved',
  'Gated Layout with Boundary Wall',
  'Experienced Nanny / Babysitter',
  'Toddlers (1 to 4 Years)',
  '5+ Years in Expat Families',
  'First Aid & Police Verified',
  'Full-Time Day (9 AM - 6 PM)',
  'Yesterday Afternoon',
  'Near Hosur Bus Stand / Town',
  '₹1,000 Cash Reward',
  'Hosur Town / Mathigiri',
  'Electronic City / Silk Board, Bangalore',
  'Daily Morning 7:45 AM / Return 6:30 PM',
  'AC Sedan Car',
  '2 Seats Available',
  '₹120 / Trip (Fuel Split)',
  'Puppy (Indie Rescued)',
  '3 Months, Female',
  'Vaccinated & Dewormed',
  'Badminton',
  'Intermediate / Regular Player',
  'Weekday Evenings (7:00 PM - 8:30 PM)',
  'Acoustic / Lead Guitarist',
  'Rock, Pop, Acoustic Ballads',
  'Expatriates Hosur Cultural Meet',
  'Upcoming Saturday 5:00 PM',
  'Hosur Town Community Hall',
  'Spoken English & Communication',
  'Tamil & English',
  'Hindi / German',
  'Online Video Call / In-Person',
  'Beginner to Intermediate',
  'Electrical Wiring & Inverter Setup',
  '₹299 Inspection / Visit Charge',
  '30 Days Service Warranty',
  'All Hosur & SIPCOT Areas'
]);
const sanitizeDraftValue = (v: any) => (v && !OLD_DUMMY_VALUES.has(v) ? v : '');

export default function PostAd() {
  const { user, profile, signIn, signUp } = useAuth();
  const DRAFT_KEY = 'urgenie_post_ad_draft_v2';

  // Wizard Steps:
  // 1 = Select Expatriates Option & Subcategory
  // 2 = Tailored Category Attributes
  // 3 = Core Ad Details (Title, Price, Location, Photos, Description, Contact)
  // 4 = Review & Instant Publish
  // 5 = Success Screen
  const [step, setStep] = useState(1);
  const [restoredFromDraft, setRestoredFromDraft] = useState(false);

  // Auth Modal States for Unauthenticated Publishing
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'register' | 'login'>('register');
  const [authModalName, setAuthModalName] = useState('');
  const [authModalPhone, setAuthModalPhone] = useState('');
  const [authModalEmail, setAuthModalEmail] = useState('');
  const [authModalPassword, setAuthModalPassword] = useState('');
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [authModalLoading, setAuthModalLoading] = useState(false);
  const [authModalError, setAuthModalError] = useState<string | null>(null);

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
  const [images, setImages] = useState<string[]>([]);
  const [reviewPhotoIndex, setReviewPhotoIndex] = useState(0);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [sellerName, setSellerName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [allowWhatsapp, setAllowWhatsapp] = useState(true);

  // Submission States
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdAdId, setCreatedAdId] = useState<string | null>(null);

  // ==============================================================
  // TAILORED ATTRIBUTES PER EXPATRIATES OPTION
  // ==============================================================
  // 1. Buy/Sell & Vehicles
  const [vehicleBrand, setVehicleBrand] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [vehicleFuel, setVehicleFuel] = useState('Petrol');
  const [vehicleKm, setVehicleKm] = useState('');
  const [vehicleOwners, setVehicleOwners] = useState('1st Owner');
  const [vehicleTransmission, setVehicleTransmission] = useState('Manual');
  const [itemCondition, setItemCondition] = useState('Like New (Mint)');
  const [itemWarranty, setItemWarranty] = useState('');
  const [itemBillBox, setItemBillBox] = useState('');

  // 2. Buy/Sell (Wanted)
  const [wantedUrgency, setWantedUrgency] = useState('');
  const [wantedCondition, setWantedCondition] = useState('');

  // 3. Jobs (Seeking vs Offering)
  const [jobTitle, setJobTitle] = useState('');
  const [jobCompany, setJobCompany] = useState('');
  const [jobIndustry, setJobIndustry] = useState('');
  const [jobExperience, setJobExperience] = useState('');
  const [jobType, setJobType] = useState('Full-Time Permanent');
  const [jobEducation, setJobEducation] = useState('');
  const [jobNoticePeriod, setJobNoticePeriod] = useState('');
  const [jobWorkMode, setJobWorkMode] = useState('');
  const [jobSkills, setJobSkills] = useState('');

  // 4. Temp Jobs
  const [tempDuration, setTempDuration] = useState('1 Day Only');
  const [tempPayBasis, setTempPayBasis] = useState('');
  const [tempHours, setTempHours] = useState('');
  const [tempUrgency, setTempUrgency] = useState('Immediate (Starts Tomorrow)');

  // 5. Housing (Offering vs Exchange vs Seeking)
  const [housingOfferType, setHousingOfferType] = useState('For Rent');
  const [propertyBhk, setPropertyBhk] = useState('2 BHK');
  const [propertyArea, setPropertyArea] = useState('');
  const [propertyFurnishing, setPropertyFurnishing] = useState('Semi-Furnished');
  const [propertyFloor, setPropertyFloor] = useState('');
  const [propertyFacing, setPropertyFacing] = useState('');
  const [propertyDeposit, setPropertyDeposit] = useState('');
  const [propertyTenantPref, setPropertyTenantPref] = useState('');
  const [propertyAvailableFrom, setPropertyAvailableFrom] = useState('');

  // Housing Exchange
  const [exchangeCurrentLoc, setExchangeCurrentLoc] = useState('');
  const [exchangeDestination, setExchangeDestination] = useState('');
  const [exchangeDuration, setExchangeDuration] = useState('');

  // Housing Seeking
  const [seekTenantType, setSeekTenantType] = useState('');
  const [seekPreferredAreas, setSeekPreferredAreas] = useState('');

  // 6. Commercial Property
  const [commercialKind, setCommercialKind] = useState('');
  const [commercialPowerLoad, setCommercialPowerLoad] = useState('');
  const [commercialParking, setCommercialParking] = useState('');
  const [commercialLoadingDock, setCommercialLoadingDock] = useState('');

  // 7. Plots
  const [plotType, setPlotType] = useState('Residential Layout Plot (DTCP)');
  const [plotSize, setPlotSize] = useState('');
  const [plotRoadWidth, setPlotRoadWidth] = useState('');
  const [plotApproval, setPlotApproval] = useState('');
  const [plotFencing, setPlotFencing] = useState('');

  // 8. Childcare
  const [childcareRole, setChildcareRole] = useState('');
  const [childcareAgeGroup, setChildcareAgeGroup] = useState('');
  const [childcareExperience, setChildcareExperience] = useState('');
  const [childcareCert, setChildcareCert] = useState('');
  const [childcareTiming, setChildcareTiming] = useState('');

  // 9. Community
  const [lostFoundStatus, setLostFoundStatus] = useState('Lost Item');
  const [lostFoundDate, setLostFoundDate] = useState('');
  const [lostFoundLocation, setLostFoundLocation] = useState('');
  const [lostFoundReward, setLostFoundReward] = useState('');

  // Rideshare
  const [rideOrigin, setRideOrigin] = useState('');
  const [rideDestination, setRideDestination] = useState('');
  const [rideSchedule, setRideSchedule] = useState('');
  const [rideVehicle, setRideVehicle] = useState('');
  const [rideSeats, setRideSeats] = useState('');
  const [rideCostShare, setRideCostShare] = useState('');

  // Pet Adoption
  const [petType, setPetType] = useState('');
  const [petAgeGender, setPetAgeGender] = useState('');
  const [petHealth, setPetHealth] = useState('');

  // Sports & Music
  const [sportName, setSportName] = useState('');
  const [sportLevel, setSportLevel] = useState('');
  const [sportTime, setSportTime] = useState('');
  const [musicRole, setMusicRole] = useState('');
  const [musicGenre, setMusicGenre] = useState('');

  // Event
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventVenue, setEventVenue] = useState('');

  // 10. Learning
  const [learnSubject, setLearnSubject] = useState('');
  const [learnNativeLang, setLearnNativeLang] = useState('');
  const [learnTargetLang, setLearnTargetLang] = useState('');
  const [learnMode, setLearnMode] = useState('');
  const [learnLevel, setLearnLevel] = useState('');

  // 11. Services
  const [serviceSpecialty, setServiceSpecialty] = useState('');
  const [servicePricingModel, setServicePricingModel] = useState('');
  const [serviceWarranty, setServiceWarranty] = useState('');
  const [serviceCoverage, setServiceCoverage] = useState('');


  const saveDraftToStorage = (targetStep?: number) => {
    try {
      const draft = {
        step: targetStep !== undefined ? targetStep : step,
        selectedOptionId,
        selectedSubcategorySlug,
        title,
        description,
        price,
        isNegotiable,
        condition,
        location,
        images,
        sellerName,
        phone,
        allowWhatsapp,
        // Category Specs
        vehicleBrand,
        vehicleModel,
        vehicleYear,
        vehicleFuel,
        vehicleKm,
        vehicleOwners,
        vehicleTransmission,
        itemCondition,
        itemWarranty,
        itemBillBox,
        wantedUrgency,
        wantedCondition,
        jobTitle,
        jobCompany,
        jobIndustry,
        jobExperience,
        jobType,
        jobEducation,
        jobNoticePeriod,
        jobWorkMode,
        jobSkills,
        tempDuration,
        tempPayBasis,
        tempHours,
        tempUrgency,
        housingOfferType,
        propertyBhk,
        propertyArea,
        propertyFurnishing,
        propertyFloor,
        propertyFacing,
        propertyDeposit,
        propertyTenantPref,
        propertyAvailableFrom,
        exchangeCurrentLoc,
        exchangeDestination,
        exchangeDuration,
        seekTenantType,
        seekPreferredAreas,
        commercialKind,
        commercialPowerLoad,
        commercialParking,
        commercialLoadingDock,
        plotType,
        plotSize,
        plotRoadWidth,
        plotApproval,
        plotFencing,
        childcareRole,
        childcareAgeGroup,
        childcareExperience,
        childcareCert,
        childcareTiming,
        lostFoundStatus,
        lostFoundDate,
        lostFoundLocation,
        lostFoundReward,
        rideOrigin,
        rideDestination,
        rideSchedule,
        rideVehicle,
        rideSeats,
        rideCostShare,
        petType,
        petAgeGender,
        petHealth,
        sportName,
        sportLevel,
        sportTime,
        musicRole,
        musicGenre,
        eventName,
        eventDate,
        eventVenue,
        learnSubject,
        learnNativeLang,
        learnTargetLang,
        learnMode,
        learnLevel,
        serviceSpecialty,
        servicePricingModel,
        serviceWarranty,
        serviceCoverage,
        savedAt: Date.now(),
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch (e) {
      console.warn('Draft save warning:', e);
    }
  };

  const handleDiscardDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
      localStorage.removeItem('urgenie_post_ad_draft');
    } catch {}
    setRestoredFromDraft(false);
    setStep(1);
    setTitle('');
    setDescription('');
    setPrice('');
    setIsNegotiable(true);
    setCondition('good');
    setImages([]);
    setReviewPhotoIndex(0);
    setSellerName(profile?.full_name || '');
    setPhone(profile?.phone || '');
    setVehicleBrand('');
    setVehicleModel('');
    setVehicleYear('');
    setVehicleKm('');
    setVehicleOwners('1st Owner');
    setVehicleTransmission('Manual');
    setItemCondition('Like New (Mint)');
    setItemWarranty('');
    setItemBillBox('');
    setWantedUrgency('');
    setWantedCondition('');
    setJobTitle('');
    setJobCompany('');
    setJobIndustry('');
    setJobExperience('');
    setJobType('Full-Time Permanent');
    setJobEducation('');
    setJobNoticePeriod('');
    setJobWorkMode('');
    setJobSkills('');
    setTempDuration('1 Day Only');
    setTempPayBasis('');
    setTempHours('');
    setTempUrgency('Immediate (Starts Tomorrow)');
    setHousingOfferType('For Rent');
    setPropertyBhk('2 BHK');
    setPropertyArea('');
    setPropertyFurnishing('Semi-Furnished');
    setPropertyFloor('');
    setPropertyFacing('');
    setPropertyDeposit('');
    setPropertyTenantPref('');
    setPropertyAvailableFrom('');
    setExchangeCurrentLoc('');
    setExchangeDestination('');
    setExchangeDuration('');
    setSeekTenantType('');
    setSeekPreferredAreas('');
    setCommercialKind('Office Space');
    setCommercialPowerLoad('');
    setCommercialParking('');
    setCommercialLoadingDock('');
    setPlotType('Residential Layout Plot (DTCP)');
    setPlotSize('');
    setPlotRoadWidth('');
    setPlotApproval('');
    setPlotFencing('');
    setChildcareRole('');
    setChildcareAgeGroup('');
    setChildcareExperience('');
    setChildcareCert('');
    setChildcareTiming('');
    setLostFoundStatus('Lost Item');
    setLostFoundDate('');
    setLostFoundLocation('');
    setLostFoundReward('');
    setRideOrigin('');
    setRideDestination('');
    setRideSchedule('');
    setRideVehicle('');
    setRideSeats('');
    setRideCostShare('');
    setPetType('');
    setPetAgeGender('');
    setPetHealth('');
    setSportName('');
    setSportLevel('');
    setSportTime('');
    setMusicRole('');
    setMusicGenre('');
    setEventName('');
    setEventDate('');
    setEventVenue('');
    setLearnSubject('');
    setLearnNativeLang('');
    setLearnTargetLang('');
    setLearnMode('');
    setLearnLevel('');
    setServiceSpecialty('');
    setServicePricingModel('');
    setServiceWarranty('');
    setServiceCoverage('');
  };

  // Restore draft on initial mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY) || localStorage.getItem('urgenie_post_ad_draft');
      if (saved) {
        const d = JSON.parse(saved);
        if (d && (d.title || d.description || (d.images && d.images.length > 0) || d.selectedOptionId)) {
          if (d.step && d.step >= 1 && d.step <= 4) setStep(d.step);
          if (d.selectedOptionId) setSelectedOptionId(d.selectedOptionId);
          if (d.selectedSubcategorySlug) setSelectedSubcategorySlug(d.selectedSubcategorySlug);
          
          // Only restore title if it wasn't the auto-generated sentence or a mismatched old category title
          if (d.title && !d.title.startsWith('I am offering') && !d.title.startsWith('I would like')) {
            if (d.title.includes('Office Space') && d.selectedOptionId !== 'commercial-offering') {
              // Ignore old mismatched commercial title
            } else {
              setTitle(d.title);
            }
          }
          if (d.description) setDescription(d.description);
          if (d.price !== undefined) setPrice(d.price);
          if (d.isNegotiable !== undefined) setIsNegotiable(d.isNegotiable);
          if (d.condition) setCondition(d.condition);
          if (d.location) setLocation(d.location);
          if (Array.isArray(d.images)) setImages(d.images);
          if (d.sellerName) setSellerName(d.sellerName);
          if (d.phone) setPhone(d.phone);
          if (d.allowWhatsapp !== undefined) setAllowWhatsapp(d.allowWhatsapp);

          // Category Specs (filtered to remove any legacy dummy test strings)
          if (d.vehicleBrand) setVehicleBrand(d.vehicleBrand);
          if (d.vehicleModel) setVehicleModel(d.vehicleModel);
          if (d.vehicleYear) setVehicleYear(d.vehicleYear);
          if (d.vehicleFuel) setVehicleFuel(d.vehicleFuel);
          if (d.vehicleKm) setVehicleKm(d.vehicleKm);
          if (d.vehicleOwners) setVehicleOwners(d.vehicleOwners);
          if (d.vehicleTransmission) setVehicleTransmission(d.vehicleTransmission);
          if (d.itemCondition) setItemCondition(d.itemCondition);
          if (d.itemWarranty) setItemWarranty(d.itemWarranty);
          if (d.itemBillBox) setItemBillBox(d.itemBillBox);
          if (d.wantedUrgency) setWantedUrgency(d.wantedUrgency);
          if (d.wantedCondition) setWantedCondition(d.wantedCondition);
          if (d.jobTitle) setJobTitle(d.jobTitle);
          if (d.jobCompany) setJobCompany(d.jobCompany);
          if (d.jobIndustry) setJobIndustry(d.jobIndustry);
          if (d.jobExperience) setJobExperience(d.jobExperience);
          if (d.jobType) setJobType(d.jobType);
          if (d.jobEducation) setJobEducation(d.jobEducation);
          if (d.jobNoticePeriod) setJobNoticePeriod(d.jobNoticePeriod);
          if (d.jobWorkMode) setJobWorkMode(d.jobWorkMode);
          if (d.jobSkills) setJobSkills(d.jobSkills);
          if (d.tempDuration) setTempDuration(d.tempDuration);
          if (d.tempPayBasis) setTempPayBasis(d.tempPayBasis);
          if (d.tempHours) setTempHours(d.tempHours);
          if (d.tempUrgency) setTempUrgency(d.tempUrgency);
          if (d.housingOfferType) setHousingOfferType(d.housingOfferType);
          if (d.propertyBhk) setPropertyBhk(d.propertyBhk);
          if (d.propertyArea) setPropertyArea(d.propertyArea);
          if (d.propertyFurnishing) setPropertyFurnishing(d.propertyFurnishing);
          if (d.propertyFloor) setPropertyFloor(d.propertyFloor);
          if (d.propertyFacing) setPropertyFacing(d.propertyFacing);
          if (d.propertyDeposit) setPropertyDeposit(d.propertyDeposit);
          if (d.propertyTenantPref) setPropertyTenantPref(d.propertyTenantPref);
          if (d.propertyAvailableFrom) setPropertyAvailableFrom(d.propertyAvailableFrom);
          if (d.exchangeCurrentLoc) setExchangeCurrentLoc(d.exchangeCurrentLoc);
          if (d.exchangeDestination) setExchangeDestination(d.exchangeDestination);
          if (d.exchangeDuration) setExchangeDuration(d.exchangeDuration);
          if (d.seekTenantType) setSeekTenantType(d.seekTenantType);
          if (d.seekPreferredAreas) setSeekPreferredAreas(d.seekPreferredAreas);
          if (d.commercialKind) setCommercialKind(d.commercialKind);
          if (d.commercialPowerLoad) setCommercialPowerLoad(d.commercialPowerLoad);
          if (d.commercialParking) setCommercialParking(d.commercialParking);
          if (d.commercialLoadingDock) setCommercialLoadingDock(d.commercialLoadingDock);
          if (d.plotType) setPlotType(d.plotType);
          if (d.plotSize) setPlotSize(sanitizeDraftValue(d.plotSize));
          if (d.plotRoadWidth) setPlotRoadWidth(sanitizeDraftValue(d.plotRoadWidth));
          if (d.plotApproval) setPlotApproval(sanitizeDraftValue(d.plotApproval));
          if (d.plotFencing) setPlotFencing(sanitizeDraftValue(d.plotFencing));
          if (d.childcareRole) setChildcareRole(sanitizeDraftValue(d.childcareRole));
          if (d.childcareAgeGroup) setChildcareAgeGroup(sanitizeDraftValue(d.childcareAgeGroup));
          if (d.childcareExperience) setChildcareExperience(sanitizeDraftValue(d.childcareExperience));
          if (d.childcareCert) setChildcareCert(sanitizeDraftValue(d.childcareCert));
          if (d.childcareTiming) setChildcareTiming(sanitizeDraftValue(d.childcareTiming));
          if (d.lostFoundStatus) setLostFoundStatus(d.lostFoundStatus);
          if (d.lostFoundDate) setLostFoundDate(sanitizeDraftValue(d.lostFoundDate));
          if (d.lostFoundLocation) setLostFoundLocation(sanitizeDraftValue(d.lostFoundLocation));
          if (d.lostFoundReward) setLostFoundReward(sanitizeDraftValue(d.lostFoundReward));
          if (d.rideOrigin) setRideOrigin(sanitizeDraftValue(d.rideOrigin));
          if (d.rideDestination) setRideDestination(sanitizeDraftValue(d.rideDestination));
          if (d.rideSchedule) setRideSchedule(sanitizeDraftValue(d.rideSchedule));
          if (d.rideVehicle) setRideVehicle(sanitizeDraftValue(d.rideVehicle));
          if (d.rideSeats) setRideSeats(sanitizeDraftValue(d.rideSeats));
          if (d.rideCostShare) setRideCostShare(sanitizeDraftValue(d.rideCostShare));
          if (d.petType) setPetType(sanitizeDraftValue(d.petType));
          if (d.petAgeGender) setPetAgeGender(sanitizeDraftValue(d.petAgeGender));
          if (d.petHealth) setPetHealth(sanitizeDraftValue(d.petHealth));
          if (d.sportName) setSportName(sanitizeDraftValue(d.sportName));
          if (d.sportLevel) setSportLevel(sanitizeDraftValue(d.sportLevel));
          if (d.sportTime) setSportTime(sanitizeDraftValue(d.sportTime));
          if (d.musicRole) setMusicRole(sanitizeDraftValue(d.musicRole));
          if (d.musicGenre) setMusicGenre(sanitizeDraftValue(d.musicGenre));
          if (d.eventName) setEventName(sanitizeDraftValue(d.eventName));
          if (d.eventDate) setEventDate(sanitizeDraftValue(d.eventDate));
          if (d.eventVenue) setEventVenue(sanitizeDraftValue(d.eventVenue));
          if (d.learnSubject) setLearnSubject(sanitizeDraftValue(d.learnSubject));
          if (d.learnNativeLang) setLearnNativeLang(sanitizeDraftValue(d.learnNativeLang));
          if (d.learnTargetLang) setLearnTargetLang(sanitizeDraftValue(d.learnTargetLang));
          if (d.learnMode) setLearnMode(sanitizeDraftValue(d.learnMode));
          if (d.learnLevel) setLearnLevel(sanitizeDraftValue(d.learnLevel));
          if (d.serviceSpecialty) setServiceSpecialty(sanitizeDraftValue(d.serviceSpecialty));
          if (d.servicePricingModel) setServicePricingModel(sanitizeDraftValue(d.servicePricingModel));
          if (d.serviceWarranty) setServiceWarranty(sanitizeDraftValue(d.serviceWarranty));
          if (d.serviceCoverage) setServiceCoverage(sanitizeDraftValue(d.serviceCoverage));

          setRestoredFromDraft(true);
        }
      }
    } catch (e) {
      console.warn('Draft restore error:', e);
    }
  }, []);

  // Sync profile data when available or updated
  useEffect(() => {
    if (profile) {
      if (profile.full_name && (!sellerName || sellerName === 'Verified User')) {
        setSellerName(profile.full_name);
      }
      if (profile.phone && (!phone || phone === '9876543210')) {
        setPhone(profile.phone);
      }
    }
  }, [profile]);

  // Debounced draft auto-save
  useEffect(() => {
    if (step === 5) return;
    const timer = setTimeout(() => {
      saveDraftToStorage();
    }, 500);
    return () => clearTimeout(timer);
  }, [
    step, selectedOptionId, selectedSubcategorySlug, title, description, price, isNegotiable,
    condition, location, images, sellerName, phone, allowWhatsapp, vehicleBrand, vehicleModel,
    vehicleYear, vehicleFuel, vehicleKm, vehicleOwners, vehicleTransmission, itemCondition,
    itemWarranty, itemBillBox, wantedUrgency, wantedCondition, jobTitle, jobCompany,
    jobIndustry, jobExperience, jobType, jobEducation, jobNoticePeriod, jobWorkMode, jobSkills,
    tempDuration, tempPayBasis, tempHours, tempUrgency, housingOfferType, propertyBhk,
    propertyArea, propertyFurnishing, propertyFloor, propertyFacing, propertyDeposit,
    propertyTenantPref, propertyAvailableFrom, exchangeCurrentLoc, exchangeDestination,
    exchangeDuration, seekTenantType, seekPreferredAreas, commercialKind, commercialPowerLoad,
    commercialParking, commercialLoadingDock, plotType, plotSize, plotRoadWidth, plotApproval,
    plotFencing, childcareRole, childcareAgeGroup, childcareExperience, childcareCert,
    childcareTiming, lostFoundStatus, lostFoundDate, lostFoundLocation, lostFoundReward,
    rideOrigin, rideDestination, rideSchedule, rideVehicle, rideSeats, rideCostShare,
    petType, petAgeGender, petHealth, sportName, sportLevel, sportTime, musicRole,
    musicGenre, eventName, eventDate, eventVenue, learnSubject, learnNativeLang,
    learnTargetLang, learnMode, learnLevel, serviceSpecialty, servicePricingModel,
    serviceWarranty, serviceCoverage
  ]);

  // Current selected option metadata
  const currentOption = getOptionById(selectedOptionId) || ALL_EXPATRIATES_OPTIONS[0];
  const currentSection = getSectionForOption(selectedOptionId) || EXPATRIATES_SECTIONS[0];

  // Helper to sync category/subcategory defaults into Step 2 state and provide a tailored title
  const syncSubcategoryDefaults = (optId: string, subcatSlug: string) => {
    // Reset cross-category variables
    setCommercialKind('');
    setPlotType('Residential Layout Plot (DTCP)');
    setHousingOfferType('For Rent');
    setServiceSpecialty('');

    if (optId === 'plots-offering') {
      if (subcatSlug === 'residential-plots') {
        setPlotType('Residential Layout Plot (DTCP)');
        setTitle('DTCP Approved Residential Layout Plot for Sale in Hosur');
      } else if (subcatSlug === 'commercial-land') {
        setPlotType('Commercial Main Road Site');
        setTitle('Commercial Main Road Land / Site for Sale in Hosur');
      } else if (subcatSlug === 'agricultural-farmland') {
        setPlotType('Agricultural Farmland');
        setTitle('Agricultural Farmland for Sale near Hosur');
      } else if (subcatSlug === 'industrial-plots') {
        setPlotType('Industrial Plot (SIPCOT)');
        setTitle('Industrial Plot in SIPCOT Zone for Sale in Hosur');
      } else {
        setTitle('Residential Layout Plot for Sale in Hosur');
      }
    } else if (optId === 'housing-offering') {
      if (subcatSlug.includes('-sale')) {
        setHousingOfferType('For Sale');
        setTitle(subcatSlug === 'apartments-sale' ? '2/3 BHK Apartment for Sale in Hosur' : 'Independent House / Villa for Sale in Hosur');
      } else if (subcatSlug.includes('rooms') || subcatSlug.includes('pg')) {
        setHousingOfferType('Bed Space / PG Room');
        setTitle(subcatSlug === 'pg-hostels' ? 'Paying Guest (PG) Accommodation in Hosur' : 'Single Room / Shared Flat for Rent in Hosur');
      } else {
        setHousingOfferType('For Rent');
        setTitle(subcatSlug === 'houses-rent' ? 'Independent House / Villa for Rent in Hosur' : '2 BHK Apartment for Rent in Hosur');
      }
    } else if (optId === 'commercial-offering') {
      if (subcatSlug === 'commercial-offices') {
        setCommercialKind('Office Space');
        setTitle('Commercial Office Space for Rent in Hosur');
      } else if (subcatSlug === 'retail-shops') {
        setCommercialKind('Retail Shop / Showroom');
        setTitle('Main Road Commercial Retail Shop for Rent in Hosur');
      } else if (subcatSlug === 'warehouses-godowns') {
        setCommercialKind('Warehouse / Godown');
        setTitle('Commercial Warehouse / Godown for Rent in Hosur');
      } else if (subcatSlug === 'industrial-sheds') {
        setCommercialKind('Industrial Shed / Factory');
        setTitle('Industrial Shed / Factory for Lease in SIPCOT Hosur');
      } else if (subcatSlug === 'coworking-desks') {
        setCommercialKind('Co-Working Desks');
        setTitle('Co-Working Office Desks for Rent in Hosur');
      } else {
        setCommercialKind('Office Space');
        setTitle('Commercial Property Space for Lease in Hosur');
      }
    } else if (optId === 'services-offering') {
      if (subcatSlug === 'home-repairs') {
        setServiceSpecialty('Electrical, Plumbing & Carpentry Repairs');
        setTitle('Professional Home Repair & Electrician Services in Hosur');
      } else if (subcatSlug === 'appliance-repair') {
        setServiceSpecialty('AC, Refrigerator & Washing Machine Service');
        setTitle('AC, Refrigerator & Washing Machine Repair in Hosur');
      } else if (subcatSlug === 'cleaning-pest') {
        setServiceSpecialty('Deep House Cleaning & Pest Control');
        setTitle('Deep Cleaning, Housekeeping & Pest Control Services in Hosur');
      } else if (subcatSlug === 'movers-packers') {
        setServiceSpecialty('Movers & Packers / Shifting Transport');
        setTitle('Movers & Packers & Shifting Transport Services in Hosur');
      } else if (subcatSlug === 'computer-tech') {
        setServiceSpecialty('Computer, Laptop & Mobile Repair');
        setTitle('Computer, Laptop & Mobile Repair Services in Hosur');
      } else if (subcatSlug === 'accounting-legal') {
        setServiceSpecialty('GST, Income Tax & Legal Registration');
        setTitle('GST, Accounting & Business Registration Services in Hosur');
      } else if (subcatSlug === 'salon-beauty') {
        setServiceSpecialty('Salon at Home & Bridal Makeup');
        setTitle('Professional Salon at Home & Bridal Makeup in Hosur');
      } else if (subcatSlug === 'events-photography') {
        setServiceSpecialty('Event Photography & Videography');
        setTitle('Event Photography & Catering Services in Hosur');
      } else if (subcatSlug === 'domestic-help') {
        setServiceSpecialty('Cook, Maid & Housekeeping Help');
        setTitle('Cook, Maid & Housekeeping Domestic Help in Hosur');
      } else if (subcatSlug === 'auto-repair') {
        setServiceSpecialty('Car Mechanic, Wash & Detailing');
        setTitle('Car Mechanic, Doorstep Wash & Detailing in Hosur');
      } else {
        setServiceSpecialty('Professional Services');
        setTitle('Trusted Professional Services in Hosur');
      }
    } else if (optId === 'job-seeking') {
      setTitle('Experienced Professional seeking Job in Hosur');
    } else if (optId === 'job-offering') {
      setTitle('Hiring: Qualified Staff / Team Member in Hosur');
    } else if (optId === 'temp-jobs-hire') {
      setTitle('Urgent: Temporary Staff / Gig Worker Needed in Hosur');
    } else if (optId === 'community-rideshare') {
      setTitle('Daily Ride Share / Carpool: Hosur to Bangalore');
    } else if (optId === 'community-pet-adoption') {
      setTitle('Healthy Loving Pet Seeking Adoption in Hosur');
    } else if (optId === 'community-lost-found') {
      setTitle('Lost & Found Notice in Hosur');
    } else if (optId === 'childcare-seeking') {
      setTitle('Experienced Babysitter & Nanny Available in Hosur');
    } else if (optId === 'childcare-hire') {
      setTitle('Seeking Trusted Babysitter & Nanny in Hosur');
    } else if (optId === 'childcare-daycare') {
      setTitle('Daycare & Playgroup Center in Hosur');
    } else if (optId === 'sell-item') {
      setTitle('');
    } else if (optId === 'buy-item') {
      setTitle('');
    }
  };

  // Helper to change option
  const handleSelectOption = (opt: ExpatriatesOption) => {
    setSelectedOptionId(opt.id);
    if (opt.hasSubcategories && opt.subcategories.length > 0) {
      setBrowsingOptionWithSubcategories(opt);
      const defaultSubcat = opt.subcategories[0].slug;
      setSelectedSubcategorySlug(defaultSubcat);
      syncSubcategoryDefaults(opt.id, defaultSubcat);
    } else {
      setBrowsingOptionWithSubcategories(null);
      setSelectedSubcategorySlug('');
      syncSubcategoryDefaults(opt.id, '');
      if (opt.pricePlaceholder && !price) {
        setPrice(opt.defaultListingType === 'free' ? '0' : '');
      }
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectSubcategory = (subcat: SubCategory) => {
    setSelectedSubcategorySlug(subcat.slug);
    setBrowsingOptionWithSubcategories(null);
    syncSubcategoryDefaults(selectedOptionId, subcat.slug);
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Multiple Images Upload handler with instant HTML5 Canvas compression
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > 10) {
      setUploadError(`You can upload up to 10 photos in total (${images.length} already added).`);
      return;
    }

    setUploadingImage(true);
    setUploadError(null);

    const uploadedUrls: string[] = [];

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        setUploadError(`"${file.name}" exceeds 10MB limit and was skipped.`);
        continue;
      }

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

        uploadedUrls.push(finalUrl);
      } catch (err: any) {
        setUploadError(err.message || 'Error processing image');
      }
    }

    if (uploadedUrls.length > 0) {
      setImages((prev) => [...prev, ...uploadedUrls]);
    }
    setUploadingImage(false);
    e.target.value = '';
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    if (reviewPhotoIndex >= images.length - 1) {
      setReviewPhotoIndex(Math.max(0, images.length - 2));
    }
  };

  const handleSetPrimaryImage = (indexToPrimary: number) => {
    setImages((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(indexToPrimary, 1);
      return [item, ...copy];
    });
    setReviewPhotoIndex(0);
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
        if (vehicleBrand) summary += `• Brand / Make: ${vehicleBrand}\n`;
        if (vehicleModel) summary += `• Model: ${vehicleModel}\n`;
        if (vehicleYear) summary += `• Year: ${vehicleYear}\n`;
        if (vehicleFuel) summary += `• Fuel Type: ${vehicleFuel}\n`;
        if (vehicleKm) summary += `• KM Driven: ${vehicleKm}\n`;
        if (vehicleOwners) summary += `• Ownership: ${vehicleOwners}\n`;
        if (vehicleTransmission) summary += `• Transmission: ${vehicleTransmission}\n`;
      } else {
        if (itemCondition) summary += `• Condition: ${itemCondition}\n`;
        if (itemWarranty) summary += `• Warranty: ${itemWarranty}\n`;
        if (itemBillBox) summary += `• Bill & Box: ${itemBillBox}\n`;
      }
    } else if (selectedOptionId === 'buy-item') {
      if (wantedCondition) summary += `• Desired Condition: ${wantedCondition}\n`;
      if (wantedUrgency) summary += `• Urgency: ${wantedUrgency}\n`;
    } else if (selectedOptionId === 'job-seeking') {
      if (jobTitle) summary += `• Desired Role: ${jobTitle}\n`;
      if (jobIndustry) summary += `• Industry: ${jobIndustry}\n`;
      if (jobExperience) summary += `• Experience: ${jobExperience}\n`;
      if (jobEducation) summary += `• Education: ${jobEducation}\n`;
      if (jobNoticePeriod) summary += `• Availability: ${jobNoticePeriod}\n`;
      if (jobSkills) summary += `• Key Skills: ${jobSkills}\n`;
      if (jobWorkMode) summary += `• Work Mode: ${jobWorkMode}\n`;
    } else if (selectedOptionId === 'job-offering') {
      if (jobTitle) summary += `• Designation: ${jobTitle}\n`;
      if (jobCompany) summary += `• Company: ${jobCompany}\n`;
      if (jobIndustry) summary += `• Industry: ${jobIndustry}\n`;
      if (jobType) summary += `• Employment Type: ${jobType}\n`;
      if (jobExperience) summary += `• Experience Required: ${jobExperience}\n`;
      if (jobEducation) summary += `• Education: ${jobEducation}\n`;
      if (jobWorkMode) summary += `• Work Location: ${jobWorkMode}\n`;
    } else if (selectedOptionId === 'temp-jobs-hire') {
      if (tempDuration) summary += `• Gig Duration: ${tempDuration}\n`;
      if (tempPayBasis) summary += `• Pay Rate: ${tempPayBasis}\n`;
      if (tempHours) summary += `• Timings: ${tempHours}\n`;
      if (tempUrgency) summary += `• Immediate Joining: ${tempUrgency}\n`;
    } else if (selectedOptionId === 'housing-offering') {
      if (housingOfferType) summary += `• Offer Type: ${housingOfferType}\n`;
      if (propertyBhk) summary += `• Configuration: ${propertyBhk}\n`;
      if (propertyArea) summary += `• Area: ${propertyArea} Sq.Ft\n`;
      if (propertyFurnishing) summary += `• Furnishing: ${propertyFurnishing}\n`;
      if (propertyFloor) summary += `• Floor: ${propertyFloor}\n`;
      if (propertyFacing) summary += `• Facing: ${propertyFacing}\n`;
      if (housingOfferType !== 'For Sale') {
        if (propertyDeposit) summary += `• Security Deposit: ₹${propertyDeposit}\n`;
        if (propertyTenantPref) summary += `• Preferred Tenants: ${propertyTenantPref}\n`;
      } else {
        if (propertyDeposit) summary += `• Possession / Age: ${propertyDeposit}\n`;
        if (propertyTenantPref) summary += `• Ownership / Title: ${propertyTenantPref}\n`;
      }
      if (propertyAvailableFrom) summary += `• Available From: ${propertyAvailableFrom}\n`;
    } else if (selectedOptionId === 'housing-exchange') {
      if (exchangeCurrentLoc) summary += `• Current Property: ${exchangeCurrentLoc}\n`;
      if (exchangeDestination) summary += `• Desired Swap Location: ${exchangeDestination}\n`;
      if (exchangeDuration) summary += `• Duration: ${exchangeDuration}\n`;
    } else if (selectedOptionId === 'housing-seeking') {
      if (propertyBhk) summary += `• Looking for: ${propertyBhk}\n`;
      if (seekPreferredAreas) summary += `• Target Areas: ${seekPreferredAreas}\n`;
      if (seekTenantType) summary += `• Tenant Profile: ${seekTenantType}\n`;
    } else if (selectedOptionId === 'commercial-offering') {
      if (commercialKind) summary += `• Commercial Type: ${commercialKind}\n`;
      if (propertyArea) summary += `• Area: ${propertyArea} Sq.Ft\n`;
      if (commercialPowerLoad) summary += `• Power Capacity: ${commercialPowerLoad}\n`;
      if (commercialParking) summary += `• Parking: ${commercialParking}\n`;
      if (commercialLoadingDock) summary += `• Loading Access: ${commercialLoadingDock}\n`;
    } else if (selectedOptionId === 'plots-offering') {
      if (plotType) summary += `• Land Type: ${plotType}\n`;
      if (plotSize) summary += `• Plot Extent / Size: ${plotSize}\n`;
      if (plotRoadWidth) summary += `• Road Width in Front: ${plotRoadWidth}\n`;
      if (plotApproval) summary += `• Approvals: ${plotApproval}\n`;
      if (plotFencing) summary += `• Boundary: ${plotFencing}\n`;
    } else if (selectedOptionId.startsWith('childcare')) {
      if (childcareRole) summary += `• Role / Facility: ${childcareRole}\n`;
      if (childcareAgeGroup) summary += `• Age Group: ${childcareAgeGroup}\n`;
      if (childcareExperience) summary += `• Experience: ${childcareExperience}\n`;
      if (childcareCert) summary += `• Verified Status: ${childcareCert}\n`;
      if (childcareTiming) summary += `• Timing: ${childcareTiming}\n`;
    } else if (selectedOptionId === 'community-lost-found') {
      if (lostFoundStatus) summary += `• Case: ${lostFoundStatus}\n`;
      if (lostFoundDate) summary += `• Date: ${lostFoundDate}\n`;
      if (lostFoundLocation) summary += `• Exact Landmark: ${lostFoundLocation}\n`;
      if (lostFoundReward) summary += `• Reward: ${lostFoundReward}\n`;
    } else if (selectedOptionId === 'community-rideshare') {
      if (rideOrigin || rideDestination) summary += `• Route: ${rideOrigin} ➔ ${rideDestination}\n`;
      if (rideSchedule) summary += `• Commute Schedule: ${rideSchedule}\n`;
      if (rideVehicle) summary += `• Vehicle: ${rideVehicle}\n`;
      if (rideSeats) summary += `• Seats: ${rideSeats}\n`;
      if (rideCostShare) summary += `• Cost Contribution: ${rideCostShare}\n`;
    } else if (selectedOptionId === 'community-pet-adoption') {
      if (petType) summary += `• Pet: ${petType}\n`;
      if (petAgeGender) summary += `• Age / Gender: ${petAgeGender}\n`;
      if (petHealth) summary += `• Health: ${petHealth}\n`;
    } else if (selectedOptionId === 'community-sports') {
      if (sportName) summary += `• Sport: ${sportName}\n`;
      if (sportLevel) summary += `• Skill Level: ${sportLevel}\n`;
      if (sportTime) summary += `• Timing: ${sportTime}\n`;
    } else if (selectedOptionId === 'community-musicians') {
      if (musicRole) summary += `• Instrument: ${musicRole}\n`;
      if (musicGenre) summary += `• Genre: ${musicGenre}\n`;
    } else if (selectedOptionId === 'community-event') {
      if (eventName) summary += `• Event: ${eventName}\n`;
      if (eventDate) summary += `• Date & Time: ${eventDate}\n`;
      if (eventVenue) summary += `• Venue: ${eventVenue}\n`;
    } else if (selectedOptionId === 'learning-exchange') {
      if (learnNativeLang) summary += `• Offering Language: ${learnNativeLang}\n`;
      if (learnTargetLang) summary += `• Target Language: ${learnTargetLang}\n`;
      if (learnMode) summary += `• Mode: ${learnMode}\n`;
    } else if (selectedOptionId.startsWith('learning')) {
      if (learnSubject) summary += `• Subject: ${learnSubject}\n`;
      if (learnMode) summary += `• Mode: ${learnMode}\n`;
      if (learnLevel) summary += `• Level: ${learnLevel}\n`;
    } else if (selectedOptionId === 'services-offering') {
      if (serviceSpecialty) summary += `• Service Scope: ${serviceSpecialty}\n`;
      if (servicePricingModel) summary += `• Pricing: ${servicePricingModel}\n`;
      if (serviceWarranty) summary += `• Warranty: ${serviceWarranty}\n`;
      if (serviceCoverage) summary += `• Areas Covered: ${serviceCoverage}\n`;
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
          if (vehicleBrand || vehicleModel) {
            setTitle(`${vehicleBrand || ''} ${vehicleModel || ''} for Sale in Hosur`.trim());
          }
        } else if (selectedOptionId === 'housing-offering') {
          if (propertyBhk) {
            setTitle(`${propertyBhk} ${housingOfferType} in ${location}`);
          }
        } else if (selectedOptionId === 'job-seeking') {
          if (jobTitle) setTitle(`${jobTitle} seeking Job in Hosur`);
        } else if (selectedOptionId === 'job-offering') {
          if (jobTitle) setTitle(`Hiring: ${jobTitle} in Hosur`);
        } else if (selectedOptionId === 'plots-offering') {
          if (plotSize || plotType) setTitle(`${plotSize ? plotSize + ' ' : ''}${plotType} in Hosur`.trim());
        } else if (selectedOptionId === 'commercial-offering') {
          if (commercialKind) setTitle(`${commercialKind} in Hosur`);
        } else if (selectedOptionId === 'services-offering') {
          if (serviceSpecialty) setTitle(`${serviceSpecialty} in Hosur`);
        }
        // NOTE: No conversational option fallback (e.g. "I am offering a plot of land. - Hosur")!
        // Leaving it empty allows the user to write their title with category-tailored placeholder guidance.
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

  // Submit Ad Entrypoint
  const handleSubmitAd = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const savedAuth = localStorage.getItem('urgenie_auth_user');
    const hasAuth = user || (savedAuth && JSON.parse(savedAuth).user);

    if (!hasAuth) {
      saveDraftToStorage(4);
      setAuthModalName(sellerName !== 'Verified User' ? sellerName : '');
      setAuthModalPhone(phone !== '9876543210' ? phone : '');
      setAuthModalTab('register');
      setShowAuthModal(true);
      return;
    }

    await executeSubmitAd();
  };

  const handleAuthModalRegister = async (e: FormEvent) => {
    e.preventDefault();
    setAuthModalError(null);

    const trimmedName = authModalName.trim();
    if (!trimmedName) {
      setAuthModalError('Please enter your full name');
      return;
    }
    const cleanModalPhone = authModalPhone.trim().replace(/\D/g, '');
    if (cleanModalPhone.length < 10) {
      setAuthModalError('Please enter a valid 10-digit mobile number');
      return;
    }
    const trimmedEmail = authModalEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setAuthModalError('Please enter a valid email address');
      return;
    }
    if (authModalPassword.length < 6) {
      setAuthModalError('Password must be at least 6 characters');
      return;
    }

    setAuthModalLoading(true);
    const { error: regError } = await signUp(trimmedEmail, authModalPassword, {
      full_name: trimmedName,
      phone: cleanModalPhone,
      city: location || 'Hosur Town, Tamil Nadu',
      role: 'user',
    });
    setAuthModalLoading(false);

    if (regError) {
      setAuthModalError(regError);
      return;
    }

    setSellerName(trimmedName);
    setPhone(cleanModalPhone);
    setShowAuthModal(false);

    // Immediately execute publishing
    await executeSubmitAd(trimmedName, cleanModalPhone);
  };

  const handleAuthModalLogin = async (e: FormEvent) => {
    e.preventDefault();
    setAuthModalError(null);

    const trimmedEmail = authModalEmail.trim().toLowerCase();
    if (!trimmedEmail) {
      setAuthModalError('Please enter your email address');
      return;
    }
    if (!authModalPassword) {
      setAuthModalError('Please enter your password');
      return;
    }

    setAuthModalLoading(true);
    const { error: loginError } = await signIn(trimmedEmail, authModalPassword);
    setAuthModalLoading(false);

    if (loginError) {
      setAuthModalError(loginError);
      return;
    }

    setShowAuthModal(false);

    // Immediately execute publishing
    await executeSubmitAd();
  };

  const executeSubmitAd = async (overrideName?: string, overridePhone?: string) => {
    setError(null);
    setSubmitting(true);

    const savedAuth = localStorage.getItem('urgenie_auth_user');
    let activeUser = user;
    let activeProfile = profile;
    if (!activeUser && savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth);
        activeUser = parsed.user || null;
        activeProfile = parsed.profile || null;
      } catch {}
    }

    const effectiveSellerName = overrideName || sellerName.trim() || activeProfile?.full_name || 'Verified User';
    const effectivePhone = overridePhone || phone.trim() || activeProfile?.phone || '9876543210';

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

    let targetUserId = activeUser?.id || 'd12fc73e-2b3c-4371-b22c-ce3181ec864a';
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
            full_name: effectiveSellerName,
            email: activeUser?.email || `${targetUserId}@urgenie.local`,
            phone: effectivePhone,
            city: location || 'Hosur Town Center, Tamil Nadu',
            role: activeProfile?.role || 'user',
          });
        }
      } catch (err) {
        targetUserId = 'd12fc73e-2b3c-4371-b22c-ce3181ec864a';
      }
    } else {
      targetUserId = 'd12fc73e-2b3c-4371-b22c-ce3181ec864a';
    }

    const resolvedCategoryId = getResolvedCategoryId(selectedOptionId, selectedSubcategorySlug);

    // Build comprehensive structured attributes object from all Step 2 specifications
    const attributesObj: Record<string, any> = {
      section: currentSection.title,
      intent: currentOption.title,
      subcategory: selectedSubcategorySlug,
    };

    if (selectedOptionId === 'sell-item') {
      if (selectedSubcategorySlug.includes('vehicles') || selectedSubcategorySlug.includes('motorcycles')) {
        attributesObj['Make / Brand'] = vehicleBrand;
        attributesObj['Model'] = vehicleModel;
        attributesObj['Year'] = vehicleYear;
        attributesObj['Fuel Type'] = vehicleFuel;
        attributesObj['KM Driven'] = vehicleKm;
        attributesObj['Ownership'] = vehicleOwners;
        attributesObj['Transmission'] = vehicleTransmission;
      } else {
        attributesObj['Condition'] = itemCondition;
        attributesObj['Warranty'] = itemWarranty;
        attributesObj['Bill & Box'] = itemBillBox;
      }
    } else if (selectedOptionId === 'buy-item') {
      attributesObj['Desired Condition'] = wantedCondition;
      attributesObj['Urgency'] = wantedUrgency;
    } else if (selectedOptionId === 'job-seeking') {
      attributesObj['Desired Role'] = jobTitle || 'Professional';
      attributesObj['Industry'] = jobIndustry;
      attributesObj['Experience'] = jobExperience;
      attributesObj['Education'] = jobEducation;
      attributesObj['Notice Period'] = jobNoticePeriod;
      attributesObj['Key Skills'] = jobSkills;
      attributesObj['Work Mode'] = jobWorkMode;
    } else if (selectedOptionId === 'job-offering') {
      attributesObj['Designation'] = jobTitle;
      attributesObj['Company'] = jobCompany;
      attributesObj['Industry'] = jobIndustry;
      attributesObj['Employment Type'] = jobType;
      attributesObj['Experience Required'] = jobExperience;
      attributesObj['Education'] = jobEducation;
      attributesObj['Work Location'] = jobWorkMode;
    } else if (selectedOptionId === 'temp-jobs-hire') {
      attributesObj['Gig Duration'] = tempDuration;
      attributesObj['Pay Rate'] = tempPayBasis;
      attributesObj['Timings'] = tempHours;
      attributesObj['Immediate Joining'] = tempUrgency;
    } else if (selectedOptionId === 'housing-offering') {
      attributesObj['Offer Type'] = housingOfferType;
      attributesObj['Configuration'] = propertyBhk;
      attributesObj['Built-up Area'] = propertyArea ? `${propertyArea} Sq.Ft` : '';
      attributesObj['Furnishing'] = propertyFurnishing;
      attributesObj['Floor'] = propertyFloor;
      attributesObj['Facing'] = propertyFacing;
      attributesObj['Security Deposit'] = propertyDeposit ? `₹${propertyDeposit}` : '';
      attributesObj['Preferred Tenants'] = propertyTenantPref;
      attributesObj['Available From'] = propertyAvailableFrom;
    } else if (selectedOptionId === 'housing-exchange') {
      attributesObj['Current Property'] = exchangeCurrentLoc;
      attributesObj['Desired Swap Location'] = exchangeDestination;
      attributesObj['Duration'] = exchangeDuration;
    } else if (selectedOptionId === 'housing-seeking') {
      attributesObj['Looking for'] = propertyBhk;
      attributesObj['Target Areas'] = seekPreferredAreas;
      attributesObj['Tenant Profile'] = seekTenantType;
    } else if (selectedOptionId === 'commercial-offering') {
      attributesObj['Commercial Type'] = commercialKind;
      attributesObj['Area'] = propertyArea ? `${propertyArea} Sq.Ft` : '';
      attributesObj['Power Capacity'] = commercialPowerLoad;
      attributesObj['Parking'] = commercialParking;
      attributesObj['Loading Access'] = commercialLoadingDock;
    } else if (selectedOptionId === 'plots-offering') {
      attributesObj['Land Type'] = plotType;
      attributesObj['Plot Extent'] = plotSize;
      attributesObj['Road Width'] = plotRoadWidth;
      attributesObj['Approvals'] = plotApproval;
      attributesObj['Boundary Fencing'] = plotFencing;
    } else if (selectedOptionId.startsWith('childcare')) {
      attributesObj['Role / Facility'] = childcareRole;
      attributesObj['Age Group'] = childcareAgeGroup;
      attributesObj['Experience'] = childcareExperience;
      attributesObj['Verification'] = childcareCert;
      attributesObj['Timing'] = childcareTiming;
    } else if (selectedOptionId === 'community-lost-found') {
      attributesObj['Case Status'] = lostFoundStatus;
      attributesObj['Date'] = lostFoundDate;
      attributesObj['Landmark'] = lostFoundLocation;
      attributesObj['Reward'] = lostFoundReward;
    } else if (selectedOptionId === 'community-rideshare') {
      attributesObj['Route'] = `${rideOrigin} ➔ ${rideDestination}`;
      attributesObj['Commute Schedule'] = rideSchedule;
      attributesObj['Vehicle'] = rideVehicle;
      attributesObj['Available Seats'] = rideSeats;
      attributesObj['Cost Contribution'] = rideCostShare;
    } else if (selectedOptionId === 'community-pet-adoption') {
      attributesObj['Pet'] = petType;
      attributesObj['Age & Gender'] = petAgeGender;
      attributesObj['Health & Vaccination'] = petHealth;
    } else if (selectedOptionId === 'community-sports') {
      attributesObj['Sport'] = sportName;
      attributesObj['Skill Level'] = sportLevel;
      attributesObj['Timing'] = sportTime;
    } else if (selectedOptionId === 'community-musicians') {
      attributesObj['Instrument / Role'] = musicRole;
      attributesObj['Genre'] = musicGenre;
    } else if (selectedOptionId === 'community-event') {
      attributesObj['Event'] = eventName;
      attributesObj['Date & Time'] = eventDate;
      attributesObj['Venue'] = eventVenue;
    } else if (selectedOptionId === 'learning-exchange') {
      attributesObj['Offering Language'] = learnNativeLang;
      attributesObj['Target Language'] = learnTargetLang;
      attributesObj['Mode'] = learnMode;
    } else if (selectedOptionId.startsWith('learning')) {
      attributesObj['Subject'] = learnSubject;
      attributesObj['Mode'] = learnMode;
      attributesObj['Level'] = learnLevel;
    } else if (selectedOptionId === 'services-offering') {
      attributesObj['Service Scope'] = serviceSpecialty;
      attributesObj['Pricing Model'] = servicePricingModel;
      attributesObj['Warranty'] = serviceWarranty;
      attributesObj['Areas Covered'] = serviceCoverage;
    }

    const adPayload = {
      user_id: targetUserId,
      category_id: resolvedCategoryId,
      category: resolvedCategoryId,
      subcategory_id: selectedSubcategorySlug || null,
      subcategory: selectedSubcategorySlug || '',
      listing_type: currentOption.defaultListingType,
      title: title.trim(),
      slug: `${generatedSlug}-${Date.now().toString().slice(-4)}`,
      description: fullDescription,
      price: numPrice,
      price_text: formattedPriceText,
      is_negotiable: isNegotiable,
      condition: isPhysicalGoodOption(selectedOptionId) ? condition : null,
      location_name: location,
      location_text: location,
      contact_name: effectiveSellerName,
      contact_phone: effectivePhone,
      allow_whatsapp: allowWhatsapp,
      images: images.length > 0 ? images : [getDefaultImageForCategory(currentSection.id, selectedOptionId, selectedSubcategorySlug)],
      status: 'active',
      views_count: 0,
      is_featured: false,
      attributes: attributesObj,
      // Top-level indexed fields strictly scoped to relevant category!
      brand: (resolvedCategoryId === 'vehicles') && vehicleBrand ? vehicleBrand : null,
      model: (resolvedCategoryId === 'vehicles') && vehicleModel ? vehicleModel : null,
      year: (resolvedCategoryId === 'vehicles') && vehicleYear ? parseInt(vehicleYear) || null : null,
      fuel_type: (resolvedCategoryId === 'vehicles') && vehicleFuel ? vehicleFuel : null,
      km_driven: (resolvedCategoryId === 'vehicles') && vehicleKm ? parseInt(vehicleKm.replace(/\D/g, '')) || null : null,
      transmission: (resolvedCategoryId === 'vehicles') && vehicleTransmission ? vehicleTransmission : null,
      owners_count: (resolvedCategoryId === 'vehicles') && vehicleOwners ? vehicleOwners : null,
      bhk: (resolvedCategoryId === 'property' || resolvedCategoryId === 'commercial') && propertyBhk ? propertyBhk : null,
      area_sqft: (resolvedCategoryId === 'property' || resolvedCategoryId === 'commercial') && propertyArea ? parseInt(propertyArea.replace(/\D/g, '')) || null : null,
      furnishing: (resolvedCategoryId === 'property' || resolvedCategoryId === 'commercial') && propertyFurnishing ? propertyFurnishing : null,
      deposit_amount: (resolvedCategoryId === 'property' || resolvedCategoryId === 'commercial') && propertyDeposit ? parseFloat(propertyDeposit.replace(/[^\d.]/g, '')) || null : null,
      job_type: (resolvedCategoryId === 'jobs') && jobType ? jobType : null,
    };

    let insertedId = adPayload.slug;

    // Directly save to central Supabase database so all devices and website can see it
    try {
      const { data: dbData, error: dbErr } = await (supabase.from('ads') as any)
        .insert([adPayload])
        .select('id, slug')
        .maybeSingle();

      if (!dbErr && dbData) {
        insertedId = dbData.slug || dbData.id || insertedId;
        console.log('Ad successfully saved to central Supabase DB:', insertedId);
      } else if (dbErr) {
        console.warn('Full Supabase insert issue, attempting fallback with standard columns:', dbErr);
        // Fallback with strictly standard columns in case custom columns don't exist in Supabase
        const standardPayload = {
          user_id: targetUserId,
          category_id: resolvedCategoryId,
          subcategory_id: selectedSubcategorySlug || null,
          listing_type: currentOption.defaultListingType,
          title: title.trim(),
          slug: adPayload.slug,
          description: fullDescription,
          price: numPrice,
          price_text: formattedPriceText,
          is_negotiable: isNegotiable,
          condition: isPhysicalGoodOption(selectedOptionId) ? condition : null,
          location_name: location,
          location_text: location,
          contact_name: adPayload.contact_name,
          contact_phone: adPayload.contact_phone,
          allow_whatsapp: allowWhatsapp,
          images: adPayload.images,
          status: 'active',
          views_count: 0,
          is_featured: false,
          attributes: attributesObj,
        };

        const { data: retryData, error: retryErr } = await (supabase.from('ads') as any)
          .insert([standardPayload])
          .select('id, slug')
          .maybeSingle();

        if (!retryErr && retryData) {
          insertedId = retryData.slug || retryData.id || insertedId;
          console.log('Ad saved via standard payload to central Supabase DB:', insertedId);
        } else {
          console.error('Remote Supabase insert could not complete:', retryErr || dbErr);
        }
      }
    } catch (netErr) {
      console.warn('Network / Supabase communication warning:', netErr);
    }

    const localId = insertedId || `ad-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const publishedAd = {
      id: localId,
      ...adPayload,
      user_id: targetUserId,
      created_at: new Date().toISOString(),
      category: resolvedCategoryId,
      subcategory: selectedSubcategorySlug,
      attributes: attributesObj,
    };
    const finalId = publishedAd.slug || publishedAd.id;

    // Cache locally as well
    try {
      const stored = JSON.parse(localStorage.getItem('urgenie_local_ads') || '[]');
      const filtered = stored.filter((a: any) => a.id !== publishedAd.id && a.slug !== publishedAd.slug && !String(a.id).startsWith('seed-'));
      localStorage.setItem('urgenie_local_ads', JSON.stringify([publishedAd, ...filtered]));
    } catch (storageErr) {
      console.warn('LocalStorage save warning:', storageErr);
    }

    // Clean up draft from localStorage since ad has now been published!
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {}
    setRestoredFromDraft(false);

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

        {/* Draft Restored Banner */}
        {restoredFromDraft && step < 5 && (
          <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-emerald-950 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold">
                  {user ? `Welcome back, ${profile?.full_name || 'Seller'}! Your ad draft has been restored.` : 'Your recent advertisement details and photos are restored.'}
                </p>
                <p className="text-[11px] text-emerald-700">
                  All your specifications and {images.length} photos are preserved. You can continue editing or publish directly.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 underline px-2 py-1 self-end sm:self-center cursor-pointer"
            >
              Discard Draft & Start Fresh
            </button>
          </div>
        )}

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

          {/* Subcategory Floating Modal (appears right in the center of user's current viewport) */}
          {browsingOptionWithSubcategories && (
            <div 
              className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
              onClick={() => setBrowsingOptionWithSubcategories(null)}
            >
              <div 
                className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/80 via-white to-blue-50/30">
                  <div className="flex items-center gap-3">
                    <span className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-sm flex-shrink-0">
                      <browsingOptionWithSubcategories.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                        Select a Subcategory
                      </h3>
                      <p className="text-xs text-blue-700 font-semibold mt-0.5 line-clamp-1">
                        {browsingOptionWithSubcategories.title}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBrowsingOptionWithSubcategories(null)}
                    className="p-2 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer shadow-xs"
                    title="Close subcategories"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Subcategory Options List */}
                <div className="p-4 sm:p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {browsingOptionWithSubcategories.subcategories.map((subcat) => (
                    <button
                      key={subcat.id}
                      type="button"
                      onClick={() => handleSelectSubcategory(subcat)}
                      className="p-3.5 rounded-2xl border border-slate-200/90 bg-white hover:border-blue-500 hover:bg-blue-50/70 hover:shadow-xs transition-all text-left flex items-center justify-between group cursor-pointer"
                    >
                      <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700 leading-snug">
                        {subcat.name}
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-transform flex-shrink-0 ml-2" />
                    </button>
                  ))}
                </div>

                {/* Footer hint */}
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Click any subcategory to proceed to tailored details</span>
                  <button
                    type="button"
                    onClick={() => setBrowsingOptionWithSubcategories(null)}
                    className="font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
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
                  {housingOfferType !== 'For Sale' ? (
                    <>
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
                          placeholder="e.g. Families Only, Vegetarians, Any" 
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Possession / Status</label>
                        <input 
                          type="text" 
                          value={propertyDeposit} 
                          onChange={(e) => setPropertyDeposit(e.target.value)} 
                          className="input-field py-2 text-xs" 
                          placeholder="e.g. Ready to Move, 1-3 Years Old" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Ownership / Approvals</label>
                        <input 
                          type="text" 
                          value={propertyTenantPref} 
                          onChange={(e) => setPropertyTenantPref(e.target.value)} 
                          className="input-field py-2 text-xs" 
                          placeholder="e.g. Freehold, Clear Title, DTCP/HNTDA" 
                        />
                      </div>
                    </>
                  )}
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
                placeholder={getTitlePlaceholder(selectedOptionId, selectedSubcategorySlug)}
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
                {currentOption.defaultListingType !== 'free' && (
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
                )}
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

            {/* Item General Condition - ONLY for physical items / merchandise */}
            {isPhysicalGoodOption(selectedOptionId) && (
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
            )}

            {/* Multiple Photos & Canvas Compression Uploader */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Listing Photos <span className="text-slate-400 font-normal">({images.length}/10 photos)</span>
                </label>
                {images.length > 0 && (
                  <span className="text-[11px] text-blue-600 font-medium">First photo will be the main cover</span>
                )}
              </div>

              <div className="space-y-3">
                {/* Uploaded Photos Grid */}
                {images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {images.map((imgUrl, idx) => (
                      <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-100 group shadow-xs">
                        <img src={imgUrl} alt={`Uploaded ${idx + 1}`} className="w-full h-full object-cover" />
                        
                        {/* Primary / Cover Badge */}
                        {idx === 0 ? (
                          <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                            Cover
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(idx)}
                            className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/60 hover:bg-blue-600 text-white text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Set Cover
                          </button>
                        )}

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                          title="Remove photo"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Dropzone / Upload button */}
                {images.length < 10 && (
                  <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-5 bg-slate-50/70 hover:bg-blue-50/30 transition-all flex flex-col items-center justify-center cursor-pointer text-center group">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                    {uploadingImage ? (
                      <div className="flex items-center gap-2 text-xs font-bold text-blue-600 py-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Compressing & uploading photos...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 py-1">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Upload className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-black text-slate-800">
                          {images.length === 0 ? 'Click or Tap to Upload Photos (Select Multiple)' : 'Add More Photos'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Supports multiple JPG, PNG, WEBP. Max 10MB per image.
                        </span>
                      </div>
                    )}
                  </label>
                )}

                {uploadError && <p className="text-xs text-rose-600 font-semibold">{uploadError}</p>}
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
                placeholder={getDescriptionPlaceholder(selectedOptionId)}
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
              <img 
                src={images[reviewPhotoIndex] || images[0] || getDefaultImageForCategory(currentSection.id, selectedOptionId, selectedSubcategorySlug)} 
                alt={title} 
                className="w-full h-full object-cover" 
              />
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${currentSection.badgeBg}`}>
                  {currentSection.title}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-black/70 text-white backdrop-blur-md">
                  {currentOption.badge}
                </span>
              </div>
              {images.length > 1 && (
                <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                  <Camera className="h-3.5 w-3.5" />
                  <span>{reviewPhotoIndex + 1} / {images.length} Photos</span>
                </div>
              )}
              <div className="absolute bottom-3 right-3 bg-blue-600 text-white font-black text-base px-3 py-1.5 rounded-xl shadow-lg">
                {currentOption.defaultListingType === 'free' ? 'Free' : `₹${Number(price || 0).toLocaleString()}`}
              </div>
            </div>

            {/* Thumbnail Selector Strip for Multiple Photos */}
            {images.length > 1 && (
              <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2 overflow-x-auto">
                {images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setReviewPhotoIndex(idx)}
                    className={`relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
                      reviewPhotoIndex === idx ? 'border-blue-600 ring-2 ring-blue-500/30 scale-105' : 'border-slate-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute bottom-0 inset-x-0 bg-blue-600/90 text-[8px] font-bold text-white text-center py-0.5">
                        Cover
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

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

          {/* Guest User Posting Notice */}
          {!user && (
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-950">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-600 font-bold">
                  <AlertCircle className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold">You are posting as a guest</p>
                  <p className="text-[11px] text-amber-700">
                    Clicking "Publish Advertisement Now" will prompt you to register or sign in. All your ad details and {images.length} photos are preserved!
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-stretch sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    saveDraftToStorage(4);
                    setAuthModalName(sellerName !== 'Verified User' ? sellerName : '');
                    setAuthModalPhone(phone !== '9876543210' ? phone : '');
                    setAuthModalTab('register');
                    setShowAuthModal(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs cursor-pointer flex-1 sm:flex-initial"
                >
                  Register
                </button>
                <button
                  type="button"
                  onClick={() => {
                    saveDraftToStorage(4);
                    setAuthModalTab('login');
                    setShowAuthModal(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-white border border-amber-300 hover:bg-amber-50 text-amber-800 text-xs font-bold cursor-pointer flex-1 sm:flex-initial"
                >
                  Sign In
                </button>
              </div>
            </div>
          )}

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
                setImages([]);
                setReviewPhotoIndex(0);
                setCreatedAdId(null); 
              }} 
              className="btn btn-outline px-6 py-2.5 font-bold text-xs"
            >
              Post Another Ad
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* AUTH MODAL FOR GUEST POSTING (ZERO LAG REGISTRATION & SIGN IN) */}
      {/* ============================================================== */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 relative overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Top gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-4">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                <Sparkles className="h-4 w-4" />
                <span>Almost Done!</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {authModalTab === 'register' ? 'Register to Publish Ad' : 'Sign In to Publish Ad'}
              </h3>
              <p className="text-slate-500 text-xs mt-1">
                {authModalTab === 'register'
                  ? 'Enter your name, mobile, and password. Once registered, your ad will publish immediately with all details intact!'
                  : 'Sign in to link this advertisement to your account.'}
              </p>
            </div>

            {/* Preserved details indicator */}
            <div className="mb-4 p-2.5 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-2 text-blue-900 text-[11px] font-medium">
              <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <span>Your ad specifications, description, and {images.length} photos are preserved and ready.</span>
            </div>

            {/* Tab Switcher */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl mb-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => { setAuthModalTab('register'); setAuthModalError(null); }}
                className={`py-2 rounded-lg transition-all cursor-pointer ${authModalTab === 'register' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Register (New User)
              </button>
              <button
                type="button"
                onClick={() => { setAuthModalTab('login'); setAuthModalError(null); }}
                className={`py-2 rounded-lg transition-all cursor-pointer ${authModalTab === 'login' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Sign In (Existing)
              </button>
            </div>

            {authModalError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-xs font-medium">
                <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-500" />
                <span>{authModalError}</span>
              </div>
            )}

            {authModalTab === 'register' ? (
              <form onSubmit={handleAuthModalRegister} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Your Full Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={authModalName}
                      onChange={(e) => setAuthModalName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="input-field pl-9 pr-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Mobile Number (10 digits) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={authModalPhone}
                      onChange={(e) => setAuthModalPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="input-field pl-9 pr-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      required
                      value={authModalEmail}
                      onChange={(e) => setAuthModalEmail(e.target.value)}
                      placeholder="e.g. ramesh@example.com"
                      className="input-field pl-9 pr-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Password (min 6 chars) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type={showModalPassword ? 'text' : 'password'}
                      required
                      value={authModalPassword}
                      onChange={(e) => setAuthModalPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-field pl-9 pr-9 py-2 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowModalPassword(!showModalPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showModalPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authModalLoading}
                  className="btn btn-primary w-full py-2.5 text-xs font-bold shadow-md mt-2 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {authModalLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Creating Account & Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Register & Publish Advertisement</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleAuthModalLogin} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      required
                      value={authModalEmail}
                      onChange={(e) => setAuthModalEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="input-field pl-9 pr-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type={showModalPassword ? 'text' : 'password'}
                      required
                      value={authModalPassword}
                      onChange={(e) => setAuthModalPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-field pl-9 pr-9 py-2 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowModalPassword(!showModalPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showModalPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authModalLoading}
                  className="btn btn-primary w-full py-2.5 text-xs font-bold shadow-md mt-2 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {authModalLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Signing In & Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Sign In & Publish Advertisement</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Links to dedicated pages if preferred */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <Link
                to="/register?redirect=/post-ad"
                onClick={() => saveDraftToStorage(4)}
                className="text-blue-600 hover:underline font-semibold"
              >
                Open Full Register Page →
              </Link>
              <Link
                to="/login?redirect=/post-ad"
                onClick={() => saveDraftToStorage(4)}
                className="text-slate-500 hover:underline font-semibold"
              >
                Open Full Sign In Page →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
