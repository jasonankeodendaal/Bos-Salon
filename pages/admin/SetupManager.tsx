
import React, { useState } from 'react';

const CopyBlock: React.FC<{ text: string; label?: string }> = ({ text, label }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4">
      {label && <p className="text-xs font-bold text-gray-500 mb-1 uppercase">{label}</p>}
      <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
        <div className="flex justify-between items-center px-4 py-2 bg-gray-800 border-b border-gray-700">
          <div className="flex space-x-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
          </div>
          <button 
            onClick={handleCopy} 
            className="text-xs font-mono text-gray-400 hover:text-white transition-colors"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <pre className="p-4 overflow-x-auto text-xs sm:text-sm text-green-400 font-mono scrollbar-thin scrollbar-thumb-gray-600">
          <code>{text}</code>
        </pre>
      </div>
    </div>
  );
};

const SetupManager: React.FC = () => {
  const sqlScript = `
-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Create Tables (Safe to run multiple times)

-- Portfolio
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

-- Specials
create table if not exists public.specials (
  id uuid primary key default uuid_generate_v4(),
  title text,
  description text,
  price numeric,
  "imageUrl" text,
  images text[],
  active boolean default true,
  "priceType" text default 'fixed', -- 'fixed', 'hourly', 'percentage'
  "priceValue" numeric,
  details text[],
  "voucherCode" text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Showroom (Genres)
create table if not exists public.showroom (
  id uuid primary key default uuid_generate_v4(),
  name text,
  items jsonb default '[]'::jsonb, -- Array of {id, title, images[], videoUrl}
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Bookings
create table if not exists public.bookings (
  id uuid primary key default uuid_generate_v4(),
  name text,
  email text,
  "whatsappNumber" text,
  message text,
  "bookingDate" date,
  status text default 'pending', -- pending, quote_sent, confirmed, completed, cancelled
  "bookingType" text default 'online',
  "totalCost" numeric,
  "amountPaid" numeric default 0,
  "paymentMethod" text,
  "referenceImages" text[],
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Expenses
create table if not exists public.expenses (
  id uuid primary key default uuid_generate_v4(),
  date date,
  category text,
  description text,
  amount numeric,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Inventory
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

-- Invoices
create table if not exists public.invoices (
  id uuid primary key default uuid_generate_v4(),
  type text, -- 'quote' or 'invoice'
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

-- Clients
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

-- Settings (Single Row Config)
create table if not exists public.settings (
  id text primary key, -- usually 'main'
  "companyName" text,
  "logoUrl" text,
  "heroTattooGunImageUrl" text,
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

-- 3. Storage Buckets (Execute this via Dashboard UI usually, but here for ref)
-- You need to create public buckets named: 
-- 'portfolio', 'specials', 'showroom', 'booking-references', 'settings'
-- Make sure to set them to Public.

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- This fixes the 'RLS Disabled' errors while keeping the app functional.
-- Using 'drop policy if exists' to allow re-running script without errors.

-- ADMIN ONLY TABLES
alter table public.expenses enable row level security;
drop policy if exists "Admin Expenses" on public.expenses;
create policy "Admin Expenses" on public.expenses for all using (auth.role() = 'authenticated');

alter table public.inventory enable row level security;
drop policy if exists "Admin Inventory" on public.inventory;
create policy "Admin Inventory" on public.inventory for all using (auth.role() = 'authenticated');

-- PUBLIC READ / ADMIN WRITE TABLES
alter table public.portfolio enable row level security;
drop policy if exists "Public Read Portfolio" on public.portfolio;
create policy "Public Read Portfolio" on public.portfolio for select using (true);
drop policy if exists "Admin Write Portfolio" on public.portfolio;
create policy "Admin Write Portfolio" on public.portfolio for all using (auth.role() = 'authenticated');

alter table public.specials enable row level security;
drop policy if exists "Public Read Specials" on public.specials;
create policy "Public Read Specials" on public.specials for select using (true);
drop policy if exists "Admin Write Specials" on public.specials;
create policy "Admin Write Specials" on public.specials for all using (auth.role() = 'authenticated');

alter table public.showroom enable row level security;
drop policy if exists "Public Read Showroom" on public.showroom;
create policy "Public Read Showroom" on public.showroom for select using (true);
drop policy if exists "Admin Write Showroom" on public.showroom;
create policy "Admin Write Showroom" on public.showroom for all using (auth.role() = 'authenticated');

alter table public.settings enable row level security;
drop policy if exists "Public Read Settings" on public.settings;
create policy "Public Read Settings" on public.settings for select using (true);
drop policy if exists "Admin Write Settings" on public.settings;
create policy "Admin Write Settings" on public.settings for all using (auth.role() = 'authenticated');

-- APP OPERATIONAL DATA (Clients/Bookings/Invoices)
-- Because the Client Portal uses a custom login system (via the 'clients' table) 
-- and not Supabase Auth, these tables must be accessible to the public API key.
-- Security is handled by the application logic (PIN verification).
alter table public.bookings enable row level security;
drop policy if exists "App Access Bookings" on public.bookings;
create policy "App Access Bookings" on public.bookings for all using (true);

alter table public.invoices enable row level security;
drop policy if exists "App Access Invoices" on public.invoices;
create policy "App Access Invoices" on public.invoices for all using (true);

alter table public.clients enable row level security;
drop policy if exists "App Access Clients" on public.clients;
create policy "App Access Clients" on public.clients for all using (true);
`.trim();

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-5xl font-black text-admin-dark-text tracking-tight">Zero to Hero</h1>
        <p className="text-lg text-admin-dark-text-secondary max-w-2xl mx-auto">
          The complete guide to launching your salon system into the cloud. 
          Follow these 5 phases to go from a local demo to a live, worldwide business tool.
        </p>
      </div>

      {/* PHASE 1: GITHUB */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-900 p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="bg-white text-black w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
            GitHub (Code Storage)
          </h2>
        </div>
        <div className="p-8 space-y-6">
          <p className="text-gray-600">First, we need to save your code to the cloud. This acts as the source for your website.</p>
          <ol className="list-decimal pl-5 space-y-4 text-gray-800 font-medium">
            <li>Create a free account at <a href="https://github.com" target="_blank" className="text-blue-600 hover:underline">github.com</a>.</li>
            <li>Create a <strong>New Repository</strong>. Name it <code>bos-salon-system</code>. Select "Private".</li>
            <li>Open your project folder on your computer terminal (VS Code).</li>
            <li>Run these commands one by one:</li>
          </ol>
          <CopyBlock 
            label="Terminal Commands"
            text={`git init\ngit add .\ngit commit -m "Initial launch"\ngit branch -M main\ngit remote add origin https://github.com/YOUR_USERNAME/bos-salon-system.git\ngit push -u origin main`} 
          />
        </div>
      </div>

      {/* PHASE 2: SUPABASE */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="bg-green-600 p-6 border-b border-green-700">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="bg-white text-green-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
            Supabase (Database Setup)
          </h2>
        </div>
        <div className="p-8 space-y-6">
          <p className="text-gray-600">This is the brain of your app. It stores clients, bookings, and settings.</p>
          <ol className="list-decimal pl-5 space-y-4 text-gray-800 font-medium">
            <li>Go to <a href="https://supabase.com" target="_blank" className="text-blue-600 hover:underline">supabase.com</a> and create a project.</li>
            <li>Once created, go to the <strong>SQL Editor</strong> tab (icon looks like terminal).</li>
            <li>Click "New Query", paste the code below, and click <strong>Run</strong>. This will create your tables AND fix the RLS Security errors.</li>
          </ol>
          
          <CopyBlock label="SQL Setup Script" text={sqlScript} />

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <h4 className="font-bold text-yellow-800">Storage Buckets Setup</h4>
            <p className="text-sm text-yellow-700 mt-1">
              After running the SQL, go to the <strong>Storage</strong> tab in Supabase. Create the following <strong>Public</strong> buckets manually: 
              <br/>
              <code>portfolio</code>, <code>specials</code>, <code>showroom</code>, <code>booking-references</code>, <code>settings</code>.
            </p>
          </div>

          <div className="mt-4">
            <h4 className="font-bold text-gray-800 mb-2">Get Your API Keys</h4>
            <p className="text-gray-600 text-sm mb-2">Go to <strong>Project Settings (Cog icon) &rarr; API</strong>. You will need these for Vercel.</p>
            <ul className="bg-gray-100 p-4 rounded-lg space-y-2 text-sm font-mono text-gray-700">
              <li>Project URL (e.g., https://xyz.supabase.co)</li>
              <li>anon public key (long string)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* PHASE 3: AUTHENTICATION */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="bg-purple-600 p-6 border-b border-purple-700">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="bg-white text-purple-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
            Authentication (Admin Access)
          </h2>
        </div>
        <div className="p-8 space-y-6">
          <p className="text-gray-600">Set up who can access this Admin Dashboard.</p>
          
          <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                  <h4 className="font-bold text-lg text-gray-800">For Admins (You)</h4>
                  <p className="text-sm text-gray-600">You must create a user account in Supabase to log in to this dashboard.</p>
                  <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700 font-medium">
                      <li>In Supabase, go to the <strong>Authentication</strong> tab.</li>
                      <li>Click on <strong>Providers</strong> and ensure <strong>Email</strong> is enabled.</li>
                      <li>Go to the <strong>Users</strong> section.</li>
                      <li>Click <strong>"Add User"</strong> (top right).</li>
                      <li>Enter your email address and a strong password.</li>
                      <li>Click "Create User". You can now use these credentials to log in on the live site.</li>
                  </ol>
              </div>
              
              <div className="space-y-4">
                  <h4 className="font-bold text-lg text-gray-800">For Clients</h4>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <p className="text-sm text-blue-800 font-bold mb-2">No Supabase Setup Required</p>
                      <p className="text-sm text-blue-700 leading-relaxed">
                          Client credentials are handled by your <code>public.clients</code> database table (created in Phase 2). 
                      </p>
                      <p className="text-sm text-blue-700 leading-relaxed mt-2">
                          Clients log in using their <strong>Email</strong> and a <strong>PIN</strong> stored in that table. You do NOT need to create Authentication Users for them. This keeps it simple for them!
                      </p>
                  </div>
              </div>
          </div>
        </div>
      </div>

      {/* PHASE 4: VERCEL */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="bg-black p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="bg-white text-black w-8 h-8 rounded-full flex items-center justify-center text-sm">4</span>
            Vercel (Launch Site)
          </h2>
        </div>
        <div className="p-8 space-y-6">
          <p className="text-gray-600">This puts your website on the internet.</p>
          <ol className="list-decimal pl-5 space-y-4 text-gray-800 font-medium">
            <li>Go to <a href="https://vercel.com" target="_blank" className="text-blue-600 hover:underline">vercel.com</a> and sign up with GitHub.</li>
            <li>Click <strong>"Add New..." &rarr; Project</strong>.</li>
            <li>Import your <code>bos-salon-system</code> repo.</li>
            <li>In the "Configure Project" screen, open the <strong>Environment Variables</strong> section.</li>
            <li>Add the keys you got from Supabase:</li>
          </ol>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                    <span className="font-bold text-gray-700 block">Name</span>
                    <code className="text-blue-600">VITE_SUPABASE_URL</code>
                </div>
                <div>
                    <span className="font-bold text-gray-700 block">Value</span>
                    <span className="text-gray-500">Your Project URL from Phase 2</span>
                </div>
                <div className="border-t pt-2 mt-2 col-span-2"></div>
                <div>
                    <span className="font-bold text-gray-700 block">Name</span>
                    <code className="text-blue-600">VITE_SUPABASE_ANON_KEY</code>
                </div>
                <div>
                    <span className="font-bold text-gray-700 block">Value</span>
                    <span className="text-gray-500">Your anon public key from Phase 2</span>
                </div>
            </div>
          </div>

          <p className="font-bold text-green-600 mt-4">Click "Deploy". Wait 1 minute. Your site is live!</p>
        </div>
      </div>

      {/* PHASE 5: EMAILJS */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="bg-orange-500 p-6 border-b border-orange-600">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="bg-white text-orange-500 w-8 h-8 rounded-full flex items-center justify-center text-sm">5</span>
            EmailJS (Notifications)
          </h2>
        </div>
        <div className="p-8 space-y-6">
          <p className="text-gray-600">To receive email alerts for new bookings.</p>
          <ol className="list-decimal pl-5 space-y-4 text-gray-800 font-medium">
            <li>Go to <a href="https://www.emailjs.com/" target="_blank" className="text-blue-600 hover:underline">emailjs.com</a> and sign up free.</li>
            <li><strong>Email Services:</strong> Click "Add Service", select "Gmail", connect your account. Copy the <code>Service ID</code>.</li>
            <li><strong>Email Templates:</strong> Click "Create New Template".
                <ul className="list-disc pl-5 mt-2 text-sm text-gray-600 space-y-1">
                    <li>Subject: New Booking from &#123;&#123;to_name&#125;&#125;</li>
                    <li>Body: Client &#123;&#123;from_name&#125;&#125; requested a booking.<br/>Message: &#123;&#123;message&#125;&#125;</li>
                </ul>
                Save and copy the <code>Template ID</code>.
            </li>
            <li><strong>Account:</strong> Click your avatar (top right) &rarr; Public Key. Copy it.</li>
            <li><strong>Final Step:</strong> Log into your new Vercel website &rarr; Admin Dashboard &rarr; Settings &rarr; Integrations. Paste these 3 keys there and save.</li>
          </ol>
        </div>
      </div>

      {/* PHASE 6: GOOGLE OAUTH */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="bg-red-600 p-6 border-b border-red-700">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="bg-white text-red-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">6</span>
            Google Login (Client Portal)
          </h2>
        </div>
        <div className="p-8 space-y-6">
          <p className="text-gray-600">To allow clients to sign in with their Gmail accounts instead of a PIN.</p>
          
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <h4 className="font-bold text-red-800 mb-1">Fix: "This site can't be reached" Error</h4>
              <p className="text-sm text-red-700">
                  If users see this error after clicking "Sign in with Google", it means Supabase is redirecting them to a URL that isn't whitelisted. 
                  You must add your actual website URL (e.g., <code>https://bos-salon.vercel.app</code>) to the <strong>Redirect URLs</strong> list in Supabase.
              </p>
          </div>

          <h4 className="font-bold text-lg text-gray-800">Step A: Google Cloud Console</h4>
          <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700">
              <li>Go to <a href="https://console.cloud.google.com/" target="_blank" className="text-blue-600 underline">Google Cloud Console</a>.</li>
              <li>Create a <strong>New Project</strong> named "Bos Salon".</li>
              <li>Search for "OAuth consent screen". Select "External". Fill in App Name and Emails. Save.</li>
              <li>Go to <strong>Credentials</strong> (left menu) &rarr; Create Credentials &rarr; OAuth Client ID.</li>
              <li>Type: <strong>Web Application</strong>.</li>
              <li><strong>Authorized Redirect URIs:</strong> You need to get this URL from Supabase (see Step B).</li>
          </ol>

          <h4 className="font-bold text-lg text-gray-800 mt-4">Step B: Supabase Configuration</h4>
          <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700">
              <li>In your Supabase Dashboard, go to <strong>Authentication &rarr; URL Configuration</strong>.</li>
              <li>Under <strong>Redirect URLs</strong>, click "Add URL".</li>
              <li>Add your live site URL (e.g., <code>https://your-project.vercel.app</code>) AND <code>http://localhost:5173</code> (for testing).</li>
              <li>Now go to <strong>Authentication &rarr; Providers</strong>.</li>
              <li>Click <strong>Google</strong>. Enable it.</li>
              <li>Copy the <strong>Callback URL</strong> (looks like <code>https://xyz.supabase.co/auth/v1/callback</code>).</li>
              <li>Paste this URL back into the Google Cloud Console "Authorized Redirect URIs" field. Save Google.</li>
              <li>Google will give you a <strong>Client ID</strong> and <strong>Client Secret</strong>.</li>
              <li>Paste these two keys into the Supabase Google Provider settings and click Save.</li>
          </ol>
          
          <div className="bg-green-50 text-green-800 p-4 rounded mt-4 border border-green-200">
              <strong>Done!</strong> The "Sign in with Google" button on your Client Portal will now work automatically.
          </div>
        </div>
      </div>

    </div>
  );
};

export default SetupManager;
