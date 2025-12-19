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
        {children} <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
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
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
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
  const [activeStep, setActiveStep] = useState<number>(1);

  const sql_structure = `
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
  hero jsonb,
  about jsonb,
  contact jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);
`.trim();

  const sql_permissions = `
-- SECURITY POLICIES (Row Level Security)
alter table public.expenses enable row level security;
alter table public.inventory enable row level security;
alter table public.portfolio enable row level security;
alter table public.specials enable row level security;
alter table public.showroom enable row level security;
alter table public.settings enable row level security;
alter table public.bookings enable row level security;
alter table public.invoices enable row level security;
alter table public.clients enable row level security;

-- Drop existing policies if they exist to prevent errors on rerun
drop policy if exists "Admin Expenses" on public.expenses;
drop policy if exists "Admin Inventory" on public.inventory;
drop policy if exists "Public Read Portfolio" on public.portfolio;
drop policy if exists "Public Read Specials" on public.specials;
drop policy if exists "Public Read Showroom" on public.showroom;
drop policy if exists "Public Read Settings" on public.settings;
drop policy if exists "Admin Write Portfolio" on public.portfolio;
drop policy if exists "Admin Write Specials" on public.specials;
drop policy if exists "Admin Write Showroom" on public.showroom;
drop policy if exists "Admin Write Settings" on public.settings;
drop policy if exists "App Access Bookings" on public.bookings;
drop policy if exists "App Access Invoices" on public.invoices;
drop policy if exists "App Access Clients" on public.clients;

-- Create Policies
create policy "Admin Expenses" on public.expenses for all using (auth.role() = 'authenticated');
create policy "Admin Inventory" on public.inventory for all using (auth.role() = 'authenticated');
create policy "Public Read Portfolio" on public.portfolio for select using (true);
create policy "Public Read Specials" on public.specials for select using (true);
create policy "Public Read Showroom" on public.showroom for select using (true);
create policy "Public Read Settings" on public.settings for select using (true);
create policy "Admin Write Portfolio" on public.portfolio for all using (auth.role() = 'authenticated');
create policy "Admin Write Specials" on public.specials for all using (auth.role() = 'authenticated');
create policy "Admin Write Showroom" on public.showroom for all using (auth.role() = 'authenticated');
create policy "Admin Write Settings" on public.settings for all using (auth.role() = 'authenticated');
create policy "App Access Bookings" on public.bookings for all using (true);
create policy "App Access Invoices" on public.invoices for all using (true);
create policy "App Access Clients" on public.clients for all using (true);
`.trim();

  const sql_realtime = `
-- REALTIME SUBSCRIPTION CONFIG
BEGIN;
  -- Remove tables if they already exist in the publication to prevent errors
  ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.portfolio;
  ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.specials;
  ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.showroom;
  ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.bookings;
  ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.expenses;
  ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.inventory;
  ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.settings;
  ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.invoices;
  ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.clients;

  -- Add tables to the publication
  ALTER PUBLICATION supabase_realtime ADD TABLE public.portfolio;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.specials;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.showroom;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.settings;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.invoices;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.clients;
COMMIT;
`.trim();

  const env_template = `
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
`.trim();

  return (
    <div className="relative min-h-screen font-sans bg-gray-50 pb-24">
      {/* Background Shapes */}
      <div className="fixed inset-0 pointer-events-none opacity-10 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-500 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
        <header className="text-center py-16 space-y-4">
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight drop-shadow-sm">Deployment Guide</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-medium">The complete 7-step blueprint for moving from localhost to a professional, live tattoo studio platform.</p>
          <div className="flex justify-center gap-4 pt-4">
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">Supabase Cloud</span>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">Vercel Edge</span>
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">Google OAuth</span>
          </div>
        </header>

        <div className="space-y-4">
            {/* STEP 1: GITHUB */}
            <StepWrapper 
                number="1" 
                title="Repository Hosting" 
                subtitle="GitHub"
                isActive={activeStep === 1}
                onHeaderClick={() => setActiveStep(1)}
            >
                <p>To deploy your site, you first need to host your code in a professional repository.</p>
                <ol className="list-decimal pl-5 space-y-3">
                    <li>Create a new repository on <ExternalLink href="https://github.com/new">GitHub</ExternalLink>.</li>
                    <li>Initialize your local project folder and push it to this new repo.</li>
                    <li><strong>Pro Tip:</strong> Keep your repository private unless you want others to see your client logic.</li>
                </ol>
                <div className="bg-gray-100 p-4 rounded-xl border border-gray-200 text-sm">
                    <strong>Note:</strong> Ensure you do NOT commit any <code>.env</code> files or your <code>supabaseClient.ts</code> with actual keys to GitHub.
                </div>
            </StepWrapper>

            {/* STEP 2: SUPABASE PROJECT */}
            <StepWrapper 
                number="2" 
                title="Backend Engine" 
                subtitle="Supabase Setup"
                isActive={activeStep === 2}
                onHeaderClick={() => setActiveStep(2)}
            >
                <p>Your database and authentication are powered by Supabase.</p>
                <ol className="list-decimal pl-5 space-y-3">
                    <li>Sign in to <ExternalLink href="https://supabase.com">Supabase</ExternalLink> and click <strong>"New Project"</strong>.</li>
                    <li>Wait 2-3 minutes for the database to provision.</li>
                    <li>Go to <strong>Project Settings &rarr; API</strong>.</li>
                    <li>Copy your <strong>Project URL</strong> and <strong>anon public API Key</strong>.</li>
                </ol>
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                    <p className="text-sm text-blue-800 font-bold mb-2">Save these for Step 7 (Vercel):</p>
                    <CopyBlock text={env_template} label="Env Template" />
                </div>
            </StepWrapper>

            {/* STEP 3: SQL SCRIPTS */}
            <StepWrapper 
                number="3" 
                title="Database Architecture" 
                subtitle="SQL Scripts"
                isActive={activeStep === 3}
                onHeaderClick={() => setActiveStep(3)}
            >
                <p>Now, build the actual tables and security rules.</p>
                <div className="space-y-8">
                    <section>
                        <h4 className="font-bold text-gray-800 mb-2">Phase A: Structure</h4>
                        <p className="text-sm mb-4">Go to <strong>SQL Editor &rarr; New Query</strong>, paste and run this script to create your tables (Portfolio, Bookings, Clients, etc).</p>
                        <CopyBlock text={sql_structure} height="h-48" label="Structure Script" />
                    </section>

                    <section>
                        <h4 className="font-bold text-gray-800 mb-2">Phase B: Permissions (RLS)</h4>
                        <p className="text-sm mb-4">Run this to lock down your data. Only you (the logged-in Admin) will be able to delete or edit data, while the public can read your portfolio.</p>
                        <CopyBlock text={sql_permissions} height="h-32" label="Security Script" />
                    </section>

                    <section>
                        <h4 className="font-bold text-gray-800 mb-2">Phase C: Realtime Sync</h4>
                        <p className="text-sm mb-4"><strong>CRITICAL:</strong> Run this so that your Admin Dashboard updates instantly when a client books, without needing a refresh.</p>
                        <CopyBlock text={sql_realtime} height="h-32" label="Realtime Script" />
                    </section>
                </div>
            </StepWrapper>

            {/* STEP 4: STORAGE */}
            <StepWrapper 
                number="4" 
                title="Media Storage" 
                subtitle="Buckets"
                isActive={activeStep === 4}
                onHeaderClick={() => setActiveStep(4)}
            >
                <p>For uploading portfolio images and client references, you must create storage buckets.</p>
                <ol className="list-decimal pl-5 space-y-3">
                    <li>Go to <strong>Storage &rarr; New Bucket</strong> in Supabase.</li>
                    <li>Create the following buckets (all should be <strong>Public</strong>):
                        <ul className="list-disc pl-5 mt-2 font-mono text-xs space-y-1">
                            <li>portfolio</li>
                            <li>specials</li>
                            <li>showroom</li>
                            <li>settings</li>
                            <li>booking-references</li>
                        </ul>
                    </li>
                    <li>Ensure the "Public" toggle is ON for all of them so images load on your site.</li>
                </ol>
            </StepWrapper>

            {/* STEP 5: GOOGLE LOGIN */}
            <StepWrapper 
                number="5" 
                title="Social Authentication" 
                subtitle="Google Login Setup"
                isActive={activeStep === 5}
                onHeaderClick={() => setActiveStep(5)}
            >
                <p>Allow clients to sign in with their Google account to access the Portal.</p>
                <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <h4 className="font-bold text-gray-800 mb-2">Part 1: Google Cloud Console</h4>
                        <ol className="list-decimal pl-5 space-y-2 text-sm">
                            <li>Go to <ExternalLink href="https://console.cloud.google.com/">Google Cloud Console</ExternalLink>.</li>
                            <li>Create a new project. Search for <strong>APIs & Services &rarr; OAuth Consent Screen</strong>.</li>
                            <li>Choose <strong>External</strong>, fill out info.</li>
                            <li>Go to <strong>Credentials &rarr; Create Credentials &rarr; OAuth Client ID</strong>.</li>
                            <li>Select <strong>Web Application</strong>.</li>
                            <li>Add <code>https://YOUR_SUPABASE_ID.supabase.co/auth/v1/callback</code> to "Authorized redirect URIs".</li>
                        </ol>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <h4 className="font-bold text-blue-900 mb-2">Part 2: Supabase Integration</h4>
                        <ol className="list-decimal pl-5 space-y-2 text-sm text-blue-800">
                            <li>Copy the <strong>Client ID</strong> and <strong>Secret</strong> from Google.</li>
                            <li>Go to Supabase <strong>Authentication &rarr; Providers &rarr; Google</strong>.</li>
                            <li>Paste the keys, toggle "Enabled", and Save.</li>
                        </ol>
                    </div>
                </div>
            </StepWrapper>

            {/* STEP 6: EMAILJS */}
            <StepWrapper 
                number="6" 
                title="Booking Notifications" 
                subtitle="EmailJS Setup"
                isActive={activeStep === 6}
                onHeaderClick={() => setActiveStep(6)}
            >
                <p>Get notified via email whenever a new booking request comes in.</p>
                <ol className="list-decimal pl-5 space-y-3">
                    <li>Create a free account at <ExternalLink href="https://www.emailjs.com/">EmailJS</ExternalLink>.</li>
                    <li><strong>Add Service:</strong> Connect your Gmail account. Note the <strong>Service ID</strong>.</li>
                    <li><strong>Create Template:</strong> Use variables like <code>&#123;&#123;from_name&#125;&#125;</code> and <code>&#123;&#123;message&#125;&#125;</code>. Note the <strong>Template ID</strong>.</li>
                    <li><strong>Get API Key:</strong> Go to Account &rarr; Public Key.</li>
                    <li>Enter these values in the <strong>Settings &rarr; Integrations</strong> tab of this Admin Dashboard.</li>
                </ol>
            </StepWrapper>

            {/* STEP 7: VERCEL */}
            <StepWrapper 
                number="7" 
                title="Production Launch" 
                subtitle="Vercel Deployment"
                isActive={activeStep === 7}
                onHeaderClick={() => setActiveStep(7)}
            >
                <p>The final step! Hosting your site on the web with high performance.</p>
                <ol className="list-decimal pl-5 space-y-3">
                    <li>Sign in to <ExternalLink href="https://vercel.com">Vercel</ExternalLink> and click <strong>"Add New &rarr; Project"</strong>.</li>
                    <li>Import the repository you created in Step 1.</li>
                    <li><strong>Environment Variables:</strong> This is the most important part. Expand this section.</li>
                    <li>Add two variables:
                        <ul className="mt-2 space-y-2">
                            <li className="flex items-center gap-2"><code className="bg-gray-100 px-1 rounded text-xs font-bold">NEXT_PUBLIC_SUPABASE_URL</code> &rarr; (Your project URL)</li>
                            <li className="flex items-center gap-2"><code className="bg-gray-100 px-1 rounded text-xs font-bold">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> &rarr; (Your anon key)</li>
                        </ul>
                    </li>
                    <li>Click <strong>Deploy</strong>.</li>
                </ol>
                <div className="mt-8 bg-green-600 text-white p-6 rounded-2xl text-center shadow-xl shadow-green-500/20">
                    <h3 className="text-2xl font-bold mb-2">Deployment Complete! 🎉</h3>
                    <p className="text-green-100">Your professional tattoo studio platform is now live and secure.</p>
                </div>
            </StepWrapper>
        </div>
      </div>
    </div>
  );
};

export default SetupManager;
