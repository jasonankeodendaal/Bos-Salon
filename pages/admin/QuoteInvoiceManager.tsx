
import React, { useState, useMemo, useEffect } from 'react';
import { Invoice, InvoiceLineItem, Booking, Client } from '../../App';
import PlusIcon from '../../components/icons/PlusIcon';
import TrashIcon from '../../components/icons/TrashIcon';
import PencilIcon from '../../components/icons/PencilIcon';
import WhatsAppIcon from '../../components/icons/WhatsAppIcon';

interface QuoteInvoiceManagerProps {
  invoices: Invoice[];
  bookings: Booking[];
  clients: Client[];
  onAddClient: (client: Omit<Client, 'id'>) => Promise<void>;
  onAddInvoice: (item: Omit<Invoice, 'id'>) => Promise<void>;
  onUpdateInvoice: (item: Invoice) => Promise<void>;
  onDeleteInvoice: (id: string) => Promise<void>;
  settings: any; // for tax/company info
  initialBooking?: Booking | null; // New prop for generating quotes from bookings
}

const InvoiceDocument: React.FC<{ invoice: Partial<Invoice>, settings: any }> = ({ invoice, settings }) => {
    const isQuote = invoice.type === 'quote';
    return (
        <div className="printable-content bg-white text-gray-800 p-8 shadow-2xl min-h-[800px] w-full max-w-[800px] mx-auto text-sm font-sans relative flex flex-col">
            <div className="flex justify-between items-start border-b-2 border-gray-100 pb-8 mb-8">
                <div className="w-1/2">
                    {settings.logoUrl ? (
                        <img src={settings.logoUrl} alt="Logo" className="w-20 h-20 object-contain mb-4" />
                    ) : (
                        <div className="w-20 h-20 bg-gray-100 flex items-center justify-center text-xs text-gray-400 mb-4">No Logo</div>
                    )}
                    <h1 className="text-xl font-bold text-gray-900">{settings.companyName || 'Company Name'}</h1>
                    <div className="text-gray-500 mt-2 space-y-1 text-xs">
                        <p className="whitespace-pre-wrap">{settings.address}</p>
                        <p>{settings.email}</p>
                        <p>{settings.phone}</p>
                    </div>
                </div>
                <div className="text-right w-1/2">
                    <h2 className="text-4xl font-light text-gray-300 uppercase tracking-widest mb-2">{isQuote ? 'Quote' : 'Invoice'}</h2>
                    <p className="text-lg font-bold text-gray-700">#{invoice.number || '0000'}</p>
                    {invoice.subject && <p className="text-sm font-bold text-admin-dark-primary mt-2 uppercase tracking-wide">{invoice.subject}</p>}
                    <div className="mt-4 text-xs text-gray-500 space-y-1">
                        <div className="flex justify-end gap-4"><span>Date Issued:</span><span className="font-bold text-gray-700">{invoice.dateIssued}</span></div>
                        <div className="flex justify-end gap-4"><span>{isQuote ? 'Valid Until:' : 'Due Date:'}</span><span className="font-bold text-gray-700">{invoice.dateDue}</span></div>
                    </div>
                    <div className="mt-8">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Bill To</h3>
                        <p className="font-bold text-base text-gray-800">{invoice.clientName || 'Client Name'}</p>
                        <p className="text-gray-500 text-xs">{invoice.clientEmail}</p>
                        <p className="text-gray-500 text-xs">{invoice.clientPhone}</p>
                    </div>
                </div>
            </div>
            <div className="flex-grow">
                <table className="w-full mb-8">
                    <thead>
                        <tr className="border-b-2 border-gray-800 text-left">
                            <th className="py-2 text-gray-800 font-bold w-1/2">Description</th>
                            <th className="py-2 text-gray-800 font-bold text-center">Qty</th>
                            <th className="py-2 text-gray-800 font-bold text-right">Price</th>
                            <th className="py-2 text-gray-800 font-bold text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600">
                        {invoice.items && invoice.items.length > 0 ? (
                            invoice.items.map((item, idx) => (
                                <tr key={idx} className="border-b border-gray-100 last:border-0">
                                    <td className="py-3">{item.description}</td>
                                    <td className="py-3 text-center">{item.quantity}</td>
                                    <td className="py-3 text-right">R{item.unitPrice?.toFixed(2)}</td>
                                    <td className="py-3 text-right font-semibold">R{(item.quantity * item.unitPrice).toFixed(2)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={4} className="py-8 text-center text-gray-400 italic">No items added.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 border-t border-gray-100 pt-8 mt-auto">
                <div className="w-full md:w-1/2 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h4 className="font-bold text-gray-800 mb-2 text-xs uppercase">Banking Details</h4>
                    {settings.bankName ? (
                        <div className="text-xs text-gray-600 space-y-1">
                            <div className="flex justify-between"><span>Bank:</span> <span className="font-semibold">{settings.bankName}</span></div>
                            <div className="flex justify-between"><span>Account Name:</span> <span className="font-semibold">{settings.companyName}</span></div>
                            <div className="flex justify-between"><span>Account No:</span> <span className="font-semibold">{settings.accountNumber}</span></div>
                            <div className="flex justify-between"><span>Branch Code:</span> <span className="font-semibold">{settings.branchCode}</span></div>
                            <div className="flex justify-between"><span>Ref:</span> <span className="font-semibold">{invoice.number}</span></div>
                        </div>
                    ) : <p className="text-xs text-gray-400 italic">No bank details.</p>}
                    {invoice.notes && (
                        <div className="mt-4 pt-2 border-t border-gray-200">
                            <h4 className="font-bold text-gray-800 mb-1 text-xs">Notes & Terms</h4>
                            <p className="text-xs text-gray-500 whitespace-pre-wrap leading-relaxed">{invoice.notes}</p>
                        </div>
                    )}
                </div>
                <div className="w-full md:w-1/3 space-y-2">
                    <div className="flex justify-between text-gray-600 text-sm"><span>Subtotal</span><span>R{invoice.subtotal?.toFixed(2)}</span></div>
                    {settings.taxEnabled && <div className="flex justify-between text-gray-600 text-sm"><span>VAT ({settings.vatPercentage}%)</span><span>R{invoice.taxAmount?.toFixed(2)}</span></div>}
                    <div className="flex justify-between text-2xl font-bold text-gray-900 border-t-2 border-gray-800 pt-3 mt-2"><span>Total</span><span>R{invoice.total?.toFixed(2)}</span></div>
                </div>
            </div>
        </div>
    );
};


const QuoteInvoiceManager: React.FC<QuoteInvoiceManagerProps> = ({
  invoices,
  bookings,
  clients,
  onAddClient,
  onAddInvoice,
  onUpdateInvoice,
  onDeleteInvoice,
  settings,
  initialBooking
}) => {
  const [activeTab, setActiveTab] = useState<'quotes' | 'invoices'>('quotes');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Send Modal State
  const [showSendModal, setShowSendModal] = useState(false);
  const [savedInvoice, setSavedInvoice] = useState<Invoice | null>(null);
  
  // Builder State
  const [formData, setFormData] = useState<Partial<Invoice>>({
    type: 'quote',
    number: '',
    subject: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    dateIssued: new Date().toISOString().split('T')[0],
    dateDue: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    status: 'draft',
    items: [],
    notes: '',
    subtotal: 0,
    taxAmount: 0,
    total: 0
  });

  useEffect(() => {
      if (initialBooking) {
          setActiveTab('quotes');
          const prefix = 'Q-';
          const count = invoices.filter(i => i.type === 'quote').length + 1001;
          const number = `${prefix}${count}`;
          
          setFormData({
              type: 'quote',
              number: number,
              subject: `Tattoo Session: ${initialBooking.bookingDate}`,
              clientId: '', 
              bookingId: initialBooking.id, 
              clientName: initialBooking.name,
              clientEmail: initialBooking.email,
              clientPhone: initialBooking.whatsappNumber || '',
              dateIssued: new Date().toISOString().split('T')[0],
              dateDue: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
              status: 'draft',
              items: [{
                  id: crypto.randomUUID(),
                  description: `Service for booking on ${initialBooking.bookingDate}: ${initialBooking.message || 'Consultation'}`,
                  quantity: 1,
                  unitPrice: initialBooking.totalCost || 0
              }],
              notes: 'Quote generated based on your booking request.\n50% non-refundable deposit required to confirm your slot.',
              subtotal: initialBooking.totalCost || 0,
              taxAmount: 0, 
              total: initialBooking.totalCost || 0
          });
          setEditingId(null);
          setIsEditing(true);
      }
  }, [initialBooking]);

  const calculateTotals = (items: InvoiceLineItem[]) => {
      const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const taxAmount = settings.taxEnabled ? subtotal * (settings.vatPercentage / 100) : 0;
      const total = subtotal + taxAmount;
      return { subtotal, taxAmount, total };
  };

  const handleAddItem = () => {
      const newItems = [...(formData.items || []), { id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0 }];
      const totals = calculateTotals(newItems);
      setFormData({ ...formData, items: newItems, ...totals });
  };

  const handleUpdateItem = (index: number, field: keyof InvoiceLineItem, value: any) => {
      const newItems = [...(formData.items || [])];
      newItems[index] = { ...newItems[index], [field]: value };
      const totals = calculateTotals(newItems);
      setFormData({ ...formData, items: newItems, ...totals });
  };

  const handleRemoveItem = (index: number) => {
      const newItems = (formData.items || []).filter((_, i) => i !== index);
      const totals = calculateTotals(newItems);
      setFormData({ ...formData, items: newItems, ...totals });
  };

  const handleSelectClient = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const email = e.target.value;
      if (!email) return;
      const client = clients.find(c => c.email === email);
      if (client) {
          setFormData({
              ...formData,
              clientId: client.id,
              clientName: client.name,
              clientEmail: client.email,
              clientPhone: client.phone
          });
      }
  };

  const generateNumber = (type: 'quote' | 'invoice') => {
      const prefix = type === 'quote' ? 'Q-' : 'INV-';
      const count = invoices.filter(i => i.type === type).length + 1001;
      return `${prefix}${count}`;
  };

  const generateRandomPassword = () => Math.random().toString(36).slice(-6).toUpperCase();

  const handleStartNew = (activeTab: 'quotes' | 'invoices') => {
      const type = activeTab === 'quotes' ? 'quote' : 'invoice';
      setFormData({
          type,
          number: generateNumber(type),
          subject: '',
          clientName: '',
          clientEmail: '',
          clientPhone: '',
          dateIssued: new Date().toISOString().split('T')[0],
          dateDue: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          status: 'draft',
          items: [{ id: crypto.randomUUID(), description: 'Service', quantity: 1, unitPrice: 0 }],
          notes: type === 'quote' ? 'Valid for 7 days.\nA non-refundable deposit is required to confirm booking.' : 'Thank you for your support.',
          subtotal: 0,
          taxAmount: 0,
          total: 0
      });
      setEditingId(null);
      setIsEditing(true);
  };

  const handleEdit = (inv: Invoice) => {
      setFormData(inv);
      setEditingId(inv.id);
      setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          let clientId = formData.clientId;
          
          // Check if client exists or needs creating
          if (formData.clientEmail) {
              const existing = clients.find(c => c.email.toLowerCase() === formData.clientEmail!.toLowerCase());
              
              if (!existing) {
                  // Create new client on the fly if doesn't exist
                  const newPassword = generateRandomPassword();
                  const newId = crypto.randomUUID(); // Generate ID locally to link immediately
                  const newClient = {
                      id: newId,
                      name: formData.clientName || 'New Client',
                      email: formData.clientEmail,
                      phone: formData.clientPhone,
                      password: newPassword,
                      notes: 'Auto-generated from Invoice'
                  };
                  // Add to DB
                  await onAddClient(newClient);
                  clientId = newId;
              } else {
                  clientId = existing.id;
              }
          }

          let savedInv: Invoice;
          const status = formData.status || 'draft'; 

          if (editingId) {
              savedInv = { ...formData, clientId, id: editingId, status } as Invoice;
              await onUpdateInvoice(savedInv);
          } else {
              const newId = crypto.randomUUID();
              savedInv = { ...formData, clientId, id: newId, status } as Invoice;
              await onAddInvoice(savedInv);
          }
          
          // Ensure we switch to the tab where the saved item will appear
          const targetTab = savedInv.type === 'quote' ? 'quotes' : 'invoices';
          if (targetTab !== activeTab) {
              setActiveTab(targetTab);
          }

          setSavedInvoice(savedInv);
          setIsEditing(false);
          setShowSendModal(true);
      } catch (err) {
          console.error(err);
          alert("Failed to save. Please try again.");
      }
  };

  const generateWhatsAppLink = (inv: Invoice) => {
      if (!inv.clientPhone) return '#';
      const client = clients.find(c => c.email.toLowerCase() === inv.clientEmail.toLowerCase());
      const password = client ? client.password : 'Check with admin';
      const typeLabel = inv.type === 'quote' ? 'Quote' : 'Invoice';
      let msg = `Hi ${inv.clientName},\nHere is your ${typeLabel} *${inv.number}*.\nTotal: R${inv.total.toFixed(2)}\nDue: ${inv.dateDue}\nLogin: ${window.location.origin}\nEmail: ${inv.clientEmail}\nPIN: ${password}`;
      return `https://wa.me/${inv.clientPhone.replace(/\+/g, '').replace(/\s/g, '')}?text=${encodeURIComponent(msg)}`;
  };
  
  const handleMarkAsSent = async () => {
      if (savedInvoice) {
          await onUpdateInvoice({ ...savedInvoice, status: 'sent' });
          setShowSendModal(false);
      }
  };

  const groupedInvoices = useMemo(() => {
      // 1. Filter by Type (Quote/Invoice)
      const filtered = invoices.filter(i => {
          const expectedType = activeTab === 'quotes' ? 'quote' : 'invoice';
          return i.type === expectedType;
      }).sort((a,b) => new Date(b.dateIssued).getTime() - new Date(a.dateIssued).getTime());
      
      const groups: Record<string, Invoice[]> = {
          'Requires Action': [],
          'Active / Sent': [],
          'History / Paid': []
      };

      filtered.forEach(inv => {
          if (inv.status === 'draft') groups['Requires Action'].push(inv);
          else if (inv.status === 'sent' || inv.status === 'overdue' || inv.status === 'accepted') groups['Active / Sent'].push(inv);
          else groups['History / Paid'].push(inv);
      });

      return groups;
  }, [invoices, activeTab]);
  
  const inputClass = "w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-gray-900 text-sm outline-none focus:ring-1 focus:ring-blue-500 font-medium";

  // --- SEND MODAL RENDER ---
  const renderSendModal = () => {
      if (!showSendModal || !savedInvoice) return null;
      return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in no-print">
              <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Document Saved!</h3>
                  <div className="space-y-3 mt-4">
                      <a 
                          href={generateWhatsAppLink(savedInvoice)} 
                          target="_blank" 
                          rel="noreferrer"
                          onClick={() => handleMarkAsSent()}
                          className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white py-2 rounded-lg font-bold shadow-lg hover:opacity-90"
                      >
                          <WhatsAppIcon className="w-5 h-5 text-white"/> Send via WhatsApp
                      </a>
                      
                      <button 
                          onClick={() => handleMarkAsSent()} 
                          className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold shadow-sm hover:bg-blue-700"
                      >
                          Mark as Sent (No WhatsApp)
                      </button>

                      <button 
                          onClick={() => window.print()}
                          className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg font-bold hover:bg-gray-50"
                      >
                          Print Document
                      </button>

                      <button 
                          onClick={() => setShowSendModal(false)}
                          className="w-full text-gray-400 font-semibold text-xs mt-2"
                      >
                          Close
                      </button>
                  </div>
              </div>
              {/* Hidden printable invoice for this modal context */}
              <div className="hidden">
                  <InvoiceDocument invoice={savedInvoice} settings={settings} />
              </div>
          </div>
      );
  };

  if (isEditing) {
      return (
          <div className="bg-gray-100 min-h-full flex flex-col h-full animate-fade-in absolute inset-0 z-50">
              <div className="bg-white border-b border-gray-200 p-3 flex justify-between items-center shadow-sm no-print">
                  <h2 className="text-lg font-bold text-gray-900">{editingId ? 'Edit' : 'New'} {formData.type}</h2>
                  <div className="flex gap-2">
                      <button onClick={() => window.print()} className="border border-gray-300 px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-gray-50">Print</button>
                      <button onClick={() => setIsEditing(false)} className="text-gray-500 font-semibold text-xs px-2">Cancel</button>
                      <button onClick={handleSave} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold text-xs">Save</button>
                  </div>
              </div>
              <div className="flex flex-1 overflow-hidden">
                  {/* Left Panel: Editor */}
                  <div className="w-full md:w-1/3 bg-white border-r border-gray-200 overflow-y-auto p-4 space-y-4 z-10 no-print">
                      <h3 className="font-bold text-gray-900 border-b pb-1 mb-2 text-sm">Document Core</h3>
                      <div className="space-y-3">
                           <div>
                               <label className="block text-xs font-bold text-gray-500 mb-1">Doc Number</label>
                               <input value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} className={inputClass} required />
                           </div>
                           <div>
                               <label className="block text-xs font-bold text-gray-500 mb-1">Subject / Description</label>
                               <input value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} placeholder="e.g. Fine Line Project" className={inputClass} />
                           </div>
                           <div className="grid grid-cols-2 gap-2">
                               <div>
                                   <label className="block text-xs font-bold text-gray-500 mb-1">Issue Date</label>
                                   <input type="date" value={formData.dateIssued} onChange={e => setFormData({...formData, dateIssued: e.target.value})} className={inputClass} required />
                               </div>
                               <div>
                                   <label className="block text-xs font-bold text-gray-500 mb-1">Due Date</label>
                                   <input type="date" value={formData.dateDue} onChange={e => setFormData({...formData, dateDue: e.target.value})} className={inputClass} required />
                               </div>
                           </div>
                           <div>
                               <label className="block text-xs font-bold text-gray-500 mb-1">Status</label>
                               <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className={inputClass}>
                                  <option value="draft">Draft (Admin Only)</option>
                                  <option value="sent">Sent (Visible to Client)</option>
                                  <option value="paid">Paid</option>
                                  <option value="accepted">Accepted (Quote)</option>
                              </select>
                           </div>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-gray-100">
                           <h4 className="font-bold text-gray-800 text-sm">Client Info</h4>
                           <select onChange={handleSelectClient} className="w-full bg-gray-50 border border-gray-300 rounded p-2 text-xs text-gray-900 mb-1">
                               <option value="">Select Existing Client...</option>
                               {clients.map(c => <option key={c.email} value={c.email}>{c.name}</option>)}
                           </select>
                           <input placeholder="Client Full Name" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} className={inputClass} required />
                           <input placeholder="Email Address" value={formData.clientEmail} onChange={e => setFormData({...formData, clientEmail: e.target.value})} className={inputClass} required />
                           <input placeholder="Phone Number" value={formData.clientPhone} onChange={e => setFormData({...formData, clientPhone: e.target.value})} className={inputClass} />
                      </div>

                      <div className="space-y-3 pt-3 border-t border-gray-100">
                          <h4 className="font-bold text-gray-800 text-sm">Line Items</h4>
                          <div className="space-y-2">
                              {formData.items?.map((item, index) => (
                                  <div key={item.id} className="bg-gray-50 p-2 rounded border border-gray-200">
                                      <input placeholder="Description" value={item.description} onChange={e => handleUpdateItem(index, 'description', e.target.value)} className={`${inputClass} mb-1`} />
                                      <div className="flex gap-1">
                                          <input type="number" placeholder="Qty" value={item.quantity} onChange={e => handleUpdateItem(index, 'quantity', parseFloat(e.target.value))} className={`${inputClass} w-16 text-center`} min="1"/>
                                          <input type="number" placeholder="Price" value={item.unitPrice} onChange={e => handleUpdateItem(index, 'unitPrice', parseFloat(e.target.value))} className={`${inputClass} flex-1 text-right`} />
                                          <button type="button" onClick={() => handleRemoveItem(index)} className="p-1 text-red-500 rounded hover:bg-red-50"><TrashIcon className="w-4 h-4" /></button>
                                      </div>
                                  </div>
                              ))}
                          </div>
                          <button type="button" onClick={handleAddItem} className="w-full py-1.5 flex items-center justify-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors">
                              <PlusIcon className="w-3 h-3" /> Add Service/Item
                          </button>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-gray-100">
                          <h4 className="font-bold text-gray-800 text-sm">Notes & Terms</h4>
                          <textarea 
                             rows={4} 
                             value={formData.notes} 
                             onChange={e => setFormData({...formData, notes: e.target.value})} 
                             className={inputClass}
                             placeholder="Add any specific instructions, healing notes, or deposit terms..."
                          />
                      </div>
                  </div>
                  {/* Right Panel: Live Preview (Hidden on Mobile) */}
                  <div className="hidden md:block w-2/3 bg-gray-200 overflow-y-auto p-8 flex items-center justify-center print:block print:w-full print:bg-white print:p-0">
                      <InvoiceDocument invoice={formData} settings={settings} />
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="bg-admin-dark-card border border-admin-dark-border rounded-xl shadow-lg p-2 sm:p-6 h-full flex flex-col relative no-print">
        {renderSendModal()}
        
        <header className="flex justify-between items-center mb-4 sm:mb-6">
            <div className="flex gap-2 sm:gap-4 items-center">
                 <h2 className="text-lg sm:text-xl font-bold text-admin-dark-text">Docs</h2>
                 <div className="bg-admin-dark-bg p-0.5 sm:p-1 rounded-lg border border-admin-dark-border inline-flex shadow-sm">
                    <button onClick={() => setActiveTab('quotes')} className={`px-2 sm:px-4 py-1 sm:py-1.5 rounded-md text-[10px] sm:text-sm font-bold transition-colors ${activeTab === 'quotes' ? 'bg-white text-admin-dark-primary shadow-sm' : 'text-gray-400 hover:text-white'}`}>Quotes</button>
                    <button onClick={() => setActiveTab('invoices')} className={`px-2 sm:px-4 py-1 sm:py-1.5 rounded-md text-[10px] sm:text-sm font-bold transition-colors ${activeTab === 'invoices' ? 'bg-white text-admin-dark-primary shadow-sm' : 'text-gray-400 hover:text-white'}`}>Invoices</button>
                 </div>
            </div>
            <button onClick={() => handleStartNew(activeTab)} className="flex items-center gap-1 sm:gap-2 bg-admin-dark-primary text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg font-bold text-[10px] sm:text-sm hover:opacity-90 transition-opacity">
                <PlusIcon className="w-4 h-4"/> New
            </button>
        </header>

        <div className="flex-1 overflow-y-auto pr-1">
            {Object.entries(groupedInvoices).map(([groupName, items]) => {
                const invoiceGroup = items as Invoice[]; 
                if (invoiceGroup.length === 0) return null;
                return (
                    <div key={groupName} className="mb-6">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 pl-2 border-l-4 border-admin-dark-primary">{groupName}</h3>
                        {/* 2-Col Grid on Mobile for Density, Table on Desktop */}
                        <div className="block md:hidden grid grid-cols-2 gap-2">
                            {invoiceGroup.map(inv => (
                                <div key={inv.id} className="bg-white border border-gray-200 rounded p-2 flex flex-col gap-1 relative">
                                    <div className="flex justify-between">
                                        <span className="font-mono text-[10px] font-bold text-admin-dark-primary">{inv.number}</span>
                                        <span className="text-[10px] font-bold">R{inv.total.toFixed(0)}</span>
                                    </div>
                                    <div className="text-[10px] font-bold text-gray-800 truncate">{inv.clientName}</div>
                                    {inv.subject && <div className="text-[8px] text-admin-dark-primary uppercase font-bold truncate">{inv.subject}</div>}
                                    <div className="text-[9px] text-gray-500">{new Date(inv.dateIssued).toLocaleDateString()}</div>
                                    <div className="flex justify-between items-center mt-1 pt-1 border-t border-gray-100">
                                        <span className={`text-[8px] font-bold uppercase px-1 rounded ${inv.status === 'paid' ? 'bg-green-100 text-green-700' : inv.status === 'draft' ? 'bg-gray-100 text-gray-600' : 'bg-yellow-100 text-yellow-700'}`}>{inv.status}</span>
                                        <div className="flex gap-1">
                                            <button onClick={() => { setSavedInvoice(inv); setShowSendModal(true); }} className="text-green-600"><WhatsAppIcon className="w-3 h-3"/></button>
                                            <button onClick={() => handleEdit(inv)} className="text-gray-500"><PencilIcon className="w-3 h-3"/></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden md:block bg-white rounded-lg border border-admin-dark-border overflow-hidden shadow-sm">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-500 uppercase text-[10px]">
                                    <tr>
                                        <th className="px-4 py-2">Number</th>
                                        <th className="px-4 py-2">Client / Subject</th>
                                        <th className="px-4 py-2">Date</th>
                                        <th className="px-4 py-2 text-right">Total</th>
                                        <th className="px-4 py-2 text-center">Status</th>
                                        <th className="px-4 py-2 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {invoiceGroup.map(inv => (
                                        <tr key={inv.id} className="hover:bg-blue-50/30 transition-colors group">
                                            <td className="px-4 py-2 font-mono text-xs font-bold text-admin-dark-primary">{inv.number}</td>
                                            <td className="px-4 py-2">
                                                <div className="text-xs font-bold">{inv.clientName}</div>
                                                {inv.subject && <div className="text-[9px] text-gray-400 uppercase">{inv.subject}</div>}
                                            </td>
                                            <td className="px-4 py-2 text-xs text-gray-500">{new Date(inv.dateIssued).toLocaleDateString()}</td>
                                            <td className="px-4 py-2 text-right font-bold text-gray-800">R {inv.total.toFixed(2)}</td>
                                            <td className="px-4 py-2 text-center"><span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${inv.status === 'draft' ? 'bg-gray-100' : 'bg-transparent'}`}>{inv.status}</span></td>
                                            <td className="px-4 py-2 text-right flex justify-end gap-2">
                                                <button onClick={() => { setSavedInvoice(inv); setShowSendModal(true); }} className="text-green-600 hover:text-green-800" title="Send/Print"><WhatsAppIcon className="w-4 h-4" /></button>
                                                <button onClick={() => handleEdit(inv)} className="text-gray-600 hover:text-gray-800" title="Edit"><PencilIcon className="w-4 h-4" /></button>
                                                <button onClick={() => onDeleteInvoice(inv.id)} className="text-red-500 hover:text-red-700" title="Delete"><TrashIcon className="w-4 h-4" /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
  );
};

export default QuoteInvoiceManager;
