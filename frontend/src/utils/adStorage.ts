/**
 * Utility functions for managing local advertisement storage,
 * synchronization, and deletion tombstones.
 */

export const removeAdFromLocalStorage = (id: string, slug?: string) => {
  try {
    // 1. Remove from active local ads
    const stored = JSON.parse(localStorage.getItem('urgenie_local_ads') || '[]');
    const updated = stored.filter((a: any) => {
      if (!a) return false;
      if (a.id === id || a.slug === id) return false;
      if (slug && (a.id === slug || a.slug === slug)) return false;
      return true;
    });
    localStorage.setItem('urgenie_local_ads', JSON.stringify(updated));

    // 2. Record tombstone in urgenie_deleted_ads so it is never resurrected
    const deleted = JSON.parse(localStorage.getItem('urgenie_deleted_ads') || '[]');
    if (id && !deleted.includes(id)) deleted.push(id);
    if (slug && !deleted.includes(slug)) deleted.push(slug);
    localStorage.setItem('urgenie_deleted_ads', JSON.stringify(deleted));
  } catch (err) {
    console.warn('Error removing ad from localStorage:', err);
  }
};

export const getDeletedAdIds = (): Set<string> => {
  try {
    const deleted = JSON.parse(localStorage.getItem('urgenie_deleted_ads') || '[]');
    return new Set(deleted);
  } catch {
    return new Set();
  }
};

export const isAdDeletedLocally = (idOrSlug: string): boolean => {
  try {
    const deleted = JSON.parse(localStorage.getItem('urgenie_deleted_ads') || '[]');
    return deleted.includes(idOrSlug);
  } catch {
    return false;
  }
};

export const purgeDeletedAndStaleLocalAds = (liveRemoteAdIds: Set<string>, remoteFetchSucceeded = false) => {
  try {
    const stored = JSON.parse(localStorage.getItem('urgenie_local_ads') || '[]');
    const deletedIds = getDeletedAdIds();

    const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

    const validLocalAds = stored.filter((ad: any) => {
      if (!ad || !ad.id) return false;
      // If tombstoned as deleted, drop it
      if (deletedIds.has(ad.id) || (ad.slug && deletedIds.has(ad.slug))) {
        return false;
      }
      // ONLY purge UUID ads if remote fetch was actually successful and returned ads!
      // Never purge during network offline or Supabase connection failures
      if (remoteFetchSucceeded && liveRemoteAdIds.size > 0 && isUuid(ad.id) && !liveRemoteAdIds.has(ad.id)) {
        return false;
      }
      return true;
    });

    localStorage.setItem('urgenie_local_ads', JSON.stringify(validLocalAds));
    return validLocalAds;
  } catch {
    return [];
  }
};

