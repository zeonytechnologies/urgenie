-- ============================================================
-- EXPATRIATES (ORU) — Complete Supabase SQL Schema
-- Run this entire file inside Supabase SQL Editor (one shot)
-- ============================================================

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 0. EXTENSIONS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";   -- uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS "pg_trgm";     -- fuzzy text search


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. CUSTOM TYPES (ENUMS)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TYPE ad_status AS ENUM ('active', 'pending', 'expired', 'sold', 'rejected', 'deleted');
CREATE TYPE ad_condition AS ENUM ('new', 'like_new', 'good', 'fair', 'for_parts');
CREATE TYPE report_reason AS ENUM ('spam', 'fraud', 'inappropriate', 'duplicate', 'wrong_category', 'other');
CREATE TYPE message_status AS ENUM ('sent', 'delivered', 'read');


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. PROFILES (extends Supabase auth.users)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       TEXT NOT NULL,
  phone           TEXT,
  email           TEXT,
  avatar_url      TEXT,
  city            TEXT DEFAULT 'Hosur, Tamil Nadu',
  is_phone_verified BOOLEAN DEFAULT FALSE,
  is_email_verified BOOLEAN DEFAULT FALSE,
  allow_whatsapp  BOOLEAN DEFAULT TRUE,
  bio             TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast phone lookups
CREATE INDEX idx_profiles_phone ON public.profiles(phone);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', NEW.phone)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3. CATEGORIES
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE public.categories (
  id          TEXT PRIMARY KEY,           -- slug: 'jobs', 'property', etc.
  name        TEXT NOT NULL,
  icon        TEXT NOT NULL,              -- Lucide icon name
  sort_order  INT DEFAULT 0,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Sub-categories (optional tree)
CREATE TABLE public.subcategories (
  id          TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  sort_order  INT DEFAULT 0,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subcategories_category ON public.subcategories(category_id);

-- Seed the categories from your mock data
INSERT INTO public.categories (id, name, icon, sort_order) VALUES
  ('jobs',        'Jobs',        'Briefcase',  1),
  ('property',    'Property',    'Building2',  2),
  ('vehicles',    'Vehicles',    'Car',        3),
  ('electronics', 'Electronics', 'Smartphone', 4),
  ('services',    'Services',    'Wrench',     5),
  ('business',    'Business',    'Store',      6),
  ('buy-sell',    'Buy & Sell',  'Tag',        7),
  ('community',   'Community',   'Users',      8);


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 4. LOCATIONS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE public.locations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,       -- 'Hosur Town', 'SIPCOT Phase 1', etc.
  city        TEXT DEFAULT 'Hosur',
  state       TEXT DEFAULT 'Tamil Nadu',
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.locations (name) VALUES
  ('Hosur Town'),
  ('SIPCOT Phase 1'),
  ('SIPCOT Phase 2'),
  ('Mathigiri'),
  ('Bagalur Road'),
  ('Denkanikottai Road'),
  ('Rayakottai Road'),
  ('Nallur'),
  ('Bommasandra'),
  ('Shoolagiri');


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 5. ADS (the main listings table)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE public.ads (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id     TEXT NOT NULL REFERENCES public.categories(id),
  subcategory_id  TEXT REFERENCES public.subcategories(id),
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  description     TEXT NOT NULL,
  price           NUMERIC(12, 2),
  price_text      TEXT,                     -- freeform: '₹8-12 LPA', 'Negotiable'
  is_negotiable   BOOLEAN DEFAULT FALSE,
  condition       ad_condition,
  brand           TEXT,
  year            INT,
  location_id     UUID REFERENCES public.locations(id),
  location_text   TEXT,                     -- fallback / denormalised
  contact_name    TEXT,
  contact_phone   TEXT,
  allow_whatsapp  BOOLEAN DEFAULT TRUE,
  status          ad_status DEFAULT 'pending',
  views_count     INT DEFAULT 0,
  is_featured     BOOLEAN DEFAULT FALSE,
  expires_at      TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-generate slug from title
CREATE OR REPLACE FUNCTION public.generate_ad_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INT := 0;
BEGIN
  -- Create base slug from title
  base_slug := LOWER(REGEXP_REPLACE(TRIM(NEW.title), '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := TRIM(BOTH '-' FROM base_slug);
  final_slug := base_slug;

  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM public.ads WHERE slug = final_slug AND id != NEW.id) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;

  NEW.slug := final_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ads_generate_slug
  BEFORE INSERT OR UPDATE OF title ON public.ads
  FOR EACH ROW EXECUTE FUNCTION public.generate_ad_slug();

-- Auto-set published_at when status becomes active
CREATE OR REPLACE FUNCTION public.set_published_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' AND OLD.status != 'active' THEN
    NEW.published_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ads_set_published_at
  BEFORE UPDATE OF status ON public.ads
  FOR EACH ROW EXECUTE FUNCTION public.set_published_at();

CREATE TRIGGER ads_updated_at
  BEFORE UPDATE ON public.ads
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

-- Indexes for common queries
CREATE INDEX idx_ads_user       ON public.ads(user_id);
CREATE INDEX idx_ads_category   ON public.ads(category_id);
CREATE INDEX idx_ads_status     ON public.ads(status);
CREATE INDEX idx_ads_location   ON public.ads(location_id);
CREATE INDEX idx_ads_created    ON public.ads(created_at DESC);
CREATE INDEX idx_ads_price      ON public.ads(price);
CREATE INDEX idx_ads_slug       ON public.ads(slug);

-- Full-text search index
CREATE INDEX idx_ads_search ON public.ads USING GIN (
  to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(description, ''))
);


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 6. AD IMAGES
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE public.ad_images (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_id       UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  image_url   TEXT NOT NULL,
  storage_path TEXT,                       -- Supabase Storage path
  sort_order  INT DEFAULT 0,              -- first = cover image
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ad_images_ad ON public.ad_images(ad_id, sort_order);


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 7. SAVED / FAVOURITED ADS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE public.saved_ads (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ad_id       UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, ad_id)
);

CREATE INDEX idx_saved_ads_user ON public.saved_ads(user_id);


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 8. IN-APP MESSAGES / CONVERSATIONS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE public.conversations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_id       UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  buyer_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ad_id, buyer_id)
);

CREATE INDEX idx_conversations_buyer  ON public.conversations(buyer_id);
CREATE INDEX idx_conversations_seller ON public.conversations(seller_id);

CREATE TABLE public.messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  status          message_status DEFAULT 'sent',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at);

