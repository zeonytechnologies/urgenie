-- =====================================================================
-- 🚀 URGENIE CUSTOM DATABASE AUTHENTICATION SCHEMA
-- Direct Email & Password Authentication in public.profiles Table
-- Solves Supabase "Email rate limit exceeded" and "Email not confirmed"
-- =====================================================================

-- 1. Ensure pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Modify public.profiles table to act as the primary authentication table
-- Drop foreign key constraint referencing auth.users if it exists
DO $$ BEGIN
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Make id generate a UUID by default if not supplied
ALTER TABLE public.profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 3. Ensure all necessary columns exist on public.profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Hosur, Tamil Nadu';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_phone_verified BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS allow_whatsapp BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 4. Unique Indexes to enforce: 1 Account per Email, 1 Account per Mobile Number
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email_unique ON public.profiles(LOWER(email)) WHERE email IS NOT NULL AND email <> '';
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_phone_unique ON public.profiles(phone) WHERE phone IS NOT NULL AND phone <> '';

-- 5. Drop any problematic triggers on auth.users that cause errors during registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 6. Configure Row Level Security (RLS) on public.profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop previous conflicting policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: insert trigger allow" ON public.profiles;
DROP POLICY IF EXISTS "Allow anon read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow anon insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow anon update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles allow all" ON public.profiles;

-- Allow public/anon access for direct app authentication
CREATE POLICY "Profiles allow select"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Profiles allow insert"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Profiles allow update"
  ON public.profiles FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Profiles allow delete"
  ON public.profiles FOR DELETE
  USING (true);

-- 7. Seed Default Admin and User Accounts
INSERT INTO public.profiles (
  id,
  full_name,
  email,
  phone,
  password,
  role,
  city,
  is_phone_verified,
  is_email_verified,
  allow_whatsapp,
  bio
)
VALUES 
  (
    '5e1b8333-4982-4614-9b54-f585689f7ed1',
    'Admin User',
    'admin@urgenie.com',
    '9876543210',
    'password123',
    'admin',
    'Hosur Town Center, Tamil Nadu',
    true,
    true,
    true,
    'Official Urgenie Platform Administrator'
  ),
  (
    'd12fc73e-2b3c-4371-b22c-ce3181ec864a',
    'Regular User',
    'user@urgenie.com',
    '9876543212',
    'password123',
    'user',
    'Mathigiri, Hosur',
    true,
    true,
    true,
    'Verified Classifieds Community Member'
  )
ON CONFLICT (id) DO UPDATE SET
  password = COALESCE(EXCLUDED.password, profiles.password),
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone;

-- 8. Grant table permissions to anon and authenticated roles
GRANT ALL ON TABLE public.profiles TO anon;
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.profiles TO service_role;