export const DEFAULT_SEED_ADS = [
  {
    id: 'seed-re-classic-350',
    title: 'Royal Enfield Classic 350 (Dual Channel ABS) - Mint Condition',
    slug: 'royal-enfield-classic-350-hosur',
    category_id: 'vehicles',
    category: 'vehicles',
    subcategory_id: 'cars-vehicles',
    subcategory: 'cars-vehicles',
    listing_type: 'preowned',
    price: 185000,
    price_text: '₹1,85,000',
    is_negotiable: true,
    condition: 'Like New (Mint)',
    location_name: 'SIPCOT Phase 1, Hosur',
    location_text: 'SIPCOT Phase 1, Hosur',
    contact_name: 'Karthik Raja',
    contact_phone: '9842154321',
    allow_whatsapp: true,
    images: ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600'],
    description: 'Single owner Royal Enfield Classic 350 with comprehensive insurance and timely showroom service. Excellent riding condition with new Michelin tyres.',
    status: 'active',
    views_count: 42,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    attributes: {
      'Make / Brand': 'Royal Enfield',
      'Model': 'Classic 350 Reborn',
      'Year': '2023',
      'Fuel Type': 'Petrol',
      'KM Driven': '12,500 km',
      'Ownership': '1st Owner',
      'Transmission': 'Manual',
    },
    brand: 'Royal Enfield',
    model: 'Classic 350',
    year: 2023,
    fuel_type: 'Petrol',
    km_driven: 12500,
    transmission: 'Manual',
    owners_count: '1st Owner',
  },
  {
    id: 'seed-hyundai-i20',
    title: 'Hyundai i20 Sportz 1.2 Petrol 2021 Manual - Single Owner Mint Condition',
    slug: 'hyundai-i20-sportz-2021-petrol-hosur',
    category_id: 'vehicles',
    category: 'vehicles',
    subcategory_id: 'cars-vehicles',
    subcategory: 'cars-vehicles',
    listing_type: 'preowned',
    price: 645000,
    price_text: '₹6,45,000',
    is_negotiable: true,
    condition: 'Excellent',
    location_name: 'Rayakottai Road, Hosur',
    location_text: 'Rayakottai Road, Hosur',
    contact_name: 'Muruganathan',
    contact_phone: '9842911223',
    allow_whatsapp: true,
    images: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600'],
    description: 'Neatly maintained Hyundai i20 Sportz 2021. Touchscreen infotainment, rear parking camera, power steering, chilled AC, comprehensive insurance valid till December. Service records available.',
    status: 'active',
    views_count: 57,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    attributes: {
      'Make / Brand': 'Hyundai',
      'Model': 'i20 Sportz 1.2',
      'Year': '2021',
      'Fuel Type': 'Petrol',
      'KM Driven': '34,000 km',
      'Ownership': '1st Owner',
      'Transmission': 'Manual',
    },
    brand: 'Hyundai',
    model: 'i20 Sportz',
    year: 2021,
    fuel_type: 'Petrol',
    km_driven: 34000,
    transmission: 'Manual',
    owners_count: '1st Owner',
  },
  {
    id: 'seed-flat-sipcot',
    title: 'Spacious 2 BHK Semi-Furnished Apartment for Rent near Mathigiri',
    slug: '2bhk-apartment-rent-mathigiri-hosur',
    category_id: 'property',
    category: 'property',
    subcategory_id: 'apartments-rent',
    subcategory: 'apartments-rent',
    listing_type: 'rent',
    price: 14000,
    price_text: '₹14,000 / Month',
    is_negotiable: true,
    condition: 'Excellent',
    location_name: 'Mathigiri, Hosur',
    location_text: 'Mathigiri, Hosur',
    contact_name: 'Suresh Kumar',
    contact_phone: '9443216789',
    allow_whatsapp: true,
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600'],
    description: 'Ventilated 2 BHK on 2nd floor with covered car parking, lift, 24/7 Cauvery water, and modular kitchen. Very close to schools and SIPCOT bus stop.',
    status: 'active',
    views_count: 68,
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    attributes: {
      'Offer Type': 'For Rent (Monthly)',
      'Configuration': '2 BHK',
      'Built-up Area': '1,150 Sq.Ft',
      'Furnishing': 'Semi-Furnished',
      'Floor': '2nd Floor (of 4)',
      'Facing': 'East Facing',
      'Security Deposit': '₹70,000',
      'Preferred Tenants': 'Family or Working Professionals',
      'Available From': 'Immediately',
    },
    bhk: '2 BHK',
    area_sqft: 1150,
    furnishing: 'Semi-Furnished',
    deposit_amount: 70000,
  },
  {
    id: 'seed-residential-plot',
    title: '1,200 Sq.Ft DTCP Approved Villa Plot for Sale in Gated Layout',
    slug: '1200-sqft-dtcp-approved-plot-bagalur-road-hosur',
    category_id: 'property',
    category: 'property',
    subcategory_id: 'residential-plots',
    subcategory: 'residential-plots',
    listing_type: 'preowned',
    price: 2400000,
    price_text: '₹24,00,000',
    is_negotiable: true,
    condition: 'Verified Site',
    location_name: 'Bagalur Road, Hosur',
    location_text: 'Bagalur Road, Hosur',
    contact_name: 'Balaji Developers',
    contact_phone: '9843344556',
    allow_whatsapp: true,
    images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600'],
    description: 'Ready to build 30x40 (1200 Sq.Ft) DTCP and HNTDA approved residential plot with 30ft black top tar roads, streetlights, underground drainage, and clear legal title. 10 mins from Hosur Railway Station.',
    status: 'active',
    views_count: 94,
    created_at: new Date(Date.now() - 3600000 * 22).toISOString(),
    attributes: {
      'Land Type': 'Residential Gated Layout',
      'Plot Extent': '1,200 Sq.Ft (30 x 40)',
      'Approvals': 'DTCP & HNTDA Approved',
      'Facing': 'North Facing',
      'Road Width': '30 Feet Blacktop Road',
      'Price Rate': '₹2,000 / Sq.Ft',
    },
    area_sqft: 1200,
  },
  {
    id: 'seed-iphone-14',
    title: 'Apple iPhone 14 128GB Midnight Blue with Original Box & Bill',
    slug: 'iphone-14-128gb-midnight-blue-hosur',
    category_id: 'mobiles',
    category: 'mobiles',
    subcategory_id: 'mobile-phones-tablets',
    subcategory: 'mobile-phones-tablets',
    listing_type: 'preowned',
    price: 46000,
    price_text: '₹46,000',
    is_negotiable: true,
    condition: 'Like New (Mint)',
    location_name: 'Bagalur Road, Hosur',
    location_text: 'Bagalur Road, Hosur',
    contact_name: 'Vignesh P',
    contact_phone: '9789123456',
    allow_whatsapp: true,
    images: ['https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=600'],
    description: '100% scratchless iPhone 14. Battery health 91%. Comes with original Apple charging cable, box and purchase invoice. Reason for sale: upgrading to 16 Pro.',
    status: 'active',
    views_count: 85,
    created_at: new Date(Date.now() - 3600000 * 28).toISOString(),
    attributes: {
      'Make / Brand': 'Apple',
      'Model': 'iPhone 14 (128 GB)',
      'Storage': '128 GB',
      'Battery Health': '91%',
      'Condition': 'Like New (Mint)',
      'Warranty': 'Out of Warranty (Tested OK)',
      'Bill & Box': 'Original Bill & Box Available',
    },
  },
  {
    id: 'seed-dell-laptop',
    title: 'Dell Latitude Core i7 11th Gen Laptop (16GB RAM / 512GB NVMe SSD)',
    slug: 'dell-latitude-core-i7-laptop-hosur',
    category_id: 'mobiles',
    category: 'mobiles',
    subcategory_id: 'computers-laptops',
    subcategory: 'computers-laptops',
    listing_type: 'preowned',
    price: 32000,
    price_text: '₹32,000',
    is_negotiable: true,
    condition: 'Excellent',
    location_name: 'Hosur Town Center',
    location_text: 'Hosur Town Center',
    contact_name: 'Ganesh Tech',
    contact_phone: '9842566778',
    allow_whatsapp: true,
    images: ['https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600'],
    description: 'Commercial corporate edition Dell Latitude 5420. Intel Core i7 11th Gen, 16GB DDR4 RAM, 512GB Fast SSD, FHD Anti-Glare display, backlit keyboard, 4-hour battery backup. Ideal for software development and CAD.',
    status: 'active',
    views_count: 64,
    created_at: new Date(Date.now() - 3600000 * 32).toISOString(),
    attributes: {
      'Make / Brand': 'Dell',
      'Model': 'Latitude 5420',
      'Processor': 'Intel Core i7 11th Gen',
      'RAM & Storage': '16GB RAM + 512GB SSD',
      'Condition': 'Excellent (Tested 100%)',
      'Battery Health': '4+ Hours Backup',
    },
  },
  {
    id: 'seed-samsung-fridge',
    title: 'Samsung 253L Inverter Double Door Refrigerator - 3 Star (Silver Steel)',
    slug: 'samsung-253l-double-door-refrigerator-hosur',
    category_id: 'electronics',
    category: 'electronics',
    subcategory_id: 'home-appliances',
    subcategory: 'home-appliances',
    listing_type: 'preowned',
    price: 16500,
    price_text: '₹16,500',
    is_negotiable: true,
    condition: 'Like New (Mint)',
    location_name: 'SIPCOT Phase 1, Hosur',
    location_text: 'SIPCOT Phase 1, Hosur',
    contact_name: 'Radhakrishnan',
    contact_phone: '9443899001',
    allow_whatsapp: true,
    images: ['https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600'],
    description: 'Digital Inverter Samsung Double Door Frost Free Refrigerator. 1.5 years sparingly used by expat couple moving abroad. No scratches, 100% cooling, with stabilizer included.',
    status: 'active',
    views_count: 73,
    created_at: new Date(Date.now() - 3600000 * 35).toISOString(),
    attributes: {
      'Make / Brand': 'Samsung',
      'Capacity': '253 Litres Double Door',
      'Technology': 'Digital Inverter (3 Star)',
      'Condition': 'Like New (Mint)',
      'Included': 'Toughened Glass Shelves + Stabilizer',
    },
  },
  {
    id: 'seed-l-shape-sofa',
    title: 'Modern 6-Seater Fabric L-Shape Sectional Sofa with Lounger & Cushions',
    slug: '6-seater-l-shape-fabric-sofa-hosur',
    category_id: 'furniture',
    category: 'furniture',
    subcategory_id: 'furniture-decor',
    subcategory: 'furniture-decor',
    listing_type: 'preowned',
    price: 18000,
    price_text: '₹18,000',
    is_negotiable: true,
    condition: 'Excellent',
    location_name: 'Mathigiri, Hosur',
    location_text: 'Mathigiri, Hosur',
    contact_name: 'Deepak V',
    contact_phone: '9842109876',
    allow_whatsapp: true,
    images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600'],
    description: 'Grey water-repellent suede fabric L-shape sofa with high density 32-density foam and solid neem wood frame. Very comfortable seating. Reason for sale: relocating.',
    status: 'active',
    views_count: 51,
    created_at: new Date(Date.now() - 3600000 * 38).toISOString(),
    attributes: {
      'Product': 'L-Shape Sectional Sofa',
      'Seating Capacity': '6 Seater (with Right Lounger)',
      'Material': 'High Density Foam + Suede Fabric',
      'Condition': 'Used - Excellent',
      'Dimensions': '8 ft x 5.5 ft',
    },
  },
  {
    id: 'seed-production-eng-job',
    title: 'CNC Machine Operators & Production Supervisors (SIPCOT Phase 2)',
    slug: 'cnc-machine-operator-supervisor-job-hosur',
    category_id: 'jobs',
    category: 'jobs',
    subcategory_id: 'factory-production',
    subcategory: 'factory-production',
    listing_type: 'job',
    price: 26000,
    price_text: '₹22,000 - ₹28,000 / Month',
    is_negotiable: false,
    location_name: 'SIPCOT Phase 2, Hosur',
    location_text: 'SIPCOT Phase 2, Hosur',
    contact_name: 'Apex Precision Engineering HR',
    contact_phone: '9841023456',
    allow_whatsapp: true,
    images: ['https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600'],
    description: 'Leading automotive component manufacturer in Hosur SIPCOT Phase 2 is hiring experienced CNC Milling/Turning operators and Line Supervisors. Immediate opening.',
    status: 'active',
    views_count: 112,
    created_at: new Date(Date.now() - 3600000 * 40).toISOString(),
    attributes: {
      'Designation': 'CNC Operator / Production Supervisor',
      'Company': 'Apex Precision Auto Components Ltd',
      'Industry': 'Automobile / Machine Shop',
      'Employment Type': 'Full-time (Rotational Shifts)',
      'Experience Required': '1 - 4 Years',
      'Education': 'Diploma (Mech) / ITI Machinist',
      'Work Location': 'On-site (SIPCOT Phase 2)',
    },
    job_type: 'Full-time',
  },
  {
    id: 'seed-electrical-service',
    title: 'Licensed Electrician & Home Wiring / Inverter Installation Services',
    slug: 'licensed-electrician-home-wiring-service-hosur',
    category_id: 'services',
    category: 'services',
    subcategory_id: 'home-repair',
    subcategory: 'home-repair',
    listing_type: 'service',
    price: 350,
    price_text: '₹350 / Service Visit',
    is_negotiable: false,
    location_name: 'Hosur Town & SIPCOT Areas',
    location_text: 'Hosur Town & SIPCOT Areas',
    contact_name: 'Senthil Electricals',
    contact_phone: '9443122334',
    allow_whatsapp: true,
    images: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600'],
    description: 'Government certified licensed electrician with 12+ years experience. Complete house wiring, MCB / DB box troubleshooting, inverter/UPS fitting, ceiling fan & geyser repairs. Fast doorstep service in 30 minutes across Hosur.',
    status: 'active',
    views_count: 89,
    created_at: new Date(Date.now() - 3600000 * 45).toISOString(),
    attributes: {
      'Service Scope': 'Residential & Commercial Electrical Works',
      'Pricing Model': '₹350 Basic Inspection / Hourly',
      'Warranty': '30-Day Workmanship Guarantee',
      'Response Time': 'Within 30-45 Minutes',
      'Areas Covered': 'Entire Hosur, SIPCOT 1 & 2, Mathigiri, Bagalur Rd',
    },
  },
];

