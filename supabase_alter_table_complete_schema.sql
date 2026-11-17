-- =====================================================================
-- 🚀 URGENIE COMPLETE IDEMPOTENT "ALTER TABLE" MIGRATION SCHEMA
-- Run this in your Supabase Dashboard -> SQL Editor -> Run (F5)
-- Safe to run repeatedly: uses ADD COLUMN IF NOT EXISTS & drops blocking constraints.
-- =====================================================================

-- 0. Enable cryptographic extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================================
-- 1. ALTER TABLE: public.categories
-- Fixes: "column 'slug' does not exist", "null value in column 'icon'", etc.
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'Tag';
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS short_name TEXT;

-- Drop any restrictive NOT NULL constraints that block category inserts/updates
DO $$ BEGIN
  ALTER TABLE public.categories ALTER COLUMN icon DROP NOT NULL;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.categories ALTER COLUMN slug DROP NOT NULL;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.categories ALTER COLUMN description DROP NOT NULL;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Categories allow select" ON public.categories;
CREATE POLICY "Categories allow select" ON public.categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Categories allow insert" ON public.categories;
CREATE POLICY "Categories allow insert" ON public.categories FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Categories allow update" ON public.categories;
CREATE POLICY "Categories allow update" ON public.categories FOR UPDATE USING (true) WITH CHECK (true);
GRANT ALL ON TABLE public.categories TO anon, authenticated, service_role;

-- Seed / Update primary categories
INSERT INTO public.categories (id, name, slug, icon, sort_order)
VALUES
  ('vehicles', 'Vehicles & Bikes', 'vehicles-bikes', 'Car', 1),
  ('property', 'Houses & Properties', 'houses-properties', 'Building2', 2),
  ('mobiles-tech', 'Mobiles & Tech', 'mobiles-tech', 'Smartphone', 3),
  ('electronics', 'Electronics & Appliances', 'electronics-appliances', 'Tv', 4),
  ('jobs', 'Jobs & Careers', 'jobs-careers', 'Briefcase', 5),
  ('business', 'Business', 'business', 'Store', 6),
  ('services', 'Local Services', 'local-services', 'Wrench', 7),
  ('buy-sell', 'Buy & Sell', 'buy-sell', 'ShoppingBag', 8),
  ('furniture', 'Home & Furniture', 'home-furniture', 'Sofa', 9),
  ('commercial', 'Commercial & Industrial', 'commercial-industrial', 'Factory', 10),
  ('community', 'Community', 'community', 'Users', 11)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  icon = COALESCE(EXCLUDED.icon, categories.icon, 'Tag'),
  sort_order = EXCLUDED.sort_order;


-- =====================================================================
-- 2. ALTER TABLE: public.locations
-- Enables user custom locations, Hosur localities, and directory lookups
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE
);

ALTER TABLE public.locations ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Hosur';
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'Tamil Nadu';
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Locations allow select" ON public.locations;
CREATE POLICY "Locations allow select" ON public.locations FOR SELECT USING (true);
DROP POLICY IF EXISTS "Locations allow insert" ON public.locations;
CREATE POLICY "Locations allow insert" ON public.locations FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Locations allow update" ON public.locations;
CREATE POLICY "Locations allow update" ON public.locations FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Locations allow delete" ON public.locations;
CREATE POLICY "Locations allow delete" ON public.locations FOR DELETE USING (true);
GRANT ALL ON TABLE public.locations TO anon, authenticated, service_role;

-- Seed essential Hosur localities
INSERT INTO public.locations (name, city, state, sort_order)
VALUES
  ('Hosur Town Center', 'Hosur', 'Tamil Nadu', 1),
  ('SIPCOT Phase 1', 'Hosur', 'Tamil Nadu', 2),
  ('SIPCOT Phase 2', 'Hosur', 'Tamil Nadu', 3),
  ('Mathigiri', 'Hosur', 'Tamil Nadu', 4),
  ('Bagalur Road', 'Hosur', 'Tamil Nadu', 5),
  ('Denkanikottai Road', 'Hosur', 'Tamil Nadu', 6),
  ('Rayakottai Road', 'Hosur', 'Tamil Nadu', 7),
  ('Thally Road', 'Hosur', 'Tamil Nadu', 8),
  ('Avalapalli Road', 'Hosur', 'Tamil Nadu', 9),
  ('Alasanatham Road', 'Hosur', 'Tamil Nadu', 10),
  ('Mookandapalli', 'Hosur', 'Tamil Nadu', 11),
  ('Nallur', 'Hosur', 'Tamil Nadu', 12),
  ('Mornapalli', 'Hosur', 'Tamil Nadu', 13),
  ('Zuzuvadi', 'Hosur', 'Tamil Nadu', 14),
  ('Attibele Border', 'Hosur', 'Tamil Nadu', 15),
  ('Kamraj Nagar', 'Hosur', 'Tamil Nadu', 16),
  ('Shanthi Nagar', 'Hosur', 'Tamil Nadu', 17),
  ('Railway Station Road', 'Hosur', 'Tamil Nadu', 18)
ON CONFLICT (name) DO NOTHING;


