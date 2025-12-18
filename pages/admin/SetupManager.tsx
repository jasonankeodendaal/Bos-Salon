
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
        {children} <span className="text-[10px]">&rarr;</span>
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

const SetupManager: React.FC = () => {
  const script1_structure = `
-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. CREATE TABLES
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

create table if not exists public.showroom (
  id uuid primary key default uuid_generate_v4(),
  name text,
  items jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

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

create table if not exists public.expenses (
  id uuid primary key default uuid_generate_v4(),
  date date,
  category text,
  description text,
  amount numeric,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

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
  company jsonb default '{}'::jsonb,
  hero jsonb,
  about jsonb,
  contact jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. SCHEMA MIGRATIONS (Run if columns are missing)
alter table public.settings add column if not exists "company" jsonb default '{}'::jsonb;
alter table public.settings add column if not exists "heroBgUrl" text;
alter table public.settings add column if not exists "aboutUsImageUrl" text;
alter table public.settings add column if not exists "loyaltyPrograms" jsonb;
`.trim();

  return (
    <div className="relative min-h-screen font-sans p-6">
      <div className="max-w-5xl mx-auto space-y-12">
        <header className="text-center">
            <h1 className="text-4xl font-black text-gray-800">Database Synchronization</h1>
            <p className="text-gray-500 mt-2">Ensure your Supabase project matches the latest features.</p>
        </header>

        <Step number="1" title="Structure Migration" subtitle="Update your database with new Company Profile columns.">
            <p className="text-sm">Copy and run this script in your <ExternalLink href="https://supabase.com/dashboard">Supabase SQL Editor</ExternalLink> to enable the new Studio CMS features.</p>
            <CopyBlock label="Migration SQL" text={script1_structure} height="h-96" />
        </Step>

        <div className="bg-green-50 p-6 rounded-2xl border border-green-200 text-center">
            <p className="text-green-800 font-bold">Your database structure is now ready for real-time company updates!</p>
        </div>
      </div>
    </div>
  );
};

export default SetupManager;
