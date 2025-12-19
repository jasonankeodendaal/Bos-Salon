
import React, { useState, useMemo } from 'react';
import { Booking, Invoice, Client, LoyaltyProgram } from '../../App';
import WhatsAppIcon from '../../components/icons/WhatsAppIcon';
import PlusIcon from '../../components/icons/PlusIcon';
import TrashIcon from '../../components/icons/TrashIcon';
import PencilIcon from '../../components/icons/PencilIcon';

const IconClients = ({ className = 'w-6 h-6' }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const MailIcon = ({ className = 'w-5 h-5' }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const CalendarIcon = ({ className = 'w-4 h-4' }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;

interface ClientProfile extends Client {
  totalSpend: number;
  visitCount: number;
  lastVisit: string;
  bookings: Booking[];
  invoices: Invoice[];
  preferredPayment: string;
  tier: 'Diamond' | 'Gold' | 'Silver' | 'Bronze' | 'New';
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

const ClientsManager: React.FC<{ 
    bookings: Booking[], 
    invoices: Invoice[], 
    clients?: Client[], 
    onUpdateClient?: (client: Client) => Promise<void>,
    onAddClient?: (client: Omit<Client, 'id'>) => Promise<void>,
    onDeleteClient?: (id: string) => Promise<void>,
    logoUrl?: string;
    loyaltyPrograms?: LoyaltyProgram[]
}> = ({ bookings, invoices, clients: dbClients, onUpdateClient, onAddClient, onDeleteClient, logoUrl, loyaltyPrograms = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'spend' | 'visits' | 'name' | 'last_visit'>('spend');
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoyaltyPopupOpen, setIsLoyaltyPopupOpen] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLoyaltyProgramId, setSelectedLoyaltyProgramId] = useState<string>('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState('');

  const [activatedClients, setActivatedClients] = useState<Record<string, string>>({});

  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientPassword, setNewClientPassword] = useState('');

  const activePrograms = useMemo(() => loyaltyPrograms.filter(p => p.active), [loyaltyPrograms]);

  const clients = useMemo(() => {
    const clientMap: Record<string, ClientProfile> = {};

    if (dbClients) {
        dbClients.forEach(c => {
            const email = c.email.trim().toLowerCase();
            clientMap[email] = {
                ...c,
                email: email,
                totalSpend: 0,
                visitCount: 0,
                lastVisit: '',
                bookings: [],
                invoices: [],
                preferredPayment: 'Unknown',
                tier: 'New'
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
          bookings: [],
          invoices: [],
          preferredPayment: 'Unknown',
          tier: 'New'
        };
      }

      const client = clientMap[email];
      if (!client.phone && booking.whatsappNumber) client.phone = booking.whatsappNumber;
      if (!client.lastVisit) client.lastVisit = booking.bookingDate;
      client.bookings.push(booking);
      
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
                totalSpend: 0,
                visitCount: 0,
                lastVisit: '',
                bookings: [],
                invoices: [],
                preferredPayment: 'Invoice',
                password: 'N/A',
                stickers: 0,
                loyaltyProgress: {},
                rewardsRedeemed: 0,
                tier: 'New'
            };
        }
        
        if(clientMap[email]) {
            clientMap[email].invoices.push(inv);
            if (inv.status === 'paid') {
                clientMap[email].totalSpend += inv.total;
            }
        }
    });
    
    Object.keys(clientMap).forEach(email => {
        const client = clientMap[email];
        if(activatedClients[email]) client.password = activatedClients[email];
        
        if (client.totalSpend > 10000) client.tier = 'Diamond';
        else if (client.totalSpend > 5000) client.tier = 'Gold';
        else if (client.totalSpend > 2000) client.tier = 'Silver';
        else if (client.visitCount > 1) client.tier = 'Bronze';
        else client.tier = 'New';
    });

    return Object.values(clientMap).sort((a, b) => {
        if (sortBy === 'spend') return b.totalSpend - a.totalSpend;
        if (sortBy === 'visits') return b.visitCount - a.visitCount;
        if (sortBy === 'last_visit') return new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime();
        return a.name.localeCompare(b.name);
    });
  }, [bookings, invoices, dbClients, activatedClients, sortBy]);

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateNotes = async () => {
      if (!selectedClient || !onUpdateClient) return;
      setIsLoading(true);
      try {
          const clientInDb = dbClients?.find(c => c.email.toLowerCase() === selectedClient.email.toLowerCase());
          const idToUpdate = selectedClient.id || clientInDb?.id;
          if (!idToUpdate) throw new Error("Client ID missing");

          // SANITIZATION: Only send DB-valid fields to prevent "Column not found" errors
          // We remove calculated properties like 'bookings', 'invoices', etc.
          const { 
              totalSpend, visitCount, lastVisit, bookings, invoices, preferredPayment, tier, 
              ...dbSafeClient 
          } = selectedClient;

          await onUpdateClient({ 
              ...dbSafeClient, 
              id: idToUpdate, 
              notes: notesDraft 
          } as Client);
          
          setSelectedClient(prev => prev ? { ...prev, notes: notesDraft } : null);
          setIsEditingNotes(false);
          alert("Notes updated.");
      } catch (err) {
          console.error(err);
          alert("Failed to update notes.");
      } finally {
          setIsLoading(false);
      }
  };

  const handleAddClientSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!onAddClient) return;
      setIsLoading(true);
      try {
          const newClient = {
              name: newClientName,
              email: newClientEmail,
              phone: newClientPhone,
              password: newClientPassword,
              notes: 'Added manually',
              stickers: 0
          };
          await onAddClient(newClient);
          setActivatedClients(prev => ({ ...prev, [newClientEmail.trim().toLowerCase()]: newClientPassword }));
          setIsAddModalOpen(false);
          setNewClientName('');
          setNewClientEmail('');
          setNewClientPhone('');
          setNewClientPassword('');
          alert("Client added successfully!");
      } catch(err) {
          console.error(err);
          alert("Error adding client.");
      } finally {
          setIsLoading(false);
      }
  };

  const handleActivateAccount = async () => {
      if (!selectedClient || !onAddClient || !onUpdateClient) return;
      const pin = prompt("Set a unique PIN for this client's portal access:", "1234");
      if (!pin) return;

      setIsLoading(true);
      try {
          const emailKey = selectedClient.email.trim().toLowerCase();
          const existingDbClient = dbClients?.find(c => c.email.toLowerCase() === emailKey);

          if (existingDbClient && existingDbClient.id) {
              await onUpdateClient({ ...existingDbClient, password: pin });
          } else {
              const newClientData = {
                  name: selectedClient.name,
                  email: selectedClient.email,
                  phone: selectedClient.phone,
                  password: pin,
                  notes: 'Activated from existing history',
                  stickers: 0
              };
              await onAddClient(newClientData);
          }
          
          setActivatedClients(prev => ({ ...prev, [emailKey]: pin }));
          setSelectedClient(prev => prev ? ({ ...prev, password: pin }) : null);
          alert(`Account activated! Client PIN is ${pin}`);
      } catch (error) {
          console.error(error);
          alert("Failed to activate account.");
      } finally {
          setIsLoading(false);
      }
  };

  const updateStickers = async (programId: string, change: number) => {
      const clientInDb = dbClients?.find(c => c.email.toLowerCase() === selectedClient?.email.toLowerCase());
      const idToUpdate = selectedClient?.id || clientInDb?.id;
      
      if (!idToUpdate || !onUpdateClient || !selectedClient) {
           alert("Activate account first to track loyalty points.");
           return;
      }

      const currentProgress = selectedClient.loyaltyProgress || {};
      const currentCount = currentProgress[programId] || (programId === 'legacy' ? selectedClient.stickers || 0 : 0);
      const newCount = Math.max(0, currentCount + change);
      
      const newProgress = { ...currentProgress, [programId]: newCount };

      try {
          // SANITIZATION: Ensure we don't send calculated fields
          const { totalSpend, visitCount, lastVisit, bookings, invoices, preferredPayment, tier, ...dbSafeClient } = selectedClient;

          await onUpdateClient({ 
              ...dbSafeClient,
              id: idToUpdate, 
              loyaltyProgress: newProgress,
              stickers: programId === 'legacy' ? newCount : selectedClient.stickers 
          });
          
          setSelectedClient(prev => prev ? ({ ...prev, loyaltyProgress: newProgress, stickers: programId === 'legacy' ? newCount : prev.stickers }) : null);
      } catch(err) { console.error(err); alert("Failed."); }
  };

  const sendCredentials = (method: 'whatsapp' | 'email') => {
        if (!selectedClient) return;
        const portalLink = window.location.origin;
        const password = (!selectedClient.password || selectedClient.password === 'N/A') ? 'Check with admin' : selectedClient.password;
        const msg = `Hi ${selectedClient.name},\nPortal Login:\nURL: ${portalLink}\nEmail: ${selectedClient.email}\nPIN: ${password}`;
        
        if (method === 'whatsapp') {
            if (!selectedClient.phone) return alert('No phone number on file.');
            const url = `https://wa.me/${selectedClient.phone.replace(/\+/g, '').replace(/\s/g, '')}?text=${encodeURIComponent(msg)}`;
            window.open(url, '_blank');
        } else {
            const subject = 'Your Studio Portal Credentials';
            const url = `mailto:${selectedClient.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(msg)}`;
            window.open(url, '_blank');
        }
  };

  const sendRewardCoupon = (program: LoyaltyProgram) => {
      if (!selectedClient) return;
      const couponCode = `REWARD-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      const msg = `🎉 Congratulations ${selectedClient.name}!\nYou have reached ${program.stickersRequired - 1} stickers!\n\nYour 10th visit is the reward visit! Use code *${couponCode}* to redeem your: ${program.rewardDescription}.\n\nBook your 10th session here: ${window.location.origin}`;
      
      if (!selectedClient.phone) return alert('No phone number on file.');
      const url = `https://wa.me/${selectedClient.phone.replace(/\+/g, '').replace(/\s/g, '')}?text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank');
  };

  const getTierColor = (tier: string) => {
      switch (tier) {
          case 'Diamond': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
          case 'Gold': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
          case 'Silver': return 'bg-gray-100 text-gray-700 border-gray-300';
          case 'Bronze': return 'bg-orange-100 text-orange-700 border-orange-200';
          default: return 'bg-blue-50 text-blue-600 border-blue-100';
      }
  };

  const inputClass = "w-full bg-white border border-admin-dark-border rounded-lg p-2 text-admin-dark-text text-sm outline-none focus:ring-1 focus:ring-admin-dark-primary font-medium transition-all shadow-sm";
  const isActiveAccount = selectedClient && selectedClient.password && selectedClient.password !== 'N/A';
  
  // Logic for showing and adding stickers to specific programs
  const currentProgramForHub = activePrograms.find(p => p.id === selectedLoyaltyProgramId) || activePrograms[0];
  const currentProgramCountForHub = selectedClient?.loyaltyProgress?.[currentProgramForHub?.id] || (currentProgramForHub?.id === 'legacy' ? selectedClient?.stickers : 0) || 0;

  return (
    <div className="h-full flex flex-col bg-admin-dark-bg">
        {viewInvoice && <InvoicePreviewModal invoice={viewInvoice} onClose={() => setViewInvoice(null)} />}
        
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 flex-shrink-0">
            <div className="flex items-center gap-4">
                <h2 className="text-2xl font-black text-admin-dark-text tracking-tight uppercase">CRM Hub</h2>
                <div className="hidden sm:flex items-center gap-2 bg-white/50 p-1 rounded-full border border-gray-200 shadow-sm">
                    {([
                        { id: 'spend', label: 'Top Spend' },
                        { id: 'visits', label: 'Loyal' },
                        { id: 'last_visit', label: 'Recent' },
                        { id: 'name', label: 'A-Z' }
                    ] as const).map(sort => (
                        <button 
                            key={sort.id} 
                            onClick={() => setSortBy(sort.id)}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${sortBy === sort.id ? 'bg-admin-dark-primary text-white shadow-md' : 'text-gray-400 hover:text-gray-700'}`}
                        >
                            {sort.label}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="bg-white border border-gray-200 rounded-xl px-10 py-2.5 text-admin-dark-text text-sm outline-none w-full shadow-sm focus:ring-2 focus:ring-admin-dark-primary/20 transition-all"
                    />
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <button onClick={() => setIsAddModalOpen(true)} className="bg-admin-dark-primary text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold text-sm hover:opacity-90 shadow-lg active:scale-95 transition-all">
                    <PlusIcon className="w-5 h-5" /> <span>Add Client</span>
                </button>
            </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden no-print pb-4">
            <div className={`flex-1 overflow-y-auto custom-scrollbar ${selectedClient ? 'hidden lg:block lg:w-1/3' : 'w-full'}`}>
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                    {filteredClients.map(client => {
                        // Calculate tiny loyalty preview for the first active program
                        const primaryProg = activePrograms[0];
                        const count = client.loyaltyProgress?.[primaryProg?.id] || (primaryProg?.id === 'legacy' ? client.stickers : 0) || 0;
                        const req = primaryProg?.stickersRequired || 10;
                        const isNearingReward = count >= (req - 1);

                        return (
                            <div 
                                key={client.email}
                                onClick={() => { setSelectedClient(client); setNotesDraft(client.notes || ''); setIsEditingNotes(false); }}
                                className={`bg-white border-2 p-4 rounded-2xl shadow-sm cursor-pointer transition-all relative group overflow-hidden ${selectedClient?.email === client.email ? 'border-admin-dark-primary ring-4 ring-admin-dark-primary/10 -translate-y-1' : 'border-white hover:border-admin-dark-primary/30'}`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="bg-gray-100 w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black text-gray-400 group-hover:bg-admin-dark-primary/10 group-hover:text-admin-dark-primary transition-colors">
                                        {client.name.charAt(0)}
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${getTierColor(client.tier)}`}>
                                        {client.tier}
                                    </span>
                                </div>
                                <h3 className="font-bold text-gray-900 truncate text-xs leading-tight">{client.name}</h3>
                                
                                {/* TINY LOYALTY PREVIEW */}
                                {primaryProg && (
                                    <div className="mt-3 mb-2 flex items-center gap-1">
                                        <div className="flex -space-x-1">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <div key={i} className={`w-2 h-2 rounded-full border border-white ${ (count / req * 5) > i ? 'bg-[#ff1493]' : 'bg-gray-100'}`}></div>
                                            ))}
                                        </div>
                                        <span className={`text-[8px] font-black uppercase tracking-tighter ${isNearingReward ? 'text-[#ff1493] animate-pulse' : 'text-gray-300'}`}>
                                            {count}/{req}
                                        </span>
                                        {isNearingReward && <span className="text-[10px]">🎁</span>}
                                    </div>
                                )}

                                <div className="flex justify-between items-center text-[9px] pt-3 border-t border-gray-50">
                                    <div>
                                        <p className="text-gray-400 uppercase font-black tracking-tighter leading-none">Spent</p>
                                        <p className="font-mono font-bold text-green-600">R{client.totalSpend.toFixed(0)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-gray-400 uppercase font-black tracking-tighter leading-none">Visits</p>
                                        <p className="font-bold text-gray-900">{client.visitCount}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {selectedClient && (
                <div className="w-full lg:w-2/3 bg-white border border-gray-200 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-full animate-fade-in">
                    <div className="p-8 border-b border-gray-100 bg-gradient-to-br from-white to-gray-50 flex justify-between items-start">
                        <div className="flex-1">
                            <button onClick={() => setSelectedClient(null)} className="lg:hidden text-gray-400 text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-1">
                                <span>←</span> List
                            </button>
                            <div className="flex items-center gap-4 mb-2">
                                <h2 className="text-3xl font-black text-gray-900 leading-tight">{selectedClient.name}</h2>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm ${getTierColor(selectedClient.tier)}`}>
                                    {selectedClient.tier}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-4 text-xs text-gray-500 font-medium">
                                <span className="flex items-center gap-1.5"><MailIcon className="w-4 h-4 text-blue-400"/> {selectedClient.email}</span>
                                {selectedClient.phone && <span className="flex items-center gap-1.5"><WhatsAppIcon className="w-4 h-4 text-green-500"/> {selectedClient.phone}</span>}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                            <div className="flex gap-2">
                                {activePrograms.length > 0 && (
                                    <button onClick={() => { setSelectedLoyaltyProgramId(activePrograms[0]?.id); setIsLoyaltyPopupOpen(true); }} className="bg-admin-dark-primary text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                                        Loyalty Hub
                                    </button>
                                )}
                                <button onClick={() => { if(window.confirm('Delete client?')) onDeleteClient?.(selectedClient.id); }} className="p-2.5 text-red-300 hover:text-red-500 bg-red-50 rounded-xl">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                         <section className="bg-gray-50 rounded-3xl p-6 border border-gray-100 relative">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-admin-dark-primary"></span> Portal Credentials
                            </h3>
                            <div className="flex justify-between items-center relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">PIN</p>
                                        <div className="font-mono text-lg font-black tracking-widest text-gray-900">
                                            {isActiveAccount ? selectedClient.password : '----'}
                                        </div>
                                    </div>
                                    {!isActiveAccount ? (
                                        <button onClick={handleActivateAccount} disabled={isLoading} className="bg-green-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg">
                                            {isLoading ? 'Wait...' : 'Activate Portal'}
                                        </button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button onClick={() => sendCredentials('whatsapp')} className="bg-[#25D366] text-white p-3 rounded-2xl shadow-md hover:scale-105 transition-transform">
                                                <WhatsAppIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                             <section>
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Session History
                                </h3>
                                <div className="space-y-4">
                                    {selectedClient.bookings.slice(0, 5).map(b => (
                                        <div key={b.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{new Date(b.bookingDate).toLocaleDateString()}</p>
                                            <p className="text-xs font-bold text-gray-800 line-clamp-1 italic">"{b.message}"</p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section>
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> Private Notes
                                </h3>
                                <div className="bg-orange-50 border border-orange-100 rounded-3xl p-6 min-h-[150px] flex flex-col">
                                    {isEditingNotes ? (
                                        <div className="flex flex-col gap-4 flex-1">
                                            <textarea value={notesDraft} onChange={e => setNotesDraft(e.target.value)} className="flex-1 bg-white border border-orange-200 rounded-2xl p-4 text-xs focus:ring-2 focus:ring-orange-200 outline-none resize-none" />
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => setIsEditingNotes(false)} className="text-[10px] font-black uppercase text-gray-400 px-3">Discard</button>
                                                <button onClick={handleUpdateNotes} disabled={isLoading} className="bg-orange-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase">Save</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col flex-1">
                                            <div className="flex-1 text-xs text-gray-600 leading-relaxed italic">
                                                {selectedClient.notes || 'No notes yet.'}
                                            </div>
                                            <button onClick={() => setIsEditingNotes(true)} className="mt-4 self-start text-[10px] font-black uppercase text-orange-600">
                                                <PencilIcon className="w-3.5 h-3.5 inline mr-1" /> Edit Notes
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* UPGRADED LOYALTY HUB MODAL */}
        {isLoyaltyPopupOpen && selectedClient && (
            <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setIsLoyaltyPopupOpen(false)}>
                <div className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in-up border border-gray-100" onClick={e => e.stopPropagation()}>
                    <div className="bg-[#fff0f5] p-8 flex flex-col items-center border-b border-[#f48fb1]/20 relative">
                        <div className="flex items-center gap-6 w-full px-4">
                            <div className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center shadow-lg transform rotate-3 shrink-0">
                                {currentProgramForHub?.iconUrl ? <img src={currentProgramForHub.iconUrl} className="w-14 h-14 object-contain" /> : <span className="text-3xl">✨</span>}
                            </div>
                            <div className="flex-grow">
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#f48fb1] mb-1">Sanctuary Rewards Manager</p>
                                <select 
                                    value={selectedLoyaltyProgramId} 
                                    onChange={(e) => setSelectedLoyaltyProgramId(e.target.value)} 
                                    className="bg-transparent text-[#4e342e] font-black text-xl outline-none cursor-pointer border-b-2 border-[#f48fb1]/30 uppercase tracking-tighter w-full py-1"
                                >
                                    {activePrograms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <button onClick={() => setIsLoyaltyPopupOpen(false)} className="absolute top-6 right-6 text-[#f48fb1] hover:text-[#ff1493] transition-colors text-2xl font-bold">&times;</button>
                    </div>

                    <div className="p-10">
                        {currentProgramForHub ? (
                            <>
                                <div className="flex justify-between items-center mb-6">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Collector's Progress</h4>
                                    <div className="text-lg font-black text-[#ff1493]">{currentProgramCountForHub} / {currentProgramForHub.stickersRequired}</div>
                                </div>
                                <div className="grid grid-cols-5 gap-3 mb-10">
                                    {Array.from({ length: currentProgramForHub.stickersRequired }).map((_, i) => {
                                        const isFilled = i < currentProgramCountForHub;
                                        return (
                                            <div key={i} className={`aspect-square rounded-2xl border-2 flex items-center justify-center transition-all duration-500 relative ${isFilled ? 'bg-[#ff1493] border-[#ff1493] shadow-lg shadow-[#ff1493]/30 scale-105' : 'bg-gray-50 border-gray-100'}`}>
                                                {isFilled ? <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> : <span className="text-[10px] font-black text-gray-300">{i + 1}</span>}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* REWARD LOGIC: 9th visit triggers coupon */}
                                {currentProgramCountForHub === currentProgramForHub.stickersRequired - 1 ? (
                                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-3xl p-6 text-center mb-6 animate-pulse">
                                        <p className="text-xs font-black uppercase text-yellow-800 mb-4">🎉 Collector Milestone Reached!</p>
                                        <button 
                                            onClick={() => sendRewardCoupon(currentProgramForHub)}
                                            className="w-full bg-yellow-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 hover:bg-yellow-600"
                                        >
                                            <WhatsAppIcon className="w-4 h-4" /> Send Reward Notification
                                        </button>
                                    </div>
                                ) : null}

                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <button onClick={() => updateStickers(currentProgramForHub.id, -1)} className="bg-gray-100 text-gray-400 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black hover:bg-red-50 hover:text-red-400 transition-all border border-transparent hover:border-red-100 shadow-inner">－</button>
                                        <button onClick={() => updateStickers(currentProgramForHub.id, 1)} className="flex-1 bg-[#4e342e] text-white rounded-3xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest shadow-xl shadow-[#4e342e]/20 hover:bg-black active:scale-95 transition-all">Add Stamp</button>
                                    </div>
                                    {currentProgramCountForHub >= currentProgramForHub.stickersRequired && (
                                        <button onClick={() => { if(window.confirm('Redeem reward and reset stamps for this program?')) updateStickers(currentProgramForHub.id, -currentProgramForHub.stickersRequired); }} className="w-full bg-[#ff1493] text-white py-5 rounded-3xl font-black uppercase tracking-widest shadow-2xl shadow-[#ff1493]/40 active:scale-95 transition-all">Redeem Reward</button>
                                    )}
                                </div>
                                <div className="mt-8 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                    <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">Active Reward</p>
                                    <p className="text-sm font-bold text-gray-700 leading-tight">{currentProgramForHub.rewardDescription}</p>
                                </div>
                            </>
                        ) : (
                            <p className="text-center text-gray-400 italic py-10">No active programs available.</p>
                        )}
                    </div>
                </div>
            </div>
        )}

        {isAddModalOpen && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}>
                <div className="bg-white rounded-[2rem] p-10 w-full max-w-md shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
                    <div className="text-center mb-8"><h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">New Profile</h3></div>
                    <form onSubmit={handleAddClientSubmit} className="space-y-4">
                        <input className={inputClass} value={newClientName} onChange={e => setNewClientName(e.target.value)} placeholder="Full Name" required />
                        <input type="email" className={inputClass} value={newClientEmail} onChange={e => setNewClientEmail(e.target.value)} placeholder="Email" required />
                        <input className={inputClass} value={newClientPhone} onChange={e => setNewClientPhone(e.target.value)} placeholder="Phone" />
                        <input className={`${inputClass} text-center text-lg`} value={newClientPassword} onChange={e => setNewClientPassword(e.target.value)} required maxLength={6} placeholder="Portal PIN (e.g. 1234)" />
                        <div className="flex justify-end gap-3 pt-6">
                            <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-xs font-black uppercase text-gray-400 px-4">Cancel</button>
                            <button type="submit" disabled={isLoading} className="bg-admin-dark-primary text-white px-8 py-3.5 rounded-2xl font-black uppercase shadow-xl transition-all text-xs">{isLoading ? 'Wait...' : 'Create'}</button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};

export default ClientsManager;
