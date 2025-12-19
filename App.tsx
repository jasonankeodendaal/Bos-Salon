
import React, { useState, useEffect } from 'react';
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
import MaintenancePage from './components/MaintenancePage';
import SpecialsSection from './components/SpecialsSection';
import ClientPortal from './pages/ClientPortal';
import StaticBosSalonBackground from './components/StaticBosSalonBackground';

// --- INTERFACES ---
export interface PortfolioItem {
  id: string;
  title: string;
  story: string;
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
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]); // New Inventory
  const [invoices, setInvoices] = useState<Invoice[]>([]); // New Invoices
  const [clients, setClients] = useState<Client[]>([]); // New Clients collection
  
  // Site settings - Now includes nested objects for specific sections
  const [settings, setSettings] = useState<any>({
    companyName: 'Bos Salon',
    logoUrl: 'https://i.ibb.co/gLSThX4v/unnamed-removebg-preview.png',
    heroBgUrl: 'https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?auto=format&fit=crop&w=1920&q=80',
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
    
    // Default sanctuary perks
    sanctuaryPerks: [
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

  const [currentView, setCurrentView] = useState<'home' | 'admin' | 'client-portal'>('home');
  const [isIntroVisible, setIsIntroVisible] = useState(true);
  
  // --- REFRESH AUTO LOGOUT LOGIC ---
  useEffect(() => {
      // User specifically requested auto-logout on every refresh
      const performAutoLogoutOnRefresh = async () => {
          await dbLogout();
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

      // Check for redirect intent from Google Login
      const redirectDest = localStorage.getItem('login_redirect_destination');
      if (currentUser && redirectDest) {
          if (redirectDest === 'client-portal') setCurrentView('client-portal');
          if (redirectDest === 'admin') setCurrentView('admin');
          localStorage.removeItem('login_redirect_destination');
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
             // NORMALIZE DATA
             const normalizedSettings = {
                 ...fetchedSettings,
                 socialLinks: fetchedSettings.socialLinks || fetchedSettings.sociallinks || [],
                 loyaltyPrograms: fetchedSettings.loyaltyPrograms || fetchedSettings.loyaltyprograms || [],
                 sanctuaryPerks: fetchedSettings.sanctuaryPerks || fetchedSettings.sanctuaryperks || [],
                 bookingOptions: fetchedSettings.bookingOptions || fetchedSettings.bookingoptions || [],
                 isMaintenanceMode: fetchedSettings.isMaintenanceMode ?? fetchedSettings.ismaintenancemode ?? false,
                 companyName: fetchedSettings.companyName || fetchedSettings.companyname,
                 logoUrl: fetchedSettings.logoUrl || fetchedSettings.logourl,
                 heroBgUrl: fetchedSettings.heroBgUrl || fetchedSettings.herobgurl,
                 aboutUsImageUrl: fetchedSettings.aboutUsImageUrl || fetchedSettings.aboutusimageurl,
                 whatsAppNumber: fetchedSettings.whatsAppNumber || fetchedSettings.whatsappnumber,
                 showroomTitle: fetchedSettings.showroomTitle || fetchedSettings.showroomtitle,
                 showroomDescription: fetchedSettings.showroomDescription || fetchedSettings.showroomdescription,
                 taxEnabled: fetchedSettings.taxEnabled ?? fetchedSettings.taxenabled,
                 vatPercentage: fetchedSettings.vatPercentage ?? fetchedSettings.vatpercentage,
                 emailServiceId: fetchedSettings.emailServiceId || fetchedSettings.emailserviceid,
                 emailTemplateId: fetchedSettings.emailTemplateId || fetchedSettings.emailtemplateid,
                 emailPublicKey: fetchedSettings.emailPublicKey || fetchedSettings.emailpublickey,
                 businessHours: fetchedSettings.businessHours || fetchedSettings.businesshours,
             };
             setSettings((prev: any) => ({ ...prev, ...normalizedSettings }));
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
  useEffect(() => {
    if (!user) {
      setExpenses([]);
      setInventory([]);
      return;
    }

    const unsubscribers: (() => void)[] = [];
    try {
        unsubscribers.push(dbSubscribeToCollection('expenses', (data) => setExpenses(data)));
        unsubscribers.push(dbSubscribeToCollection('inventory', (data) => setInventory(data)));
    } catch (error) {
      console.error("Error setting up private listeners:", error);
      setDataError("A critical error occurred while trying to load administrator data.");
    }
    
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [user]); 

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

  const navigate = (view: 'home' | 'admin' | 'client-portal') => setCurrentView(view);

  const handleLogoutSuccess = async () => {
    await dbLogout();
    setUser(null); 
    navigate('home');
  };

  // --- CRUD FUNCTIONS (Adapter Wrappers) ---
  const handleUpdatePortfolioItem = async (item: PortfolioItem) => await dbUpdateItem('portfolio', item);
  const handleAddPortfolioItem = async (item: Omit<PortfolioItem, 'id'>) => await dbAddItem('portfolio', item);
  const handleDeletePortfolioItem = async (itemId: string) => await dbDeleteItem('portfolio', itemId);

  const handleUpdateSpecialItem = async (item: SpecialItem) => await dbUpdateItem('specials', item);
  const handleAddSpecialItem = async (item: Omit<SpecialItem, 'id'>) => await dbAddItem('specials', item);
  const handleDeleteSpecialItem = async (itemId: string) => await dbDeleteItem('specials', itemId);

  const handleUpdateShowroomGenre = async (item: Genre) => await dbUpdateItem('showroom', item);
  const handleAddShowroomGenre = async (item: Omit<Genre, 'id'>) => await dbAddItem('showroom', item);
  const handleDeleteShowroomGenre = async (itemId: string) => await dbDeleteItem('showroom', itemId);
  
  const handleAddBooking = async (newBookingData: Omit<Booking, 'id' | 'status' | 'bookingType'>) => {
    const newBooking = {
      ...newBookingData,
      status: 'pending',
      bookingType: 'online',
    };
    await dbAddItem('bookings', newBooking);
  };
  const handleManualAddBooking = async (newBookingData: Omit<Booking, 'id' | 'bookingType'>) => {
    const newBooking = {
      ...newBookingData,
      bookingType: 'manual',
    };
    await dbAddItem('bookings', newBooking);
  };
  const handleUpdateBooking = async (item: Booking) => await dbUpdateItem('bookings', item);
  const handleDeleteBooking = async (id: string) => await dbDeleteItem('bookings', id);

  const handleAddExpense = async (newExpense: Omit<Expense, 'id'>) => await dbAddItem('expenses', newExpense);
  const handleUpdateExpense = async (updatedExpense: Expense) => await dbUpdateItem('expenses', updatedExpense);
  const handleDeleteExpense = async (expenseId: string) => await dbDeleteItem('expenses', expenseId);

  const handleAddInventoryItem = async (item: Omit<InventoryItem, 'id'>) => await dbAddItem('inventory', item);
  const handleUpdateInventoryItem = async (item: InventoryItem) => await dbUpdateItem('inventory', item);
  const handleDeleteInventoryItem = async (id: string) => await dbDeleteItem('inventory', id);

  const handleAddInvoice = async (item: Omit<Invoice, 'id'>) => await dbAddItem('invoices', item);
  const handleUpdateInvoice = async (item: Invoice) => await dbUpdateItem('invoices', item);
  const handleDeleteInvoice = async (id: string) => await dbDeleteItem('invoices', id);

  const handleAddClient = async (item: Omit<Client, 'id'>) => await dbAddItem('clients', item);
  const handleUpdateClient = async (item: Client) => await dbUpdateItem('clients', item);
  const handleDeleteClient = async (id: string) => await dbDeleteItem('clients', id);

  const handleSaveAllSettings = async (newSettings: any) => {
    await dbSetDoc('settings', 'main', newSettings);
  };

  const handleClearAllData = async () => {
      if (!window.confirm("ARE YOU SURE? This will delete ALL content from your live database. This is irreversible.")) return;
      const collections = ['portfolio', 'specials', 'showroom', 'bookings', 'expenses', 'inventory', 'invoices', 'clients'];
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

  // Admin and Client Portal views are always accessible if explicitly navigated to
  if (currentView === 'admin') {
    return (
      <AdminPage
        user={user}
        onNavigate={navigate}
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
        expenses={expenses}
        onAddExpense={handleAddExpense}
        onUpdateExpense={handleUpdateExpense}
        onDeleteExpense={handleDeleteExpense}
        inventory={inventory}
        onAddInventoryItem={handleAddInventoryItem}
        onUpdateInventoryItem={handleUpdateInventoryItem}
        onDeleteInventoryItem={handleDeleteInventoryItem}
        invoices={invoices}
        onAddInvoice={handleAddInvoice}
        onUpdateInvoice={handleUpdateInvoice}
        onDeleteInvoice={handleDeleteInvoice}
        clients={clients} 
        onAddClient={handleAddClient} 
        onUpdateClient={handleUpdateClient} 
        onDeleteClient={handleDeleteClient} 
        onSaveAllSettings={handleSaveAllSettings}
        onClearAllData={handleClearAllData}
        onSuccessfulLogout={handleLogoutSuccess}
        {...settings}
      />
    );
  }

  if (currentView === 'client-portal') {
      return (
          <ClientPortal 
            logoUrl={settings.logoUrl}
            companyName={settings.companyName}
            onNavigate={navigate}
            clients={clients}
            bookings={bookings}
            invoices={invoices}
            specials={specialsData}
            onAddBooking={handleAddBooking}
            onUpdateBooking={handleUpdateBooking}
            onUpdateInvoice={handleUpdateInvoice}
            onUpdateClient={handleUpdateClient}
            settings={settings}
            onAddClient={handleAddClient}
            authenticatedUser={user}
          />
      );
  }

  // Maintenance Mode Logic: Triggered if enabled AND user is NOT an admin (auth user)
  // This ensures admins can still see the dashboard even if maintenance is on
  const showMaintenance = settings.isMaintenanceMode && !user;

  if (showMaintenance) {
    return <MaintenancePage onNavigate={navigate} logoUrl={settings.logoUrl} />;
  }

  if (isIntroVisible) {
    return <WelcomeIntro isVisible={isIntroVisible} onEnter={handleEnter} logoUrl={settings.logoUrl} />;
  }
  
  return (
    <div className="relative">
      <StaticBosSalonBackground />
      <div>
        <Header onNavigate={navigate} logoUrl={settings.logoUrl} companyName={settings.companyName} />
        <main>
          <Hero 
            portfolioData={portfolioData} 
            onNavigate={navigate} 
            heroBgUrl={settings.heroBgUrl}
            title={settings.hero?.title}
            subtitle={settings.hero?.subtitle}
            buttonText={settings.hero?.buttonText}
          />
          <SpecialsCollage specials={[]} whatsAppNumber={settings.whatsAppNumber} /> 
          <AboutUs 
            aboutUsImageUrl={settings.aboutUsImageUrl} 
            title={settings.about?.title}
            text1={settings.about?.text1}
            text2={settings.about?.text2}
          />
          <SpecialsSection specials={specialsData} onNavigate={navigate} whatsAppNumber={settings.whatsAppNumber} />
          <Showroom 
            showroomData={showroomData} 
            showroomTitle={settings.showroomTitle} 
            showroomDescription={settings.showroomDescription} 
          />
          <ContactForm onAddBooking={handleAddBooking} settings={settings} />
        </main>
        <Footer
          companyName={settings.companyName}
          address={settings.address}
          phone={settings.phone}
          email={settings.email}
          socialLinks={settings.socialLinks}
          apkUrl={settings.apkUrl}
          onNavigate={navigate}
        />
      </div>
    </div>
  );
};

export default App;
