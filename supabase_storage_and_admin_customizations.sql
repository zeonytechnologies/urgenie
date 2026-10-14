-- ==============================================================================
-- URGENIE: Supabase Storage Buckets (ad-images & avatars) + Admin Customizations
-- Run this in Supabase SQL Editor to enable real image uploads & custom categories/locations
-- ==============================================================================

-- 1. Create Storage Buckets for Ad Images and Profile Avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('ad-images', 'ad-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg']),
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Enable Storage RLS Policies for Public Viewing and Fast Uploads
DROP POLICY IF EXISTS "Public Access to ad-images" ON storage.objects;
CREATE POLICY "Public Access to ad-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'ad-images');

DROP POLICY IF EXISTS "Allow Uploads to ad-images" ON storage.objects;
CREATE POLICY "Allow Uploads to ad-images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'ad-images');

DROP POLICY IF EXISTS "Allow Delete ad-images" ON storage.objects;
CREATE POLICY "Allow Delete ad-images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'ad-images');

DROP POLICY IF EXISTS "Public Access to avatars" ON storage.objects;
CREATE POLICY "Public Access to avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Allow Uploads to avatars" ON storage.objects;
CREATE POLICY "Allow Uploads to avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Allow Updates to avatars" ON storage.objects;
CREATE POLICY "Allow Updates to avatars"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars');

-- 3. Ensure Table Schemas & Columns for Custom Categories and Locations
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;

ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Hosur';

-- 4. Enable RLS Policies so Admin can Insert, Update, Delete Categories & Locations
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on categories" ON public.categories;
CREATE POLICY "Allow public read on categories" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin modify categories" ON public.categories;
CREATE POLICY "Allow admin modify categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on locations" ON public.locations;
CREATE POLICY "Allow public read on locations" ON public.locations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin modify locations" ON public.locations;
CREATE POLICY "Allow admin modify locations" ON public.locations FOR ALL USING (true) WITH CHECK (true);

-- 5. Enable Permissive Profile Updates
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Profiles: allow updates" ON public.profiles;
CREATE POLICY "Profiles: allow updates"
  ON public.profiles FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 6. Enforce Unique Email and Mobile Number (1 account per email, 1 account per phone number)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_unique_email ON public.profiles (LOWER(email)) WHERE email IS NOT NULL AND email <> '';
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_unique_phone ON public.profiles (phone) WHERE phone IS NOT NULL AND phone <> '';

-- 7. Auto-confirm all users in Supabase Auth (ensures instant login without email confirmation block)
UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;

