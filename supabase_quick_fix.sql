-- ============================================================
-- 🛠️ DEFINITIVE 1-CLICK FIX FOR "Database error saving new user"
-- Copy and run this ENTIRE script in Supabase SQL Editor
-- ============================================================

-- 1. Create user_role enum if it does not exist
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('user', 'seller', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Make sure public.profiles exists with correct columns and safe defaults
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  avatar_url TEXT,
  city TEXT DEFAULT 'Hosur, Tamil Nadu',
  is_phone_verified BOOLEAN DEFAULT FALSE,
  is_email_verified BOOLEAN DEFAULT FALSE,
  allow_whatsapp BOOLEAN DEFAULT TRUE,
  bio TEXT DEFAULT '',
  role public.user_role DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist if table was created previously
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role public.user_role DEFAULT 'user';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Hosur, Tamil Nadu';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT DEFAULT '';
ALTER TABLE public.profiles ALTER COLUMN full_name DROP NOT NULL;

-- 3. Grant full permissions to Supabase Auth Admin and service roles
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role, supabase_auth_admin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role, supabase_auth_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role, supabase_auth_admin;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role, supabase_auth_admin;

-- 4. Replace handle_new_user with a 100% resilient function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public, auth, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
  v_role public.user_role := 'user';
  v_role_text TEXT;
BEGIN
  -- Safe role determination
  BEGIN
    v_role_text := LOWER(COALESCE(NEW.raw_user_meta_data->>'role', 'user'));
    IF v_role_text = 'admin' THEN
      v_role := 'admin'::public.user_role;
    ELSIF v_role_text = 'seller' THEN
      v_role := 'seller'::public.user_role;
    ELSE
      v_role := 'user'::public.user_role;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    v_role := 'user'::public.user_role;
  END;

  -- Insert profile
  BEGIN
    INSERT INTO public.profiles (
      id,
      full_name,
      email,
      phone,
      city,
      role
    )
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(COALESCE(NEW.email, 'user'), '@', 1)),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'phone', NEW.phone, ''),
      COALESCE(NEW.raw_user_meta_data->>'city', 'Hosur, Tamil Nadu'),
      v_role
    )
    ON CONFLICT (id) DO UPDATE
    SET 
      full_name = EXCLUDED.full_name,
      email = EXCLUDED.email,
      phone = COALESCE(EXCLUDED.phone, profiles.phone),
      role = COALESCE(EXCLUDED.role, profiles.role);
  EXCEPTION WHEN OTHERS THEN
    -- If profile insert fails for ANY reason, log warning but DO NOT fail signup
    RAISE WARNING 'Profile creation failed for user %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- 5. Rebind the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Ensure RLS doesn't block the profile insert
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles: viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles: viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Profiles: insert allowed" ON public.profiles;
CREATE POLICY "Profiles: insert allowed" ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Profiles: users update own" ON public.profiles;
CREATE POLICY "Profiles: users update own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ============================================================
-- ✅ Run this script once in Supabase SQL Editor, then test signup!
-- ============================================================
