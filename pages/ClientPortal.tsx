
import React, { useState, useEffect } from 'react';
import { Client, Booking, Invoice, SpecialItem, LoyaltyProgram } from '../App';
import { dbUploadFile, dbLoginWithGoogle, dbLogout } from '../utils/dbAdapter';

interface ClientPortalProps {
  logoUrl: string;
  companyName: string;
  onNavigate: (view: 'home' | 'admin' | 'client-portal') => void;
  clients: Client[];
  bookings: Booking[];
  invoices: Invoice[];
  specials: SpecialItem[];
  onAddBooking: (booking: Omit<Booking, 'id' | 'status' | 'bookingType'>) => Promise<void>;
  onUpdateBooking: (booking: Booking) => Promise<void>;
  onUpdateInvoice: (invoice: Invoice) => Promise<void>;
  onAddClient: (client: Omit<Client, 'id'>) => Promise<void>;
  settings?: any;
  authenticatedUser?: any; // The Supabase user object from App
}

const InvoicePreviewModal: React.FC<{ invoice: Invoice, onClose: () => void }> = ({ invoice, onClose }) => {
    return (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm no-print" onClick={onClose}>
            <div className="printable-content bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center bg-gray-50 no-print">
                    <h3 className="font-bold text-gray-800">{invoice.type === 'quote' ? 'Quote' : 'Invoice'} #{invoice.number}</h3>
                    <div className="flex gap-2">
                        <button onClick={() => window.print()} className="text-sm font-bold text-blue-600 hover:text-blue-800 px-3 py-1 border border-blue-200 rounded">Print</button>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl leading-none">&times;</button>
                    </div>
                </div>
                <div className="p-8 overflow-y-auto bg-white text-gray-800 text-sm font-sans">
                    {/* Header */}
                    <div className="flex justify-between items-start border-b pb-6 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{invoice.clientName}</h1>
                            <p className="text-gray-500">{invoice.clientEmail}</p>
                            <p className="text-gray-500">{invoice.clientPhone}</p>
                        </div>
                        <div className="text-right">
                            <span className={`inline-block px-3 py-1 rounded text-xs font-bold uppercase tracking-wider mb-2 ${invoice.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{invoice.status}</span>
                            <p className="text-gray-500">Date: {invoice.dateIssued}</p>
                            <p className="text-gray-500">Due: {invoice.dateDue}</p>
                        </div>
                    </div>
                    {/* Items */}
                    <table className="w-full mb-8">
                        <thead>
                            <tr className="border-b-2 border-gray-800 text-left">
                                <th className="py-2 text-gray-800 font-bold w-1/2">Description</th>
                                <th className="py-2 text-gray-800 font-bold text-center">Qty</th>
                                <th className="py-2 text-gray-800 font-bold text-right">Price</th>
                                <th className="py-2 text-gray-800 font-bold text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items && invoice.items.map((item, idx) => (
                                <tr key={idx} className="border-b border-gray-100">
                                    <td className="py-3">{item.description}</td>
                                    <td className="py-3 text-center">{item.quantity}</td>
                                    <td className="py-3 text-right">R{item.unitPrice?.toFixed(2)}</td>
                                    <td className="py-3 text-right font-semibold">R{(item.quantity * item.unitPrice).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {/* Totals */}
                    <div className="flex justify-end">
                        <div className="w-64 space-y-2">
                            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>R{invoice.subtotal?.toFixed(2)}</span></div>
                            <div className="flex justify-between text-gray-600"><span>Tax</span><span>R{invoice.taxAmount?.toFixed(2)}</span></div>
                            <div className="flex justify-between text-xl font-bold text-gray-900 border-t pt-2"><span>Total</span><span>R{invoice.total?.toFixed(2)}</span></div>
                        </div>
                    </div>
                    {invoice.notes && (
                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <h4 className="font-bold text-gray-800 mb-1">Notes</h4>
                            <p className="text-gray-500 whitespace-pre-wrap">{invoice.notes}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const ClientPortal: React.FC<ClientPortalProps> = ({ 
  logoUrl, 
  companyName, 
  onNavigate, 
  clients,
  bookings,
  invoices,
  specials,
  onAddBooking,
  onUpdateBooking,
  onUpdateInvoice,
  onAddClient,
  settings,
  authenticatedUser
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'book' | 'bookings' | 'financials'>('overview');
  const [isProcessingLogin, setIsProcessingLogin] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'google' | 'manual'>('google');
  
  // Manual Login State
  const [manualEmail, setManualEmail] = useState('');
  const [manualPin, setManualPin] = useState('');
  
  // View State
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Booking Form State
  const [bookingDate, setBookingDate] = useState('');
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingImages, setBookingImages] = useState<File[]>([]);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [selectedSpecial, setSelectedSpecial] = useState<SpecialItem | null>(null);

  // --- GOOGLE LOGIN LOGIC ---
  useEffect(() => {
      // Automatic Linking: If Supabase has a user, link it to the clients table
      const linkUserToClient = async () => {
          if (authenticatedUser && authenticatedUser.email) {
              const email = authenticatedUser.email.toLowerCase();
              const existingClient = clients.find(c => c.email.toLowerCase() === email);

              if (existingClient) {
                  setCurrentUser(existingClient);
                  setIsLoggedIn(true);
              } else {
                  // New User - Auto Create Client Record
                  setIsProcessingLogin(true);
                  try {
                      // Attempt to create
                      const fullName = authenticatedUser.user_metadata?.full_name || authenticatedUser.user_metadata?.name || email.split('@')[0];
                      const newClientData = {
                          name: fullName,
                          email: email,
                          password: 'google-oauth', // Placeholder, not used for auth anymore
                          notes: 'Created via Google Login',
                          stickers: 0
                      };
                      await onAddClient(newClientData);
                      
                      // Note: We might need to wait for the `clients` prop to update via the DB listener in App.tsx
                      // But for UI responsiveness we can set a temporary user state
                      setCurrentUser({
                          ...newClientData,
                          id: 'temp-id', // ID will be generated by DB
                          loyaltyProgress: {},
                          rewardsRedeemed: 0
                      });
                      setIsLoggedIn(true);
                  } catch (error) {
                      console.error("Error creating client record:", error);
                      alert("Error setting up your profile. Please try again.");
                  } finally {
                      setIsProcessingLogin(false);
                  }
              }
          }
      };

      linkUserToClient();
  }, [authenticatedUser, clients]); // Depend on clients array to catch updates

  const handleGoogleLogin = async () => {
      try {
          await dbLoginWithGoogle();
          // The page will redirect to Google, then back.
          // On return, the `authenticatedUser` prop will be populated by App.tsx
      } catch (error) {
          console.error("Google Login Error:", error);
          alert("Failed to initiate Google Login.");
      }
  };

  const handleManualLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsProcessingLogin(true);
      
      // Simulate slight network delay for better UX feel
      setTimeout(() => {
          const email = manualEmail.trim().toLowerCase();
          const pin = manualPin.trim();
          
          const foundClient = clients.find(c => c.email.toLowerCase() === email);
          
          if (foundClient && foundClient.password === pin) {
              setCurrentUser(foundClient);
              setIsLoggedIn(true);
          } else {
              alert("Invalid Credentials. Please check your Email and PIN, or ask the salon admin.");
          }
          setIsProcessingLogin(false);
      }, 800);
  };

  const handleLogout = async () => {
      await dbLogout();
      setIsLoggedIn(false);
      setCurrentUser(null);
      setManualEmail('');
      setManualPin('');
  };

  // --- ACTIONS ---
  const handleAcceptQuote = async (invoice: Invoice) => {
      if(window.confirm(`Are you sure you want to accept this quote for R${invoice.total.toFixed(2)}?`)) {
          setProcessingId(invoice.id);
          try {
            await onUpdateInvoice({ ...invoice, status: 'accepted' });
            
            let relatedBooking: Booking | undefined;
            if (invoice.bookingId) {
                relatedBooking = bookings.find(b => b.id === invoice.bookingId);
            } 
            if (!relatedBooking) {
                relatedBooking = bookings.find(b => b.email.toLowerCase() === currentUser?.email.toLowerCase() && (b.status === 'pending' || b.status === 'quote_sent'));
            }

            if (relatedBooking) {
                await onUpdateBooking({ ...relatedBooking, status: 'confirmed' });
                alert("Quote accepted! Your appointment has been officially confirmed.");
            } else {
                alert("Quote accepted! We will contact you to finalize the date.");
            }
          } catch (error) {
              console.error(error);
              alert("Something went wrong. Please try again.");
          } finally {
              setProcessingId(null);
          }
      }
  };

  const handleCancelBooking = async (booking: Booking) => {
      if(window.confirm("Request cancellation for this booking?")) {
          await onUpdateBooking({ ...booking, status: 'cancelled' });
      }
  };

  // --- BOOKING LOGIC ---
  const handleSpecialSelect = (special: SpecialItem) => {
      if (selectedSpecial?.id === special.id) {
          setSelectedSpecial(null);
          setBookingMessage('');
      } else {
          setSelectedSpecial(special);
          setBookingMessage(`Requesting Special: ${special.title} (R${special.priceValue || special.price})`);
      }
  };

  const handleBookSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentUser) return;
      if (!bookingDate) return alert("Please select a preferred date.");

      setIsBookingLoading(true);
      try {
          let referenceImageUrls: string[] = [];
          if (bookingImages.length > 0) {
              const uploadPromises = bookingImages.map(file => 
                  dbUploadFile(file, 'booking-references')
              );
              referenceImageUrls = await Promise.all(uploadPromises);
          }

          const finalMessage = selectedSpecial 
            ? `${bookingMessage}\n\n[System: Linked to Special "${selectedSpecial.title}"]`
            : bookingMessage;

          await onAddBooking({
              name: currentUser.name,
              email: currentUser.email,
              whatsappNumber: currentUser.phone || '',
              message: finalMessage,
              bookingDate,
              contactMethod: 'whatsapp',
              referenceImages: referenceImageUrls,
          });

          alert("Booking request sent successfully!");
          // Reset form
          setBookingDate('');
          setBookingMessage('');
          setBookingImages([]);
          setSelectedSpecial(null);
          setActiveTab('bookings'); // Redirect to history
      } catch (error) {
          console.error(error);
          alert("Failed to send booking request. Please try again.");
      } finally {
          setIsBookingLoading(false);
      }
  };

  // --- DATA ---
  const myInvoices = currentUser ? invoices.filter(inv => inv.clientEmail.toLowerCase() === currentUser.email.toLowerCase() && (inv.status !== 'draft' && inv.status !== 'void')) : [];
  const myBookings = currentUser ? bookings.filter(b => b.email.toLowerCase() === currentUser.email.toLowerCase()) : [];
  
  const upcomingBookings = myBookings.filter(b => (b.status === 'confirmed' || b.status === 'pending' || b.status === 'quote_sent' || b.status === 'rescheduled') && new Date(b.bookingDate) >= new Date()).sort((a,b) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime());
  const pastBookings = myBookings.filter(b => b.status === 'completed' || b.status === 'cancelled' || new Date(b.bookingDate) < new Date()).sort((a,b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());

  const totalSpend = myInvoices.filter(i => i.status === 'paid').reduce((acc, curr) => acc + curr.total, 0);
  const outstanding = myInvoices.filter(i => i.status === 'sent' && i.type === 'invoice').reduce((acc, curr) => acc + curr.total, 0);

  // --- LOYALTY LOGIC ---
  const activePrograms: LoyaltyProgram[] = (settings?.loyaltyPrograms || []).filter((p: LoyaltyProgram) => p.active);
  // Fallback for legacy single program
  if (activePrograms.length === 0 && settings?.loyaltyProgram?.enabled) {
      activePrograms.push({
          id: 'legacy',
          name: 'Loyalty Rewards',
          stickersRequired: settings.loyaltyProgram.stickersRequired || 10,
          rewardDescription: settings.loyaltyProgram.rewardDescription,
          active: true,
          iconUrl: logoUrl
      });
  }

  // --- RENDER LOGIN ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col justify-center items-center text-brand-light p-4 font-sans">
        <div className="w-full max-w-sm mx-auto">
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} className="flex justify-center mb-6">
            <img src={logoUrl} alt={companyName} className="w-32 h-32 object-contain" />
          </a>
          <div className="bg-white/80 backdrop-blur-lg border border-gray-200 rounded-xl shadow-2xl p-8 transition-all duration-300">
            <h1 className="text-2xl font-bold text-center mb-1 text-brand-light">Client Portal</h1>
            <p className="text-center text-gray-500 text-sm mb-6">Access your rewards and history.</p>
            
            {/* Login Method Toggle */}
            <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
                <button 
                    onClick={() => setLoginMethod('google')}
                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${loginMethod === 'google' ? 'bg-white text-brand-dark shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Google
                </button>
                <button 
                    onClick={() => setLoginMethod('manual')}
                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${loginMethod === 'manual' ? 'bg-white text-brand-dark shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Manual
                </button>
            </div>

            {isProcessingLogin ? (
                <div className="text-center py-4">
                    <div className="w-8 h-8 border-4 border-brand-green/30 border-t-brand-green rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">Checking credentials...</p>
                </div>
            ) : loginMethod === 'google' ? (
                <div className="space-y-4 animate-fade-in">
                    <button 
                        onClick={handleGoogleLogin}
                        className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-full font-bold text-sm hover:bg-gray-50 shadow-sm flex items-center justify-center gap-3 transition-colors"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Sign in with Google
                    </button>
                    <div className="text-center">
                        <p className="text-xs text-gray-400">Secure access via your Gmail account.</p>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleManualLogin} className="space-y-4 animate-fade-in">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Email Address</label>
                        <input 
                            type="email" 
                            required 
                            value={manualEmail}
                            onChange={e => setManualEmail(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-900 outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                            placeholder="name@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">PIN Code</label>
                        <input 
                            type="password" 
                            required 
                            value={manualPin}
                            onChange={e => setManualPin(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-900 outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold tracking-widest"
                            placeholder="****"
                        />
                    </div>
                    <button 
                        type="submit"
                        className="w-full bg-brand-gold text-white py-3 rounded-full font-bold text-sm hover:bg-opacity-90 shadow-sm transition-colors mt-2"
                    >
                        Log In
                    </button>
                    <div className="text-center">
                        <p className="text-xs text-gray-400">Don't have a PIN? Ask the salon to activate your profile.</p>
                    </div>
                </form>
            )}
          </div>
          <p className="text-center text-xs text-gray-600 mt-6">
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} className="hover:text-brand-green transition-colors">&larr; Back to Home</a>
          </p>
        </div>
      </div>
    );
  }

  // --- RENDER DASHBOARD ---
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-20">
        {/* Render Invoice Modal if active */}
        {viewInvoice && <InvoicePreviewModal invoice={viewInvoice} onClose={() => setViewInvoice(null)} />}

        {/* Portal Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-4 sticky top-0 z-30 no-print">
            <div className="max-w-5xl mx-auto flex flex-col gap-2">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <img src={logoUrl} alt="Logo" className="w-8 h-8 object-contain rounded-full border border-gray-100 p-0.5" />
                        <div>
                            <h1 className="font-bold text-base leading-tight">{currentUser?.name}</h1>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wide">Member</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-full transition-colors">Logout</button>
                </div>
                
                {/* 2-Row Navigation */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                    <button onClick={() => setActiveTab('overview')} className={`py-2 text-xs font-bold rounded-lg border transition-colors ${activeTab === 'overview' ? 'bg-brand-green text-white border-brand-green' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>Overview</button>
                    <button onClick={() => setActiveTab('book')} className={`py-2 text-xs font-bold rounded-lg border transition-colors ${activeTab === 'book' ? 'bg-brand-green text-white border-brand-green' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>Book New</button>
                    <button onClick={() => setActiveTab('bookings')} className={`py-2 text-xs font-bold rounded-lg border transition-colors ${activeTab === 'bookings' ? 'bg-brand-green text-white border-brand-green' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>History</button>
                    <button onClick={() => setActiveTab('financials')} className={`py-2 text-xs font-bold rounded-lg border transition-colors ${activeTab === 'financials' ? 'bg-brand-green text-white border-brand-green' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>Financials</button>
                </div>
            </div>
        </header>

        <main className="max-w-5xl mx-auto p-4 space-y-8 mt-2 no-print">
            
            {/* 1. Loyalty Cards Carousel */}
            {activePrograms.length > 0 && (
                <div className="overflow-x-auto pb-4 snap-x flex gap-4">
                    {activePrograms.map(prog => {
                        const count = currentUser?.loyaltyProgress?.[prog.id] || (prog.id === 'legacy' ? (currentUser?.stickers || 0) : 0);
                        const isReady = count >= prog.stickersRequired;
                        
                        return (
                            <div key={prog.id} className="snap-center bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 text-white shadow-xl relative overflow-hidden border border-gray-700 min-w-[300px] max-w-sm flex-shrink-0">
                                <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-brand-gold rounded-full opacity-20 blur-xl"></div>
                                <div className="flex justify-between items-center mb-3 relative z-10">
                                    <div>
                                        <h4 className="font-display text-lg tracking-widest text-brand-gold truncate max-w-[150px]">{prog.name}</h4>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">Card Holder: {currentUser?.name}</p>
                                    </div>
                                    <div className="bg-white/10 px-2 py-1 rounded-md backdrop-blur-md border border-white/10 text-right">
                                        <span className="text-[10px] text-gray-300 block leading-none mb-0.5">Stickers</span>
                                        <span className="text-lg font-bold text-brand-green leading-none">{count} <span className="text-xs text-gray-500">/ {prog.stickersRequired}</span></span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-5 gap-2 mb-3 relative z-10">
                                    {Array.from({ length: prog.stickersRequired }).map((_, i) => {
                                        const isFilled = i < count;
                                        return (
                                            <div key={i} className={`aspect-square rounded-full flex items-center justify-center relative transition-all duration-500 ${isFilled ? 'bg-white shadow-lg shadow-white/20' : 'bg-white/5 border border-dashed border-gray-600'}`}>
                                                {isFilled ? (
                                                    <img src={prog.iconUrl || logoUrl} alt="Stamp" className="w-full h-full object-cover rounded-full p-0.5" />
                                                ) : (
                                                    <span className="text-gray-600 font-bold text-xs">{i + 1}</span>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                                <div className="border-t border-white/10 pt-2 flex justify-between items-center relative z-10">
                                    <p className="text-xs text-gray-300 truncate max-w-[180px]">Reward: <span className="text-brand-gold font-bold">{prog.rewardDescription}</span></p>
                                    {isReady && (
                                        <div className="bg-brand-gold text-black px-3 py-0.5 rounded-full text-[10px] font-bold animate-pulse">
                                            Reward Unlocked!
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* 3. Content Views */}
            
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                    {/* Next Appointment Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Next Appointment</h3>
                        {upcomingBookings.length > 0 ? (
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <p className="font-bold text-lg text-blue-900">{new Date(upcomingBookings[0].bookingDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                                <p className="text-sm text-blue-700 mt-1">{upcomingBookings[0].message || 'General Service'}</p>
                                <div className="mt-3 flex gap-2">
                                    <span className="text-xs bg-white/50 text-blue-800 px-2 py-1 rounded font-bold uppercase">{upcomingBookings[0].status.replace('_', ' ')}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400 text-sm italic">No upcoming confirmed appointments.</div>
                        )}
                        <button onClick={() => setActiveTab('book')} className="mt-4 w-full border border-gray-200 text-gray-600 py-2 rounded-lg text-sm font-bold hover:bg-gray-50">Book New Appointment</button>
                    </div>

                    {/* Pending Quotes */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> Pending Quotes</h3>
                        {myInvoices.filter(i => i.type === 'quote' && i.status === 'sent').length > 0 ? (
                            <div className="space-y-3">
                                {myInvoices.filter(i => i.type === 'quote' && i.status === 'sent').map(quote => (
                                    <div key={quote.id} className="flex flex-col gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-sm text-yellow-900">{quote.number}</p>
                                                <p className="text-xs text-yellow-700">R {quote.total.toFixed(2)}</p>
                                            </div>
                                            <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded font-bold">Action Req.</span>
                                        </div>
                                        <div className="flex gap-2 mt-1">
                                            <button onClick={() => setViewInvoice(quote)} className="flex-1 bg-white border border-yellow-200 text-yellow-800 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-yellow-100 shadow-sm transition-colors">
                                                View Details
                                            </button>
                                            <button 
                                                onClick={() => handleAcceptQuote(quote)} 
                                                disabled={processingId === quote.id}
                                                className="flex-1 bg-yellow-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-yellow-600 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-wait"
                                            >
                                                {processingId === quote.id ? 'Processing...' : 'Accept & Confirm'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400 text-sm italic">All caught up! No pending quotes.</div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'book' && (
                <div className="animate-fade-in space-y-8">
                    {/* Section 1: Specials */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="bg-brand-green/10 text-brand-green p-1 rounded">✨</span> 
                            Select a Special (Optional)
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {specials.filter(s => s.active).map(special => (
                                <div 
                                    key={special.id} 
                                    onClick={() => handleSpecialSelect(special)}
                                    className={`relative border rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md ${selectedSpecial?.id === special.id ? 'border-brand-green ring-2 ring-brand-green/50 bg-brand-green/5' : 'border-gray-200 bg-white'}`}
                                >
                                    <div className="h-24 bg-gray-100">
                                        <img src={special.imageUrl} alt={special.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="p-3">
                                        <h4 className="font-bold text-sm text-gray-800 line-clamp-1">{special.title}</h4>
                                        <p className="text-xs text-gray-500 mt-1 font-mono">
                                            {special.priceType === 'percentage' ? `${special.priceValue}% Off` : `R${special.priceValue}`}
                                        </p>
                                    </div>
                                    {selectedSpecial?.id === special.id && (
                                        <div className="absolute top-2 right-2 bg-brand-green text-white p-1 rounded-full shadow-lg">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section 2: Form */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Request Details</h3>
                        <form onSubmit={handleBookSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Preferred Date</label>
                                    <input 
                                        type="date" 
                                        required 
                                        min={new Date().toISOString().split('T')[0]}
                                        value={bookingDate}
                                        onChange={(e) => setBookingDate(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-800 outline-none focus:ring-2 focus:ring-brand-green/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Reference Images (Optional)</label>
                                    <input 
                                        type="file" 
                                        multiple 
                                        accept="image/*"
                                        onChange={(e) => e.target.files && setBookingImages(Array.from(e.target.files))}
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-green/10 file:text-brand-green hover:file:bg-brand-green/20"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Message / Specific Requests</label>
                                <textarea 
                                    rows={4}
                                    required
                                    value={bookingMessage}
                                    onChange={(e) => setBookingMessage(e.target.value)}
                                    placeholder="Tell us what you're looking for..."
                                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-800 outline-none focus:ring-2 focus:ring-brand-green/50"
                                />
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex justify-end">
                                <button 
                                    type="submit" 
                                    disabled={isBookingLoading}
                                    className="bg-brand-green text-white px-8 py-3 rounded-lg font-bold text-sm hover:bg-opacity-90 transition-shadow shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isBookingLoading ? (
                                        <><span>Processing...</span></>
                                    ) : (
                                        <><span>Request Appointment</span> <span className="text-lg">→</span></>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {activeTab === 'bookings' && (
                <div className="space-y-8 animate-fade-in">
                    {/* Timeline View */}
                    <div className="space-y-6">
                        {/* Upcoming */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Upcoming</h3>
                            <div className="space-y-3">
                                {upcomingBookings.length === 0 && <p className="text-sm text-gray-400 italic bg-white p-4 rounded-lg">No upcoming bookings.</p>}
                                {upcomingBookings.map(b => (
                                    <div key={b.id} className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500 flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-gray-800">{new Date(b.bookingDate).toLocaleDateString()}</p>
                                            <p className="text-sm text-gray-600">{b.message}</p>
                                            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${b.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {b.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <button onClick={() => handleCancelBooking(b)} className="text-xs text-red-500 font-bold border border-red-100 bg-red-50 px-3 py-1.5 rounded hover:bg-red-100">Cancel</button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Past History */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Past History</h3>
                            <div className="space-y-3 relative before:absolute before:left-4 before:top-0 before:h-full before:w-0.5 before:bg-gray-200">
                                {pastBookings.map(b => (
                                    <div key={b.id} className="relative pl-10">
                                        <div className="absolute left-[13px] top-1.5 w-3 h-3 bg-gray-300 rounded-full border-2 border-white"></div>
                                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="font-bold text-gray-700">{new Date(b.bookingDate).toLocaleDateString()}</span>
                                                <span className={`capitalize font-bold text-xs px-2 py-0.5 rounded ${b.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{b.status}</span>
                                            </div>
                                            <p className="text-xs text-gray-500">{b.message}</p>
                                            {b.totalCost && <p className="text-xs font-mono text-gray-400 mt-2">Spend: R{b.totalCost}</p>}
                                        </div>
                                    </div>
                                ))}
                                {pastBookings.length === 0 && <p className="ml-10 text-sm text-gray-400 italic">No past history.</p>}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'financials' && (
                <div className="space-y-6 animate-fade-in">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                            <p className="text-xs text-gray-400 uppercase font-bold">Lifetime Spend</p>
                            <p className="text-2xl font-bold text-gray-800">R {totalSpend.toFixed(0)}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                            <p className="text-xs text-gray-400 uppercase font-bold">Outstanding</p>
                            <p className={`text-2xl font-bold ${outstanding > 0 ? 'text-red-500' : 'text-green-500'}`}>R {outstanding.toFixed(0)}</p>
                        </div>
                    </div>

                    {/* Invoices Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-bold text-xs uppercase">
                                <tr>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3 text-right">Amount</th>
                                    <th className="px-4 py-3 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {myInvoices.map(inv => (
                                    <tr key={inv.id} onClick={() => setViewInvoice(inv)} className="cursor-pointer hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-gray-600">{new Date(inv.dateIssued).toLocaleDateString()}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${inv.type === 'quote' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>{inv.type}</span>
                                            <span className="block text-[10px] text-gray-400 mt-0.5">{inv.number}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono font-bold text-gray-700">R{inv.total.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-right">
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                                                inv.status === 'paid' ? 'bg-green-100 text-green-700' : 
                                                inv.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {myInvoices.length === 0 && (
                                    <tr><td colSpan={4} className="text-center py-8 text-gray-400 italic">No invoices found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

        </main>
    </div>
  );
};

export default ClientPortal;
