
import React, { useState, useEffect } from 'react';
import { Booking, Invoice } from '../../App';
import { AdminPageProps } from '../AdminPage';

// Import manager components
import SettingsManager from './SettingsManager';
import PortfolioManager from './PortfolioManager';
import ShowroomManager from './ShowroomManager';
import SpecialsManager from './SpecialsManager';
import FinancialsManager from './FinancialsManager';
import InventoryManager from './InventoryManager';
import ClientsManager from './ClientsManager';
import TrainingGuide, { TourKey } from './TrainingGuide';
import QuoteInvoiceManager from './QuoteInvoiceManager';
import LogSuppliesModal from './components/LogSuppliesModal';
import SetupManager from './SetupManager';


// --- ICONS ---
const IconDashboard = ({ className = 'w-5 h-5' }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>;
const IconArt = ({ className = 'w-5 h-5' }) => <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.25 15.75L5.15938 12.8406C5.58694 12.4131 6.18848 12.1758 6.81562 12.1758C7.44277 12.1758 8.04431 12.4131 8.47187 12.8406L12 16.3687M12 16.3687L14.4719 13.8969C14.8994 13.4693 15.501 13.2319 16.1281 13.2319C16.7553 13.2319 17.3568 13.4693 17.7844 13.8969L21.75 17.8687M12 16.3687L18.75 20.25M21.75 19.5V6C21.75 5.20435 21.4339 4.44129 20.8839 3.89119C20.3338 3.34109 19.5706 3.025 18.75 3.025H5.25C4.45435 3.025 3.69129 3.34109 2.14119 3.89119C2.59109 4.44129 2.275 5.20435 2.275 6V18C2.275 18.7956 2.59109 19.5587 3.14119 20.1088C3.69129 20.6589 4.45435 20.975 5.25 20.975H18.75M16.5 8.25H16.508V8.258H16.5V8.25Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IconSettings = ({ className = 'w-5 h-5' }) => <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 15.75C14.0711 15.75 15.75 14.0711 15.75 12C15.75 9.92893 14.0711 8.25 12 8.25C9.92893 8.25 8.25 9.92893 8.25 12C8.25 14.0711 9.92893 15.75 12 15.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M19.5 12C19.5 12.418 19.4283 12.8293 19.293 13.218C18.81 14.614 17.614 15.81 16.218 16.293C15.8293 16.4283 15.418 16.5 15 16.5C13.84 16.5 12.842 16.12 12 15.75M4.5 12C4.5 11.582 4.57168 11.1707 4.70697 10.782C5.19001 9.38596 6.38596 8.19001 7.782 7.70697C8.17075 7.57168 8.582 7.5 9 7.5C10.16 7.5 11.158 7.88 12 8.25M12 4.5C12.418 4.5 12.8293 4.57168 13.218 4.70697C14.614 5.19001 15.81 6.38596 16.293 7.782C16.4283 8.17075 16.5 8.582 16.5 9C16.5 10.16 16.12 11.158 15.75 12M12 19.5C11.582 19.5 11.1707 19.4283 10.782 19.293C9.38596 18.81 8.19001 17.614 7.70697 16.218C7.57168 15.8293 7.5 15.418 7.5 15C7.5 13.84 7.88 12.842 8.25 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IconFinancials = ({ className = 'w-5 h-5' }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 8h6m-5 4h.01M18 18H6a2 2 0 01-2-2V6a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2z"></path></svg>;
const IconClients = ({ className = 'w-5 h-5' }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const IconSpecials = ({ className = 'w-5 h-5' }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>;
const IconInventory = ({ className = 'w-5 h-5' }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
const IconInvoice = ({ className = 'w-5 h-5' }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const HelpIcon = ({ className = 'w-5 h-5' }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.519-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.546-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const LogoutIcon = ({ className = 'w-5 h-5' }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const SiteIcon = ({ className = 'w-5 h-5' }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>;
const TrashIcon = ({ className = 'w-5 h-5' }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.036-2.134H8.036C6.91 2.75 6 3.704 6 4.884v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>;
const SetupIcon = ({ className = 'w-5 h-5' }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;


// --- BOOKING MODAL (for Create/Edit) ---
const BookingModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (bookingData: Booking) => Promise<void>;
    bookingToEdit?: Booking | null;
    onGenerateQuote: (booking: Booking) => void;
}> = ({ isOpen, onClose, onSave, bookingToEdit, onGenerateQuote }) => {
    
    const [notifyClient, setNotifyClient] = useState(false);

    const getInitialFormData = (): Booking => {
        if (bookingToEdit) {
            return { ...bookingToEdit };
        }
        return {
            id: '', 
            name: '',
            email: '',
            message: '',
            bookingDate: new Date().toISOString().split('T')[0],
            status: 'pending',
            bookingType: 'manual',
            totalCost: undefined,
            amountPaid: undefined,
            paymentMethod: 'cash',
        };
    };

    const [formData, setFormData] = useState<Booking>(getInitialFormData());
    
    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialFormData());
            setNotifyClient(false);
        }
    }, [isOpen, bookingToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const finalValue = type === 'number' && value ? parseFloat(value) : value;
        setFormData(prev => ({ ...prev, [name]: finalValue === '' ? undefined : finalValue } as Booking));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave(formData);
        onClose();
    };

    if (!isOpen) return null;

    const inputClasses = "w-full bg-admin-dark-bg border border-admin-dark-border rounded-lg p-2.5 text-admin-dark-text focus:ring-2 focus:ring-admin-dark-primary outline-none transition";
    const selectClasses = `${inputClasses} appearance-none bg-no-repeat bg-right pr-8`;
    const isEditing = !!bookingToEdit;

    return (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-admin-dark-card border border-admin-dark-border rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <header className="flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-bold text-admin-dark-text">{isEditing ? 'Edit Booking' : 'Create Manual Booking'}</h2>
                            <p className="text-sm text-admin-dark-text-secondary mt-1">{isEditing ? 'Update the details for this booking.' : 'Directly add a booking to the system.'}</p>
                        </div>
                    </header>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-admin-dark-text-secondary">Client Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required className={inputClasses} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-admin-dark-text-secondary">Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required className={inputClasses} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-admin-dark-text-secondary">WhatsApp Number</label>
                            <input type="text" name="whatsappNumber" value={formData.whatsappNumber || ''} onChange={handleChange} placeholder="e.g. 27791234567" className={inputClasses} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-admin-dark-text-secondary">Booking Date</label>
                            <input type="date" name="bookingDate" value={formData.bookingDate.split('T')[0]} onChange={handleChange} required className={inputClasses} style={{ colorScheme: 'light' }} />
                        </div>
                    </div>
                    
                    <div className="bg-admin-dark-bg border border-admin-dark-border p-4 rounded-lg">
                        <label className="block text-sm font-semibold mb-2 text-admin-dark-text-secondary">Status Update</label>
                        <select name="status" value={formData.status} onChange={handleChange} required className={`${selectClasses} flex-grow`}>
                            <option value="pending">Pending (Needs Quote)</option>
                            <option value="quote_sent">Quote Sent</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="rescheduled">Rescheduled</option>
                        </select>
                    </div>

                    <div>
                         <label className="block text-sm font-semibold mb-2 text-admin-dark-text-secondary">Description / Message</label>
                         <textarea name="message" value={formData.message} onChange={handleChange} rows={3} className={inputClasses}></textarea>
                    </div>
                    
                    <div className="flex justify-between items-center gap-4 pt-6 border-t border-admin-dark-border">
                        {isEditing && (
                            <button 
                                type="button" 
                                onClick={() => onGenerateQuote(formData)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm flex items-center gap-2"
                            >
                                <IconInvoice className="w-4 h-4"/>
                                Build Quote
                            </button>
                        )}
                        <div className="flex gap-4 ml-auto">
                            <button type="button" onClick={onClose} className="bg-admin-dark-card border border-admin-dark-border px-6 py-2 rounded-lg font-bold text-sm text-admin-dark-text-secondary hover:bg-opacity-70 transition-opacity">Cancel</button>
                            <button type="submit" className="bg-admin-dark-primary text-white px-6 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity">Save Booking</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- BOOKINGS MANAGER ---
const BookingsManager: React.FC<{ 
    bookings: Booking[], 
    onUpdateBooking: (booking: Booking) => Promise<void>, 
    selectedDate: string | null, 
    onClearDateFilter: () => void, 
    onAddManualBooking: () => void,
    onEditBooking: (booking: Booking) => void,
    onDeleteBooking: (id: string) => void, // Added delete handler
    onGenerateQuote: (booking: Booking) => void,
    onShowHelp: (key: TourKey) => void, // Updated Prop
}> = ({ bookings, onUpdateBooking, selectedDate, onClearDateFilter, onAddManualBooking, onEditBooking, onDeleteBooking, onGenerateQuote, onShowHelp }) => {
    type StatusFilter = Booking['status'] | 'all';
    const [filter, setFilter] = useState<StatusFilter>('pending');
    
    const filteredByDate = selectedDate
      ? bookings.filter(b => new Date(b.bookingDate).toDateString() === new Date(selectedDate).toDateString())
      : bookings;

    const filteredBookings = (filter === 'all' ? filteredByDate : filteredByDate.filter(b => b.status === filter))
      .sort((a, b) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime());

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to permanently delete this booking?")) {
            onDeleteBooking(id);
        }
    };
    
    return (
        <div className="bg-admin-dark-card border border-admin-dark-border rounded-xl shadow-lg p-2 sm:p-6 h-full flex flex-col">
            <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg sm:text-xl font-bold text-admin-dark-text">Bookings</h2>
                    <button onClick={() => onShowHelp('dashboard')} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-full transition-colors" title="Guide: Dashboard & Workflow">
                        <HelpIcon />
                    </button>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center flex-wrap gap-1 sm:gap-2 bg-admin-dark-bg p-1 rounded-lg self-start">
                        {(['all', 'pending', 'quote_sent', 'confirmed', 'completed', 'cancelled'] as StatusFilter[]).map(status => (
                        <button key={status} onClick={() => setFilter(status)} className={`px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-bold rounded-lg transition-colors capitalize ${filter === status ? 'bg-admin-dark-primary text-white shadow-sm' : 'text-admin-dark-text-secondary hover:bg-black/5'}`}>
                            {status?.replace('_', ' ')}
                        </button>
                        ))}
                    </div>
                     <button onClick={onAddManualBooking} className="flex items-center gap-1 sm:gap-2 bg-admin-dark-primary text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg font-bold text-[10px] sm:text-xs hover:opacity-90 transition-opacity shadow-sm">
                        + Manual
                    </button>
                </div>
            </header>
            {selectedDate && (
              <div className="bg-admin-dark-bg/50 p-2 sm:p-3 rounded-lg mb-4 text-center border border-admin-dark-border">
                  <p className="text-xs sm:text-sm text-admin-dark-text">
                      <span className="font-bold text-admin-dark-text">{new Date(selectedDate).toLocaleDateString()}</span>
                  </p>
                  <button onClick={onClearDateFilter} className="mt-1 text-[10px] sm:text-xs text-admin-dark-primary hover:underline">
                      Show all
                  </button>
              </div>
            )}
            
            {/* Forced Grid Layout - 3 Cols on Mobile, 4 on Desktop */}
            <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2 overflow-y-auto pr-1 flex-1 content-start">
            {filteredBookings.length > 0 ? (
                filteredBookings.map(booking => {
                    return (
                        <div key={booking.id} className={`bg-white rounded-lg shadow-sm border border-gray-200 p-2 flex flex-col gap-1 hover:shadow-md transition-shadow relative group`}>
                            {/* Header */}
                            <div className="flex justify-between items-start mb-1">
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-admin-dark-text truncate text-[10px] sm:text-sm">{booking.name}</p>
                                    <p className="text-[9px] sm:text-xs text-admin-dark-text-secondary truncate">{booking.email}</p>
                                </div>
                                <div className="text-right flex-shrink-0 ml-1">
                                    <p className="font-semibold text-admin-dark-text text-[9px] sm:text-xs">{new Date(booking.bookingDate).toLocaleDateString(undefined, {month:'numeric', day:'numeric'})}</p>
                                </div>
                            </div>

                            {/* Status Pill */}
                            <div className="mb-1">
                                <span className={`text-[8px] sm:text-[10px] font-bold capitalize px-1.5 py-0.5 rounded ${
                                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                    booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                    'bg-gray-100 text-gray-600'
                                }`}>
                                    {booking.status.replace('_', ' ')}
                                </span>
                            </div>

                            <p className="text-[9px] sm:text-xs text-admin-dark-text flex-grow line-clamp-3 leading-tight text-gray-500">
                                {booking.message || 'No msg'}
                            </p>
                            
                            {/* Actions Area */}
                            <div className="mt-auto pt-2 border-t border-gray-50 flex items-center justify-end gap-1">
                                {booking.status === 'pending' && (
                                    <button 
                                        onClick={() => onGenerateQuote(booking)}
                                        className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] sm:text-[10px] font-bold hover:bg-blue-100 transition-colors"
                                        title="Build Quote"
                                    >
                                        Quote
                                    </button>
                                )}
                                <button onClick={() => onEditBooking(booking)} className="p-1 text-gray-400 hover:text-admin-dark-primary hover:bg-gray-50 rounded transition-colors" aria-label="Edit">
                                    <span className="text-[10px]">✏️</span>
                                </button>
                                <button onClick={() => handleDelete(booking.id)} className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors" aria-label="Delete">
                                    <TrashIcon className="w-3 h-3 sm:w-3 sm:h-3"/>
                                </button>
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="flex items-center justify-center h-full col-span-full py-12">
                    <p className="text-[10px] sm:text-sm text-admin-dark-text-secondary">No bookings.</p>
                </div>
            )}
            </div>
        </div>
    );
};


const BookingCalendarWidget: React.FC<{ bookings: Booking[], invoices: Invoice[], selectedDate: string | null, onDateSelect: (date: string | null) => void }> = ({ bookings, invoices, selectedDate, onDateSelect }) => {
    // ... (No changes to Calendar logic) ...
    const today = new Date();
    const [currentDate, setCurrentDate] = useState(today);

    // Group bookings by date
    const eventsByDate = bookings.reduce((acc, booking) => {
        const date = new Date(booking.bookingDate).toDateString();
        if (!acc[date]) acc[date] = { hasBooking: false, hasInvoiceDue: false };
        acc[date].hasBooking = true;
        return acc;
    }, {} as Record<string, { hasBooking: boolean, hasInvoiceDue: boolean }>);

    // Add invoice due dates
    invoices.forEach(inv => {
        if(inv.status !== 'paid' && inv.status !== 'void') {
            const date = new Date(inv.dateDue).toDateString();
            if(!eventsByDate[date]) eventsByDate[date] = { hasBooking: false, hasInvoiceDue: false };
            eventsByDate[date].hasInvoiceDue = true;
        }
    });

    const changeMonth = (delta: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + delta);
            return newDate;
        });
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const blanks = Array(firstDayOfMonth).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const upcomingConfirmed = bookings
        .filter(b => b.status === 'confirmed' && new Date(b.bookingDate) >= new Date(today.toDateString()))
        .sort((a, b) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime())
        .slice(0, 5);

    const daysUntil = (dateStr: string) => {
        const diffTime = new Date(dateStr).getTime() - new Date(today.toDateString()).getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    return (
        <div className="bg-admin-dark-card border border-admin-dark-border rounded-xl shadow-lg p-3 sm:p-4 space-y-4 sm:space-y-6">
            <div>
                <h3 className="font-bold text-sm sm:text-lg text-admin-dark-text mb-2 sm:mb-4">Calendar</h3>
                <div className="flex justify-between items-center mb-2">
                    <button onClick={() => changeMonth(-1)} className="text-admin-dark-text-secondary hover:text-admin-dark-text text-xs">◀</button>
                    <span className="font-semibold text-admin-dark-text text-xs sm:text-sm">{currentDate.toLocaleString('default', { month: 'short', year: 'numeric' })}</span>
                    <button onClick={() => changeMonth(1)} className="text-admin-dark-text-secondary hover:text-admin-dark-text text-xs">▶</button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] sm:text-xs text-admin-dark-text-secondary">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="h-4 sm:h-6 flex items-center justify-center font-semibold">{d}</div>)}
                    {blanks.map((_, i) => <div key={`b-${i}`}></div>)}
                    {days.map(day => {
                        const dateObj = new Date(year, month, day);
                        const date = dateObj.toDateString();
                        const events = eventsByDate[date];
                        const isSelected = selectedDate ? new Date(selectedDate).toDateString() === date : false;
                        const isToday = date === today.toDateString();
                        
                        let cellClass = "hover:bg-black/5";
                        if (isSelected) cellClass = "bg-admin-dark-primary text-white ring-1 ring-white shadow-sm";
                        else if (isToday) cellClass = "ring-1 ring-admin-dark-primary text-admin-dark-primary";
                        else if (events?.hasBooking) cellClass = "bg-admin-dark-primary/30 text-admin-dark-text font-bold hover:bg-admin-dark-primary/60";

                        return (
                            <div key={day} onClick={() => onDateSelect(isSelected ? null : dateObj.toISOString())} className={`h-6 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs transition-colors cursor-pointer relative ${cellClass}`}>
                                {day}
                                {events?.hasInvoiceDue && (
                                    <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full border border-white" title="Invoice Due"></div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
            <div>
                 <h3 className="font-bold text-sm sm:text-lg text-admin-dark-text mb-2 sm:mb-4">Reminders</h3>
                 {/* Stack horizontally on mobile for better space usage if possible, or tight list */}
                 <div className="flex overflow-x-auto sm:block gap-2 sm:space-y-3 pb-2 sm:pb-0">
                    {upcomingConfirmed.length > 0 ? upcomingConfirmed.map(booking => {
                        const daysLeft = daysUntil(booking.bookingDate);
                        return (
                            <div key={booking.id} className="bg-admin-dark-bg/50 p-2 sm:p-3 rounded-lg min-w-[120px] sm:min-w-0 border border-gray-100 flex-shrink-0">
                                <div className="flex justify-between items-center">
                                    <p className="text-[10px] sm:text-sm font-semibold text-admin-dark-text truncate">{booking.name}</p>
                                    <p className="text-[9px] sm:text-xs font-bold text-green-600 whitespace-nowrap ml-1">
                                        {daysLeft === 0 ? "Today" : daysLeft === 1 ? "Tom." : `${daysLeft}d`}
                                    </p>
                                </div>
                                <p className="text-[9px] sm:text-xs text-admin-dark-text-secondary mt-0.5">{new Date(booking.bookingDate).toLocaleDateString('en-ZA', {weekday: 'short', day: 'numeric'})}</p>
                            </div>
                        );
                    }) : <p className="text-[10px] sm:text-sm text-admin-dark-text-secondary text-center py-4 w-full">No confirmed upcoming.</p>}
                 </div>
            </div>
        </div>
    );
};


type AdminTab = 'dashboard' | 'clients' | 'invoices' | 'specials' | 'art' | 'financials' | 'inventory' | 'settings' | 'setup';
type ArtSubTab = 'portfolio' | 'showroom';

interface AdminDashboardComponentProps extends AdminPageProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardComponentProps> = (props) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [artSubTab, setArtSubTab] = useState<ArtSubTab>('portfolio');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingToEdit, setBookingToEdit] = useState<Booking | null>(null);
  const [activeTour, setActiveTour] = useState<TourKey | null>(null);
  
  // State for Stock Logic
  const [supplyLogModalState, setSupplyLogModalState] = useState<{ isOpen: boolean, booking: Booking | null, mode: 'log' | 'reserve' }>({ isOpen: false, booking: null, mode: 'log' });
  
  // State to pass to QuoteInvoiceManager
  const [bookingForQuote, setBookingForQuote] = useState<Booking | null>(null);

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
  };
  
  const handleOpenCreateModal = () => {
    setBookingToEdit(null);
    setIsBookingModalOpen(true);
  };

  const handleOpenEditModal = (booking: Booking) => {
    setBookingToEdit(booking);
    setIsBookingModalOpen(true);
  };

  const handleSaveBooking = async (bookingData: Booking) => {
    const previousStatus = bookingToEdit?.status;
    const newStatus = bookingData.status;

    if (bookingToEdit) { // Update existing booking
        await props.onUpdateBooking(bookingData);
        
        // Trigger Stock Checks based on Status Changes
        if (previousStatus !== 'confirmed' && newStatus === 'confirmed') {
            // Suggest Reserving Stock
            setSupplyLogModalState({ isOpen: true, booking: bookingData, mode: 'reserve' });
        } else if (previousStatus !== 'completed' && newStatus === 'completed') {
            // Force Log Usage
            setSupplyLogModalState({ isOpen: true, booking: bookingData, mode: 'log' });
        }

    } else { // Create new manual booking
        const { id, bookingType, ...newBookingData } = bookingData;
        await props.onManualAddBooking(newBookingData);
    }
  };
  
  const handleGenerateQuote = (booking: Booking) => {
      setBookingForQuote(booking);
      setIsBookingModalOpen(false);
      setActiveTab('invoices');
  };

  const renderDashboard = () => (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 items-start h-full overflow-hidden">
        <div className="lg:col-span-3 h-full overflow-hidden flex flex-col">
            <BookingsManager 
                bookings={props.bookings} 
                onUpdateBooking={props.onUpdateBooking} 
                selectedDate={selectedDate} 
                onClearDateFilter={() => setSelectedDate(null)}
                onAddManualBooking={handleOpenCreateModal}
                onEditBooking={handleOpenEditModal}
                onDeleteBooking={props.onDeleteBooking}
                onGenerateQuote={handleGenerateQuote}
                onShowHelp={setActiveTour}
            />
        </div>
        <div className="space-y-4 sm:space-y-6 lg:h-full lg:overflow-y-auto pr-1">
            <BookingCalendarWidget bookings={props.bookings} invoices={props.invoices} selectedDate={selectedDate} onDateSelect={setSelectedDate} />
        </div>
      </div>
  );
  
  const renderArtManagement = () => (
    <div className="space-y-6 h-full flex flex-col">
        <div className="flex justify-between items-center bg-admin-dark-bg p-1.5 rounded-xl border border-admin-dark-border shadow-sm flex-shrink-0">
            <div className="inline-flex">
                <button 
                    onClick={() => setArtSubTab('portfolio')} 
                    className={`px-3 sm:px-6 py-1.5 sm:py-2 text-[10px] sm:text-sm font-bold rounded-lg transition-all duration-200 ${artSubTab === 'portfolio' ? 'bg-white text-admin-dark-primary shadow-sm' : 'text-admin-dark-text-secondary hover:text-admin-dark-text'}`}
                >
                    Portfolio
                </button>
                <button 
                    onClick={() => setArtSubTab('showroom')} 
                    className={`px-3 sm:px-6 py-1.5 sm:py-2 text-[10px] sm:text-sm font-bold rounded-lg transition-all duration-200 ${artSubTab === 'showroom' ? 'bg-white text-admin-dark-primary shadow-sm' : 'text-admin-dark-text-secondary hover:text-admin-dark-text'}`}
                >
                    Showroom
                </button>
            </div>
            <button onClick={() => setActiveTour('art')} className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors" title="Guide: Art Management">
                <HelpIcon />
            </button>
        </div>
        
        <div className="flex-grow overflow-hidden">
            {artSubTab === 'portfolio' ? (
                <PortfolioManager 
                portfolioData={props.portfolioData} 
                onAddPortfolioItem={props.onAddPortfolioItem}
                onUpdatePortfolioItem={props.onUpdatePortfolioItem}
                onDeletePortfolioItem={props.onDeletePortfolioItem}
                startTour={setActiveTour} 
                />
            ) : (
                <ShowroomManager 
                showroomData={props.showroomData} 
                onAddShowroomGenre={props.onAddShowroomGenre}
                onUpdateShowroomGenre={props.onUpdateShowroomGenre}
                onDeleteShowroomGenre={props.onDeleteShowroomGenre}
                startTour={setActiveTour} 
                />
            )}
        </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'clients':
        return (
            <div className="h-full flex flex-col">
                <div className="flex justify-end mb-2 flex-shrink-0">
                    <button onClick={() => setActiveTour('clients')} className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full hover:bg-blue-100 transition-colors">
                        <HelpIcon className="w-3 h-3 sm:w-4 sm:h-4" /> Guide
                    </button>
                </div>
                <div className="flex-grow overflow-hidden">
                    <ClientsManager 
                        bookings={props.bookings} 
                        invoices={props.invoices} 
                        clients={props.clients} 
                        onAddClient={props.onAddClient} 
                        onUpdateClient={props.onUpdateClient} 
                        onDeleteClient={props.onDeleteClient}
                        logoUrl={props.logoUrl} 
                        loyaltyPrograms={props.loyaltyPrograms} 
                    />
                </div>
            </div>
        );
      case 'invoices':
        return (
            <div className="h-full flex flex-col">
                <div className="flex justify-end mb-2 flex-shrink-0">
                    <button onClick={() => setActiveTour('invoices')} className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full hover:bg-blue-100 transition-colors">
                        <HelpIcon className="w-3 h-3 sm:w-4 sm:h-4" /> Guide
                    </button>
                </div>
                <div className="flex-grow overflow-hidden">
                    <QuoteInvoiceManager 
                        invoices={props.invoices} 
                        bookings={props.bookings}
                        onAddInvoice={props.onAddInvoice}
                        onUpdateInvoice={props.onUpdateInvoice}
                        onDeleteInvoice={props.onDeleteInvoice}
                        initialBooking={bookingForQuote}
                        clients={props.clients}
                        onAddClient={props.onAddClient}
                        settings={{
                            taxEnabled: props.taxEnabled,
                            vatPercentage: props.vatPercentage,
                            companyName: props.companyName,
                            bankName: props.bankName,
                            accountNumber: props.accountNumber,
                            branchCode: props.branchCode,
                            logoUrl: props.logoUrl,
                            email: props.email,
                            address: props.address,
                            phone: props.phone
                        }}
                    />
                </div>
            </div>
        );
      case 'specials':
        return (
            <div className="h-full flex flex-col">
                <div className="flex justify-end mb-2 flex-shrink-0">
                    <button onClick={() => setActiveTour('specials')} className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full hover:bg-blue-100 transition-colors">
                        <HelpIcon className="w-3 h-3 sm:w-4 sm:h-4" /> Guide
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto">
                    <SpecialsManager specialsData={props.specialsData} onAddSpecialItem={props.onAddSpecialItem} onUpdateSpecialItem={props.onUpdateSpecialItem} onDeleteSpecialItem={props.onDeleteSpecialItem} />
                </div>
            </div>
        );
      case 'art':
        return renderArtManagement();
      case 'financials':
        return (
            <div className="h-full flex flex-col">
                <div className="flex justify-end mb-2 flex-shrink-0">
                    <button onClick={() => setActiveTour('financials')} className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full hover:bg-blue-100 transition-colors">
                        <HelpIcon className="w-3 h-3 sm:w-4 sm:h-4" /> Guide
                    </button>
                </div>
                <div className="flex-grow overflow-hidden">
                    <FinancialsManager {...props} startTour={setActiveTour} />
                </div>
            </div>
        );
      case 'inventory':
        return (
            <div className="h-full flex flex-col">
                <div className="flex justify-end mb-2 flex-shrink-0">
                    <button onClick={() => setActiveTour('inventory')} className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full hover:bg-blue-100 transition-colors">
                        <HelpIcon className="w-3 h-3 sm:w-4 sm:h-4" /> Guide
                    </button>
                </div>
                <div className="flex-grow overflow-hidden">
                    <InventoryManager inventory={props.inventory} onAddInventoryItem={props.onAddInventoryItem} onUpdateInventoryItem={props.onUpdateInventoryItem} onDeleteInventoryItem={props.onDeleteInventoryItem} />
                </div>
            </div>
        );
      case 'settings':
        return <SettingsManager {...props} startTour={setActiveTour} />;
      case 'setup':
        return (
            <div className="h-full flex flex-col bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="flex-grow overflow-y-auto p-6 bg-admin-dark-bg">
                    <SetupManager />
                </div>
            </div>
        );
      default:
        return renderDashboard();
    }
  };
  
  // Navigation Groups
  const navGroups = {
      primary: [
          { id: 'dashboard', label: 'Dash', icon: <IconDashboard /> },
          { id: 'clients', label: 'Clients', icon: <IconClients /> },
          { id: 'invoices', label: 'Docs', icon: <IconInvoice /> },
      ],
      secondary: [
          { id: 'specials', label: 'Offers', icon: <IconSpecials /> },
          { id: 'financials', label: 'Money', icon: <IconFinancials /> },
          { id: 'inventory', label: 'Stock', icon: <IconInventory /> },
          { id: 'art', label: 'Art', icon: <IconArt /> },
          { id: 'settings', label: 'Settings', icon: <IconSettings /> },
          { id: 'setup', label: 'Setup', icon: <SetupIcon /> },
      ]
  };
  
  return (
    <div className="h-screen font-sans bg-admin-dark-bg text-admin-dark-text flex flex-col overflow-hidden" role="application">
      
      <BookingModal 
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSave={handleSaveBooking}
        bookingToEdit={bookingToEdit}
        onGenerateQuote={handleGenerateQuote}
      />
      
      <LogSuppliesModal 
        isOpen={supplyLogModalState.isOpen}
        onClose={() => setSupplyLogModalState({ ...supplyLogModalState, isOpen: false })}
        booking={supplyLogModalState.booking}
        inventory={props.inventory}
        onAddExpense={props.onAddExpense}
        onUpdateInventoryItem={props.onUpdateInventoryItem}
        mode={supplyLogModalState.mode}
      />
      
      <TrainingGuide activeTour={activeTour} onClose={() => setActiveTour(null)} />

      {/* --- NEW 2-ROW HEADER LAYOUT --- */}
      <header className="bg-white/80 backdrop-blur-md border-b border-admin-dark-border sticky top-0 z-40 shadow-sm flex-shrink-0">
          <div className="px-2 sm:px-4 py-2">
              <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                       <img src={props.logoUrl} alt="Logo" className="w-12 h-12 object-contain" />
                       <span className="font-bold text-lg text-admin-dark-text tracking-wide hidden xs:inline">Admin</span>
                  </div>
                  
                  {/* Row 1: Primary Actions */}
                  <div className="flex gap-1">
                      {navGroups.primary.map(item => (
                          <button 
                              key={item.id}
                              onClick={() => handleTabChange(item.id as AdminTab)}
                              className={`
                                  flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all
                                  ${activeTab === item.id 
                                      ? 'bg-admin-dark-primary text-white shadow-md' 
                                      : 'bg-white border border-gray-200 text-admin-dark-text-secondary hover:bg-gray-50'
                                  }
                              `}
                          >
                              <span className="scale-75">{item.icon}</span>
                              <span className="hidden sm:inline">{item.label}</span>
                          </button>
                      ))}
                  </div>

                  <div className="flex gap-2">
                       <button onClick={() => props.onNavigate('home')} className="p-2 text-admin-dark-text-secondary hover:text-admin-dark-text" title="View Site"><SiteIcon /></button>
                       <button onClick={props.onLogout} className="p-2 text-red-500 hover:text-red-600" title="Logout"><LogoutIcon /></button>
                  </div>
              </div>

              {/* Row 2: Secondary Sections */}
              <div className="flex flex-wrap justify-between gap-1 pb-1">
                  {navGroups.secondary.map(item => (
                      <button 
                          key={item.id}
                          onClick={() => handleTabChange(item.id as AdminTab)}
                          className={`
                              flex-grow sm:flex-grow-0 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border
                              ${activeTab === item.id 
                                  ? 'bg-admin-dark-secondary/20 text-admin-dark-text border-admin-dark-secondary' 
                                  : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100'
                              }
                          `}
                      >
                          <span className="scale-75">{item.icon}</span>
                          <span className="whitespace-nowrap">{item.label}</span>
                      </button>
                  ))}
              </div>
          </div>
      </header>

      <main className="flex-1 p-2 sm:p-6 overflow-y-auto overflow-x-hidden bg-admin-dark-bg" id="admin-main-content">
        <div className="max-w-[1920px] mx-auto h-full">
            {renderContent()}
        </div>
      </main>

    </div>
  );
};

export default AdminDashboard;