export function sanitizeAdFields(ad: any) {
  if (!ad) return ad;
  const clean = { ...ad };
  const cat = (clean.category_id || clean.category || '').toLowerCase();

  if (cat === 'jobs') {
    delete clean.brand;
    delete clean.model;
    delete clean.year;
    delete clean.fuel_type;
    delete clean.km_driven;
    delete clean.transmission;
    delete clean.owners_count;
    delete clean.bhk;
    delete clean.area_sqft;
    delete clean.furnishing;
    delete clean.deposit_amount;
  } else if (cat === 'vehicles') {
    delete clean.bhk;
    delete clean.area_sqft;
    delete clean.furnishing;
    delete clean.deposit_amount;
    delete clean.job_type;
  } else if (cat === 'property' || cat === 'commercial') {
    delete clean.brand;
    delete clean.model;
    delete clean.year;
    delete clean.fuel_type;
    delete clean.km_driven;
    delete clean.transmission;
    delete clean.owners_count;
    delete clean.job_type;
  } else if (['mobiles', 'electronics', 'furniture', 'services', 'community', 'business'].includes(cat)) {
    delete clean.km_driven;
    delete clean.fuel_type;
    delete clean.transmission;
    delete clean.owners_count;
    delete clean.bhk;
    delete clean.area_sqft;
    delete clean.furnishing;
    delete clean.deposit_amount;
    delete clean.job_type;
  }
  return clean;
}

