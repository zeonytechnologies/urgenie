import { 
  Car, 
  Building2, 
  Smartphone, 
  Tv, 
  Briefcase, 
  Store, 
  Wrench, 
  ShoppingBag, 
  Sofa, 
  Factory, 
  Users,
  Clock,
  MapPin,
  Baby,
  GraduationCap,
  Palette,
  Music,
  Dog,
  Newspaper,
  Calendar,
  Languages,
  Repeat,
  Layers,
  HelpCircle,
  Tag
} from 'lucide-react';

export type ListingTypeCode = 'N' | 'P' | 'R' | 'J' | 'S' | 'Free';

export interface ListingTypeInfo {
  code: ListingTypeCode;
  id: 'new' | 'preowned' | 'rent' | 'job' | 'service' | 'free';
  label: string;
  badge: string;
  color: string;
  bgLight: string;
}

export const LISTING_TYPES: Record<string, ListingTypeInfo> = {
  new: {
    code: 'N',
    id: 'new',
    label: 'Sell New',
    badge: 'Brand New',
    color: 'text-emerald-700 border-emerald-300',
    bgLight: 'bg-emerald-50 text-emerald-700',
  },
  preowned: {
    code: 'P',
    id: 'preowned',
    label: 'Sell Pre-owned',
    badge: 'Pre-owned',
    color: 'text-blue-700 border-blue-300',
    bgLight: 'bg-blue-50 text-blue-700',
  },
  rent: {
    code: 'R',
    id: 'rent',
    label: 'Rent / Lease',
    badge: 'For Rent',
    color: 'text-amber-700 border-amber-300',
    bgLight: 'bg-amber-50 text-amber-700',
  },
  job: {
    code: 'J',
    id: 'job',
    label: 'Job Post',
    badge: 'Job',
    color: 'text-purple-700 border-purple-300',
    bgLight: 'bg-purple-50 text-purple-700',
  },
  service: {
    code: 'S',
    id: 'service',
    label: 'Service',
    badge: 'Service',
    color: 'text-cyan-700 border-cyan-300',
    bgLight: 'bg-cyan-50 text-cyan-700',
  },
  free: {
    code: 'Free',
    id: 'free',
    label: 'Free / Info',
    badge: 'Community Free',
    color: 'text-rose-700 border-rose-300',
    bgLight: 'bg-rose-50 text-rose-700',
  },
};

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface CategoryDefinition {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  icon: any;
  iconName: string;
  description: string;
  listingTypes: ('new' | 'preowned' | 'rent' | 'job' | 'service' | 'free')[];
  subcategories: SubCategory[];
  count?: number;
}

// =====================================================================
// EXPATRIATES.COM HIERARCHICAL POSTING SECTIONS & OPTIONS
// =====================================================================

export interface ExpatriatesOption {
  id: string;
  title: string;
  subtitle?: string;
  sectionId: string;
  mappedCategoryId: string;
  defaultListingType: 'new' | 'preowned' | 'rent' | 'job' | 'service' | 'free';
  hasSubcategories: boolean;
  subcategories: SubCategory[];
  priceLabel: string;
  pricePlaceholder: string;
  icon: any;
  badge: string;
}

export interface ExpatriatesSection {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  badgeBg: string;
  options: ExpatriatesOption[];
}

