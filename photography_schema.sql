-- Supabase Schema Setup Script (Photography Specific)

-- 1. Create Settings Table
CREATE TABLE IF NOT EXISTS public.settings (
  id text PRIMARY KEY, -- 'photography' for this document
  "companyName" text,
  "logoUrl" text,
  "heroBgUrl" text,
  "aboutUsImageUrl" text,
  "whatsAppNumber" text,
  "address" text,
  "email" text,
  "socialLinks" jsonb DEFAULT '[]',
  "bankName" text,
  "accountNumber" text,
  "branchCode" text,

  -- nested JSON fields for specific sections
  "hero" jsonb, -- { title: string, subtitle: string }
  "about" jsonb, -- { story_p1: string, story_p2: string, story_p3: string }
  "bookingOptions" jsonb DEFAULT '[]',
  "theme" jsonb, -- Website color & typography
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read" ON public.settings;
CREATE POLICY "Public Read" ON public.settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated Manage" ON public.settings;
CREATE POLICY "Authenticated Manage" ON public.settings FOR ALL USING (auth.role() = 'authenticated');

-- 2. Create Photo Library Table
CREATE TABLE IF NOT EXISTS public.photo_library (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text,
  story text,
  "primaryImage" text,
  "galleryImages" jsonb DEFAULT '[]', -- Array of image URLs
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.photo_library ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read" ON public.photo_library;
CREATE POLICY "Public Read" ON public.photo_library FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated Manage" ON public.photo_library;
CREATE POLICY "Authenticated Manage" ON public.photo_library FOR ALL USING (auth.role() = 'authenticated');

-- 3. Create Photo Bookings Table
CREATE TABLE IF NOT EXISTS public.photo_bookings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "clientName" text,
  "clientEmail" text,
  "clientPhone" text,
  service text,
  date text,
  time text,
  message text,
  status text DEFAULT 'pending',
  "referenceImages" jsonb DEFAULT '[]',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.photo_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Insert" ON public.photo_bookings;
CREATE POLICY "Public Insert" ON public.photo_bookings FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated Read" ON public.photo_bookings;
CREATE POLICY "Authenticated Read" ON public.photo_bookings FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated Manage" ON public.photo_bookings;
CREATE POLICY "Authenticated Manage" ON public.photo_bookings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Initial insertion for photography settings if missing
INSERT INTO public.settings (
  id, "companyName", "theme", "hero", "about"
) VALUES (
  'photography', 'Fine Art Photography', 
  '{"brandDark":"#1a1a1a", "brandLight":"#f5f5f5", "brandOffWhite":"#ffffff", "fontSans": "Inter, sans-serif"}'::jsonb,
  '{"title":"Capturing The Moment", "subtitle":"We specialize in professional photography tailored to your unique story. Beautifully crafted, minimal, and authentic."}'::jsonb,
  '{"story_p1":"I believe that every picture tells a story. My journey began with a passion for capturing the raw, authentic moments that make life beautiful.", "story_p2":"Whether it''s a wedding, a corporate event, or a personal portrait session, my approach is always the same: to blend into the background and let the natural magic unfold.", "story_p3":"I utilize state-of-the-art equipment paired with a deep understanding of natural and artificial lighting to ensure every frame is a masterpiece you''ll cherish forever."}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Storage Buckets Setup
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true) 
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
CREATE POLICY "Public Read Access" ON storage.objects FOR SELECT TO public USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Public Insert Access" ON storage.objects;
CREATE POLICY "Public Insert Access" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'media');
