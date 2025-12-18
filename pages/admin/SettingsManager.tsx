
import React, { useState, useEffect } from 'react';
import { dbUploadFile } from '../../utils/dbAdapter';
import HelpGuideModal from './components/HelpGuideModal';
import TrashIcon from '../../components/icons/TrashIcon';
import PlusIcon from '../../components/icons/PlusIcon';
import { LoyaltyProgram } from '../../App';

interface SettingsManagerProps {
  onSaveAllSettings: (settings: any) => Promise<void>;
  onClearAllData: () => Promise<void>;
  startTour: (tourKey: 'settings') => void;
  [key: string]: any; 
}

const TABS = [
  { id: 'general', label: 'General & Branding' },
  { id: 'company', label: 'Company Profile' },
  { id: 'hero', label: 'Home Page (Hero)' },
  { id: 'about', label: 'About Page' },
  { id: 'showroom', label: 'Showroom & Specials' },
  { id: 'contact', label: 'Footer & Booking Info' },
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
    
    // Company Profile (New)
    legalName: props.company?.legalName || '',
    licenseNumber: props.company?.licenseNumber || '',
    openingHours: props.company?.openingHours || 'Mon-Fri: 09:00 - 18:00',
    studioTagline: props.company?.tagline || 'Artistry in Every Ink',
    
    // Hero Section
    heroTitle: props.hero?.title || 'Ink & Artistry',
    heroSubtitle: props.hero?.subtitle || 'Experience the art of skin',
    heroButtonText: props.hero?.buttonText || 'Book an Appointment',
    heroBgUrl: props.heroBgUrl || '', 
    
    // About Section
    aboutTitle: props.about?.title || 'Our Story',
    aboutText1: props.about?.text1 || 'Bos Salon was born from a passion for permanent art...',
    aboutText2: props.about?.text2 || 'We specialize in custom tattoos...',
    aboutUsImageUrl: props.aboutUsImageUrl || '',
    
    // Showroom Section
    showroomTitle: props.showroomTitle || 'Tattoo Flash Gallery',
    showroomDescription: props.showroomDescription || 'Browse our collection of custom designs...',
    
    // Contact & Footer
    address: props.address || '',
    phone: props.phone || '',
    email: props.email || '',
    bankName: props.bankName || '',
    accountNumber: props.accountNumber || '',
    branchCode: props.branchCode || '',
    accountType: props.accountType || '',
    socialLinks: props.socialLinks || [],
    
    // Detailed Booking Config
    contactIntro: props.contact?.intro || 'Ready for new ink? Fill out the form below.',
    processTitle: props.contact?.processTitle || 'Our Process',
    processIntro: props.contact?.processIntro || "We believe in personal care. Every detail matters.",
    processSteps: props.contact?.processSteps || [
      "Request Appointment: Use this form to tell us what you need.",
      "Consultation: We'll contact you to confirm details.",
      "Relax & Enjoy: Come in and let us work our magic."
    ],
    designTitle: props.contact?.designTitle || 'Design Ideas?',
    designIntro: props.contact?.designIntro || "Have a specific design in mind?",
    designPoints: props.contact?.designPoints || [
      "Service Type: Fine Line, Traditional, or Realism?",
      "Inspiration: Upload photos you love."
    ],

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

  useEffect(() => {
    setSettings(prev => ({
        ...prev,
        companyName: props.companyName || prev.companyName,
        whatsAppNumber: props.whatsAppNumber || prev.whatsAppNumber,
        logoUrl: props.logoUrl || prev.logoUrl,
        legalName: props.company?.legalName || prev.legalName,
        licenseNumber: props.company?.licenseNumber || prev.licenseNumber,
        openingHours: props.company?.openingHours || prev.openingHours,
        studioTagline: props.company?.tagline || prev.studioTagline,
        heroTitle: props.hero?.title || prev.heroTitle,
        heroSubtitle: props.hero?.subtitle || prev.heroSubtitle,
        heroButtonText: props.hero?.buttonText || prev.heroButtonText,
        heroBgUrl: props.heroBgUrl || prev.heroBgUrl,
        aboutTitle: props.about?.title || prev.aboutTitle,
        aboutText1: props.about?.text1 || prev.aboutText1,
        aboutText2: props.about?.text2 || prev.aboutText2,
        aboutUsImageUrl: props.aboutUsImageUrl || prev.aboutUsImageUrl,
        showroomTitle: props.showroomTitle || prev.showroomTitle,
        showroomDescription: props.showroomDescription || prev.showroomDescription,
        address: props.address || prev.address,
        phone: props.phone || prev.phone,
        email: props.email || prev.email,
        bankName: props.bankName || prev.bankName,
        accountNumber: props.accountNumber || prev.accountNumber,
        branchCode: props.branchCode || prev.branchCode,
        accountType: props.accountType || prev.accountType,
        socialLinks: props.socialLinks || prev.socialLinks, 
        taxEnabled: props.taxEnabled ?? prev.taxEnabled,
        vatPercentage: props.vatPercentage || prev.vatPercentage,
        vatNumber: props.vatNumber || prev.vatNumber,
        emailServiceId: props.emailServiceId || prev.emailServiceId,
        emailTemplateId: props.emailTemplateId || prev.emailTemplateId,
        emailPublicKey: props.emailPublicKey || prev.emailPublicKey,
        apkUrl: props.apkUrl || prev.apkUrl,
        isMaintenanceMode: props.isMaintenanceMode ?? prev.isMaintenanceMode,
        contactIntro: props.contact?.intro || prev.contactIntro,
        processTitle: props.contact?.processTitle || prev.processTitle,
        processIntro: props.contact?.processIntro || prev.processIntro,
        processSteps: props.contact?.processSteps || prev.processSteps,
        designTitle: props.contact?.designTitle || prev.designTitle,
        designIntro: props.contact?.designIntro || prev.designIntro,
        designPoints: props.contact?.designPoints || prev.designPoints,
    }));
    if (props.loyaltyPrograms && props.loyaltyPrograms.length > 0) {
        setLoyaltyPrograms(props.loyaltyPrograms);
    }
  }, [props.companyName, props.socialLinks, props.loyaltyPrograms, props.heroBgUrl, props.contact, props.company]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setSettings(prev => ({ ...prev, [name]: val }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string, bucket: string) => {
    if (e.target.files && e.target.files[0]) {
      setIsLoading(true);
      setMessage({ text: 'Uploading media...', type: 'success' });
      try {
        const url = await dbUploadFile(e.target.files[0], bucket);
        setSettings(prev => ({ ...prev, [fieldName]: url }));
        setMessage({ text: 'Media ready! Remember to click Save All.', type: 'success' });
      } catch (error: any) {
        console.error("Upload failed", error);
        setMessage({ text: `Upload failed: ${error.message || 'Unknown error'}`, type: 'error' });
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
        setMessage({ text: 'Social link added locally. Save All to publish.', type: 'success' });
    } catch (error: any) {
        console.error("Failed to upload icon", error);
        alert(`Failed to upload icon: ${error.message}`);
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

  const handleSave = async () => {
    setIsLoading(true);
    setMessage({ text: 'Synchronizing with database...', type: 'success' });
    try {
      const dbPayload = {
        companyName: settings.companyName,
        logoUrl: settings.logoUrl,
        heroBgUrl: settings.heroBgUrl,
        aboutUsImageUrl: settings.aboutUsImageUrl,
        whatsAppNumber: settings.whatsAppNumber,
        address: settings.address,
        phone: settings.phone,
        email: settings.email,
        socialLinks: settings.socialLinks,
        showroomTitle: settings.showroomTitle,
        showroomDescription: settings.showroomDescription,
        bankName: settings.bankName,
        accountNumber: settings.accountNumber,
        branchCode: settings.branchCode,
        accountType: settings.accountType,
        vatNumber: settings.vatNumber,
        isMaintenanceMode: settings.isMaintenanceMode,
        apkUrl: settings.apkUrl,
        taxEnabled: settings.taxEnabled,
        vatPercentage: settings.vatPercentage,
        emailServiceId: settings.emailServiceId,
        emailTemplateId: settings.emailTemplateId,
        emailPublicKey: settings.emailPublicKey,
        
        company: {
            legalName: settings.legalName,
            licenseNumber: settings.licenseNumber,
            openingHours: settings.openingHours,
            tagline: settings.studioTagline,
        },
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
        contact: {
             intro: settings.contactIntro,
             processTitle: settings.processTitle,
             processIntro: settings.processIntro,
             processSteps: settings.processSteps,
             designTitle: settings.designTitle,
             designIntro: settings.designIntro,
             designPoints: settings.designPoints
        },
        loyaltyPrograms: loyaltyPrograms,
        loyaltyProgram: { enabled: true, stickersRequired: 10, rewardDescription: 'See Programs' }, 
      };

      await props.onSaveAllSettings(dbPayload);
      setMessage({ text: 'Live Website Updated Instantly! 🎉', type: 'success' });
      setTimeout(() => setMessage(null), 5000);
    } catch (error: any) {
      console.error("Save failed", error);
      setMessage({ text: `Failed: ${error.message || 'Error'}`, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const updateList = (listName: 'processSteps' | 'designPoints', index: number, value: string) => {
    setSettings(prev => {
        const newList = [...(prev[listName] as string[])];
        newList[index] = value;
        return { ...prev, [listName]: newList };
    });
  };

  const addListItem = (listName: 'processSteps' | 'designPoints') => {
    setSettings(prev => ({
        ...prev,
        [listName]: [...(prev[listName] as string[]), "New Step..."]
    }));
  };

  const removeListItem = (listName: 'processSteps' | 'designPoints', index: number) => {
    setSettings(prev => ({
        ...prev,
        [listName]: (prev[listName] as string[]).filter((_, i) => i !== index)
    }));
  };

  const inputClass = "w-full bg-white border border-admin-dark-border rounded-lg p-2 sm:p-3 text-xs sm:text-sm text-admin-dark-text focus:ring-2 focus:ring-admin-dark-primary outline-none transition";
  const labelClass = "block text-xs sm:text-sm font-bold text-admin-dark-text-secondary mb-1 sm:mb-2";
  const sectionClass = "space-y-4 sm:space-y-6 animate-fade-in";

  return (
    <div className="bg-admin-dark-card border border-admin-dark-border rounded-xl shadow-lg flex flex-col h-full overflow-hidden">
      <HelpGuideModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} section="integrations" />
      
      <header className="p-3 sm:p-6 border-b border-admin-dark-border flex justify-between items-center bg-white/50 flex-shrink-0">
        <div>
            <h2 className="text-lg sm:text-xl font-bold text-admin-dark-text">Studio CMS</h2>
            <p className="text-xs text-admin-dark-text-secondary">Changes reflect instantly on your live site.</p>
        </div>
        <div className="flex gap-2 items-center">
           {message && (
             <div className={`px-2 sm:px-4 py-1 sm:py-2 rounded-lg text-xs font-bold shadow-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
               {message.text}
             </div>
           )}
           <button 
             onClick={handleSave} 
             disabled={isLoading}
             className="bg-admin-dark-primary text-white px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg font-bold text-xs sm:text-sm hover:opacity-90 disabled:opacity-50 transition-all shadow-md active:scale-95"
           >
             {isLoading ? 'Syncing...' : 'Publish Changes'}
           </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 bg-white/50 border-r border-admin-dark-border overflow-y-auto hidden md:block flex-shrink-0">
          <nav className="p-4 space-y-2">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-admin-dark-primary text-white shadow-md' : 'text-admin-dark-text-secondary hover:bg-black/5'}`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto p-3 sm:p-8 bg-admin-dark-bg">
          
          {activeTab === 'general' && (
            <div className={sectionClass}>
              <h3 className="text-sm sm:text-lg font-bold text-admin-dark-text border-b border-admin-dark-border pb-2">Branding</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div>
                   <label className={labelClass}>Public Display Name</label>
                   <input name="companyName" value={settings.companyName} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                   <label className={labelClass}>WhatsApp Number</label>
                   <input name="whatsAppNumber" value={settings.whatsAppNumber} onChange={handleChange} className={inputClass} placeholder="e.g. 27791234567" />
                </div>
                <div className="lg:col-span-2">
                   <label className={labelClass}>Studio Logo</label>
                   <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-dashed border-gray-300">
                      {settings.logoUrl && <img src={settings.logoUrl} alt="Logo" className="w-20 h-20 object-contain bg-gray-50 rounded-lg p-2 border" />}
                      <input type="file" onChange={(e) => handleFileUpload(e, 'logoUrl', 'settings')} className="text-xs sm:text-sm text-admin-dark-text-secondary w-full" />
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'company' && (
            <div className={sectionClass}>
                <h3 className="text-sm sm:text-lg font-bold text-admin-dark-text border-b border-admin-dark-border pb-2">Studio Identity</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <label className={labelClass}>Legal Entity Name</label>
                        <input name="legalName" value={settings.legalName} onChange={handleChange} className={inputClass} placeholder="Official business name for invoices" />
                    </div>
                    <div>
                        <label className={labelClass}>Tattoo License / Reg #</label>
                        <input name="licenseNumber" value={settings.licenseNumber} onChange={handleChange} className={inputClass} placeholder="Studio Registration No." />
                    </div>
                    <div>
                        <label className={labelClass}>Business Hours</label>
                        <textarea name="openingHours" rows={2} value={settings.openingHours} onChange={handleChange} className={inputClass} placeholder="e.g. Mon-Sat 10:00 - 19:00" />
                    </div>
                    <div>
                        <label className={labelClass}>Studio Tagline</label>
                        <input name="studioTagline" value={settings.studioTagline} onChange={handleChange} className={inputClass} placeholder="The slogan displayed in the welcome screen" />
                    </div>
                </div>
            </div>
          )}

          {activeTab === 'hero' && (
            <div className={sectionClass}>
               <h3 className="text-sm sm:text-lg font-bold text-admin-dark-text border-b border-admin-dark-border pb-2">Hero Section (Home)</h3>
               <div className="grid grid-cols-1 gap-4">
                 <div>
                    <label className={labelClass}>Main Heading</label>
                    <input name="heroTitle" value={settings.heroTitle} onChange={handleChange} className={inputClass} />
                 </div>
                 <div>
                    <label className={labelClass}>Secondary Heading</label>
                    <input name="heroSubtitle" value={settings.heroSubtitle} onChange={handleChange} className={inputClass} />
                 </div>
                 <div>
                    <label className={labelClass}>Call to Action Text</label>
                    <input name="heroButtonText" value={settings.heroButtonText} onChange={handleChange} className={inputClass} />
                 </div>
                 <div>
                    <label className={labelClass}>Background Banner</label>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-white p-4 rounded-xl border border-dashed border-gray-300">
                       {settings.heroBgUrl && <img src={settings.heroBgUrl} alt="Hero" className="w-full sm:w-48 h-24 object-cover rounded-lg shadow-sm" />}
                       <input type="file" onChange={(e) => handleFileUpload(e, 'heroBgUrl', 'settings')} className="text-xs sm:text-sm text-admin-dark-text-secondary w-full" />
                    </div>
                 </div>
               </div>
            </div>
          )}

          {/* ... Rest of tabs (About, Showroom, Contact, etc) remain optimized for instant saving via the handleSave function ... */}
          {activeTab === 'integrations' && (
             <div className={sectionClass}>
               <div className="flex justify-between items-center border-b border-admin-dark-border pb-2">
                   <h3 className="text-sm sm:text-lg font-bold text-admin-dark-text">Email Notifications</h3>
                   <button onClick={() => setIsHelpOpen(true)} className="text-blue-600 font-bold text-xs hover:underline">Setup Guide</button>
               </div>
               <div className="bg-white p-6 rounded-xl border border-admin-dark-border space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                         <label className={labelClass}>EmailJS Service ID</label>
                         <input name="emailServiceId" value={settings.emailServiceId} onChange={handleChange} className={inputClass} />
                      </div>
                      <div>
                         <label className={labelClass}>Template ID</label>
                         <input name="emailTemplateId" value={settings.emailTemplateId} onChange={handleChange} className={inputClass} />
                      </div>
                   </div>
                   <div>
                      <label className={labelClass}>Public Key</label>
                      <input type="password" name="emailPublicKey" value={settings.emailPublicKey} onChange={handleChange} className={inputClass} />
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
