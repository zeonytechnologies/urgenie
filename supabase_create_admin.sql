-- ============================================================
-- 👑 CREATE ADMIN ACCOUNT (NO INSTANCE_ID — 100% ERROR-FREE)
-- Run this in Supabase SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_id UUID := gen_random_uuid();
BEGIN
  -- Delete old user if exists
  DELETE FROM auth.users WHERE email = 'admin@urgenie.com';

  -- Insert new user
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
    v_id,
    'admin@urgenie.com',
    crypt('password123', gen_salt('bf', 10)),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Admin User","role":"admin"}'::jsonb,
    NOW(),
    NOW(),
    'authenticated',
    'authenticated',
    ''
  );

  -- Insert identity
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
    v_id,
    json_build_object('sub', v_id::text, 'email', 'admin@urgenie.com')::jsonb,
    'email',
    v_id::text,
    NOW(),
    NOW(),
    NOW()
  );

  -- Insert / update profile
  INSERT INTO public.profiles (id, full_name, email, role, city)
  VALUES (v_id, 'Admin User', 'admin@urgenie.com', 'admin'::public.user_role, 'Hosur, Tamil Nadu')
  ON CONFLICT (id) DO UPDATE SET role = 'admin'::public.user_role;
END $$;

-- Verify creation
SELECT id, email, role, full_name, created_at FROM public.profiles WHERE email = 'admin@urgenie.com';
