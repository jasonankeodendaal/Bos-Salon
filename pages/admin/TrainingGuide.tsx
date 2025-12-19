
import React, { useState } from 'react';

export type TourKey = 'dashboard' | 'art' | 'financials' | 'settings' | 'clients' | 'invoices' | 'inventory' | 'specials' | 'pwa' | 'yoco' | 'yoco-terminal';

interface TrainingGuideProps {
    activeTour: TourKey | null;
    onClose: () => void;
}

const contentMap: Record<TourKey, { title: string; content: React.ReactNode }> = {
    dashboard: {
        title: "Dashboard & Booking Workflow",
        content: (
            <div className="space-y-6 text-gray-700 leading-relaxed text-sm">
                <section>
                    <h4 className="font-bold text-lg text-brand-green mb-2">The Golden Workflow</h4>
                    <p className="mb-2">The system is designed around a specific lifecycle for bookings to ensure you get paid and clients stay informed:</p>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <ol className="list-decimal pl-5 space-y-2">
                            <li><strong>Pending:</strong> A client requests a slot (online or you add it manually). It sits here until you review it.</li>
                            <li><strong>Quote Sent:</strong> You click <em>"Build Quote"</em>. This generates a price estimate. You send it to the client via WhatsApp.</li>
                            <li><strong>Confirmed:</strong> Once the client accepts the quote (or pays a deposit), the status becomes Confirmed. This blocks the slot on your calendar.</li>
                            <li><strong>Completed:</strong> You finish the job. Marking it completed calculates your revenue.</li>
                        </ol>
                    </div>
                </section>

                <section>
                    <h4 className="font-bold text-lg text-brand-green mb-2">Calendar & Clock</h4>
                    <ul className="list-disc pl-5 space-y-1">
                        <li><strong>Calendar:</strong> Dots indicate bookings. Red dots indicate invoices due. Click a date to filter the list on the left.</li>
                        <li><strong>Reminder Clock:</strong> This widget specifically looks for <em>Confirmed</em> bookings in the next few days so you never miss an appointment.</li>
                    </ul>
                </section>
                
                <section>
                    <h4 className="font-bold text-lg text-brand-green mb-2">Inventory Logic</h4>
                    <p>When you move a booking to <strong>Completed</strong>, the system will automatically pop up a "Log Supplies" window. This allows you to deduct the exact amount of polish/supplies used, keeping your stock levels accurate without manual counting later.</p>
                </section>
            </div>
        )
    },
    clients: {
        title: "Client Database & Bos Identity",
        content: (
            <div className="space-y-6 text-gray-700 leading-relaxed text-sm">
                <section className="bg-brand-pink/10 p-4 rounded-xl border border-brand-pink/20">
                    <h4 className="font-bold text-lg text-brand-green mb-2">System Overview (How it works)</h4>
                    <ul className="space-y-3">
                        <li className="flex gap-2">
                            <span className="text-brand-green">💅</span>
                            <span><strong>The Request:</strong> Clients fill out the form on your site with details and up to 5 reference images.</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-brand-green">🌸</span>
                            <span><strong>Bos Identity:</strong> Upon registration, clients must fill in their Full Name, Tel, Email, Age, and Address. This creates their digital profile.</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-brand-green">🏰</span>
                            <span><span><strong>The Sanctuary:</strong> This is the Client Portal. Clients can track their "Journey," view history, and check rewards here.</span></span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-brand-green">📱</span>
                            <span><strong>WhatsApp Bridge:</strong> When you build a quote, the system generates a message with a direct link and their private PIN for one-click login.</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-brand-green">💳</span>
                            <span><strong>Payment Handling:</strong> Clients pay online via Yoco (auto-syncs to Paid) or you log Cash/EFT manually in the Financials tab.</span>
                        </li>
                    </ul>
                </section>

                <section>
                    <h4 className="font-bold text-lg text-brand-green mb-2">How to Activate a Client</h4>
                    <div className="mt-2 bg-blue-50 p-3 rounded border border-blue-100">
                        <ol className="list-decimal pl-5 space-y-1">
                            <li>Select a client from the grid.</li>
                            <li>In their profile, click <strong>"Activate Account"</strong> if they haven't registered themselves.</li>
                            <li>Set a simple PIN (e.g., 1234).</li>
                            <li>Click the <strong>WhatsApp Login</strong> button to send them their link and PIN instantly.</li>
                        </ol>
                    </div>
                </section>
            </div>
        )
    },
    invoices: {
        title: "Quotes & Invoicing Engine",
        content: (
            <div className="space-y-6 text-gray-700 leading-relaxed text-sm">
                <section>
                    <h4 className="font-bold text-lg text-brand-green mb-2">Quote vs. Invoice</h4>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Quote (Q-xxxx):</strong> A proposal. Sending this does NOT confirm the booking financially. It just tells the client "This is what it will cost".</li>
                        <li><strong>Invoice (INV-xxxx):</strong> A demand for payment. You can convert a Quote to an Invoice with one click.</li>
                    </ul>
                </section>
            </div>
        )
    },
    art: {
        title: "Portfolio & Showroom Management",
        content: (
            <div className="space-y-6 text-gray-700 leading-relaxed text-sm">
                <section>
                    <h4 className="font-bold text-lg text-brand-green mb-2">Two Types of Galleries</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded">
                            <strong>1. Portfolio (Home Page)</strong>
                            <p className="mt-1 text-xs">These are your best nail and beauty works. They appear in the Hero section carousel.</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                            <strong>2. Showroom (Flash Wall)</strong>
                            <p className="mt-1 text-xs">This is your catalog of designs. Organized by Genre. Clients browse this to pick specific styles.</p>
                        </div>
                    </div>
                </section>
            </div>
        )
    },
    financials: {
        title: "Financial Intelligence",
        content: (
            <div className="space-y-6 text-gray-700 leading-relaxed text-sm">
                <section>
                    <h4 className="font-bold text-lg text-brand-green mb-2">Net Profit Calculation</h4>
                    <p className="font-mono bg-gray-100 p-2 rounded text-center mb-2">
                        (Revenue from Completed Bookings) - (Logged Expenses) - (VAT) = <strong>Net Profit</strong>
                    </p>
                    <p><strong>Important:</strong> A booking must be marked "Completed" to count as Revenue.</p>
                </section>
            </div>
        )
    },
    inventory: {
        title: "Inventory Control",
        content: (
            <div className="space-y-6 text-gray-700 leading-relaxed text-sm">
                <section>
                    <h4 className="font-bold text-lg text-brand-green mb-2">Smart Dosing</h4>
                    <p>Instead of guessing milliliters:</p>
                    <ol className="list-decimal pl-5 space-y-2 mt-2">
                        <li>Set up your items with a total quantity (e.g., 100ml bottle).</li>
                        <li>When you finish a booking, the log popup appears.</li>
                        <li>Click <strong>"+1 Service"</strong>.</li>
                        <li>The system automatically deducts average usage.</li>
                    </ol>
                </section>
            </div>
        )
    },
    specials: {
        title: "Specials & Offers",
        content: (
            <div className="space-y-6 text-gray-700 leading-relaxed text-sm">
                <p>This controls the "Seasonal Specials" section on the public site.</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Active Toggle:</strong> Draft a special and keep it inactive until launch.</li>
                    <li><strong>Price Types:</strong> "Fixed", "Hourly", or "Percentage" for discount badges.</li>
                </ul>
            </div>
        )
    },
    settings: {
        title: "Global Configuration",
        content: (
            <div className="space-y-6 text-gray-700 leading-relaxed text-sm">
                <p>This is the CMS (Content Management System) for your entire website.</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Branding:</strong> Change your logo, company name, and contact details.</li>
                    <li><strong>Maintenance Mode:</strong> Hides the website from the public while you work.</li>
                </ul>
            </div>
        )
    },
    yoco: {
        title: "Yoco Payments (Online)",
        content: (
            <div className="space-y-6 text-gray-700 leading-relaxed text-sm">
                <section>
                    <h4 className="font-bold text-lg text-brand-green mb-2">Portal Payments</h4>
                    <p>Allows clients to pay deposits via Debit/Credit card directly in their portal. Requires your Yoco Public and Secret keys.</p>
                </ol>
            </div>
        )
    },
    'yoco-terminal': {
        title: "Yoco Machine (Terminal) Integration",
        content: (
            <div className="space-y-6 text-gray-700 leading-relaxed text-sm">
                <section>
                    <h4 className="font-bold text-lg text-brand-green mb-2">Push to Machine</h4>
                    <p>Instead of typing amounts into your machine manually, you can "push" the charge from your dashboard.</p>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
                        <h5 className="font-bold text-gray-900 mb-1">How to use:</h5>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Go to <strong>Finance &rarr; Transactions</strong>.</li>
                            <li>Click <strong>Edit</strong> on a booking.</li>
                            <li>Select <strong>Card</strong> as the payment method.</li>
                            <li>Click the <strong>📟 Charge Machine</strong> button.</li>
                            <li>Your machine will beep and show the amount.</li>
                        </ul>
                    </div>
                </section>
            </div>
        )
    },
    pwa: {
        title: "PWA & Mobile App",
        content: (
            <div className="space-y-6 text-gray-700 leading-relaxed text-sm">
                <p>Your website is a Progressive Web App. It can be installed on phones just like a native app.</p>
            </div>
        )
    }
};

const TrainingGuide: React.FC<TrainingGuideProps> = ({ activeTour, onClose }) => {
    const [isClosing, setIsClosing] = useState(false);

    if (!activeTour) return null;

    const data = contentMap[activeTour] || { title: 'Help Guide', content: 'No information available for this section.' };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 300);
    };

    return (
        <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`} role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleClose}></div>
            
            <div className={`relative bg-white w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col transform transition-all duration-300 ${isClosing ? 'scale-95 translate-y-4' : 'scale-100 translate-y-0'}`}>
                <div className="bg-gradient-to-r from-brand-pink to-brand-green p-6 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3 text-white">
                        <span className="text-3xl">💡</span>
                        <h2 className="text-2xl font-bold tracking-wide">{data.title}</h2>
                    </div>
                    <button onClick={handleClose} className="text-white/80 hover:text-white text-3xl font-bold leading-none">&times;</button>
                </div>
                <div className="p-8 overflow-y-auto">
                    {data.content}
                </div>
                <div className="p-6 border-t border-gray-100 bg-gray-50 text-right shrink-0">
                    <button onClick={handleClose} className="bg-brand-green text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:opacity-90 transition-transform transform hover:-translate-y-0.5">
                        Got it!
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TrainingGuide;
