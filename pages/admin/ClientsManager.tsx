
import React, { useState, useMemo } from 'react';
import { Booking, Invoice, Client, LoyaltyProgram } from '../../App';
import WhatsAppIcon from '../../components/icons/WhatsAppIcon';
import PlusIcon from '../../components/icons/PlusIcon';
import TrashIcon from '../../components/icons/TrashIcon';

const IconClients = ({ className = 'w-6 h-6' }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const MailIcon = ({ className = 'w-5 h-5' }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;

interface ClientProfile {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  totalSpend: number;
  visitCount: number;
  lastVisit: string;
  bookings: Booking[];
  invoices: Invoice[];
  preferredPayment: string;
  password?: string;
  stickers?: number;
  loyaltyProgress?: Record<string, number>;
  rewardsRedeemed?: number;
}

// ... (InvoicePreviewModal remains unchanged) ...
const InvoicePreviewModal: React.FC<{ invoice: Invoice, onClose: () => void }> = ({ invoice, onClose }) => {
    // ... (Existing implementation) ...
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
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoyaltyPopupOpen, setIsLoyaltyPopupOpen] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLoyaltyProgramId, setSelectedLoyaltyProgramId] = useState<string>(''); // For dropdown in popup
  
  // Local state to force refresh for recently activated clients
  const [activatedClients, setActivatedClients] = useState<Record<string, string>>({});

  // New Client Form State
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientPassword, setNewClientPassword] = useState('');

  // Fallback for empty programs list
  const activePrograms = loyaltyPrograms.length > 0 ? loyaltyPrograms.filter(p => p.active) : [
      { id: 'legacy', name: 'Default Loyalty', stickersRequired: 10, rewardDescription: '50% Off', active: true }
  ];

  // ... (useMemo for clients logic unchanged) ...
  const clients = useMemo(() => {
    const clientMap: Record<string, ClientProfile> = {};

    // 1. Load DB Clients
    if (dbClients) {
        dbClients.forEach(c => {
            const email = c.email.trim().toLowerCase();
            clientMap[email] = {
                id: c.id,
                name: c.name,
                email: email,
                phone: c.phone,
                totalSpend: 0,
                visitCount: 0,
                lastVisit: '',
                bookings: [],
                invoices: [],
                preferredPayment: 'Unknown',
                password: c.password,
                stickers: c.stickers || 0,
                loyaltyProgress: c.loyaltyProgress || {},
                rewardsRedeemed: c.rewardsRedeemed || 0
            };
        });
    }

    // 2. Process Bookings
    bookings.forEach(booking => {
      const email = booking.email.trim().toLowerCase();
      if (!email) return;

      if (!clientMap[email]) {
        clientMap[email] = {
          name: booking.name,
          email: email,
          phone: booking.whatsappNumber,
          totalSpend: 0,
          visitCount: 0,
          lastVisit: booking.bookingDate,
          bookings: [],
          invoices: [],
          preferredPayment: 'Unknown',
          password: 'N/A', 
          stickers: 0,
          loyaltyProgress: {},
          rewardsRedeemed: 0
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
                rewardsRedeemed: 0
            };
        }
        
        if(clientMap[email]) {
            clientMap[email].invoices.push(inv);
            if (inv.status === 'paid') {
                clientMap[email].totalSpend += inv.total;
            }
        }
    });
    
    // 4. Force Update
    Object.keys(activatedClients).forEach(email => {
        if(clientMap[email]) {
            clientMap[email].password = activatedClients[email];
        }
    });

    return Object.values(clientMap).sort((a, b) => b.totalSpend - a.totalSpend);
  }, [bookings, invoices, dbClients, activatedClients]);

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      
      const pin = prompt("Set a PIN:", "1234");
      if (!pin) return;

      setIsLoading(true);
      try {
          const emailKey = selectedClient.email.trim().toLowerCase();
          const existingDbClient = dbClients?.find(c => c.email.toLowerCase() === emailKey);

          if (existingDbClient && existingDbClient.id) {
              await onUpdateClient({ ...existingDbClient, password: pin });
          } else {
              // Creating a new client record from booking history
              // Generate ID locally so we don't have to wait for refresh to know it exists
              const newId = crypto.randomUUID(); 
              const newClientData = {
                  id: newId,
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
          // Optimistic update of local state
          setSelectedClient(prev => prev ? ({ ...prev, password: pin }) : null);
          alert(`Account activated! PIN: ${pin}`);
      } catch (error) {
          console.error(error);
          alert("Failed to activate account. Check console.");
      } finally {
          setIsLoading(false);
      }
  };

  const handleEditPin = async () => {
      if (!selectedClient || !onUpdateClient) return;
      const clientInDb = dbClients?.find(c => c.email.toLowerCase() === selectedClient.email.toLowerCase());
      const idToUpdate = selectedClient.id || clientInDb?.id;
      
      if (!idToUpdate) {
          alert("Account not fully synced yet. Try reloading.");
          return;
      }

      const newPin = prompt("Enter new PIN:", selectedClient.password);
      if (!newPin || newPin === selectedClient.password) return;
      
      try {
          await onUpdateClient({ id: idToUpdate, name: selectedClient.name, email: selectedClient.email, password: newPin });
          const emailKey = selectedClient.email.trim().toLowerCase();
          setActivatedClients(prev => ({ ...prev, [emailKey]: newPin }));
          setSelectedClient(prev => prev ? ({ ...prev, password: newPin }) : null);
          alert("PIN Updated.");
      } catch (error) { console.error(error); alert("Failed."); }
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
              // Keep legacy field synced if it's the main/legacy program
              stickers: programId === 'legacy' ? newCount : selectedClient.stickers 
          });
          
          setSelectedClient(prev => prev ? ({ ...prev, loyaltyProgress: newProgress, stickers: programId === 'legacy' ? newCount : prev.stickers }) : null);
      } catch(err) { console.error(err); alert("Failed."); }
  };

  const redeemReward = async (programId: string) => {
      const clientInDb = dbClients?.find(c => c.email.toLowerCase() === selectedClient?.email.toLowerCase());
      const idToUpdate = selectedClient?.id || clientInDb?.id;
      
      if (!idToUpdate || !onUpdateClient || !selectedClient) return;
      
      if(!window.confirm(`Redeem reward for ${selectedClient.name}?`)) return;
      
      try {
          const rewardsCount = (selectedClient.rewardsRedeemed || 0) + 1;
          const currentProgress = selectedClient.loyaltyProgress || {};
          const newProgress = { ...currentProgress, [programId]: 0 };

          await onUpdateClient({ 
              id: idToUpdate, 
              name: selectedClient.name, 
              email: selectedClient.email, 
              loyaltyProgress: newProgress,
              stickers: programId === 'legacy' ? 0 : selectedClient.stickers,
              rewardsRedeemed: rewardsCount 
          });
          
          setSelectedClient(prev => prev ? ({ ...prev, loyaltyProgress: newProgress, stickers: programId === 'legacy' ? 0 : prev.stickers, rewardsRedeemed: rewardsCount }) : null);
          alert("Reward Redeemed!");
      } catch(err) { console.error(err); alert("Failed."); }
  };

  const handleDeleteClient = async () => {
      if (!selectedClient || !onDeleteClient) return;
      if (!window.confirm(`Are you sure you want to delete ${selectedClient.name}? This cannot be undone.`)) return;
      
      const clientInDb = dbClients?.find(c => c.email.toLowerCase() === selectedClient.email.toLowerCase());
      const idToDelete = selectedClient.id || clientInDb?.id;

      if (!idToDelete) {
          alert("Cannot delete client. ID not found.");
          return;
      }

      try {
          await onDeleteClient(idToDelete);
          setSelectedClient(null);
          alert("Client deleted successfully.");
      } catch (err) {
          console.error(err);
          alert("Failed to delete client.");
      }
  };

  const sendCredentials = (method: 'whatsapp' | 'email') => {
        if (!selectedClient) return;
        const portalLink = window.location.origin;
        const password = (!selectedClient.password || selectedClient.password === 'N/A') ? 'Ask Admin' : selectedClient.password;
        const msg = `Hi ${selectedClient.name},\nPortal Login:\nURL: ${portalLink}\nEmail: ${selectedClient.email}\nPIN: ${password}`;
        
        if (method === 'whatsapp') {
            if (!selectedClient.phone) return alert('No phone number on file.');
            const url = `https://wa.me/${selectedClient.phone.replace(/\+/g, '').replace(/\s/g, '')}?text=${encodeURIComponent(msg)}`;
            window.open(url, '_blank');
        } else {
            const subject = 'Your Credentials';
            const url = `mailto:${selectedClient.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(msg)}`;
            window.open(url, '_blank');
        }
  };

  const inputClass = "w-full bg-white border border-admin-dark-border rounded-lg p-2 text-admin-dark-text text-sm outline-none focus:ring-1 focus:ring-admin-dark-primary font-medium";
  const isActiveAccount = selectedClient && selectedClient.password && selectedClient.password !== 'N/A';

  // Helper to open loyalty modal pre-selected
  const openLoyaltyFor = (progId: string) => {
      setSelectedLoyaltyProgramId(progId);
      setIsLoyaltyPopupOpen(true);
  };

  // Current Program for Modal
  const currentProgram = activePrograms.find(p => p.id === selectedLoyaltyProgramId) || activePrograms[0];
  const currentProgramCount = selectedClient?.loyaltyProgress?.[currentProgram?.id] || (currentProgram?.id === 'legacy' ? selectedClient?.stickers : 0) || 0;

  // --- RENDER ---
  return (
    <div className="h-full flex flex-col">
        {viewInvoice && <InvoicePreviewModal invoice={viewInvoice} onClose={() => setViewInvoice(null)} />}
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 sm:mb-6 flex-shrink-0 no-print">
            <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-admin-dark-text">Clients</h2>
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
                <input 
                    type="text" 
                    placeholder="Search..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="bg-white border border-admin-dark-border rounded-lg p-2 text-admin-dark-text text-xs sm:text-sm outline-none w-full sm:w-64"
                />
                <button onClick={() => setIsAddModalOpen(true)} className="bg-admin-dark-primary text-white px-3 py-2 rounded-lg flex items-center gap-1 font-bold text-xs hover:opacity-90 whitespace-nowrap">
                    <PlusIcon className="w-4 h-4" /> Add
                </button>
            </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden no-print">
            {/* Grid List View - 3 Cols Mobile */}
            <div className={`flex-1 overflow-y-auto ${selectedClient ? 'hidden lg:block lg:w-1/3' : 'w-full'}`}>
                <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-4 pb-20">
                    {filteredClients.map(client => (
                        <div 
                            key={client.email}
                            onClick={() => setSelectedClient(client)}
                            className={`bg-white border p-2 sm:p-4 rounded-lg shadow-sm cursor-pointer hover:border-admin-dark-primary/50 transition-all ${selectedClient?.email === client.email ? 'border-admin-dark-primary ring-1 ring-admin-dark-primary' : 'border-gray-200'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="bg-gray-100 w-6 h-6 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-lg font-bold text-gray-600">
                                    {client.name.charAt(0)}
                                </div>
                                <div className="text-right">
                                    {/* Show checkmark if active */}
                                    {client.password && client.password !== 'N/A' && (
                                        <span className="block text-[8px] text-green-600 font-bold mb-1">
                                            ✔
                                        </span>
                                    )}
                                </div>
                            </div>
                            <h3 className="font-bold text-gray-800 truncate text-[10px] sm:text-sm">{client.name}</h3>
                            <p className="text-[9px] sm:text-xs text-gray-500 truncate mb-2">{client.email}</p>
                            
                            <div className="flex justify-between items-center text-[9px] sm:text-xs pt-2 border-t border-gray-100">
                                <span className="text-gray-400">Spent</span>
                                <span className="font-mono font-bold text-green-600">R{client.totalSpend.toFixed(0)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Detail View (Right Panel) */}
            {selectedClient && (
                <div className="w-full lg:w-2/3 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-y-auto flex flex-col h-full animate-fade-in">
                    {/* Header */}
                    <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-start">
                        <div>
                            <button onClick={() => setSelectedClient(null)} className="lg:hidden text-gray-400 text-xs mb-2">← Back</button>
                            <h2 className="text-xl sm:text-3xl font-bold text-gray-800">{selectedClient.name}</h2>
                            <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-600">
                                <span className="flex items-center gap-1"><MailIcon className="w-3 h-3"/> {selectedClient.email}</span>
                                {selectedClient.phone && <span className="flex items-center gap-1"><WhatsAppIcon className="w-3 h-3 text-green-500"/> {selectedClient.phone}</span>}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                            <button onClick={() => { setSelectedLoyaltyProgramId(activePrograms[0]?.id); setIsLoyaltyPopupOpen(true); }} className="bg-brand-green text-white px-3 py-1.5 rounded text-xs font-bold shadow-sm">
                                Loyalty Cards
                            </button>
                            {selectedClient.id && (
                                <button onClick={handleDeleteClient} className="text-red-500 hover:text-red-700 flex items-center gap-1 text-[10px] font-bold">
                                    <TrashIcon className="w-3 h-3" /> Delete Client
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-6 space-y-6">
                        {/* LOYALTY CARD MINI VIEWS */}
                        {isActiveAccount && (
                            <div className="flex gap-4 overflow-x-auto pb-2">
                                {activePrograms.map(prog => {
                                    const count = selectedClient.loyaltyProgress?.[prog.id] || (prog.id === 'legacy' ? selectedClient.stickers : 0) || 0;
                                    return (
                                        <div key={prog.id} onClick={() => openLoyaltyFor(prog.id)} className="bg-gray-800 rounded-xl p-3 text-white shadow-md relative overflow-hidden min-w-[200px] cursor-pointer hover:bg-gray-700 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-brand-gold text-xs truncate max-w-[120px]">{prog.name}</h4>
                                                <div className="text-sm font-bold text-brand-green">{count} <span className="text-[10px] text-gray-400">/ {prog.stickersRequired}</span></div>
                                            </div>
                                            <div className="flex gap-1">
                                                {Array.from({ length: Math.min(5, prog.stickersRequired) }).map((_, i) => (
                                                    <div key={i} className={`w-2 h-2 rounded-full ${i < count ? 'bg-white' : 'bg-gray-600'}`}></div>
                                                ))}
                                                {prog.stickersRequired > 5 && <span className="text-[10px] text-gray-400">+</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Credentials */}
                        <div className="bg-gray-50 border p-3 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">PIN:</span>
                                <div className="font-mono bg-white border px-2 py-1 rounded text-xs font-bold">{isActiveAccount ? selectedClient.password : 'N/A'}</div>
                                {isActiveAccount ? (
                                    <button onClick={handleEditPin} className="text-[10px] text-blue-600 underline">Change</button>
                                ) : (
                                    <button onClick={handleActivateAccount} disabled={isLoading} className="text-[10px] bg-green-600 text-white px-2 py-1 rounded disabled:opacity-50">
                                        {isLoading ? 'Wait...' : 'Activate'}
                                    </button>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => sendCredentials('whatsapp')} disabled={!isActiveAccount} className="bg-white border text-green-600 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 disabled:opacity-50">
                                    <WhatsAppIcon className="w-3 h-3" /> WhatsApp
                                </button>
                            </div>
                        </div>

                        {/* History */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-bold text-gray-800 text-sm border-b pb-1 mb-2">Recent Bookings</h3>
                                <div className="space-y-1">
                                    {selectedClient.bookings.slice(0, 5).map(b => (
                                        <div key={b.id} className="flex justify-between text-xs p-2 bg-gray-50 rounded">
                                            <span>{new Date(b.bookingDate).toLocaleDateString()}</span>
                                            <span className="font-bold text-gray-600">{b.status.substring(0,4)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 text-sm border-b pb-1 mb-2">Invoices</h3>
                                <div className="space-y-1">
                                    {selectedClient.invoices.slice(0, 5).map(inv => (
                                        <div key={inv.id} onClick={() => setViewInvoice(inv)} className="flex justify-between text-xs p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100">
                                            <span>{inv.number}</span>
                                            <span className="font-bold">R{inv.total}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Modal */}
        {isLoyaltyPopupOpen && selectedClient && currentProgram && (
            <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/80" onClick={() => setIsLoyaltyPopupOpen(false)}>
                <div className="bg-white rounded-lg w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
                    <div className="bg-brand-green p-4 text-white flex justify-between items-center">
                        <select 
                            value={selectedLoyaltyProgramId} 
                            onChange={(e) => setSelectedLoyaltyProgramId(e.target.value)}
                            className="bg-transparent text-white font-bold outline-none cursor-pointer text-lg"
                        >
                            {activePrograms.map(p => <option key={p.id} value={p.id} className="text-black">{p.name}</option>)}
                        </select>
                        <button onClick={() => setIsLoyaltyPopupOpen(false)}>&times;</button>
                    </div>
                    <div className="p-6 text-center">
                        <div className="text-3xl font-bold mb-4 text-gray-800">{currentProgramCount} / {currentProgram.stickersRequired}</div>
                        <p className="text-sm text-gray-500 mb-6">{currentProgram.rewardDescription}</p>
                        
                        {(currentProgramCount) >= currentProgram.stickersRequired ? (
                            <button onClick={() => { redeemReward(currentProgram.id); setIsLoyaltyPopupOpen(false); }} className="bg-brand-gold text-black px-6 py-2 rounded-full font-bold animate-pulse">Redeem Reward</button>
                        ) : (
                            <div className="flex justify-center gap-4">
                                <button onClick={() => updateStickers(currentProgram.id, -1)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full font-bold">-</button>
                                <button onClick={() => updateStickers(currentProgram.id, 1)} className="bg-brand-green text-white px-6 py-2 rounded-full font-bold">+ Sticker</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* Add Modal */}
        {isAddModalOpen && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60" onClick={() => setIsAddModalOpen(false)}>
                <div className="bg-white rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                    <h3 className="text-xl font-bold mb-4">Add Client</h3>
                    <form onSubmit={handleAddClientSubmit} className="space-y-3">
                        <input className={inputClass} placeholder="Name" value={newClientName} onChange={e => setNewClientName(e.target.value)} required />
                        <input className={inputClass} placeholder="Email" value={newClientEmail} onChange={e => setNewClientEmail(e.target.value)} required />
                        <input className={inputClass} placeholder="Phone" value={newClientPhone} onChange={e => setNewClientPhone(e.target.value)} />
                        <input className={inputClass} placeholder="PIN (Required)" value={newClientPassword} onChange={e => setNewClientPassword(e.target.value)} required />
                        <div className="flex justify-end gap-2 pt-2">
                            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-3 py-1 text-sm">Cancel</button>
                            <button type="submit" disabled={isLoading} className="bg-green-600 text-white px-4 py-1 rounded text-sm font-bold disabled:opacity-50">
                                {isLoading ? 'Adding...' : 'Create'}
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
