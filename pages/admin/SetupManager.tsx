
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
  // Script for creating structure
  const structureScript = `
-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Create Tables (If they don't exist)

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
  "priceType" text default 'fixed',
  "priceValue" numeric,
  details text[],
  "voucherCode" text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Showroom (Genres)
create table if not exists public.showroom (
  id uuid primary key default uuid_generate_v4(),
  name text,
  items jsonb default '[]'::jsonb,
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
  status text default 'pending',
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

-- Settings
create table if not exists public.settings (
  id text primary key,
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
`.trim();

  const tablePermissionsScript = `
-- --- TABLE PERMISSIONS SCRIPT ---
-- Use this if you get "Permission denied" when saving/editing data (text/numbers)

-- 1. Enable RLS on all tables
alter table public.expenses enable row level security;
alter table public.inventory enable row level security;
alter table public.portfolio enable row level security;
alter table public.specials enable row level security;
alter table public.showroom enable row level security;
alter table public.settings enable row level security;
alter table public.bookings enable row level security;
alter table public.invoices enable row level security;
alter table public.clients enable row level security;

-- 2. Clean up old policies (to avoid conflicts)
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

-- 3. Create New Policies

-- Admin Only Tables (Expenses, Inventory)
create policy "Admin Expenses" on public.expenses for all using (auth.role() = 'authenticated');
create policy "Admin Inventory" on public.inventory for all using (auth.role() = 'authenticated');

-- Public Read / Admin Write (Portfolio, Specials, Showroom, Settings)
create policy "Public Read Portfolio" on public.portfolio for select using (true);
create policy "Admin Write Portfolio" on public.portfolio for all using (auth.role() = 'authenticated');

create policy "Public Read Specials" on public.specials for select using (true);
create policy "Admin Write Specials" on public.specials for all using (auth.role() = 'authenticated');

create policy "Public Read Showroom" on public.showroom for select using (true);
create policy "Admin Write Showroom" on public.showroom for all using (auth.role() = 'authenticated');

create policy "Public Read Settings" on public.settings for select using (true);
create policy "Admin Write Settings" on public.settings for all using (auth.role() = 'authenticated');

-- Operational Data (Bookings, Invoices, Clients)
-- Open for App Logic (Client Portal + Admin)
create policy "App Access Bookings" on public.bookings for all using (true);
create policy "App Access Invoices" on public.invoices for all using (true);
create policy "App Access Clients" on public.clients for all using (true);
`.trim();

  const storagePermissionsScript = `
-- --- STORAGE PERMISSIONS SCRIPT ---
-- Use this if you get "Permission denied" when uploading images/videos

-- 1. Enable RLS on storage.objects
alter table storage.objects enable row level security;

-- 2. Drop old policies
drop policy if exists "Public Read Access" on storage.objects;
drop policy if exists "Admin Insert Access" on storage.objects;
drop policy if exists "Admin Update Access" on storage.objects;
drop policy if exists "Admin Delete Access" on storage.objects;

-- 3. Allow PUBLIC to READ files (so images load on website)
create policy "Public Read Access"
on storage.objects for select
using ( bucket_id in ('portfolio', 'specials', 'showroom', 'booking-references', 'settings') );

-- 4. Allow ADMIN (Authenticated) to UPLOAD/EDIT files
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
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-5xl font-black text-admin-dark-text tracking-tight">System Setup</h1>
        <p className="text-lg text-admin-dark-text-secondary max-w-2xl mx-auto">
          Complete these steps to connect your database and enable all features.
        </p>
      </div>

      {/* PHASE 1: SUPABASE CONFIG */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="bg-green-600 p-6 border-b border-green-700">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="bg-white text-green-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
            Database Tables
          </h2>
        </div>
        <div className="p-8 space-y-6">
          <p className="text-gray-600">Run this script first to create the data structure.</p>
          <CopyBlock label="1. Create Tables Script" text={structureScript} />
          
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mt-6">
              <h4 className="font-bold text-red-800 mb-2">Error 42501 when running this?</h4>
              <p className="text-sm text-red-700">
                  If you manually created tables before running this script, delete them first in the Table Editor, then run this script.
              </p>
          </div>
        </div>
      </div>

      {/* PHASE 2: STORAGE BUCKETS */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="bg-teal-600 p-6 border-b border-teal-700">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="bg-white text-teal-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
            Storage Buckets
          </h2>
        </div>
        <div className="p-8 space-y-6">
          <p className="text-gray-600">Create these <strong>Public</strong> buckets in the Storage tab of Supabase:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['portfolio', 'specials', 'showroom', 'booking-references', 'settings'].map(bucket => (
                  <div key={bucket} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                      <div className={`w-3 h-3 rounded-full bg-teal-500`}></div>
                      <span className="font-mono font-bold text-gray-700">{bucket}</span>
                  </div>
              ))}
          </div>
        </div>
      </div>

      {/* PHASE 3: PERMISSIONS (CRITICAL) */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="bg-purple-600 p-6 border-b border-purple-700">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="bg-white text-purple-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
            Fix Permissions (RLS)
          </h2>
        </div>
        <div className="p-8 space-y-8">
          <div className="bg-yellow-50 p-4 border-l-4 border-yellow-400 text-yellow-800 text-sm">
              <strong>Why is this needed?</strong> By default, Supabase blocks all actions (Read/Write/Upload) for security. You must run these scripts to tell it "The Admin is allowed to edit everything" and "The Public can read portfolio items".
          </div>

          <div>
              <h3 className="font-bold text-lg text-gray-800 mb-2">A. Fix Data Saving (Text/Numbers)</h3>
              <p className="text-sm text-gray-500 mb-2">Run this if you can't save bookings, clients, or settings.</p>
              <CopyBlock label="Table Permissions Script" text={tablePermissionsScript} />
          </div>

          <div className="border-t pt-6">
              <h3 className="font-bold text-lg text-gray-800 mb-2">B. Fix File Uploads (Images)</h3>
              <p className="text-sm text-gray-500 mb-2">Run this if image uploads fail.</p>
              <CopyBlock label="Storage Permissions Script" text={storagePermissionsScript} />
          </div>
        </div>
      </div>

    </div>
  );
};

export default SetupManager;
