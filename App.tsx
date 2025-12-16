
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import AboutUs from './components/AboutUs';
import SpecialsSection from './components/SpecialsSection';
import Showroom from './pages/ShowroomPage';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';
import AdminPage from './pages/AdminPage';
import ClientPortal from './pages/ClientPortal';
import MaintenancePage from './components/MaintenancePage';
import WelcomeIntro from './components/WelcomeIntro';
import { 
  dbOnAuthStateChange, 
  dbSubscribeToCollection, 
  dbAddItem, 
  dbUpdateItem, 
  dbDeleteItem, 
  dbLogout, 
  dbSetDoc,
  dbClearCollection
} from './utils/dbAdapter';

// --- Type Definitions ---

export interface PortfolioItem {
  id: string;
  title: string;
  story: string;
  primaryImage: string;
  galleryImages: string[];
  videoData?: string;
  featured?: boolean;
}

export interface SpecialItem {
  id: string;
  title: string;
  description: string;
  price?: number;
  priceValue?: number;
  priceType?: 'fixed' | 'hourly' | 'percentage';
  imageUrl: string;
  images?: string[];
  active: boolean;
  details?: string[];
  voucherCode?: string;
}

export interface ShowroomItem {
  id: string;
  title: string;
  images: string[];
  videoUrl?: string | File;
}

export interface Genre {
  id: string;
  name: string;
  items: ShowroomItem[];
}

export interface Booking {
  id: string;
  name: string;
  email: string;
  whatsappNumber?: string;
  message: string;
  bookingDate: string;
  status: 'pending' | 'quote_sent' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  bookingType: 'online' | 'manual';
  totalCost?: number;
  amountPaid?: number;
  paymentMethod?: 'cash' | 'card' | 'eft' | 'other';
  referenceImages?: string[];
  contactMethod?: 'email' | 'whatsapp';
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  type: 'quote' | 'invoice';
  number: string;
  clientId?: string;
  bookingId?: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  dateIssued: string;
  dateDue: string;
  status: 'draft' | 'sent' | 'paid' | 'accepted' | 'overdue' | 'void';
  items: InvoiceLineItem[];
  notes?: string;
  subtotal: number;
  taxAmount: number;
  total: number;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  notes?: string;
  stickers?: number;
  loyaltyProgress?: Record<string, number>;
  rewardsRedeemed?: number;
}

export interface LoyaltyProgram {
  id: string;
  name: string;
  stickersRequired: number;
  rewardDescription: string;
  terms?: string;
  active: boolean;
  iconUrl?: string;
}

export interface Expense {
  id: string;
  date: string;
  category: string; // 'Supplies' | 'Rent' | 'Stock' | ...
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
  supplier?: string;
}

export interface SocialLink {
  id: string;
  url: string;
  icon: string;
}

