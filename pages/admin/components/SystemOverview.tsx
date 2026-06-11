import React from 'react';
import { Settings, Layout, Database, Calendar, Users, Briefcase, Sparkles, Wand2, Image as ImageIcon, ClipboardList, Package, BookOpenText, FileText, LayoutTemplate, HelpCircle } from 'lucide-react';

const SystemOverview: React.FC = () => {
  return (
    <div className="space-y-8 p-6 bg-white rounded-xl shadow-inner border border-gray-100 min-h-[600px]">
      <div className="border-b border-gray-200 pb-6 flex items-center gap-4">
          <div className="p-4 bg-brand-green/10 text-brand-green rounded-full">
            <Settings size={32} />
          </div>
          <div>
            <h3 className="text-3xl font-black text-brand-green">Salon Management Center</h3>
            <p className="text-sm text-gray-500 mt-1">Unified control panel for web content, booking operations, and client management.</p>
          </div>
      </div>

      {/* Capabilities Overview */}
      <section>
        <h4 className="font-bold text-lg text-brand-green mb-4 flex items-center gap-2">
            <Layout className="text-brand-green" /> Managed Content Modules
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
                { icon: ImageIcon, label: 'Portfolio' },
                { icon: Sparkles, label: 'Specials' },
                { icon: ImageIcon, label: 'Showroom' },
                { icon: Calendar, label: 'Bookings' },
                { icon: Users, label: 'Clients' },
                { icon: Wand2, label: 'Settings' },
            ].map((item, i) => (
                <div key={i} className="border border-gray-200 p-3 rounded-lg flex flex-col items-center text-center gap-2 bg-gray-50 hover:border-brand-green/50 transition">
                    <item.icon className="text-brand-green" size={20} />
                    <span className="font-bold text-xs">{item.label}</span>
                </div>
            ))}
        </div>
      </section>

      {/* Workflow Guidance */}
      <section>
        <h4 className="font-bold text-lg text-brand-green mb-4 flex items-center gap-2">
            <ClipboardList className="text-brand-green" /> Admin Task Reference
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 p-5 rounded-lg bg-white shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                    <LayoutTemplate className="text-brand-green" size={20} />
                    <h5 className="font-bold text-sm">Website Branding (CMS)</h5>
                </div>
                <p className="text-xs text-gray-600 mb-2">Use <strong>Settings</strong> & specific Management tabs (Portfolio, Specials, Showroom) to update site copy, hero images, and branding.</p>
                <p className="text-[10px] text-brand-green font-bold bg-green-50 px-2 py-1 rounded inline-block">ALWAYS CLICK "SAVE ALL" TO COMMIT.</p>
            </div>
            <div className="border border-gray-200 p-5 rounded-lg bg-white shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                    <Calendar className="text-brand-green" size={20} />
                    <h5 className="font-bold text-sm">Booking Lifecycle</h5>
                </div>
                <p className="text-xs text-gray-600">Monitor new requests in <strong>Dashboard</strong>, manage bookings directly. Use the WhatsApp button to bridge communication with clients seamlessly.</p>
            </div>
        </div>
      </section>

      {/* Architecture Info */}
      <section className="bg-gray-900 text-gray-300 p-5 rounded-lg text-sm border border-gray-800">
        <h4 className="font-bold text-white mb-3 flex items-center gap-2">
            <Database size={18} /> System Framework
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
                <h5 className="text-xs font-bold text-brand-green mb-1 uppercase">Frontend</h5>
                <p className="text-[11px]">React 18+ powered by Vite. Highly responsive UI built exclusively with Tailwind CSS.</p>
            </div>
            <div>
                <h5 className="text-xs font-bold text-brand-green mb-1 uppercase">Database</h5>
                <p className="text-[11px]">PostgreSQL via Supabase. Real-time data synchronization enabled across all dashboard components.</p>
            </div>
            <div>
                <h5 className="text-xs font-bold text-brand-green mb-1 uppercase">Infrastructure</h5>
                <p className="text-[11px]">Server-side rendering and scalable deployment managed via modern Cloud Run containers.</p>
            </div>
        </div>
      </section>

      <section className="flex items-center gap-3 bg-blue-50 border border-blue-100 p-4 rounded-lg text-blue-800">
        <HelpCircle size={24} className="flex-shrink-0"/>
        <p className="text-xs"><strong>Need help for a specific page?</strong> Look for the 📖 Training Guide icon inside the header of the page you are working on for step-by-step instructions.</p>
      </section>
    </div>
  );
};

export default SystemOverview;


