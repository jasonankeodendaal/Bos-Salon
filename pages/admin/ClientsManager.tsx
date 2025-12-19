
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

  // New Client Form State
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientPassword, setNewClientPassword] = useState('');

  const activePrograms = loyaltyPrograms.length > 0 ? loyaltyPrograms.filter(p => p.active) : [
      { id: 'legacy', name: 'Default Loyalty', stickersRequired: 10, rewardDescription: '50% Off', active: true }
  ];

  const clients = useMemo(() => {
    const clientMap: Record<string, ClientProfile> = {};

    // 1. Load DB Clients
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

    // 2. Process Bookings
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
    
    // 3. Process Invoices
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
    
    // 4. Determine Tiers & Force Sync
    Object.keys(clientMap).forEach(email => {
        const client = clientMap[email];
        if(activatedClients[email]) client.password = activatedClients[email];
        
        // Tier Logic
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

          await onUpdateClient({ 
              ...selectedClient, 
              id: idToUpdate, 
              notes: notesDraft 
          });
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
              notes: 'Added manually via Client Manager',
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
                  notes: 'Activated from existing booking history',
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
          await onUpdateClient({ 
              id: idToUpdate, 
              name: selectedClient.name, 
              email: selectedClient.email, 
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
  const currentProgram = activePrograms.find(p => p.id === selectedLoyaltyProgramId) || activePrograms[0];
  const currentProgramCount = selectedClient?.loyaltyProgress?.[currentProgram?.id] || (currentProgram?.id === 'legacy' ? selectedClient?.stickers : 0) || 0;

  return (
    <div className="h-full flex flex-col bg-admin-dark-bg">
        {viewInvoice && <InvoicePreviewModal invoice={viewInvoice} onClose={() => setViewInvoice(null)} />}
        
        {/* CRM Dashboard Header */}
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
                        placeholder="Search by name or email..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="bg-white border border-gray-200 rounded-xl px-10 py-2.5 text-admin-dark-text text-sm outline-none w-full shadow-sm focus:ring-2 focus:ring-admin-dark-primary/20 transition-all"
                    />
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <button onClick={() => setIsAddModalOpen(true)} className="bg-admin-dark-primary text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold text-sm hover:opacity-90 shadow-lg shadow-admin-dark-primary/20 whitespace-nowrap active:scale-95 transition-all">
                    <PlusIcon className="w-5 h-5" /> <span>Add Client</span>
                </button>
            </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden no-print pb-4">
            {/* Grid List View */}
            <div className={`flex-1 overflow-y-auto custom-scrollbar ${selectedClient ? 'hidden lg:block lg:w-1/3' : 'w-full'}`}>
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                    {filteredClients.map(client => (
                        <div 
                            key={client.email}
                            onClick={() => { setSelectedClient(client); setNotesDraft(client.notes || ''); setIsEditingNotes(false); }}
                            className={`bg-white border-2 p-4 rounded-2xl shadow-sm cursor-pointer transition-all relative group overflow-hidden ${selectedClient?.email === client.email ? 'border-admin-dark-primary ring-4 ring-admin-dark-primary/10 -translate-y-1' : 'border-white hover:border-admin-dark-primary/30'}`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="bg-gray-100 w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black text-gray-400 group-hover:bg-admin-dark-primary/10 group-hover:text-admin-dark-primary transition-colors">
                                    {client.name.charAt(0)}
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getTierColor(client.tier)}`}>
                                    {client.tier}
                                </span>
                            </div>
                            <h3 className="font-bold text-gray-900 truncate text-sm leading-tight">{client.name}</h3>
                            <p className="text-[10px] text-gray-400 truncate mb-4">{client.email}</p>
                            
                            <div className="flex justify-between items-center text-[10px] pt-3 border-t border-gray-50">
                                <div>
                                    <p className="text-gray-400 uppercase font-black tracking-tighter">Lifetime</p>
                                    <p className="font-mono font-bold text-green-600">R{client.totalSpend.toFixed(0)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-400 uppercase font-black tracking-tighter">Visits</p>
                                    <p className="font-bold text-gray-900">{client.visitCount}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredClients.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-white/50 border-2 border-dashed border-gray-200 rounded-3xl">
                            <IconClients className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No collectors found.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Premium Client Detail Panel */}
            {selectedClient && (
                <div className="w-full lg:w-2/3 bg-white border border-gray-200 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-full animate-fade-in">
                    {/* Panel Header */}
                    <div className="p-8 border-b border-gray-100 bg-gradient-to-br from-white to-gray-50 flex justify-between items-start">
                        <div className="flex-1">
                            <button onClick={() => setSelectedClient(null)} className="lg:hidden text-gray-400 text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-1 hover:text-admin-dark-primary transition-colors">
                                <span>←</span> Collector List
                            </button>
                            <div className="flex items-center gap-4 mb-2">
                                <h2 className="text-3xl font-black text-gray-900 leading-tight">{selectedClient.name}</h2>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm ${getTierColor(selectedClient.tier)}`}>
                                    {selectedClient.tier} Tier
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-4 text-xs text-gray-500 font-medium">
                                <span className="flex items-center gap-1.5"><MailIcon className="w-4 h-4 text-blue-400"/> {selectedClient.email}</span>
                                {selectedClient.phone && <span className="flex items-center gap-1.5"><WhatsAppIcon className="w-4 h-4 text-green-500"/> {selectedClient.phone}</span>}
                                <span className="flex items-center gap-1.5"><CalendarIcon className="w-4 h-4 text-purple-400"/> Last Seen: {selectedClient.lastVisit ? new Date(selectedClient.lastVisit).toLocaleDateString() : 'Never'}</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                            <div className="flex gap-2">
                                <button onClick={() => { setSelectedLoyaltyProgramId(activePrograms[0]?.id); setIsLoyaltyPopupOpen(true); }} className="bg-admin-dark-primary text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-admin-dark-primary/20 hover:scale-105 transition-transform active:scale-95">
                                    Loyalty
                                </button>
                                <button onClick={() => { if(window.confirm('Delete this client profile?')) onDeleteClient?.(selectedClient.id); }} className="p-2.5 text-red-300 hover:text-red-500 transition-colors bg-red-50 rounded-xl hover:bg-red-100">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-tighter mt-2">Client ID: {selectedClient.id?.slice(0,8)}</p>
                        </div>
                    </div>

                    {/* Stats Ribbon */}
                    <div className="grid grid-cols-2 md:grid-cols-4 bg-gray-900 text-white divide-x divide-white/5">
                         <div className="p-4 text-center">
                             <p className="text-[9px] font-black text-gray-500 uppercase mb-1">Total Spent</p>
                             <p className="text-lg font-black text-green-400">R {selectedClient.totalSpend.toFixed(0)}</p>
                         </div>
                         <div className="p-4 text-center">
                             <p className="text-[9px] font-black text-gray-500 uppercase mb-1">Total Visits</p>
                             <p className="text-lg font-black text-cyan-400">{selectedClient.visitCount}</p>
                         </div>
                         <div className="p-4 text-center">
                             <p className="text-[9px] font-black text-gray-500 uppercase mb-1">Avg per Visit</p>
                             <p className="text-lg font-black text-purple-400">R {selectedClient.visitCount > 0 ? (selectedClient.totalSpend / selectedClient.visitCount).toFixed(0) : '0'}</p>
                         </div>
                         <div className="p-4 text-center">
                             <p className="text-[9px] font-black text-gray-500 uppercase mb-1">Account</p>
                             <p className={`text-lg font-black ${isActiveAccount ? 'text-green-500' : 'text-gray-600'}`}>{isActiveAccount ? 'Active' : 'Inactive'}</p>
                         </div>
                    </div>

                    {/* Panel Content */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                        
                        {/* Credentials & Access Box */}
                        <section className="bg-gray-50 rounded-3xl p-6 border border-gray-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <IconClients className="w-32 h-32" />
                            </div>
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-admin-dark-primary"></span> Portal Access & Security
                            </h3>
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-6 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Access PIN</p>
                                        <div className="font-mono text-lg font-black tracking-widest text-gray-900">
                                            {isActiveAccount ? selectedClient.password : '----'}
                                        </div>
                                    </div>
                                    {!isActiveAccount ? (
                                        <button onClick={handleActivateAccount} disabled={isLoading} className="bg-green-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-green-600/20 hover:scale-105 transition-all">
                                            {isLoading ? 'Wait...' : 'Activate Portal'}
                                        </button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button onClick={() => sendCredentials('whatsapp')} className="bg-[#25D366] text-white p-3 rounded-2xl shadow-md hover:scale-105 transition-transform" title="WhatsApp credentials">
                                                <WhatsAppIcon className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => sendCredentials('email')} className="bg-gray-800 text-white p-3 rounded-2xl shadow-md hover:scale-105 transition-transform" title="Email credentials">
                                                <MailIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="text-right">
                                     <p className="text-[10px] text-gray-400 font-medium italic">Clients can use their email and PIN <br/> to log in to the Client Portal.</p>
                                </div>
                            </div>
                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {/* The "Journey" Timeline */}
                            <section>
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> The Beauty Journey
                                </h3>
                                <div className="space-y-6 relative before:absolute before:left-6 before:top-0 before:bottom-0 before:w-0.5 before:bg-gray-100">
                                    {selectedClient.bookings.length > 0 ? selectedClient.bookings.slice(0, 10).map((b, idx) => (
                                        <div key={b.id} className="relative pl-12">
                                            <div className={`absolute left-[1.15rem] top-1 w-3 h-3 rounded-full border-4 border-white shadow-sm ring-1 ring-gray-100 ${b.status === 'completed' ? 'bg-green-500' : 'bg-yellow-400'}`}></div>
                                            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                                <div className="flex justify-between items-start mb-1">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(b.bookingDate).toLocaleDateString(undefined, {month: 'short', day:'numeric', year:'numeric'})}</p>
                                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${b.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{b.status}</span>
                                                </div>
                                                <p className="text-xs font-bold text-gray-800 line-clamp-2 italic">"{b.message}"</p>
                                                {b.totalCost && <p className="text-[10px] font-black text-admin-dark-primary mt-2 uppercase tracking-tighter">Invested: R {b.totalCost}</p>}
                                            </div>
                                        </div>
                                    )) : <p className="text-xs text-gray-400 italic pl-12">No sessions logged yet.</p>}
                                </div>
                            </section>

                            {/* Internal Collector Notes */}
                            <section>
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> Studio Notes
                                </h3>
                                <div className="bg-orange-50 border border-orange-100 rounded-3xl p-6 min-h-[200px] flex flex-col">
                                    {isEditingNotes ? (
                                        <div className="flex flex-col gap-4 flex-1">
                                            <textarea 
                                                value={notesDraft}
                                                onChange={e => setNotesDraft(e.target.value)}
                                                className="flex-1 bg-white border border-orange-200 rounded-2xl p-4 text-xs font-medium text-gray-700 focus:ring-2 focus:ring-orange-200 outline-none resize-none"
                                                placeholder="Add skin type, ink preferences, or aftercare habits..."
                                            />
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => setIsEditingNotes(false)} className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-3 py-2">Discard</button>
                                                <button onClick={handleUpdateNotes} disabled={isLoading} className="bg-orange-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md">
                                                    {isLoading ? 'Saving...' : 'Save Notes'}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col flex-1">
                                            <div className="flex-1 text-xs text-gray-600 leading-relaxed italic whitespace-pre-wrap">
                                                {selectedClient.notes || 'No private notes on this collector. Add details about their style or skin type.'}
                                            </div>
                                            <button onClick={() => setIsEditingNotes(true)} className="mt-6 self-start flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-orange-600 hover:text-orange-700">
                                                <PencilIcon className="w-3.5 h-3.5" /> Edit Profile Notes
                                            </button>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="mt-8">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Financial Documents</h4>
                                    <div className="space-y-2">
                                        {selectedClient.invoices.length > 0 ? selectedClient.invoices.slice(0, 5).map(inv => (
                                            <div key={inv.id} onClick={() => setViewInvoice(inv)} className="flex justify-between items-center bg-white border border-gray-100 p-3 rounded-xl cursor-pointer hover:bg-gray-50 transition-all group">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-[8px] group-hover:bg-admin-dark-primary group-hover:text-white transition-colors">DOC</div>
                                                    <div><p className="text-xs font-black text-gray-900">{inv.number}</p><p className="text-[9px] text-gray-400 uppercase">{new Date(inv.dateIssued).toLocaleDateString()}</p></div>
                                                </div>
                                                <p className="font-mono font-bold text-xs text-gray-900">R {inv.total.toFixed(2)}</p>
                                            </div>
                                        )) : <p className="text-xs text-gray-400 italic">No invoices found.</p>}
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* High-Fidelity Loyalty Upgrade */}
        {isLoyaltyPopupOpen && selectedClient && currentProgram && (
            <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setIsLoyaltyPopupOpen(false)}>
                <div className="bg-white rounded-[3rem] w-full max-w-sm overflow-hidden shadow-2xl animate-fade-in-up border border-gray-100" onClick={e => e.stopPropagation()}>
                    {/* Header with soft brand styling */}
                    <div className="bg-[#fff0f5] p-8 flex flex-col items-center border-b border-[#f48fb1]/20">
                        <div className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center shadow-lg mb-6 border border-[#f48fb1]/10 transform rotate-3">
                            {currentProgram.iconUrl ? (
                                <img src={currentProgram.iconUrl} alt="Program Icon" className="w-14 h-14 object-contain" />
                            ) : (
                                <span className="text-3xl">✨</span>
                            )}
                        </div>
                        <div className="text-center w-full relative">
                            <select 
                                value={selectedLoyaltyProgramId} 
                                onChange={(e) => setSelectedLoyaltyProgramId(e.target.value)}
                                className="bg-transparent text-[#4e342e] font-black text-xl outline-none cursor-pointer text-center appearance-none pr-4 border-b border-[#f48fb1]/30 uppercase tracking-tighter focus:border-[#ff1493] transition-colors"
                            >
                                {activePrograms.map(p => <option key={p.id} value={p.id} className="text-black font-sans">{p.name}</option>)}
                            </select>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#f48fb1] mt-3">Studio Stamp Card</p>
                        </div>
                        <button onClick={() => setIsLoyaltyPopupOpen(false)} className="absolute top-6 right-6 text-[#f48fb1] hover:text-[#ff1493] transition-colors">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>

                    <div className="p-10">
                        {/* THE STAMP GRID */}
                        <div className="grid grid-cols-5 gap-3 mb-10">
                            {Array.from({ length: currentProgram.stickersRequired }).map((_, i) => {
                                const isFilled = i < currentProgramCount;
                                return (
                                    <div 
                                        key={i} 
                                        className={`aspect-square rounded-2xl border-2 flex items-center justify-center transition-all duration-500 relative group
                                            ${isFilled 
                                                ? 'bg-[#ff1493] border-[#ff1493] shadow-lg shadow-[#ff1493]/30 scale-105' 
                                                : 'bg-gray-50 border-gray-100 grayscale'
                                            }`}
                                    >
                                        {isFilled ? (
                                            <svg className="w-6 h-6 text-white animate-fade-in" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            <span className="text-[10px] font-black text-gray-300">{i + 1}</span>
                                        )}
                                        {/* Subtle overlay effect */}
                                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity"></div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Status & Reward Information */}
                        <div className="text-center space-y-2 mb-10">
                            <div className="flex justify-between items-end border-b border-gray-50 pb-2 mb-2">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Target Benefit</p>
                                <p className="text-sm font-black text-[#ff1493]">{currentProgram.rewardDescription}</p>
                            </div>
                            <div className="flex justify-between items-end">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Progress</p>
                                <p className="text-lg font-black text-[#4e342e]">{currentProgramCount} <span className="text-gray-300 font-medium">/ {currentProgram.stickersRequired}</span></p>
                            </div>
                        </div>
                        
                        {/* Action Area */}
                        {currentProgramCount >= currentProgram.stickersRequired ? (
                            <button 
                                onClick={() => { if(window.confirm('Redeem reward? Stickers will reset.')) updateStickers(currentProgram.id, -currentProgram.stickersRequired); }} 
                                className="w-full bg-[#ff1493] text-white py-5 rounded-3xl font-black uppercase tracking-widest animate-subtle-glow shadow-2xl shadow-[#ff1493]/40 active:scale-95 transition-all"
                            >
                                Redeem Collection
                            </button>
                        ) : (
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => updateStickers(currentProgram.id, -1)} 
                                    className="bg-gray-100 text-gray-400 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black hover:bg-red-50 hover:text-red-400 transition-all border border-transparent hover:border-red-100 shadow-inner"
                                >
                                    －
                                </button>
                                <button 
                                    onClick={() => updateStickers(currentProgram.id, 1)} 
                                    className="flex-1 bg-[#4e342e] text-white rounded-3xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest shadow-xl shadow-[#4e342e]/20 hover:bg-black active:scale-95 transition-all"
                                >
                                    Add Sticker
                                </button>
                            </div>
                        )}
                        
                        <p className="text-center text-[9px] font-bold text-gray-300 uppercase tracking-widest mt-8">Stamps reflect completed sessions</p>
                    </div>
                </div>
            </div>
        )}

        {/* Premium Add Modal */}
        {isAddModalOpen && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}>
                <div className="bg-white rounded-[2rem] p-10 w-full max-w-md shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
                    <div className="text-center mb-8">
                        <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">New Profile</h3>
                        <p className="text-xs text-gray-400 font-medium">Create a digital profile for this collector.</p>
                    </div>
                    <form onSubmit={handleAddClientSubmit} className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block ml-1">Full Name</label>
                            <input className={inputClass} value={newClientName} onChange={e => setNewClientName(e.target.value)} required />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block ml-1">Email Address</label>
                            <input type="email" className={inputClass} value={newClientEmail} onChange={e => setNewClientEmail(e.target.value)} required />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block ml-1">WhatsApp Tel</label>
                            <input className={inputClass} value={newClientPhone} onChange={e => setNewClientPhone(e.target.value)} />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block ml-1">Portal Login PIN</label>
                            <input className={`${inputClass} tracking-widest text-center text-lg`} value={newClientPassword} onChange={e => setNewClientPassword(e.target.value)} required maxLength={6} placeholder="••••" />
                        </div>
                        <div className="flex justify-end gap-3 pt-6">
                            <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-xs font-black uppercase tracking-widest text-gray-400 px-4">Cancel</button>
                            <button type="submit" disabled={isLoading} className="bg-admin-dark-primary text-white px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-admin-dark-primary/20 disabled:opacity-50 hover:scale-105 active:scale-95 transition-all text-xs">
                                {isLoading ? 'Processing...' : 'Create Collector'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};

export default ClientsManager;
