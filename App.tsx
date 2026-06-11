import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import * as UAParserMod from 'ua-parser-js';
const UAParser = (UAParserMod as any).UAParser || UAParserMod;
import { 
  dbOnAuthStateChange, 
  dbSubscribeToCollection, 
  dbSubscribeToDoc, 
  dbAddItem, 
  dbUpdateItem, 
  dbDeleteItem, 
  dbSetDoc, 
  dbClearCollection,
  dbLogout
} from './utils/dbAdapter';

import Header from './components/Header';
import Hero from './components/Hero';
import SpecialsCollage from './components/SpecialsCollage';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';
import AdminPage from './pages/AdminPage';
import Showroom from './pages/ShowroomPage';
import AboutUs from './components/AboutUs';
import WelcomeIntro from './components/WelcomeIntro';
import WelcomeSection from './components/WelcomeSection';
import MaintenancePage from './components/MaintenancePage';
import SpecialsSection from './components/SpecialsSection';
import StaticBosSalonBackground from './components/StaticBosSalonBackground';
import PhotographyApp from './pages/photography/PhotographyApp';
import PhotographyAdminDashboard from './pages/photography/PhotographyAdminDashboard';
import AdminLoginPage from './pages/AdminLoginPage';

// --- INTERFACES ---
export interface PortfolioItem {
  id: string;
  title: string;
  story: string;
  tags: string[];
  primaryImage: string;
  galleryImages: string[];
  videoData?: string;
  featured?: boolean;
}
export interface ShowroomItem {
  id: string;
  title: string;
  images: string[];
  videoUrl?: string;
}
export interface SpecialItem {
  id: string;
  title: string;
  description: string;
  price: number;
  tags: string[];
  imageUrl: string; // Primary image for cards
  images?: string[]; // Multiple images for the modal gallery
  active: boolean;
  // Added optional properties to support new SpecialsCollage features
  priceType?: 'fixed' | 'hourly' | 'percentage';
  priceValue?: number;
  details?: string[];
  voucherCode?: string;
}
export interface SocialLink {
  id: string;
  url: string;
  icon: string;
}
export interface Booking {
  id: string;
  name: string;
  email: string;
  whatsappNumber?: string;
  contactMethod?: 'email' | 'whatsapp';
  message: string;
  bookingDate: string;
  status: 'pending' | 'quote_sent' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  bookingType: 'online' | 'manual';
  // Financials
  totalCost?: number;
  amountPaid?: number;
  paymentMethod?: 'cash' | 'card' | 'eft' | 'other';
  confirmationMethod?: 'online' | 'in-salon'; // NEW: Track how client confirmed
  referenceImages?: string[];
  selectedOptions?: string[]; // New: store labels of pre-ticked options
}
export interface Genre {
  id:string;
  name: string;
  items: ShowroomItem[];
}
export interface Expense {
  id: string;
  date: string;
  category: 'Supplies' | 'Rent' | 'Utilities' | 'Marketing' | 'Stock' | 'Other';
  description: string;
  amount: number;
}
export interface InventoryItem {
  id: string;
  productName: string;
  brand: string;
  category: string;
  quantity: number;
  minStockLevel: number;
  unitCost: number;
  supplier: string;
}

// --- NEW INVOICE INTERFACES ---
export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  type: 'quote' | 'invoice';
  number: string; // e.g. Q-1001 or INV-2023-01
  subject?: string; // New: editable subject line
  clientId?: string; // Optional link to existing booking/client
  bookingId?: string; // Link specific quote to a booking
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  dateIssued: string;
  dateDue: string;
  status: 'draft' | 'sent' | 'accepted' | 'paid' | 'overdue' | 'void';
  items: InvoiceLineItem[];
  notes: string;
  subtotal: number;
  taxAmount: number; // VAT
  total: number;
}

