-- ============================================================
-- 🔑 DIRECT SQL: CREATE USERS WITH PLAIN TEXT PASSWORDS
-- Run this in Supabase SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Create a helper function to create any user with a PLAIN TEXT password
CREATE OR REPLACE FUNCTION public.create_custom_user(
  p_email TEXT,
  p_password TEXT,
  p_full_name TEXT DEFAULT 'User',
  p_role TEXT DEFAULT 'user',
  p_phone TEXT DEFAULT '',
  p_city TEXT DEFAULT 'Hosur, Tamil Nadu'
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
  v_role public.user_role;
BEGIN
  -- Parse role
  BEGIN
    v_role := p_role::public.user_role;
  EXCEPTION WHEN OTHERS THEN
    v_role := 'user'::public.user_role;
  END;

  -- Delete existing auth record if email exists to avoid conflicts
  DELETE FROM auth.users WHERE email = p_email;

  -- Generate ID
  v_user_id := gen_random_uuid();

  -- Insert into auth.users (encrypts plain text password automatically)
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    role,
    aud,
    confirmation_token
  ) VALUES (
    v_user_id,
    p_email,
    crypt(p_password, gen_salt('bf', 10)),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    json_build_object('full_name', p_full_name, 'role', p_role, 'phone', p_phone, 'city', p_city)::jsonb,
    NOW(),
    NOW(),
    'authenticated',
    'authenticated',
    ''
  );

  -- Insert into auth.identities
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    v_user_id,
    json_build_object('sub', v_user_id::text, 'email', p_email)::jsonb,
    'email',
    v_user_id::text,
    NOW(),
    NOW(),
    NOW()
  );

  -- Insert into public.profiles
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    phone,
    city,
    role
  ) VALUES (
    v_user_id,
    p_full_name,
    p_email,
    p_phone,
    p_city,
    v_role
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    city = EXCLUDED.city,
    role = EXCLUDED.role;

  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. CREATE THE 3 ACCOUNTS (PLAIN TEXT PASSWORDS)
-- Just call the function with your plain text password:

-- ADMIN:
SELECT public.create_custom_user(
  'admin@urgenie.com',     -- email
  'password123',           -- plain text password
  'Admin User',            -- full name
  'admin',                 -- role (admin, seller, user)
  '9876543210',            -- phone
  'Hosur Town, Tamil Nadu' -- city
);

-- SELLER:
SELECT public.create_custom_user(
  'seller@urgenie.com',    -- email
  'password123',           -- plain text password
  'Verified Seller',       -- full name
  'seller',                -- role
  '9876543211',            -- phone
  'SIPCOT Phase 1, Hosur'  -- city
);

-- USER:
SELECT public.create_custom_user(
  'user@urgenie.com',      -- email
  'password123',           -- plain text password
  'Regular Buyer',         -- full name
  'user',                  -- role
  '9876543212',            -- phone
  'Mathigiri, Hosur'       -- city
);


-- 3. Verify they were created:
SELECT id, email, role, full_name, created_at FROM public.profiles;
