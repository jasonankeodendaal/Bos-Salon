
import React, { useState, useEffect } from 'react';
import { dbUploadFile } from '../../utils/dbAdapter';
import HelpGuideModal from './components/HelpGuideModal';
import TrashIcon from '../../components/icons/TrashIcon';
import PlusIcon from '../../components/icons/PlusIcon';
import { LoyaltyProgram, BookingOption } from '../../App';

interface SettingsManagerProps {
  onSaveAllSettings: (settings: any) => Promise<void>;
  onClearAllData: () => Promise<void>;
  startTour: (tourKey: any) => void;
  [key: string]: any; 
}

const GROUPS = [
  { id: 'profile', label: '🏢 Studio Profile', sub: 'Branding, Contact, Banking' },
  { id: 'website', label: '🏠 Website Content', sub: 'Hero & About Us Sections' },
  { id: 'protocol', label: '🎨 Service Protocol', sub: 'Aftercare & Booking Forms' },
  { id: 'loyalty', label: '🎁 Loyalty Hub', sub: 'Rewards & Sanctuary Perks' },
  { id: 'payments', label: '💳 Payments & Yoco', sub: 'Gateway & Hardware' },
  { id: 'advanced', label: '⚙️ System & Adv', sub: 'Integrations & Guide' },
];

