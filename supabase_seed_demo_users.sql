-- ============================================================
-- 🚀 CREATE / RESET ALL 3 DEMO ACCOUNTS (Password: password123)
-- Run this in Supabase SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Create or reset ADMIN: admin@oru.local / password123
DO $$
DECLARE
  v_user_id UUID;
  v_email TEXT := 'admin@oru.local';
  v_pass TEXT := 'password123';
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
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
      v_email,
      crypt(v_pass, gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Admin User","role":"admin"}'::jsonb,
      NOW(),
      NOW(),
      'authenticated',
      'authenticated',
      ''
    );

    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), v_user_id, json_build_object('sub', v_user_id::text, 'email', v_email)::jsonb, 'email', v_user_id::text, NOW(), NOW(), NOW());
  ELSE
    -- If user already exists, update password and confirm email
    UPDATE auth.users
    SET 
      encrypted_password = crypt(v_pass, gen_salt('bf')),
      email_confirmed_at = NOW(),
      raw_user_meta_data = '{"full_name":"Admin User","role":"admin"}'::jsonb
    WHERE id = v_user_id;
  END IF;

  -- Ensure profile
  INSERT INTO public.profiles (id, full_name, email, role, city)
  VALUES (v_user_id, 'Admin User', v_email, 'admin'::public.user_role, 'Hosur, Tamil Nadu')
  ON CONFLICT (id) DO UPDATE SET role = 'admin'::public.user_role;
END $$;


-- 2. Create or reset SELLER: seller@oru.local / password123
DO $$
DECLARE
  v_user_id UUID;
  v_email TEXT := 'seller@oru.local';
  v_pass TEXT := 'password123';
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
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
      v_email,
      crypt(v_pass, gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Verified Seller","role":"seller"}'::jsonb,
      NOW(),
      NOW(),
      'authenticated',
      'authenticated',
      ''
    );

    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), v_user_id, json_build_object('sub', v_user_id::text, 'email', v_email)::jsonb, 'email', v_user_id::text, NOW(), NOW(), NOW());
  ELSE
    UPDATE auth.users
    SET 
      encrypted_password = crypt(v_pass, gen_salt('bf')),
      email_confirmed_at = NOW(),
      raw_user_meta_data = '{"full_name":"Verified Seller","role":"seller"}'::jsonb
    WHERE id = v_user_id;
  END IF;

  INSERT INTO public.profiles (id, full_name, email, role, city)
  VALUES (v_user_id, 'Verified Seller', v_email, 'seller'::public.user_role, 'SIPCOT Phase 1, Hosur')
  ON CONFLICT (id) DO UPDATE SET role = 'seller'::public.user_role;
END $$;


-- 3. Create or reset USER: user@oru.local / password123
DO $$
DECLARE
  v_user_id UUID;
  v_email TEXT := 'user@oru.local';
  v_pass TEXT := 'password123';
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
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
      v_email,
      crypt(v_pass, gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Regular Buyer","role":"user"}'::jsonb,
      NOW(),
      NOW(),
      'authenticated',
      'authenticated',
      ''
    );

    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), v_user_id, json_build_object('sub', v_user_id::text, 'email', v_email)::jsonb, 'email', v_user_id::text, NOW(), NOW(), NOW());
  ELSE
    UPDATE auth.users
    SET 
      encrypted_password = crypt(v_pass, gen_salt('bf')),
      email_confirmed_at = NOW(),
      raw_user_meta_data = '{"full_name":"Regular Buyer","role":"user"}'::jsonb
    WHERE id = v_user_id;
  END IF;

  INSERT INTO public.profiles (id, full_name, email, role, city)
  VALUES (v_user_id, 'Regular Buyer', v_email, 'user'::public.user_role, 'Hosur Town, Tamil Nadu')
  ON CONFLICT (id) DO UPDATE SET role = 'user'::public.user_role;
END $$;

-- Verify all 3 accounts
SELECT email, role, full_name, created_at FROM public.profiles WHERE email IN ('admin@oru.local', 'seller@oru.local', 'user@oru.local');
