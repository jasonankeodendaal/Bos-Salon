
import React, { useState } from 'react';
import { dbLoginWithGoogle } from '../utils/dbAdapter';
import { Client, Booking, Invoice, LoyaltyProgram } from '../App';

interface ClientPortalProps {
    onNavigate: (view: 'home' | 'admin' | 'client-portal') => void;
    logoUrl: string;
    companyName: string;
    clients: Client[];
    bookings: Booking[];
    invoices: Invoice[];
    loyaltyPrograms: LoyaltyProgram[];
}

const ClientPortal: React.FC<ClientPortalProps> = ({ onNavigate, logoUrl, companyName, clients, bookings, invoices, loyaltyPrograms }) => {
    const [userEmail, setUserEmail] = useState('');
    const [pin, setPin] = useState('');
    const [loggedInClient, setLoggedInClient] = useState<Client | null>(null);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const client = clients.find(c => c.email.toLowerCase() === userEmail.toLowerCase() && c.password === pin);
        if (client) {
            setLoggedInClient(client);
        } else {
            alert("Invalid credentials.");
        }
    };

    const handleGoogleLogin = async () => {
        try {
            sessionStorage.setItem('auth_redirect', 'client-portal');
            await dbLoginWithGoogle();
        } catch (error) {
            console.error("Google Login Error:", error);
            alert("Failed to initiate Google Login.");
            sessionStorage.removeItem('auth_redirect');
        }
    };

    if (loggedInClient) {
        return (
            <div className="min-h-screen bg-gray-100 p-4">
                <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                    <header className="p-4 bg-brand-green text-white flex justify-between items-center">
                        <h1 className="text-xl font-bold">Welcome, {loggedInClient.name}</h1>
                        <button onClick={() => setLoggedInClient(null)} className="text-sm underline hover:text-gray-200">Logout</button>
                    </header>
                    <div className="p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Your Dashboard</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <h3 className="font-bold text-gray-700 mb-2">Upcoming Bookings</h3>
                                <ul className="space-y-2">
                                    {bookings.filter(b => b.email.toLowerCase() === loggedInClient.email.toLowerCase() && new Date(b.bookingDate) >= new Date()).length > 0 ? (
                                        bookings.filter(b => b.email.toLowerCase() === loggedInClient.email.toLowerCase() && new Date(b.bookingDate) >= new Date())
                                        .map(b => (
                                            <li key={b.id} className="text-sm text-gray-600 flex justify-between">
                                                <span>{new Date(b.bookingDate).toLocaleDateString()}</span>
                                                <span className="font-semibold">{b.status}</span>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-sm text-gray-500 italic">No upcoming bookings.</li>
                                    )}
                                </ul>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <h3 className="font-bold text-gray-700 mb-2">Recent Invoices</h3>
                                <ul className="space-y-2">
                                    {invoices.filter(i => i.clientEmail.toLowerCase() === loggedInClient.email.toLowerCase()).length > 0 ? (
                                        invoices.filter(i => i.clientEmail.toLowerCase() === loggedInClient.email.toLowerCase())
                                        .slice(0, 5)
                                        .map(i => (
                                            <li key={i.id} className="text-sm text-gray-600 flex justify-between">
                                                <span>{i.number}</span>
                                                <span className="font-semibold">R{i.total}</span>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-sm text-gray-500 italic">No invoices found.</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full text-center">
                {logoUrl && <img src={logoUrl} alt="Logo" className="w-24 h-24 mx-auto object-contain mb-4" />}
                <h2 className="text-2xl font-bold text-gray-800 mb-6">{companyName} Client Portal</h2>
                
                <form onSubmit={handleLogin} className="space-y-4 mb-6">
                    <input 
                        type="email" 
                        placeholder="Email" 
                        value={userEmail} 
                        onChange={e => setUserEmail(e.target.value)} 
                        className="w-full border p-2 rounded focus:ring-2 focus:ring-brand-green outline-none" 
                        required 
                    />
                    <input 
                        type="password" 
                        placeholder="PIN" 
                        value={pin} 
                        onChange={e => setPin(e.target.value)} 
                        className="w-full border p-2 rounded focus:ring-2 focus:ring-brand-green outline-none" 
                        required 
                    />
                    <button type="submit" className="w-full bg-brand-green text-white py-2 rounded font-bold hover:opacity-90 transition-opacity">Login with PIN</button>
                </form>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or</span></div>
                </div>

                <button onClick={handleGoogleLogin} className="w-full border border-gray-300 py-2 rounded font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors">
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                    Sign in with Google
                </button>

                <div className="mt-6">
                    <button onClick={() => onNavigate('home')} className="text-sm text-blue-500 hover:underline">Back to Home</button>
                </div>
            </div>
        </div>
    );
};

export default ClientPortal;
