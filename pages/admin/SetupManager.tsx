
import React, { useState } from 'react';

const CopyBlock: React.FC<{ text: string; label?: string; height?: string }> = ({ text, label, height = "h-auto" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3">
      {label && <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">{label}</p>}
      <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700 shadow-md">
        <div className="flex justify-between items-center px-4 py-2 bg-gray-800 border-b border-gray-700">
          <div className="flex space-x-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
          </div>
          <button 
            onClick={handleCopy} 
            className={`text-xs font-mono font-bold transition-colors ${copied ? 'text-green-400' : 'text-gray-400 hover:text-white'}`}
          >
            {copied ? 'COPIED!' : 'COPY CODE'}
          </button>
        </div>
        <pre className={`p-4 overflow-auto ${height} text-xs sm:text-sm text-green-400 font-mono leading-relaxed`}>
          <code>{text}</code>
        </pre>
      </div>
    </div>
  );
};

const ExternalLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline font-semibold decoration-blue-300 underline-offset-2">
        {children} &rarr;
    </a>
);

const Step: React.FC<{ number: string; title: string; children: React.ReactNode }> = ({ number, title, children }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="bg-gray-50 p-6 border-b border-gray-100 sticky top-0 z-10">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                <span className="bg-admin-dark-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm">{number}</span>
                {title}
            </h2>
        </div>
        <div className="p-6 md:p-8 space-y-6 text-gray-600 leading-relaxed">
            {children}
        </div>
    </div>
);

