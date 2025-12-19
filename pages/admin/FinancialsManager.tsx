
import React, { useState, useMemo } from 'react';
import { Expense, InventoryItem, Booking } from '../../App';
import YearlyProfitChart from './components/YearlyProfitChart';
import LogSuppliesModal from './components/LogSuppliesModal';

// --- UI Components ---

const StatCard: React.FC<{ 
    title: string; 
    value: string; 
    subValue?: string; 
    trend?: number; 
    icon: string;
    colorClass: string;
}> = ({ title, value, subValue, trend, icon, colorClass }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-2 sm:p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow h-full">
        <div>
            <p className="text-gray-500 text-[8px] sm:text-xs font-bold uppercase tracking-wider mb-0.5 truncate">{title}</p>
            <h3 className={`text-sm sm:text-2xl font-bold ${colorClass}`}>{value}</h3>
            {subValue && <p className="text-gray-400 text-[8px] sm:text-xs mt-0.5 hidden sm:block">{subValue}</p>}
        </div>
        <div className="flex justify-between items-end mt-1">
             {trend !== undefined && (
                <div className={`text-[8px] sm:text-xs font-bold ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    <span>{trend >= 0 ? '▲' : '▼'}</span>
                    <span className="hidden sm:inline">{Math.abs(trend).toFixed(0)}%</span>
                </div>
            )}
            <div className={`p-1 sm:p-2 rounded-md ${colorClass.replace('text-', 'bg-').replace('600', '100').replace('500', '100').replace('400', '100')}`}>
                <span className="text-xs sm:text-lg">{icon}</span>
            </div>
        </div>
    </div>
);

// --- Helper for Income Row ---
interface IncomeRowProps {
    booking: Booking;
    onUpdate: (b: Booking) => Promise<void>;
    terminalEnabled?: boolean;
}

const IncomeRow: React.FC<IncomeRowProps> = ({ booking, onUpdate, terminalEnabled }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isPushingToTerminal, setIsPushingToTerminal] = useState(false);
    const [amountTendered, setAmountTendered] = useState<number>(0);
    const [data, setData] = useState({
        totalCost: booking.totalCost || 0,
        amountPaid: booking.amountPaid || 0,
        paymentMethod: booking.paymentMethod || 'cash',
        status: booking.status
    });

    const handleSave = async () => {
        await onUpdate({
            ...booking,
            totalCost: data.totalCost,
            amountPaid: data.amountPaid,
            paymentMethod: data.paymentMethod as any,
        });
        setIsEditing(false);
    };

    const handleChargeTerminal = async () => {
        if (!data.totalCost) return alert("Enter amount first!");
        
        setIsPushingToTerminal(true);
        // SIMULATION: In production, this calls a Supabase Edge Function which calls Yoco Terminal API
        setTimeout(async () => {
            if(window.confirm("SIMULATION: Machine Charged. Card Tapped? (Confirm Approval)")) {
                await onUpdate({
                    ...booking,
                    totalCost: data.totalCost,
                    amountPaid: data.totalCost,
                    paymentMethod: 'card',
                    status: 'completed'
                });
                setData({ ...data, amountPaid: data.totalCost, paymentMethod: 'card', status: 'completed' });
                alert("Terminal Approved. Booking updated.");
            }
            setIsPushingToTerminal(false);
        }, 2000);
    };

    const isPaid = data.amountPaid >= data.totalCost && data.totalCost > 0;
    const isPartial = data.amountPaid > 0 && data.amountPaid < data.totalCost;
    const changeDue = Math.max(0, amountTendered - data.amountPaid);

    const inputClass = "bg-gray-50 border border-gray-300 rounded px-1 py-0.5 text-gray-900 text-xs w-16 focus:ring-1 focus:ring-blue-500 outline-none";
    const selectClass = "bg-gray-50 border border-gray-300 rounded px-1 py-0.5 text-gray-900 text-xs focus:ring-1 focus:ring-blue-500 outline-none";

    return (
        <tr className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 text-[10px] sm:text-sm">
            <td className="px-2 py-2 text-gray-700">
                <div className="font-semibold">{new Date(booking.bookingDate).toLocaleDateString(undefined, {month:'numeric', day:'numeric'})}</div>
            </td>
            <td className="px-2 py-2">
                <div className="text-gray-800 font-bold truncate max-w-[80px] sm:max-w-none">{booking.name}</div>
            </td>
            <td className="px-2 py-2">
                <span className={`px-1.5 py-0.5 rounded text-[8px] sm:text-[10px] font-bold uppercase tracking-wide ${
                    booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                    booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                }`}>
                    {booking.status === 'completed' ? 'Done' : booking.status.substring(0,4)}
                </span>
            </td>
            
            <td className="px-2 py-2">
                {isEditing ? (
                    <input 
                        type="number" 
                        value={data.totalCost} 
                        onChange={e => setData({...data, totalCost: parseFloat(e.target.value)})} 
                        className={inputClass}
                        step="0.01"
                    />
                ) : (
                    <span className="text-gray-900 font-mono">R{data.totalCost.toFixed(0)}</span>
                )}
            </td>
            <td className="px-2 py-2">
                {isEditing ? (
                    <div className="flex flex-col gap-1">
                        <input 
                            type="number" 
                            value={data.amountPaid} 
                            onChange={e => setData({...data, amountPaid: parseFloat(e.target.value)})} 
                            className={inputClass}
                            step="0.01"
                            placeholder="Paid"
                        />
                        {data.paymentMethod === 'cash' && (
                            <div className="flex flex-col gap-1 mt-1 p-1 bg-blue-50 rounded border border-blue-100">
                                <label className="text-[8px] font-bold text-blue-600 uppercase">Tendered</label>
                                <input 
                                    type="number" 
                                    value={amountTendered || ''} 
                                    onChange={e => setAmountTendered(parseFloat(e.target.value) || 0)} 
                                    className={`${inputClass} border-blue-200`}
                                    placeholder="R"
                                />
                                {amountTendered > 0 && (
                                    <div className="text-[9px] font-bold text-green-600">
                                        Change: R{changeDue.toFixed(2)}
                                    </div>
                                )}
                            </div>
                        )}
                        {data.paymentMethod === 'card' && terminalEnabled && (
                            <button 
                                type="button"
                                onClick={handleChargeTerminal}
                                disabled={isPushingToTerminal}
                                className="mt-1 bg-yellow-500 text-white text-[9px] font-bold py-1 rounded shadow-sm hover:bg-yellow-600 transition-colors uppercase flex items-center justify-center gap-1"
                            >
                                {isPushingToTerminal ? (
                                    <span className="w-2 h-2 border border-white border-t-transparent rounded-full animate-spin"></span>
                                ) : "📟 Charge Machine"}
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col">
                        <span className={`font-mono font-bold ${isPaid ? 'text-green-600' : isPartial ? 'text-orange-500' : 'text-red-500'}`}>
                            R{data.amountPaid.toFixed(0)}
                        </span>
                    </div>
                )}
            </td>
            <td className="px-2 py-2 hidden sm:table-cell">
                {isEditing ? (
                    <select 
                        value={data.paymentMethod} 
                        onChange={e => setData({...data, paymentMethod: e.target.value as any})} 
                        className={selectClass}
                    >
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="eft">EFT</option>
                        <option value="other">Other</option>
                    </select>
                ) : (
                    <span className="capitalize text-gray-600">
                        {data.paymentMethod}
                    </span>
                )}
            </td>
            <td className="px-2 py-2 text-right">
                {isEditing ? (
                    <div className="flex gap-1 justify-end">
                        <button onClick={() => setIsEditing(false)} className="text-red-500">✕</button>
                        <button onClick={handleSave} className="text-green-600">✓</button>
                    </div>
                ) : (
                    <button onClick={() => setIsEditing(true)} className="text-blue-500 text-[10px] sm:text-xs font-bold">
                        Edit
                    </button>
                )}
            </td>
        </tr>
    );
};

// --- Main Manager ---

interface FinancialsManagerProps {
    bookings: Booking[];
    expenses: Expense[];
    inventory: InventoryItem[];
    // CRUD
    onAddExpense: (e: any) => Promise<void>;
    onUpdateExpense: (e: any) => Promise<void>;
    onDeleteExpense: (id: string) => Promise<void>;
    onUpdateBooking: (booking: Booking) => Promise<void>; 
    // Settings
    taxEnabled: boolean;
    vatPercentage: number;
    startTour: (key: any) => void;
    // New: Payment Settings
    payments?: {
        terminalEnabled?: boolean;
    }
}

const FinancialsManager: React.FC<FinancialsManagerProps> = (props) => {
    const [tab, setTab] = useState<'overview' | 'income' | 'expenses'>('overview');
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth()); // 0-11

    // --- Calculations ---
    const getMonthlyStats = (y: number, m: number) => {
        const targetBookings = props.bookings.filter(b => {
            const d = new Date(b.bookingDate);
            return b.status === 'completed' && d.getFullYear() === y && d.getMonth() === m;
        });
        const targetExpenses = props.expenses.filter(e => {
            const d = new Date(e.date);
            return d.getFullYear() === y && d.getMonth() === m;
        });

        const revenue = targetBookings.reduce((sum, b) => sum + (b.totalCost || 0), 0);
        const expense = targetExpenses.reduce((sum, e) => sum + e.amount, 0);
        const vat = props.taxEnabled ? revenue * (props.vatPercentage / 100) : 0;
        const profit = revenue - expense - vat;

        return { revenue, expense, vat, profit };
    };

    const currentStats = useMemo(() => getMonthlyStats(year, month), [year, month, props.bookings, props.expenses]);
    
    // Previous Month Logic
    const prevDate = new Date(year, month - 1, 1);
    const prevStats = useMemo(() => getMonthlyStats(prevDate.getFullYear(), prevDate.getMonth()), [year, month, props.bookings, props.expenses]);

    const calculateGrowth = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    };

    // Filtered Lists
    const monthlyBookings = props.bookings.filter(b => {
        const d = new Date(b.bookingDate);
        return d.getFullYear() === year && d.getMonth() === month;
    }).sort((a,b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());

    const monthlyExpenses = props.expenses.filter(e => {
        const d = new Date(e.date);
        return d.getFullYear() === year && d.getMonth() === month;
    }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Expense Form State
    const [newExpense, setNewExpense] = useState<Partial<Expense>>({ date: new Date().toISOString().split('T')[0], category: 'Supplies' });

    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        await props.onAddExpense(newExpense);
        setNewExpense({ date: new Date().toISOString().split('T')[0], category: 'Supplies', amount: 0, description: '' });
    };

    const tabs = [
        { id: 'overview', label: 'Over' },
        { id: 'income', label: 'In' },
        { id: 'expenses', label: 'Exp' }
    ];

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return (
        <div className="bg-gray-50 border border-gray-200 rounded-xl shadow-lg p-2 sm:p-6 h-full flex flex-col font-sans text-gray-800">
            {/* Header Area */}
            <header className="flex flex-col xl:flex-row justify-between xl:items-center mb-4 sm:mb-8 gap-3 shrink-0">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Finance</h2>
                    {/* Tabs Mobile */}
                    <div className="bg-gray-200 p-0.5 rounded-lg inline-flex">
                        {tabs.map((t) => (
                            <button 
                                key={t.id}
                                onClick={() => setTab(t.id as any)} 
                                className={`px-3 py-1 rounded text-xs font-bold transition-all ${tab === t.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="flex gap-2 items-center bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm self-start">
                    <div className="flex items-center gap-1">
                        <button onClick={() => setMonth(m => m === 0 ? 11 : m - 1)} className="p-1 hover:bg-gray-100 rounded text-gray-500 text-xs">◀</button>
                        <span className="font-bold text-gray-800 w-12 text-center text-xs">{months[month]}</span>
                        <button onClick={() => setMonth(m => m === 11 ? 0 : m + 1)} className="p-1 hover:bg-gray-100 rounded text-gray-500 text-xs">▶</button>
                    </div>
                    <div className="h-4 w-px bg-gray-200"></div>
                    <select 
                        value={year} 
                        onChange={(e) => setYear(parseInt(e.target.value))} 
                        className="bg-transparent font-bold text-gray-800 outline-none cursor-pointer hover:text-blue-600 text-xs"
                    >
                        {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto pr-1">
            {tab === 'overview' && (
                <div className="space-y-4 sm:space-y-6 animate-fade-in">
                    {/* KPI Cards Row - Forced 4 cols on mobile */}
                    <div className="grid grid-cols-4 lg:grid-cols-4 gap-2 sm:gap-4">
                        <StatCard 
                            title="Revenue" 
                            value={`R${currentStats.revenue.toFixed(0)}`} 
                            trend={calculateGrowth(currentStats.revenue, prevStats.revenue)}
                            icon="💰"
                            colorClass="text-green-600"
                        />
                        <StatCard 
                            title="Exp" 
                            value={`R${currentStats.expense.toFixed(0)}`} 
                            trend={calculateGrowth(currentStats.expense, prevStats.expense)}
                            icon="💸"
                            colorClass="text-red-500"
                        />
                        <StatCard 
                            title="VAT" 
                            value={`R${currentStats.vat.toFixed(0)}`} 
                            icon="🏛️"
                            colorClass="text-orange-500"
                        />
                        <StatCard 
                            title="Profit" 
                            value={`R${currentStats.profit.toFixed(0)}`} 
                            trend={calculateGrowth(currentStats.profit, prevStats.profit)}
                            icon="📈"
                            colorClass="text-blue-600"
                        />
                    </div>

                    {/* Chart & Summary Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-3 sm:p-5 shadow-sm hidden sm:block">
                            <YearlyProfitChart bookings={props.bookings} expenses={props.expenses} selectedYear={year} />
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-5 shadow-sm flex flex-col">
                            <h4 className="font-bold text-gray-800 mb-2 border-b border-gray-100 pb-1 text-sm">Stats ({months[month]})</h4>
                            <div className="space-y-2 flex-grow text-xs sm:text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Bookings Done</span>
                                    <span className="font-bold text-gray-900">{monthlyBookings.filter(b => b.status === 'completed').length}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Avg. Value</span>
                                    <span className="font-bold text-gray-900">
                                        R{monthlyBookings.filter(b => b.status === 'completed').length > 0 
                                            ? (currentStats.revenue / monthlyBookings.filter(b => b.status === 'completed').length).toFixed(0) 
                                            : '0'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {tab === 'income' && (
                <div className="animate-fade-in grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 h-full">
                    {/* Transaction Table */}
                    <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800 text-sm">Transactions</h3>
                            <span className="text-xs text-gray-500">{monthlyBookings.length}</span>
                        </div>
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-100 text-gray-500 uppercase text-[9px] sm:text-xs sticky top-0 z-10">
                                    <tr>
                                        <th className="px-2 py-2 font-semibold">Date</th>
                                        <th className="px-2 py-2 font-semibold">Client</th>
                                        <th className="px-2 py-2 font-semibold">Sts</th>
                                        <th className="px-2 py-2 font-semibold">Cost</th>
                                        <th className="px-2 py-2 font-semibold">Paid</th>
                                        <th className="px-2 py-2 font-semibold hidden sm:table-cell">Method</th>
                                        <th className="px-2 py-2 text-right font-semibold"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {monthlyBookings.map(booking => (
                                        <IncomeRow 
                                            key={booking.id} 
                                            booking={booking} 
                                            onUpdate={props.onUpdateBooking} 
                                            terminalEnabled={props.payments?.terminalEnabled}
                                        />
                                    ))}
                                    {monthlyBookings.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="text-center py-8 text-gray-400 text-xs">
                                                No bookings found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {tab === 'expenses' && (
                <div className="animate-fade-in grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 h-full">
                    {/* Add Expense Panel */}
                    <div className="xl:col-span-1 space-y-4">
                        <form onSubmit={handleAddExpense} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
                             <h3 className="font-bold text-gray-800 border-b border-gray-100 pb-2 text-sm">Log Expense</h3>
                             
                             <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Date</label>
                                    <input type="date" value={newExpense.date} onChange={e => setNewExpense({...newExpense, date: e.target.value})} className="w-full bg-gray-50 border border-gray-300 rounded p-1.5 text-gray-900 outline-none text-xs" required/>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Category</label>
                                    <select value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value as any})} className="w-full bg-gray-50 border border-gray-300 rounded p-1.5 text-gray-900 outline-none text-xs">
                                        <option>Supplies</option><option>Rent</option><option>Stock</option><option>Marketing</option><option>Utilities</option><option>Other</option>
                                    </select>
                                </div>
                             </div>

                             <div>
                                <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Desc</label>
                                <input type="text" placeholder="e.g. Ink" value={newExpense.description || ''} onChange={e => setNewExpense({...newExpense, description: e.target.value})} className="w-full bg-gray-50 border border-gray-300 rounded p-1.5 text-gray-900 outline-none text-xs" required/>
                             </div>

                             <div>
                                <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Amount (R)</label>
                                <div className="flex gap-2">
                                    <input type="number" placeholder="0.00" value={newExpense.amount || ''} onChange={e => setNewExpense({...newExpense, amount: parseFloat(e.target.value)})} className="flex-1 bg-gray-50 border border-gray-300 rounded p-1.5 text-gray-900 outline-none text-xs" step="0.01" required/>
                                    <button type="submit" className="bg-red-500 text-white px-3 rounded font-bold text-xs hover:bg-red-600 shadow-md">Add</button>
                                </div>
                             </div>
                        </form>
                    </div>

                    {/* Expense Table */}
                    <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800 text-sm">Expenses</h3>
                            <span className="text-xs text-gray-500 font-bold">R{currentStats.expense.toFixed(0)}</span>
                        </div>
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-gray-100 text-gray-500 uppercase text-[9px] sticky top-0">
                                    <tr>
                                        <th className="px-2 py-2 font-semibold">Date</th>
                                        <th className="px-2 py-2 font-semibold">Cat</th>
                                        <th className="px-2 py-2 font-semibold">Desc</th>
                                        <th className="px-2 py-2 font-semibold">Amt</th>
                                        <th className="px-2 py-2"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {monthlyExpenses.map(exp => (
                                        <tr key={exp.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-2 py-2 text-gray-800">{new Date(exp.date).toLocaleDateString(undefined, {month:'numeric', day:'numeric'})}</td>
                                            <td className="px-2 py-2"><span className="bg-gray-100 text-gray-600 px-1 py-0.5 rounded text-[9px] border border-gray-200">{exp.category.substring(0,4)}</span></td>
                                            <td className="px-2 py-2 text-gray-600 truncate max-w-[80px]">{exp.description}</td>
                                            <td className="px-2 py-2 text-red-500 font-mono font-bold">R{exp.amount.toFixed(0)}</td>
                                            <td className="px-2 py-2 text-right">
                                                <button onClick={() => props.onDeleteExpense(exp.id)} className="text-red-400 hover:text-red-600 p-1">&times;</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {monthlyExpenses.length === 0 && (
                                        <tr><td colSpan={5} className="text-center py-8 text-gray-400">No expenses.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};

export default FinancialsManager;
