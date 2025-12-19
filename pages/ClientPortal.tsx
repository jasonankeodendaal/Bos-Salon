
import React, { useState, useEffect, useMemo } from 'react';
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
  const [activeTab, setActiveTab] = useState<'overview' | 'book' | 'history' | 'loyalty' | 'aftercare' | 'financials' | 'profile'>('overview');
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

  // Profile Form State
  const [profileFormData, setProfileFormData] = useState({
      name: '',
      phone: '',
      email: '',
      age: 0,
      address: ''
  });
  const [isProfileSaving, setIsProfileSaving] = useState(false);

  // View State
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Booking Form State
  const [bookingDate, setBookingDate] = useState('');
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingImages, setBookingImages] = useState<File[]>([]);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [selectedSpecial, setSelectedSpecial] = useState<SpecialItem | null>(null);

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
              if (profileFormData.email !== updatedUser.email) {
                  setProfileFormData({
                      name: updatedUser.name || '',
                      phone: updatedUser.phone || '',
                      email: updatedUser.email || '',
                      age: updatedUser.age || 0,
                      address: updatedUser.address || ''
                  });
              }
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

  const handleProfileSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentUser) return;
      setIsProfileSaving(true);
      try {
          await onUpdateClient({
              ...currentUser,
              name: profileFormData.name,
              phone: profileFormData.phone,
              email: profileFormData.email,
              age: Number(profileFormData.age),
              address: profileFormData.address
          });
          alert("Identity updated successfully.");
      } catch (error) {
          console.error(error);
          alert("Failed to save profile.");
      } finally {
          setIsProfileSaving(false);
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
                              await onUpdateBooking({ ...relatedBooking, status: 'confirmed', amountPaid: invoice.total });
                          }
                      }
                      alert("Payment Successful!");
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
      if(window.confirm("Request cancellation?")) {
          await onUpdateBooking({ ...booking, status: 'cancelled' });
      }
  };

  const handleSpecialSelect = (special: SpecialItem) => {
    setSelectedSpecial(prev => prev?.id === special.id ? null : special);
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
          const finalMessage = selectedSpecial ? `[SPECIAL: ${selectedSpecial.title}]\n${bookingMessage}` : bookingMessage;
          await onAddBooking({
              name: currentUser.name,
              email: currentUser.email,
              whatsappNumber: currentUser.phone || '',
              message: finalMessage,
              bookingDate,
              contactMethod: 'whatsapp',
              referenceImages: referenceImageUrls,
          });
          alert("Booking request sent!");
          setBookingDate('');
          setBookingMessage('');
          setBookingImages([]);
          setSelectedSpecial(null);
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
            <p className="text-center text-gray-500 text-sm mb-8">{isSignUpMode ? 'Create your profile to start.' : 'Manage your tattoos and rewards.'}</p>
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
                        {['overview', 'book', 'history', 'loyalty', 'aftercare', 'profile'].map(t => (
                            <button key={t} onClick={() => setActiveTab(t as any)} className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all capitalize ${activeTab === t ? 'bg-white text-brand-green shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>
                                {t}
                            </button>
                        ))}
                    </div>
                    <button onClick={handleLogout} className="text-[10px] font-bold text-red-500 px-3 py-1.5 rounded-full bg-red-50 hover:bg-red-100 transition-colors uppercase tracking-widest border border-red-100">Logout</button>
                </div>
            </div>
            <div className="sm:hidden flex gap-2 mt-4 overflow-x-auto pb-1 no-scrollbar">
                {['overview', 'book', 'history', 'loyalty', 'aftercare', 'financials', 'profile'].map(t => (
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
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Total Tattoos</p>
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
                                            <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mt-1">Confirmed</p>
                                        </div>
                                        <p className="text-sm text-gray-600 line-clamp-2 italic">"{upcomingBookings[0].message}"</p>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-gray-400 text-sm italic">No upcoming ink.</p>
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
                                            <div className="flex gap-2"><button onClick={() => setViewInvoice(inv)} className="bg-white px-4 py-2 rounded-xl text-[10px] font-bold border border-gray-200 hover:bg-gray-50">View</button>{inv.status === 'sent' && (<button onClick={() => handlePayNow(inv)} className="bg-brand-green text-white px-4 py-2 rounded-xl text-[10px] font-bold shadow-md active:scale-95">Pay Now</button>)}</div>
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
                                            <span className={`px-2 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest ${b.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{b.status}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (<p className="text-gray-400 text-sm italic py-10 text-center">No history yet.</p>)}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'book' && (
                <div className="animate-fade-in max-w-2xl mx-auto space-y-6">
                    {/* TINY SPECIALS CARDS ABOVE REQUEST */}
                    {specials.filter(s => s.active).length > 0 && (
                        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-lg overflow-hidden">
                             <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-widest text-[10px]">
                                <span className="w-2 h-2 rounded-full bg-brand-green"></span> Current Offers (Tap to select)
                             </h4>
                             <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                                {specials.filter(s => s.active).map(special => (
                                    <div 
                                        key={special.id} 
                                        onClick={() => handleSpecialSelect(special)}
                                        className={`flex-shrink-0 w-32 cursor-pointer group transition-all duration-300 ${selectedSpecial?.id === special.id ? 'scale-105 ring-2 ring-brand-green ring-offset-2 rounded-xl' : 'opacity-80 grayscale hover:grayscale-0 hover:opacity-100'}`}
                                    >
                                        <div className="relative h-20 rounded-xl overflow-hidden mb-2 shadow-md">
                                            <img src={special.imageUrl} alt={special.title} className="w-full h-full object-cover" />
                                            {selectedSpecial?.id === special.id && (
                                                <div className="absolute inset-0 bg-brand-green/30 flex items-center justify-center">
                                                    <span className="text-white text-lg">✓</span>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-800 line-clamp-1 leading-tight">{special.title}</p>
                                        <p className="text-[8px] text-brand-green font-bold uppercase">R {special.priceValue || special.price}</p>
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}

                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-2xl">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Request Appointment</h3>
                        <p className="text-gray-500 text-sm mb-8">Tell us about your next project.</p>
                        
                        <form onSubmit={handleBookSubmit} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Preferred Date</label>
                                <input type="date" required min={new Date().toISOString().split('T')[0]} value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-gray-900 focus:ring-2 focus:ring-brand-green outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Design Idea / Message</label>
                                <textarea rows={4} required value={bookingMessage} onChange={(e) => setBookingMessage(e.target.value)} placeholder="Describe the tattoo size, placement, and style..." className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-gray-900 focus:ring-2 focus:ring-brand-green outline-none" />
                            </div>
                            <div className="pt-6 border-t border-gray-50">
                                <button type="submit" disabled={isBookingLoading} className="w-full bg-brand-green text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-brand-green/20 hover:scale-[1.02] transition-all active:scale-[0.98] disabled:opacity-50 uppercase tracking-widest">
                                    {isBookingLoading ? 'Sending Request...' : 'Send Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {activeTab === 'loyalty' && (
                <div className="space-y-8 animate-fade-in">
                    <div className="text-center max-w-xl mx-auto">
                        <h3 className="text-3xl font-bold text-gray-900 mb-2 font-script">Member Rewards</h3>
                        <p className="text-sm text-gray-500 italic">"Collect stickers to unlock exclusive studio perks."</p>
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
                    <div className="bg-brand-green/5 border border-brand-green/20 p-8 rounded-[2rem] text-center"><p className="text-sm font-bold text-brand-green uppercase tracking-[0.2em] mb-4">Need help?</p><p className="text-gray-700 mb-6">If you notice excessive redness, swelling, or have concerns about your treatment:</p><a href={`https://wa.me/${settings?.whatsAppNumber}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-brand-green text-white px-8 py-3 rounded-2xl font-bold shadow-lg"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 2c-5.523 0-10 4.477-10 10 0 1.764.457 3.42 1.258 4.86L2 22l5.311-1.393c1.44.8 3.096 1.258 4.86 1.258 5.523 0 10-4.477 10-10s-4.477-10-10-10zm0 18.062c-1.572 0-3.045-.425-4.322-1.162l-.31-.18-3.21.841.855-3.13-.197-.323c-.737-1.277-1.162-2.75-1.162-4.322 0-4.444 3.619-8.063 8.063-8.063s8.063 3.619 8.063 8.063-3.619 8.063-8.063 8.063z"/></svg>Message Studio</a></div>
                </div>
            )}

            {activeTab === 'profile' && (
                <div className="animate-fade-in max-w-2xl mx-auto"><div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-2xl overflow-hidden relative"><div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none"><img src={logoUrl} className="w-48 h-48 object-contain grayscale" /></div><div className="relative z-10"><h3 className="text-3xl font-script text-brand-green mb-2">Bos Identity</h3><p className="text-gray-500 text-sm mb-8 italic">Review and update your personal details for our studio records.</p><form onSubmit={handleProfileSubmit} className="space-y-6"><div className="grid grid-cols-1 sm:grid-cols-2 gap-5"><div><label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label><input type="text" required value={profileFormData.name} onChange={e => setProfileFormData({...profileFormData, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-pink outline-none transition-all" /></div><div><label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Tell / Mobile</label><input type="tel" required value={profileFormData.phone} onChange={e => setProfileFormData({...profileFormData, phone: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-pink outline-none transition-all" /></div><div className="sm:col-span-1"><label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label><input type="email" readOnly value={profileFormData.email} className="w-full bg-gray-100 border border-gray-200 rounded-xl p-3 text-sm text-gray-400 cursor-not-allowed outline-none" /><p className="text-[9px] text-gray-300 mt-1 italic ml-1">Email cannot be changed.</p></div><div className="sm:col-span-1"><label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Age</label><input type="number" required min={1} value={profileFormData.age || ''} onChange={e => setProfileFormData({...profileFormData, age: parseInt(e.target.value)})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-pink outline-none transition-all" /></div><div className="sm:col-span-2"><label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Physical Address</label><textarea rows={3} required value={profileFormData.address} onChange={e => setProfileFormData({...profileFormData, address: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-pink outline-none transition-all" placeholder="123 Street, City, Code" /></div></div><div className="pt-4"><button type="submit" disabled={isProfileSaving} className="w-full bg-brand-green text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-brand-green/20 hover:scale-[1.01] transition-all active:scale-[0.98] disabled:opacity-50 tracking-widest uppercase">{isProfileSaving ? 'Saving Changes...' : 'Update Identity'}</button></div></form></div></div></div>
            )}

            {activeTab === 'financials' && (
                <div className="space-y-6 animate-fade-in"><div className="grid grid-cols-2 gap-4"><div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 text-center"><p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-2">Lifetime Investment</p><p className="text-4xl font-bold text-gray-900">R {totalSpend.toFixed(0)}</p></div><div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 text-center"><p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-2">Outstanding Balance</p><p className={`text-4xl font-bold ${outstanding > 0 ? 'text-red-500' : 'text-green-500'}`}>R {outstanding.toFixed(0)}</p></div></div><div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden"><table className="w-full text-sm text-left"><thead className="bg-gray-50 text-gray-400 font-bold text-[10px] uppercase tracking-widest"><tr><th className="px-6 py-4">Date</th><th className="px-6 py-4">Number</th><th className="px-6 py-4 text-right">Amount</th><th className="px-6 py-4 text-right">Status</th></tr></thead><tbody className="divide-y divide-gray-100">{myInvoices.map(inv => (<tr key={inv.id} className="hover:bg-gray-50 transition-colors"><td className="px-6 py-4 text-gray-500 text-xs">{new Date(inv.dateIssued).toLocaleDateString()}</td><td className="px-6 py-4 font-bold text-gray-900">{inv.number}</td><td className="px-6 py-4 text-right font-bold text-gray-900">R{inv.total.toFixed(2)}</td><td className="px-6 py-4 text-right flex justify-end gap-3 items-center"><span className={`text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${inv.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{inv.status}</span>{inv.status === 'sent' && (<button onClick={() => handlePayNow(inv)} className="bg-brand-green text-white px-4 py-1.5 rounded-xl text-[10px] font-bold shadow-md active:scale-95">PAY</button>)}</td></tr>))}</tbody></table></div></div>
            )}
        </main>
    </div>
  );
};

export default ClientPortal;