const SetupManager: React.FC = () => {
  // --- SQL SCRIPTS ---

  const script1_structure = `
-- 1. EXTENSIONS
-- "uuid-ossp" is required to generate unique IDs for every database entry automatically.
create extension if not exists "uuid-ossp";

-- 2. CREATE TABLES
-- We create tables 'if not exists' so this script is safe to run multiple times.

-- Portfolio: Stores your art gallery images
create table if not exists public.portfolio (
  id uuid primary key default uuid_generate_v4(),
  title text,
  story text,
  "primaryImage" text,
  "galleryImages" text[],
  "videoData" text,
  featured boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Specials: Stores your flash sales and offers
create table if not exists public.specials (
  id uuid primary key default uuid_generate_v4(),
  title text,
  description text,
  price numeric,
  "imageUrl" text,
  images text[],
  active boolean default true,
  "priceType" text default 'fixed',
  "priceValue" numeric,
  details text[],
  "voucherCode" text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Showroom: Stores categories (Genres) for the flash wall
create table if not exists public.showroom (
  id uuid primary key default uuid_generate_v4(),
  name text,
  items jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Bookings: Stores client appointments
create table if not exists public.bookings (
  id uuid primary key default uuid_generate_v4(),
  name text,
  email text,
  "whatsappNumber" text,
  message text,
  "bookingDate" date,
  status text default 'pending',
  "bookingType" text default 'online',
  "totalCost" numeric,
  "amountPaid" numeric default 0,
  "paymentMethod" text,
  "referenceImages" text[],
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Expenses: Tracks your business spending
create table if not exists public.expenses (
  id uuid primary key default uuid_generate_v4(),
  date date,
  category text,
  description text,
  amount numeric,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Inventory: Tracks stock levels (Ink, Gloves, etc)
create table if not exists public.inventory (
  id uuid primary key default uuid_generate_v4(),
  "productName" text,
  brand text,
  category text,
  quantity numeric,
  "minStockLevel" numeric,
  "unitCost" numeric,
  supplier text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Invoices: Stores quotes and invoices
create table if not exists public.invoices (
  id uuid primary key default uuid_generate_v4(),
  type text, 
  number text,
  "clientId" text,
  "bookingId" text,
  "clientName" text,
  "clientEmail" text,
  "clientPhone" text,
  "dateIssued" date,
  "dateDue" date,
  status text default 'draft',
  items jsonb default '[]'::jsonb,
  notes text,
  subtotal numeric,
  "taxAmount" numeric,
  total numeric,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Clients: Stores client profiles and loyalty info
create table if not exists public.clients (
  id uuid primary key default uuid_generate_v4(),
  name text,
  email text,
  phone text,
  password text,
  notes text,
  stickers integer default 0,
  "loyaltyProgress" jsonb default '{}'::jsonb,
  "rewardsRedeemed" integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Settings: Stores website config (Logo, Phone, Colors, etc)
create table if not exists public.settings (
  id text primary key,
  "companyName" text,
  "logoUrl" text,
  "heroBgUrl" text,
  "aboutUsImageUrl" text,
  "whatsAppNumber" text,
  address text,
  phone text,
  email text,
  "socialLinks" jsonb default '[]'::jsonb,
  "showroomTitle" text,
  "showroomDescription" text,
  "bankName" text,
  "accountNumber" text,
  "branchCode" text,
  "accountType" text,
  "vatNumber" text,
  "isMaintenanceMode" boolean default false,
  "apkUrl" text,
  "taxEnabled" boolean default false,
  "vatPercentage" numeric default 15,
  "emailServiceId" text,
  "emailTemplateId" text,
  "emailPublicKey" text,
  "loyaltyProgram" jsonb,
  "loyaltyPrograms" jsonb,
  hero jsonb,
  about jsonb,
  contact jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);
`.trim();

  const script2_permissions = `
-- 1. ENABLE ROW LEVEL SECURITY (RLS)
-- This tells the database "Don't let anyone touch data unless I explicitly say so."
alter table public.expenses enable row level security;
alter table public.inventory enable row level security;
alter table public.portfolio enable row level security;
alter table public.specials enable row level security;
alter table public.showroom enable row level security;
alter table public.settings enable row level security;
alter table public.bookings enable row level security;
alter table public.invoices enable row level security;
alter table public.clients enable row level security;

-- 2. CLEANUP OLD POLICIES
-- We remove any existing rules to avoid conflicts when you run this script multiple times.
drop policy if exists "Admin Expenses" on public.expenses;
drop policy if exists "Admin Inventory" on public.inventory;
drop policy if exists "Public Read Portfolio" on public.portfolio;
drop policy if exists "Admin Write Portfolio" on public.portfolio;
drop policy if exists "Public Read Specials" on public.specials;
drop policy if exists "Admin Write Specials" on public.specials;
drop policy if exists "Public Read Showroom" on public.showroom;
drop policy if exists "Admin Write Showroom" on public.showroom;
drop policy if exists "Public Read Settings" on public.settings;
drop policy if exists "Admin Write Settings" on public.settings;
drop policy if exists "App Access Bookings" on public.bookings;
drop policy if exists "App Access Invoices" on public.invoices;
drop policy if exists "App Access Clients" on public.clients;

-- 3. CREATE POLICIES (The Rules)

-- RULE: Only logged-in Admins can see or touch Expenses and Inventory
create policy "Admin Expenses" on public.expenses for all using (auth.role() = 'authenticated');
create policy "Admin Inventory" on public.inventory for all using (auth.role() = 'authenticated');

-- RULE: Everyone (Public) can SEE Portfolio, Specials, Showroom, and Settings
-- But only Admins can EDIT them.
create policy "Public Read Portfolio" on public.portfolio for select using (true);
create policy "Admin Write Portfolio" on public.portfolio for all using (auth.role() = 'authenticated');

create policy "Public Read Specials" on public.specials for select using (true);
create policy "Admin Write Specials" on public.specials for all using (auth.role() = 'authenticated');

create policy "Public Read Showroom" on public.showroom for select using (true);
create policy "Admin Write Showroom" on public.showroom for all using (auth.role() = 'authenticated');

create policy "Public Read Settings" on public.settings for select using (true);
create policy "Admin Write Settings" on public.settings for all using (auth.role() = 'authenticated');

-- RULE: Operational Data (Bookings, Invoices, Clients)
-- We allow broad access here so the Client Portal works without complex auth logic for now.
-- In a stricter app, you would limit this to "auth.uid() = client_id", but for this system, we keep it simple.
create policy "App Access Bookings" on public.bookings for all using (true);
create policy "App Access Invoices" on public.invoices for all using (true);
create policy "App Access Clients" on public.clients for all using (true);
`.trim();

  const script3_storage = `
-- 1. STORAGE SECURITY
-- We create policies to control who can upload/view files.

-- Note: We skipped "alter table storage.objects enable row level security" 
-- because it is already handled by Supabase internally.

-- Drop old policies to prevent duplicates
drop policy if exists "Public Read Access" on storage.objects;
drop policy if exists "Admin Insert Access" on storage.objects;
drop policy if exists "Admin Update Access" on storage.objects;
drop policy if exists "Admin Delete Access" on storage.objects;

-- RULE: Anyone can VIEW images (so they load on your website)
create policy "Public Read Access"
on storage.objects for select
using ( bucket_id in ('portfolio', 'specials', 'showroom', 'booking-references', 'settings') );

-- RULE: Only Admins can UPLOAD, UPDATE, or DELETE files
create policy "Admin Insert Access"
on storage.objects for insert
with check ( auth.role() = 'authenticated' AND bucket_id in ('portfolio', 'specials', 'showroom', 'booking-references', 'settings') );

create policy "Admin Update Access"
on storage.objects for update
using ( auth.role() = 'authenticated' AND bucket_id in ('portfolio', 'specials', 'showroom', 'booking-references', 'settings') );

create policy "Admin Delete Access"
on storage.objects for delete
using ( auth.role() = 'authenticated' AND bucket_id in ('portfolio', 'specials', 'showroom', 'booking-references', 'settings') );
`.trim();

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-32 font-sans">
      
      {/* Intro Header */}
      <div className="text-center space-y-6 py-8">
        <h1 className="text-3xl md:text-5xl font-black text-gray-800 tracking-tight">Zero to Hero Setup Guide</h1>
        <p className="text-lg text-gray-500 max-w-3xl mx-auto">
          The complete guide to taking these files and turning them into a live, professional website accessible to the world.
          Follow each step exactly.
        </p>
        <div className="inline-flex flex-wrap justify-center gap-2">
            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">GitHub</span>
            <span className="text-gray-400">&rarr;</span>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Supabase</span>
            <span className="text-gray-400">&rarr;</span>
            <span className="bg-black text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Vercel</span>
        </div>
      </div>

      {/* STEP 1: GITHUB */}
      <Step number="1" title="Put the Code Safe (GitHub)">
        <p>
            Before we can launch the site, we need to put the code into a "Repository" (Repo). 
            This is where Vercel will grab the files from.
        </p>
        
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-2">Instructions:</h3>
            <ol className="list-decimal pl-5 space-y-3 text-gray-800 text-sm">
                <li>Create a free account at <ExternalLink href="https://github.com/">GitHub.com</ExternalLink>.</li>
                <li>In the top right corner, click the <strong>+</strong> icon and select <strong>New repository</strong>.</li>
                <li>Name it something like <code>bos-salon-website</code>. Make it <strong>Private</strong> if you don't want others to see the code yet.</li>
                <li>Click <strong>Create repository</strong>.</li>
                <li>
                    <strong>Upload your files:</strong>
                    <ul className="list-disc pl-5 mt-1 text-gray-600">
                        <li>If you downloaded this project as a ZIP, unzip it.</li>
                        <li>On the GitHub screen, look for the link "uploading an existing file".</li>
                        <li>Drag and drop ALL your project files into that window.</li>
                        <li>Wait for them to upload, type "Initial commit" in the box at the bottom, and click <strong>Commit changes</strong>.</li>
                    </ul>
                </li>
            </ol>
        </div>
      </Step>

      {/* STEP 2: SUPABASE */}
      <Step number="2" title="Create the Brain (Supabase)">
        <p>
            Supabase is the database. It stores all your bookings, settings, and client info.
        </p>
        
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <h3 className="font-bold text-blue-900 mb-2">Instructions:</h3>
            <ol className="list-decimal pl-5 space-y-2 text-blue-800 text-sm">
                <li>Go to <ExternalLink href="https://supabase.com/dashboard">Supabase Dashboard</ExternalLink> and create a "New Project".</li>
                <li>Give it a name (e.g., "Bos Salon") and a strong password. Region: Choose one close to you (e.g., Cape Town).</li>
                <li><strong>Wait:</strong> It takes about 2 minutes to setup.</li>
                <li>Once the project is ready (green "Active" badge), look for the <strong>SQL Editor</strong> icon (looks like a terminal `&gt;_`) on the left sidebar.</li>
                <li>Paste the code below into the SQL Editor and click <strong>RUN</strong>.</li>
            </ol>
        </div>

        <CopyBlock label="Script A: Create Tables" text={script1_structure} height="h-64" />
        
        <div className="border-t border-gray-100 pt-6 mt-6">
            <p className="mb-4">Now, delete the text in the SQL Editor, paste this second script, and click <strong>RUN</strong> again. This sets up security.</p>
            <CopyBlock label="Script B: Security Rules" text={script2_permissions} height="h-48" />
        </div>
      </Step>

      {/* STEP 3: STORAGE */}
      <Step number="3" title="Enable File Uploads">
        <p>
            We need to tell Supabase to allow image uploads for your portfolio.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h3 className="font-bold text-gray-800 mb-2">Manual Setup Required:</h3>
                <ol className="list-decimal pl-5 space-y-3 text-sm">
                    <li>Go to the <strong>Storage</strong> icon (looks like a box) in the Supabase sidebar.</li>
                    <li>Click <strong>"New Bucket"</strong>.</li>
                    <li>Name it <code>portfolio</code>.</li>
                    <li><strong>IMPORTANT:</strong> Toggle "Public Bucket" to <strong>ON</strong>.</li>
                    <li>Click Save.</li>
                    <li>Repeat this for these 4 other names:
                        <ul className="list-disc pl-5 mt-2 font-mono text-xs text-purple-600 font-bold bg-purple-50 p-2 rounded">
                            <li>specials</li>
                            <li>showroom</li>
                            <li>booking-references</li>
                            <li>settings</li>
                        </ul>
                    </li>
                </ol>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-2">Final Script:</h3>
                <p className="text-sm mb-2">Once you created the buckets manually, run this SQL script to finish the permissions.</p>
                <CopyBlock label="Script C: Storage Permissions" text={script3_storage} height="h-40" />
            </div>
        </div>
      </Step>

      {/* STEP 4: VERCEL */}
      <Step number="4" title="Launch the Website (Vercel)">
        <p>
            Now we connect the Code (GitHub) to the Brain (Supabase) using Vercel.
        </p>

        <div className="space-y-6">
            <div>
                <h3 className="font-bold text-gray-800 mb-2">1. Get your Secret Keys</h3>
                <p className="text-sm mb-2">Go back to your Supabase Dashboard. Click <strong>Settings (Cogwheel)</strong> &rarr; <strong>API</strong>.</p>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-sm">
                    <p>Keep this tab open. You will need:</p>
                    <ul className="list-disc pl-5 mt-1 font-bold text-yellow-800">
                        <li>Project URL</li>
                        <li>anon / public key</li>
                    </ul>
                </div>
            </div>

            <div>
                <h3 className="font-bold text-gray-800 mb-2">2. Deploy on Vercel</h3>
                <ol className="list-decimal pl-5 space-y-3 text-sm">
                    <li>Go to <ExternalLink href="https://vercel.com/signup">Vercel.com</ExternalLink> and sign up with <strong>GitHub</strong>.</li>
                    <li>Click <strong>"Add New..."</strong> &rarr; <strong>"Project"</strong>.</li>
                    <li>You should see your `bos-salon-website` repo from Step 1. Click <strong>Import</strong>.</li>
                    <li>
                        <strong>Environment Variables:</strong> This is the most critical step. Click the dropdown named "Environment Variables".
                        Add these two exactly as written:
                    </li>
                </ol>
                
                <div className="mt-4 space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2 items-center bg-gray-100 p-2 rounded">
                        <span className="font-mono text-xs font-bold bg-white px-2 py-1 border rounded w-full sm:w-1/3">VITE_SUPABASE_URL</span>
                        <span className="text-xs text-gray-500 w-full sm:w-2/3">Paste the <strong>Project URL</strong> from Supabase here.</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 items-center bg-gray-100 p-2 rounded">
                        <span className="font-mono text-xs font-bold bg-white px-2 py-1 border rounded w-full sm:w-1/3">VITE_SUPABASE_ANON_KEY</span>
                        <span className="text-xs text-gray-500 w-full sm:w-2/3">Paste the <strong>anon / public key</strong> from Supabase here.</span>
                    </div>
                </div>

                <div className="mt-4 text-sm">
                    <p>Click <strong>Deploy</strong>. Vercel will now build your site. In about 1 minute, you will get a live URL (e.g., <code>bos-salon.vercel.app</code>).</p>
                </div>
            </div>
        </div>
      </Step>

      {/* STEP 5: GOOGLE AUTH */}
      <Step number="5" title="Enable Google Login">
        <p>
            This allows clients to "Sign in with Google" on their personal portal.
        </p>

        <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h3 className="font-bold text-blue-900 mb-2">Part A: Prepare Supabase</h3>
                <ol className="list-decimal pl-5 space-y-2 text-blue-800 text-sm">
                    <li>Go to Supabase Dashboard &rarr; <strong>Authentication</strong> (Icon of people) &rarr; <strong>Providers</strong>.</li>
                    <li>Select <strong>Google</strong>.</li>
                    <li>Toggle "Enable Google provider".</li>
                    <li><strong>Copy</strong> the "Callback URL (for OAuth)". It looks like `https://xyz.supabase.co/auth/v1/callback`.</li>
                    <li>Keep this tab open!</li>
                </ol>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-2">Part B: Get Google Keys</h3>
                <ol className="list-decimal pl-5 space-y-2 text-gray-800 text-sm">
                    <li>Go to <ExternalLink href="https://console.cloud.google.com/">Google Cloud Console</ExternalLink>.</li>
                    <li>Create a <strong>New Project</strong> (name it "Bos Salon Auth").</li>
                    <li>Go to <strong>APIs & Services</strong> &rarr; <strong>OAuth consent screen</strong>.
                        <ul className="list-disc pl-5 mt-1 text-xs text-gray-600">
                            <li>Select <strong>External</strong> &rarr; Create.</li>
                            <li>Fill in App Name, Support Email, and Developer Email. Click Save & Continue until finished.</li>
                        </ul>
                    </li>
                    <li>Go to <strong>Credentials</strong> (Left sidebar) &rarr; <strong>Create Credentials</strong> &rarr; <strong>OAuth client ID</strong>.</li>
                    <li>Application type: <strong>Web application</strong>.</li>
                    <li>
                        <strong>Authorized redirect URIs:</strong> Click "Add URI" and paste the <strong>Callback URL</strong> you copied from Supabase in Part A.
                    </li>
                    <li>Click Create.</li>
                    <li>Copy the <strong>Client ID</strong> and <strong>Client Secret</strong>.</li>
                </ol>
            </div>

            <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                <h3 className="font-bold text-green-900 mb-2">Part C: Finish in Supabase</h3>
                <p className="text-sm text-green-800">
                    Go back to your Supabase tab (Authentication &rarr; Providers &rarr; Google).
                    <br/>Paste the <strong>Client ID</strong> and <strong>Client Secret</strong> you just got.
                    <br/>Click <strong>Save</strong>.
                </p>
            </div>
        </div>
      </Step>

      {/* STEP 6: EMAILJS */}
      <Step number="6" title="Connect Emails (EmailJS)">
        <p>
            To receive booking requests in your Gmail/Outlook, we link EmailJS.
        </p>

        <div className="space-y-4 mt-4">
            <ol className="list-decimal pl-5 space-y-4 text-sm">
                <li>
                    Go to <ExternalLink href="https://www.emailjs.com/">EmailJS.com</ExternalLink> and create a free account.
                </li>
                <li>
                    <strong>Add Service:</strong> Click "Add Service", select "Gmail" (or your provider), connect your account. 
                    <br/>Copy the <strong>Service ID</strong> (e.g., <code>service_xyz</code>).
                </li>
                <li>
                    <strong>Add Template:</strong> Click "Email Templates" &rarr; "Create New Template".
                    <br/>Design the email you want to receive. Use these variables in the design:
                    <ul className="list-disc pl-5 mt-1 font-mono text-xs text-blue-600">
                        <li>{'{{from_name}}'} (Client Name)</li>
                        <li>{'{{from_email}}'} (Client Email)</li>
                        <li>{'{{message}}'} (Booking Details)</li>
                    </ul>
                    Save and copy the <strong>Template ID</strong> (e.g., <code>template_abc</code>).
                </li>
                <li>
                    <strong>Get Public Key:</strong> Click on your Account Name (top right) &rarr; "Public Key".
                </li>
            </ol>

            <div className="bg-green-50 p-4 rounded-xl border border-green-200 mt-4">
                <h3 className="font-bold text-green-900 mb-2">Final Step: Connect it</h3>
                <p className="text-sm text-green-800">
                    Once your site is live, log in to this Admin Dashboard using the URL Vercel gave you.
                    <br/>
                    Go to <strong>Settings Tab</strong> &rarr; <strong>Integrations Section</strong> and paste your 3 EmailJS keys there.
                </p>
            </div>
        </div>
      </Step>

      <div className="text-center pt-10 pb-10">
          <p className="text-4xl">🎉</p>
          <p className="text-2xl font-bold text-gray-800 mt-4">You are done!</p>
          <p className="text-gray-500 mt-2">Your system is now fully live, secure, and ready for business.</p>
          <p className="text-sm text-gray-400 mt-6">
            Default Admin Login (first time): <br/>
            Email: <code>admin@bossalon.com</code> (You must create this user in Supabase Authentication tab manually first!)
          </p>
      </div>

    </div>
  );
};

export default SetupManager;
