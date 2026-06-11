-- SQL Snippet to fix booking-references bucket permissions for public uploads

-- 1. Ensure the bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('booking-references', 'booking-references', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Drop any existing restrictive policies just in case
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;

-- 3. Create open Read policy for specific buckets including booking-references
CREATE POLICY "Public Read Access" ON storage.objects FOR SELECT TO public 
USING ( bucket_id in ('portfolio', 'specials', 'showroom', 'booking-references', 'settings', 'media') );

-- 4. Create an INSERT policy that allows anonymous (public) users to upload files to booking-references
-- (This is necessary since users filling out the booking form might not be authenticated)
CREATE POLICY "Public Insert Access" ON storage.objects FOR INSERT TO public 
WITH CHECK ( bucket_id in ('booking-references', 'media') );

-- 5. Create a catch-all for authenticated users
CREATE POLICY "Authenticated User Manage Storage" ON storage.objects FOR ALL TO authenticated 
USING (true) WITH CHECK (true);