-- =====================================================================
-- 3. ALTER TABLE: public.profiles
-- Supports Direct Database Auth, Custom Locations & User Profiles
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT
);

-- Drop auth.users FK constraint to allow direct custom database accounts
DO $$ BEGIN
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE public.profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Hosur Town, Tamil Nadu';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_phone_verified BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS allow_whatsapp BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email_unique ON public.profiles(LOWER(email)) WHERE email IS NOT NULL AND email <> '';
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_phone_unique ON public.profiles(phone) WHERE phone IS NOT NULL AND phone <> '';

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Profiles allow select" ON public.profiles;
CREATE POLICY "Profiles allow select" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Profiles allow insert" ON public.profiles;
CREATE POLICY "Profiles allow insert" ON public.profiles FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Profiles allow update" ON public.profiles;
CREATE POLICY "Profiles allow update" ON public.profiles FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Profiles allow delete" ON public.profiles;
CREATE POLICY "Profiles allow delete" ON public.profiles FOR DELETE USING (true);
GRANT ALL ON TABLE public.profiles TO anon, authenticated, service_role;


-- =====================================================================
-- 4. ALTER TABLE: public.ads
-- Supports all 11 Classified Categories, Photos, Specs & Contact Numbers
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category_id TEXT NOT NULL
);

-- Drop restrictive FK constraints that cause silent post failure
DO $$ BEGIN
  ALTER TABLE public.ads DROP CONSTRAINT IF EXISTS ads_user_id_fkey;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.ads DROP CONSTRAINT IF EXISTS ads_category_id_fkey;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.ads DROP CONSTRAINT IF EXISTS ads_location_id_fkey;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE public.ads ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS category_id TEXT;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS subcategory_id TEXT;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS listing_type TEXT DEFAULT 'preowned';
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS price NUMERIC(12,2) DEFAULT 0;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS price_text TEXT;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS is_negotiable BOOLEAN DEFAULT false;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS condition TEXT DEFAULT 'good';
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS location_name TEXT DEFAULT 'Hosur Town Center';
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS location_text TEXT;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS location_id UUID;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS contact_name TEXT;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS allow_whatsapp BOOLEAN DEFAULT true;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS attributes JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS views_count INT DEFAULT 0;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Common category-indexed columns
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS model TEXT;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS year INT;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS fuel_type TEXT;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS km_driven INT;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS transmission TEXT;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS owners_count TEXT;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS bhk TEXT;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS area_sqft INT;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS furnishing TEXT;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC(12,2);
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS job_type TEXT;

-- Fast query indexes
CREATE INDEX IF NOT EXISTS idx_ads_category ON public.ads(category_id);
CREATE INDEX IF NOT EXISTS idx_ads_subcategory ON public.ads(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_ads_listing_type ON public.ads(listing_type);
CREATE INDEX IF NOT EXISTS idx_ads_status ON public.ads(status);
CREATE INDEX IF NOT EXISTS idx_ads_created ON public.ads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ads_user ON public.ads(user_id);

ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Ads allow select" ON public.ads;
CREATE POLICY "Ads allow select" ON public.ads FOR SELECT USING (true);
DROP POLICY IF EXISTS "Ads allow insert" ON public.ads;
CREATE POLICY "Ads allow insert" ON public.ads FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Ads allow update" ON public.ads;
CREATE POLICY "Ads allow update" ON public.ads FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Ads allow delete" ON public.ads;
CREATE POLICY "Ads allow delete" ON public.ads FOR DELETE USING (true);
GRANT ALL ON TABLE public.ads TO anon, authenticated, service_role;


-- =====================================================================
-- 5. ALTER TABLE: public.saved_ads & public.reports
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.saved_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  ad_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_saved_ad UNIQUE (user_id, ad_id)
);

ALTER TABLE public.saved_ads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Saved ads allow all" ON public.saved_ads;
CREATE POLICY "Saved ads allow all" ON public.saved_ads FOR ALL USING (true) WITH CHECK (true);
GRANT ALL ON TABLE public.saved_ads TO anon, authenticated, service_role;

CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID NOT NULL,
  reporter_id UUID,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Reports allow all" ON public.reports;
CREATE POLICY "Reports allow all" ON public.reports FOR ALL USING (true) WITH CHECK (true);
GRANT ALL ON TABLE public.reports TO anon, authenticated, service_role;


-- =====================================================================
-- 6. Storage Buckets (ad-images, avatars)
-- =====================================================================
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('ad-images', 'ad-images', true)
  ON CONFLICT (id) DO UPDATE SET public = true;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('avatars', 'avatars', true)
  ON CONFLICT (id) DO UPDATE SET public = true;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Public Access to ad-images" ON storage.objects;
  CREATE POLICY "Public Access to ad-images" ON storage.objects FOR SELECT USING (bucket_id = 'ad-images');
  DROP POLICY IF EXISTS "Allow Uploads to ad-images" ON storage.objects;
  CREATE POLICY "Allow Uploads to ad-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'ad-images');
  DROP POLICY IF EXISTS "Allow Delete ad-images" ON storage.objects;
  CREATE POLICY "Allow Delete ad-images" ON storage.objects FOR DELETE USING (bucket_id = 'ad-images');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

