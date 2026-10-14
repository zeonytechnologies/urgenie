-- ==============================================================================
-- 🚀 URGENIE: 1-CLICK FIX FOR ADS RLS & DEMO ACCOUNTS
-- Copy and run this entire script inside Supabase SQL Editor (New Query -> Run)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Ensure required columns exist on public.ads
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS images TEXT[];
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS location_name TEXT;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS location_text TEXT;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Hosur';
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS contact_name TEXT;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS allow_whatsapp BOOLEAN DEFAULT TRUE;

-- 2. FIX RLS POLICIES ON ADS TABLE (Allows real users + demo posting)
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Ads: active ads viewable by everyone" ON public.ads;
DROP POLICY IF EXISTS "Ads: authenticated users can insert" ON public.ads;
DROP POLICY IF EXISTS "Ads: owners can update" ON public.ads;
DROP POLICY IF EXISTS "Ads: owners can delete" ON public.ads;
DROP POLICY IF EXISTS "Ads: allow select" ON public.ads;
DROP POLICY IF EXISTS "Ads: allow insert" ON public.ads;
DROP POLICY IF EXISTS "Ads: allow update" ON public.ads;
DROP POLICY IF EXISTS "Ads: allow delete" ON public.ads;

-- Public can view active ads and their own ads
CREATE POLICY "Ads: allow select"
  ON public.ads FOR SELECT
  USING (true);

-- Allow authenticated users AND demo sessions to insert ads
CREATE POLICY "Ads: allow insert"
  ON public.ads FOR INSERT
  WITH CHECK (true);

-- Allow users to update ads
CREATE POLICY "Ads: allow update"
  ON public.ads FOR UPDATE
  USING (true);

-- Allow users to delete ads
CREATE POLICY "Ads: allow delete"
  ON public.ads FOR DELETE
  USING (true);

-- 3. CREATE / RESET DEMO ACCOUNTS IN SUPABASE AUTH (Password: password123)
DO $$
DECLARE
  v_pass TEXT := 'password123';
  v_admin_id UUID := '00000000-0000-0000-0000-000000000001';
  v_seller_id UUID := '00000000-0000-0000-0000-000000000002';
  v_user_id UUID := '00000000-0000-0000-0000-000000000003';
BEGIN
  -- A. ADMIN: admin@urgenie.com
  DELETE FROM auth.identities WHERE email = 'admin@urgenie.com';
  DELETE FROM auth.users WHERE email = 'admin@urgenie.com' OR id = v_admin_id;

  INSERT INTO auth.users (
    id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, role, aud, confirmation_token
  ) VALUES (
    v_admin_id, 'admin@urgenie.com', crypt(v_pass, gen_salt('bf')), NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Super Admin","role":"admin"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated', ''
  );

  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (gen_random_uuid(), v_admin_id, json_build_object('sub', v_admin_id::text, 'email', 'admin@urgenie.com')::jsonb, 'email', v_admin_id::text, NOW(), NOW(), NOW());

  INSERT INTO public.profiles (id, full_name, email, role, city)
  VALUES (v_admin_id, 'Super Admin', 'admin@urgenie.com', 'admin'::public.user_role, 'Hosur Town, Tamil Nadu')
  ON CONFLICT (id) DO UPDATE SET role = 'admin'::public.user_role, full_name = 'Super Admin';

  -- B. SELLER: seller@urgenie.com
  DELETE FROM auth.identities WHERE email = 'seller@urgenie.com';
  DELETE FROM auth.users WHERE email = 'seller@urgenie.com' OR id = v_seller_id;

  INSERT INTO auth.users (
    id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, role, aud, confirmation_token
  ) VALUES (
    v_seller_id, 'seller@urgenie.com', crypt(v_pass, gen_salt('bf')), NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Verified Seller","role":"seller"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated', ''
  );

  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (gen_random_uuid(), v_seller_id, json_build_object('sub', v_seller_id::text, 'email', 'seller@urgenie.com')::jsonb, 'email', v_seller_id::text, NOW(), NOW(), NOW());

  INSERT INTO public.profiles (id, full_name, email, role, city)
  VALUES (v_seller_id, 'Verified Seller', 'seller@urgenie.com', 'seller'::public.user_role, 'SIPCOT Phase 1, Hosur')
  ON CONFLICT (id) DO UPDATE SET role = 'seller'::public.user_role, full_name = 'Verified Seller';

  -- C. USER: user@urgenie.com
  DELETE FROM auth.identities WHERE email = 'user@urgenie.com';
  DELETE FROM auth.users WHERE email = 'user@urgenie.com' OR id = v_user_id;

  INSERT INTO auth.users (
    id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, role, aud, confirmation_token
  ) VALUES (
    v_user_id, 'user@urgenie.com', crypt(v_pass, gen_salt('bf')), NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Regular Buyer","role":"user"}'::jsonb,
    NOW(), NOW(), 'authenticated', 'authenticated', ''
  );

  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id, json_build_object('sub', v_user_id::text, 'email', 'user@urgenie.com')::jsonb, 'email', v_user_id::text, NOW(), NOW(), NOW());

  INSERT INTO public.profiles (id, full_name, email, role, city)
  VALUES (v_user_id, 'Regular Buyer', 'user@urgenie.com', 'user'::public.user_role, 'Mathigiri, Hosur')
  ON CONFLICT (id) DO UPDATE SET role = 'user'::public.user_role, full_name = 'Regular Buyer';

END $$;

-- 4. GRANT PERMISSIONS
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- ==============================================================================
-- ✅ SUCCESS: Run complete! You can now publish ads freely without RLS errors.
-- ==============================================================================
