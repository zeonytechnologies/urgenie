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
  Users 
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

export const CLASSIFIEDS_CATEGORIES: CategoryDefinition[] = [
  // 1. Vehicles & Bikes (N, P, R)
  {
    id: 'vehicles',
    slug: 'vehicles-bikes',
    name: 'Vehicles & Bikes',
    shortName: 'Vehicles',
    icon: Car,
    iconName: 'Car',
    description: 'Cars, bikes, scooters, EVs, commercial trucks & rentals',
    listingTypes: ['new', 'preowned', 'rent'],
    count: 340,
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

  // 2. Houses & Properties (Sell, R)
  {
    id: 'property',
    slug: 'houses-properties',
    name: 'Houses & Properties',
    shortName: 'Properties',
    icon: Building2,
    iconName: 'Building2',
    description: 'Villas, plots, flats, farmland & residential/commercial rentals',
    listingTypes: ['preowned', 'rent'],
    count: 512,
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

  // 3. Mobiles & Tech (N, P, R)
  {
    id: 'mobiles',
    slug: 'mobiles-tech',
    name: 'Mobiles & Tech',
    shortName: 'Mobiles & Tech',
    icon: Smartphone,
    iconName: 'Smartphone',
    description: 'Smartphones, tablets, laptops, accessories & computer parts',
    listingTypes: ['new', 'preowned', 'rent'],
    count: 420,
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

  // 4. Electronics & Appliances (N, P, R)
  {
    id: 'electronics',
    slug: 'electronics-appliances',
    name: 'Electronics & Appliances',
    shortName: 'Electronics',
    icon: Tv,
    iconName: 'Tv',
    description: 'TVs, refrigerators, washing machines, ACs & sound systems',
    listingTypes: ['new', 'preowned', 'rent'],
    count: 380,
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

  // 5. Jobs & Careers (J)
  {
    id: 'jobs',
    slug: 'jobs-careers',
    name: 'Jobs & Careers',
    shortName: 'Jobs',
    icon: Briefcase,
    iconName: 'Briefcase',
    description: 'Full-time, part-time, WFH, IT, sales, factory & candidate profiles',
    listingTypes: ['job'],
    count: 670,
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

  // 6. Business (N, P, S)
  {
    id: 'business',
    slug: 'business',
    name: 'Business',
    shortName: 'Business',
    icon: Store,
    iconName: 'Store',
    description: 'Businesses for sale, franchises, suppliers, wholesale & B2B services',
    listingTypes: ['new', 'preowned', 'service'],
    count: 195,
    subcategories: [
      { id: 'b-sale', name: 'Businesses for Sale & Running Units', slug: 'businesses-for-sale' },
      { id: 'b-franchise', name: 'Franchise Opportunities & Dealerships', slug: 'franchise-opportunities' },
      { id: 'b-investors', name: 'Partnership & Investor Offers', slug: 'partnership-investors' },
      { id: 'b-wholesale', name: 'Wholesale, Bulk Deals & Manufacturers', slug: 'wholesale-bulk-deals' },
      { id: 'b-services', name: 'Business Services (GST/Legal, Web, Marketing, Printing)', slug: 'business-services' },
      { id: 'b-startup-eq', name: 'Startup & Shop Equipment (Billing machines, Barcode, Racks)', slug: 'startup-equipment' },
    ],
  },

  // 7. Local Services (S)
  {
    id: 'services',
    slug: 'local-services',
    name: 'Local Services',
    shortName: 'Services',
    icon: Wrench,
    iconName: 'Wrench',
    description: 'Electricians, plumbers, home repairs, painters, cleaning & movers',
    listingTypes: ['service'],
    count: 480,
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

  // 8. Buy & Sell (N, P)
  // Design note: Kept for fashion, books, kids, pets, collectibles & misc
  {
    id: 'buy-sell',
    slug: 'buy-sell',
    name: 'Buy & Sell',
    shortName: 'Buy & Sell',
    icon: ShoppingBag,
    iconName: 'ShoppingBag',
    description: 'Fashion, books, fitness equipment, baby products, pets & collectibles',
    listingTypes: ['new', 'preowned'],
    count: 530,
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

  // 9. Home & Furniture (N, P, R)
  {
    id: 'furniture',
    slug: 'home-furniture',
    name: 'Home & Furniture',
    shortName: 'Furniture',
    icon: Sofa,
    iconName: 'Sofa',
    description: 'Sofas, beds, dining tables, kitchenware, decor & furniture rentals',
    listingTypes: ['new', 'preowned', 'rent'],
    count: 310,
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

  // 10. Commercial & Industrial (N, P, R)
  {
    id: 'commercial',
    slug: 'commercial-industrial',
    name: 'Commercial & Industrial',
    shortName: 'Commercial',
    icon: Factory,
    iconName: 'Factory',
    description: 'Machinery, CNC, raw materials, construction tools & agro equipment',
    listingTypes: ['new', 'preowned', 'rent'],
    count: 260,
    subcategories: [
      { id: 'c-property', name: 'Commercial Spaces: Shops, Offices, Godowns, Desks', slug: 'commercial-spaces' },
      { id: 'c-machinery', name: 'Industrial Machinery: CNC, Lathe, Compressors, Packaging', slug: 'industrial-machinery' },
      { id: 'c-construction', name: 'Construction Equipment: JCB, Mixers, Scaffolding (Rent/Sale)', slug: 'construction-equipment' },
      { id: 'c-agro', name: 'Agriculture Equipment: Tractors, Tillers, Pumps (Rent/Sale)', slug: 'agriculture-equipment' },
      { id: 'c-raw', name: 'Raw Materials: Steel, Cement, Bricks, Tiles, Pipes', slug: 'raw-materials' },
      { id: 'c-fittings', name: 'Shop Fittings: Counters, Display Racks, Billing Units', slug: 'shop-fittings' },
    ],
  },

  // 11. Community (Free/Info)
  {
    id: 'community',
    slug: 'community',
    name: 'Community',
    shortName: 'Community',
    icon: Users,
    iconName: 'Users',
    description: 'Lost & found, donations, free giveaways, local notices & blood donors',
    listingTypes: ['free'],
    count: 95,
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
