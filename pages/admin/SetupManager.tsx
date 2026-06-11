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
      <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-700 shadow-xl relative group">
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
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500 underline font-bold decoration-blue-500/30 underline-offset-4 inline-flex items-center gap-1 transition-all">
        {children} <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
    </a>
);

const StepWrapper: React.FC<{ number: string; title: string; subtitle?: string; children: React.ReactNode; isActive: boolean; onHeaderClick: () => void }> = ({ number, title, subtitle, children, isActive, onHeaderClick }) => (
    <div className={`bg-white rounded-2xl shadow-xl border transition-all duration-500 overflow-hidden mb-6 ${isActive ? 'border-pink-500 ring-4 ring-pink-500/10' : 'border-gray-200 opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0'}`}>
        <button 
            onClick={onHeaderClick}
            className="w-full text-left bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-100 flex items-center gap-4 group"
        >
            <span className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shadow-lg transition-all duration-300 ${isActive ? 'bg-pink-600 text-white scale-110' : 'bg-gray-200 text-gray-500 group-hover:bg-pink-100 group-hover:text-pink-600'}`}>{number}</span>
            <div className="flex-grow">
                <h2 className={`text-xl font-bold transition-colors ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>{title}</h2>
                {subtitle && <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mt-0.5">{subtitle}</p>}
            </div>
            <div className={`transition-transform duration-300 ${isActive ? 'rotate-180' : ''}`}>
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </div>
        </button>
        {isActive && (
            <div className="p-6 md:p-8 space-y-6 text-gray-700 leading-relaxed animate-fade-in text-sm md:text-base">
                {children}
            </div>
        )}
    </div>
);

const SetupManager: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(3); 

  const env_template = `
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
`.trim();

  const sql_structure = `
-- ==========================================
-- PHASE A: DATABASE INFRASTRUCTURE
-- ==========================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. TABLES
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

create table if not exists public.clients (
  id uuid primary key default uuid_generate_v4(),
  name text,
  email text,
  phone text,
  password text,
  notes text,
  stickers numeric default 0,
  "loyaltyProgress" jsonb default '{}'::jsonb,
  "rewardsRedeemed" numeric default 0,
  age numeric,
  address text,
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

create table if not exists public.photo_library (
  id uuid primary key default uuid_generate_v4(),
  title text,
  story text,
  "primaryImage" text,
  "galleryImages" jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.photo_bookings (
  id uuid primary key default uuid_generate_v4(),
  clientName text,
  clientEmail text,
  clientPhone text,
  service text,
  date text,
  time text,
  message text,
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.photo_invoices (
  id uuid primary key default uuid_generate_v4(),
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
  "bookingOptions" jsonb default '[]'::jsonb,
  "businessHours" text,
  hero jsonb,
  about jsonb,
  contact jsonb,
  "aftercare" jsonb,
  "payments" jsonb default '{}'::jsonb,
  "loyaltyProgram" jsonb,
  "loyaltyPrograms" jsonb default '[]'::jsonb,
  "loungePerks" jsonb default '[]'::jsonb,
  "heroTitle" text,
  "heroSubtitle" text,
  "heroButtonText" text,
  "aboutTitle" text,
  "aboutText1" text,
  "aboutText2" text,
  "contactIntro" text,
  "processTitle" text,
  "processIntro" text,
  "processSteps" jsonb default '[]'::jsonb,
  "designTitle" text,
  "designIntro" text,
  "designPoints" jsonb default '[]'::jsonb,
  "aftercareTitle" text,
  "aftercareIntro" text,
  "aftercareSections" jsonb default '[]'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- ==========================================
-- 3. MIGRATIONS
-- ==========================================

alter table public.settings 
  add column if not exists "aftercare" jsonb,
  add column if not exists "payments" jsonb default '{}'::jsonb,
  add column if not exists "loyaltyProgram" jsonb,
  add column if not exists "loyaltyPrograms" jsonb default '[]'::jsonb,
  add column if not exists "loungePerks" jsonb default '[]'::jsonb,
  add column if not exists "heroTitle" text,
  add column if not exists "heroSubtitle" text,
  add column if not exists "heroButtonText" text,
  add column if not exists "aboutTitle" text,
  add column if not exists "aboutText1" text,
  add column if not exists "aboutText2" text,
  add column if not exists "contactIntro" text,
  add column if not exists "processTitle" text,
  add column if not exists "processIntro" text,
  add column if not exists "processSteps" jsonb default '[]'::jsonb,
  add column if not exists "designTitle" text,
  add column if not exists "designIntro" text,
  add column if not exists "designPoints" jsonb default '[]'::jsonb,
  add column if not exists "aftercareTitle" text,
  add column if not exists "aftercareIntro" text,
  add column if not exists "aftercareSections" jsonb default '[]'::jsonb;
`.trim();

  const sql_permissions = `
-- ==========================================
-- PHASE B: SECURITY POLICIES (RLS)
-- ==========================================

alter table public.portfolio enable row level security;
alter table public.specials enable row level security;
alter table public.showroom enable row level security;
alter table public.settings enable row level security;
alter table public.bookings enable row level security;
alter table public.clients enable row level security;
alter table public.invoices enable row level security;
alter table public.expenses enable row level security;
alter table public.inventory enable row level security;
alter table public.photo_library enable row level security;
alter table public.photo_bookings enable row level security;
alter table public.photo_invoices enable row level security;

-- Define Policies
drop policy if exists "Public Read All Port" on public.portfolio;
drop policy if exists "Public Read All Spec" on public.specials;
drop policy if exists "Public Read All Show" on public.showroom;
drop policy if exists "Public Read All Sett" on public.settings;
drop policy if exists "Public Read All Clients" on public.clients;
drop policy if exists "Public Read All Invoices" on public.invoices;

drop policy if exists "Admin All Sett" on public.settings;
drop policy if exists "Admin All Port" on public.portfolio;
drop policy if exists "Admin All Spec" on public.specials;
drop policy if exists "Admin All Show" on public.showroom;
drop policy if exists "Admin All Clients" on public.clients;
drop policy if exists "Public All Book" on public.bookings;
drop policy if exists "Public All Inv" on public.invoices;

create policy "Public Read All Port" on public.portfolio for select using (true);
create policy "Public Read All Spec" on public.specials for select using (true);
create policy "Public Read All Show" on public.showroom for select using (true);
create policy "Public Read All Sett" on public.settings for select using (true);
create policy "Public Read All Clients" on public.clients for select using (true);
create policy "Public Read All Invoices" on public.invoices for select using (true);

create policy "Admin All Sett" on public.settings for all using (auth.role() = 'authenticated');
create policy "Admin All Port" on public.portfolio for all using (auth.role() = 'authenticated');
create policy "Admin All Spec" on public.specials for all using (auth.role() = 'authenticated');
create policy "Admin All Show" on public.showroom for all using (auth.role() = 'authenticated');
create policy "Admin All Clients" on public.clients for all using (auth.role() = 'authenticated');
create policy "Admin All Exp" on public.expenses for all using (auth.role() = 'authenticated');
create policy "Admin All Inv" on public.inventory for all using (auth.role() = 'authenticated');
create policy "Public Read All Photo Lib" on public.photo_library for select using (true);
create policy "Admin All Photo Lib" on public.photo_library for all using (auth.role() = 'authenticated');
create policy "Public Sub Photo Book" on public.photo_bookings for insert with check (true);
create policy "Admin All Photo Book" on public.photo_bookings for all using (auth.role() = 'authenticated');
create policy "Admin All Photo Inv" on public.photo_invoices for all using (auth.role() = 'authenticated');
create policy "Public All Book" on public.bookings for all using (true);
create policy "Public All Inv" on public.invoices for all using (true);
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
    public.settings, 
    public.invoices,
    public.clients,
    public.expenses,
    public.inventory,
    public.photo_library,
    public.photo_bookings,
    public.photo_invoices;
`.trim();

  const sql_storage = `
-- ==========================================
-- PHASE D: STORAGE SECURITY POLICIES
-- ==========================================

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
    <div className="relative min-h-screen bg-gray-50 pb-24">
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-16">
        <header className="text-center py-6 space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">System Initialization</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Follow these steps carefully to configure your backend infrastructure, authentication, and database schema.</p>
        </header>

        <div className="space-y-4">
            <StepWrapper number="1" title="Backend Configuration" subtitle="Supabase Project" isActive={activeStep === 1} onHeaderClick={() => setActiveStep(1)}>
                <div className="space-y-4">
                  <p>1. Create a new project on <ExternalLink href="https://supabase.com">Supabase</ExternalLink>.</p>
                  <p>2. Locate your <strong>Project URL</strong> and <strong>Anon Key</strong> in the project settings (under API).</p>
                  <p>3. In your application hosting environment (e.g. Vercel), add the following environment variables:</p>
                </div>
                <div className="mt-4 bg-blue-50 border border-blue-100 p-4 rounded-xl">
                    <CopyBlock text={env_template} label=".env Configuration" />
                </div>
            </StepWrapper>

            <StepWrapper number="2" title="Storage Configuration" subtitle="Media Buckets" isActive={activeStep === 2} onHeaderClick={() => setActiveStep(2)}>
                <p>Ensure these <strong>Public</strong> buckets exist in Supabase Storage. You will need these to seamlessly upload your photos.</p>
                <div className="mt-4 bg-white p-4 rounded-lg border shadow-sm">
                  <ul className="list-disc pl-5 font-mono text-sm space-y-2 text-pink-600">
                      <li><span className="text-gray-800">portfolio</span></li>
                      <li><span className="text-gray-800">specials</span></li>
                      <li><span className="text-gray-800">showroom</span></li>
                      <li><span className="text-gray-800">settings</span></li>
                      <li><span className="text-gray-800">booking-references</span></li>
                  </ul>
                </div>
                <div className="mt-6">
                    <h4 className="flex items-center gap-2 font-bold text-gray-900 text-lg mb-2"><span className="bg-gray-100 text-gray-500 p-1 rounded">S</span> Storage Policies</h4>
                    <p className="text-gray-500 mb-4">Run this in your SQL Editor to secure your file uploads.</p>
                    <CopyBlock text={sql_storage} height="h-64" label="Storage Script" />
                </div>
            </StepWrapper>

            <StepWrapper number="3" title="Database Management" subtitle="SQL Setup & Schema" isActive={activeStep === 3} onHeaderClick={() => setActiveStep(3)}>
                <p className="mb-4">Navigate to your Supabase SQL Editor and execute these scripts one by one to initialize your tables, row level security (RLS), and realtime subscriptions.</p>
                
                <div className="space-y-12">
                    <section>
                        <h4 className="flex items-center gap-2 font-bold text-gray-900 text-lg mb-2"><span className="bg-gray-100 text-gray-500 p-1 rounded">A</span> Phase A: Structure & Schema</h4>
                        <p className="text-gray-500 mb-4">Creates the base extension and main tables.</p>
                        <CopyBlock text={sql_structure} height="h-96" label="Structure Script" />
                    </section>
                    
                    <section>
                        <h4 className="flex items-center gap-2 font-bold text-gray-900 text-lg mb-2 mt-8"><span className="bg-gray-100 text-gray-500 p-1 rounded">B</span> Phase B: Security Policies (RLS)</h4>
                        <p className="text-gray-500 mb-4">Secures your data so only authorized admins can edit content, but public can read settings & portfolio.</p>
                        <CopyBlock text={sql_permissions} height="h-64" label="Security Script" />
                    </section>
                    
                    <section>
                        <h4 className="flex items-center gap-2 font-bold text-gray-900 text-lg mb-2 mt-8"><span className="bg-gray-100 text-gray-500 p-1 rounded">C</span> Phase C: Realtime Subscriptions</h4>
                        <p className="text-gray-500 mb-4">Enables live updates to your Dashboard from the cloud (without refreshing the page).</p>
                        <CopyBlock text={sql_realtime} height="h-40" label="Realtime Script" />
                    </section>
                </div>
            </StepWrapper>

            <StepWrapper number="4" title="Authentication Configuration" subtitle="Google & Email Login" isActive={activeStep === 4} onHeaderClick={() => setActiveStep(4)}>
                <p className="mb-4 text-gray-700">Configure authentication to allow your team to access the Admin Dashboard. We recommend setting up both Google Login (for convenience) and Email/Password (as a fallback).</p>
                
                <div className="space-y-8">
                    <section className="bg-gray-50 border border-gray-100 p-6 rounded-xl">
                        <h4 className="flex items-center gap-2 font-bold text-gray-900 text-lg mb-3"><span className="bg-pink-100 text-pink-600 p-1.5 rounded-md"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg></span> 1. Email & Password Auth (Required)</h4>
                        <ol className="list-decimal pl-5 space-y-3 text-sm text-gray-600">
                            <li>In your Supabase Dashboard, go to <strong>Authentication</strong> &rarr; <strong>Providers</strong>.</li>
                            <li>Enable <strong>Email</strong> provider.</li>
                            <li>Turn off "Confirm email" and "Secure email change" if you want to create users manually without them needing to verify an inbox.</li>
                            <li>Go to <strong>Authentication</strong> &rarr; <strong>Users</strong> and click <strong>Add User</strong> &rarr; <strong>Create new user</strong> to manually create your admin account.</li>
                            <li><strong>To add more admin users/staff:</strong> Simply repeat step 4. In Supabase Authentication Dashboard, click <strong>Add User</strong> &rarr; <strong>Create new user</strong>. Enter their email address and a strong password. You can check the "Auto confirm user" checkbox if you disabled email confirmations. Provide these credentials to the staff member so they can log in via the email/password tab of the portal.</li>
                        </ol>
                    </section>
                    
                    <section className="bg-gray-50 border border-gray-100 p-6 rounded-xl">
                        <h4 className="flex items-center gap-2 font-bold text-gray-900 text-lg mb-3"><span className="bg-blue-100 text-blue-600 p-1.5 rounded-md"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg></span> 2. Google OAuth Login (Optional)</h4>
                        <ol className="list-decimal pl-5 space-y-3 text-sm text-gray-600">
                            <li>Visit the <ExternalLink href="https://console.cloud.google.com/">Google Cloud Console</ExternalLink> and create a new project.</li>
                            <li>Search for "OAuth consent screen". Choose <strong>External</strong>, then fill in your App name and support email. Add the scope `.../auth/userinfo.email` and `.../auth/userinfo.profile`. Add your email as a test user if the app is unverified.</li>
                            <li>Go to <strong>Credentials</strong> &rarr; <strong>Create Credentials</strong> &rarr; <strong>OAuth client ID</strong>.</li>
                            <li>Choose <strong>Web application</strong> as the application type.</li>
                            <li>Under <strong>Authorized redirect URIs</strong>, add your Supabase project Callback URL. You can find this in your Supabase Dashboard under <strong>Authentication</strong> &rarr; <strong>URL Configuration</strong> &rarr; "Site URL" (It looks like <code>https://&lt;project-id&gt;.supabase.co/auth/v1/callback</code>).</li>
                            <li>Copy the generated <strong>Client ID</strong> and <strong>Client Secret</strong>.</li>
                            <li>Back in your <strong>Supabase Dashboard</strong>, go to <strong>Authentication</strong> &rarr; <strong>Providers</strong> and enable <strong>Google</strong>.</li>
                            <li>Paste the Client ID and Client Secret from Google Cloud Console. Click Save.</li>
                        </ol>
                    </section>
                </div>
            </StepWrapper>

            <StepWrapper number="5" title="Production Launch" subtitle="Final Deployment" isActive={activeStep === 5} onHeaderClick={() => setActiveStep(5)}>
                <div className="space-y-4">
                  <p>1. Ensure your hosting platform (e.g. Vercel) has the exactly correct <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>.</p>
                  <p>2. In your Supabase Dashboard &rarr; <strong>Authentication</strong> &rarr; <strong>URL Configuration</strong>, ensure your production site URL (e.g. <code>https://my-app.vercel.app</code>) is listed in both the "Site URL" and "Redirect URLs" fields.</p>
                  <p>3. Trigger a fresh deployment of your application.</p>
                  <p>4. Verify the Admin Portal accessibility by attempting a test login.</p>
                </div>
                <div className="mt-8 bg-pink-500 text-white p-6 rounded-2xl text-center shadow-xl">
                    <h3 className="text-2xl font-bold mb-2">Ready to Go! 🚀</h3>
                    <p className="text-white/90">Your cloud-connected studio is now operational and secure.</p>
                </div>
            </StepWrapper>
        </div>
      </div>
    </div>
  );
};

export default SetupManager;
