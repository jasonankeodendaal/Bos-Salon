import React, { useState, useEffect, useMemo } from 'react';
import { Client, Booking, Invoice, SpecialItem, LoyaltyProgram, BookingOption } from '../App';
import { dbUploadFile, dbLoginWithGoogle, dbLogout } from '../utils/dbAdapter';
import WhatsAppIcon from '../components/icons/WhatsAppIcon';

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
  onUpdateClient: (client: Client) => Promise<void>;
  onAddClient: (client: Omit<Client, 'id'>) => Promise<void>;
  settings?: any;
  authenticatedUser?: any; 
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

interface ProcessedClientProfile extends Client {
    totalSpend: number;
    visitCount: number;
    lastVisit: string;
}

const ClientPortal: React.FC<ClientPortalProps> = ({ 
  logoUrl, 
  companyName, 
  onNavigate, 
  clients: dbClients,
  bookings,
  invoices,
  specials,
  onAddBooking,
  onUpdateBooking,
  onUpdateInvoice,
  onUpdateClient,
  onAddClient,
  settings,
  authenticatedUser
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<ProcessedClientProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'book' | 'history' | 'loyalty' | 'aftercare' | 'financials'>('overview');
  const [isProcessingLogin, setIsProcessingLogin] = useState(false);
  
  // Login/Signup Toggle
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  // Manual Login State
  const [manualEmail, setManualEmail] = useState('');
  const [manualPin, setManualPin] = useState('');
  
  // Sign Up State
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpPin, setSignUpPin] = useState('');
  const [signUpConfirmPin, setSignUpConfirmPin] = useState('');

  // View State
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Confirmation Modal
  const [confirmationModal, setConfirmationModal] = useState<{ isOpen: boolean, booking: Booking | null, invoice: Invoice | null }>({ isOpen: false, booking: null, invoice: null });

  // Booking Form State
  const [bookingDate, setBookingDate] = useState('');
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingImages, setBookingImages] = useState<File[]>([]);
  const [bookingImagePreviews, setBookingImagePreviews] = useState<string[]>([]);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [selectedSpecial, setSelectedSpecial] = useState<SpecialItem | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  // --- PROCESSED CLIENTS (Aggregated Data) ---
  const processedClients = useMemo(() => {
    const clientMap: Record<string, ProcessedClientProfile> = {};

    if (dbClients) {
        dbClients.forEach(c => {
            const email = c.email.trim().toLowerCase();
            clientMap[email] = {
                ...c,
                email: email,
                totalSpend: 0,
                visitCount: 0,
                lastVisit: '',
            };
        });
    }

    bookings.forEach(booking => {
      const email = booking.email.trim().toLowerCase();
      if (!email) return;

      if (!clientMap[email]) {
        clientMap[email] = {
          id: 'temp-' + email,
          name: booking.name,
          email: email,
          phone: booking.whatsappNumber,
          password: 'N/A', 
          stickers: 0,
          loyaltyProgress: {},
          rewardsRedeemed: 0,
          totalSpend: 0,
          visitCount: 0,
          lastVisit: booking.bookingDate,
        };
      }

      const client = clientMap[email];
      if (!client.phone && booking.whatsappNumber) client.phone = booking.whatsappNumber;
      if (!client.lastVisit) client.lastVisit = booking.bookingDate;
      
      if (booking.status === 'completed') {
        client.totalSpend += (booking.totalCost || 0); 
        client.visitCount += 1;
      }

      if (new Date(booking.bookingDate) > new Date(client.lastVisit)) {
        client.lastVisit = booking.bookingDate;
      }
    });
    
    invoices.forEach(inv => {
        const email = inv.clientEmail.trim().toLowerCase();
        if (!email) return;

        if (!clientMap[email]) {
             clientMap[email] = {
                id: 'temp-inv-' + email,
                name: inv.clientName,
                email: email,
                phone: inv.clientPhone,
                password: 'N/A',
                stickers: 0,
                loyaltyProgress: {},
                rewardsRedeemed: 0,
                totalSpend: 0,
                visitCount: 0,
                lastVisit: '',
            };
        }
        
        if(clientMap[email]) {
            if (inv.status === 'paid') {
                clientMap[email].totalSpend += inv.total;
            }
        }
    });

    return Object.values(clientMap);
  }, [bookings, invoices, dbClients]);

  useEffect(() => {
      if (isLoggedIn && currentUser) {
          const updatedUser = processedClients.find(c => c.email.toLowerCase() === currentUser.email.toLowerCase());
          if (updatedUser) {
              setCurrentUser(updatedUser);
          }
      }
  }, [processedClients, isLoggedIn, currentUser]);

  useEffect(() => {
      const linkUserToClient = async () => {
          if (authenticatedUser && authenticatedUser.email) {
              const email = authenticatedUser.email.toLowerCase();
              const existingClient = processedClients.find(c => c.email.toLowerCase() === email);

              if (existingClient) {
                  setCurrentUser(existingClient);
                  setIsLoggedIn(true);
              } else {
                  setIsProcessingLogin(true);
                  try {
                      const fullName = authenticatedUser.user_metadata?.full_name || authenticatedUser.user_metadata?.name || email.split('@')[0];
                      const newClientData = {
                          name: fullName,
                          email: email,
                          password: 'google-oauth', 
                          notes: 'Created via Google Login',
                          stickers: 0
                      };
                      await onAddClient(newClientData);
                      setIsLoggedIn(true);
                  } catch (error) {
                      console.error("Error creating client record:", error);
                  } finally {
                      setIsProcessingLogin(false);
                  }
              }
          }
      };

      linkUserToClient();
  }, [authenticatedUser, processedClients]); 

  const handleGoogleLogin = async () => {
      try {
          localStorage.setItem('login_redirect_destination', 'client-portal');
          await dbLoginWithGoogle();
      } catch (error) {
          console.error("Google Login Error:", error);
          alert("Failed to initiate Google Login.");
      }
  };

  const handleManualLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsProcessingLogin(true);
      setTimeout(() => {
          const email = manualEmail.trim().toLowerCase();
          const pin = manualPin.trim();
          const foundClient = processedClients.find(c => c.email.toLowerCase() === email);
          if (foundClient && foundClient.password === pin) {
              setCurrentUser(foundClient);
              setIsLoggedIn(true);
          } else {
              alert("Invalid Credentials.");
          }
          setIsProcessingLogin(false);
      }, 800);
  };

  const handleSignUp = async (e: React.FormEvent) => {
      e.preventDefault();
      if (signUpPin !== signUpConfirmPin) {
          alert("PINs do not match!");
          return;
      }
      const emailLower = signUpEmail.trim().toLowerCase();
      if (processedClients.find(c => c.email.toLowerCase() === emailLower)) {
          alert("Email already registered.");
          return;
      }

      setIsProcessingLogin(true);
      try {
          const newClient = {
              name: signUpName,
              email: emailLower,
              phone: signUpPhone,
              password: signUpPin,
              notes: 'Self-registered via Portal',
              stickers: 0
          };
          await onAddClient(newClient);
          setIsLoggedIn(true);
      } catch (error) {
          console.error(error);
          alert("Error creating account.");
      } finally {
          setIsProcessingLogin(false);
      }
  };

  const handleLogout = async () => {
      await dbLogout();
      setIsLoggedIn(false);
      setCurrentUser(null);
      setManualEmail('');
      setManualPin('');
      setIsSignUpMode(false);
  };

  const handleBack = () => {
    onNavigate('home');
  };

  const handleConfirmInSalon = async (booking: Booking, invoice: Invoice | null) => {
      if (!window.confirm("Confirm this booking for In-Salon payment? This will finalize your slot and payment will be due at the appointment.")) return;
      
      setProcessingId(booking.id);
      try {
          // 1. Update Booking Status
          await onUpdateBooking({ 
              ...booking, 
              status: 'confirmed', 
              confirmationMethod: 'in-salon' 
          });

          // 2. Update Related Invoice Status if exists
          if (invoice) {
              await onUpdateInvoice({ 
                  ...invoice, 
                  status: 'accepted' 
              });
          }

          alert("Confirmed! We'll see you at the studio for your appointment.");
          setConfirmationModal({ isOpen: false, booking: null, invoice: null });
      } catch (err) {
          console.error("Confirmation failed", err);
          alert("Something went wrong. Please try again.");
      } finally {
          setProcessingId(null);
      }
  };

  const handlePayNow = (invoice: Invoice) => {
      const yocoKey = settings?.payments?.yocoPublicKey;
      if (!yocoKey) {
          alert("Online payments are currently unavailable.");
          return;
      }
      if (!(window as any).YocoSDK) {
          alert("Payment system is still loading.");
          return;
      }
      const yoco = new (window as any).YocoSDK({ publicKey: yocoKey });
      yoco.showPopup({
          amountInCents: Math.round(invoice.total * 100),
          currency: 'ZAR',
          name: companyName,
          description: `${invoice.type === 'quote' ? 'Deposit for' : 'Payment for'} ${invoice.number}`,
          callback: async (result: any) => {
              if (result.error) {
                  alert("Payment failed: " + result.error.message);
              } else {
                  setProcessingId(invoice.id);
                  try {
                      await onUpdateInvoice({ ...invoice, status: 'paid' });
                      if (invoice.type === 'quote' || invoice.bookingId) {
                          const relatedBooking = bookings.find(b => b.id === invoice.bookingId);
                          if (relatedBooking) {
                              await onUpdateBooking({ 
                                  ...relatedBooking, 
                                  status: 'confirmed', 
                                  amountPaid: invoice.total,
                                  confirmationMethod: 'online'
                              });
                          }
                      }
                      alert("Payment Successful!");
                      setConfirmationModal({ isOpen: false, booking: null, invoice: null });
                  } catch (err) {
                      console.error("Verification failed", err);
                  } finally {
                      setProcessingId(null);
                  }
              }
          },
      });
  };

  const handleCancelBooking = async (booking: Booking) => {
      if(window.confirm("Request cancellation? This request will be sent to the salon.")) {
          await onUpdateBooking({ ...booking, status: 'cancelled' });
      }
  };

  const handleSpecialSelect = (special: SpecialItem) => {
    setSelectedSpecial(prev => prev?.id === special.id ? null : special);
  };

  const handleOptionToggle = (label: string) => {
    setSelectedOptions(prev => 
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  const getWhatsAppLink = (number?: string) => {
      if (!number) return '#';
      return `https://wa.me/${number.replace(/[^0-9]/g, '')}`;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        const files: File[] = Array.from(e.target.files);
        if (files.length > 5) {
            alert("You can only upload a maximum of 5 images.");
            return;
        }
        setBookingImages(files);
        bookingImagePreviews.forEach(url => URL.revokeObjectURL(url));
        const previews = files.map(file => URL.createObjectURL(file));
        setBookingImagePreviews(previews);
    }
  };

  const handleBookSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentUser || !bookingDate) return;
      setIsBookingLoading(true);
      try {
          let referenceImageUrls: string[] = [];
          if (bookingImages.length > 0) {
              const uploadPromises = bookingImages.map(file => dbUploadFile(file, 'booking-references'));
              referenceImageUrls = await Promise.all(uploadPromises);
          }
          
          let optionsPart = "";
          if (selectedOptions.length > 0) {
              optionsPart = `[OPTIONS: ${selectedOptions.join(', ')}]\n`;
          }

          const finalMessage = `${optionsPart}${selectedSpecial ? `[SPECIAL: ${selectedSpecial.title}]\n` : ""}${bookingMessage}`;
          
          await onAddBooking({
              name: currentUser.name,
              email: currentUser.email,
              whatsappNumber: currentUser.phone || '',
              message: finalMessage,
              bookingDate,
              contactMethod: 'whatsapp',
              referenceImages: referenceImageUrls,
              selectedOptions: selectedOptions 
          } as any);

          alert("Booking request sent!");
          setBookingDate('');
          setBookingMessage('');
          setBookingImages([]);
          setBookingImagePreviews([]);
          setSelectedSpecial(null);
          setSelectedOptions([]);
          setActiveTab('history');
      } catch (error) {
          console.error(error);
      } finally {
          setIsBookingLoading(false);
      }
  };

  const myInvoices = currentUser ? invoices.filter(inv => inv.clientEmail.toLowerCase() === currentUser.email.toLowerCase() && (inv.status !== 'draft' && inv.status !== 'void')) : [];
  const myBookings = currentUser ? bookings.filter(b => b.email.toLowerCase() === currentUser.email.toLowerCase()) : [];
  const upcomingBookings = myBookings.filter(b => (b.status === 'confirmed' || b.status === 'pending' || b.status === 'quote_sent' || b.status === 'rescheduled') && new Date(b.bookingDate) >= new Date()).sort((a,b) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime());
  const pastBookings = myBookings.filter(b => b.status === 'completed' || b.status === 'cancelled' || new Date(b.bookingDate) < new Date()).sort((a,b) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime());
  const totalSpend = myInvoices.filter(i => i.status === 'paid').reduce((acc, curr) => acc + curr.total, 0);
  const outstanding = myInvoices.filter(i => i.status === 'sent' && i.type === 'invoice').reduce((acc, curr) => acc + curr.total, 0);
  
  const activePrograms: LoyaltyProgram[] = (settings?.loyaltyPrograms || []).filter((p: LoyaltyProgram) => p.active);
  const firstProgram = activePrograms[0];
  const firstProgramCount = currentUser?.loyaltyProgress?.[firstProgram?.id] || (firstProgram?.id === 'legacy' ? currentUser?.stickers : 0) || 0;
  
  const bookingOptions: BookingOption[] = settings?.bookingOptions || [];

  const getClientStatus = (visitCount: number) => {
      if (visitCount >= 10) return 'Diamond Lounge Member';
      if (visitCount >= 5) return 'VIP Collector';
      if (visitCount >= 2) return 'Returning Collector';
      return 'New Collector';
  };

  const getTierIcon = (visitCount: number) => {
      if (visitCount >= 10) return '💎';
      if (visitCount >= 5) return '👑';
      if (visitCount >= 2) return '✨';
      return '🌱';
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-brand-light p-4 bg-brand-dark">
        <div className="absolute top-8 left-8">
            <button onClick={handleBack} className="flex items-center gap-2 text-sm font-bold text-brand-light/50 hover:text-brand-green transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                Back to Site
            </button>
        </div>
        <div className="w-full max-w-sm mx-auto">
          <div className="flex justify-center mb-8">
            <img src={logoUrl} alt={companyName} className="h-32 w-auto object-contain" />
          </div>
          <div className="bg-white border border-gray-200 rounded-3xl shadow-xl p-8 transition-all duration-300">
            <h1 className="text-2xl font-bold text-center mb-1 text-gray-900">Portal Login</h1>
            <p className="text-center text-gray-500 text-sm mb-8">{isSignUpMode ? 'Create your account to start.' : 'Manage your beauty journey and rewards.'}</p>
            {isProcessingLogin ? (
                <div className="text-center py-8">
                    <div className="w-10 h-10 border-4 border-brand-green/20 border-t-brand-green rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Validating...</p>
                </div>
            ) : (
                <div className="space-y-6 animate-fade-in">
                    {isSignUpMode ? (
                        <form onSubmit={handleSignUp} className="space-y-4">
                            <input type="text" required value={signUpName} onChange={e => setSignUpName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-brand-light outline-none focus:ring-2 focus:ring-brand-green transition-all" placeholder="Full Name" />
                            <input type="email" required value={signUpEmail} onChange={e => setSignUpEmail(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-brand-light outline-none focus:ring-2 focus:ring-brand-green transition-all" placeholder="Email Address" />
                            <input type="tel" required value={signUpPhone} onChange={e => setSignUpPhone(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-brand-light outline-none focus:ring-2 focus:ring-brand-green transition-all" placeholder="Phone Number" />
                            <div className="grid grid-cols-2 gap-2">
                                <input type="password" required value={signUpPin} onChange={e => setSignUpPin(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-brand-light text-center tracking-widest" placeholder="PIN" maxLength={6} />
                                <input type="password" required value={signUpConfirmPin} onChange={e => setSignUpConfirmPin(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-brand-light text-center tracking-widest" placeholder="Confirm" maxLength={6} />
                            </div>
                            <button type="submit" className="w-full bg-brand-green text-white py-4 rounded-2xl font-bold text-sm hover:shadow-lg transition-all active:scale-[0.98]">Create Account</button>
                            <button type="button" onClick={() => setIsSignUpMode(false)} className="w-full text-brand-green font-bold text-xs mt-2 underline">Already have a PIN? Login</button>
                        </form>
                    ) : (
                        <>
                            <form onSubmit={handleManualLogin} className="space-y-4">
                                <input type="email" required value={manualEmail} onChange={e => setManualEmail(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-brand-light outline-none focus:ring-2 focus:ring-brand-green transition-all" placeholder="Email Address" />
                                <input type="password" required value={manualPin} onChange={e => setManualPin(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-brand-light tracking-[0.5em] text-center focus:ring-2 focus:ring-brand-green transition-all" placeholder="••••" />
                                <button type="submit" className="w-full bg-brand-green text-white py-4 rounded-2xl font-bold text-sm hover:shadow-lg transition-all active:scale-[0.98]">Login to Portal</button>
                            </form>
                            <div className="relative flex items-center py-4"><div className="flex-grow border-t border-gray-100"></div><span className="mx-4 text-[10px] font-bold text-gray-300 uppercase tracking-widest">OR</span><div className="flex-grow border-t border-gray-100"></div></div>
                            <button onClick={handleGoogleLogin} className="w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-gray-50 transition-all">
                                <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                                Google Login
                            </button>
                            <div className="text-center pt-4"><button onClick={() => setIsSignUpMode(true)} className="text-brand-green font-bold text-xs hover:underline uppercase tracking-wide">Register Account</button></div>
                        </>
                    )}
                </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-20">
        {viewInvoice && <InvoicePreviewModal invoice={viewInvoice} onClose={() => setViewInvoice(null)} />}
        
        {/* PAYMENT OPTIONS MODAL */}
        {confirmationModal.isOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
                    <div className="bg-brand-green p-6 text-white text-center">
                        <h3 className="text-2xl font-bold">Approve & Confirm</h3>
                        <p className="text-white/80 text-xs uppercase font-black tracking-widest mt-1">Select your payment path</p>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="text-center mb-8">
                            <p className="text-gray-500 text-sm">How would you like to confirm your booking for <span className="font-bold text-gray-900">{new Date(confirmationModal.booking?.bookingDate || '').toLocaleDateString()}</span>?</p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Online Path */}
                            <button 
                                onClick={() => handlePayNow(confirmationModal.invoice! || { id: 'temp', total: confirmationModal.booking?.totalCost || 0 } as any)}
                                className="flex flex-col items-center gap-4 p-6 rounded-3xl border-2 border-brand-green bg-brand-green/5 hover:bg-brand-green/10 transition-all text-center group"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-brand-green flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">Pay Online</h4>
                                    <p className="text-[10px] text-gray-500 mt-1 uppercase font-black tracking-tighter">Instant Approval</p>
                                </div>
                            </button>

                            {/* In-Salon Path */}
                            <button 
                                onClick={() => handleConfirmInSalon(confirmationModal.booking!, confirmationModal.invoice)}
                                className="flex flex-col items-center gap-4 p-6 rounded-3xl border-2 border-gray-100 hover:border-brand-green/30 bg-gray-50 hover:bg-white transition-all text-center group"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-gray-200 flex items-center justify-center text-gray-500 group-hover:bg-brand-green group-hover:text-white transition-all shadow-sm group-hover:scale-110">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">In-Salon</h4>
                                    <p className="text-[10px] text-gray-500 mt-1 uppercase font-black tracking-tighter">Pay at Studio</p>
                                </div>
                            </button>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 border-t flex justify-center">
                        <button onClick={() => setConfirmationModal({ isOpen: false, booking: null, invoice: null })} className="text-xs font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest">Cancel</button>
                    </div>
                </div>
            </div>
        )}

        <header className="bg-white shadow-sm border-b px-4 py-4 sticky top-0 z-50 no-print">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <img src={logoUrl} alt="Logo" className="w-12 h-12 object-contain rounded-full border border-gray-100 p-1" />
                    <div>
                        <h1 className="font-bold text-lg leading-tight text-gray-900">{currentUser?.name}</h1>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Collector #{currentUser?.id?.slice(-4) || '0001'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex gap-1 bg-gray-100 p-1 rounded-2xl">
                        {['overview', 'book', 'history', 'loyalty', 'aftercare'].map(t => (
                            <button key={t} onClick={() => setActiveTab(t as any)} className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all capitalize ${activeTab === t ? 'bg-white text-brand-green shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>
                                {t}
                            </button>
                        ))}
                    </div>
                    <button onClick={handleLogout} className="text-[10px] font-bold text-red-500 px-3 py-1.5 rounded-full bg-red-50 hover:bg-red-100 transition-colors uppercase tracking-widest border border-red-100">Logout</button>
                </div>
            </div>
            <div className="sm:hidden flex gap-2 mt-4 overflow-x-auto pb-1 no-scrollbar">
                {['overview', 'book', 'history', 'loyalty', 'aftercare'].map(t => (
                    <button key={t} onClick={() => setActiveTab(t as any)} className={`flex-shrink-0 px-4 py-2 text-[10px] font-bold rounded-lg border transition-all capitalize ${activeTab === t ? 'bg-brand-green text-white border-brand-green shadow-md shadow-brand-green/20' : 'bg-white text-gray-600 border-gray-200'}`}>{t}</button>
                ))}
            </div>
        </header>

        <main className="max-w-6xl mx-auto p-4 sm:p-8 space-y-8 mt-4 no-print">
            
            {activeTab === 'overview' && (
                <div className="space-y-10 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 bg-gradient-to-br from-[#4e342e] to-black p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group border border-white/5">
                            <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                                <img src={logoUrl} className="w-64 h-64 object-contain grayscale invert" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
                                    <div>
                                        <span className="bg-brand-green/20 text-brand-green px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-green/30">Lounge Member</span>
                                        <h2 className="text-4xl font-black mt-2 tracking-tight">Welcome, {currentUser?.name.split(' ')[0]}</h2>
                                    </div>
                                    <div className="flex items-center gap-4 bg-white/5 backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-lg">
                                        <div className="text-4xl">{getTierIcon(currentUser?.visitCount || 0)}</div>
                                        <div>
                                            <p className="text-[10px] font-black text-brand-green uppercase tracking-widest leading-none mb-1">Status Level</p>
                                            <p className="text-sm font-bold text-white/90">{getClientStatus(currentUser?.visitCount || 0)}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="bg-white/5 border border-white/10 p-5 rounded-3xl hover:bg-white/10 transition-colors">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Lifetime Value</p>
                                        <p className="text-2xl font-black text-brand-green">R {totalSpend.toFixed(0)}</p>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 p-5 rounded-3xl hover:bg-white/10 transition-colors">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Masterpieces</p>
                                        <p className="text-2xl font-black text-white">{currentUser?.visitCount || 0}</p>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 p-5 rounded-3xl hover:bg-white/10 transition-colors">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Balance</p>
                                        <p className={`text-2xl font-black ${outstanding > 0 ? 'text-red-400' : 'text-green-400'}`}>R {outstanding.toFixed(0)}</p>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 p-5 rounded-3xl hover:bg-white/10 transition-colors">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Next Stamp</p>
                                        <p className="text-2xl font-black text-brand-pink">{firstProgramCount}/{firstProgram?.stickersRequired || 10}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl flex flex-col justify-between group hover:shadow-2xl transition-all">
                            <div>
                                <h3 className="font-black text-gray-400 mb-6 flex items-center gap-3 uppercase tracking-[0.3em] text-[10px]">
                                    <span className="w-2.5 h-2.5 rounded-full bg-brand-green animate-pulse"></span> Your Lounge Slot
                                </h3>
                                {upcomingBookings.length > 0 ? (
                                    <div className="space-y-6">
                                        <div className="p-6 bg-brand-green/5 rounded-[2rem] border border-brand-green/10 group-hover:bg-brand-green/10 transition-colors">
                                            <p className="font-black text-4xl text-brand-green leading-none mb-2">{new Date(upcomingBookings[0].bookingDate).getDate()}</p>
                                            <p className="font-bold text-xl text-gray-900 uppercase tracking-tighter">{new Date(upcomingBookings[0].bookingDate).toLocaleDateString(undefined, {month:'long', year:'numeric'})}</p>
                                            <p className={`text-[10px] font-black uppercase tracking-[0.2em] mt-3 py-1 px-3 rounded-full border inline-block ${upcomingBookings[0].status === 'confirmed' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>{upcomingBookings[0].status.replace('_', ' ')}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-xs font-black text-gray-300 uppercase tracking-widest">Planned Artistry:</p>
                                            <p className="text-sm text-gray-600 italic leading-relaxed line-clamp-2">"{upcomingBookings[0].message}"</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-10">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl opacity-50">📅</div>
                                        <p className="text-gray-400 text-sm italic font-medium">Your calendar is open.</p>
                                        <button onClick={() => setActiveTab('book')} className="mt-6 bg-[#4e342e] text-white px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">Claim a Slot</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Lounge Perks Section */}
                    <section className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-xl overflow-hidden relative">
                         <div className="absolute bottom-0 right-0 p-10 opacity-5 pointer-events-none text-9xl">🏛️</div>
                         <h3 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Your Lounge Perks</h3>
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {(settings?.loungePerks || []).map((perk: string, idx: number) => (
                                <div key={idx} className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 hover:border-brand-green/30 transition-all hover:bg-white hover:shadow-lg">
                                    <div className="w-10 h-10 rounded-2xl bg-brand-green/10 flex items-center justify-center text-brand-green font-black">0{idx+1}</div>
                                    <p className="text-xs text-gray-600 font-medium leading-relaxed">{perk}</p>
                                </div>
                            ))}
                         </div>
                    </section>
                </div>
            )}

            {activeTab === 'book' && (
                <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
                    {/* SHRUNK SPECIALS VIEW */}
                    {specials.filter(s => s.active).length > 0 && (
                        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-100 shadow-lg">
                             <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-widest text-[10px]">
                                <span className="w-2 h-2 rounded-full bg-brand-green"></span> Tap offer to add
                             </h4>
                             <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                                {specials.filter(s => s.active).map(special => (
                                    <div 
                                        key={special.id} 
                                        onClick={() => handleSpecialSelect(special)}
                                        className={`cursor-pointer transition-all duration-300 relative group overflow-hidden rounded-xl border-2 ${selectedSpecial?.id === special.id ? 'border-brand-green scale-[0.98]' : 'border-transparent opacity-80 hover:opacity-100'}`}
                                    >
                                        <div className="aspect-square relative overflow-hidden bg-gray-50">
                                            <img src={special.imageUrl} alt={special.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                            {selectedSpecial?.id === special.id && (
                                                <div className="absolute inset-0 bg-brand-green/20 backdrop-blur-[1px] flex items-center justify-center">
                                                    <div className="bg-white rounded-full p-1 shadow-lg"><svg className="w-4 h-4 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>
                                                </div>
                                            )}
                                            <div className="absolute bottom-1 right-1 bg-black/60 text-white px-1 py-0.5 rounded text-[8px] font-bold">R{special.priceValue || special.price}</div>
                                        </div>
                                        <p className="p-1.5 text-[9px] font-bold text-gray-800 line-clamp-1 leading-tight text-center">{special.title}</p>
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Booking Options Checklist (Editable in Admin) */}
                        <div className="lg:col-span-1 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl h-fit">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Service Pre-checks</h3>
                            <div className="space-y-3">
                                {bookingOptions.length > 0 ? bookingOptions.map(opt => (
                                    <div 
                                        key={opt.id}
                                        onClick={() => handleOptionToggle(opt.label)}
                                        className={`flex items-start gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${selectedOptions.includes(opt.label) ? 'bg-brand-green/5 border-brand-green' : 'bg-gray-50 border-gray-100 hover:bg-white'}`}
                                    >
                                        <div className={`mt-0.5 w-4 h-4 shrink-0 rounded flex items-center justify-center border-2 transition-colors ${selectedOptions.includes(opt.label) ? 'bg-brand-green border-brand-green' : 'border-gray-300'}`}>
                                            {selectedOptions.includes(opt.label) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
                                        </div>
                                        <div>
                                            <p className={`text-xs font-bold leading-tight ${selectedOptions.includes(opt.label) ? 'text-brand-green' : 'text-gray-900'}`}>{opt.label}</p>
                                            <p className="text-[10px] text-gray-500 mt-0.5">{opt.description}</p>
                                        </div>
                                    </div>
                                )) : <p className="text-[10px] text-gray-400 italic">No specific options set.</p>}
                            </div>
                        </div>

                        {/* Request Form */}
                        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-2xl">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Request Appointment</h3>
                            <p className="text-gray-500 text-sm mb-8">Tell us about your next beauty treatment.</p>
                            
                            <form onSubmit={handleBookSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Preferred Date</label>
                                    <input type="date" required min={new Date().toISOString().split('T')[0]} value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-gray-900 focus:ring-2 focus:ring-brand-green outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Service Details / Message</label>
                                    <textarea rows={4} required value={bookingMessage} onChange={(e) => setBookingMessage(e.target.value)} placeholder="Describe the treatment type, style, and any specific requests..." className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-gray-900 focus:ring-2 focus:ring-brand-green outline-none" />
                                </div>
                                
                                {/* REFERENCE IMAGES UPLOAD */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Upload Inspiration (Optional, Max 5)</label>
                                    <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-4 sm:p-6 text-center group hover:border-brand-green transition-colors">
                                        <input 
                                            type="file" 
                                            multiple 
                                            accept="image/*" 
                                            onChange={handleImageChange} 
                                            className="hidden" 
                                            id="file-upload-portal" 
                                        />
                                        <label htmlFor="file-upload-portal" className="cursor-pointer block">
                                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm text-gray-400 group-hover:text-brand-green transition-colors">
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                            </div>
                                            <span className="text-xs font-bold text-gray-400 group-hover:text-brand-green uppercase tracking-widest">Select Photos</span>
                                        </label>
                                    </div>
                                    {bookingImagePreviews.length > 0 && (
                                        <div className="grid grid-cols-5 gap-2 mt-4">
                                            {bookingImagePreviews.map((url, idx) => (
                                                <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                                                    <img src={url} className="w-full h-full object-cover" alt={`Preview ${idx+1}`} />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="pt-6 border-t border-gray-50">
                                    <button type="submit" disabled={isBookingLoading} className="w-full bg-brand-green text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-brand-green/20 hover:scale-[1.02] transition-all active:scale-[0.98] disabled:opacity-50 uppercase tracking-widest">
                                        {isBookingLoading ? 'Sending Request...' : 'Send Request'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'history' && (
                <div className="space-y-16 animate-fade-in pb-20">
                    <div className="text-center max-w-2xl mx-auto">
                        <h2 className="text-5xl font-black text-gray-900 mb-3 tracking-tighter uppercase">Artistry Archive</h2>
                        <div className="flex items-center justify-center gap-3">
                            <div className="h-px w-8 bg-brand-green"></div>
                            <p className="text-xs font-black text-brand-green uppercase tracking-[0.4em]">Your Beauty Journey</p>
                            <div className="h-px w-8 bg-brand-green"></div>
                        </div>
                    </div>

                    <div className="space-y-24">
                        {/* CURRENT PROJECTS */}
                        <section>
                            <div className="flex items-center gap-6 mb-10">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em] whitespace-nowrap">Current Lounge Slots</h3>
                                <div className="flex-grow h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
                            </div>
                            
                            {upcomingBookings.length > 0 ? (
                                <div className="grid grid-cols-1 gap-8">
                                    {upcomingBookings.map(b => {
                                        const linkedInvoice = myInvoices.find(inv => inv.bookingId === b.id || inv.clientEmail === b.email); 
                                        const isQuote = b.status === 'quote_sent';
                                        
                                        return (
                                            <div key={b.id} className="bg-white rounded-[3.5rem] border border-gray-100 shadow-2xl overflow-hidden hover:shadow-brand-green/10 transition-all group flex flex-col lg:flex-row relative">
                                                {/* Left: Date Block (Vertical Desktop, Horizontal Mobile) */}
                                                <div className="w-full lg:w-48 bg-gray-900 text-white flex flex-row lg:flex-col items-center justify-center p-8 text-center shrink-0 border-r border-white/5">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-1 leading-none">{new Date(b.bookingDate).toLocaleDateString(undefined, {month:'short'})}</span>
                                                        <span className="text-6xl font-black leading-none">{new Date(b.bookingDate).getDate()}</span>
                                                        <span className="text-[10px] font-black text-brand-green uppercase mt-2 tracking-widest">{new Date(b.bookingDate).getFullYear()}</span>
                                                    </div>
                                                </div>

                                                {/* Details */}
                                                <div className="flex-grow p-10 flex flex-col">
                                                    <div className="flex justify-between items-start mb-6">
                                                        <div className="flex flex-wrap gap-3 items-center">
                                                            <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border ${
                                                                b.status === 'confirmed' ? 'bg-green-600 text-white border-green-500' :
                                                                b.status === 'quote_sent' ? 'bg-blue-600 text-white border-blue-500 animate-pulse' :
                                                                'bg-yellow-400 text-white border-yellow-300'
                                                            }`}>
                                                                {b.status.replace('_', ' ')}
                                                            </span>
                                                            {b.confirmationMethod && (
                                                                <span className="bg-gray-100 text-gray-400 px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border border-gray-200">
                                                                    Verified {b.confirmationMethod}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="hidden sm:block text-right">
                                                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Session Value</p>
                                                            <p className="text-2xl font-black text-gray-900">R {b.totalCost || '---'}</p>
                                                        </div>
                                                    </div>

                                                    <div className="bg-gray-50 rounded-[2.5rem] p-8 border border-gray-100 mb-8 relative">
                                                        <div className="text-3xl absolute -top-4 -left-4 filter drop-shadow-lg">✨</div>
                                                        <p className="text-gray-700 text-base leading-relaxed font-medium italic">"{b.message}"</p>
                                                        
                                                        {b.referenceImages && b.referenceImages.length > 0 && (
                                                            <div className="mt-8">
                                                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">Uploaded Inspiration</p>
                                                                <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                                                                    {b.referenceImages.map((img, i) => (
                                                                        <a key={i} href={img} target="_blank" rel="noreferrer" className="w-24 h-24 rounded-[1.5rem] overflow-hidden border-4 border-white shadow-xl shrink-0 hover:scale-110 transition-transform duration-500 hover:rotate-2">
                                                                            <img src={img} className="w-full h-full object-cover" alt="Ref" />
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="mt-auto flex flex-col sm:flex-row gap-4">
                                                        {isQuote && (
                                                            <button 
                                                                onClick={() => setConfirmationModal({ isOpen: true, booking: b, invoice: linkedInvoice || null })} 
                                                                className="flex-1 bg-brand-green text-white py-4 rounded-3xl text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-brand-green/20 hover:-translate-y-1 transition-all active:scale-95"
                                                            >
                                                                Confirm Now
                                                            </button>
                                                        )}
                                                        <button onClick={() => handleCancelBooking(b)} className="px-10 py-4 bg-gray-100 text-gray-400 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all border border-transparent hover:border-red-100">Request Cancel</button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="bg-white rounded-[4rem] border-4 border-dashed border-gray-100 p-24 text-center">
                                    <p className="text-gray-300 text-lg italic font-medium">Your schedule is waiting for new art.</p>
                                    <button onClick={() => setActiveTab('book')} className="mt-8 inline-block bg-brand-green text-white px-12 py-4 rounded-3xl font-black uppercase tracking-[0.3em] text-xs shadow-xl shadow-brand-green/20 hover:scale-110 transition-all">Begin Request</button>
                                </div>
                            )}
                        </section>

                        {/* MASTERPIECE ARCHIVE */}
                        <section>
                            <div className="flex items-center gap-6 mb-12">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em] whitespace-nowrap">Your Masterpiece Archive</h3>
                                <div className="flex-grow h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
                            </div>

                            {pastBookings.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {pastBookings.map(b => (
                                        <div key={b.id} className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-lg hover:shadow-2xl transition-all group flex items-start gap-8">
                                            <div className="bg-[#4e342e] rounded-3xl p-5 text-center shrink-0 text-white shadow-xl shadow-[#4e342e]/10">
                                                <p className="text-[10px] font-black uppercase tracking-tighter leading-none mb-1 opacity-60">{new Date(b.bookingDate).toLocaleDateString(undefined, {month:'short'})}</p>
                                                <p className="text-3xl font-black leading-none">{new Date(b.bookingDate).getDate()}</p>
                                            </div>

                                            <div className="flex-grow min-w-0 flex flex-col justify-center">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${b.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>{b.status}</span>
                                                    <p className="text-sm font-black text-gray-900">R {b.totalCost || '0'}</p>
                                                </div>
                                                <h4 className="font-bold text-gray-800 truncate text-sm mb-1">{b.status === 'completed' ? 'Session Manifested' : 'Session Cancelled'}</h4>
                                                <p className="text-[11px] text-gray-400 line-clamp-1 italic">"{b.message}"</p>
                                                
                                                {b.status === 'completed' && (
                                                    <div className="mt-6 flex gap-3">
                                                        <button onClick={() => setActiveTab('aftercare')} className="text-[9px] font-black text-brand-green uppercase tracking-widest border-b-2 border-brand-green/20 hover:border-brand-green transition-all pb-1">Care Protocol</button>
                                                        <button onClick={() => setActiveTab('loyalty')} className="text-[9px] font-black text-brand-pink uppercase tracking-widest border-b-2 border-brand-pink/20 hover:border-brand-pink transition-all pb-1">Rewards</button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-300 text-sm py-20 italic">No historical records found.</p>
                            )}
                        </section>
                    </div>
                </div>
            )}

            {activeTab === 'loyalty' && (
                <div className="space-y-12 animate-fade-in pb-20">
                    <div className="text-center max-w-xl mx-auto">
                        <h3 className="text-5xl font-black text-gray-900 mb-3 tracking-tighter uppercase">Lounge Rewards</h3>
                        <p className="text-xs font-black text-brand-pink uppercase tracking-[0.4em]">Collective Gratitude</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {activePrograms.length > 0 ? activePrograms.map(prog => {
                            const currentCount = currentUser?.loyaltyProgress?.[prog.id] || (prog.id === 'legacy' ? currentUser?.stickers : 0) || 0;
                            const isComplete = currentCount >= prog.stickersRequired;

                            return (
                                <div key={prog.id} className="bg-gradient-to-br from-white to-gray-50 rounded-[3.5rem] p-10 border border-gray-100 shadow-2xl relative overflow-hidden group hover:-translate-y-2 transition-transform duration-500">
                                    {/* PREMIUM CARD OVERLAY */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/5 blur-3xl rounded-full"></div>
                                    
                                    <div className="relative z-10 flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-8">
                                            <div className="bg-white w-16 h-16 rounded-[1.5rem] shadow-xl flex items-center justify-center text-3xl border border-gray-50 group-hover:scale-110 transition-transform duration-500">
                                                {prog.iconUrl ? <img src={prog.iconUrl} className="w-10 h-10 object-contain" /> : (isComplete ? '🎁' : '⚓')}
                                            </div>
                                            <div className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${isComplete ? 'bg-brand-green text-white animate-pulse' : 'bg-gray-900 text-white'}`}>
                                                {isComplete ? 'REWARD READY' : 'COLLECTING'}
                                            </div>
                                        </div>
                                        
                                        <div className="mb-10">
                                            <h4 className="text-2xl font-black text-gray-900 tracking-tight mb-1">{prog.name}</h4>
                                            <p className="text-[10px] text-brand-green font-black uppercase tracking-[0.3em]">Lounge Stamp Card</p>
                                        </div>
                                        
                                        <div className="grid grid-cols-5 gap-3 mb-10">
                                            {Array.from({ length: prog.stickersRequired }).map((_, i) => (
                                                <div key={i} className={`aspect-square rounded-2xl border-2 flex items-center justify-center transition-all duration-1000 relative ${i < currentCount ? 'bg-brand-green border-brand-green shadow-xl shadow-brand-green/20 scale-105' : 'bg-white border-gray-100 group-hover:border-gray-200'}`}>
                                                    {i < currentCount ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={4} stroke="currentColor" className="w-4 h-4 text-white"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                                                    ) : (
                                                        <span className="text-[10px] text-gray-200 font-black">{i + 1}</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-auto pt-8 border-t border-gray-100 space-y-4">
                                            <div className="flex justify-between items-end">
                                                <div className="max-w-[150px]">
                                                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Benefit</p>
                                                    <p className={`text-sm font-bold leading-tight tracking-tight ${isComplete ? 'text-brand-green' : 'text-gray-700'}`}>{prog.rewardDescription}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Stamps</p>
                                                    <p className="text-xl font-black text-gray-900">{currentCount}<span className="text-gray-300 text-xs mx-1">/</span>{prog.stickersRequired}</p>
                                                </div>
                                            </div>
                                            {isComplete && (
                                                <button className="w-full bg-brand-green text-white py-4 rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-brand-green/20 hover:scale-105 transition-all">Redeem Reward Now</button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : (<div className="col-span-full py-32 text-center bg-white rounded-[4rem] border-4 border-dashed border-gray-100"><p className="text-gray-300 italic text-lg font-medium">No loyalty programs active at this time.</p></div>)}
                    </div>
                    
                    <div className="bg-gray-900 rounded-[3rem] p-12 text-center text-white relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,20,147,0.1),transparent)]"></div>
                        <h4 className="text-3xl font-black mb-4 uppercase tracking-tighter">Elite Lounge Perks</h4>
                        <p className="text-gray-400 max-w-2xl mx-auto mb-10 text-sm leading-relaxed">Reach 10 sessions lifetime to unlock the Elite status. Exclusive session rates, complimentary aftercare kits, and early access to all major flash drops.</p>
                        <button className="bg-white text-black px-10 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-green hover:text-white transition-all">Learn More</button>
                    </div>
                </div>
            )}

            {activeTab === 'aftercare' && (
                <div className="animate-fade-in max-w-5xl mx-auto space-y-16 pb-20">
                    <div className="text-center max-w-2xl mx-auto">
                        <h2 className="text-5xl font-black text-gray-900 mb-3 tracking-tighter uppercase">Healing Protocol</h2>
                        <p className="text-xs font-black text-brand-green uppercase tracking-[0.4em]">Ensuring the Longevity of Art</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {(settings?.aftercare?.sections || []).map((section: any, idx: number) => (
                            <div key={idx} className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-2xl relative overflow-hidden group hover:shadow-brand-green/10 transition-all">
                                <div className="absolute top-0 right-0 p-8 text-6xl opacity-5 group-hover:scale-110 transition-transform duration-1000">{section.icon || '🛡️'}</div>
                                <div className="flex items-center gap-6 mb-10">
                                    <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center text-2xl shadow-xl ${idx % 2 === 0 ? 'bg-blue-600 text-white' : 'bg-brand-pink text-white'}`}>{section.icon || '🛡️'}</div>
                                    <h4 className="text-xl font-black text-gray-900 uppercase tracking-tighter">{section.title}</h4>
                                </div>
                                <ul className="space-y-6">
                                    {(section.items || []).map((item: string, iIdx: number) => (
                                        <li key={iIdx} className="flex gap-6 items-start group/item">
                                            <span className={`font-black text-lg shrink-0 ${idx % 2 === 0 ? 'text-blue-600' : 'text-brand-pink'}`}>{String(iIdx + 1).padStart(2, '0')}</span>
                                            <span className="text-sm text-gray-600 font-medium leading-relaxed group-hover/item:text-gray-900 transition-colors">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="bg-gradient-to-br from-brand-green/10 to-transparent border border-brand-green/20 p-12 rounded-[3.5rem] flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left relative overflow-hidden shadow-xl">
                        <div className="absolute top-[-20px] left-[-20px] text-9xl opacity-5 pointer-events-none">🌿</div>
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black text-gray-900 uppercase tracking-tighter mb-2">Lounge Support</h4>
                            <p className="text-gray-600 text-sm max-w-md font-medium leading-relaxed italic">If you notice unexpected changes or have concerns about the healing process, please contact the studio immediately.</p>
                        </div>
                        <a href={getWhatsAppLink(settings?.phone)} target="_blank" rel="noreferrer" className="relative z-10 inline-flex items-center gap-4 bg-brand-green text-white px-12 py-5 rounded-3xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-brand-green/30 hover:-translate-y-1 transition-all active:scale-95">
                            <WhatsAppIcon className="w-6 h-6"/>
                            Consult Artist
                        </a>
                    </div>
                </div>
            )}

            {activeTab === 'financials' && (
                <div className="space-y-6 animate-fade-in"><div className="grid grid-cols-2 gap-4"><div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 text-center"><p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-2">Lifetime Investment</p><p className="text-4xl font-bold text-gray-900">R {totalSpend.toFixed(0)}</p></div><div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 text-center"><p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-2">Outstanding Balance</p><p className={`text-4xl font-bold ${outstanding > 0 ? 'text-red-500' : 'text-green-500'}`}>R {outstanding.toFixed(0)}</p></div></div><div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden"><table className="w-full text-sm text-left"><thead className="bg-gray-50 text-gray-400 font-bold text-[10px] uppercase tracking-widest"><tr><th className="px-6 py-4">Date</th><th className="px-6 py-4">Number</th><th className="px-6 py-4 text-right">Amount</th><th className="px-6 py-4 text-right">Status</th></tr></thead><tbody className="divide-y divide-gray-100">{myInvoices.map(inv => (<tr key={inv.id} className="hover:bg-gray-50 transition-colors"><td className="px-6 py-4 text-gray-500 text-xs">{new Date(inv.dateIssued).toLocaleDateString()}</td><td className="px-6 py-4 font-bold text-gray-900">{inv.number}</td><td className="px-6 py-4 text-right font-bold text-gray-900">R{inv.total.toFixed(2)}</td><td className="px-6 py-4 text-right flex justify-end gap-3 items-center"><span className={`text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${inv.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{inv.status}</span>{inv.status === 'sent' && (<button 
                                                        onClick={() => {
                                                            const booking = bookings.find(b => b.id === inv.bookingId);
                                                            setConfirmationModal({ isOpen: true, booking: booking || null, invoice: inv });
                                                        }} 
                                                        className="bg-brand-green text-white px-4 py-1.5 rounded-xl text-[10px] font-bold shadow-md active:scale-95"
                                                    >PAY</button>)}</td></tr>))}</tbody></table></div></div>
            )}
        </main>
    </div>
  );
};

export default ClientPortal;