-- Update conversation.last_message_at on new message
CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER messages_update_conversation
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.update_conversation_last_message();


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 9. AD REPORTS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE public.reports (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_id       UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason      report_reason NOT NULL,
  details     TEXT,
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ad_id, reporter_id)  -- one report per user per ad
);


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 10. AD VIEW TRACKING (analytics)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE public.ad_views (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_id       UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  viewer_id   UUID REFERENCES public.profiles(id),  -- NULL for anonymous
  ip_address  INET,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ad_views_ad ON public.ad_views(ad_id);

-- Increment ads.views_count on view
CREATE OR REPLACE FUNCTION public.increment_ad_views()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.ads
  SET views_count = views_count + 1
  WHERE id = NEW.ad_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ad_views_increment
  AFTER INSERT ON public.ad_views
  FOR EACH ROW EXECUTE FUNCTION public.increment_ad_views();


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 11. USEFUL VIEWS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Ads with first image + seller info (used on Browse, Home, etc.)
CREATE OR REPLACE VIEW public.ads_with_details AS
SELECT
  a.*,
  p.full_name        AS seller_name,
  p.avatar_url       AS seller_avatar,
  p.is_phone_verified AS seller_verified,
  c.name             AS category_name,
  c.icon             AS category_icon,
  l.name             AS location_name,
  (
    SELECT ai.image_url
    FROM public.ad_images ai
    WHERE ai.ad_id = a.id
    ORDER BY ai.sort_order ASC
    LIMIT 1
  ) AS cover_image,
  (
    SELECT COUNT(*)
    FROM public.ad_images ai
    WHERE ai.ad_id = a.id
  ) AS image_count
FROM public.ads a
LEFT JOIN public.profiles   p ON p.id = a.user_id
LEFT JOIN public.categories c ON c.id = a.category_id
LEFT JOIN public.locations  l ON l.id = a.location_id;

-- Category counts (live)
CREATE OR REPLACE VIEW public.category_counts AS
SELECT
  c.id,
  c.name,
  c.icon,
  c.sort_order,
  COUNT(a.id) AS ad_count
FROM public.categories c
LEFT JOIN public.ads a ON a.category_id = c.id AND a.status = 'active'
WHERE c.is_active = TRUE
GROUP BY c.id, c.name, c.icon, c.sort_order
ORDER BY c.sort_order;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 12. FULL-TEXT SEARCH FUNCTION
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE OR REPLACE FUNCTION public.search_ads(
  search_term TEXT,
  category_filter TEXT DEFAULT NULL,
  location_filter UUID DEFAULT NULL,
  min_price NUMERIC DEFAULT NULL,
  max_price NUMERIC DEFAULT NULL,
  page_number INT DEFAULT 1,
  page_size INT DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  slug TEXT,
  price NUMERIC,
  price_text TEXT,
  location_text TEXT,
  cover_image TEXT,
  category_id TEXT,
  category_name TEXT,
  seller_name TEXT,
  created_at TIMESTAMPTZ,
  views_count INT,
  total_count BIGINT
) AS $$
DECLARE
  offset_val INT := (page_number - 1) * page_size;
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.title,
    a.slug,
    a.price,
    a.price_text,
    COALESCE(l.name, a.location_text) AS location_text,
    (SELECT ai.image_url FROM public.ad_images ai WHERE ai.ad_id = a.id ORDER BY ai.sort_order LIMIT 1) AS cover_image,
    a.category_id,
    c.name AS category_name,
    p.full_name AS seller_name,
    a.created_at,
    a.views_count,
    COUNT(*) OVER() AS total_count
  FROM public.ads a
  LEFT JOIN public.profiles   p ON p.id = a.user_id
  LEFT JOIN public.categories c ON c.id = a.category_id
  LEFT JOIN public.locations  l ON l.id = a.location_id
  WHERE a.status = 'active'
    AND (search_term IS NULL OR search_term = ''
         OR to_tsvector('english', COALESCE(a.title, '') || ' ' || COALESCE(a.description, ''))
            @@ plainto_tsquery('english', search_term))
    AND (category_filter IS NULL OR a.category_id = category_filter)
    AND (location_filter IS NULL OR a.location_id = location_filter)
    AND (min_price IS NULL OR a.price >= min_price)
    AND (max_price IS NULL OR a.price <= max_price)
  ORDER BY a.created_at DESC
  LIMIT page_size
  OFFSET offset_val;
END;
$$ LANGUAGE plpgsql;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 13. ROW LEVEL SECURITY (RLS)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ── PROFILES ──
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles: viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Profiles: users can update own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Profiles: users can insert own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);


