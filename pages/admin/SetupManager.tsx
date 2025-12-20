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
      {label && <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-widest">{label}</p>}
      <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-700 shadow-2xl relative group">
        <div className="flex justify-between items-center px-4 py-2 bg-gray-800 border-b border-gray-700">
          <div className="flex space-x-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/40"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/40"></div>
          </div>
          <button 
            onClick={handleCopy} 
            className={`text-[10px] font-mono font-bold transition-colors px-2 py-0.5 rounded ${copied ? 'bg-green-500/20 text-green-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            {copied ? 'COPIED!' : 'COPY CODE'}
          </button>
        </div>
        <pre className={`p-4 overflow-auto ${height} text-[11px] sm:text-xs text-green-400 font-mono leading-relaxed custom-scrollbar`}>
          <code>{text}</code>
        </pre>
      </div>
    </div>
  );
};

const ExternalLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-400 underline font-bold decoration-blue-500/30 underline-offset-4 inline-flex items-center gap-1 transition-all">
        {children} <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
    </a>
);

const StepWrapper: React.FC<{ number: string; title: string; subtitle?: string; children: React.ReactNode; isActive: boolean; onHeaderClick: () => void }> = ({ number, title, subtitle, children, isActive, onHeaderClick }) => (
    <div className={`bg-white rounded-2xl shadow-xl border transition-all duration-500 overflow-hidden mb-6 ${isActive ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-gray-200 opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0'}`}>
        <button 
            onClick={onHeaderClick}
            className="w-full text-left bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-100 flex items-center gap-4 group"
        >
            <span className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shadow-lg transition-all duration-300 ${isActive ? 'bg-blue-600 text-white scale-110' : 'bg-gray-200 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600'}`}>{number}</span>
            <div className="flex-grow">
                <h2 className={`text-xl font-bold transition-colors ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>{title}</h2>
                {subtitle && <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mt-0.5">{subtitle}</p>}
            </div>
            <div className={`transition-transform duration-300 ${isActive ? 'rotate-180' : ''}`}>
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </div>
        </button>
        {isActive && (
            <div className="p-6 md:p-8 space-y-6 text-gray-600 leading-relaxed animate-fade-in">
                {children}
            </div>
        )}
    </div>
);

const SetupManager: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(3); 

  const sql_structure = `
-- ==========================================
-- PHASE A: DATABASE INFRASTRUCTURE
-- ==========================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. MASTER TABLE CREATION
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
  "contactMethod" text,
  message text,
  "bookingDate" date,
  status text default 'pending',
  "bookingType" text default 'online',
  "totalCost" numeric,
  "amountPaid" numeric default 0,
  "paymentMethod" text,
  "confirmationMethod" text,
  "referenceImages" text[],
  "selectedOptions" text[],
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
  subject text,
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
  age integer,
  address text,
  "totalSpend" numeric default 0,
  "visitCount" integer default 0,
  "lastVisit" text,
  "bookings" jsonb default '[]'::jsonb,
  "invoices" jsonb default '[]'::jsonb,
  "preferredPayment" text,
  "tier" text,
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
  "loungePerks" jsonb default '[]'::jsonb,
  "bookingOptions" jsonb default '[]'::jsonb,
  "businessHours" text,
  hero jsonb,
  about jsonb,
  contact jsonb,
  aftercare jsonb,
  payments jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- ==========================================
-- 3. SCHEMA REPAIR (Safely add missing columns)
-- ==========================================
DO $$ 
BEGIN 
  -- Settings Table Fixes
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='settings' AND column_name='loungePerks') THEN
    ALTER TABLE public.settings ADD COLUMN "loungePerks" jsonb DEFAULT '[]'::jsonb;
  END IF;
  
  -- Transfer data from old column if exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='settings' AND column_name='sanctuaryPerks') THEN
    UPDATE public.settings SET "loungePerks" = "sanctuaryPerks" WHERE "loungePerks" = '[]'::jsonb;
  END IF;

  -- Bookings Table Fixes
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='contactMethod') THEN
    ALTER TABLE public.bookings ADD COLUMN "contactMethod" text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='confirmationMethod') THEN
    ALTER TABLE public.bookings ADD COLUMN "confirmationMethod" text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='selectedOptions') THEN
    ALTER TABLE public.bookings ADD COLUMN "selectedOptions" text[];
  END IF;

  -- Clients Table Fixes
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='loyaltyProgress') THEN
    ALTER TABLE public.clients ADD COLUMN "loyaltyProgress" jsonb DEFAULT '{}'::jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='totalSpend') THEN
    ALTER TABLE public.clients ADD COLUMN "totalSpend" numeric default 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='visitCount') THEN
    ALTER TABLE public.clients ADD COLUMN "visitCount" integer default 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='lastVisit') THEN
    ALTER TABLE public.clients ADD COLUMN "lastVisit" text;
  END IF;

END $$;
`.trim();

  const sql_permissions = `
-- ==========================================
-- PHASE B: SECURITY POLICIES (RLS)
-- ==========================================

alter table public.expenses enable row level security;
alter table public.inventory enable row level security;
alter table public.portfolio enable row level security;
alter table public.specials enable row level security;
alter table public.showroom enable row level security;
alter table public.settings enable row level security;
alter table public.bookings enable row level security;
alter table public.invoices enable row level security;
alter table public.clients enable row level security;

-- Define Policies (Simplified for broad app use)
create policy "Admin All" on public.expenses for all using (auth.role() = 'authenticated');
create policy "Admin All Inv" on public.inventory for all using (auth.role() = 'authenticated');
create policy "Public Read All" on public.portfolio for select using (true);
create policy "Public Read All Spec" on public.specials for select using (true);
create policy "Public Read All Show" on public.showroom for select using (true);
create policy "Public Read All Sett" on public.settings for select using (true);
create policy "Admin All Sett" on public.settings for all using (auth.role() = 'authenticated');
create policy "Admin All Port" on public.portfolio for all using (auth.role() = 'authenticated');
create policy "Admin All Spec" on public.specials for all using (auth.role() = 'authenticated');
create policy "Admin All Show" on public.showroom for all using (auth.role() = 'authenticated');
create policy "Public All Book" on public.bookings for all using (true);
create policy "Public All Inv" on public.invoices for all using (true);
create policy "Public All Cli" on public.clients for all using (true);
`.trim();

  const sql_realtime = `
-- ==========================================
-- PHASE C: REALTIME SUBSCRIPTION CONFIG
-- ==========================================

DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE 
    public.portfolio, 
    public.specials, 
    public.showroom, 
    public.bookings, 
    public.expenses, 
    public.inventory, 
    public.settings, 
    public.invoices, 
    public.clients;
`.trim();

  const env_template = `
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
`.trim();

  return (
    <div className="relative min-h-screen font-sans bg-gray-50 pb-24">
      <div className="fixed inset-0 pointer-events-none opacity-10 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-500 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
        <header className="text-center py-16 space-y-4">
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight drop-shadow-sm">System Setup</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-medium">Initialize your Cloud Studio Database.</p>
        </header>

        <div className="space-y-4">
            <StepWrapper number="1" title="Backend Engine" subtitle="Supabase Setup" isActive={activeStep === 1} onHeaderClick={() => setActiveStep(1)}>
                <p>Create a project on <ExternalLink href="https://supabase.com">Supabase</ExternalLink> and get your API Keys.</p>
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                    <CopyBlock text={env_template} label="Env Template" />
                </div>
            </StepWrapper>

            <StepWrapper number="2" title="Media Storage" subtitle="Buckets" isActive={activeStep === 2} onHeaderClick={() => setActiveStep(2)}>
                <p>Ensure these **Public** buckets exist in Supabase Storage:</p>
                <ul className="list-disc pl-5 font-mono text-xs space-y-1">
                    <li>portfolio</li>
                    <li>specials</li>
                    <li>showroom</li>
                    <li>settings</li>
                    <li>booking-references</li>
                </ul>
            </StepWrapper>

            <StepWrapper number="3" title="Database Architecture" subtitle="SQL Scripts" isActive={activeStep === 3} onHeaderClick={() => setActiveStep(3)}>
                <p>Run these scripts in your Supabase SQL Editor. **Phase A** includes the fix for the `loungePerks` column.</p>
                <div className="space-y-8">
                    <section>
                        <h4 className="font-bold text-gray-800 mb-2">Phase A: Structure & Schema Repair</h4>
                        <CopyBlock text={sql_structure} height="h-96" label="Structure Script" />
                    </section>
                    <section>
                        <h4 className="font-bold text-gray-800 mb-2">Phase B: Security Policies (RLS)</h4>
                        <CopyBlock text={sql_permissions} height="h-32" label="Security Script" />
                    </section>
                    <section>
                        <h4 className="font-bold text-gray-800 mb-2">Phase C: Realtime Subscription</h4>
                        <CopyBlock text={sql_realtime} height="h-32" label="Realtime Script" />
                    </section>
                </div>
            </StepWrapper>

            <StepWrapper number="4" title="Final Launch" subtitle="Vercel Deployment" isActive={activeStep === 4} onHeaderClick={() => setActiveStep(4)}>
                <p>Deploy your code to Vercel and add your environment variables. If you see schema errors, run Phase A again in Supabase.</p>
                <div className="mt-8 bg-brand-green text-white p-6 rounded-2xl text-center shadow-xl">
                    <h3 className="text-2xl font-bold mb-2">Ready to Go! 🚀</h3>
                    <p className="text-white/80">Your cloud-connected studio is now operational.</p>
                </div>
            </StepWrapper>
        </div>
      </div>
    </div>
  );
};

export default SetupManager;