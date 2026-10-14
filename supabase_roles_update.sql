-- ============================================================
-- EXPATRIATES — Role-Based Auth Migration & Admin Utilities
-- Run this in Supabase SQL Editor AFTER supabase_schema.sql
-- ============================================================

-- 1. Create user role enum if not exists
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'seller', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add role column to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'user' NOT NULL;

-- 3. Update the handle_new_user trigger to set role from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, city, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', NEW.phone),
    COALESCE(NEW.raw_user_meta_data->>'city', 'Hosur'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'user')
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    phone = COALESCE(EXCLUDED.phone, profiles.phone),
    role = COALESCE(EXCLUDED.role, profiles.role);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Enable RLS policy for Admin to update/delete ANY ad
DROP POLICY IF EXISTS "Ads: admins can update any" ON public.ads;
CREATE POLICY "Ads: admins can update any"
  ON public.ads FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Ads: admins can delete any" ON public.ads;
CREATE POLICY "Ads: admins can delete any"
  ON public.ads FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 5. Enable RLS policy for Admin to view/resolve reports
DROP POLICY IF EXISTS "Reports: admins can view all" ON public.reports;
CREATE POLICY "Reports: admins can view all"
  ON public.reports FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Reports: admins can update" ON public.reports;
CREATE POLICY "Reports: admins can update"
  ON public.reports FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 6. Helper function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 🔑 USEFUL SQL SNIPPETS FOR SUPABASE SQL EDITOR
-- ============================================================

-- A. HOW TO PROMOTE A USER TO ADMIN BY EMAIL:
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE email = 'your_admin_email@example.com';

-- B. HOW TO PROMOTE A USER TO SELLER BY EMAIL:
-- UPDATE public.profiles
-- SET role = 'seller'
-- WHERE email = 'your_seller_email@example.com';

-- C. HOW TO DIRECTLY RESET/UPDATE ANY USER'S PASSWORD IN SUPABASE SQL:
-- (Requires pgcrypto extension enabled in extensions tab)
-- UPDATE auth.users
-- SET encrypted_password = crypt('YourNewSecretPassword123!', gen_salt('bf'))
-- WHERE email = 'user@example.com';

-- D. HOW TO CONFIRM USER EMAIL DIRECTLY (Bypass email verification):
-- UPDATE auth.users
-- SET email_confirmed_at = now()
-- WHERE email = 'user@example.com';

-- ============================================================