export const getLocalAds = (): any[] => {
  try {
    const raw = localStorage.getItem('urgenie_local_ads');
    let stored = raw ? JSON.parse(raw) : null;
    if (!stored || !Array.isArray(stored) || stored.length === 0) {
      stored = DEFAULT_SEED_ADS;
      localStorage.setItem('urgenie_local_ads', JSON.stringify(DEFAULT_SEED_ADS));
    } else {
      // Ensure seed ads are available alongside user-created ads
      const existingIds = new Set(stored.map((a: any) => a.id));
      const missingSeeds = DEFAULT_SEED_ADS.filter(seed => !existingIds.has(seed.id));
      if (missingSeeds.length > 0) {
        stored = [...stored, ...missingSeeds];
        localStorage.setItem('urgenie_local_ads', JSON.stringify(stored));
      }
    }
    const deletedIds = getDeletedAdIds();
    const sanitized = stored.map(sanitizeAdFields);
    return sanitized.filter((ad: any) => ad && ad.id && !deletedIds.has(ad.id) && (!ad.slug || !deletedIds.has(ad.slug)));
  } catch {
    return DEFAULT_SEED_ADS;
  }
};

export const saveLocalAd = (ad: any) => {
  try {
    const cleanAd = sanitizeAdFields(ad);
    const stored = getLocalAds();
    const filtered = stored.filter((a: any) => a.id !== cleanAd.id && a.slug !== cleanAd.slug);
    localStorage.setItem('urgenie_local_ads', JSON.stringify([cleanAd, ...filtered]));
  } catch (err) {
    console.warn('Error saving local ad:', err);
  }
};