export const EXPATRIATES_SECTIONS: ExpatriatesSection[] = [
  // 1. Buy/Sell
  {
    id: 'buy-sell',
    title: 'Buy / Sell',
    description: 'Sell personal or commercial items, or post a request for items you wish to purchase.',
    icon: ShoppingBag,
    color: 'text-blue-600',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    options: [
      {
        id: 'sell-item',
        title: 'I would like to sell something.',
        subtitle: 'Vehicles, phones, computers, appliances, furniture, clothes and general merchandise',
        sectionId: 'buy-sell',
        mappedCategoryId: 'buy-sell',
        defaultListingType: 'preowned',
        hasSubcategories: true,
        priceLabel: 'Selling Price (₹)',
        pricePlaceholder: 'e.g. 15000',
        icon: Tag,
        badge: 'For Sale',
        subcategories: [
          { id: 'bs-cars-vehicles', name: 'Cars & Motor Vehicles', slug: 'cars-vehicles' },
          { id: 'bs-bikes-scooters', name: 'Motorcycles, Scooters & Bicycles', slug: 'motorcycles-scooters' },
          { id: 'bs-mobile-phones', name: 'Mobile Phones, Tablets & Accessories', slug: 'mobile-phones-tablets' },
          { id: 'bs-computers-laptops', name: 'Computers, Laptops & Peripherals', slug: 'computers-laptops' },
          { id: 'bs-tv-audio', name: 'TV, Video, Audio & Cameras', slug: 'tv-audio-video' },
          { id: 'bs-home-appliances', name: 'Electronics & Home Appliances (AC, Fridge, Washing)', slug: 'home-appliances' },
          { id: 'bs-furniture-decor', name: 'Furniture, Living & Home Decor', slug: 'furniture-decor' },
          { id: 'bs-clothing-fashion', name: 'Clothing, Shoes & Fashion Accessories', slug: 'clothing-fashion' },
          { id: 'bs-baby-kids', name: 'Baby Items, Strollers & Kids Toys', slug: 'baby-kids' },
          { id: 'bs-books-media', name: 'Books, Textbooks, Music & Media', slug: 'books-media' },
          { id: 'bs-sports-fitness', name: 'Sports, Fitness & Gym Equipment', slug: 'sports-fitness' },
          { id: 'bs-kitchenware', name: 'Household & Kitchenware', slug: 'household-kitchenware' },
          { id: 'bs-jewelry-watches', name: 'Jewelry, Watches & Luxury Items', slug: 'jewelry-watches' },
          { id: 'bs-heavy-machinery', name: 'Industrial Machinery & Heavy Equipment', slug: 'machinery-equipment' },
          { id: 'bs-tools-hardware', name: 'Tools, Spare Parts & DIY Hardware', slug: 'tools-hardware' },
          { id: 'bs-other-items', name: 'Other Miscellaneous Items for Sale', slug: 'other-items' },
        ],
      },
      {
        id: 'buy-item',
        title: 'I would like to buy something.',
        subtitle: 'Post a wanted advertisement for items, products or equipment you are looking to purchase',
        sectionId: 'buy-sell',
        mappedCategoryId: 'buy-sell',
        defaultListingType: 'preowned',
        hasSubcategories: false,
        priceLabel: 'Target Budget (₹)',
        pricePlaceholder: 'e.g. 20000 (or leave 0 for negotiable)',
        icon: ShoppingBag,
        badge: 'Wanted to Buy',
        subcategories: [],
      },
    ],
  },

  // 2. Jobs
  {
    id: 'jobs',
    title: 'Jobs',
    description: 'Post your CV/Resume to find a job, or publish openings to hire talent in Hosur & beyond.',
    icon: Briefcase,
    color: 'text-indigo-600',
    badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    options: [
      {
        id: 'job-seeking',
        title: 'I am looking for a job.',
        subtitle: 'Post your CV, skillset and desired position to connect with hiring managers and HRs',
        sectionId: 'jobs',
        mappedCategoryId: 'jobs',
        defaultListingType: 'job',
        hasSubcategories: false,
        priceLabel: 'Expected Salary / CTC (₹ / Month)',
        pricePlaceholder: 'e.g. 35000',
        icon: Users,
        badge: 'Job Seeker',
        subcategories: [],
      },
      {
        id: 'job-offering',
        title: 'I am offering a job.',
        subtitle: 'Publish job vacancies, requirement specifications and salary packages to hire qualified candidates',
        sectionId: 'jobs',
        mappedCategoryId: 'jobs',
        defaultListingType: 'job',
        hasSubcategories: false,
        priceLabel: 'Offered Salary / Compensation (₹ / Month)',
        pricePlaceholder: 'e.g. 40000',
        icon: Briefcase,
        badge: 'Hiring / Employer',
        subcategories: [],
      },
    ],
  },

  // 3. Temp Jobs
  {
    id: 'temp-jobs',
    title: 'Temp Jobs',
    description: 'Hire short-term workers, freelancers, event staffing, or temporary shift support.',
    icon: Clock,
    color: 'text-amber-600',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    options: [
      {
        id: 'temp-jobs-hire',
        title: 'I am looking to hire someone for a temporary job.',
        subtitle: 'Short gigs, event support, freelance projects, seasonal helpers or urgent shifts',
        sectionId: 'temp-jobs',
        mappedCategoryId: 'jobs',
        defaultListingType: 'job',
        hasSubcategories: false,
        priceLabel: 'Daily / Hourly Pay (₹)',
        pricePlaceholder: 'e.g. 1200 / Day',
        icon: Clock,
        badge: 'Temporary Gig',
        subcategories: [],
      },
    ],
  },

  // 4. Housing
  {
    id: 'housing',
    title: 'Housing',
    description: 'Apartments, villas, shared rooms, real estate sales, and home exchange options.',
    icon: Building2,
    color: 'text-emerald-600',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    options: [
      {
        id: 'housing-offering',
        title: 'I am offering housing (or selling real estate) ...',
        subtitle: 'Apartments, houses, villas, PG rooms for rent or properties for outright sale',
        sectionId: 'housing',
        mappedCategoryId: 'property',
        defaultListingType: 'rent',
        hasSubcategories: true,
        priceLabel: 'Rent / Sale Price (₹)',
        pricePlaceholder: 'e.g. 15000 (Rent/Month) or 6500000 (Sale)',
        icon: Building2,
        badge: 'Housing Offer',
        subcategories: [
          { id: 'h-apt-rent', name: 'Apartments & Flats for Rent', slug: 'apartments-rent' },
          { id: 'h-house-rent', name: 'Independent Houses & Villas for Rent', slug: 'houses-rent' },
          { id: 'h-rooms-rent', name: 'Rooms & Bed Space / Shared Flat for Rent', slug: 'rooms-shared-rent' },
          { id: 'h-pg-hostels', name: 'Paying Guest (PG) & Hostels', slug: 'pg-hostels' },
          { id: 'h-apt-sale', name: 'Apartments & Flats for Sale', slug: 'apartments-sale' },
          { id: 'h-house-sale', name: 'Houses & Villas for Sale', slug: 'houses-sale' },
          { id: 'h-short-term', name: 'Vacation & Short-Term Furnished Rentals', slug: 'short-term-rentals' },
        ],
      },
      {
        id: 'housing-exchange',
        title: 'I would like to exchange my house or apartment/flat.',
        subtitle: 'Post for mutual apartment or house swapping with other expatriates or relocators',
        sectionId: 'housing',
        mappedCategoryId: 'property',
        defaultListingType: 'free',
        hasSubcategories: false,
        priceLabel: 'Estimated Value / Rent Differential (₹)',
        pricePlaceholder: 'e.g. Mutual swap (0)',
        icon: Repeat,
        badge: 'Home Exchange',
        subcategories: [],
      },
      {
        id: 'housing-seeking',
        title: 'I am looking for housing ...',
        subtitle: 'Post your requirements for rent, PG, room sharing or home purchase in Hosur',
        sectionId: 'housing',
        mappedCategoryId: 'property',
        defaultListingType: 'rent',
        hasSubcategories: true,
        priceLabel: 'Maximum Budget (₹ / Month)',
        pricePlaceholder: 'e.g. 18000',
        icon: Building2,
        badge: 'Looking for Housing',
        subcategories: [
          { id: 'hs-apt-rent', name: 'Looking for Apartment / Flat to Rent', slug: 'seek-apartment-rent' },
          { id: 'hs-house-rent', name: 'Looking for Independent House to Rent', slug: 'seek-house-rent' },
          { id: 'hs-room-shared', name: 'Looking for Roommate / Shared Bed Space', slug: 'seek-roommate-shared' },
          { id: 'hs-pg', name: 'Looking for Paying Guest (PG) Accommodations', slug: 'seek-pg' },
          { id: 'hs-buy', name: 'Looking to Buy House or Apartment', slug: 'seek-buy-home' },
        ],
      },
    ],
  },

  // 5. Commercial Property
  {
    id: 'commercial-property',
    title: 'Commercial Property',
    description: 'Offices, shops, showrooms, warehouses, and industrial sheds for rent or sale.',
    icon: Store,
    color: 'text-violet-600',
    badgeBg: 'bg-violet-50 text-violet-700 border-violet-200',
    options: [
      {
        id: 'commercial-offering',
        title: 'I am offering commercial property.',
        subtitle: 'Commercial offices, retail shops, godowns, industrial factories and co-working spaces',
        sectionId: 'commercial-property',
        mappedCategoryId: 'commercial',
        defaultListingType: 'rent',
        hasSubcategories: true,
        priceLabel: 'Rent / Sale Value (₹)',
        pricePlaceholder: 'e.g. 35000 / Month',
        icon: Store,
        badge: 'Commercial Space',
        subcategories: [
          { id: 'cp-offices', name: 'Offices & Commercial Suites (Rent / Sale)', slug: 'commercial-offices' },
          { id: 'cp-shops', name: 'Retail Shops & Showrooms', slug: 'retail-shops' },
          { id: 'cp-warehouses', name: 'Warehouses, Godowns & Logistics Hubs', slug: 'warehouses-godowns' },
          { id: 'cp-industrial-sheds', name: 'Industrial Sheds & Factory Buildings', slug: 'industrial-sheds' },
          { id: 'cp-coworking', name: 'Co-Working Desks & Shared Workspaces', slug: 'coworking-desks' },
        ],
      },
    ],
  },

  // 6. Plots
  {
    id: 'plots',
    title: 'Plots',
    description: 'Residential layouts, commercial land, agricultural farmland, and industrial plots.',
    icon: MapPin,
    color: 'text-emerald-700',
    badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    options: [
      {
        id: 'plots-offering',
        title: 'I am offering a plot of land.',
        subtitle: 'DTCP approved residential plots, industrial plots, highway frontage or farmland',
        sectionId: 'plots',
        mappedCategoryId: 'property',
        defaultListingType: 'preowned',
        hasSubcategories: true,
        priceLabel: 'Plot Price / Rate (₹)',
        pricePlaceholder: 'e.g. 2500000 or ₹2200 / Sq.Ft',
        icon: MapPin,
        badge: 'Plot / Land',
        subcategories: [
          { id: 'pl-residential', name: 'Residential Layout Plots (Gated / DTCP / HNTDA)', slug: 'residential-plots' },
          { id: 'pl-commercial', name: 'Commercial Land & Main Road Sites', slug: 'commercial-land' },
          { id: 'pl-farmland', name: 'Agricultural Land, Farm Land & Estates', slug: 'agricultural-farmland' },
          { id: 'pl-industrial', name: 'Industrial Land & Plots (SIPCOT Zones)', slug: 'industrial-plots' },
        ],
      },
    ],
  },

  // 7. Childcare
  {
    id: 'childcare',
    title: 'Childcare',
    description: 'Nannies, babysitters, au pairs, and daycare / crèche centers.',
    icon: Baby,
    color: 'text-pink-600',
    badgeBg: 'bg-pink-50 text-pink-700 border-pink-200',
    options: [
      {
        id: 'childcare-seeking',
        title: 'I am looking for a childcare job.',
        subtitle: 'Qualified nannies, experienced babysitters and au pairs offering professional childcare services',
        sectionId: 'childcare',
        mappedCategoryId: 'services',
        defaultListingType: 'service',
        hasSubcategories: false,
        priceLabel: 'Expected Rate / Salary (₹ / Month or Hour)',
        pricePlaceholder: 'e.g. 15000 / Month',
        icon: Baby,
        badge: 'Childcare Seeker',
        subcategories: [],
      },
      {
        id: 'childcare-hire',
        title: 'I want to hire a childcare provider.',
        subtitle: 'Parents looking to hire a trusted nanny, babysitter or governess for their children',
        sectionId: 'childcare',
        mappedCategoryId: 'services',
        defaultListingType: 'job',
        hasSubcategories: false,
        priceLabel: 'Offered Compensation (₹)',
        pricePlaceholder: 'e.g. 18000 / Month',
        icon: Users,
        badge: 'Hiring Nanny',
        subcategories: [],
      },
      {
        id: 'childcare-daycare',
        title: 'I am offering daycare.',
        subtitle: 'Licensed daycare centers, play schools, after-school care and home crèches in Hosur',
        sectionId: 'childcare',
        mappedCategoryId: 'services',
        defaultListingType: 'service',
        hasSubcategories: false,
        priceLabel: 'Monthly Daycare Fee (₹)',
        pricePlaceholder: 'e.g. 4500 / Month',
        icon: Baby,
        badge: 'Daycare Facility',
        subcategories: [],
      },
    ],
  },

  // 8. Community
  {
    id: 'community',
    title: 'Community',
    description: 'Rideshare, pet adoption, artists, lost & found, musicians, and public notices.',
    icon: Users,
    color: 'text-teal-600',
    badgeBg: 'bg-teal-50 text-teal-700 border-teal-200',
    options: [
      {
        id: 'community-artists',
        title: 'I am seeking other artists.',
        subtitle: 'Painters, sculptors, digital creators and performers seeking artistic collaboration',
        sectionId: 'community',
        mappedCategoryId: 'community',
        defaultListingType: 'free',
        hasSubcategories: false,
        priceLabel: 'Fee / Free Collab (₹)',
        pricePlaceholder: 'Free / Collaborative',
        icon: Palette,
        badge: 'Artists',
        subcategories: [],
      },
      {
        id: 'community-general',
        title: 'I am placing an ad regarding the community in general.',
        subtitle: 'Community initiatives, neighbourhood discussions, social projects and general questions',
        sectionId: 'community',
        mappedCategoryId: 'community',
        defaultListingType: 'free',
        hasSubcategories: false,
        priceLabel: 'Price (if applicable)',
        pricePlaceholder: 'Free / Community',
        icon: Users,
        badge: 'General Community',
        subcategories: [],
      },
      {
        id: 'community-guest-posting',
        title: 'I am placing an ad regarding the community in guest posting.',
        subtitle: 'Articles, guest blogging, community newsletters, publications and contributors',
        sectionId: 'community',
        mappedCategoryId: 'community',
        defaultListingType: 'free',
        hasSubcategories: false,
        priceLabel: 'Honorarium / Free (₹)',
        pricePlaceholder: 'Free / N/A',
        icon: Newspaper,
        badge: 'Guest Posting',
        subcategories: [],
      },
      {
        id: 'community-help',
        title: 'I am placing an ad regarding the community in help.',
        subtitle: 'Mutual assistance, volunteering, non-profit community aid, senior citizen support',
        sectionId: 'community',
        mappedCategoryId: 'community',
        defaultListingType: 'free',
        hasSubcategories: false,
        priceLabel: 'Aid Details',
        pricePlaceholder: 'Free / Mutual Aid',
        icon: HelpCircle,
        badge: 'Community Help',
        subcategories: [],
      },
      {
        id: 'community-news',
        title: 'I am placing an ad regarding local news.',
        subtitle: 'Hosur local events, civic notifications, traffic updates and community news items',
        sectionId: 'community',
        mappedCategoryId: 'community',
        defaultListingType: 'free',
        hasSubcategories: false,
        priceLabel: 'Cost',
        pricePlaceholder: 'Free / Info',
        icon: Newspaper,
        badge: 'Local News',
        subcategories: [],
      },
      {
        id: 'community-lost-found',
        title: 'I have lost or found something.',
        subtitle: 'Report lost pets, keys, wallets, original documents, electronics, or notify of found items',
        sectionId: 'community',
        mappedCategoryId: 'community',
        defaultListingType: 'free',
        hasSubcategories: false,
        priceLabel: 'Optional Reward (₹)',
        pricePlaceholder: 'e.g. 1000 Reward (or 0)',
        icon: Tag,
        badge: 'Lost & Found',
        subcategories: [],
      },
      {
        id: 'community-musicians',
        title: 'I am looking for music or musicians.',
        subtitle: 'Find bands, vocalists, guitarists, instrumentalists, studio sessions and jam buddies',
        sectionId: 'community',
        mappedCategoryId: 'community',
        defaultListingType: 'free',
        hasSubcategories: false,
        priceLabel: 'Session Rate / Free Collab (₹)',
        pricePlaceholder: 'e.g. Free or 500 / Hour',
        icon: Music,
        badge: 'Musicians',
        subcategories: [],
      },
      {
        id: 'community-permit-transfer',
        title: 'I am placing an ad seeking a mutual permit transfer.',
        subtitle: 'Work permits, sponsorship exchanges or transfer opportunities for expatriate workers',
        sectionId: 'community',
        mappedCategoryId: 'community',
        defaultListingType: 'free',
        hasSubcategories: false,
        priceLabel: 'Transfer Costs (₹)',
        pricePlaceholder: 'e.g. Standard statutory / Mutual',
        icon: Repeat,
        badge: 'Permit Transfer',
        subcategories: [],
      },
      {
        id: 'community-pet-adoption',
        title: 'I am placing an ad regarding pet adoption.',
        subtitle: 'Rescued puppies, cats, kittens and birds seeking caring adoptive homes',
        sectionId: 'community',
        mappedCategoryId: 'community',
        defaultListingType: 'free',
        hasSubcategories: false,
        priceLabel: 'Adoption Fee (₹)',
        pricePlaceholder: 'Free / Nominal adoption cost',
        icon: Dog,
        badge: 'Pet Adoption',
        subcategories: [],
      },
      {
        id: 'community-rideshare',
        title: 'I am looking to share a ride.',
        subtitle: 'Daily Hosur-Bangalore-SIPCOT carpooling, weekend travel, ride sharing and seat splitting',
        sectionId: 'community',
        mappedCategoryId: 'community',
        defaultListingType: 'free',
        hasSubcategories: false,
        priceLabel: 'Fuel Share / Seat Cost (₹ / Trip)',
        pricePlaceholder: 'e.g. 150 / Trip',
        icon: Car,
        badge: 'Rideshare / Carpool',
        subcategories: [],
      },
      {
        id: 'community-sports',
        title: 'I am looking for sports partners.',
        subtitle: 'Badminton, cricket, running, gym, football, tennis partners and weekend sports teams',
        sectionId: 'community',
        mappedCategoryId: 'community',
        defaultListingType: 'free',
        hasSubcategories: false,
        priceLabel: 'Court Share (₹)',
        pricePlaceholder: 'e.g. 50 / Game (or Free)',
        icon: Layers,
        badge: 'Sports Partner',
        subcategories: [],
      },
      {
        id: 'community-event',
        title: 'I would like to announce an event.',
        subtitle: 'Workshops, exhibitions, festivals, weekend meetups, webinars and public gatherings',
        sectionId: 'community',
        mappedCategoryId: 'community',
        defaultListingType: 'free',
        hasSubcategories: false,
        priceLabel: 'Ticket / Entry Fee (₹)',
        pricePlaceholder: 'Free Entry or e.g. 250',
        icon: Calendar,
        badge: 'Event',
        subcategories: [],
      },
    ],
  },

  // 9. Learning
  {
    id: 'learning',
    title: 'Learning',
    description: 'Language exchanges, private tuitions, academic coaching, art, coding, and skill lessons.',
    icon: GraduationCap,
    color: 'text-amber-700',
    badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
    options: [
      {
        id: 'learning-exchange',
        title: 'I would like to exchange languages.',
        subtitle: 'Language tandem partners (English, Tamil, Hindi, Kannada, German, French, etc.)',
        sectionId: 'learning',
        mappedCategoryId: 'community',
        defaultListingType: 'free',
        hasSubcategories: false,
        priceLabel: 'Cost',
        pricePlaceholder: 'Free / Mutual Exchange',
        icon: Languages,
        badge: 'Language Exchange',
        subcategories: [],
      },
      {
        id: 'learning-offering',
        title: 'I am offering lessons.',
        subtitle: 'Academic tuitions (CBSE/State/ICSE), languages, coding, music, art and competitive exams',
        sectionId: 'learning',
        mappedCategoryId: 'services',
        defaultListingType: 'service',
        hasSubcategories: false,
        priceLabel: 'Lesson Fee (₹ / Hour or Month)',
        pricePlaceholder: 'e.g. 500 / Hour or 3000 / Month',
        icon: GraduationCap,
        badge: 'Offering Lessons',
        subcategories: [],
      },
      {
        id: 'learning-seeking',
        title: 'I am looking for lessons (languages, art, music, etc.).',
        subtitle: 'Students and parents seeking qualified tutors, language teachers or skill instructors',
        sectionId: 'learning',
        mappedCategoryId: 'services',
        defaultListingType: 'service',
        hasSubcategories: false,
        priceLabel: 'Target Budget (₹)',
        pricePlaceholder: 'e.g. 400 / Hour',
        icon: Users,
        badge: 'Seeking Tutor',
        subcategories: [],
      },
    ],
  },

  // 10. Services
  {
    id: 'services',
    title: 'Services',
    description: 'Electricians, plumbers, home repairs, deep cleaning, movers, tech support & accounting.',
    icon: Wrench,
    color: 'text-cyan-700',
    badgeBg: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    options: [
      {
        id: 'services-offering',
        title: 'I am offering a service ...',
        subtitle: 'Handyman repair, home maintenance, tech repair, transport, cleaning, beauty and legal services',
        sectionId: 'services',
        mappedCategoryId: 'services',
        defaultListingType: 'service',
        hasSubcategories: true,
        priceLabel: 'Service Fee / Visit Charge (₹)',
        pricePlaceholder: 'e.g. 299 / Visit',
        icon: Wrench,
        badge: 'Local Service',
        subcategories: [
          { id: 'srv-home-repair', name: 'Home Repair: Electrician, Plumber, Carpenter, Painter', slug: 'home-repairs' },
          { id: 'srv-appliance-repair', name: 'AC, Refrigerator & Washing Machine Repair', slug: 'appliance-repair' },
          { id: 'srv-cleaning-pest', name: 'Deep Cleaning, Housekeeping & Pest Control', slug: 'cleaning-pest' },
          { id: 'srv-movers-packers', name: 'Movers & Packers, Mini Truck Transport', slug: 'movers-packers' },
          { id: 'srv-it-tech', name: 'Computer, Laptop & Mobile Repair Services', slug: 'computer-tech' },
          { id: 'srv-legal-tax', name: 'Accounting, GST, Tax, Legal & Business Registration', slug: 'accounting-legal' },
          { id: 'srv-salon-tailoring', name: 'Salon at Home, Beauty, Massage & Tailoring', slug: 'salon-beauty' },
          { id: 'srv-events-photo', name: 'Photography, Videography, DJ & Event Catering', slug: 'events-photography' },
          { id: 'srv-domestic-help', name: 'Domestic Help: Maids, Cooks, Babysitters, Caretakers', slug: 'domestic-help' },
          { id: 'srv-auto-repair', name: 'Vehicle Mechanic, Car Washing & Detailing', slug: 'auto-repair' },
        ],
      },
    ],
  },
];

