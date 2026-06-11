-- Supabase Schema Setup Script

-- 1. Create Portfolio Table
CREATE TABLE IF NOT EXISTS public.portfolio (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text,
  description text,
  imageUrl text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read" ON public.portfolio;
CREATE POLICY "Public Read" ON public.portfolio FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated Manage" ON public.portfolio;
CREATE POLICY "Authenticated Manage" ON public.portfolio FOR ALL USING (auth.role() = 'authenticated');

-- 2. Create Specials Table
CREATE TABLE IF NOT EXISTS public.specials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text,
  price text,
  imageurl text,
  description text,
  bgColor text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.specials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read" ON public.specials;
CREATE POLICY "Public Read" ON public.specials FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated Manage" ON public.specials;
CREATE POLICY "Authenticated Manage" ON public.specials FOR ALL USING (auth.role() = 'authenticated');

-- 3. Create Showroom Table
CREATE TABLE IF NOT EXISTS public.showroom (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text,
  description text,
  imageUrl text,
  "designs" jsonb DEFAULT '[]', -- Array of objects: { id, title, description, imageUrl, price }
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.showroom ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read" ON public.showroom;
CREATE POLICY "Public Read" ON public.showroom FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated Manage" ON public.showroom;
CREATE POLICY "Authenticated Manage" ON public.showroom FOR ALL USING (auth.role() = 'authenticated');

-- 4. Create Clients Table
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  firstName text,
  lastName text,
  email text,
  whatsapp text,
  age integer,
  address text,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated Read" ON public.clients;
CREATE POLICY "Authenticated Read" ON public.clients FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Authenticated Manage" ON public.clients;
CREATE POLICY "Authenticated Manage" ON public.clients FOR ALL USING (auth.role() = 'authenticated');

-- 5. Create Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  clientName text,
  clientEmail text,
  clientPhone text,
  service text,
  date text,
  time text,
  designIdea text,
  status text DEFAULT 'pending',
  imageUrl text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Insert" ON public.bookings;
CREATE POLICY "Public Insert" ON public.bookings FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated Read" ON public.bookings;
CREATE POLICY "Authenticated Read" ON public.bookings FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Authenticated Manage" ON public.bookings;
CREATE POLICY "Authenticated Manage" ON public.bookings FOR ALL USING (auth.role() = 'authenticated');

-- 6. Create Invoices Table
CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  clientId text,
  clientName text,
  whatsapp text,
  date text,
  dueDate text,
  items jsonb DEFAULT '[]',
  subtotal numeric,
  tax numeric,
  total numeric,
  status text,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated Read" ON public.invoices;
CREATE POLICY "Authenticated Read" ON public.invoices FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Authenticated Manage" ON public.invoices;
CREATE POLICY "Authenticated Manage" ON public.invoices FOR ALL USING (auth.role() = 'authenticated');

-- 6.5 Create Expenses and Inventory Tables
CREATE TABLE IF NOT EXISTS public.expenses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  date date,
  category text,
  description text,
  amount numeric,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated Manage Expenses" ON public.expenses;
CREATE POLICY "Authenticated Manage Expenses" ON public.expenses FOR ALL USING (auth.role() = 'authenticated');

CREATE TABLE IF NOT EXISTS public.inventory (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "productName" text,
  brand text,
  category text,
  quantity numeric,
  "minStockLevel" numeric,
  "unitCost" numeric,
  supplier text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated Manage Inventory" ON public.inventory;
CREATE POLICY "Authenticated Manage Inventory" ON public.inventory FOR ALL USING (auth.role() = 'authenticated');

-- 7. Create Settings Table
CREATE TABLE IF NOT EXISTS public.settings (
  id text PRIMARY KEY, -- 'main' for the single document
  "companyName" text,
  "logoUrl" text,
  "heroBgUrl" text,
  "heroBgUrls" jsonb DEFAULT '[]',
  "heroVideoUrl" text,
  "aboutUsImageUrl" text,
  "whatsAppNumber" text,
  "businessHours" text,
  "openingTimes" text,
  "address" text,
  "phone" text,
  "email" text,
  "socialLinks" jsonb DEFAULT '[]',
  "showroomTitle" text,
  "showroomDescription" text,
  "bankName" text,
  "accountNumber" text,
  "branchCode" text,
  "accountType" text,
  "vatNumber" text,
  "isMaintenanceMode" boolean DEFAULT false,
  "apkUrl" text,
  "taxEnabled" boolean DEFAULT false,
  "vatPercentage" numeric DEFAULT 15,
  "emailServiceId" text,
  "emailTemplateId" text,
  "emailPublicKey" text,

  -- nested JSON fields for specific sections
  "hero" jsonb,
  "welcome" jsonb,
  "about" jsonb,
  "contact" jsonb,
  "payments" jsonb,
  "aftercare" jsonb,
  "bookingOptions" jsonb DEFAULT '[]',
  "bookingCategories" jsonb DEFAULT '[]',
  "loyaltyPrograms" jsonb DEFAULT '[]',
  "loungePerks" jsonb DEFAULT '[]',
  "theme" jsonb, -- Website color & typography
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "heroVideoUrl" text;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "heroBgUrls" jsonb DEFAULT '[]';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "openingTimes" text;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "bookingCategories" jsonb DEFAULT '[]';

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read" ON public.settings;
CREATE POLICY "Public Read" ON public.settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated Manage" ON public.settings;
CREATE POLICY "Authenticated Manage" ON public.settings FOR ALL USING (auth.role() = 'authenticated');

-- Initial insertion for settings if missing
INSERT INTO public.settings (
  id, "companyName", "theme"
) VALUES (
  'main', 'Bos Salon', '{"brandDark":"#fff0f5", "brandLight":"#4e342e", "brandOffWhite":"#ffffff", "brandGold":"#d4a373", "brandGreen":"#ff1493", "brandPink":"#f48fb1", "fontSans": "Montserrat", "fontScript": "Dancing Script"}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 8. Create Photo Library Table
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

-- 9. Create Photo Bookings Table
CREATE TABLE IF NOT EXISTS public.photo_bookings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  clientName text,
  clientEmail text,
  clientPhone text,
  service text,
  date text,
  time text,
  message text,
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.photo_bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Insert" ON public.photo_bookings;
CREATE POLICY "Public Insert" ON public.photo_bookings FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated Read" ON public.photo_bookings;
CREATE POLICY "Authenticated Read" ON public.photo_bookings FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Authenticated Manage" ON public.photo_bookings;
CREATE POLICY "Authenticated Manage" ON public.photo_bookings FOR ALL USING (auth.role() = 'authenticated');

-- Initial insertion for photography settings if missing
INSERT INTO public.settings (
  id, "companyName", "theme"
) VALUES (
  'photography', 'Photography Co', '{"brandDark":"#1a1a1a", "brandLight":"#f5f5f5", "brandOffWhite":"#ffffff", "fontSans": "Inter", "fontScript": "Inter"}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Storage Buckets Setup
-- You will need to create 'media' bucket in Supabase dashboard manually (publicly readable).
-- Policy for public read
-- CREATE POLICY "Public Access" on storage.objects FOR SELECT USING (bucket_id = 'media');

-- 10. Auto-Cleanup Booking Images
-- Note: pg_cron extension required. Execute the following to schedule a daily cleanup of booking images older than 30 days:
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 11. Create Photo Invoices Table
CREATE TABLE IF NOT EXISTS public.photo_invoices (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text,
  clientName text,
  whatsapp text,
  email text,
  date text,
  items jsonb,
  subtotal numeric,
  discount numeric,
  total numeric,
  status text,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.photo_invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Insert" ON public.photo_invoices;
CREATE POLICY "Public Insert" ON public.photo_invoices FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated Read" ON public.photo_invoices;
CREATE POLICY "Authenticated Read" ON public.photo_invoices FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Authenticated Manage" ON public.photo_invoices;
CREATE POLICY "Authenticated Manage" ON public.photo_invoices FOR ALL USING (auth.role() = 'authenticated');

DO $$ 
BEGIN
  -- Schedule a daily job at midnight to delete old images
  PERFORM cron.schedule(
    'delete_old_booking_images', 
    '0 0 * * *', 
    'DELETE FROM storage.objects WHERE bucket_id = ''media'' AND (name LIKE ''booking-refs/%'' OR name LIKE ''booking-references/%'') AND created_at < NOW() - INTERVAL ''30 days'';'
  );
EXCEPTION WHEN others THEN
  -- pg_cron might not be enabled or available in all environments, catch error
  RAISE NOTICE 'pg_cron scheduling failed: %', SQLERRM;
END $$;

-- 12. Realtime Subscriptions
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE 
    public.portfolio, 
    public.specials, 
    public.showroom, 
    public.bookings, 
    public.settings, 
    public.invoices,
    public.clients,
    public.expenses,
    public.inventory,
    public.photo_library,
    public.photo_bookings,
    public.photo_invoices;

