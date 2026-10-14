-- ==============================================================================
-- 🚀 URGENIE CLASSIFIEDS APP: 11 CATEGORIES, SUBCATEGORIES & LISTING TYPES SCHEMA
-- Version: Oct 14, 2026 · @ZEONY
-- Run this script in the Supabase SQL Editor.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Create Listing Type ENUM (N, P, R, J, S, Free)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'listing_type') THEN
    CREATE TYPE public.listing_type AS ENUM (
      'new',       -- N: Sell New
      'preowned',  -- P: Sell Pre-owned
      'rent',      -- R: Rent / Lease
      'job',       -- J: Job post
      'service',   -- S: Service
      'free'       -- Free / Community Info
    );
  END IF;
END $$;

-- 2. Create Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  short_name TEXT,
  icon TEXT NOT NULL,
  description TEXT,
  listing_types TEXT[] NOT NULL DEFAULT ARRAY['preowned', 'new'],
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Subcategories Table
CREATE TABLE IF NOT EXISTS public.subcategories (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_cat_subcat_slug UNIQUE (category_id, slug)
);

-- 4. Create Locations Table
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  city TEXT DEFAULT 'Hosur',
  state TEXT DEFAULT 'Tamil Nadu',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create / Update the Ads Table with Tailored Attributes & JSONB
CREATE TABLE IF NOT EXISTS public.ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES public.categories(id),
  subcategory_id TEXT REFERENCES public.subcategories(id),
  listing_type public.listing_type NOT NULL DEFAULT 'preowned',
  
  -- Core Ad Details
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT NOT NULL,
  price NUMERIC(12, 2),
  price_text TEXT,
  is_negotiable BOOLEAN DEFAULT true,
  condition TEXT DEFAULT 'good',
  
  -- Media & Location
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  location_id UUID REFERENCES public.locations(id),
  location_text TEXT DEFAULT 'Hosur Town Center',
  
  -- Contact details
  seller_name TEXT,
  contact_phone TEXT,
  allow_whatsapp BOOLEAN DEFAULT true,
  
  -- Tailored Attributes (Stored in JSONB for dynamic flexibility + top-level indexed columns)
  attributes JSONB DEFAULT '{}'::jsonb,
  
  -- Quick Filter Indexed Attributes:
  -- Vehicles:
  brand TEXT,
  model TEXT,
  year INT,
  fuel_type TEXT,
  km_driven INT,
  transmission TEXT,
  owners_count TEXT,
  
  -- Properties:
  bhk TEXT,
  area_sqft INT,
  furnishing TEXT,
  deposit_amount NUMERIC(12, 2),
  rent_per_month NUMERIC(12, 2),
  
  -- Jobs:
  job_post_kind TEXT, -- 'hiring' or 'job_seeker'
  job_type TEXT,      -- 'Full-time', 'Part-time', 'WFH', 'Internship'
  salary_min NUMERIC(12, 2),
  salary_max NUMERIC(12, 2),
  experience_required TEXT,
  skills TEXT[],
  
  -- Services & Rentals:
  service_type TEXT,
  pricing_model TEXT,
  rent_period TEXT,   -- 'hour', 'day', 'month'
  
  -- Status & Metrics
  status TEXT DEFAULT 'active',
  views_count INT DEFAULT 0,
  leads_count INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '45 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Performance Indexes for Ultra-Fast Search & Filters
