
import React from 'react';
import AdminLoginPage from '../AdminLoginPage';
import AdminDashboard from './AdminDashboard';
import { PortfolioItem, SpecialItem, Genre, Booking, SocialLink, Expense, InventoryItem, Invoice, Client, LoyaltyProgram, BookingOption } from '../../App';

export interface AdminPageProps {
  user: any | null; // Supports Supabase User or Mock User object
  onNavigate: (view: 'home' | 'admin') => void;
  onSuccessfulLogout: () => void;

  // Portfolio
  portfolioData: PortfolioItem[];
  onAddPortfolioItem: (item: Omit<PortfolioItem, 'id'>) => Promise<void>;
  onUpdatePortfolioItem: (item: PortfolioItem) => Promise<void>;
  onDeletePortfolioItem: (id: string) => Promise<void>;

  // Specials
  specialsData: SpecialItem[];
  onAddSpecialItem: (item: Omit<SpecialItem, 'id'>) => Promise<void>;
  onUpdateSpecialItem: (item: SpecialItem) => Promise<void>;
  onDeleteSpecialItem: (id: string) => Promise<void>;

  // Showroom
  showroomData: Genre[];
  onAddShowroomGenre: (item: Omit<Genre, 'id'>) => Promise<void>;
  onUpdateShowroomGenre: (item: Genre) => Promise<void>;
  onDeleteShowroomGenre: (id: string) => Promise<void>;

  // Bookings
  bookings: Booking[];
  onUpdateBooking: (booking: Booking) => Promise<void>;
  onManualAddBooking: (booking: Omit<Booking, 'id' | 'bookingType'>) => Promise<void>;
  onDeleteBooking: (id: string) => Promise<void>;

  // Expenses
  expenses: Expense[];
  onAddExpense: (newExpense: Omit<Expense, 'id'>) => Promise<void>;
  onUpdateExpense: (updatedExpense: Expense) => Promise<void>;
  onDeleteExpense: (expenseId: string) => Promise<void>;

  // Inventory
  inventory: InventoryItem[];
  onAddInventoryItem: (newItem: Omit<InventoryItem, 'id'>) => Promise<void>;
  onUpdateInventoryItem: (updatedItem: InventoryItem) => Promise<void>;
  onDeleteInventoryItem: (itemId: string) => Promise<void>;

  // Invoices
  invoices: Invoice[];
  onAddInvoice: (item: Omit<Invoice, 'id'>) => Promise<void>;
  onUpdateInvoice: (item: Invoice) => Promise<void>;
  onDeleteInvoice: (id: string) => Promise<void>;
  
  // Clients
  clients: Client[];
  onAddClient: (item: Omit<Client, 'id'>) => Promise<void>;
  onUpdateClient: (item: Client) => Promise<void>;
  onDeleteClient: (id: string) => Promise<void>;

  // Settings
  onSaveAllSettings: (settings: any) => Promise<void>;
  onClearAllData: () => Promise<void>;

  // Pass-through settings properties
  companyName: string;
  logoUrl: string;
  aboutUsImageUrl: string;
  whatsAppNumber: string;
  address: string;
  phone: string;
  email: string;
  socialLinks: SocialLink[];
  showroomTitle: string;
  showroomDescription: string;
  heroBgUrl: string;
  bankName: string;
  accountNumber: string;
  branchCode: string;
  accountType: string;
  vatNumber: string;
  isMaintenanceMode: boolean;
  apkUrl: string;
  taxEnabled: boolean;
  vatPercentage: number;
  loyaltyProgram: any;
  loyaltyPrograms: LoyaltyProgram[]; 
  bookingOptions: BookingOption[];
  
  // Settings Sections
  hero?: any;
  about?: any;
  contact?: any;
  aftercare?: any;
  emailServiceId: string;
  emailTemplateId: string;
  emailPublicKey: string;
}

const AdminPage: React.FC<AdminPageProps> = (props) => {
  const isAuthenticated = !!props.user;

  const handleLogout = () => {
    // Logout logic is handled in App.tsx via dbLogout
    props.onSuccessfulLogout();
  };

  if (isAuthenticated) {
    return <AdminDashboard onLogout={handleLogout} {...props} />;
  }
  
  return <AdminLoginPage onNavigate={props.onNavigate} logoUrl={props.logoUrl} />;
};

export default AdminPage;
