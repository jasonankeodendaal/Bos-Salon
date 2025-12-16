
import React from 'react';

export type HelpSection = 'clients' | 'inventory' | 'financials' | 'integrations' | 'bookings' | 'art' | 'specials' | 'invoices';

interface HelpGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: HelpSection;
}

const guideContent: Record<HelpSection, { title: string; content: React.ReactNode }> = {
  clients: {
    title: "Client Database: Zero to Hero",
    content: (
      <div className="space-y-4 text-gray-700">
        <p>This section is your CRM (Customer Relationship Management) hub. It tracks everyone who has ever booked with you or whom you have added manually.</p>
        
        <h4 className="font-bold text-lg text-blue-600">1. Creating a Client (Active Dashboard)</h4>
        <ul className="list-disc pl-5 space-y-2">
            <li>Click the <strong>"+ Add Client"</strong> button.</li>
            <li>Enter their Name, Email, and Phone number.</li>
            <li><strong>Crucial:</strong> Enter a <strong>Password/PIN</strong>. Once saved, the client can immediately log into the "Client Portal" on the main website using their email and this PIN.</li>
            <li>They do not need a booking to log in. They can log in to view quotes you send them later.</li>
        </ul>

        <h4 className="font-bold text-lg text-blue-600">2. Managing Existing Clients</h4>
        <ul className="list-disc pl-5 space-y-2">
            <li>Click on any client card to view their full history.</li>
            <li>You can see their <strong>Total Spend</strong> (lifetime value), past bookings, and invoices.</li>
            <li>Use the <strong>Resend Credentials</strong> buttons to quickly WhatsApp or Email them their login details if they forget.</li>
        </ul>
      </div>
    )
  },
  inventory: {
    title: "Inventory Master Class",
    content: (
      <div className="space-y-4 text-gray-700">
        <p>Keep track of every bottle of ink, needle, and glove box. This system helps you calculate the true cost of your services.</p>
        
        <h4 className="font-bold text-lg text-blue-600">1. Adding Stock</h4>
        <p>Click <strong>"Add Item"</strong>. Enter the product name, brand, and crucial financial details:</p>
        <ul className="list-disc pl-5 space-y-2">
            <li><strong>Unit Cost:</strong> How much one unit (bottle/box) costs you.</li>
            <li><strong>Quantity:</strong> How many you have on the shelf.</li>
            <li><strong>Min Level:</strong> The system will turn the card <span className="text-red-500 font-bold">RED</span> when stock drops below this number.</li>
        </ul>

        <h4 className="font-bold text-lg text-blue-600">2. Tracking Usage</h4>
        <p>You don't manually lower stock here usually. Instead:</p>
        <ul className="list-disc pl-5 space-y-2">
            <li>Go to the <strong>Financials Tab</strong>.</li>
            <li>Click "Log Expense" -> "Use from Inventory".</li>
            <li>Or, when a Booking is marked "Completed", the system prompts you to log supplies used.</li>
        </ul>
      </div>
    )
  },
  integrations: {
    title: "Integrations Setup Guide",
    content: (
      <div className="space-y-4 text-gray-700">
        <h4 className="font-bold text-lg text-blue-600">EmailJS (Automated Emails)</h4>
        <ol className="list-decimal pl-5 space-y-2">
            <li>Go to <a href="https://www.emailjs.com/" target="_blank" className="text-blue-500 underline">emailjs.com</a> and create a free account.</li>
            <li><strong>Add Service:</strong> Click "Add Service", select "Gmail" (or your provider), and connect your account. Copy the <strong>Service ID</strong>.</li>
            <li><strong>Add Template:</strong> Click "Email Templates". Create a new one. 
                <br/><span className="text-xs bg-gray-100 p-1">Use variables like &#123;&#123;to_name&#125;&#125;, &#123;&#123;message&#125;&#125; in the design.</span>
                <br/>Save and copy the <strong>Template ID</strong>.
            </li>
            <li><strong>Public Key:</strong> Go to "Account" (Avatar icon) -> "Public Key". Copy it.</li>
            <li>Paste these 3 values into the fields in this tab and click Save.</li>
        </ol>

        <h4 className="font-bold text-lg text-blue-600 mt-6">Payment Gateways</h4>
        <p>Currently, the system supports manual recording (Cash/EFT). For automated card payments (Yoco/PayFast), you would need to enter your API keys here once the plugin is installed by a developer.</p>
      </div>
    )
  },
  financials: { title: "Financial Hub Guide", content: "Track your income vs expenses here. Ensure you mark bookings as 'Completed' for them to show up in revenue." },
  bookings: { title: "Booking Management", content: "Manage incoming requests. Click 'Generate Quote' on a booking to instantly create a PDF price estimate." },
  art: { title: "Portfolio & Showroom", content: "Upload your best work here. 'Featured' items go to the Home Page. 'Showroom' items go to the Flash Gallery." },
  specials: { title: "Specials Manager", content: "Create temporary offers. These appear on the public site under 'Seasonal Specials'." },
  invoices: { title: "Invoicing System", content: "Create professional quotes and invoices. They are automatically linked to client profiles." }
};

const HelpGuideModal: React.FC<HelpGuideModalProps> = ({ isOpen, onClose, section }) => {
  if (!isOpen) return null;

  const data = guideContent[section];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
      <div 
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 flex justify-between items-center shrink-0">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="bg-white/20 p-1.5 rounded-full">ℹ️</span>
                {data.title}
            </h3>
            <button onClick={onClose} className="text-white/80 hover:text-white text-2xl font-bold">&times;</button>
        </div>
        <div className="p-8 overflow-y-auto leading-relaxed">
            {data.content}
        </div>
        <div className="p-4 border-t border-gray-100 bg-gray-50 text-right shrink-0">
            <button onClick={onClose} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors">
                Got it!
            </button>
        </div>
      </div>
    </div>
  );
};

export default HelpGuideModal;