const SettingsManager: React.FC<SettingsManagerProps> = (props) => {
  const [activeGroup, setActiveGroup] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Local state for complex arrays
  const [socialLinks, setSocialLinks] = useState(props.socialLinks || []);
  const [loyaltyPrograms, setLoyaltyPrograms] = useState<LoyaltyProgram[]>(props.loyaltyPrograms || []);
  const [sanctuaryPerks, setSanctuaryPerks] = useState<string[]>(props.sanctuaryPerks || []);
  const [bookingOptions, setBookingOptions] = useState<BookingOption[]>(props.bookingOptions || []);
  
  // Helpers for social links
  const [newSocialUrl, setNewSocialUrl] = useState('');
  const [newSocialIcon, setNewSocialIcon] = useState<File | null>(null);

  // General Settings State
  const [settings, setSettings] = useState({
    companyName: props.companyName || '',
    whatsAppNumber: props.whatsAppNumber || '',
    logoUrl: props.logoUrl || '',
    businessHours: props.businessHours || '',
    address: props.address || '',
    phone: props.phone || '',
    email: props.email || '',
    bankName: props.bankName || '',
    accountNumber: props.accountNumber || '',
    branchCode: props.branchCode || '',
    accountType: props.accountType || '',
    heroTitle: props.hero?.title || '',
    heroSubtitle: props.hero?.subtitle || '',
    heroButtonText: props.hero?.buttonText || '',
    heroBgUrl: props.heroBgUrl || '',
    aboutTitle: props.about?.title || '',
    aboutText1: props.about?.text1 || '',
    aboutText2: props.about?.text2 || '',
    aboutUsImageUrl: props.aboutUsImageUrl || '',
    showroomTitle: props.showroomTitle || '',
    showroomDescription: props.showroomDescription || '',
    aftercareTitle: props.aftercare?.title || '',
    aftercareIntro: props.aftercare?.intro || '',
    aftercareSections: props.aftercare?.sections || [],
    taxEnabled: props.taxEnabled || false,
    vatPercentage: props.vatPercentage || 15,
    vatNumber: props.vatNumber || '',
    yocoEnabled: props.payments?.yocoEnabled || false,
    yocoPublicKey: props.payments?.yocoPublicKey || '',
    yocoSecretKey: props.payments?.yocoSecretKey || '',
    terminalEnabled: props.payments?.terminalEnabled || false,
    terminalId: props.payments?.terminalId || '',
    terminalSecretKey: props.payments?.terminalSecretKey || '',
    emailServiceId: props.emailServiceId || '',
    emailTemplateId: props.emailTemplateId || '',
    emailPublicKey: props.emailPublicKey || '',
    isMaintenanceMode: props.isMaintenanceMode || false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setSettings(prev => ({ ...prev, [name]: val }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string, bucket: string) => {
    if (e.target.files && e.target.files[0]) {
      setIsLoading(true);
      try {
        const url = await dbUploadFile(e.target.files[0], bucket);
        setSettings(prev => ({ ...prev, [fieldName]: url }));
        setMessage({ text: 'Uploaded!', type: 'success' });
      } catch (err) { setMessage({ text: 'Upload failed', type: 'error' }); }
      finally { setIsLoading(false); }
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const payload = {
        ...settings,
        socialLinks,
        loyaltyPrograms,
        sanctuaryPerks,
        bookingOptions,
        hero: { title: settings.heroTitle, subtitle: settings.heroSubtitle, buttonText: settings.heroButtonText },
        about: { title: settings.aboutTitle, text1: settings.aboutText1, text2: settings.aboutText2 },
        aftercare: { title: settings.aftercareTitle, intro: settings.aftercareIntro, sections: settings.aftercareSections },
        payments: {
          yocoEnabled: settings.yocoEnabled, yocoPublicKey: settings.yocoPublicKey, yocoSecretKey: settings.yocoSecretKey,
          terminalEnabled: settings.terminalEnabled, terminalId: settings.terminalId, terminalSecretKey: settings.terminalSecretKey
        }
      };
      await props.onSaveAllSettings(payload);
      setMessage({ text: 'Settings Saved Successfully!', type: 'success' });
    } catch (err) { setMessage({ text: 'Error Saving', type: 'error' }); }
    finally { setIsLoading(false); }
  };

  const inputClass = "w-full bg-white border border-gray-200 rounded-lg p-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-brand-green outline-none transition shadow-sm";
  const labelClass = "block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1";
  const groupTitle = "text-xl font-black text-gray-900 mb-6 flex items-center gap-3 uppercase tracking-tighter border-b border-gray-100 pb-4";

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-xl flex flex-col h-full overflow-hidden">
      <header className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Studio Configuration</h2>
          <p className="text-xs text-gray-500 font-medium">Control your entire digital ecosystem.</p>
        </div>
        <div className="flex items-center gap-4">
          {message && <span className={`text-xs font-bold animate-pulse ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{message.text}</span>}
          <button onClick={handleSave} disabled={isLoading} className="bg-brand-green text-white px-8 py-2.5 rounded-xl font-black text-sm hover:scale-105 transition-all shadow-lg shadow-brand-green/20 disabled:opacity-50">
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="w-72 border-r border-gray-100 bg-gray-50/30 overflow-y-auto hidden md:block">
          <nav className="p-4 space-y-1">
            {GROUPS.map(g => (
              <button
                key={g.id}
                onClick={() => setActiveGroup(g.id)}
                className={`w-full text-left p-4 rounded-2xl transition-all group ${activeGroup === g.id ? 'bg-white shadow-md border border-gray-100' : 'hover:bg-black/5'}`}
              >
                <div className={`font-bold text-sm ${activeGroup === g.id ? 'text-brand-green' : 'text-gray-700'}`}>{g.label}</div>
                <div className="text-[10px] text-gray-400 font-medium mt-0.5">{g.sub}</div>
              </button>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          
          {/* GROUP 1: Studio Profile */}
          {activeGroup === 'profile' && (
            <div className="space-y-10 animate-fade-in">
              <h3 className={groupTitle}>🏢 Studio Profile</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 sm:col-span-1">
                  <label className={labelClass}>Studio Name</label>
                  <input name="companyName" value={settings.companyName} onChange={handleChange} className={inputClass} />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className={labelClass}>Main WhatsApp (27...)</label>
                  <input name="whatsAppNumber" value={settings.whatsAppNumber} onChange={handleChange} className={inputClass} />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Studio Address</label>
                  <input name="address" value={settings.address} onChange={handleChange} className={inputClass} />
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Banking Details (For Invoices)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <input name="bankName" value={settings.bankName} onChange={handleChange} placeholder="Bank Name" className={inputClass} />
                  <input name="accountNumber" value={settings.accountNumber} onChange={handleChange} placeholder="Account Number" className={inputClass} />
                  <input name="branchCode" value={settings.branchCode} onChange={handleChange} placeholder="Branch Code" className={inputClass} />
                  <input name="accountType" value={settings.accountType} onChange={handleChange} placeholder="Account Type" className={inputClass} />
                </div>
              </div>
            </div>
          )}

          {/* GROUP 2: Website Content */}
          {activeGroup === 'website' && (
            <div className="space-y-10 animate-fade-in">
              <h3 className={groupTitle}>🏠 Home Page Content</h3>
              <div className="space-y-6">
                <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
                  <label className={labelClass}>Hero Title</label>
                  <input name="heroTitle" value={settings.heroTitle} onChange={handleChange} className={`${inputClass} font-script text-2xl`} />
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className={labelClass}>Subtitle</label>
                      <input name="heroSubtitle" value={settings.heroSubtitle} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Button Text</label>
                      <input name="heroButtonText" value={settings.heroButtonText} onChange={handleChange} className={inputClass} />
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
                  <label className={labelClass}>Our Story Title</label>
                  <input name="aboutTitle" value={settings.aboutTitle} onChange={handleChange} className={inputClass} />
                  <div className="mt-4">
                    <label className={labelClass}>Main Story Text</label>
                    <textarea name="aboutText1" rows={4} value={settings.aboutText1} onChange={handleChange} className={inputClass} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* GROUP 3: Service Protocol */}
          {activeGroup === 'protocol' && (
            <div className="space-y-10 animate-fade-in">
              <h3 className={groupTitle}>🎨 Service Protocol</h3>
              
              <section className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h4 className="text-sm font-bold text-gray-900 mb-4">Aftercare Guide</h4>
                <div className="space-y-4">
                  <input name="aftercareTitle" value={settings.aftercareTitle} onChange={handleChange} placeholder="Title" className={inputClass} />
                  <textarea name="aftercareIntro" rows={2} value={settings.aftercareIntro} onChange={handleChange} placeholder="Intro text" className={inputClass} />
                </div>
              </section>

              <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h4 className="text-sm font-bold text-gray-900 mb-2">Booking Form Checklist</h4>
                <p className="text-xs text-gray-500 mb-4">Clients select these pre-checks during booking request.</p>
                <div className="space-y-2">
                  {bookingOptions.map(opt => (
                    <div key={opt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 group">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900">{opt.label}</p>
                        <p className="text-[10px] text-gray-400 italic">{opt.description}</p>
                      </div>
                      <button onClick={() => setBookingOptions(prev => prev.filter(o => o.id !== opt.id))} className="text-red-300 hover:text-red-500 p-2"><TrashIcon className="w-4 h-4"/></button>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-gray-100 flex gap-2">
                    <button onClick={() => {
                        const label = prompt("Option label:");
                        if (label) setBookingOptions(prev => [...prev, { id: crypto.randomUUID(), label, description: '' }]);
                    }} className="text-xs font-black text-brand-green uppercase tracking-widest">+ Add Checklist Item</button>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* GROUP 4: Loyalty Hub */}
          {activeGroup === 'loyalty' && (
            <div className="space-y-10 animate-fade-in">
              <h3 className={groupTitle}>🎁 Loyalty & Sanctuary</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-lg">
                  <h4 className="text-base font-black text-gray-900 mb-6 uppercase tracking-tighter">Digital Stamp Cards</h4>
                  <div className="space-y-4">
                    {loyaltyPrograms.map(prog => (
                      <div key={prog.id} className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50">
                        <div className="w-12 h-12 rounded-xl bg-white border flex items-center justify-center text-xl">{prog.iconUrl ? <img src={prog.iconUrl} className="w-8 h-8 object-contain" /> : '✨'}</div>
                        <div className="flex-1">
                          <p className="font-bold text-sm">{prog.name}</p>
                          <p className="text-[10px] text-gray-400">{prog.stickersRequired} stamps &rarr; {prog.rewardDescription}</p>
                        </div>
                        <button onClick={() => setLoyaltyPrograms(prev => prev.filter(p => p.id !== prog.id))} className="text-red-300 hover:text-red-500"><TrashIcon className="w-4 h-4"/></button>
                      </div>
                    ))}
                    <button onClick={() => setActiveGroup('protocol')} className="text-xs font-black text-brand-green uppercase tracking-widest hover:underline">+ New Stamp Program</button>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-lg">
                  <h4 className="text-base font-black text-gray-900 mb-6 uppercase tracking-tighter">Sanctuary Perks</h4>
                  <div className="space-y-3">
                    {sanctuaryPerks.map((perk, idx) => (
                      <div key={idx} className="flex gap-2 group">
                        <input value={perk} onChange={e => {
                          const newPerks = [...sanctuaryPerks];
                          newPerks[idx] = e.target.value;
                          setSanctuaryPerks(newPerks);
                        }} className={inputClass} />
                        <button onClick={() => setSanctuaryPerks(prev => prev.filter((_, i) => i !== idx))} className="text-red-300 hover:text-red-500"><TrashIcon className="w-4 h-4" /></button>
                      </div>
                    ))}
                    <button onClick={() => setSanctuaryPerks(prev => [...prev, 'New Benefit'])} className="text-xs font-black text-brand-green uppercase tracking-widest hover:underline">+ Add Perk</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* GROUP 5: Payments */}
          {activeGroup === 'payments' && (
            <div className="space-y-10 animate-fade-in">
              <h3 className={groupTitle}>💳 Payments & Yoco</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-blue-50 border border-blue-100 p-8 rounded-3xl">
                   <div className="flex items-center gap-3 mb-6">
                      <input type="checkbox" name="yocoEnabled" checked={settings.yocoEnabled} onChange={handleChange} className="w-6 h-6 accent-blue-600 rounded" />
                      <h4 className="text-lg font-black text-blue-900 uppercase tracking-tighter">Online Gateway</h4>
                   </div>
                   <div className="space-y-4">
                      <div><label className={labelClass}>Public Key</label><input name="yocoPublicKey" value={settings.yocoPublicKey} onChange={handleChange} className={inputClass} /></div>
                      <div><label className={labelClass}>Secret Key</label><input type="password" name="yocoSecretKey" value={settings.yocoSecretKey} onChange={handleChange} className={inputClass} /></div>
                   </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-100 p-8 rounded-3xl">
                   <div className="flex items-center gap-3 mb-6">
                      <input type="checkbox" name="terminalEnabled" checked={settings.terminalEnabled} onChange={handleChange} className="w-6 h-6 accent-yellow-600 rounded" />
                      <h4 className="text-lg font-black text-yellow-900 uppercase tracking-tighter">Terminal Hardware</h4>
                   </div>
                   <div className="space-y-4">
                      <div><label className={labelClass}>Terminal ID</label><input name="terminalId" value={settings.terminalId} onChange={handleChange} className={inputClass} /></div>
                      <div><label className={labelClass}>Secret API Key</label><input type="password" name="terminalSecretKey" value={settings.terminalSecretKey} onChange={handleChange} className={inputClass} /></div>
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* GROUP 6: Advanced */}
          {activeGroup === 'advanced' && (
            <div className="space-y-10 animate-fade-in">
              <h3 className={groupTitle}>⚙️ System & Advanced</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-gray-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                   <div className="relative z-10">
                      <h4 className="text-xl font-black mb-2 uppercase tracking-tighter text-brand-green">EmailJS Integration</h4>
                      <p className="text-xs text-gray-400 mb-6">Connect your studio to automated transactional emails.</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 sm:col-span-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Service ID</label>
                          <input name="emailServiceId" value={settings.emailServiceId} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm outline-none focus:ring-1 focus:ring-brand-green" />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Template ID</label>
                          <input name="emailTemplateId" value={settings.emailTemplateId} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm outline-none focus:ring-1 focus:ring-brand-green" />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Public Key</label>
                          <input type="password" name="emailPublicKey" value={settings.emailPublicKey} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm outline-none focus:ring-1 focus:ring-brand-green" />
                        </div>
                      </div>
                   </div>
                </div>

                <div className="bg-red-50 border border-red-100 p-8 rounded-3xl flex flex-col justify-between">
                   <div>
                      <h4 className="text-lg font-black text-red-900 uppercase tracking-tighter mb-4">Operations</h4>
                      <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-red-100 shadow-sm">
                        <input type="checkbox" name="isMaintenanceMode" checked={settings.isMaintenanceMode} onChange={handleChange} className="w-5 h-5 accent-red-600 rounded" />
                        <label className="text-xs font-bold text-red-800">Maintenance Mode</label>
                      </div>
                   </div>
                   <button onClick={props.onClearAllData} className="mt-8 bg-red-600 text-white py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-red-600/20 hover:bg-red-700 transition-colors">Wipe Data Pool</button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default SettingsManager;
