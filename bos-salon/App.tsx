
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
  referenceImages?: string[];
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
    socialLinks: [],
    showroomTitle: 'Tattoo Flash Gallery',
    showroomDescription: "Browse our collection of custom designs and flash art.",
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
    
    // Legacy Loyalty (Single) - Kept for fallback
    loyaltyProgram: {
        enabled: true,
        stickersRequired: 10,
        rewardDescription: '50% Off your next session',
        terms: 'Valid on treatments over R300. Not exchangeable for cash.'
    },
    
    // NEW: Multiple Loyalty Programs
    loyaltyPrograms: [], // Array of LoyaltyProgram objects
    
    // Default sub-objects for specific sections
    hero: {
        title: 'Ink & Artistry',
        subtitle: 'Experience the art of skin',
        buttonText: 'Book an Appointment'
    },
    about: {
        title: 'Our Story',
        text1: 'Bos Salon was born from a passion for permanent art and self-expression.',
        text2: 'We specialize in custom tattoos, ensuring every piece tells a unique story.'
    },
    contact: {
        intro: 'Ready for new ink? Fill out the form below.'
    }
  });

  const [currentView, setCurrentView] = useState<'home' | 'admin' | 'client-portal'>('home');
  const [isIntroVisible, setIsIntroVisible] = useState(true);
  
  // --- AUTH STATE LISTENER ---
  useEffect(() => {
    const unsubscribe = dbOnAuthStateChange((currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);

      // Check for redirect intent from Google Login
      const redirectDest = localStorage.getItem('login_redirect_destination');
      if (currentUser && redirectDest === 'client-portal') {
          setCurrentView('client-portal');
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
             // NORMALIZE DATA: Check for both camelCase and lowercase keys to handle Postgres vagaries
             const normalizedSettings = {
                 ...fetchedSettings,
                 // Force socialLinks to populate from either socialLinks OR sociallinks
                 socialLinks: fetchedSettings.socialLinks || fetchedSettings.sociallinks || [],
                 // Same for loyalty programs
                 loyaltyPrograms: fetchedSettings.loyaltyPrograms || fetchedSettings.loyaltyprograms || [],
             };
             setSettings((prev: any) => ({ ...prev, ...normalizedSettings }));
          }
      });
      unsubscribers.push(unsubSettings);

      // Subscribe to public collections
      unsubscribers.push(dbSubscribeToCollection('portfolio', (data) => setPortfolioData(data)));
      unsubscribers.push(dbSubscribeToCollection('specials', (data) => setSpecialsData(data))); // Public specials
      unsubscribers.push(dbSubscribeToCollection('showroom', (data) => setShowroomData(data)));
      unsubscribers.push(dbSubscribeToCollection('clients', (data) => setClients(data))); // Clients need to be public for portal login check (simulated)
      unsubscribers.push(dbSubscribeToCollection('bookings', (data) => setBookings(data))); // Bookings public for portal (filtered by client)
      unsubscribers.push(dbSubscribeToCollection('invoices', (data) => setInvoices(data))); // Invoices public for portal (filtered by client)
      
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
        // Admin only collections
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
    
    // Email Notification Mock Logic (Simulating Backend/EmailJS)
    if(settings.emailServiceId && settings.emailTemplateId && settings.emailPublicKey) {
       console.log("Attempting to send email notification via EmailJS configuration...");
       // Here you would implement emailjs.send(...)
    }
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

  // Inventory CRUD
  const handleAddInventoryItem = async (item: Omit<InventoryItem, 'id'>) => await dbAddItem('inventory', item);
  const handleUpdateInventoryItem = async (item: InventoryItem) => await dbUpdateItem('inventory', item);
  const handleDeleteInventoryItem = async (id: string) => await dbDeleteItem('inventory', id);

  // Invoice CRUD
  const handleAddInvoice = async (item: Omit<Invoice, 'id'>) => await dbAddItem('invoices', item);
  const handleUpdateInvoice = async (item: Invoice) => await dbUpdateItem('invoices', item);
  const handleDeleteInvoice = async (id: string) => await dbDeleteItem('invoices', id);

  // Client CRUD
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
         <p className="text-brand-light/70 mt-4">Opening Studio...</p>
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
        // Spread all settings as props so Admin page gets everything
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
            specials={specialsData} // Passed specials
            onAddBooking={handleAddBooking} // Passed booking function
            onUpdateBooking={handleUpdateBooking}
            onUpdateInvoice={handleUpdateInvoice}
            settings={settings} // Pass settings for loyalty program config
            onAddClient={handleAddClient} // Pass ability to create new client record
            authenticatedUser={user} // Pass the auth user state
          />
      );
  }

  if (isIntroVisible) {
    return <WelcomeIntro isVisible={isIntroVisible} onEnter={handleEnter} logoUrl={settings.logoUrl} />;
  }
  
  const showMaintenance = settings.isMaintenanceMode && !user;

  return (
    <div className="relative">
      <StaticBosSalonBackground />
      <div className={showMaintenance ? 'blur-sm brightness-50 pointer-events-none' : ''}>
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
          {/* Legacy Collage for Showroom/Portfolio - kept as "Flash Designs" */}
          <SpecialsCollage specials={[]} whatsAppNumber={settings.whatsAppNumber} /> 
          <AboutUs 
            aboutUsImageUrl={settings.aboutUsImageUrl} 
            title={settings.about?.title}
            text1={settings.about?.text1}
            text2={settings.about?.text2}
          />
          {/* New Public Specials Section */}
          <SpecialsSection specials={specialsData} onNavigate={navigate} whatsAppNumber={settings.whatsAppNumber} />
          <Showroom 
            showroomData={showroomData} 
            showroomTitle={settings.showroomTitle} 
            showroomDescription={settings.showroomDescription} 
          />
          <ContactForm onAddBooking={handleAddBooking} />
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

      {showMaintenance && <MaintenancePage onNavigate={navigate} logoUrl={settings.logoUrl} />}
    </div>
  );
};

export default App;
