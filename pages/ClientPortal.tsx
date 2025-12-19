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
      if (visitCount >= 5) return 'VIP Collector';
      if (visitCount >= 2) return 'Returning Collector';
      return 'New Collector';
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
                {['overview', 'book', 'history', 'loyalty', 'aftercare', 'financials'].map(t => (
                    <button key={t} onClick={() => setActiveTab(t as any)} className={`flex-shrink-0 px-4 py-2 text-[10px] font-bold rounded-lg border transition-all capitalize ${activeTab === t ? 'bg-brand-green text-white border-brand-green shadow-md shadow-brand-green/20' : 'bg-white text-gray-600 border-gray-200'}`}>{t}</button>
                ))}
            </div>
        </header>

        <main className="max-w-6xl mx-auto p-4 sm:p-8 space-y-8 mt-4 no-print">
            
            {activeTab === 'overview' && (
                <div className="space-y-8 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 bg-gradient-to-br from-gray-900 to-brand-light p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-green/10 rounded-full blur-3xl group-hover:bg-brand-green/20 transition-all duration-700"></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-1">
                                    <h2 className="text-3xl font-bold">Welcome back, {currentUser?.name.split(' ')[0]}!</h2>
                                    {/* TINY LOYALTY OVERVIEW */}
                                    {firstProgram && (
                                        <div onClick={() => setActiveTab('loyalty')} className="bg-white/10 backdrop-blur-md border border-white/10 p-2 rounded-xl flex items-center gap-2 cursor-pointer hover:bg-white/20 transition-all scale-90 sm:scale-100 origin-right">
                                            <div className="w-8 h-8 rounded-lg bg-brand-green/20 flex items-center justify-center text-sm">🎁</div>
                                            <div className="hidden xs:block">
                                                <p className="text-[8px] font-black uppercase text-brand-green leading-none">Rewards</p>
                                                <p className="text-xs font-bold">{firstProgramCount}/{firstProgram.stickersRequired}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <p className="text-gray-400 text-sm mb-8">You have {upcomingBookings.length} upcoming appointments.</p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Lifetime Spend</p>
                                        <p className="text-xl font-bold">R {totalSpend.toFixed(0)}</p>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Total Sessions</p>
                                        <p className="text-xl font-bold">{currentUser?.visitCount || 0}</p>
                                    </div>
                                    <div className="hidden sm:block bg-brand-green/10 border border-brand-green/20 p-4 rounded-2xl">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-green mb-1">Status</p>
                                        <p className="text-xl font-bold">{getClientStatus(currentUser?.visitCount || 0)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl flex flex-col justify-between">
                            <div>
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-widest text-[10px]">
                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span> Next Session
                                </h3>
                                {upcomingBookings.length > 0 ? (
                                    <div className="space-y-4">
                                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                            <p className="font-bold text-2xl text-blue-900">{new Date(upcomingBookings[0].bookingDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</p>
                                            <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${upcomingBookings[0].status === 'confirmed' ? 'text-green-600' : 'text-blue-600'}`}>{upcomingBookings[0].status.replace('_', ' ')}</p>
                                        </div>
                                        <p className="text-sm text-gray-600 line-clamp-2 italic">"{upcomingBookings[0].message}"</p>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-gray-400 text-sm italic">No upcoming sessions.</p>
                                        <button onClick={() => setActiveTab('book')} className="mt-4 text-xs font-bold text-brand-green hover:underline uppercase tracking-widest">Book Now &rarr;</button>
                                    </div>
                                )}
                            </div>
                            <div className="pt-6 mt-6 border-t border-gray-50">
                                <button onClick={() => setActiveTab('loyalty')} className="w-full bg-brand-green text-white py-3 rounded-2xl font-bold text-xs shadow-lg shadow-brand-green/20 hover:scale-[1.02] transition-all">Check Rewards</button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl">
                            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 uppercase tracking-widest text-[10px]">
                                <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Documents & Invoices
                            </h3>
                            {myInvoices.filter(i => i.status === 'sent' || i.status === 'accepted').length > 0 ? (
                                <div className="space-y-3">
                                    {myInvoices.filter(i => i.status === 'sent' || i.status === 'accepted').map(inv => (
                                        <div key={inv.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center group hover:bg-white hover:shadow-lg transition-all">
                                            <div><p className="font-bold text-sm text-gray-900">{inv.number}</p><p className="text-xs text-gray-500">R {inv.total.toFixed(2)}</p></div>
                                            <div className="flex gap-2">
                                                <button onClick={() => setViewInvoice(inv)} className="bg-white px-4 py-2 rounded-xl text-[10px] font-bold border border-gray-200 hover:bg-gray-50">View</button>
                                                {inv.status === 'sent' && (
                                                    <button 
                                                        onClick={() => {
                                                            const booking = bookings.find(b => b.id === inv.bookingId);
                                                            setConfirmationModal({ isOpen: true, booking: booking || null, invoice: inv });
                                                        }} 
                                                        className="bg-brand-green text-white px-4 py-2 rounded-xl text-[10px] font-bold shadow-md active:scale-95"
                                                    >
                                                        Confirm & Pay
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (<div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200"><p className="text-gray-400 text-sm italic">All documents settled.</p></div>)}
                        </div>

                        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl">
                            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 uppercase tracking-widest text-[10px]">
                                <span className="w-2 h-2 rounded-full bg-gray-400"></span> Recent Journey
                            </h3>
                            {pastBookings.length > 0 ? (
                                <div className="space-y-4">
                                    {pastBookings.slice(0, 3).map(b => (
                                        <div key={b.id} className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-400 text-xs shrink-0">{new Date(b.bookingDate).getDate()}</div>
                                            <div className="flex-grow"><p className="font-bold text-sm text-gray-900">{new Date(b.bookingDate).toLocaleDateString(undefined, {month:'long', year:'numeric'})}</p><p className="text-xs text-gray-500 truncate">{b.message}</p></div>
                                            <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${b.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>{b.status}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (<p className="text-gray-400 text-sm italic py-10 text-center">No history yet.</p>)}
                        </div>
                    </div>
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
                <div className="space-y-12 animate-fade-in pb-20">
                    <div className="text-center max-w-2xl mx-auto">
                        <h2 className="text-4xl font-bold text-gray-900 mb-2 font-script">Your Beauty Journey</h2>
                        <p className="text-sm text-gray-500 italic">"Every session is a new chapter in your story."</p>
                    </div>

                    <div className="space-y-16">
                        {/* UPCOMING / ACTIVE SECTION */}
                        <section>
                            <div className="flex items-center gap-4 mb-8">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Next Chapters</h3>
                                <div className="flex-grow h-px bg-gradient-to-r from-gray-100 to-transparent"></div>
                            </div>
                            
                            {upcomingBookings.length > 0 ? (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {upcomingBookings.map(b => {
                                        const linkedInvoice = myInvoices.find(inv => inv.bookingId === b.id || inv.clientEmail === b.email); 
                                        const isQuote = b.status === 'quote_sent';
                                        
                                        return (
                                            <div key={b.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden hover:shadow-2xl transition-all group flex flex-col sm:flex-row">
                                                {/* Left: Date Block */}
                                                <div className="w-full sm:w-32 bg-gray-900 text-white flex flex-col items-center justify-center p-6 text-center shrink-0">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">{new Date(b.bookingDate).toLocaleDateString(undefined, {month:'short'})}</span>
                                                    <span className="text-4xl font-black">{new Date(b.bookingDate).getDate()}</span>
                                                    <span className="text-[10px] font-bold text-brand-green uppercase mt-1">{new Date(b.bookingDate).getFullYear()}</span>
                                                </div>

                                                {/* Center: Details */}
                                                <div className="flex-grow p-8 flex flex-col justify-between">
                                                    <div>
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div className="flex gap-2 items-center">
                                                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em] shadow-sm ${
                                                                    b.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                                    b.status === 'quote_sent' ? 'bg-blue-100 text-blue-700 animate-pulse' :
                                                                    'bg-yellow-100 text-yellow-700'
                                                                }`}>
                                                                    {b.status.replace('_', ' ')}
                                                                </span>
                                                                {b.confirmationMethod && (
                                                                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">
                                                                        {b.confirmationMethod === 'online' ? 'Confirmed Online' : 'Salon Payment'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <p className="text-gray-800 text-sm leading-relaxed font-medium mb-6 line-clamp-3 italic">"{b.message}"</p>
                                                        
                                                        {/* Reference Images Mini Gallery */}
                                                        {b.referenceImages && b.referenceImages.length > 0 && (
                                                            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-4">
                                                                {b.referenceImages.map((img, i) => (
                                                                    <a key={i} href={img} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 shrink-0 hover:scale-110 transition-transform">
                                                                        <img src={img} className="w-full h-full object-cover" alt="Ref" />
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="pt-6 border-t border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                                                        <div className="text-center sm:text-left">
                                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Est. Investment</p>
                                                            <p className="text-xl font-black text-gray-900">R {b.totalCost || 'TBD'}</p>
                                                        </div>
                                                        
                                                        <div className="flex gap-2 w-full sm:w-auto">
                                                            {isQuote && (
                                                                <button 
                                                                    onClick={() => setConfirmationModal({ isOpen: true, booking: b, invoice: linkedInvoice || null })} 
                                                                    className="flex-1 sm:flex-none bg-brand-green text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-green/20 hover:scale-105 transition-all"
                                                                >
                                                                    Confirm Slot
                                                                </button>
                                                            )}
                                                            <button onClick={() => handleCancelBooking(b)} className="flex-1 sm:flex-none bg-gray-100 text-gray-400 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all">Cancel</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="bg-white rounded-[2rem] border border-dashed border-gray-200 p-16 text-center">
                                    <p className="text-gray-400 italic">No active bookings. Ready for your next treatment?</p>
                                    <button onClick={() => setActiveTab('book')} className="mt-6 text-xs font-black text-brand-green uppercase tracking-widest hover:underline decoration-2 underline-offset-8">Book a Session &rarr;</button>
                                </div>
                            )}
                        </section>

                        {/* COMPLETED / PAST SECTION */}
                        <section>
                            <div className="flex items-center gap-4 mb-8">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">The Archive</h3>
                                <div className="flex-grow h-px bg-gradient-to-r from-gray-100 to-transparent"></div>
                            </div>

                            {pastBookings.length > 0 ? (
                                <div className="space-y-4">
                                    {pastBookings.map(b => (
                                        <div key={b.id} className="bg-white rounded-3xl border border-gray-100 p-4 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-wrap sm:flex-nowrap items-center gap-6">
                                            <div className="bg-gray-50 rounded-2xl p-4 text-center shrink-0 w-full sm:w-auto">
                                                <p className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">{new Date(b.bookingDate).toLocaleDateString(undefined, {month:'short'})}</p>
                                                <p className="text-2xl font-black text-gray-800">{new Date(b.bookingDate).getDate()}</p>
                                            </div>

                                            <div className="flex-grow min-w-0">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h4 className="font-bold text-gray-900 truncate text-sm">Session Complete</h4>
                                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${b.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>{b.status}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 truncate italic">"{b.message}"</p>
                                            </div>

                                            <div className="shrink-0 w-full sm:w-auto flex justify-between items-center sm:block text-right">
                                                <div className="mb-0 sm:mb-2">
                                                    <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Total Paid</p>
                                                    <p className="text-lg font-black text-gray-800">R {b.totalCost || '0'}</p>
                                                </div>
                                                {b.status === 'completed' && (
                                                    <button onClick={() => setActiveTab('aftercare')} className="text-[10px] font-black text-brand-green uppercase tracking-widest border-b-2 border-brand-green/20 hover:border-brand-green transition-all">View Care Guide</button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-400 text-sm py-10 italic">Your journey is just beginning.</p>
                            )}
                        </section>
                    </div>

                    {/* Support Block */}
                    <div className="bg-gray-900 rounded-[3rem] p-10 sm:p-16 text-center text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/10 blur-[80px] rounded-full"></div>
                        <h3 className="text-3xl font-bold mb-4">Any questions about your history?</h3>
                        <p className="text-gray-400 max-w-xl mx-auto mb-10 text-sm leading-relaxed">If you have questions about past work, need help with a deposit, or want to discuss a new beauty project, we're here.</p>
                        <a href={getWhatsAppLink(settings?.phone)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 bg-brand-green text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-xl shadow-brand-green/20">
                            <WhatsAppIcon className="w-5 h-5"/>
                            Speak to Salon
                        </a>
                    </div>
                </div>
            )}

            {activeTab === 'loyalty' && (
                <div className="space-y-8 animate-fade-in">
                    <div className="text-center max-w-xl mx-auto">
                        <h3 className="text-3xl font-bold text-gray-900 mb-2 font-script">Member Rewards</h3>
                        <p className="text-sm text-gray-500 italic">"Collect stickers to unlock exclusive salon perks."</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activePrograms.length > 0 ? activePrograms.map(prog => {
                            const currentCount = currentUser?.loyaltyProgress?.[prog.id] || (prog.id === 'legacy' ? currentUser?.stickers : 0) || 0;
                            const isComplete = currentCount >= prog.stickersRequired;

                            return (
                                <div key={prog.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-transform">
                                    <div className="absolute top-0 right-0 p-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg shadow-inner ${isComplete ? 'bg-brand-green text-white animate-bounce' : 'bg-gray-50 text-gray-300'}`}>
                                            {isComplete ? '🎁' : '⚓'}
                                        </div>
                                    </div>
                                    
                                    <div className="relative z-10">
                                        <h4 className="text-lg font-bold text-gray-900 mb-1">{prog.name}</h4>
                                        <p className="text-[8px] text-gray-400 uppercase font-bold tracking-[0.2em] mb-6">Active Card</p>
                                        
                                        <div className="grid grid-cols-5 gap-2 mb-6">
                                            {Array.from({ length: prog.stickersRequired }).map((_, i) => (
                                                <div key={i} className={`aspect-square rounded-full border-2 flex items-center justify-center transition-all duration-700 ${i < currentCount ? 'bg-brand-green border-brand-green shadow-md shadow-brand-green/20' : 'bg-gray-50 border-gray-100'}`}>
                                                    {i < currentCount ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3 text-white"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                                                    ) : (
                                                        <span className="text-[8px] text-gray-200 font-bold">{i + 1}</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                                            <div>
                                                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Reward</p>
                                                <p className={`text-xs font-bold leading-tight ${isComplete ? 'text-brand-green' : 'text-gray-900'}`}>{prog.rewardDescription}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Progress</p>
                                                <p className="text-xs font-bold text-gray-900">{currentCount} / {prog.stickersRequired}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : (<div className="col-span-full py-20 text-center bg-white rounded-[2rem] border border-dashed border-gray-300"><p className="text-gray-400 italic">No loyalty programs active.</p></div>)}
                    </div>
                </div>
            )}

            {activeTab === 'aftercare' && (
                <div className="animate-fade-in max-w-4xl mx-auto space-y-12">
                    <div className="text-center"><h3 className="text-3xl font-bold text-gray-900 mb-2 font-script">{settings?.aftercare?.title || 'Care Guide'}</h3><p className="text-sm text-gray-500 italic">"{settings?.aftercare?.intro || 'Proper care ensures long-lasting results.'}"</p></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {(settings?.aftercare?.sections || []).map((section: any, idx: number) => (
                            <div key={idx} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl">
                                <div className="flex items-center gap-4 mb-6"><div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${idx % 2 === 0 ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>{section.icon || '🛡️'}</div><h4 className="text-lg font-bold text-gray-900 uppercase tracking-widest text-xs">{section.title}</h4></div>
                                <ul className="space-y-4 text-sm text-gray-600">{(section.items || []).map((item: string, iIdx: number) => (<li key={iIdx} className="flex gap-3"><span className={`font-bold ${idx % 2 === 0 ? 'text-blue-500' : 'text-red-500'}`}>{String(iIdx + 1).padStart(2, '0')}.</span><span>{item}</span></li>))}</ul>
                            </div>
                        ))}
                    </div>
                    <div className="bg-brand-green/5 border border-brand-green/20 p-8 rounded-[2rem] text-center"><p className="text-sm font-bold text-brand-green uppercase tracking-[0.2em] mb-4">Need help?</p><p className="text-gray-700 mb-6">If you notice issues or have concerns about your treatment:</p><a href={getWhatsAppLink(settings?.phone)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-brand-green text-white px-8 py-3 rounded-2xl font-bold shadow-lg"><WhatsAppIcon className="w-5 h-5"/>Speak to Salon</a></div>
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