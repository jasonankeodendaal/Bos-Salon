
import React, { useState } from 'react';
import { dbUploadFile } from '../../utils/dbAdapter';
import HelpGuideModal from './components/HelpGuideModal';
import TrashIcon from '../../components/icons/TrashIcon';
import PlusIcon from '../../components/icons/PlusIcon';
import { LoyaltyProgram } from '../../App';

// Types passed from parent
interface SettingsManagerProps {
  onSaveAllSettings: (settings: any) => Promise<void>;
  onClearAllData: () => Promise<void>;
  startTour: (tourKey: 'settings') => void;
  // All current settings (now including specific section objects)
  [key: string]: any; 
}

// Section Tabs
const TABS = [
  { id: 'general', label: 'General & Branding' },
  { id: 'hero', label: 'Home Page (Hero)' },
  { id: 'about', label: 'About Page' },
  { id: 'showroom', label: 'Showroom & Specials' },
  { id: 'contact', label: 'Footer & Contact Info' },
  { id: 'financials', label: 'Financial Config' },
  { id: 'loyalty', label: 'Loyalty Programs' },
  { id: 'integrations', label: 'Integrations & Adv' },
];

const SettingsManager: React.FC<SettingsManagerProps> = (props) => {
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Social Media Local State
  const [newSocialUrl, setNewSocialUrl] = useState('');
  const [newSocialIcon, setNewSocialIcon] = useState<File | null>(null);

  // Loyalty Program Local State
  const [loyaltyPrograms, setLoyaltyPrograms] = useState<LoyaltyProgram[]>(props.loyaltyPrograms || []);
  const [newProgram, setNewProgram] = useState<Partial<LoyaltyProgram>>({
      name: '',
      stickersRequired: 10,
      rewardDescription: '',
      terms: '',
      active: true,
  });
  const [newProgramIcon, setNewProgramIcon] = useState<File | null>(null);

  // -- STATE MANAGEMENT FOR ALL FIELDS --
  const [settings, setSettings] = useState({
    // General
    companyName: props.companyName || 'Bos Salon',
    whatsAppNumber: props.whatsAppNumber || '',
    logoUrl: props.logoUrl || '',
    
    // Hero Section
    heroTitle: props.hero?.title || 'Nail and beauty',
    heroSubtitle: props.hero?.subtitle || 'Experience the art of nature',
    heroButtonText: props.hero?.buttonText || 'Book an Appointment',
    heroTattooGunImageUrl: props.heroTattooGunImageUrl || '', 
    
    // About Section
    aboutTitle: props.about?.title || 'Our Story',
    aboutText1: props.about?.text1 || 'Bos Salon was born from a love for natural beauty...',
    aboutText2: props.about?.text2 || 'We specialize in bespoke nail art...',
    aboutUsImageUrl: props.aboutUsImageUrl || '',
    
    // Showroom Section
    showroomTitle: props.showroomTitle || 'Nail Art Gallery',
    showroomDescription: props.showroomDescription || 'Browse our collection...',
    
    // Contact & Footer
    address: props.address || '',
    phone: props.phone || '',
    email: props.email || '',
    bankName: props.bankName || '',
    accountNumber: props.accountNumber || '',
    branchCode: props.branchCode || '',
    accountType: props.accountType || '',
    socialLinks: props.socialLinks || [],

    // Financials
    taxEnabled: props.taxEnabled || false,
    vatPercentage: props.vatPercentage || 15,
    vatNumber: props.vatNumber || '',

    // Integrations
    emailServiceId: props.emailServiceId || '',
    emailTemplateId: props.emailTemplateId || '',
    emailPublicKey: props.emailPublicKey || '',
    apkUrl: props.apkUrl || '',
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
        setMessage({ text: 'Image uploaded successfully!', type: 'success' });
      } catch (error) {
        console.error("Upload failed", error);
        setMessage({ text: 'Upload failed', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAddSocialLink = async () => {
    if (!newSocialUrl || !newSocialIcon) {
        alert("Please provide both a URL and an Icon.");
        return;
    }
    setIsLoading(true);
    try {
        const iconUrl = await dbUploadFile(newSocialIcon, 'settings'); 
        const newLink = {
            id: crypto.randomUUID(),
            url: newSocialUrl,
            icon: iconUrl
        };
        setSettings(prev => ({
            ...prev,
            socialLinks: [...prev.socialLinks, newLink]
        }));
        setNewSocialUrl('');
        setNewSocialIcon(null);
    } catch (error) {
        console.error("Failed to upload icon", error);
        alert("Failed to upload icon");
    } finally {
        setIsLoading(false);
    }
  };

  const handleRemoveSocialLink = (id: string) => {
    setSettings(prev => ({
        ...prev,
        socialLinks: prev.socialLinks.filter((link: any) => link.id !== id)
    }));
  };

  // --- Loyalty Program Handlers ---
  const handleAddProgram = async () => {
      if (!newProgram.name || !newProgram.rewardDescription) {
          alert("Name and reward description are required.");
          return;
      }
      setIsLoading(true);
      try {
          let iconUrl = '';
          if (newProgramIcon) {
              iconUrl = await dbUploadFile(newProgramIcon, 'settings', 'loyalty_');
          } else {
              iconUrl = settings.logoUrl; // Default to main logo if no specific icon
          }

          const programToAdd: LoyaltyProgram = {
              id: crypto.randomUUID(),
              name: newProgram.name!,
              stickersRequired: Number(newProgram.stickersRequired) || 10,
              rewardDescription: newProgram.rewardDescription!,
              terms: newProgram.terms,
              active: newProgram.active !== false,
              iconUrl
          };

          setLoyaltyPrograms(prev => [...prev, programToAdd]);
          setNewProgram({ name: '', stickersRequired: 10, rewardDescription: '', terms: '', active: true });
          setNewProgramIcon(null);
      } catch (err) {
          console.error(err);
          alert("Failed to create loyalty program.");
      } finally {
          setIsLoading(false);
      }
  };

  const handleDeleteProgram = (id: string) => {
      if(window.confirm("Delete this loyalty program? Clients currently using it will lose their view of it.")) {
          setLoyaltyPrograms(prev => prev.filter(p => p.id !== id));
      }
  };

  const handleToggleProgram = (id: string) => {
      setLoyaltyPrograms(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const finalSettings = {
        ...settings,
        hero: {
          title: settings.heroTitle,
          subtitle: settings.heroSubtitle,
          buttonText: settings.heroButtonText,
        },
        about: {
          title: settings.aboutTitle,
          text1: settings.aboutText1,
          text2: settings.aboutText2,
        },
        loyaltyPrograms: loyaltyPrograms,
        // Legacy fallback
        loyaltyProgram: { enabled: true, stickersRequired: 10, rewardDescription: 'See Programs' }, 
        
        companyName: settings.companyName,
        logoUrl: settings.logoUrl,
        heroTattooGunImageUrl: settings.heroTattooGunImageUrl,
        aboutUsImageUrl: settings.aboutUsImageUrl,
        showroomTitle: settings.showroomTitle,
        showroomDescription: settings.showroomDescription,
      };

      await props.onSaveAllSettings(finalSettings);
      setMessage({ text: 'All settings saved successfully!', type: 'success' });
    } catch (error) {
      console.error("Save failed", error);
      setMessage({ text: 'Failed to save settings.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full bg-white border border-admin-dark-border rounded-lg p-3 text-admin-dark-text focus:ring-2 focus:ring-admin-dark-primary outline-none transition";
  const labelClass = "block text-sm font-bold text-admin-dark-text-secondary mb-2";
  const sectionClass = "space-y-6 animate-fade-in";

  return (
    <div className="bg-admin-dark-card border border-admin-dark-border rounded-xl shadow-lg flex flex-col h-[calc(100vh-120px)] overflow-hidden">
      <HelpGuideModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} section="integrations" />
      
      {/* Header */}
      <header className="p-6 border-b border-admin-dark-border flex justify-between items-center bg-white/50">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-xl font-bold text-admin-dark-text">Full Site CMS</h2>
            <p className="text-sm text-admin-dark-text-secondary">Edit every aspect of your website from here.</p>
          </div>
        </div>
        <div className="flex gap-4 items-center">
           {message && (
             <div className={`px-4 py-2 rounded-lg text-sm font-bold ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
               {message.text}
             </div>
           )}
           <button 
             onClick={handleSave} 
             disabled={isLoading}
             className="bg-admin-dark-primary text-white px-6 py-2 rounded-lg font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-lg"
           >
             {isLoading ? 'Saving...' : 'Save All Changes'}
           </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Tabs */}
        <aside className="w-64 bg-white/50 border-r border-admin-dark-border overflow-y-auto hidden md:block">
          <nav className="p-4 space-y-2">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold transition-colors ${activeTab === tab.id ? 'bg-admin-dark-primary text-white shadow-md' : 'text-admin-dark-text-secondary hover:bg-black/5 hover:text-admin-dark-text'}`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-admin-dark-bg">
          
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className={sectionClass}>
              <h3 className="text-lg font-bold text-admin-dark-text border-b border-admin-dark-border pb-2 mb-4">Branding & Core Info</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                   <label className={labelClass}>Company Name</label>
                   <input name="companyName" value={settings.companyName} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                   <label className={labelClass}>WhatsApp Number (International format, no +)</label>
                   <input name="whatsAppNumber" value={settings.whatsAppNumber} onChange={handleChange} className={inputClass} placeholder="e.g., 27795904162" />
                </div>
                <div className="lg:col-span-2">
                   <label className={labelClass}>Logo</label>
                   <div className="flex items-center gap-4">
                      {settings.logoUrl && <img src={settings.logoUrl} alt="Logo" className="w-16 h-16 object-contain bg-white rounded-lg p-2 border border-gray-200" />}
                      <input type="file" onChange={(e) => handleFileUpload(e, 'logoUrl', 'settings')} className="text-sm text-admin-dark-text-secondary" />
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* Hero Tab */}
          {activeTab === 'hero' && (
            <div className={sectionClass}>
               <h3 className="text-lg font-bold text-admin-dark-text border-b border-admin-dark-border pb-2 mb-4">Home Page Hero Section</h3>
               <div className="grid grid-cols-1 gap-6">
                 <div>
                    <label className={labelClass}>Main Title (Large)</label>
                    <input name="heroTitle" value={settings.heroTitle} onChange={handleChange} className={inputClass} />
                 </div>
                 <div>
                    <label className={labelClass}>Subtitle / Slogan</label>
                    <input name="heroSubtitle" value={settings.heroSubtitle} onChange={handleChange} className={inputClass} />
                 </div>
                 <div>
                    <label className={labelClass}>Call to Action Button Text</label>
                    <input name="heroButtonText" value={settings.heroButtonText} onChange={handleChange} className={inputClass} />
                 </div>
                 <div>
                    <label className={labelClass}>Background / Feature Image</label>
                    <div className="flex items-center gap-4">
                       {settings.heroTattooGunImageUrl && <img src={settings.heroTattooGunImageUrl} alt="Hero" className="w-32 h-20 object-cover rounded-lg" />}
                       <input type="file" onChange={(e) => handleFileUpload(e, 'heroTattooGunImageUrl', 'settings')} className="text-sm text-admin-dark-text-secondary" />
                    </div>
                 </div>
               </div>
            </div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
             <div className={sectionClass}>
                <h3 className="text-lg font-bold text-admin-dark-text border-b border-admin-dark-border pb-2 mb-4">About Us Section</h3>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                     <label className={labelClass}>Section Title</label>
                     <input name="aboutTitle" value={settings.aboutTitle} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                     <label className={labelClass}>Story Paragraph 1</label>
                     <textarea name="aboutText1" rows={4} value={settings.aboutText1} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                     <label className={labelClass}>Story Paragraph 2</label>
                     <textarea name="aboutText2" rows={4} value={settings.aboutText2} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                     <label className={labelClass}>Feature Image (Circular)</label>
                     <div className="flex items-center gap-4">
                        {settings.aboutUsImageUrl && <img src={settings.aboutUsImageUrl} alt="About" className="w-24 h-24 object-cover rounded-full" />}
                        <input type="file" onChange={(e) => handleFileUpload(e, 'aboutUsImageUrl', 'settings')} className="text-sm text-admin-dark-text-secondary" />
                     </div>
                  </div>
                </div>
             </div>
          )}

          {/* Showroom Tab */}
          {activeTab === 'showroom' && (
             <div className={sectionClass}>
               <h3 className="text-lg font-bold text-admin-dark-text border-b border-admin-dark-border pb-2 mb-4">Showroom & Gallery</h3>
               <div className="grid grid-cols-1 gap-6">
                  <div>
                     <label className={labelClass}>Showroom Section Title</label>
                     <input name="showroomTitle" value={settings.showroomTitle} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                     <label className={labelClass}>Showroom Description</label>
                     <textarea name="showroomDescription" rows={3} value={settings.showroomDescription} onChange={handleChange} className={inputClass} />
                  </div>
               </div>
             </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
             <div className={sectionClass}>
                <h3 className="text-lg font-bold text-admin-dark-text border-b border-admin-dark-border pb-2 mb-4">Contact Details</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                   <div className="lg:col-span-2">
                      <label className={labelClass}>Physical Address</label>
                      <input name="address" value={settings.address} onChange={handleChange} className={inputClass} />
                   </div>
                   <div>
                      <label className={labelClass}>Phone Number (Display)</label>
                      <input name="phone" value={settings.phone} onChange={handleChange} className={inputClass} />
                   </div>
                   <div>
                      <label className={labelClass}>Email Address</label>
                      <input name="email" value={settings.email} onChange={handleChange} className={inputClass} />
                   </div>
                </div>

                {/* Social Media Section */}
                <h3 className="text-lg font-bold text-admin-dark-text border-b border-admin-dark-border pb-2 mt-8 mb-4">Social Media Footer Links</h3>
                <div className="space-y-4">
                    {/* List Existing */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {settings.socialLinks && settings.socialLinks.length > 0 ? (
                            settings.socialLinks.map((link: any) => (
                                <div key={link.id} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-admin-dark-border">
                                    <img src={link.icon} alt="Icon" className="w-8 h-8 object-contain bg-gray-50 rounded-md p-1" />
                                    <span className="flex-1 text-sm text-admin-dark-text truncate" title={link.url}>{link.url}</span>
                                    <button onClick={() => handleRemoveSocialLink(link.id)} className="text-red-500 hover:text-red-600 p-2 bg-gray-50 rounded-lg hover:bg-red-50 transition-colors">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-admin-dark-text-secondary italic col-span-2">No social media links set. Add one below!</p>
                        )}
                    </div>

                    {/* Add New */}
                    <div className="bg-white/50 p-4 rounded-lg border border-admin-dark-border border-dashed">
                        <h4 className="text-sm font-bold text-admin-dark-text mb-3">Add New Social Link</h4>
                        <div className="flex flex-col gap-3">
                            <div>
                                <label className="text-xs text-admin-dark-text-secondary mb-1 block">Profile URL</label>
                                <input 
                                    placeholder="e.g. https://instagram.com/bossalon" 
                                    value={newSocialUrl} 
                                    onChange={(e) => setNewSocialUrl(e.target.value)} 
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-admin-dark-text-secondary mb-1 block">Icon (PNG/SVG)</label>
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="file" 
                                        onChange={(e) => e.target.files && setNewSocialIcon(e.target.files[0])} 
                                        className="flex-1 text-sm text-admin-dark-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-admin-dark-primary/10 file:text-admin-dark-primary hover:file:bg-admin-dark-primary/20"
                                    />
                                    <button 
                                        onClick={handleAddSocialLink} 
                                        disabled={!newSocialUrl || !newSocialIcon || isLoading}
                                        className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm"
                                    >
                                        {isLoading ? 'Adding...' : 'Add Link'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <h3 className="text-lg font-bold text-admin-dark-text border-b border-admin-dark-border pb-2 mt-8 mb-4">Other Footer Elements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                      <label className={labelClass}>Android App Download Link (APK URL)</label>
                      <input name="apkUrl" value={settings.apkUrl} onChange={handleChange} className={inputClass} placeholder="https://..." />
                      <p className="text-xs text-admin-dark-text-secondary mt-1">Leave blank to hide the "Download App" button in the footer.</p>
                   </div>
                </div>

                <h3 className="text-lg font-bold text-admin-dark-text border-b border-admin-dark-border pb-2 mt-8 mb-4">Banking Details (For Invoices/Footer)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                      <label className={labelClass}>Bank Name</label>
                      <input name="bankName" value={settings.bankName} onChange={handleChange} className={inputClass} />
                   </div>
                   <div>
                      <label className={labelClass}>Account Number</label>
                      <input name="accountNumber" value={settings.accountNumber} onChange={handleChange} className={inputClass} />
                   </div>
                   <div>
                      <label className={labelClass}>Branch Code</label>
                      <input name="branchCode" value={settings.branchCode} onChange={handleChange} className={inputClass} />
                   </div>
                   <div>
                      <label className={labelClass}>Account Type</label>
                      <input name="accountType" value={settings.accountType} onChange={handleChange} className={inputClass} />
                   </div>
                </div>
             </div>
          )}

          {/* Financials Tab */}
          {activeTab === 'financials' && (
             <div className={sectionClass}>
               <h3 className="text-lg font-bold text-admin-dark-text border-b border-admin-dark-border pb-2 mb-4">Tax & Invoicing Config</h3>
               <div className="space-y-4">
                 <div className="flex items-center gap-3 bg-white p-4 rounded-lg border border-admin-dark-border">
                    <input type="checkbox" id="taxEnabled" name="taxEnabled" checked={settings.taxEnabled} onChange={handleChange} className="w-5 h-5 accent-admin-dark-primary rounded" />
                    <label htmlFor="taxEnabled" className="text-admin-dark-text font-bold">Enable VAT/Tax Calculation</label>
                 </div>
                 {settings.taxEnabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div>
                          <label className={labelClass}>VAT Percentage (%)</label>
                          <input type="number" name="vatPercentage" value={settings.vatPercentage} onChange={handleChange} className={inputClass} />
                       </div>
                       <div>
                          <label className={labelClass}>VAT Registration Number</label>
                          <input name="vatNumber" value={settings.vatNumber} onChange={handleChange} className={inputClass} />
                       </div>
                    </div>
                 )}
               </div>
             </div>
          )}

          {/* Loyalty Program Tab */}
          {activeTab === 'loyalty' && (
             <div className={sectionClass}>
               <h3 className="text-lg font-bold text-admin-dark-text border-b border-admin-dark-border pb-2 mb-4">Customer Loyalty Programs</h3>
               
               <div className="space-y-6">
                 {/* List Programs */}
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {loyaltyPrograms.map(prog => (
                         <div key={prog.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm relative">
                             <div className="flex justify-between items-start mb-2">
                                 <h4 className="font-bold text-admin-dark-text">{prog.name}</h4>
                                 <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${prog.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{prog.active ? 'Active' : 'Inactive'}</span>
                             </div>
                             <div className="flex items-center gap-3 mb-3">
                                 {prog.iconUrl ? <img src={prog.iconUrl} className="w-10 h-10 object-contain bg-gray-50 rounded-full border" /> : <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xs">?</div>}
                                 <div className="text-xs text-gray-500">
                                     <p>Need: {prog.stickersRequired} stickers</p>
                                     <p className="truncate max-w-[150px]">{prog.rewardDescription}</p>
                                 </div>
                             </div>
                             <div className="flex justify-end gap-2 mt-2 border-t pt-2">
                                 <button onClick={() => handleToggleProgram(prog.id)} className="text-xs text-blue-500 hover:underline">{prog.active ? 'Disable' : 'Enable'}</button>
                                 <button onClick={() => handleDeleteProgram(prog.id)} className="text-xs text-red-500 hover:text-red-700 font-bold"><TrashIcon className="w-3 h-3" /></button>
                             </div>
                         </div>
                     ))}
                 </div>

                 {/* Add New Program */}
                 <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                     <h4 className="font-bold text-admin-dark-text mb-4">Create New Loyalty Card</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                             <label className="block text-xs font-bold text-gray-500 mb-1">Program Name</label>
                             <input className={inputClass} placeholder="e.g. Manicure Card" value={newProgram.name} onChange={e => setNewProgram({...newProgram, name: e.target.value})} />
                         </div>
                         <div>
                             <label className="block text-xs font-bold text-gray-500 mb-1">Stickers Required</label>
                             <input type="number" className={inputClass} value={newProgram.stickersRequired} onChange={e => setNewProgram({...newProgram, stickersRequired: parseInt(e.target.value)})} />
                         </div>
                         <div className="md:col-span-2">
                             <label className="block text-xs font-bold text-gray-500 mb-1">Reward Description</label>
                             <input className={inputClass} placeholder="e.g. 50% Off next service" value={newProgram.rewardDescription} onChange={e => setNewProgram({...newProgram, rewardDescription: e.target.value})} />
                         </div>
                         <div>
                             <label className="block text-xs font-bold text-gray-500 mb-1">Sticker Icon (Custom Image)</label>
                             <input type="file" onChange={e => e.target.files && setNewProgramIcon(e.target.files[0])} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-admin-dark-primary/10 file:text-admin-dark-primary hover:file:bg-admin-dark-primary/20" />
                         </div>
                     </div>
                     <div className="mt-4 text-right">
                         <button onClick={handleAddProgram} disabled={isLoading} className="bg-admin-dark-primary text-white px-6 py-2 rounded-lg font-bold text-sm hover:opacity-90 flex items-center gap-2 ml-auto">
                             <PlusIcon className="w-4 h-4"/> Create Program
                         </button>
                     </div>
                 </div>
               </div>
             </div>
          )}

          {/* Integrations Tab */}
          {activeTab === 'integrations' && (
             <div className={sectionClass}>
               <div className="flex justify-between items-center border-b border-admin-dark-border pb-2 mb-4">
                   <h3 className="text-lg font-bold text-admin-dark-text">EmailJS Configuration</h3>
                   <button onClick={() => setIsHelpOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors">
                       ℹ️ Setup Guide
                   </button>
               </div>
               
               <div className="bg-white p-6 rounded-lg border border-admin-dark-border mb-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                         <label className={labelClass}>Service ID</label>
                         <input name="emailServiceId" value={settings.emailServiceId} onChange={handleChange} className={inputClass} placeholder="service_xxx" />
                      </div>
                      <div>
                         <label className={labelClass}>Template ID</label>
                         <input name="emailTemplateId" value={settings.emailTemplateId} onChange={handleChange} className={inputClass} placeholder="template_xxx" />
                      </div>
                      <div className="md:col-span-2">
                         <label className={labelClass}>Public Key</label>
                         <input type="password" name="emailPublicKey" value={settings.emailPublicKey} onChange={handleChange} className={inputClass} />
                      </div>
                   </div>
               </div>

               <h3 className="text-lg font-bold text-admin-dark-text border-b border-admin-dark-border pb-2 mb-4">System Actions</h3>
               <div className="space-y-4">
                  <div className="flex items-center gap-3 bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/30">
                     <input type="checkbox" id="isMaintenanceMode" name="isMaintenanceMode" checked={settings.isMaintenanceMode} onChange={handleChange} className="w-5 h-5 accent-yellow-500 rounded" />
                     <label htmlFor="isMaintenanceMode" className="text-yellow-700 font-bold">Maintenance Mode (Hide site from public)</label>
                  </div>
                  <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/30">
                      <h4 className="text-red-700 font-bold mb-2">Danger Zone</h4>
                      <button onClick={props.onClearAllData} className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700">Clear All Database Data</button>
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