/**
 * Increment views count for an advertisement and return the updated count.
 */
export const incrementAdViews = (idOrSlug: string): number => {
  try {
    const raw = localStorage.getItem('urgenie_local_ads');
    if (!raw) return 1;
    const ads = JSON.parse(raw);
    let updatedViews = 1;
    const updated = ads.map((ad: any) => {
      if (ad.id === idOrSlug || ad.slug === idOrSlug) {
        const nextViews = (ad.views_count || 0) + 1;
        updatedViews = nextViews;
        return { ...ad, views_count: nextViews };
      }
      return ad;
    });
    localStorage.setItem('urgenie_local_ads', JSON.stringify(updated));
    return updatedViews;
  } catch {
    return 1;
  }
};

/**
 * Update advertisement status (e.g., active -> sold) in local storage.
 */
export const updateAdStatusInLocalStorage = (idOrSlug: string, status: 'active' | 'sold' | 'pending' | 'deleted') => {
  try {
    const raw = localStorage.getItem('urgenie_local_ads');
    if (!raw) return;
    const ads = JSON.parse(raw);
    const updated = ads.map((ad: any) => {
      if (ad.id === idOrSlug || ad.slug === idOrSlug) {
        return { ...ad, status };
      }
      return ad;
    });
    localStorage.setItem('urgenie_local_ads', JSON.stringify(updated));
  } catch (err) {
    console.warn('Error updating ad status:', err);
  }
};


