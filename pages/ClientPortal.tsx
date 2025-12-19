
import React, { useState, useEffect, useMemo } from 'react';
import { Client, Booking, Invoice, SpecialItem, LoyaltyProgram, BookingOption } from '../App';
import { dbUploadFile, dbLoginWithGoogle, dbLogout } from '../utils/dbAdapter';
import WhatsAppIcon from '../components/icons/WhatsAppIcon';
import { Leaf, BullSkull, DeerSkull } from '../components/icons/SalonIcons';

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
                        <button onClick={() => window.print()} className="text-sm font-bold text-blue-600 hover:text-blue-800 px-3 py-1 border border-blue-200 rounded transition-colors">Print</button>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl leading-none">&times;</button>
                    </div>
                </div>
                <div className="p-8 overflow-y-auto bg-white text-gray-800 text-sm font-sans">
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
  
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [manualEmail, setManualEmail] = useState('');
  const [manualPin, setManualPin] = useState('');
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpPin, setSignUpPin] = useState('');
  const [signUpConfirmPin, setSignUpConfirmPin] = useState('');

  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [confirmationModal, setConfirmationModal] = useState<{ isOpen: boolean, booking: Booking | null, invoice: Invoice | null }>({ isOpen: false, booking: null, invoice: null });

  const [bookingDate, setBookingDate] = useState('');
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingImages, setBookingImages] = useState<File[]>([]);
  const [bookingImagePreviews, setBookingImagePreviews] = useState<string[]>([]);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [selectedSpecial, setSelectedSpecial] = useState<SpecialItem | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

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

  const handleConfirmInSalon = async (booking: Booking, invoice: Invoice | null) => {
      if (!window.confirm("Confirm for In-Salon payment?")) return;
      setProcessingId(booking.id);
      try {
          await onUpdateBooking({ ...booking, status: 'confirmed', confirmationMethod: 'in-salon' });
          if (invoice) await onUpdateInvoice({ ...invoice, status: 'accepted' });
          alert("Confirmed!");
          setConfirmationModal({ isOpen: false, booking: null, invoice: null });
      } catch (err) { console.error(err); } finally { setProcessingId(null); }
  };

  const handlePayNow = (invoice: Invoice) => {
      const yocoKey = settings?.payments?.yocoPublicKey;
      if (!yocoKey) return alert("Payments unavailable.");
      const yoco = new (window as any).YocoSDK({ publicKey: yocoKey });
      yoco.showPopup({
          amountInCents: Math.round(invoice.total * 100),
          currency: 'ZAR',
          name: companyName,
          description: `Payment for ${invoice.number}`,
          callback: async (result: any) => {
              if (result.error) alert(result.error.message);
              else {
                  setProcessingId(invoice.id);
                  try {
                      await onUpdateInvoice({ ...invoice, status: 'paid' });
                      const relatedBooking = bookings.find(b => b.id === invoice.bookingId);
                      if (relatedBooking) await onUpdateBooking({ ...relatedBooking, status: 'confirmed', amountPaid: invoice.total, confirmationMethod: 'online' });
                      alert("Payment Successful!");
                      setConfirmationModal({ isOpen: false, booking: null, invoice: null });
                  } catch (err) { console.error(err); } finally { setProcessingId(null); }
              }
          },
      });
  };

  const handleCancelBooking = async (booking: Booking) => {
      if(window.confirm("Request cancellation?")) await onUpdateBooking({ ...booking, status: 'cancelled' });
  };

  const handleSpecialSelect = (special: SpecialItem) => setSelectedSpecial(prev => prev?.id === special.id ? null : special);
  const handleOptionToggle = (label: string) => setSelectedOptions(prev => prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]);
  const getWhatsAppLink = (number?: string) => number ? `https://wa.me/${number.replace(/[^0-9]/g, '')}` : '#';

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        const files: File[] = Array.from(e.target.files);
        setBookingImages(files);
        bookingImagePreviews.forEach(url => URL.revokeObjectURL(url));
        setBookingImagePreviews(files.map(file => URL.createObjectURL(file)));
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
          const optionsPart = selectedOptions.length > 0 ? `[OPTIONS: ${selectedOptions.join(', ')}]\n` : "";
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
          alert("Request sent!");
          setBookingDate(''); setBookingMessage(''); setBookingImages([]); setBookingImagePreviews([]); setSelectedSpecial(null); setSelectedOptions([]);
          setActiveTab('history');
      } catch (error) { console.error(error); } finally { setIsBookingLoading(false); }
  };

  const myInvoices = currentUser ? invoices.filter(inv => inv.clientEmail.toLowerCase() === currentUser.email.toLowerCase() && (inv.status !== 'draft' && inv.status !== 'void')) : [];
  const myBookings = currentUser ? bookings.filter(b => b.email.toLowerCase() === currentUser.email.toLowerCase()) : [];
  const upcomingBookings = myBookings.filter(b => (b.status === 'confirmed' || b.status === 'pending' || b.status === 'quote_sent' || b.status === 'rescheduled') && new Date(b.bookingDate) >= new Date()).sort((a,b) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime());
  const pastBookings = myBookings.filter(b => b.status === 'completed' || b.status === 'cancelled' || new Date(b.bookingDate) < new Date()).sort((a,b) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime());
  const totalSpend = myInvoices.filter(i => i.status === 'paid').reduce((acc, curr) => acc + curr.total, 0);
  const outstanding = myInvoices.filter(i => i.status === 'sent' && i.type === 'invoice').reduce((acc, curr) => acc + curr.total, 0);
  
  const activePrograms: LoyaltyProgram[] = (settings?.loyaltyPrograms || []).filter((p: LoyaltyProgram) => p.active);
  const bookingOptions: BookingOption[] = settings?.bookingOptions || [];

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-20">
        {viewInvoice && <InvoicePreviewModal invoice={viewInvoice} onClose={() => setViewInvoice(null)} />}
        
        {confirmationModal.isOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
                    <div className="bg-brand-green p-6 text-white text-center">
                        <h3 className="text-2xl font-bold">Approve & Confirm</h3>
                        <p className="text-white/80 text-xs uppercase font-black tracking-widest mt-1">Select your payment path</p>
                    </div>
                    <div className="p-8 space-y-6">
                        <p className="text-gray-500 text-sm text-center">How would you like to confirm your booking for <span className="font-bold text-gray-900">{new Date(confirmationModal.booking?.bookingDate || '').toLocaleDateString()}</span>?</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button onClick={() => handlePayNow(confirmationModal.invoice! || { id: 'temp', total: confirmationModal.booking?.totalCost || 0 } as any)} className="flex flex-col items-center gap-4 p-6 rounded-3xl border-2 border-brand-green bg-brand-green/5 hover:bg-brand-green/10 transition-all text-center group">
                                <div className="w-12 h-12 rounded-2xl bg-brand-green flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg></div>
                                <div><h4 className="font-bold text-gray-900">Pay Online</h4><p className="text-[10px] text-gray-500 mt-1 uppercase font-black tracking-tighter">Instant Approval</p></div>
                            </button>
                            <button onClick={() => handleConfirmInSalon(confirmationModal.booking!, confirmationModal.invoice)} className="flex flex-col items-center gap-4 p-6 rounded-3xl border-2 border-gray-100 hover:border-brand-green/30 bg-gray-50 hover:bg-white transition-all text-center group">
                                <div className="w-12 h-12 rounded-2xl bg-gray-200 flex items-center justify-center text-gray-500 group-hover:bg-brand-green group-hover:text-white transition-all shadow-sm group-hover:scale-110"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg></div>
                                <div><h4 className="font-bold text-gray-900">In-Salon</h4><p className="text-[10px] text-gray-500 mt-1 uppercase font-black tracking-tighter">Pay at Studio</p></div>
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
                    <div><h1 className="font-bold text-lg leading-tight text-gray-900">{currentUser?.name}</h1><p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Collector #{currentUser?.id?.slice(-4) || '0001'}</p></div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex gap-1 bg-gray-100 p-1 rounded-2xl">
                        {['overview', 'book', 'history', 'loyalty', 'aftercare'].map(t => (
                            <button key={t} onClick={() => setActiveTab(t as any)} className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all capitalize ${activeTab === t ? 'bg-white text-brand-green shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>{t}</button>
                        ))}
                    </div>
                    <button onClick={handleLogout} className="text-[10px] font-bold text-red-500 px-3 py-1.5 rounded-full bg-red-50 hover:bg-red-100 transition-colors uppercase tracking-widest border border-red-100">Logout</button>
                </div>
            </div>
            <div className="sm:hidden flex gap-2 mt-4 overflow-x-auto pb-1 no-scrollbar">
                {['overview', 'book', 'history', 'loyalty', 'aftercare'].map(t => (
                    <button key={t} onClick={() => setActiveTab(t as any)} className={`flex-shrink-0 px-4 py-2 text-[10px] font-bold rounded-lg border transition-all capitalize ${activeTab === t ? 'bg-brand-green text-white border-brand-green shadow-md' : 'bg-white text-gray-600 border-gray-200'}`}>{t}</button>
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
                                <h2 className="text-3xl font-bold">Welcome back, {currentUser?.name.split(' ')[0]}!</h2>
                                <p className="text-gray-400 text-sm mb-8 mt-1">You have {upcomingBookings.length} upcoming appointments.</p>
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
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-green mb-1">Rewards</p>
                                        <p className="text-xl font-bold">Active Cards</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl flex flex-col justify-between">
                            <div>
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-widest text-[10px]"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Next Session</h3>
                                {upcomingBookings.length > 0 ? (
                                    <div className="space-y-4">
                                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100"><p className="font-bold text-2xl text-blue-900">{new Date(upcomingBookings[0].bookingDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</p><p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${upcomingBookings[0].status === 'confirmed' ? 'text-green-600' : 'text-blue-600'}`}>{upcomingBookings[0].status.replace('_', ' ')}</p></div>
                                        <p className="text-sm text-gray-600 line-clamp-2 italic">"{upcomingBookings[0].message}"</p>
                                    </div>
                                ) : (<div className="text-center py-8"><p className="text-gray-400 text-sm italic">No upcoming sessions.</p><button onClick={() => setActiveTab('book')} className="mt-4 text-xs font-bold text-brand-green hover:underline uppercase tracking-widest">Book Now &rarr;</button></div>)}
                            </div>
                            <button onClick={() => setActiveTab('loyalty')} className="w-full bg-brand-green text-white py-3 rounded-2xl font-bold text-xs shadow-lg shadow-brand-green/20 hover:scale-[1.02] transition-all">Check Rewards</button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'loyalty' && (
                <div className="space-y-12 animate-fade-in pb-20">
                    <div className="text-center max-w-2xl mx-auto">
                        <h2 className="text-4xl font-bold text-gray-900 mb-2 font-script">Sanctuary Rewards</h2>
                        <p className="text-sm text-gray-500 italic">"Your loyalty is the canvas of our art. Collect stamps for exclusive studio perks."</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {activePrograms.length > 0 ? activePrograms.map(prog => {
                            const currentCount = currentUser?.loyaltyProgress?.[prog.id] || (prog.id === 'legacy' ? currentUser?.stickers : 0) || 0;
                            const isComplete = currentCount >= prog.stickersRequired;

                            return (
                                <div key={prog.id} className={`relative rounded-[2.5rem] p-1 shadow-2xl transition-all duration-500 ${isComplete ? 'bg-gradient-to-br from-[#ff1493] via-brand-gold to-[#ff1493] scale-[1.02] animate-subtle-glow' : 'bg-white border border-gray-100 hover:-translate-y-2'}`}>
                                    <div className="bg-white rounded-[2.3rem] p-8 h-full flex flex-col relative overflow-hidden">
                                        {/* Background Elements */}
                                        <div className="absolute top-[-20px] right-[-20px] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                            <BullSkull className="w-64 h-64" />
                                        </div>

                                        <div className="flex justify-between items-start mb-10 relative z-10">
                                            <div>
                                                <h4 className="text-2xl font-black text-gray-900 tracking-tight leading-tight">{prog.name}</h4>
                                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-green mt-1">Digital Member Card</p>
                                            </div>
                                            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-3xl shadow-xl transform rotate-3 transition-transform ${isComplete ? 'bg-brand-gold text-white animate-bounce' : 'bg-gray-50 text-gray-300'}`}>
                                                {isComplete ? '🏆' : '✨'}
                                            </div>
                                        </div>

                                        {/* Stamp Grid */}
                                        <div className="grid grid-cols-5 gap-3 mb-10 relative z-10">
                                            {Array.from({ length: prog.stickersRequired }).map((_, i) => (
                                                <div key={i} className={`aspect-square rounded-2xl border-2 flex items-center justify-center transition-all duration-700 relative overflow-hidden ${i < currentCount ? 'bg-brand-green/10 border-brand-green shadow-inner' : 'bg-gray-50 border-gray-100'}`}>
                                                    {i < currentCount ? (
                                                        <div className="animate-fade-in-up">
                                                            <Leaf className="w-8 h-8 text-brand-green scale-110 drop-shadow-sm" />
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] text-gray-200 font-black">{i + 1}</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Reward Section */}
                                        <div className={`mt-auto p-6 rounded-3xl transition-all ${isComplete ? 'bg-brand-green text-white shadow-xl scale-[1.05]' : 'bg-gray-50 border border-gray-100'}`}>
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isComplete ? 'text-white/70' : 'text-gray-400'}`}>Current Reward</p>
                                                    <p className={`text-sm font-black leading-tight ${isComplete ? 'text-white' : 'text-gray-900'}`}>{prog.rewardDescription}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isComplete ? 'text-white/70' : 'text-gray-400'}`}>Status</p>
                                                    <p className={`text-sm font-black ${isComplete ? 'text-white' : 'text-gray-900'}`}>
                                                        {isComplete ? 'READY!' : `${currentCount}/${prog.stickersRequired}`}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {isComplete && (
                                            <div className="mt-6 animate-pulse">
                                                <button className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg">Show to Artist to Redeem</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        }) : (<div className="col-span-full py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100"><p className="text-gray-300 font-bold uppercase tracking-widest">No active loyalty programs found.</p></div>)}
                        
                        {/* Membership Perks Sidebar */}
                        <div className="bg-gray-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl md:col-span-2 lg:col-span-1">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Leaf className="w-32 h-32" />
                            </div>
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                                <span className="text-brand-green">✦</span> Sanctuary Perks
                            </h3>
                            <ul className="space-y-6 text-sm">
                                <li className="flex gap-4">
                                    <span className="text-brand-green font-bold">01</span>
                                    <div><p className="font-bold">Priority Booking</p><p className="text-xs text-gray-400 mt-1">Full cards skip the digital queue for flash weekends.</p></div>
                                </li>
                                <li className="flex gap-4">
                                    <span className="text-brand-green font-bold">02</span>
                                    <div><p className="font-bold">Exclusive Flash</p><p className="text-xs text-gray-400 mt-1">Unlock designs only available to gold-tier collectors.</p></div>
                                </li>
                                <li className="flex gap-4">
                                    <span className="text-brand-green font-bold">03</span>
                                    <div><p className="font-bold">Birthday Bonus</p><p className="text-xs text-gray-400 mt-1">Get 2 bonus stamps automatically on your special day.</p></div>
                                </li>
                            </ul>
                            <div className="mt-12 pt-8 border-t border-white/5">
                                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest text-center italic">Thank you for being part of Bos Salon.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'book' && (
                <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
                    {specials.filter(s => s.active).length > 0 && (
                        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-100 shadow-lg">
                             <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-widest text-[10px]"><span className="w-2 h-2 rounded-full bg-brand-green"></span> Tap offer to add</h4>
                             <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                                {specials.filter(s => s.active).map(special => (
                                    <div key={special.id} onClick={() => handleSpecialSelect(special)} className={`cursor-pointer transition-all duration-300 relative group overflow-hidden rounded-xl border-2 ${selectedSpecial?.id === special.id ? 'border-brand-green scale-[0.98]' : 'border-transparent opacity-80 hover:opacity-100'}`}>
                                        <div className="aspect-square relative overflow-hidden bg-gray-50">
                                            <img src={special.imageUrl} alt={special.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                            {selectedSpecial?.id === special.id && (<div className="absolute inset-0 bg-brand-green/20 backdrop-blur-[1px] flex items-center justify-center"><div className="bg-white rounded-full p-1 shadow-lg"><svg className="w-4 h-4 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div></div>)}
                                            <div className="absolute bottom-1 right-1 bg-black/60 text-white px-1 py-0.5 rounded text-[8px] font-bold">R{special.priceValue || special.price}</div>
                                        </div>
                                        <p className="p-1.5 text-[9px] font-bold text-gray-800 line-clamp-1 text-center">{special.title}</p>
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl h-fit">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Pre-checks</h3>
                            <div className="space-y-3">
                                {bookingOptions.map(opt => (
                                    <div key={opt.id} onClick={() => handleOptionToggle(opt.label)} className={`flex items-start gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${selectedOptions.includes(opt.label) ? 'bg-brand-green/5 border-brand-green' : 'bg-gray-50 border-gray-100 hover:bg-white'}`}>
                                        <div className={`mt-0.5 w-4 h-4 shrink-0 rounded flex items-center justify-center border-2 transition-colors ${selectedOptions.includes(opt.label) ? 'bg-brand-green border-brand-green' : 'border-gray-300'}`}>{selectedOptions.includes(opt.label) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}</div>
                                        <div><p className={`text-xs font-bold leading-tight ${selectedOptions.includes(opt.label) ? 'text-brand-green' : 'text-gray-900'}`}>{opt.label}</p><p className="text-[10px] text-gray-500 mt-0.5">{opt.description}</p></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-2xl">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Request Appointment</h3>
                            <p className="text-gray-500 text-sm mb-8">Tell us about your next treatment.</p>
                            <form onSubmit={handleBookSubmit} className="space-y-6">
                                <div><label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Preferred Date</label><input type="date" required min={new Date().toISOString().split('T')[0]} value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-gray-900 focus:ring-2 focus:ring-brand-green outline-none" /></div>
                                <div><label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Service Details</label><textarea rows={4} required value={bookingMessage} onChange={(e) => setBookingMessage(e.target.value)} placeholder="Describe your style..." className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-gray-900 focus:ring-2 focus:ring-brand-green outline-none" /></div>
                                <div><label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Inspiration (Max 5)</label><div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-6 text-center group hover:border-brand-green transition-colors"><input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" id="file-upload-portal" /><label htmlFor="file-upload-portal" className="cursor-pointer block"><div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm text-gray-400 group-hover:text-brand-green transition-colors"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg></div><span className="text-xs font-bold text-gray-400 group-hover:text-brand-green uppercase tracking-widest">Select Photos</span></label></div>{bookingImagePreviews.length > 0 && (<div className="grid grid-cols-5 gap-2 mt-4">{bookingImagePreviews.map((url, idx) => (<div key={idx} className="aspect-square rounded-lg overflow-hidden border border-gray-200"><img src={url} className="w-full h-full object-cover" /></div>))}</div>)}</div>
                                <div className="pt-6 border-t border-gray-50"><button type="submit" disabled={isBookingLoading} className="w-full bg-brand-green text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-brand-green/20 hover:scale-[1.02] transition-all disabled:opacity-50 uppercase tracking-widest">{isBookingLoading ? 'Sending...' : 'Send Request'}</button></div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'history' && (
                <div className="space-y-12 animate-fade-in pb-20">
                    <section>
                        <div className="flex items-center gap-4 mb-8"><h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Next Chapters</h3><div className="flex-grow h-px bg-gradient-to-r from-gray-100 to-transparent"></div></div>
                        {upcomingBookings.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">{upcomingBookings.map(b => {
                                const linkedInvoice = myInvoices.find(inv => inv.bookingId === b.id || inv.clientEmail === b.email); 
                                return (
                                    <div key={b.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden group flex flex-col sm:flex-row">
                                        <div className="w-full sm:w-32 bg-gray-900 text-white flex flex-col items-center justify-center p-6 text-center shrink-0"><span className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">{new Date(b.bookingDate).toLocaleDateString(undefined, {month:'short'})}</span><span className="text-4xl font-black">{new Date(b.bookingDate).getDate()}</span><span className="text-[10px] font-bold text-brand-green uppercase mt-1">{new Date(b.bookingDate).getFullYear()}</span></div>
                                        <div className="flex-grow p-8 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start mb-4"><span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em] shadow-sm ${b.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{b.status.replace('_', ' ')}</span></div>
                                                <p className="text-gray-800 text-sm leading-relaxed font-medium mb-6 italic">"{b.message}"</p>
                                            </div>
                                            <div className="pt-6 border-t border-gray-50 flex justify-between items-center"><div className="text-left"><p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Est. Investment</p><p className="text-xl font-black text-gray-900">R {b.totalCost || 'TBD'}</p></div>{b.status === 'quote_sent' && (<button onClick={() => setConfirmationModal({ isOpen: true, booking: b, invoice: linkedInvoice || null })} className="bg-brand-green text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg">Confirm Slot</button>)}<button onClick={() => handleCancelBooking(b)} className="bg-gray-100 text-gray-400 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-500">Cancel</button></div>
                                        </div>
                                    </div>
                                );
                            })}</div>
                        ) : (<div className="bg-white rounded-[2rem] border border-dashed border-gray-200 p-16 text-center"><p className="text-gray-400 italic">No active bookings.</p></div>)}
                    </section>
                </div>
            )}

            {activeTab === 'aftercare' && (
                <div className="animate-fade-in max-w-4xl mx-auto space-y-12">
                    <div className="text-center"><h3 className="text-3xl font-bold text-gray-900 mb-2 font-script">{settings?.aftercare?.title || 'Care Guide'}</h3><p className="text-sm text-gray-500 italic">"{settings?.aftercare?.intro}"</p></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {(settings?.aftercare?.sections || []).map((section: any, idx: number) => (
                            <div key={idx} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl">
                                <div className="flex items-center gap-4 mb-6"><div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${idx % 2 === 0 ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>{section.icon || '🛡️'}</div><h4 className="text-lg font-bold text-gray-900 uppercase tracking-widest text-xs">{section.title}</h4></div>
                                <ul className="space-y-4 text-sm text-gray-600">{(section.items || []).map((item: string, iIdx: number) => (<li key={iIdx} className="flex gap-3"><span className={`font-bold ${idx % 2 === 0 ? 'text-blue-500' : 'text-red-500'}`}>{String(iIdx + 1).padStart(2, '0')}.</span><span>{item}</span></li>))}</ul>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </main>
    </div>
  );
};

export default ClientPortal;