// Flat list of all 32 expatriates options for easy lookup
export const ALL_EXPATRIATES_OPTIONS: ExpatriatesOption[] = EXPATRIATES_SECTIONS.flatMap(s => s.options);

export function getOptionById(optionId: string): ExpatriatesOption | undefined {
  return ALL_EXPATRIATES_OPTIONS.find(o => o.id === optionId);
}

export function getSectionById(sectionId: string): ExpatriatesSection | undefined {
  return EXPATRIATES_SECTIONS.find(s => s.id === sectionId);
}

export function getSectionForOption(optionId: string): ExpatriatesSection | undefined {
  const opt = getOptionById(optionId);
  return opt ? getSectionById(opt.sectionId) : undefined;
}

// =====================================================================
// BACKWARD COMPATIBLE DEFINITIONS (for existing pages & queries)
// =====================================================================

export const CLASSIFIEDS_CATEGORIES: CategoryDefinition[] = [
  // 1. Vehicles & Bikes
  {
    id: 'vehicles',
    slug: 'vehicles-bikes',
    name: 'Vehicles & Bikes',
    shortName: 'Vehicles',
    icon: Car,
    iconName: 'Car',
    description: 'Cars, bikes, scooters, EVs, commercial trucks & rentals',
    listingTypes: ['new', 'preowned', 'rent'],
    count: 0,
    subcategories: [
      { id: 'v-cars', name: 'Cars', slug: 'cars' },
      { id: 'v-motorcycles', name: 'Bikes / Motorcycles', slug: 'bikes-motorcycles' },
      { id: 'v-scooters', name: 'Scooters & Activa', slug: 'scooters' },
      { id: 'v-bicycles', name: 'Bicycles & Cycles', slug: 'bicycles' },
      { id: 'v-evs', name: 'Electric Vehicles (EVs)', slug: 'electric-vehicles' },
      { id: 'v-commercial', name: 'Autos, Vans & Tempos', slug: 'autos-vans-tempos' },
      { id: 'v-heavy', name: 'Trucks, Buses & Tractors', slug: 'trucks-buses-tractors' },
      { id: 'v-parts', name: 'Spare Parts & Accessories (Tyres, Helmets)', slug: 'spare-parts-accessories' },
      { id: 'v-rentals', name: 'Rental Vehicles (Cars with/without driver, Bikes, Tempo)', slug: 'rental-vehicles' },
    ],
  },

  // 2. Houses & Properties
  {
    id: 'property',
    slug: 'houses-properties',
    name: 'Houses & Properties',
    shortName: 'Properties',
    icon: Building2,
    iconName: 'Building2',
    description: 'Villas, plots, flats, farmland & residential/commercial rentals',
    listingTypes: ['preowned', 'rent'],
    count: 0,
    subcategories: [
      { id: 'p-houses', name: 'Houses / Villas for Sale', slug: 'houses-villas' },
      { id: 'p-flats', name: 'Flats & Apartments for Sale', slug: 'flats-apartments' },
      { id: 'p-plots', name: 'Plots & Residential Land', slug: 'plots-land' },
      { id: 'p-farmland', name: 'Farmland & Agro Land', slug: 'farmland' },
      { id: 'p-rent-house', name: 'Rent: Independent Houses & Villas', slug: 'rent-houses' },
      { id: 'p-rent-flat', name: 'Rent: Flats & Apartments', slug: 'rent-flats' },
      { id: 'p-rent-pg', name: 'Rent: PG & Hostels, Shared Rooms', slug: 'rent-pg-hostels' },
      { id: 'p-commercial', name: 'Shops & Offices (Sale / Rent)', slug: 'shops-offices' },
      { id: 'p-halls', name: 'Function Halls & Parking Spaces', slug: 'function-halls-parking' },
    ],
  },

  // 3. Mobiles & Tech
  {
    id: 'mobiles',
    slug: 'mobiles-tech',
    name: 'Mobiles & Tech',
    shortName: 'Mobiles & Tech',
    icon: Smartphone,
    iconName: 'Smartphone',
    description: 'Smartphones, tablets, laptops, accessories & computer parts',
    listingTypes: ['new', 'preowned', 'rent'],
    count: 0,
    subcategories: [
      { id: 'm-smartphones', name: 'Smartphones (iPhone, Android)', slug: 'smartphones' },
      { id: 'm-featurephones', name: 'Feature Phones & Basic Mobiles', slug: 'feature-phones' },
      { id: 'm-tablets', name: 'Tablets & iPads', slug: 'tablets-ipads' },
      { id: 'm-watches', name: 'Smartwatches & Fitness Bands', slug: 'smartwatches' },
      { id: 'm-laptops', name: 'Laptops (Gaming, Business, Student)', slug: 'laptops' },
      { id: 'm-desktops', name: 'Desktops, Monitors & Printers', slug: 'desktops-monitors' },
      { id: 'm-accessories', name: 'Accessories: Chargers, Earphones, Power Banks', slug: 'mobile-accessories' },
      { id: 'm-parts', name: 'Computer Parts: RAM, SSD, Graphics Cards, Routers', slug: 'computer-parts' },
      { id: 'm-rentals', name: 'Rent: Laptops, Tablets, Projectors', slug: 'tech-rentals' },
    ],
  },

  // 4. Electronics & Appliances
  {
    id: 'electronics',
    slug: 'electronics-appliances',
    name: 'Electronics & Appliances',
    shortName: 'Electronics',
    icon: Tv,
    iconName: 'Tv',
    description: 'TVs, refrigerators, washing machines, ACs & sound systems',
    listingTypes: ['new', 'preowned', 'rent'],
    count: 0,
    subcategories: [
      { id: 'e-tv', name: 'TV & Home Theatre Systems', slug: 'tv-home-theatre' },
      { id: 'e-fridge', name: 'Refrigerators & Freezers', slug: 'refrigerators' },
      { id: 'e-washing', name: 'Washing Machines & Dryers', slug: 'washing-machines' },
      { id: 'e-cooling', name: 'Air Conditioners (AC), Coolers & Fans', slug: 'ac-coolers-fans' },
      { id: 'e-water', name: 'Water Purifiers & Geysers', slug: 'water-purifiers-geysers' },
      { id: 'e-kitchen', name: 'Kitchen: Microwave, Induction, Mixer Grinder', slug: 'kitchen-appliances' },
      { id: 'e-cameras', name: 'Cameras, DSLR & CCTV Security', slug: 'cameras-cctv' },
      { id: 'e-power', name: 'Inverters, UPS & Batteries', slug: 'inverters-ups-batteries' },
      { id: 'e-rentals', name: 'Rent: AC, Fridge, Washing Machine, Sound Systems', slug: 'appliance-rentals' },
    ],
  },

  // 5. Jobs & Careers
  {
    id: 'jobs',
    slug: 'jobs-careers',
    name: 'Jobs & Careers',
    shortName: 'Jobs',
    icon: Briefcase,
    iconName: 'Briefcase',
    description: 'Full-time, part-time, WFH, IT, sales, factory & candidate profiles',
    listingTypes: ['job'],
    count: 0,
    subcategories: [
      { id: 'j-it', name: 'IT / Software & Developers', slug: 'it-software' },
      { id: 'j-sales', name: 'Sales, Marketing & Business Development', slug: 'sales-marketing' },
      { id: 'j-teaching', name: 'Teaching, Faculty & Tutors', slug: 'teaching-education' },
      { id: 'j-driver', name: 'Driver & Delivery Executives', slug: 'driver-delivery' },
      { id: 'j-security', name: 'Security Guards & Supervisors', slug: 'security' },
      { id: 'j-hotel', name: 'Hotel, Restaurant, Chefs & Service', slug: 'hotel-restaurant' },
      { id: 'j-healthcare', name: 'Healthcare, Nursing & Pharmacy', slug: 'healthcare-nursing' },
      { id: 'j-accounting', name: 'Accounting, Tally, Billing & Finance', slug: 'accounting-finance' },
      { id: 'j-admin', name: 'Office Admin, Receptionist & HR', slug: 'office-admin' },
      { id: 'j-factory', name: 'Factory Production, Operators & Technicians', slug: 'factory-production' },
      { id: 'j-construction', name: 'Construction Labour & Supervisors', slug: 'construction-labour' },
      { id: 'j-beauty', name: 'Beauty Parlour, Salon & Tailoring', slug: 'beauty-salon-tailoring' },
    ],
  },

  // 6. Business
  {
    id: 'business',
    slug: 'business',
    name: 'Business',
    shortName: 'Business',
    icon: Store,
    iconName: 'Store',
    description: 'Businesses for sale, franchises, suppliers, wholesale & B2B services',
    listingTypes: ['new', 'preowned', 'service'],
    count: 0,
    subcategories: [
      { id: 'b-sale', name: 'Businesses for Sale & Running Units', slug: 'businesses-for-sale' },
      { id: 'b-franchise', name: 'Franchise Opportunities & Dealerships', slug: 'franchise-opportunities' },
      { id: 'b-investors', name: 'Partnership & Investor Offers', slug: 'partnership-investors' },
      { id: 'b-wholesale', name: 'Wholesale, Bulk Deals & Manufacturers', slug: 'wholesale-bulk-deals' },
      { id: 'b-services', name: 'Business Services (GST/Legal, Web, Marketing, Printing)', slug: 'business-services' },
      { id: 'b-startup-eq', name: 'Startup & Shop Equipment (Billing machines, Barcode, Racks)', slug: 'startup-equipment' },
    ],
  },

  // 7. Local Services
  {
    id: 'services',
    slug: 'local-services',
    name: 'Local Services',
    shortName: 'Services',
    icon: Wrench,
    iconName: 'Wrench',
    description: 'Electricians, plumbers, home repairs, painters, cleaning & movers',
    listingTypes: ['service'],
    count: 0,
    subcategories: [
      { id: 's-repair', name: 'Home Repair: Electrician, Plumber, Carpenter, Painter', slug: 'home-repair' },
      { id: 's-appliances', name: 'AC, Fridge & Washing Machine Repair', slug: 'appliance-repair' },
      { id: 's-cleaning', name: 'Deep Cleaning, Pest Control & Laundry', slug: 'cleaning-pest-control' },
      { id: 's-movers', name: 'Movers & Packers, Mini Truck Transport', slug: 'movers-packers' },
      { id: 's-personal', name: 'Personal: Salon at Home, Tailoring, Yoga Trainer', slug: 'personal-care' },
      { id: 's-events', name: 'Events: Photographer, DJ, Decorators, Catering', slug: 'events-catering' },
      { id: 's-domestic', name: 'Domestic Help: Maid, Cook, Babysitter, Caretaker', slug: 'domestic-help' },
      { id: 's-courier', name: 'Courier, Parcel & Vehicle Washing Services', slug: 'courier-vehicle-washing' },
    ],
  },

  // 8. Buy & Sell
  {
    id: 'buy-sell',
    slug: 'buy-sell',
    name: 'Buy & Sell',
    shortName: 'Buy & Sell',
    icon: ShoppingBag,
    iconName: 'ShoppingBag',
    description: 'Fashion, books, fitness equipment, baby products, pets & collectibles',
    listingTypes: ['new', 'preowned'],
    count: 0,
    subcategories: [
      { id: 'bs-fashion', name: 'Fashion: Clothes, Footwear, Bags, Jewelry', slug: 'fashion-wear' },
      { id: 'bs-books', name: 'Books, Stationery & Exam Study Materials', slug: 'books-stationery' },
      { id: 'bs-sports', name: 'Sports & Fitness: Gym Equipment, Cricket Kits, Cycles', slug: 'sports-fitness' },
      { id: 'bs-kids', name: 'Kids & Baby: Toys, Prams, Strollers, Cribs', slug: 'kids-baby' },
      { id: 'bs-music', name: 'Musical Instruments & Sound Gear', slug: 'musical-instruments' },
      { id: 'bs-art', name: 'Art, Hobbies & Antiques / Collectibles', slug: 'art-hobbies-antiques' },
      { id: 'bs-pets', name: 'Pets, Pet Food & Aquariums', slug: 'pets-aquariums' },
      { id: 'bs-farm', name: 'Groceries, Farm Produce, Plants & Saplings', slug: 'groceries-farm-plants' },
      { id: 'bs-scrap', name: 'Scrap, Recyclables & Old Items', slug: 'scrap-old-items' },
    ],
  },

  // 9. Home & Furniture
  {
    id: 'furniture',
    slug: 'home-furniture',
    name: 'Home & Furniture',
    shortName: 'Furniture',
    icon: Sofa,
    iconName: 'Sofa',
    description: 'Sofas, beds, dining tables, kitchenware, decor & furniture rentals',
    listingTypes: ['new', 'preowned', 'rent'],
    count: 0,
    subcategories: [
      { id: 'f-sofa', name: 'Sofa Sets, Recliners & Living Chairs', slug: 'sofa-living-chairs' },
      { id: 'f-bed', name: 'Beds, Mattresses & Wardrobes', slug: 'beds-wardrobes' },
      { id: 'f-tables', name: 'Dining Sets, Study Tables & Computer Desks', slug: 'dining-study-tables' },
      { id: 'f-kitchen', name: 'Kitchen Items: Cookware, Utensils & Storage', slug: 'kitchen-cookware' },
      { id: 'f-decor', name: 'Decor: Curtains, Lighting, Carpets, Wall Art', slug: 'home-decor' },
      { id: 'f-garden', name: 'Garden Items, Patio & Cleaning Equipment', slug: 'garden-patio' },
      { id: 'f-rentals', name: 'Rent: Furniture Sets, Beds, Sofas, Event Chairs', slug: 'furniture-rentals' },
    ],
  },

  // 10. Commercial & Industrial
  {
    id: 'commercial',
    slug: 'commercial-industrial',
    name: 'Commercial & Industrial',
    shortName: 'Commercial',
    icon: Factory,
    iconName: 'Factory',
    description: 'Machinery, CNC, raw materials, construction tools & agro equipment',
    listingTypes: ['new', 'preowned', 'rent'],
    count: 0,
    subcategories: [
      { id: 'c-property', name: 'Commercial Spaces: Shops, Offices, Godowns, Desks', slug: 'commercial-spaces' },
      { id: 'c-machinery', name: 'Industrial Machinery: CNC, Lathe, Compressors, Packaging', slug: 'industrial-machinery' },
      { id: 'c-construction', name: 'Construction Equipment: JCB, Mixers, Scaffolding (Rent/Sale)', slug: 'construction-equipment' },
      { id: 'c-agro', name: 'Agriculture Equipment: Tractors, Tillers, Pumps (Rent/Sale)', slug: 'agriculture-equipment' },
      { id: 'c-raw', name: 'Raw Materials: Steel, Cement, Bricks, Tiles, Pipes', slug: 'raw-materials' },
      { id: 'c-fittings', name: 'Shop Fittings: Counters, Display Racks, Billing Units', slug: 'shop-fittings' },
    ],
  },

  // 11. Community
  {
    id: 'community',
    slug: 'community',
    name: 'Community',
    shortName: 'Community',
    icon: Users,
    iconName: 'Users',
    description: 'Lost & found, donations, free giveaways, local notices & blood donors',
    listingTypes: ['free'],
    count: 0,
    subcategories: [
      { id: 'cm-lost', name: 'Lost and Found', slug: 'lost-and-found' },
      { id: 'cm-free', name: 'Donations & Free Giveaways', slug: 'donations-giveaways' },
      { id: 'cm-events', name: 'Events, Workshops & Exhibitions', slug: 'events-workshops' },
      { id: 'cm-classes', name: 'Classes, Courses & Volunteering', slug: 'classes-courses' },
      { id: 'cm-blood', name: 'Blood Donors & Emergency Support', slug: 'blood-donors' },
      { id: 'cm-notices', name: 'Local News, Notices, Announcements & Alerts', slug: 'local-notices' },
    ],
  },
];

