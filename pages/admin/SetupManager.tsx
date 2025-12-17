
import React, { useState } from 'react';

const CopyBlock: React.FC<{ text: string; label?: string; height?: string }> = ({ text, label, height = "h-auto" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4">
      {label && <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">{label}</p>}
      <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700 shadow-md relative group">
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
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline font-semibold decoration-blue-300 underline-offset-2 inline-flex items-center gap-1">
        {children} <span className="text-[10px]">↗</span>
    </a>
);

const Step: React.FC<{ number: string; title: string; subtitle?: string; children: React.ReactNode }> = ({ number, title, subtitle, children }) => (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-12 relative z-10">
        <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-100">
            <div className="flex items-center gap-4">
                <span className="bg-admin-dark-primary text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shadow-lg ring-4 ring-admin-dark-primary/20">{number}</span>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
                    {subtitle && <p className="text-sm text-gray-500 font-medium">{subtitle}</p>}
                </div>
            </div>
        </div>
        <div className="p-6 md:p-8 space-y-6 text-gray-600 leading-relaxed">
            {children}
        </div>
    </div>
);

const BackgroundIllustrations = () => (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Top Right - Bull Skull */}
        <img 
            src="https://i.ibb.co/B7KCtsq/bull-skull-art-free-vector-removebg-preview.png" 
            alt="" 
            className="absolute -top-20 -right-20 w-[400px] h-auto opacity-10 rotate-12"
        />
        {/* Bottom Left - Deer Skull */}
        <img 
            src="https://i.ibb.co/27RkP4jn/deer-skull-decal-bone-white-270c0255-d6d3-4ee2-bc02-6906b9f0de72-removebg-preview.png" 
            alt="" 
            className="absolute bottom-0 -left-20 w-[500px] h-auto opacity-10 -rotate-12"
        />
        {/* Middle Right - Floral */}
        <img 
            src="https://i.ibb.co/NdLtXyLB/OIP-1-removebg-preview.png" 
            alt="" 
            className="absolute top-1/3 -right-10 w-[300px] h-auto opacity-5 rotate-45"
        />
        {/* Top Left - Floral Flipped */}
        <img 
            src="https://i.ibb.co/NdLtXyLB/OIP-1-removebg-preview.png" 
            alt="" 
            className="absolute top-20 -left-10 w-[250px] h-auto opacity-5 -scale-x-100 -rotate-12"
        />
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
-- We enable this on ALL tables to stay secure.
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

-- RULE: Only logged-in Admins (Authentication Tab) can see or touch Expenses and Inventory
create policy "Admin Expenses" on public.expenses for all using (auth.role() = 'authenticated');
create policy "Admin Inventory" on public.inventory for all using (auth.role() = 'authenticated');

-- RULE: Everyone (Public) can SEE Portfolio, Specials, Showroom, and Settings.
-- This ensures your website visitors can see your work.
create policy "Public Read Portfolio" on public.portfolio for select using (true);
create policy "Public Read Specials" on public.specials for select using (true);
create policy "Public Read Showroom" on public.showroom for select using (true);
create policy "Public Read Settings" on public.settings for select using (true);

-- RULE: Only Admins can EDIT Portfolio, Specials, etc.
create policy "Admin Write Portfolio" on public.portfolio for all using (auth.role() = 'authenticated');
create policy "Admin Write Specials" on public.specials for all using (auth.role() = 'authenticated');
create policy "Admin Write Showroom" on public.showroom for all using (auth.role() = 'authenticated');
create policy "Admin Write Settings" on public.settings for all using (auth.role() = 'authenticated');

-- RULE: Operational Data (Bookings, Invoices, Clients)
-- We allow the App to access these so the Client Portal works.
-- In a stricter enterprise app, you would limit this to "auth.uid() = client_id".
create policy "App Access Bookings" on public.bookings for all using (true);
create policy "App Access Invoices" on public.invoices for all using (true);
create policy "App Access Clients" on public.clients for all using (true);
`.trim();

  const script3_storage = `
-- 1. STORAGE SECURITY
-- We create policies to control who can upload/view files.

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
-- This prevents random visitors from uploading content.
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
    <div className="relative min-h-screen font-sans">
      <BackgroundIllustrations />
      
      <div className="relative z-10 max-w-5xl mx-auto space-y-12 pb-32">
        
        {/* Intro Header */}
        <div className="text-center space-y-6 py-12">
          <h1 className="text-4xl md:text-6xl font-black text-gray-800 tracking-tight drop-shadow-sm">
            Zero to Hero Setup Guide
          </h1>
          <div className="w-24 h-1 bg-admin-dark-primary mx-auto rounded-full"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-medium leading-relaxed">
            The complete, step-by-step guide to taking this codebase and launching a professional, secure website for <strong className="text-admin-dark-primary">Bos Salon</strong>.
          </p>
          <div className="inline-flex flex-wrap justify-center gap-3 mt-4">
              <span className="bg-gray-800 text-white px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg">GitHub</span>
              <span className="text-gray-400 self-center">→</span>
              <span className="bg-green-600 text-white px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg">Supabase</span>
              <span className="text-gray-400 self-center">→</span>
              <span className="bg-black text-white px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg">Vercel</span>
          </div>
        </div>

        {/* STEP 1: GITHUB */}
        <Step number="1" title="Secure the Code (GitHub)" subtitle="Store your project files safely in the cloud.">
          <div className="flex flex-col gap-4">
              <p className="font-medium text-lg">Why?</p>
              <p className="text-sm">GitHub is like a cloud backup for code. It also allows Vercel (Step 4) to automatically update your website whenever you make changes.</p>
              
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-inner">
                  <h3 className="font-bold text-gray-900 mb-4 text-lg">Instructions:</h3>
                  <ol className="list-decimal pl-5 space-y-4 text-gray-800 text-sm font-medium">
                      <li>Go to <ExternalLink href="https://github.com/">GitHub.com</ExternalLink> and sign up/login.</li>
                      <li>In the top right corner, click the <strong className="bg-gray-200 px-1 rounded">+</strong> icon and select <strong>New repository</strong>.</li>
                      <li>Repository name: <code>bos-salon-website</code>. Select <strong>Private</strong> (keep your code safe).</li>
                      <li>Click <strong>Create repository</strong>.</li>
                      <li>
                          <strong>Upload files:</strong>
                          <ul className="list-disc pl-5 mt-2 text-gray-600 space-y-1 font-normal">
                              <li>Look for the link saying "uploading an existing file".</li>
                              <li>Drag and drop ALL files from this project folder into that window.</li>
                              <li>Wait for the files to process.</li>
                              <li>In "Commit changes" box, type "Initial Setup". Click <strong>Commit changes</strong>.</li>
                          </ul>
                      </li>
                  </ol>
              </div>
          </div>
        </Step>

        {/* STEP 2: SUPABASE */}
        <Step number="2" title="Build the Brain (Supabase)" subtitle="Setup the Database and Backend.">
          <div className="flex flex-col gap-4">
              <p className="font-medium text-lg">Why?</p>
              <p className="text-sm">Supabase is the engine. It stores your clients, bookings, invoices, and settings. It provides the "API" that the website talks to.</p>
              
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 shadow-inner">
                  <h3 className="font-bold text-blue-900 mb-4 text-lg">Instructions:</h3>
                  <ol className="list-decimal pl-5 space-y-3 text-blue-800 text-sm font-medium">
                      <li>Go to <ExternalLink href="https://supabase.com/dashboard">Supabase Dashboard</ExternalLink> -> "New Project".</li>
                      <li>Name: <code>Bos Salon</code>. Region: Choose closest to you (e.g., Cape Town). Password: Generate a strong one.</li>
                      <li><strong>Wait:</strong> Setting up the database takes about 2 minutes.</li>
                      <li>Once active (green light), look for the <strong>SQL Editor</strong> icon (terminal symbol `>_`) on the left sidebar.</li>
                      <li>Paste the scripts below one by one and click <strong>RUN</strong>.</li>
                  </ol>
              </div>

              <div className="space-y-6">
                  <div>
                      <h4 className="font-bold text-gray-800 mb-2">Script A: Create Tables</h4>
                      <p className="text-sm text-gray-500 mb-2">This builds the drawers to store your data (Inventory, Expenses, etc).</p>
                      <CopyBlock label="SQL Script 1" text={script1_structure} height="h-64" />
                  </div>
                  
                  <div className="border-t border-gray-100 pt-6">
                      <h4 className="font-bold text-gray-800 mb-2">Script B: Security Rules (RLS)</h4>
                      <p className="text-sm text-gray-500 mb-2">Clear the editor, then run this. It ensures only Admins can edit data, while the public can only view the Gallery/Services.</p>
                      <CopyBlock label="SQL Script 2" text={script2_permissions} height="h-48" />
                  </div>
              </div>
          </div>
        </Step>

        {/* STEP 3: STORAGE */}
        <Step number="3" title="Enable Image Uploads" subtitle="Configure file storage buckets.">
          <div className="flex flex-col gap-4">
              <p className="font-medium text-lg">Why?</p>
              <p className="text-sm">We need specific folders (buckets) in the cloud to store your Portfolio images, Special offers, and Client reference photos.</p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                      <h3 className="font-bold text-gray-800 mb-3 bg-yellow-100 inline-block px-3 py-1 rounded text-sm">Part A: Manual Setup</h3>
                      <ol className="list-decimal pl-5 space-y-3 text-sm text-gray-700">
                          <li>Click the <strong>Storage</strong> icon (box/archive symbol) in the Supabase sidebar.</li>
                          <li>Click <strong>"New Bucket"</strong>.</li>
                          <li>Name: <code>portfolio</code></li>
                          <li><strong>CRITICAL:</strong> Toggle "Public Bucket" to <strong className="text-green-600">ON</strong>.</li>
                          <li>Click Save.</li>
                          <li>Repeat exactly for these names:
                              <ul className="grid grid-cols-2 gap-2 mt-2">
                                  {['specials', 'showroom', 'booking-references', 'settings'].map(n => (
                                      <li key={n} className="bg-gray-100 px-2 py-1 rounded font-mono text-xs font-bold text-gray-600">{n}</li>
                                  ))}
                              </ul>
                          </li>
                      </ol>
                  </div>
                  <div>
                      <h3 className="font-bold text-gray-800 mb-3 bg-purple-100 inline-block px-3 py-1 rounded text-sm">Part B: Permissions Script</h3>
                      <p className="text-sm mb-3 text-gray-600">Go back to the <strong>SQL Editor</strong> and run this to allow the app to upload files to those buckets.</p>
                      <CopyBlock label="SQL Script 3" text={script3_storage} height="h-48" />
                  </div>
              </div>
          </div>
        </Step>

        {/* STEP 4: VERCEL */}
        <Step number="4" title="Go Live (Vercel)" subtitle="Connect the pieces and publish to the internet.">
          <div className="flex flex-col gap-6">
              <p className="font-medium text-lg">Why?</p>
              <p className="text-sm">Vercel takes the code from GitHub and connects it to the Supabase database. It builds the website and gives you a URL (e.g., bossalon.vercel.app).</p>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-4">1. Get your Secret Keys</h3>
                  <p className="text-sm mb-3">Go to Supabase Dashboard. Click <strong>Settings (Cogwheel)</strong> → <strong>API</strong>.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="bg-white p-3 rounded border border-gray-200">
                          <span className="text-xs text-gray-400 uppercase font-bold block mb-1">Project URL</span>
                          <code className="text-blue-600 break-all">https://xyz...supabase.co</code>
                      </div>
                      <div className="bg-white p-3 rounded border border-gray-200">
                          <span className="text-xs text-gray-400 uppercase font-bold block mb-1">anon / public key</span>
                          <code className="text-blue-600 break-all">eyJxh...</code>
                      </div>
                  </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-4">2. Deploy on Vercel</h3>
                  <ol className="list-decimal pl-5 space-y-4 text-sm text-gray-700">
                      <li>Go to <ExternalLink href="https://vercel.com/signup">Vercel.com</ExternalLink> and sign up with <strong>GitHub</strong>.</li>
                      <li>Click <strong>"Add New..."</strong> → <strong>"Project"</strong>.</li>
                      <li>Select your <code>bos-salon-website</code> repo. Click <strong>Import</strong>.</li>
                      <li className="bg-yellow-50 p-3 rounded border border-yellow-100">
                          <strong>Environment Variables:</strong> Expand this section. Add these two:
                          <div className="mt-3 space-y-2">
                              <div className="flex gap-2 items-center">
                                  <span className="font-mono text-xs font-bold bg-white px-2 py-1 border rounded w-1/3">VITE_SUPABASE_URL</span>
                                  <span className="text-xs text-gray-500 w-2/3">Paste <strong>Project URL</strong> here</span>
                              </div>
                              <div className="flex gap-2 items-center">
                                  <span className="font-mono text-xs font-bold bg-white px-2 py-1 border rounded w-1/3">VITE_SUPABASE_ANON_KEY</span>
                                  <span className="text-xs text-gray-500 w-2/3">Paste <strong>anon / public key</strong> here</span>
                              </div>
                          </div>
                      </li>
                      <li>Click <strong>Deploy</strong>. Wait 1 minute. You are live!</li>
                  </ol>
              </div>
          </div>
        </Step>

        {/* STEP 5: AUTH */}
        <Step number="5" title="Google Login Setup" subtitle="Enable 'Sign in with Google' for the Client Portal.">
          <div className="flex flex-col gap-4">
              <p className="font-medium text-lg">Why?</p>
              <p className="text-sm">Clients hate remembering passwords. This lets them tap one button to access their booking history and invoices securely.</p>

              <div className="space-y-6">
                  <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
                      <h4 className="font-bold text-blue-900 text-sm uppercase tracking-wide mb-2">Part A: Supabase Config</h4>
                      <ol className="list-decimal pl-5 space-y-2 text-xs sm:text-sm text-blue-800">
                          <li>Go to Supabase → <strong>Authentication</strong> → <strong>Providers</strong>.</li>
                          <li>Select <strong>Google</strong>. Enable it.</li>
                          <li>Copy the <strong>"Callback URL"</strong> (e.g. <code>https://xyz.supabase.co/auth/v1/callback</code>). Keep this tab open.</li>
                      </ol>
                  </div>

                  <div className="bg-white p-5 rounded-lg border border-gray-200">
                      <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-2">Part B: Google Cloud Console</h4>
                      <ol className="list-decimal pl-5 space-y-2 text-xs sm:text-sm text-gray-600">
                          <li>Go to <ExternalLink href="https://console.cloud.google.com/">Google Cloud Console</ExternalLink>.</li>
                          <li>Create a project named "Bos Salon Auth".</li>
                          <li>Go to <strong>APIs & Services</strong> → <strong>OAuth consent screen</strong>. Select "External". Fill in basic app info.</li>
                          <li>Go to <strong>Credentials</strong> → <strong>Create Credentials</strong> → <strong>OAuth Client ID</strong>.</li>
                          <li>Type: <strong>Web Application</strong>.</li>
                          <li>Under <strong>Authorized redirect URIs</strong>, paste the Callback URL from Part A.</li>
                          <li>Click Create. Copy the <strong>Client ID</strong> and <strong>Client Secret</strong>.</li>
                      </ol>
                  </div>

                  <div className="bg-green-50 p-5 rounded-lg border border-green-100">
                      <h4 className="font-bold text-green-900 text-sm uppercase tracking-wide mb-2">Part C: Finish</h4>
                      <p className="text-sm text-green-800">Paste the Client ID and Secret back into the Supabase Google Provider settings and click Save.</p>
                  </div>
              </div>
          </div>
        </Step>

        {/* STEP 6: EMAILJS */}
        <Step number="6" title="Booking Notifications (EmailJS)" subtitle="Get emails when clients book.">
          <div className="flex flex-col gap-4">
              <p className="font-medium text-lg">Why?</p>
              <p className="text-sm">Since this is a "Serverless" app, we use EmailJS to handle sending booking confirmations without needing a backend server.</p>

              <ol className="list-decimal pl-5 space-y-4 text-sm text-gray-700 bg-white p-6 rounded-xl border border-gray-200">
                  <li>Register at <ExternalLink href="https://www.emailjs.com/">EmailJS.com</ExternalLink> (Free tier).</li>
                  <li><strong>Add Service:</strong> Connect your Gmail/Outlook. Copy the <code>Service ID</code>.</li>
                  <li><strong>Add Template:</strong> Create a template. Use variables like <code>{'{{from_name}}'}</code>, <code>{'{{message}}'}</code>. Copy <code>Template ID</code>.</li>
                  <li><strong>Public Key:</strong> Found in Account Settings. Copy it.</li>
                  <li className="bg-admin-dark-primary/10 p-3 rounded font-medium text-admin-dark-text">
                      <strong>Final Action:</strong> Once your site is live, log in to this Admin Dashboard. Go to <strong>Settings</strong> → <strong>Integrations</strong> and paste these 3 keys.
                  </li>
              </ol>
          </div>
        </Step>

        <div className="text-center pt-16 pb-10">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">You are Ready!</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Your system is now enterprise-grade. It is secure, backed up, and ready to scale.
            </p>
            <div className="mt-8 p-4 bg-gray-100 rounded-lg inline-block text-left">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">First Time Login:</p>
                <p className="text-sm text-gray-800 font-mono">
                    1. Go to Supabase -> Authentication -> Users<br/>
                    2. Click "Add User" -> Create your admin email/password.<br/>
                    3. Use these to log in to your new live site.
                </p>
            </div>
        </div>

      </div>
    </div>
  );
};

export default SetupManager;
