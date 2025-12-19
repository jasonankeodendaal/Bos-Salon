
import React, { useState } from 'react';

export type TourKey = 'dashboard' | 'art' | 'financials' | 'settings' | 'clients' | 'invoices' | 'inventory' | 'specials' | 'pwa' | 'yoco';

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
                    <h4 className="font-bold text-lg text-brand-green mb-2">The "Bos Identity" Rule</h4>
                    <p className="mb-2"><strong>Clients:</strong> Must complete the Bos Identity form once registered to ensure the studio has valid records for bookings and liability.</p>
                    <p className="mb-2"><strong>Admins:</strong> You do <u>not</u> need to fill out this form. As an administrator, you manage the entire company profile directly from the <strong>Settings</strong> tab.</p>
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

                <section>
                    <h4 className="font-bold text-lg text-brand-green mb-2">Digital Loyalty</h4>
                    <p>No more paper cards. Manually add a "Sticker" to their profile after each session. When they reach 10, a "Redeem" button appears in their portal.</p>
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

                <section>
                    <h4 className="font-bold text-lg text-brand-green mb-2">Linking to Bookings</h4>
                    <p>When you click <strong>"Build Quote"</strong> from the Dashboard, the system links that document to the specific booking.</p>
                    <p className="mt-2"><strong>Client Interaction:</strong> If a client logs into their portal and clicks "Accept Quote", the system automatically finds the linked booking and updates its status to <strong>Confirmed</strong>.</p>
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
                    <p><strong>Important:</strong> A booking must be marked "Completed" to count as Revenue. A booking that is just "Paid" but "Confirmed" does not count as realized revenue for the month yet.</p>
                </section>

                <section>
                    <h4 className="font-bold text-lg text-brand-green mb-2">Expense Categories</h4>
                    <ul className="list-disc pl-5 space-y-1">
                        <li><strong>Stock:</strong> Buying bulk inventory (e.g., 50 bottles of polish).</li>
                        <li><strong>Supplies:</strong> Daily consumables (e.g., paper towels, coffee).</li>
                        <li><strong>Rent/Utilities:</strong> Fixed monthly costs.</li>
                    </ul>
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
                    <p>We solved the "How much product did I use?" problem. Instead of guessing milliliters:</p>
                    <ol className="list-decimal pl-5 space-y-2 mt-2">
                        <li>Set up your items with a total quantity (e.g., 100ml bottle).</li>
                        <li>When you finish a booking, the log popup appears.</li>
                        <li>Click <strong>"+1 Service"</strong>.</li>
                        <li>The system automatically calculates the average usage for that category (e.g., 0.5ml for Gel Polish) and deducts it.</li>
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
                    <li><strong>Active Toggle:</strong> You can draft a special and keep it inactive until you are ready to launch.</li>
                    <li><strong>Voucher Codes:</strong> These are display-only codes (like "SUMMER20") that clients can quote when messaging you on WhatsApp.</li>
                    <li><strong>Price Types:</strong> "Fixed" is a set price. "Hourly" helps for complex treatments. "Percentage" creates a discount badge.</li>
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
                    <li><strong>Branding:</strong> Change your logo, company name, and contact details here. It updates everywhere instantly.</li>
                    <li><strong>Banking:</strong> These details appear automatically on the bottom left of every Invoice/Quote PDF.</li>
                    <li><strong>Maintenance Mode:</strong> Hides the website from the public (showing an "Under Construction" page) while you work on the admin panel.</li>
                </ul>
            </div>
        )
    },
    yoco: {
        title: "Yoco Payments Integration",
        content: (
            <div className="space-y-6 text-gray-700 leading-relaxed text-sm">
                <section>
                    <h4 className="font-bold text-lg text-brand-green mb-2">Why use Yoco?</h4>
                    <p>Yoco allows your clients to pay for deposits and full invoices using their Debit or Credit card directly in the Client Portal. No more waiting for EFT clears or handling cash.</p>
                </section>

                <section>
                    <h4 className="font-bold text-lg text-brand-green mb-2">Setup Instructions</h4>
                    <ol className="list-decimal pl-5 space-y-4">
                        <li>
                            <strong>Get your Keys:</strong> Log in to your <a href="https://portal.yoco.com/" target="_blank" className="text-blue-500 underline">Yoco Portal</a>. Go to <strong>Sell Online &rarr; Payment Gateways &rarr; WooCommerce/API</strong>.
                        </li>
                        <li>
                            <strong>Public Key:</strong> Copy your Live Public Key. It starts with <code>pk_live_</code>. Paste this into the "Public Key" field in Settings.
                        </li>
                        <li>
                            <strong>Secret Key:</strong> Copy your Live Secret Key. It starts with <code>sk_live_</code>. Paste this into the "Secret Key" field. 
                            <br/><span className="text-xs text-red-500 font-bold">Never share this key with anyone.</span>
                        </li>
                        <li>
                            <strong>Enable Gateway:</strong> Flip the "Enable Yoco" switch to ON and Save All.
                        </li>
                    </ol>
                </section>
            </div>
        )
    },
    pwa: {
        title: "PWA & Mobile App",
        content: (
            <div className="space-y-6 text-gray-700 leading-relaxed text-sm">
                <p>Your website is a Progressive Web App. It can be installed on phones just like a native app.</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Push Notifications:</strong> Requires user permission. Used for appointment reminders.</li>
                    <li><strong>Periodic Sync:</strong> Allows the app to fetch new specials in the background once a day.</li>
                    <li><strong>Offline Mode:</strong> Essential parts of the site (like contact info) work even without internet.</li>
                </ul>
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
                {/* Header */}
                <div className="bg-gradient-to-r from-brand-pink to-brand-green p-6 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3 text-white">
                        <span className="text-3xl">💡</span>
                        <h2 className="text-2xl font-bold tracking-wide">{data.title}</h2>
                    </div>
                    <button onClick={handleClose} className="text-white/80 hover:text-white text-3xl font-bold leading-none">&times;</button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto">
                    {data.content}
                </div>

                {/* Footer */}
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