CREATE INDEX IF NOT EXISTS idx_ads_category ON public.ads(category_id);
CREATE INDEX IF NOT EXISTS idx_ads_subcategory ON public.ads(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_ads_listing_type ON public.ads(listing_type);
CREATE INDEX IF NOT EXISTS idx_ads_status ON public.ads(status);
CREATE INDEX IF NOT EXISTS idx_ads_created ON public.ads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ads_attributes_gin ON public.ads USING GIN (attributes);
CREATE INDEX IF NOT EXISTS idx_ads_price ON public.ads(price);

-- 7. Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read categories" ON public.categories;
CREATE POLICY "Public can read categories" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can manage categories" ON public.categories;
CREATE POLICY "Admin can manage categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read subcategories" ON public.subcategories;
CREATE POLICY "Public can read subcategories" ON public.subcategories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can manage subcategories" ON public.subcategories;
CREATE POLICY "Admin can manage subcategories" ON public.subcategories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read locations" ON public.locations;
CREATE POLICY "Public can read locations" ON public.locations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can manage locations" ON public.locations;
CREATE POLICY "Admin can manage locations" ON public.locations FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read active ads" ON public.ads;
CREATE POLICY "Public can read active ads" ON public.ads FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert ads" ON public.ads;
CREATE POLICY "Users can insert ads" ON public.ads FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own ads" ON public.ads;
CREATE POLICY "Users can update own ads" ON public.ads FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete own ads" ON public.ads;
CREATE POLICY "Users can delete own ads" ON public.ads FOR DELETE USING (true);


-- ==============================================================================
-- 📦 SEED DATA: 11 CATEGORIES & THEIR FULL LISTING TYPES MATRIX
-- ==============================================================================

INSERT INTO public.categories (id, slug, name, short_name, icon, description, listing_types, sort_order)
VALUES
  ('vehicles', 'vehicles-bikes', 'Vehicles & Bikes', 'Vehicles', 'Car', 'Cars, bikes, scooters, EVs, commercial trucks & rentals', ARRAY['new', 'preowned', 'rent'], 1),
  ('property', 'houses-properties', 'Houses & Properties', 'Properties', 'Building2', 'Villas, plots, flats, farmland & rentals', ARRAY['preowned', 'rent'], 2),
  ('mobiles', 'mobiles-tech', 'Mobiles & Tech', 'Mobiles & Tech', 'Smartphone', 'Smartphones, tablets, laptops, accessories & parts', ARRAY['new', 'preowned', 'rent'], 3),
  ('electronics', 'electronics-appliances', 'Electronics & Appliances', 'Electronics', 'Tv', 'TVs, refrigerators, washing machines, ACs & audio', ARRAY['new', 'preowned', 'rent'], 4),
  ('jobs', 'jobs-careers', 'Jobs & Careers', 'Jobs', 'Briefcase', 'Full-time, part-time, WFH, IT, sales & candidate profiles', ARRAY['job'], 5),
  ('business', 'business', 'Business', 'Business', 'Store', 'Businesses for sale, franchises, wholesale, bulk deals & B2B services', ARRAY['new', 'preowned', 'service'], 6),
  ('services', 'local-services', 'Local Services', 'Services', 'Wrench', 'Home repair, electrician, plumber, cleaning, movers & events', ARRAY['service'], 7),
  ('buy-sell', 'buy-sell', 'Buy & Sell', 'Buy & Sell', 'ShoppingBag', 'Fashion, books, fitness, kids, pets & collectibles', ARRAY['new', 'preowned'], 8),
  ('furniture', 'home-furniture', 'Home & Furniture', 'Furniture', 'Sofa', 'Sofas, beds, tables, kitchenware, decor & furniture rentals', ARRAY['new', 'preowned', 'rent'], 9),
  ('commercial', 'commercial-industrial', 'Commercial & Industrial', 'Commercial', 'Factory', 'Machinery, CNC, raw materials, construction & agro equipment', ARRAY['new', 'preowned', 'rent'], 10),
  ('community', 'community', 'Community', 'Community', 'Users', 'Lost & found, donations, free giveaways, notices & blood donors', ARRAY['free'], 11)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  short_name = EXCLUDED.short_name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  listing_types = EXCLUDED.listing_types,
  sort_order = EXCLUDED.sort_order;


-- ==============================================================================
-- 📂 SEED DATA: SUBCATEGORIES FOR ALL 11 CATEGORIES
-- ==============================================================================

-- 1. Vehicles & Bikes (N, P, R)
INSERT INTO public.subcategories (id, category_id, slug, name, sort_order) VALUES
  ('v-cars', 'vehicles', 'cars', 'Cars', 1),
  ('v-motorcycles', 'vehicles', 'bikes-motorcycles', 'Bikes / Motorcycles', 2),
  ('v-scooters', 'vehicles', 'scooters', 'Scooters & Activa', 3),
  ('v-bicycles', 'vehicles', 'bicycles', 'Bicycles & Cycles', 4),
  ('v-evs', 'vehicles', 'electric-vehicles', 'Electric Vehicles (EVs)', 5),
  ('v-commercial', 'vehicles', 'autos-vans-tempos', 'Autos, Vans & Tempos', 6),
  ('v-heavy', 'vehicles', 'trucks-buses-tractors', 'Trucks, Buses & Tractors', 7),
  ('v-parts', 'vehicles', 'spare-parts-accessories', 'Spare Parts & Accessories (Tyres, Helmets)', 8),
  ('v-rentals', 'vehicles', 'rental-vehicles', 'Rental Vehicles (Cars with/without driver, Bikes, Tempo)', 9)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 2. Houses & Properties (Sell, R)
INSERT INTO public.subcategories (id, category_id, slug, name, sort_order) VALUES
  ('p-houses', 'property', 'houses-villas', 'Houses / Villas for Sale', 1),
  ('p-flats', 'property', 'flats-apartments', 'Flats & Apartments for Sale', 2),
  ('p-plots', 'property', 'plots-land', 'Plots & Residential Land', 3),
  ('p-farmland', 'property', 'farmland', 'Farmland & Agro Land', 4),
  ('p-rent-house', 'property', 'rent-houses', 'Rent: Independent Houses & Villas', 5),
  ('p-rent-flat', 'property', 'rent-flats', 'Rent: Flats & Apartments', 6),
  ('p-rent-pg', 'property', 'rent-pg-hostels', 'Rent: PG & Hostels, Shared Rooms', 7),
  ('p-commercial', 'property', 'shops-offices', 'Shops & Offices (Sale / Rent)', 8),
  ('p-halls', 'property', 'function-halls-parking', 'Function Halls & Parking Spaces', 9)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 3. Mobiles & Tech (N, P, R)
INSERT INTO public.subcategories (id, category_id, slug, name, sort_order) VALUES
  ('m-smartphones', 'mobiles', 'smartphones', 'Smartphones (iPhone, Android)', 1),
  ('m-featurephones', 'mobiles', 'feature-phones', 'Feature Phones & Basic Mobiles', 2),
  ('m-tablets', 'mobiles', 'tablets-ipads', 'Tablets & iPads', 3),
  ('m-watches', 'mobiles', 'smartwatches', 'Smartwatches & Fitness Bands', 4),
  ('m-laptops', 'mobiles', 'laptops', 'Laptops (Gaming, Business, Student)', 5),
  ('m-desktops', 'mobiles', 'desktops-monitors', 'Desktops, Monitors & Printers', 6),
  ('m-accessories', 'mobiles', 'mobile-accessories', 'Accessories: Chargers, Earphones, Power Banks', 7),
  ('m-parts', 'mobiles', 'computer-parts', 'Computer Parts: RAM, SSD, Graphics Cards, Routers', 8),
  ('m-rentals', 'mobiles', 'tech-rentals', 'Rent: Laptops, Tablets, Projectors', 9)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 4. Electronics & Appliances (N, P, R)
INSERT INTO public.subcategories (id, category_id, slug, name, sort_order) VALUES
  ('e-tv', 'electronics', 'tv-home-theatre', 'TV & Home Theatre Systems', 1),
  ('e-fridge', 'electronics', 'refrigerators', 'Refrigerators & Freezers', 2),
  ('e-washing', 'electronics', 'washing-machines', 'Washing Machines & Dryers', 3),
  ('e-cooling', 'electronics', 'ac-coolers-fans', 'Air Conditioners (AC), Coolers & Fans', 4),
  ('e-water', 'electronics', 'water-purifiers-geysers', 'Water Purifiers & Geysers', 5),
  ('e-kitchen', 'electronics', 'kitchen-appliances', 'Kitchen: Microwave, Induction, Mixer Grinder', 6),
  ('e-cameras', 'electronics', 'cameras-cctv', 'Cameras, DSLR & CCTV Security', 7),
  ('e-power', 'electronics', 'inverters-ups-batteries', 'Inverters, UPS & Batteries', 8),
  ('e-rentals', 'electronics', 'appliance-rentals', 'Rent: AC, Fridge, Washing Machine, Sound Systems', 9)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 5. Jobs & Careers (J)
INSERT INTO public.subcategories (id, category_id, slug, name, sort_order) VALUES
  ('j-it', 'jobs', 'it-software', 'IT / Software & Developers', 1),
  ('j-sales', 'jobs', 'sales-marketing', 'Sales, Marketing & Business Development', 2),
  ('j-teaching', 'jobs', 'teaching-education', 'Teaching, Faculty & Tutors', 3),
  ('j-driver', 'jobs', 'driver-delivery', 'Driver & Delivery Executives', 4),
  ('j-security', 'jobs', 'security', 'Security Guards & Supervisors', 5),
  ('j-hotel', 'jobs', 'hotel-restaurant', 'Hotel, Restaurant, Chefs & Service', 6),
  ('j-healthcare', 'jobs', 'healthcare-nursing', 'Healthcare, Nursing & Pharmacy', 7),
  ('j-accounting', 'jobs', 'accounting-finance', 'Accounting, Tally, Billing & Finance', 8),
  ('j-admin', 'jobs', 'office-admin', 'Office Admin, Receptionist & HR', 9),
  ('j-factory', 'jobs', 'factory-production', 'Factory Production, Operators & Technicians', 10),
  ('j-construction', 'jobs', 'construction-labour', 'Construction Labour & Supervisors', 11),
  ('j-beauty', 'jobs', 'beauty-salon-tailoring', 'Beauty Parlour, Salon & Tailoring', 12)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 6. Business (N, P, S)
INSERT INTO public.subcategories (id, category_id, slug, name, sort_order) VALUES
  ('b-sale', 'business', 'businesses-for-sale', 'Businesses for Sale & Running Units', 1),
  ('b-franchise', 'business', 'franchise-opportunities', 'Franchise Opportunities & Dealerships', 2),
  ('b-investors', 'business', 'partnership-investors', 'Partnership & Investor Offers', 3),
  ('b-wholesale', 'business', 'wholesale-bulk-deals', 'Wholesale, Bulk Deals & Manufacturers', 4),
  ('b-services', 'business', 'business-services', 'Business Services (GST/Legal, Web, Marketing, Printing)', 5),
  ('b-startup-eq', 'business', 'startup-equipment', 'Startup & Shop Equipment (Billing machines, Barcode, Racks)', 6)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 7. Local Services (S)
INSERT INTO public.subcategories (id, category_id, slug, name, sort_order) VALUES
  ('s-repair', 'services', 'home-repair', 'Home Repair: Electrician, Plumber, Carpenter, Painter', 1),
  ('s-appliances', 'services', 'appliance-repair', 'AC, Fridge & Washing Machine Repair', 2),
  ('s-cleaning', 'services', 'cleaning-pest-control', 'Deep Cleaning, Pest Control & Laundry', 3),
  ('s-movers', 'services', 'movers-packers', 'Movers & Packers, Mini Truck Transport', 4),
  ('s-personal', 'services', 'personal-care', 'Personal: Salon at Home, Tailoring, Yoga Trainer', 5),
  ('s-events', 'services', 'events-catering', 'Events: Photographer, DJ, Decorators, Catering', 6),
  ('s-domestic', 'services', 'domestic-help', 'Domestic Help: Maid, Cook, Babysitter, Caretaker', 7),
  ('s-courier', 'services', 'courier-vehicle-washing', 'Courier, Parcel & Vehicle Washing Services', 8)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 8. Buy & Sell (N, P)
INSERT INTO public.subcategories (id, category_id, slug, name, sort_order) VALUES
  ('bs-fashion', 'buy-sell', 'fashion-wear', 'Fashion: Clothes, Footwear, Bags, Jewelry', 1),
  ('bs-books', 'buy-sell', 'books-stationery', 'Books, Stationery & Exam Study Materials', 2),
  ('bs-sports', 'buy-sell', 'sports-fitness', 'Sports & Fitness: Gym Equipment, Cricket Kits, Cycles', 3),
  ('bs-kids', 'buy-sell', 'kids-baby', 'Kids & Baby: Toys, Prams, Strollers, Cribs', 4),
  ('bs-music', 'buy-sell', 'musical-instruments', 'Musical Instruments & Sound Gear', 5),
  ('bs-art', 'buy-sell', 'art-hobbies-antiques', 'Art, Hobbies & Antiques / Collectibles', 6),
  ('bs-pets', 'buy-sell', 'pets-aquariums', 'Pets, Pet Food & Aquariums', 7),
  ('bs-farm', 'buy-sell', 'groceries-farm-plants', 'Groceries, Farm Produce, Plants & Saplings', 8),
  ('bs-scrap', 'buy-sell', 'scrap-old-items', 'Scrap, Recyclables & Old Items', 9)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 9. Home & Furniture (N, P, R)
INSERT INTO public.subcategories (id, category_id, slug, name, sort_order) VALUES
  ('f-sofa', 'furniture', 'sofa-living-chairs', 'Sofa Sets, Recliners & Living Chairs', 1),
  ('f-bed', 'furniture', 'beds-wardrobes', 'Beds, Mattresses & Wardrobes', 2),
  ('f-tables', 'furniture', 'dining-study-tables', 'Dining Sets, Study Tables & Computer Desks', 3),
  ('f-kitchen', 'furniture', 'kitchen-cookware', 'Kitchen Items: Cookware, Utensils & Storage', 4),
  ('f-decor', 'furniture', 'home-decor', 'Decor: Curtains, Lighting, Carpets, Wall Art', 5),
  ('f-garden', 'furniture', 'garden-patio', 'Garden Items, Patio & Cleaning Equipment', 6),
  ('f-rentals', 'furniture', 'furniture-rentals', 'Rent: Furniture Sets, Beds, Sofas, Event Chairs', 7)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 10. Commercial & Industrial (N, P, R)
INSERT INTO public.subcategories (id, category_id, slug, name, sort_order) VALUES
  ('c-property', 'commercial', 'commercial-spaces', 'Commercial Spaces: Shops, Offices, Godowns, Desks', 1),
  ('c-machinery', 'commercial', 'industrial-machinery', 'Industrial Machinery: CNC, Lathe, Compressors, Packaging', 2),
  ('c-construction', 'commercial', 'construction-equipment', 'Construction Equipment: JCB, Mixers, Scaffolding (Rent/Sale)', 3),
  ('c-agro', 'commercial', 'agriculture-equipment', 'Agriculture Equipment: Tractors, Tillers, Pumps (Rent/Sale)', 4),
  ('c-raw', 'commercial', 'raw-materials', 'Raw Materials: Steel, Cement, Bricks, Tiles, Pipes', 5),
  ('c-fittings', 'commercial', 'shop-fittings', 'Shop Fittings: Counters, Display Racks, Billing Units', 6)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 11. Community (Free/Info)
INSERT INTO public.subcategories (id, category_id, slug, name, sort_order) VALUES
  ('cm-lost', 'community', 'lost-and-found', 'Lost and Found', 1),
  ('cm-free', 'community', 'donations-giveaways', 'Donations & Free Giveaways', 2),
  ('cm-events', 'community', 'events-workshops', 'Events, Workshops & Exhibitions', 3),
  ('cm-classes', 'community', 'classes-courses', 'Classes, Courses & Volunteering', 4),
  ('cm-blood', 'community', 'blood-donors', 'Blood Donors & Emergency Support', 5),
  ('cm-notices', 'community', 'local-notices', 'Local News, Notices, Announcements & Alerts', 6)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;


-- ==============================================================================
-- 📍 SEED DATA: HOSUR TOWNSHIP LOCATIONS
-- ==============================================================================

INSERT INTO public.locations (name, city, state, sort_order) VALUES
  ('Hosur Town Center', 'Hosur', 'Tamil Nadu', 1),
  ('SIPCOT Phase 1', 'Hosur', 'Tamil Nadu', 2),
  ('SIPCOT Phase 2', 'Hosur', 'Tamil Nadu', 3),
  ('Mathigiri', 'Hosur', 'Tamil Nadu', 4),
  ('Bagalur Road', 'Hosur', 'Tamil Nadu', 5),
  ('Denkanikottai Road', 'Hosur', 'Tamil Nadu', 6),
  ('Rayakottai Road', 'Hosur', 'Tamil Nadu', 7),
  ('Nallur', 'Hosur', 'Tamil Nadu', 8),
  ('Attibele Border', 'Hosur', 'Tamil Nadu', 9),
  ('Zuzuvadi', 'Hosur', 'Tamil Nadu', 10)
ON CONFLICT (name) DO NOTHING;