-- ── CATEGORIES ──
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories: viewable by everyone"
  ON public.categories FOR SELECT
  USING (true);


-- ── SUBCATEGORIES ──
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Subcategories: viewable by everyone"
  ON public.subcategories FOR SELECT
  USING (true);


-- ── LOCATIONS ──
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Locations: viewable by everyone"
  ON public.locations FOR SELECT
  USING (true);


-- ── ADS ──
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ads: active ads viewable by everyone"
  ON public.ads FOR SELECT
  USING (status = 'active' OR user_id = auth.uid());

CREATE POLICY "Ads: authenticated users can insert"
  ON public.ads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Ads: owners can update"
  ON public.ads FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Ads: owners can delete"
  ON public.ads FOR DELETE
  USING (auth.uid() = user_id);


-- ── AD IMAGES ──
ALTER TABLE public.ad_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ad images: viewable by everyone"
  ON public.ad_images FOR SELECT
  USING (true);

CREATE POLICY "Ad images: ad owner can insert"
  ON public.ad_images FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.ads WHERE id = ad_id AND user_id = auth.uid())
  );

CREATE POLICY "Ad images: ad owner can delete"
  ON public.ad_images FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.ads WHERE id = ad_id AND user_id = auth.uid())
  );


-- ── SAVED ADS ──
ALTER TABLE public.saved_ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Saved ads: users see own"
  ON public.saved_ads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Saved ads: users can insert own"
  ON public.saved_ads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Saved ads: users can delete own"
  ON public.saved_ads FOR DELETE
  USING (auth.uid() = user_id);


-- ── CONVERSATIONS ──
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Conversations: participants can view"
  ON public.conversations FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Conversations: buyers can create"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);


-- ── MESSAGES ──
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Messages: conversation participants can view"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations conv
      WHERE conv.id = conversation_id
        AND (conv.buyer_id = auth.uid() OR conv.seller_id = auth.uid())
    )
  );

CREATE POLICY "Messages: conversation participants can send"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations conv
      WHERE conv.id = conversation_id
        AND (conv.buyer_id = auth.uid() OR conv.seller_id = auth.uid())
    )
  );


-- ── REPORTS ──
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reports: users can insert own"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Reports: users see own reports"
  ON public.reports FOR SELECT
  USING (auth.uid() = reporter_id);


-- ── AD VIEWS ──
ALTER TABLE public.ad_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ad views: anyone can insert"
  ON public.ad_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Ad views: ad owners can view their analytics"
  ON public.ad_views FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.ads WHERE id = ad_id AND user_id = auth.uid())
  );


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 14. STORAGE BUCKETS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ad-images',
  'ad-images',
  TRUE,
  5242880,  -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  TRUE,
  2097152,  -- 2 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Storage policies: ad-images
CREATE POLICY "Ad images: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'ad-images');

CREATE POLICY "Ad images: authenticated upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'ad-images' AND auth.role() = 'authenticated');

CREATE POLICY "Ad images: owner can delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'ad-images' AND auth.uid()::TEXT = (storage.foldername(name))[1]);

-- Storage policies: avatars
CREATE POLICY "Avatars: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Avatars: users upload own"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::TEXT = (storage.foldername(name))[1]);

CREATE POLICY "Avatars: users update own"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::TEXT = (storage.foldername(name))[1]);

CREATE POLICY "Avatars: users delete own"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::TEXT = (storage.foldername(name))[1]);


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 15. REALTIME (enable for live updates)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ads;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ✅ DONE — Schema is ready!
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