export interface LoyaltyProgram {
  id: string;
  name: string;
  stickersRequired: number;
  rewardDescription: string;
  terms?: string;
  iconUrl?: string; // Custom icon for this program
  active: boolean;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password?: string; // Auto-generated PIN/Password
  notes?: string;
  stickers?: number; // Deprecated: used for legacy single program
  loyaltyProgress?: Record<string, number>; // Map of programId -> stickers count
  rewardsRedeemed?: number; // Total rewards redeemed
  age?: number;      // New field
  address?: string;  // New field
}

export interface BookingOption {
  id: string;
  label: string;
  description: string;
  price?: number;
  category?: string;
}

// --- MAIN APP COMPONENT ---
const App: React.FC = () => {
  // --- STATE ---
  const [user, setUser] = useState<any | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  const [portfolioData, setPortfolioData] = useState<PortfolioItem[]>([]);
  const [specialsData, setSpecialsData] = useState<SpecialItem[]>([]); // New Specials
  const [showroomData, setShowroomData] = useState<Genre[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clients, setClients] = useState<Client[]>([]); // New Clients collection
  const [invoices, setInvoices] = useState<Invoice[]>([]); // New Invoices collection
  
  // Site settings - Now includes nested objects for specific sections
  const [settings, setSettings] = useState<any>({
    companyName: 'Bos Salon',
    logoUrl: 'https://i.ibb.co/gLSThX4v/unnamed-removebg-preview.png',
    heroBgUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1920&q=80',
    aboutUsImageUrl: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=800&q=80',
    whatsAppNumber: '27795904162',
    address: '123 Nature Way, Green Valley, 45678',
    phone: '+27 12 345 6789',
    email: 'bookings@bossalon.com',
    businessHours: 'Mon - Fri: 09:00 - 18:00\nSat: 10:00 - 16:00\nSun: Closed',
    socialLinks: [],
    showroomTitle: 'Nail Art Gallery',
    showroomDescription: "Browse our collection of bespoke designs and nail art.",
    bankName: 'FNB',
    accountNumber: '1234567890',
    branchCode: '250655',
    accountType: 'Cheque',
    vatNumber: '',
    isMaintenanceMode: false,
    apkUrl: '',
    taxEnabled: false,
    vatPercentage: 15,
    emailServiceId: '',
    emailTemplateId: '',
    emailPublicKey: '',
    
    bookingOptions: [
      { id: '1', label: 'Gel Overlay', description: 'Strong, glossy finish for natural nails.' },
      { id: '2', label: 'Acrylic Sculpture', description: 'Custom shaped enhancements.' },
      { id: '3', label: 'Luxury Pedicure', description: 'Complete rejuvenation for your feet.' },
    ],
    
    // Legacy Loyalty (Single) - Kept for fallback
    loyaltyProgram: {
        enabled: true,
        stickersRequired: 10,
        rewardDescription: '50% Off your next session',
        terms: 'Valid on treatments over R300. Not exchangeable for cash.'
    },
    
    // NEW: Multiple Loyalty Programs
    loyaltyPrograms: [], // Array of LoyaltyProgram objects
    
    // Default theme config
    theme: {
      brandDark: '#fff0f5',
      brandLight: '#4e342e',
      brandOffWhite: '#ffffff',
      brandGold: '#d4a373',
      brandGreen: '#ff1493',
      brandPink: '#f48fb1',
      fontSans: 'Montserrat',
      fontScript: 'Dancing Script',
    },

    // Default lounge perks
    loungePerks: [
        'Exclusive early access to seasonal flash collections.',
        'Priority booking for holiday sessions.',
        'Personalized aftercare consultations after every masterpiece.',
        'Digital reward cards with tiered benefits.'
    ],
    
    // Default sub-objects for specific sections
    hero: {
        title: 'Nails & Beauty',
        subtitle: 'Experience the art of nature',
        buttonText: 'Book an Appointment'
    },
    welcome: {
        title: 'Welcome to Bos Salon',
        text: 'We are delighted to have you here. Step into our world of beauty and relaxation.'
    },
    about: {
        title: 'Our Story',
        text1: 'Bos Salon was born from a passion for natural beauty and intricate art.',
        text2: 'We specialize in bespoke nail art, ensuring every treatment tells a unique story.'
    },
    contact: {
        intro: 'Ready for a fresh look? Fill out the form below.',
        processTitle: 'Our Process',
        processIntro: "We believe in personal care. Whether it's a simple manicure or complex nail art, we ensure every detail is perfect.",
        processSteps: [
            "Request Appointment: Use this form to tell us what service you need.",
            "Consultation: We'll contact you to confirm details, colors, and specific requirements.",
            "Relax & Enjoy: Come in, relax in our studio, and let us work our magic."
        ],
        designTitle: 'Design Ideas?',
        designIntro: "If you have a specific nail design in mind, let us know!",
        designPoints: [
            "Service Type: Gel, Acrylic, or Natural Mani?",
            "Inspiration: Upload photos of designs you love."
        ]
    },
    // NEW: Aftercare guide configuration
    aftercare: {
        title: 'Aftercare Guide',
        intro: 'Proper aftercare is essential to maintain the longevity and health of your beauty treatments.',
        sections: [
            {
                title: 'Nail Care (First 48 Hours)',
                icon: '💅',
                items: [
                    'Avoid using your nails as tools (e.g., opening cans).',
                    'Gently wash with lukewarm water and mild soap.',
                    'Apply cuticle oil daily to keep enhancements flexible.',
                    'Wear gloves when using cleaning chemicals.'
                ]
            },
            {
                title: 'Nail "Don\'ts"',
                icon: '🚫',
                items: [
                    'Never pick, scratch, or peel your gel or acrylic.',
                    'Avoid soaking in pools or hot tubs for 24 hours.',
                    'Do not skip maintenance appointments.',
                    'Avoid biting or chewing on the treatment area.'
                ]
            }
        ]
    }
  });

  const [currentView, setCurrentView] = useState<'home' | 'admin' | 'photography' | 'magicalmemories_admin'>('home');
  const [isIntroVisible, setIsIntroVisible] = useState(true);
  
  const location = useLocation();
  const nav = useNavigate();

  // --- TRAFFIC TRACKING ---
  useEffect(() => {
    try {
      const logs = JSON.parse(localStorage.getItem('traffic_logs') || '[]');
      const urlParams = new URLSearchParams(window.location.search);
      
      const utmSource = urlParams.get('utm_source');
      const utmMedium = urlParams.get('utm_medium');
      const utmCampaign = urlParams.get('utm_campaign');
      
      const referrer = document.referrer;
      let rawSource = utmSource || '';
      if (!rawSource) {
          if (referrer) {
              try {
                  rawSource = new URL(referrer).hostname;
              } catch (e) {
                  rawSource = referrer;
              }
          } else {
              rawSource = 'Direct';
          }
      }

      const parser = new UAParser();
      const result = parser.getResult();
      
      const lastLog = logs[logs.length - 1];
      // simplistic session anti-spam: only log if last log was more than 10 mins ago or different source
      const isNewSession = !lastLog || (Date.now() - lastLog.id > 10 * 60 * 1000) || lastLog.source !== rawSource;
      
      if (isNewSession) {
          logs.push({
            id: Date.now(),
            date: new Date().toISOString(),
            source: rawSource,
            medium: utmMedium || '',
            campaign: utmCampaign || '',
            referrer: referrer,
            userAgent: navigator.userAgent,
            browser: `${result.browser.name || 'Unknown'} ${result.browser.version || ''}`.trim(),
            os: `${result.os.name || 'Unknown'} ${result.os.version || ''}`.trim(),
            deviceType: result.device.type || (result.os.name?.match(/iOS|Android/i) ? 'mobile' : 'desktop'),
            page: window.location.pathname
          });
          localStorage.setItem('traffic_logs', JSON.stringify(logs));
      }
    } catch {}
  }, [location.pathname]);

  useEffect(() => {
    const path = location.pathname;
    if (path === '/' || path === '/boshome') setCurrentView('home');
    else if (path === '/magicalmemories' || path.startsWith('/magicalmemories/')) setCurrentView('photography');
    else if (path === '/magicalmemories_admin') setCurrentView('magicalmemories_admin');
    else if (path === '/admin') setCurrentView('admin');
  }, [location]);

  // --- DYNAMIC BRANDING EFFECT ---
  useEffect(() => {
    if (settings.companyName) {
      document.title = settings.companyName;
    }
    
    if (settings.logoUrl) {
      // Update Favicon
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = settings.logoUrl;

      // Update Apple Touch Icon
      let appleLink = document.querySelector("link[rel~='apple-touch-icon']") as HTMLLinkElement;
      if (!appleLink) {
        appleLink = document.createElement('link');
        appleLink.rel = 'apple-touch-icon';
        document.head.appendChild(appleLink);
      }
      appleLink.href = settings.logoUrl;

      // Update PWA Manifest dynamically
      const manifest = {
        name: settings.companyName || "Studio App",
        short_name: settings.companyName || "Studio App",
        description: "A premium beauty studio.",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#ffffff",
        icons: [
          {
            src: settings.logoUrl,
            sizes: "192x192 512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ]
      };
      
      const manifestString = JSON.stringify({ ...manifest, start_url: window.location.origin + '/' });      
      const manifestUrl = `data:application/manifest+json;charset=utf-8,${encodeURIComponent(manifestString)}`;
      
      let manifestLink = document.querySelector("link[rel~='manifest']") as HTMLLinkElement;
      if (!manifestLink) {
        manifestLink = document.createElement('link');
        manifestLink.rel = 'manifest';
        document.head.appendChild(manifestLink);
      }
      manifestLink.href = manifestUrl;
    }

    if (settings.theme) {
      const root = document.documentElement;
      if (settings.theme.brandDark) root.style.setProperty('--color-brand-dark', settings.theme.brandDark);
      if (settings.theme.brandLight) root.style.setProperty('--color-brand-light', settings.theme.brandLight);
      if (settings.theme.brandOffWhite) root.style.setProperty('--color-brand-off-white', settings.theme.brandOffWhite);
      if (settings.theme.brandGold) root.style.setProperty('--color-brand-gold', settings.theme.brandGold);
      if (settings.theme.brandGreen) root.style.setProperty('--color-brand-green', settings.theme.brandGreen);
      if (settings.theme.brandPink) root.style.setProperty('--color-brand-pink', settings.theme.brandPink);
      
      const loadFont = (fontFamily: string) => {
        if (!fontFamily) return;
        const fontName = fontFamily.replace(/ /g, '+');
        const linkId = `google-font-${fontName}`;
        if (!document.getElementById(linkId)) {
          const fontLink = document.createElement('link');
          fontLink.id = linkId;
          fontLink.rel = 'stylesheet';
          fontLink.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@400;500;700&display=swap`;
          document.head.appendChild(fontLink);
        }
      };

      if (settings.theme.fontSans) {
        root.style.setProperty('--font-sans', settings.theme.fontSans);
        loadFont(settings.theme.fontSans);
      }
      if (settings.theme.fontScript) {
        root.style.setProperty('--font-script', settings.theme.fontScript);
        loadFont(settings.theme.fontScript);
      }
    }
  }, [settings.companyName, settings.logoUrl, settings.theme]);

  // --- REFRESH AUTO LOGOUT LOGIC ---
  useEffect(() => {
      // User specifically requested auto-logout on every refresh
      const performAutoLogoutOnRefresh = async () => {
          try {
              await dbLogout();
          } catch(e) {
              console.warn("Auto logout failed (Supabase might not be configured)");
          }
          setUser(null);
      };
      
      // If we want it strictly on every fresh mount (refresh)
      performAutoLogoutOnRefresh();
  }, []);

  // --- AUTH STATE LISTENER ---
  useEffect(() => {
    const unsubscribe = dbOnAuthStateChange((currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);

      // Check for redirect intent from Google Login URL
      const searchParams = new URLSearchParams(window.location.search);
      const redirectDest = searchParams.get('redirect');
      
      if (currentUser && redirectDest === 'admin') {
          setCurrentView('admin');
          // Clean up the URL
          window.history.replaceState({}, document.title, window.location.pathname);
      }
    });
    return () => unsubscribe();
  }, []);
  
  // --- PUBLIC DATA FETCHING ---
  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    try {
      // Subscribe to settings document
      const unsubSettings = dbSubscribeToDoc("settings", "main", (fetchedSettings: any) => {
          if (fetchedSettings) {
             setSettings((prev: any) => {
                 const hasOptions = (arr: any) => Array.isArray(arr) && arr.length > 0;
                 return {
                     ...prev,
                     ...fetchedSettings,
                     socialLinks: fetchedSettings.socialLinks || fetchedSettings.sociallinks || prev.socialLinks || [],
                     loyaltyPrograms: fetchedSettings.loyaltyPrograms || fetchedSettings.loyaltyprograms || prev.loyaltyPrograms || [],
                     loungePerks: fetchedSettings.loungePerks || fetchedSettings.loungeperks || fetchedSettings.sanctuaryPerks || prev.loungePerks || [],
                     bookingOptions: hasOptions(fetchedSettings.bookingOptions) ? fetchedSettings.bookingOptions :
                                     hasOptions(fetchedSettings.bookingoptions) ? fetchedSettings.bookingoptions :
                                     prev.bookingOptions,
                     isMaintenanceMode: fetchedSettings.isMaintenanceMode ?? fetchedSettings.ismaintenancemode ?? prev.isMaintenanceMode ?? false,
                     companyName: fetchedSettings.companyName || fetchedSettings.companyname || prev.companyName,
                     logoUrl: fetchedSettings.logoUrl || fetchedSettings.logourl || prev.logoUrl,
                     heroBgUrl: fetchedSettings.heroBgUrl || fetchedSettings.herobgurl || prev.heroBgUrl,
                     heroVideoUrl: fetchedSettings.heroVideoUrl || prev.heroVideoUrl,
                     aboutUsImageUrl: fetchedSettings.aboutUsImageUrl || fetchedSettings.aboutusimageurl || prev.aboutUsImageUrl,
                     whatsAppNumber: fetchedSettings.whatsAppNumber || fetchedSettings.whatsappnumber || prev.whatsAppNumber,
                     showroomTitle: fetchedSettings.showroomTitle || fetchedSettings.showroomtitle || prev.showroomTitle,
                     showroomDescription: fetchedSettings.showroomDescription || fetchedSettings.showroomdescription || prev.showroomDescription,
                     taxEnabled: fetchedSettings.taxEnabled ?? fetchedSettings.taxenabled ?? prev.taxEnabled,
                     vatPercentage: fetchedSettings.vatPercentage ?? fetchedSettings.vatpercentage ?? prev.vatPercentage,
                     emailServiceId: fetchedSettings.emailServiceId || fetchedSettings.emailserviceid || prev.emailServiceId,
                     emailTemplateId: fetchedSettings.emailTemplateId || fetchedSettings.emailtemplateid || prev.emailTemplateId,
                     emailPublicKey: fetchedSettings.emailPublicKey || fetchedSettings.emailpublickey || prev.emailPublicKey,
                     businessHours: fetchedSettings.businessHours || fetchedSettings.businesshours || prev.businessHours,
                 };
             });
          }
      });
      unsubscribers.push(unsubSettings);

      // Subscribe to public collections
      unsubscribers.push(dbSubscribeToCollection('portfolio', (data) => setPortfolioData(data)));
      unsubscribers.push(dbSubscribeToCollection('specials', (data) => setSpecialsData(data))); 
      unsubscribers.push(dbSubscribeToCollection('showroom', (data) => setShowroomData(data)));
      unsubscribers.push(dbSubscribeToCollection('clients', (data) => setClients(data))); 
      unsubscribers.push(dbSubscribeToCollection('bookings', (data) => setBookings(data))); 
      unsubscribers.push(dbSubscribeToCollection('invoices', (data) => setInvoices(data))); 
      
    } catch (error) {
      console.error("Error setting up DB listeners:", error);
      setDataError("A critical error occurred while trying to connect to the database.");
    }

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, []);

  // --- PRIVATE (ADMIN) DATA FETCHING ---
  // No longer needed. Admin data fetched via public routes now or unnecessary.

  // --- LOADING STATE ---
  useEffect(() => {
    if (authChecked) {
      setLoading(false);
    }
  }, [authChecked]);


  // --- INTRO & NAVIGATION ---
  useEffect(() => {
    if (sessionStorage.getItem('introShown')) {
      setIsIntroVisible(false);
    }
  }, []);

  const handleEnter = () => {
    sessionStorage.setItem('introShown', 'true');
    setIsIntroVisible(false);
  };

  const PhotographyView = () => (
      <Routes>
          <Route path="/" element={<Navigate to="/magicalmemories/home" replace />} />
          <Route path="home" element={<PhotographyApp view="home" onNavigateHome={() => nav('/')} onNavigateAdmin={() => nav('/magicalmemories_admin')} />} />
          <Route path="library" element={<PhotographyApp view="library" onNavigateHome={() => nav('/')} onNavigateAdmin={() => nav('/magicalmemories_admin')} />} />
          <Route path="booking" element={<PhotographyApp view="booking" onNavigateHome={() => nav('/')} onNavigateAdmin={() => nav('/magicalmemories_admin')} />} />
      </Routes>
  );

  const PhotographyAdminView = () => {
    if (!user) {
        return <AdminLoginPage onNavigate={(view) => nav(view === 'home' ? '/' : `/${view}`)} logoUrl={settings.logoUrl} />;
    }
    return <PhotographyAdminDashboard user={user} onNavigate={(view) => {
        if(view === 'home') nav('/');
        else if(view.startsWith('magicalmemories')) nav(`/${view}`);
        else nav(`/${view}`);
    }} />;
  };

  const AdminView = () => (
      <AdminPage
        user={user}
        onNavigate={(view) => nav(view === 'home' ? '/' : `/${view}`)}
        portfolioData={portfolioData}
        onAddPortfolioItem={handleAddPortfolioItem}
        onUpdatePortfolioItem={handleUpdatePortfolioItem}
        onDeletePortfolioItem={handleDeletePortfolioItem}
        specialsData={specialsData}
        onAddSpecialItem={handleAddSpecialItem}
        onUpdateSpecialItem={handleUpdateSpecialItem}
        onDeleteSpecialItem={handleDeleteSpecialItem}
        showroomData={showroomData}
        onAddShowroomGenre={handleAddShowroomGenre}
        onUpdateShowroomGenre={handleUpdateShowroomGenre}
        onDeleteShowroomGenre={handleDeleteShowroomGenre}
        bookings={bookings}
        onUpdateBooking={handleUpdateBooking}
        onManualAddBooking={handleManualAddBooking}
        onDeleteBooking={handleDeleteBooking}
        clients={clients} 
        onAddClient={handleAddClient} 
        onUpdateClient={handleUpdateClient} 
        onDeleteClient={handleDeleteClient} 
        invoices={invoices}
        onAddInvoice={handleAddInvoice}
        onUpdateInvoice={handleUpdateInvoice}
        onDeleteInvoice={handleDeleteInvoice}
        onSaveAllSettings={handleSaveAllSettings}
        onClearAllData={handleClearAllData}
        onSuccessfulLogout={handleLogoutSuccess}
        {...settings}
      />
  );

  const handleLogoutSuccess = async () => {
    await dbLogout();
    setUser(null); 
    nav('/');
  };

  const HomeView = () => (
    <div className="relative">
      <StaticBosSalonBackground />
      <div>
        <Header onNavigate={(view) => nav(view === 'home' ? '/' : `/${view}`)} logoUrl={settings.logoUrl} companyName={settings.companyName} />
        <main>
          <Hero 
            portfolioData={portfolioData} 
            onNavigate={(view) => nav(view === 'home' ? '/' : `/${view}`)} 
            heroBgUrl={settings.heroBgUrl}
            heroVideoUrl={settings.heroVideoUrl}
            title={settings.hero?.title}
            subtitle={settings.hero?.subtitle}
            buttonText={settings.hero?.buttonText}
            whatsAppNumber={settings.whatsAppNumber}
          />
          <SpecialsCollage specials={[]} whatsAppNumber={settings.whatsAppNumber} /> 
          <WelcomeSection 
            title={settings.welcome?.title}
            text={settings.welcome?.text}
          />
          <AboutUs 
            aboutUsImageUrl={settings.aboutUsImageUrl} 
            title={settings.about?.title}
            text1={settings.about?.text1}
            text2={settings.about?.text2}
          />
          <SpecialsSection specials={specialsData} onNavigate={(view) => nav(view === 'home' ? '/' : `/${view}`)} whatsAppNumber={settings.whatsAppNumber} />
          <Showroom 
            showroomData={showroomData} 
            showroomTitle={settings.showroomTitle} 
            showroomDescription={settings.showroomDescription} 
            whatsAppNumber={settings.whatsAppNumber}
          />
          <ContactForm onAddBooking={handleAddBooking} settings={settings} />
        </main>
        <Footer
          companyName={settings.companyName}
          address={settings.address}
          phone={settings.phone}
          email={settings.email}
          businessHours={settings.businessHours}
          socialLinks={settings.socialLinks}
          apkUrl={settings.apkUrl}
          onNavigate={(view) => nav(view === 'home' ? '/' : `/${view}`)}
        />
      </div>
    </div>
  );

  const HomeWrapper = () => {
      const showMaintenance = settings.isMaintenanceMode && !user;
      if (showMaintenance) {
        return <MaintenancePage onNavigate={(view) => nav(view === 'home' ? '/' : `/${view}`)} logoUrl={settings.logoUrl} />;
      }
      if (isIntroVisible) {
        return <WelcomeIntro isVisible={isIntroVisible} onEnter={handleEnter} logoUrl={settings.logoUrl} />;
      }
      return <HomeView />;
  };

  // --- CRUD FUNCTIONS (Adapter Wrappers) ---
  const optimisticAdd = (setter: any, item: any) => { setter((prev: any) => [...prev, item]); };
  const optimisticUpdate = (setter: any, item: any) => { setter((prev: any) => prev.map((i: any) => i.id === item.id ? item : i)); };
  const optimisticDelete = (setter: any, id: string) => { setter((prev: any) => prev.filter((i: any) => i.id !== id)); };

  const handleUpdatePortfolioItem = async (item: PortfolioItem) => { optimisticUpdate(setPortfolioData, item); await dbUpdateItem('portfolio', item); };
  const handleAddPortfolioItem = async (item: Omit<PortfolioItem, 'id'>) => { const added = await dbAddItem('portfolio', item); optimisticAdd(setPortfolioData, added); };
  const handleDeletePortfolioItem = async (itemId: string) => { optimisticDelete(setPortfolioData, itemId); await dbDeleteItem('portfolio', itemId); };

  const handleUpdateSpecialItem = async (item: SpecialItem) => { optimisticUpdate(setSpecialsData, item); await dbUpdateItem('specials', item); };
  const handleAddSpecialItem = async (item: Omit<SpecialItem, 'id'>) => { const added = await dbAddItem('specials', item); optimisticAdd(setSpecialsData, added); };
  const handleDeleteSpecialItem = async (itemId: string) => { optimisticDelete(setSpecialsData, itemId); await dbDeleteItem('specials', itemId); };

  const handleUpdateShowroomGenre = async (item: Genre) => { optimisticUpdate(setShowroomData, item); await dbUpdateItem('showroom', item); };
  const handleAddShowroomGenre = async (item: Omit<Genre, 'id'>) => { const added = await dbAddItem('showroom', item); optimisticAdd(setShowroomData, added); };
  const handleDeleteShowroomGenre = async (itemId: string) => { optimisticDelete(setShowroomData, itemId); await dbDeleteItem('showroom', itemId); };
  
  const handleAddBooking = async (newBookingData: Omit<Booking, 'id' | 'status' | 'bookingType'>) => {
    const newBooking = {
      ...newBookingData,
      status: 'pending',
      bookingType: 'online',
    };
    const added = await dbAddItem('bookings', newBooking);
    optimisticAdd(setBookings, added);
  };
  const handleManualAddBooking = async (newBookingData: Omit<Booking, 'id' | 'bookingType'>) => {
    const newBooking = {
      ...newBookingData,
      bookingType: 'manual',
    };
    const added = await dbAddItem('bookings', newBooking);
    optimisticAdd(setBookings, added);
  };
  const handleUpdateBooking = async (item: Booking) => { optimisticUpdate(setBookings, item); await dbUpdateItem('bookings', item); };
  const handleDeleteBooking = async (id: string) => { optimisticDelete(setBookings, id); await dbDeleteItem('bookings', id); };

  const handleAddClient = async (item: Omit<Client, 'id'>) => { const added = await dbAddItem('clients', item); optimisticAdd(setClients, added); };
  const handleUpdateClient = async (item: Client) => { optimisticUpdate(setClients, item); await dbUpdateItem('clients', item); };
  const handleDeleteClient = async (id: string) => { optimisticDelete(setClients, id); await dbDeleteItem('clients', id); };

  const handleAddInvoice = async (item: Omit<Invoice, 'id'>) => { const added = await dbAddItem('invoices', item); optimisticAdd(setInvoices, added); };
  const handleUpdateInvoice = async (item: Invoice) => { optimisticUpdate(setInvoices, item); await dbUpdateItem('invoices', item); };
  const handleDeleteInvoice = async (id: string) => { optimisticDelete(setInvoices, id); await dbDeleteItem('invoices', id); };

  const handleSaveAllSettings = async (newSettings: any) => {
    // Optimistically update local application state instantly,
    // avoiding the need for a page refresh if Supabase Realtime isn't enabled
    setSettings((prev: any) => ({ ...prev, ...newSettings }));
    await dbSetDoc('settings', 'main', newSettings);
  };

  const handleClearAllData = async () => {
      if (!window.confirm("ARE YOU SURE? This will delete ALL content from your live database. This is irreversible.")) return;
      const collections = ['portfolio', 'specials', 'showroom', 'bookings', 'clients'];
      try {
          for (const col of collections) {
              await dbClearCollection(col as any);
          }
          alert('All live data has been cleared.');
      } catch (error) {
          console.error("Error clearing data:", error);
          alert("An error occurred while clearing data. Check console for details.");
      }
  };
  
  // --- RENDER LOGIC ---

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-brand-dark">
         <img src={settings.logoUrl || "https://i.ibb.co/gLSThX4v/unnamed-removebg-preview.png"} alt="Bos Salon Logo" className="w-48 h-48 object-contain animate-pulse"/>
         <p className="text-brand-light/70 mt-4 font-bold uppercase tracking-widest text-xs">Opening Studio...</p>
      </div>
    );
  }
  
  if (dataError) {
    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-brand-dark text-brand-light p-8 text-center">
            <div className="max-w-2xl">
                <h1 className="text-2xl font-bold text-red-500 mb-4">🚨 Application Error</h1>
                <p className="mb-4">A critical error occurred while fetching data:</p>
                <p className="font-mono bg-black/10 p-4 rounded-lg text-red-500 text-left text-sm whitespace-pre-wrap">{dataError}</p>
                <p className="mt-6 text-gray-500 text-sm">Please refresh or check your internet connection.</p>
            </div>
        </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<HomeWrapper />} />
      <Route path="/boshome" element={<HomeWrapper />} />
      <Route path="/magicalmemories/*" element={<PhotographyView />} />
      <Route path="/magicalmemories_admin" element={<PhotographyAdminView />} />
      <Route path="/admin" element={<AdminView />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;