export const ALL_CATEGORY_IDS = CLASSIFIEDS_CATEGORIES.map(c => c.id);
export const CATEGORIES = CLASSIFIEDS_CATEGORIES;

export function getCategoryById(id: string): CategoryDefinition | undefined {
  return CLASSIFIEDS_CATEGORIES.find(c => c.id === id || c.slug === id);
}

export function getSubcategoriesForCategory(categoryId: string): SubCategory[] {
  const cat = getCategoryById(categoryId);
  return cat ? cat.subcategories : [];
}

export function getAllowedListingTypesForCategory(categoryId: string): ListingTypeInfo[] {
  const cat = getCategoryById(categoryId);
  if (!cat) return [LISTING_TYPES.preowned, LISTING_TYPES.new];
  return cat.listingTypes.map(code => LISTING_TYPES[code]).filter(Boolean);
}

/**
 * Maps a given subcategory slug to its primary top-level classifieds category.
 * Ensures ads posted under subcategories like 'cars-vehicles' show up in 'vehicles', etc.
 */
export function getCategoryForSubcategory(subcategorySlug?: string): string {
  if (!subcategorySlug) return 'buy-sell';
  const slug = subcategorySlug.toLowerCase();

  // Jobs (Checked first to prevent accidental match with machinery or appliances)
  if ([
    'job-seeking', 'job-offering', 'temp-jobs-hire', 'it-software', 'sales-marketing', 
    'teaching-education', 'driver-delivery', 'security', 'hotel-restaurant', 'healthcare-nursing', 
    'accounting-finance', 'office-admin', 'factory-production', 'construction-labour', 'beauty-salon-tailoring'
  ].includes(slug) || slug.includes('job') || slug.startsWith('j-')) {
    return 'jobs';
  }

  // Vehicles
  if ([
    'cars-vehicles', 'motorcycles-scooters', 'vehicles-bikes', 'bicycles', 'cars', 
    'bikes-motorcycles', 'scooters', 'electric-vehicles', 'autos-vans-tempos', 
    'trucks-buses-tractors', 'spare-parts-accessories', 'rental-vehicles'
  ].includes(slug) || slug.includes('vehicle') || slug.includes('motorcycle') || slug.includes('bike') || slug === 'cars' || slug.startsWith('car-') || slug.endsWith('-car') || slug.includes('-cars-') || slug.includes('-car-')) {
    return 'vehicles';
  }

  // Mobiles & Tech
  if ([
    'mobile-phones-tablets', 'computers-laptops', 'mobiles-tech', 'smartphones', 
    'feature-phones', 'tablets-ipads', 'smartwatches', 'laptops', 'desktops-monitors', 
    'mobile-accessories', 'computer-parts', 'tech-rentals'
  ].includes(slug) || slug.includes('phone') || slug.includes('laptop') || slug.includes('tablet')) {
    return 'mobiles';
  }

  // Electronics & Appliances
  if ([
    'tv-audio-video', 'home-appliances', 'electronics-appliances', 'tv-home-theatre', 
    'refrigerators', 'washing-machines', 'ac-coolers-fans', 'water-purifiers-geysers', 
    'kitchen-appliances', 'cameras-cctv', 'inverters-ups-batteries', 'appliance-rentals'
  ].includes(slug) || slug.includes('appliance') || slug.includes('refrigerator') || slug.includes('fridge') || slug.includes('television') || slug.includes('coolers-fans') || slug.includes('ac-') || slug.includes('-ac') || slug === 'ac') {
    return 'electronics';
  }

  // Furniture & Home
  if ([
    'furniture-decor', 'household-kitchenware', 'sofa-living-chairs', 'beds-wardrobes', 
    'dining-study-tables', 'kitchen-cookware', 'home-decor', 'garden-patio', 'furniture-rentals'
  ].includes(slug) || slug.includes('furniture') || slug.includes('sofa') || slug.includes('bed')) {
    return 'furniture';
  }

  // Commercial & Industrial
  if ([
    'machinery-equipment', 'tools-hardware', 'commercial-spaces', 'industrial-machinery', 
    'construction-equipment', 'agriculture-equipment', 'raw-materials', 'shop-fittings', 
    'commercial-offices', 'retail-shops', 'warehouses-godowns', 'industrial-sheds', 'coworking-desks'
  ].includes(slug) || slug.includes('machinery') || slug.includes('industrial') || slug.includes('warehouse')) {
    return 'commercial';
  }

  // Houses & Properties
  if ([
    'apartments-rent', 'houses-rent', 'rooms-shared-rent', 'pg-hostels', 'apartments-sale', 
    'houses-sale', 'short-term-rentals', 'seek-apartment-rent', 'seek-house-rent', 
    'seek-roommate-shared', 'seek-pg', 'seek-buy-home', 'residential-plots', 'commercial-plots', 
    'agricultural-land', 'industrial-plots', 'houses-villas', 'flats-apartments', 'plots-land', 
    'farmland', 'rent-houses', 'rent-flats', 'rent-pg-hostels', 'shops-offices'
  ].includes(slug) || slug.includes('housing') || slug.includes('villa') || slug.includes('plot') || slug.includes('apartment') || slug.includes('real-estate') || slug.startsWith('rent-') || slug.endsWith('-rent') || slug.includes('-rent-')) {
    return 'property';
  }

  // Services
  if ([
    'childcare', 'home-repair', 'appliance-repair', 'cleaning-pest-control', 'movers-packers', 
    'personal-care', 'events-catering', 'domestic-help', 'courier-vehicle-washing', 'tutors-lessons', 'classes-courses'
  ].includes(slug) || slug.includes('service') || slug.startsWith('s-')) {
    return 'services';
  }

  // Community
  if ([
    'community-lost-found', 'community-rideshare', 'community-pet-adoption', 'community-sports', 
    'community-musicians', 'community-event', 'community-notices', 'lost-and-found', 'donations-giveaways', 
    'events-workshops', 'blood-donors', 'local-notices'
  ].includes(slug) || slug.includes('community') || slug.startsWith('cm-')) {
    return 'community';
  }

  return 'buy-sell';
}

