-- ==============================================================================
-- URGENIE: Real Initial Seed Data for Hosur Marketplace
-- Run this in Supabase SQL Editor to populate live listings & categories
-- ==============================================================================

-- 1. Ensure required columns exist on public.ads
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS images TEXT[];
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS location_name TEXT;

-- 2. Ensure Categories exist (matching schema: id, name, icon, sort_order)
INSERT INTO public.categories (id, name, icon, sort_order)
VALUES
  ('vehicles',    'Vehicles & Bikes',         'Car',        1),
  ('property',    'Houses & Properties',     'Building2',  2),
  ('mobiles',     'Mobiles & Tech',           'Smartphone', 3),
  ('electronics', 'Electronics & Appliances', 'Tv',         4),
  ('jobs',        'Jobs & Careers',           'Briefcase',  5),
  ('services',    'Local Services',           'Wrench',     6),
  ('furniture',   'Home & Furniture',         'Sofa',       7),
  ('commercial',  'Commercial & Industrial',  'Store',      8)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order;

-- 3. Populate live listings for Hosur
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Pick an existing profile ID if any, or create a default platform profile
  SELECT id INTO v_user_id FROM public.profiles LIMIT 1;
  
  -- If no profiles exist yet, we can attach to auth.users or skip foreign key requirement
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users LIMIT 1;
  END IF;

  -- Insert Real Initial Classifieds for Hosur
  INSERT INTO public.ads (
    user_id,
    title,
    slug,
    category_id,
    description,
    price,
    is_negotiable,
    condition,
    location_name,
    location_text,
    contact_phone,
    allow_whatsapp,
    images,
    status,
    is_featured,
    views_count,
    created_at
  )
  VALUES
    (
      v_user_id,
      'Royal Enfield Classic 350 - Stealth Black 2022 Single Owner',
      'royal-enfield-classic-350-stealth-black-2022',
      'vehicles',
      'Mint condition Royal Enfield Classic 350 Stealth Black with dual-channel ABS. Single owner, 18,500 km driven with complete showroom service records at Hosur Royal Enfield service center. New tubeless tyres, zero scratches, valid comprehensive insurance up to Nov 2027.',
      145000,
      true,
      'like_new',
      'Hosur Town Center',
      'Hosur Town Center',
      '9843210987',
      true,
      ARRAY['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80'],
      'active',
      true,
      142,
      NOW() - INTERVAL '2 hours'
    ),
    (
      v_user_id,
      '2 BHK Independent House for Rent near SIPCOT Phase 1',
      '2-bhk-independent-house-for-rent-sipcot-phase-1',
      'property',
      'Spacious 2 BHK independent ground floor house available for immediate rent in quiet residential layout near SIPCOT Phase 1, Hosur. 24/7 Borewell and Cauvery water, covered 2-wheeler and car parking, vastu compliant, walkable distance to tech parks and bus stop.',
      12500,
      false,
      'good',
      'SIPCOT Phase 1',
      'SIPCOT Phase 1',
      '9894123456',
      true,
      ARRAY['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=80'],
      'active',
      true,
      285,
      NOW() - INTERVAL '5 hours'
    ),
    (
      v_user_id,
      'iPhone 14 Pro Max 256GB Space Black (Battery Health 94%)',
      'iphone-14-pro-max-256gb-space-black',
      'mobiles',
      'Apple iPhone 14 Pro Max 256GB in pristine condition. Bill, original box and Apple 20W fast charging cable available. No dents or scratches, always used with Spigen case and tempered glass. Face ID and True Tone 100% working.',
      62000,
      true,
      'like_new',
      'Mathigiri, Hosur',
      'Mathigiri, Hosur',
      '9789012345',
      true,
      ARRAY['https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=800&auto=format&fit=crop&q=80'],
      'active',
      false,
      98,
      NOW() - INTERVAL '1 day'
    ),
    (
      v_user_id,
      'CNC VMC Machine Operators & Programmers Wanted (Urgent)',
      'cnc-vmc-machine-operators-programmers-urgent',
      'jobs',
      'Leading automotive component manufacturing unit in SIPCOT Phase 2 Hosur hiring experienced CNC & VMC Machine Operators and Fanuc/Siemens Programmers. Day & Night rotational shifts. Minimum 1-3 years experience in CNC turning/milling. Attractive salary + ESI + PF + OT benefits.',
      24000,
      false,
      'new',
      'SIPCOT Phase 2',
      'SIPCOT Phase 2',
      '9443567890',
      true,
      ARRAY['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'],
      'active',
      false,
      176,
      NOW() - INTERVAL '1 day'
    ),
    (
      v_user_id,
      'Industrial Warehouse & Shed (8,000 Sq.Ft) for Lease',
      'industrial-warehouse-shed-8000-sqft-lease-hosur',
      'property',
      'Heavy industrial shed with 100 HP sanctioned power, 30-feet ceiling height, heavy duty concrete flooring, overhead crane provision, separate office cabin and security room. Located just 1.5 km from NH44 Bangalore-Hosur highway with direct 40ft container truck access.',
      120000,
      true,
      'good',
      'Bagalur Road, Hosur',
      'Bagalur Road, Hosur',
      '9629123456',
      true,
      ARRAY['https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80'],
      'active',
      true,
      312,
      NOW() - INTERVAL '2 days'
    ),
    (
      v_user_id,
      'Sony Bravia 55 inch 4K Ultra HD Smart Google TV',
      'sony-bravia-55-inch-4k-ultra-hd-smart-tv',
      'electronics',
      'Sony Bravia 55-inch 4K HDR Google TV in excellent condition. Dolby Atmos, 4 HDMI ports, crystal clear Triluminos display. Less than 1.5 years old, selling due to relocation. Wall mount and smart voice remote included.',
      38000,
      true,
      'like_new',
      'Denkanikottai Road',
      'Denkanikottai Road',
      '9842109876',
      true,
      ARRAY['https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&auto=format&fit=crop&q=80'],
      'active',
      false,
      73,
      NOW() - INTERVAL '3 days'
    )
  ON CONFLICT (slug) DO NOTHING;
END $$;