const App: React.FC = () => {
  // State
  const [currentView, setCurrentView] = useState<'home' | 'admin' | 'client-portal'>('home');
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  // Data State
  const [portfolioData, setPortfolioData] = useState<PortfolioItem[]>([]);
  const [specialsData, setSpecialsData] = useState<SpecialItem[]>([]);
  const [showroomData, setShowroomData] = useState<Genre[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [settings, setSettings] = useState<any>({});

  // Auth Listener
  useEffect(() => {
    const unsubscribe = dbOnAuthStateChange((currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);

      // Handle Redirects (e.g. returning from Google OAuth)
      if (currentUser) {
          const redirectTarget = sessionStorage.getItem('auth_redirect');
          if (redirectTarget === 'client-portal') {
              setCurrentView('client-portal');
              sessionStorage.removeItem('auth_redirect'); // Clear flag
          }
      }
    });
    return () => unsubscribe();
  }, []);

  // Data Subscriptions
  useEffect(() => {
    const subs = [
      dbSubscribeToCollection('portfolio', (data) => setPortfolioData(data)),
      dbSubscribeToCollection('specials', (data) => setSpecialsData(data)),
      dbSubscribeToCollection('showroom', (data) => setShowroomData(data)),
      dbSubscribeToCollection('bookings', (data) => setBookings(data)),
      dbSubscribeToCollection('expenses', (data) => setExpenses(data)),
      dbSubscribeToCollection('inventory', (data) => setInventory(data)),
      dbSubscribeToCollection('invoices', (data) => setInvoices(data)),
      dbSubscribeToCollection('clients', (data) => setClients(data)),
      dbSubscribeToCollection('settings', (data) => {
        if (data && data.length > 0) setSettings(data[0]);
      }),
    ];
    return () => {
      subs.forEach(unsub => unsub && unsub());
    };
  }, []);

  // Handlers
  const handleAddBooking = async (booking: Omit<Booking, 'id' | 'status' | 'bookingType'>) => {
    try {
      await dbAddItem('bookings', {
        ...booking,
        status: 'pending',
        bookingType: 'online'
      });
    } catch (e) {
      console.error("Booking Error", e);
      alert("Failed to submit booking.");
    }
  };

  const handleNavigate = (view: 'home' | 'admin' | 'client-portal') => {
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  if (settings.isMaintenanceMode && currentView === 'home' && !user) {
    return <MaintenancePage onNavigate={handleNavigate} logoUrl={settings.logoUrl} />;
  }

  return (
    <>
      {currentView === 'home' && showWelcome && (
        <WelcomeIntro 
          isVisible={showWelcome} 
          onEnter={() => setShowWelcome(false)} 
          logoUrl={settings.logoUrl || ''} 
        />
      )}

      {currentView === 'home' && (
        <div className="font-sans text-brand-dark bg-brand-off-white">
          <Header 
            onNavigate={handleNavigate} 
            logoUrl={settings.logoUrl} 
            companyName={settings.companyName || 'Bos Salon'} 
          />
          <main>
            <Hero 
              portfolioData={portfolioData} 
              onNavigate={handleNavigate} 
              heroTattooGunImageUrl={settings.heroTattooGunImageUrl || ''}
              title={settings.hero?.title}
              subtitle={settings.hero?.subtitle}
              buttonText={settings.hero?.buttonText}
            />
            <AboutUs 
              aboutUsImageUrl={settings.aboutUsImageUrl || ''}
              title={settings.about?.title}
              text1={settings.about?.text1}
              text2={settings.about?.text2}
            />
            <SpecialsSection 
              specials={specialsData} 
              onNavigate={handleNavigate} 
              whatsAppNumber={settings.whatsAppNumber || ''} 
            />
            <Showroom 
              showroomData={showroomData} 
              showroomTitle={settings.showroomTitle || 'Showroom'}
              showroomDescription={settings.showroomDescription || 'Gallery'}
            />
            <ContactForm onAddBooking={handleAddBooking} />
          </main>
          <Footer 
            companyName={settings.companyName || 'Bos Salon'}
            address={settings.address || ''}
            phone={settings.phone || ''}
            email={settings.email || ''}
            socialLinks={settings.socialLinks || []}
            apkUrl={settings.apkUrl || ''}
            onNavigate={handleNavigate}
          />
        </div>
      )}

      {currentView === 'admin' && (
        <AdminPage 
          user={user}
          onNavigate={handleNavigate}
          onSuccessfulLogout={dbLogout}
          portfolioData={portfolioData}
          onAddPortfolioItem={(item) => dbAddItem('portfolio', item)}
          onUpdatePortfolioItem={(item) => dbUpdateItem('portfolio', item)}
          onDeletePortfolioItem={(id) => dbDeleteItem('portfolio', id)}
          specialsData={specialsData}
          onAddSpecialItem={(item) => dbAddItem('specials', item)}
          onUpdateSpecialItem={(item) => dbUpdateItem('specials', item)}
          onDeleteSpecialItem={(id) => dbDeleteItem('specials', id)}
          showroomData={showroomData}
          onAddShowroomGenre={(item) => dbAddItem('showroom', item)}
          onUpdateShowroomGenre={(item) => dbUpdateItem('showroom', item)}
          onDeleteShowroomGenre={(id) => dbDeleteItem('showroom', id)}
          bookings={bookings}
          onUpdateBooking={(item) => dbUpdateItem('bookings', item)}
          onManualAddBooking={(item) => dbAddItem('bookings', { ...item, bookingType: 'manual' })}
          onDeleteBooking={(id) => dbDeleteItem('bookings', id)}
          expenses={expenses}
          onAddExpense={(item) => dbAddItem('expenses', item)}
          onUpdateExpense={(item) => dbUpdateItem('expenses', item)}
          onDeleteExpense={(id) => dbDeleteItem('expenses', id)}
          inventory={inventory}
          onAddInventoryItem={(item) => dbAddItem('inventory', item)}
          onUpdateInventoryItem={(item) => dbUpdateItem('inventory', item)}
          onDeleteInventoryItem={(id) => dbDeleteItem('inventory', id)}
          invoices={invoices}
          onAddInvoice={(item) => dbAddItem('invoices', item)}
          onUpdateInvoice={(item) => dbUpdateItem('invoices', item)}
          onDeleteInvoice={(id) => dbDeleteItem('invoices', id)}
          clients={clients}
          onAddClient={(item) => dbAddItem('clients', item)}
          onUpdateClient={(item) => dbUpdateItem('clients', item)}
          onDeleteClient={(id) => dbDeleteItem('clients', id)}
          onSaveAllSettings={(newSettings) => dbSetDoc('settings', 'main', newSettings)}
          onClearAllData={async () => {
             if(window.confirm("ARE YOU SURE? This will delete almost everything.")) {
                 await dbClearCollection('portfolio');
                 await dbClearCollection('specials');
                 await dbClearCollection('showroom');
                 await dbClearCollection('bookings');
                 await dbClearCollection('expenses');
                 await dbClearCollection('inventory');
                 await dbClearCollection('invoices');
                 await dbClearCollection('clients');
                 alert("Data cleared.");
             }
          }}
          {...settings}
          loyaltyPrograms={settings.loyaltyPrograms || []}
        />
      )}

      {currentView === 'client-portal' && (
        <ClientPortal 
           onNavigate={handleNavigate}
           logoUrl={settings.logoUrl}
           companyName={settings.companyName}
           clients={clients}
           bookings={bookings}
           invoices={invoices}
           loyaltyPrograms={settings.loyaltyPrograms || []}
        />
      )}
    </>
  );
};

export default App;