/**
 * Resolves the primary category ID for an Expatriates posting selection.
 */
export function getResolvedCategoryId(optionId: string, subcategorySlug?: string): string {
  if (subcategorySlug) {
    const fromSub = getCategoryForSubcategory(subcategorySlug);
    if (fromSub && fromSub !== 'buy-sell') return fromSub;
  }
  if (!optionId) return 'buy-sell';
  if (optionId.startsWith('housing') || optionId.startsWith('plots')) return 'property';
  if (optionId.startsWith('commercial')) return 'commercial';
  if (optionId.startsWith('job') || optionId.startsWith('temp-job')) return 'jobs';
  if (optionId.startsWith('childcare') || optionId.startsWith('service') || optionId.startsWith('learning')) return 'services';
  if (optionId.startsWith('community')) return 'community';

  const opt = getOptionById(optionId);
  if (opt && opt.mappedCategoryId) return opt.mappedCategoryId;
  return 'buy-sell';
}

/**
 * Safely resolves the primary category ID for an ad based on its stored category and subcategory.
 * Ensures ads with subcategories like 'cars-vehicles' or 'motorcycles-scooters' always map to 'vehicles'.
 */
export function resolvePrimaryCategory(cat?: string, sub?: string): string {
  const cleanSub = (sub || '').toLowerCase().trim();
  const cleanCat = (cat || '').toLowerCase().trim();

  const primaryCategories = new Set([
    'vehicles', 'property', 'mobiles', 'electronics', 'furniture', 
    'jobs', 'services', 'commercial', 'community'
  ]);

  // 1. If category is already a valid primary category, trust it
  if (primaryCategories.has(cleanCat)) {
    return cleanCat;
  }

  // 2. If subcategory resolves to a distinct category, use that
  if (cleanSub) {
    const fromSub = getCategoryForSubcategory(cleanSub);
    if (fromSub && fromSub !== 'buy-sell') {
      return fromSub;
    }
  }

  // 3. Fallback
  return cleanCat || 'buy-sell';
}

/**
 * Returns human-friendly category display name.
 */
export function getCategoryDisplayName(catId?: string): string {
  if (!catId) return 'All Classifieds';
  const found = CLASSIFIEDS_CATEGORIES.find(c => c.id.toLowerCase() === catId.toLowerCase() || c.slug.toLowerCase() === catId.toLowerCase());
  if (found) return found.name;
  return catId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}


