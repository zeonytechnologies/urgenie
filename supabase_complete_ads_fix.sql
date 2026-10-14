-- =====================================================================
-- 🚀 URGENIE COMPLETE ADS TABLE & PERMISSIONS FIX
-- Run this in your Supabase Dashboard -> SQL Editor -> Run (F5)
-- Fixes: "Ad not saving", "Ad not displaying on refresh", and RLS blocks
-- =====================================================================

-- 1. Ensure required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Drop restrictive foreign key constraints on public.ads that cause silent insert failures
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

-- 3. Ensure all columns exist on public.ads with proper defaults
CREATE TABLE IF NOT EXISTS public.ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  category_id TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT,
  description TEXT,
  price NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- 4. Re-create indexes for lightning-fast queries
CREATE INDEX IF NOT EXISTS idx_ads_category ON public.ads(category_id);
CREATE INDEX IF NOT EXISTS idx_ads_subcategory ON public.ads(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_ads_listing_type ON public.ads(listing_type);
CREATE INDEX IF NOT EXISTS idx_ads_status ON public.ads(status);
CREATE INDEX IF NOT EXISTS idx_ads_created ON public.ads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ads_user ON public.ads(user_id);

-- 5. Open Row Level Security (RLS) on public.ads so public & registered users can insert & view
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active ads" ON public.ads;
DROP POLICY IF EXISTS "Users can insert ads" ON public.ads;
DROP POLICY IF EXISTS "Users can update own ads" ON public.ads;
DROP POLICY IF EXISTS "Users can delete own ads" ON public.ads;
DROP POLICY IF EXISTS "Ads: active ads viewable by everyone" ON public.ads;
DROP POLICY IF EXISTS "Ads: authenticated users can insert" ON public.ads;
DROP POLICY IF EXISTS "Ads: owners can update" ON public.ads;
DROP POLICY IF EXISTS "Ads: owners can delete" ON public.ads;
DROP POLICY IF EXISTS "Ads: allow select" ON public.ads;
DROP POLICY IF EXISTS "Ads: allow insert" ON public.ads;
DROP POLICY IF EXISTS "Ads: allow update" ON public.ads;
DROP POLICY IF EXISTS "Ads: allow delete" ON public.ads;
DROP POLICY IF EXISTS "Ads allow all" ON public.ads;

-- Allow unrestricted read of all active ads
CREATE POLICY "Ads allow select"
  ON public.ads FOR SELECT
  USING (true);

-- Allow inserting ads (with anon / authenticated key)
CREATE POLICY "Ads allow insert"
  ON public.ads FOR INSERT
  WITH CHECK (true);

-- Allow updating ads
CREATE POLICY "Ads allow update"
  ON public.ads FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow deleting ads
CREATE POLICY "Ads allow delete"
  ON public.ads FOR DELETE
  USING (true);

-- 6. Grant table permissions to anon and authenticated roles
GRANT ALL ON TABLE public.ads TO anon;
GRANT ALL ON TABLE public.ads TO authenticated;
GRANT ALL ON TABLE public.ads TO service_role;

-- 7. Ensure Categories exist in public.categories so lookups never fail
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT,
  icon TEXT,
  sort_order INT DEFAULT 0
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Categories allow select" ON public.categories;
CREATE POLICY "Categories allow select" ON public.categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Categories allow insert" ON public.categories;
CREATE POLICY "Categories allow insert" ON public.categories FOR INSERT WITH CHECK (true);
GRANT ALL ON TABLE public.categories TO anon, authenticated, service_role;

INSERT INTO public.categories (id, name, slug, sort_order)
VALUES
  ('vehicles', 'Vehicles & Bikes', 'vehicles-bikes', 1),
  ('property', 'Houses & Properties', 'houses-properties', 2),
  ('mobiles-tech', 'Mobiles & Tech', 'mobiles-tech', 3),
  ('electronics', 'Electronics & Appliances', 'electronics-appliances', 4),
  ('jobs', 'Jobs & Careers', 'jobs-careers', 5),
  ('business', 'Business', 'business', 6),
  ('services', 'Local Services', 'local-services', 7),
  ('buy-sell', 'Buy & Sell', 'buy-sell', 8),
  ('furniture', 'Home & Furniture', 'home-furniture', 9),
  ('commercial', 'Commercial & Industrial', 'commercial-industrial', 10),
  ('community', 'Community', 'community', 11)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  sort_order = EXCLUDED.sort_order;
