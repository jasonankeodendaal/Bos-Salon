
import React, { useState, useEffect } from 'react';
import { dbUploadFile } from '../../utils/dbAdapter';
import HelpGuideModal from './components/HelpGuideModal';
import TrashIcon from '../../components/icons/TrashIcon';
import PlusIcon from '../../components/icons/PlusIcon';
import { LoyaltyProgram, BookingOption } from '../../App';

// Types passed from parent
interface SettingsManagerProps {
  onSaveAllSettings: (settings: any) => Promise<void>;
  onClearAllData: () => Promise<void>;
  startTour: (tourKey: any) => void;
  // All current settings (now including specific section objects)
  [key: string]: any; 
}

// Section Tabs
const TABS = [
  { id: 'general', label: '🏢 Company Profile' },
  { id: 'hero', label: 'Home Page (Hero)' },
  { id: 'about', label: 'About Page' },
  { id: 'showroom', label: 'Showroom & Specials' },
  { id: 'aftercare', label: 'Aftercare Guide' },
  { id: 'contact', label: 'Footer & Booking Info' },
  { id: 'booking-opts', label: 'Booking Form Options' },
  { id: 'financials', label: 'Financial Config' },
  { id: 'loyalty', label: 'Loyalty Programs' },
  { id: 'payments', label: 'Yoco Payments' },
  { id: 'terminal', label: 'Yoco Machine (Terminal)' },
  { id: 'integrations', label: 'Integrations & Adv' },
  { id: 'system-guide', label: '📖 System Overview' },
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

  // Booking Options Local State
  const [bookingOptions, setBookingOptions] = useState<BookingOption[]>(props.bookingOptions || []);
  const [newOptLabel, setNewOptLabel] = useState('');
  const [newOptDesc, setNewOptDesc] = useState('');

  // -- STATE MANAGEMENT FOR ALL FIELDS --
  const [settings, setSettings] = useState({
    // General
    companyName: props.companyName || 'Bos Salon',
    whatsAppNumber: props.whatsAppNumber || '',
    logoUrl: props.logoUrl || '',
    businessHours: props.businessHours || '',
    
    // Hero Section
    heroTitle: props.hero?.title || 'Nail and beauty',
    heroSubtitle: props.hero?.subtitle || 'Experience the art of nature',
    heroButtonText: props.hero?.buttonText || 'Book an Appointment',
    heroBgUrl: props.heroBgUrl || '', 
    
    // About Section
    aboutTitle: props.about?.title || 'Our Story',
    aboutText1: props.about?.text1 || 'Bos Salon was born from a love for natural beauty...',
    aboutText2: props.about?.text2 || 'We specialize in bespoke nail art...',
    aboutUsImageUrl: props.aboutUsImageUrl || '',
    
    // Showroom Section
    showroomTitle: props.showroomTitle || 'Nail Art Gallery',
    showroomDescription: props.showroomDescription || 'Browse our collection...',
    
    // Contact & Footer & Booking Info
    address: props.address || '',
    phone: props.phone || '',
    email: props.email || '',
    bankName: props.bankName || '',
    accountNumber: props.accountNumber || '',
    branchCode: props.branchCode || '',
    accountType: props.accountType || '',
    socialLinks: props.socialLinks || [],
    
    // NEW: Detailed Booking/Process Config
    contactIntro: props.contact?.intro || 'Ready for a fresh look? Fill out the form below.',
    processTitle: props.contact?.processTitle || 'Our Process',
    processIntro: props.contact?.processIntro || "We believe in personal care. Whether it's a simple tattoo or complex custom art, we ensure every detail is perfect.",
    processSteps: props.contact?.processSteps || [
      "Request Appointment: Use this form to tell us what service you need.",
      "Consultation: We'll contact you to confirm details, colors, and specific requirements.",
      "Relax & Enjoy: Come in, relax in our studio, and let us work our magic."
    ],
    designTitle: props.contact?.designTitle || 'Design Ideas?',
    designIntro: props.contact?.designIntro || "If you have a specific design in mind, let us know!",
    designPoints: props.contact?.designPoints || [
      "Service Type: Fine Line, Traditional, Realism, or Custom Art?",
      "Inspiration: Upload photos of designs you love."
    ],

    // Financials
    taxEnabled: props.taxEnabled || false,
    vatPercentage: props.vatPercentage || 15,
    vatNumber: props.vatNumber || '',

    // Yoco Config
    yocoEnabled: props.payments?.yocoEnabled || false,
    yocoPublicKey: props.payments?.yocoPublicKey || '',
    yocoSecretKey: props.payments?.yocoSecretKey || '',

    // Yoco Terminal (Physical Machine)
    terminalEnabled: props.payments?.terminalEnabled || false,
    terminalId: props.payments?.terminalId || '',
    terminalSecretKey: props.payments?.terminalSecretKey || '',

    // Integrations
    emailServiceId: props.emailServiceId || '',
    emailTemplateId: props.emailTemplateId || '',
    emailPublicKey: props.emailPublicKey || '',
    apkUrl: props.apkUrl || '',
    isMaintenanceMode: props.isMaintenanceMode || false,

    // NEW: Aftercare Guides
    aftercareTitle: props.aftercare?.title || 'Aftercare Guide',
    aftercareIntro: props.aftercare?.intro || 'Proper care ensures long-lasting results.',
    aftercareSections: props.aftercare?.sections || []
  });

  // Sync state with props when database content loads
  useEffect(() => {
    setSettings(prev => ({
        ...prev,
        companyName: props.companyName || prev.companyName,
        whatsAppNumber: props.whatsAppNumber || prev.whatsAppNumber,
        logoUrl: props.logoUrl || prev.logoUrl,
        businessHours: props.businessHours || prev.businessHours,
        heroTitle: props.hero?.title || prev.heroTitle,
        heroSubtitle: props.hero?.subtitle || prev.heroSubtitle,
        heroButtonText: props.hero?.buttonText || prev.heroButtonText,
        heroBgUrl: props.heroBgUrl || prev.heroBgUrl,
        aboutTitle: props.about?.title || prev.aboutTitle,
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
        yocoEnabled: props.payments?.yocoEnabled || prev.yocoEnabled,
        yocoPublicKey: props.payments?.yocoPublicKey || prev.yocoPublicKey,
        yocoSecretKey: props.payments?.yocoSecretKey || prev.yocoSecretKey,
        terminalEnabled: props.payments?.terminalEnabled || prev.terminalEnabled,
        terminalId: props.payments?.terminalId || prev.terminalId,
        terminalSecretKey: props.payments?.terminalSecretKey || prev.terminalSecretKey,
        aftercareTitle: props.aftercare?.title || prev.aftercareTitle,
        aftercareIntro: props.aftercare?.intro || prev.aftercareIntro,
        aftercareSections: props.aftercare?.sections || prev.aftercareSections
    }));
    if (props.loyaltyPrograms && props.loyaltyPrograms.length > 0) {
        setLoyaltyPrograms(props.loyaltyPrograms);
    }
    if (props.bookingOptions && props.bookingOptions.length > 0) {
        setBookingOptions(props.bookingOptions);
    }
  }, [props]);

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
        setMessage({ text: 'Social link added (remember to Save All)', type: 'success' });
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
              iconUrl = settings.logoUrl; 
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

  // --- Booking Options Handlers ---
  const handleAddBookingOption = () => {
    if (!newOptLabel) return;
    const newOpt: BookingOption = {
      id: crypto.randomUUID(),
      label: newOptLabel,
      description: newOptDesc
    };
    setBookingOptions(prev => [...prev, newOpt]);
    setNewOptLabel('');
    setNewOptDesc('');
  };

  const handleRemoveBookingOption = (id: string) => {
    setBookingOptions(prev => prev.filter(o => o.id !== id));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      // STRICT PAYLOAD CONSTRUCTION
      const dbPayload = {
        companyName: settings.companyName,
        logoUrl: settings.logoUrl,
        heroBgUrl: settings.heroBgUrl,
        aboutUsImageUrl: settings.aboutUsImageUrl,
        whatsAppNumber: settings.whatsAppNumber,
        businessHours: settings.businessHours,
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
        payments: {
            yocoEnabled: settings.yocoEnabled,
            yocoPublicKey: settings.yocoPublicKey,
            yocoSecretKey: settings.yocoSecretKey,
            terminalEnabled: settings.terminalEnabled,
            terminalId: settings.terminalId,
            terminalSecretKey: settings.terminalSecretKey,
        },
        aftercare: {
            title: settings.aftercareTitle,
            intro: settings.aftercareIntro,
            sections: settings.aftercareSections
        },
        loyaltyPrograms: loyaltyPrograms,
        bookingOptions: bookingOptions,
        loyaltyProgram: { enabled: true, stickersRequired: 10, rewardDescription: 'See Programs' }, 
      };

      await props.onSaveAllSettings(dbPayload);
      setMessage({ text: 'Saved successfully!', type: 'success' });
    } catch (error: any) {
      console.error("Save failed", error);
      setMessage({ text: `Failed: ${error.message || 'Unknown error'}`, type: 'error' });
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
        [listName]: [...(prev[listName] as string[]), "New Item..."]
    }));
  };

  const removeListItem = (listName: 'processSteps' | 'designPoints', index: number) => {
    setSettings(prev => ({
        ...prev,
        [listName]: (prev[listName] as string[]).filter((_: string, i: number) => i !== index)
    }));
  };

  // --- Aftercare section logic ---
  const addAftercareSection = () => {
    setSettings(prev => ({
        ...prev,
        aftercareSections: [...prev.aftercareSections, { title: 'New Category', icon: '✨', items: ['Care tip...'] }]
    }));
  };

  const removeAftercareSection = (index: number) => {
    setSettings(prev => ({
        ...prev,
        aftercareSections: prev.aftercareSections.filter((_: any, i: number) => i !== index)
    }));
  };

  const updateAftercareSection = (index: number, field: string, value: any) => {
    setSettings(prev => {
        const newSections = [...prev.aftercareSections];
        newSections[index] = { ...newSections[index], [field]: value };
        return { ...prev, aftercareSections: newSections };
    });
  };

  const addAftercareItem = (sectionIndex: number) => {
    setSettings(prev => {
        const newSections = [...prev.aftercareSections];
        newSections[sectionIndex].items = [...newSections[sectionIndex].items, 'New care tip...'];
        return { ...prev, aftercareSections: newSections };
    });
  };

  const removeAftercareItem = (sectionIndex: number, itemIndex: number) => {
    setSettings(prev => {
        const newSections = [...prev.aftercareSections];
        newSections[sectionIndex].items = newSections[sectionIndex].items.filter((_: string, i: number) => i !== itemIndex);
        return { ...prev, aftercareSections: newSections };
    });
  };

  const updateAftercareItem = (sectionIndex: number, itemIndex: number, value: string) => {
    setSettings(prev => {
        const newSections = [...prev.aftercareSections];
        newSections[sectionIndex].items[itemIndex] = value;
        return { ...prev, aftercareSections: newSections };
    });
  };

  const inputClass = "w-full bg-white border border-admin-dark-border rounded-lg p-2 sm:p-3 text-xs sm:text-sm text-admin-dark-text focus:ring-2 focus:ring-admin-dark-primary outline-none transition";
  const labelClass = "block text-xs sm:text-sm font-bold text-admin-dark-text-secondary mb-1 sm:mb-2";
  const sectionClass = "space-y-4 sm:space-y-6 animate-fade-in";

  return (
    <div className="bg-admin-dark-card border border-admin-dark-border rounded-xl shadow-lg flex flex-col h-full overflow-hidden">
      <HelpGuideModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} section="integrations" />
      
      {/* Header */}
      <header className="p-3 sm:p-6 border-b border-admin-dark-border flex justify-between items-center bg-white/50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-admin-dark-text">CMS</h2>
            <p className="text-xs text-admin-dark-text-secondary hidden sm:block">Edit every aspect of your website.</p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
           {message && (
             <div className={`px-2 sm:px-4 py-1 sm:py-2 rounded-lg text-xs font-bold animate-pulse ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
               {message.text}
             </div>
           )}
           {activeTab !== 'system-guide' && (
             <button 
               onClick={handleSave} 
               disabled={isLoading}
               className="bg-admin-dark-primary text-white px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg font-bold text-xs sm:text-sm hover:opacity-90 disabled:opacity-50 transition-all shadow-md"
             >
               {isLoading ? 'Saving...' : 'Save All'}
             </button>
           )}
        </div>
      </header>

      {/* Mobile Nav */}
      <div className="md:hidden p-3 border-b border-admin-dark-border bg-gray-50 flex-shrink-0">
          <select 
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-admin-dark-primary"
          >
              {TABS.map(tab => (
                  <option key={tab.id} value={tab.id}>{tab.label}</option>
              ))}
          </select>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Tabs (Desktop) */}
        <aside className="w-64 bg-white/50 border-r border-admin-dark-border overflow-y-auto hidden md:block flex-shrink-0">
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
        <main className="flex-1 overflow-y-auto p-3 sm:p-8 bg-admin-dark-bg">
          
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className={sectionClass}>
              <h3 className="text-sm sm:text-lg font-bold text-admin-dark-text border-b border-admin-dark-border pb-2 mb-4">Company Profile & Branding</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div>
                   <label className={labelClass}>Company Name</label>
                   <input name="companyName" value={settings.companyName} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                   <label className={labelClass}>WhatsApp (e.g. 27795904162)</label>
                   <input name="whatsAppNumber" value={settings.whatsAppNumber} onChange={handleChange} className={inputClass} placeholder="No +" />
                </div>
                <div className="lg:col-span-2">
                   <label className={labelClass}>Business Hours</label>
                   <textarea name="businessHours" rows={3} value={settings.businessHours} onChange={handleChange} className={inputClass} placeholder="Mon-Fri: 09:00 - 17:00..." />
                </div>
                <div className="lg:col-span-2">
                   <label className={labelClass}>Logo</label>
                   <div className="flex items-center gap-4">
                      {settings.logoUrl && <img src={settings.logoUrl} alt="Logo" className="w-12 h-12 sm:w-16 sm:h-16 object-contain bg-white rounded-lg p-2 border border-gray-200" />}
                      <input type="file" onChange={(e) => handleFileUpload(e, 'logoUrl', 'settings')} className="text-xs sm:text-sm text-admin-dark-text-secondary w-full" />
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* Hero Tab */}
          {activeTab === 'hero' && (
            <div className={sectionClass}>
               <h3 className="text-sm sm:text-lg font-bold text-admin-dark-text border-b border-admin-dark-border pb-2 mb-4">Home Page Hero</h3>
               <div className="grid grid-cols-1 gap-4 sm:gap-6">
                 <div>
                    <label className={labelClass}>Main Title</label>
                    <input name="heroTitle" value={settings.heroTitle} onChange={handleChange} className={inputClass} />
                 </div>
                 <div>
                    <label className={labelClass}>Subtitle</label>
                    <input name="heroSubtitle" value={settings.heroSubtitle} onChange={handleChange} className={inputClass} />
                 </div>
                 <div>
                    <label className={labelClass}>Button Text</label>
                    <input name="heroButtonText" value={settings.heroButtonText} onChange={handleChange} className={inputClass} />
                 </div>
                 <div>
                    <label className={labelClass}>Background Image</label>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                       {settings.heroBgUrl && <img src={settings.heroBgUrl} alt="Hero" className="w-full sm:w-32 h-20 object-cover rounded-lg" />}
                       <input type="file" onChange={(e) => handleFileUpload(e, 'heroBgUrl', 'settings')} className="text-xs sm:text-sm text-admin-dark-text-secondary w-full" />
                    </div>
                 </div>
               </div>
            </div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
             <div className={sectionClass}>
                <h3 className="text-sm sm:text-lg font-bold text-admin-dark-text border-b border-admin-dark-border pb-2 mb-4">About Us</h3>
                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                  <div>
                     <label className={labelClass}>Title</label>
                     <input name="aboutTitle" value={settings.aboutTitle} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                     <label className={labelClass}>Story Part 1</label>
                     <textarea name="aboutText1" rows={4} value={settings.aboutText1} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                     <label className={labelClass}>Story Part 2</label>
                     <textarea name="aboutText2" rows={4} value={settings.aboutText2} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                     <label className={labelClass}>Feature Image</label>
                     <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        {settings.aboutUsImageUrl && <img src={settings.aboutUsImageUrl} alt="About" className="w-24 h-24 object-cover rounded-full" />}
                        <input type="file" onChange={(e) => handleFileUpload(e, 'aboutUsImageUrl', 'settings')} className="text-xs sm:text-sm text-admin-dark-text-secondary w-full" />
                     </div>
                  </div>
                </div>
             </div>
          )}

          {/* Showroom Tab */}
          {activeTab === 'showroom' && (
             <div className={sectionClass}>
               <h3 className="text-sm sm:text-lg font-bold text-admin-dark-text border-b border-admin-dark-border pb-2 mb-4">Showroom</h3>
               <div className="grid grid-cols-1 gap-4 sm:gap-6">
                  <div>
                     <label className={labelClass}>Title</label>
                     <input name="showroomTitle" value={settings.showroomTitle} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                     <label className={labelClass}>Description</label>
                     <textarea name="showroomDescription" rows={3} value={settings.showroomDescription} onChange={handleChange} className={inputClass} />
                  </div>
               </div>
             </div>
          )}

          {/* Aftercare Tab */}
          {activeTab === 'aftercare' && (
            <div className={sectionClass}>
               <h3 className="text-sm sm:text-lg font-bold text-admin-dark-text border-b border-admin-dark-border pb-2 mb-4">Aftercare Guide Builder</h3>
               <div className="grid grid-cols-1 gap-4 mb-8">
                  <div>
                     <label className={labelClass}>Guide Title</label>
                     <input name="aftercareTitle" value={settings.aftercareTitle} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                     <label className={labelClass}>Introduction Text</label>
                     <textarea name="aftercareIntro" rows={2} value={settings.aftercareIntro} onChange={handleChange} className={inputClass} />
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-admin-dark-text">Guide Sections</h4>
                    <button onClick={addAftercareSection} className="flex items-center gap-1 text-xs font-bold text-admin-dark-primary bg-white border border-admin-dark-border px-3 py-1 rounded-lg hover:bg-gray-50">
                        <PlusIcon className="w-3 h-3" /> Add Section
                    </button>
                  </div>

                  <div className="space-y-4">
                    {settings.aftercareSections.map((section: any, sIdx: number) => (
                        <div key={sIdx} className="bg-white border border-admin-dark-border rounded-xl p-4 sm:p-6 shadow-sm">
                            <div className="flex justify-between gap-4 mb-4">
                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Title</label>
                                        <input value={section.title} onChange={e => updateAftercareSection(sIdx, 'title', e.target.value)} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Emoji Icon</label>
                                        <input value={section.icon} onChange={e => updateAftercareSection(sIdx, 'icon', e.target.value)} className={`${inputClass} text-center`} />
                                    </div>
                                </div>
                                <button onClick={() => removeAftercareSection(sIdx)} className="text-red-400 hover:text-red-600 self-start p-2">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-2 mt-4 border-t pt-4">
                                <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Bullet Points</label>
                                {section.items.map((item: string, iIdx: number) => (
                                    <div key={iIdx} className="flex gap-2">
                                        <input value={item} onChange={e => updateAftercareItem(sIdx, iIdx, e.target.value)} className={inputClass} />
                                        <button onClick={() => removeAftercareItem(sIdx, iIdx)} className="text-red-300 hover:text-red-500 px-2">✕</button>
                                    </div>
                                ))}
                                <button onClick={() => addAftercareItem(sIdx)} className="text-[10px] font-bold text-admin-dark-primary flex items-center gap-1 mt-2 hover:underline">
                                    <PlusIcon className="w-3 h-3" /> Add Point
                                </button>
                            </div>
                        </div>
                    ))}
                  </div>
               </div>
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
             <div className={sectionClass}>
                <h3 className="text-sm sm:text-lg font-bold text-admin-dark-text border-b border-admin-dark-border pb-2 mb-4">Contact Details</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                   <div className="lg:col-span-2">
                      <label className={labelClass}>Address</label>
                      <input name="address" value={settings.address} onChange={handleChange} className={inputClass} />
                   </div>
                   <div>
                      <label className={labelClass}>Phone</label>
                      <input name="phone" value={settings.phone} onChange={handleChange} className={inputClass} />
                   </div>
                   <div>
                      <label className={labelClass}>Email</label>
                      <input name="email" value={settings.email} onChange={handleChange} className={inputClass} />
                   </div>
                </div>

                <h3 className="text-sm sm:text-lg font-bold text-admin-dark-text border-b border-admin-dark-border pb-2 mt-8 mb-4">Social Links</h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {settings.socialLinks && settings.socialLinks.length > 0 ? (
                            settings.socialLinks.map((link: any) => (
                                <div key={link.id} className="flex items-center gap-3 bg-white p-2 sm:p-3 rounded-lg border border-admin-dark-border">
                                    <img src={link.icon} alt="Icon" className="w-6 h-6 sm:w-8 sm:h-8 object-contain bg-gray-50 rounded-md p-1" />
                                    <span className="flex-1 text-xs sm:text-sm text-admin-dark-text truncate" title={link.url}>{link.url}</span>
                                    <button onClick={() => handleRemoveSocialLink(link.id)} className="text-red-500 hover:text-red-600 p-2 bg-gray-50 rounded-lg hover:bg-red-50 transition-colors">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs sm:text-sm text-admin-dark-text-secondary italic col-span-2">No social media links.</p>
                        )}
                    </div>

                    <div className="bg-white/50 p-3 sm:p-4 rounded-lg border border-admin-dark-border border-dashed">
                        <h4 className="text-xs sm:text-sm font-bold text-admin-dark-text mb-3">Add New Link</h4>
                        <div className="flex flex-col gap-3">
                            <input 
                                placeholder="URL" 
                                value={newSocialUrl} 
                                onChange={(e) => setNewSocialUrl(e.target.value)} 
                                className={inputClass}
                            />
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                <input 
                                    type="file" 
                                    onChange={(e) => e.target.files && setNewSocialIcon(e.target.files[0])} 
                                    className="w-full sm:flex-1 text-xs text-admin-dark-text-secondary"
                                />
                                <button 
                                    onClick={handleAddSocialLink} 
                                    disabled={!newSocialUrl || !newSocialIcon || isLoading}
                                    className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <h3 className="text-sm sm:text-lg font-bold text-admin-dark-text border-b border-admin-dark-border pb-2 mt-8 mb-4 uppercase tracking-widest">Process & Design UI</h3>
                <div className="space-y-8">
                    <div className="bg-white/50 p-4 sm:p-6 rounded-xl border border-admin-dark-border">
                        <h4 className="font-bold text-admin-dark-text mb-4 flex items-center gap-2">
                           <span className="bg-admin-dark-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px]">1</span>
                           Our Process Configuration
                        </h4>
                        <div className="space-y-4">
                            <div>
                                <label className={labelClass}>Section Title</label>
                                <input name="processTitle" value={settings.processTitle} onChange={handleChange} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Intro Text</label>
                                <textarea name="processIntro" rows={2} value={settings.processIntro} onChange={handleChange} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Numbered Steps</label>
                                <div className="space-y-2">
                                    {settings.processSteps.map((step: string, idx: number) => (
                                        <div key={idx} className="flex gap-2">
                                            <span className="flex-shrink-0 w-8 h-8 bg-gray-100 flex items-center justify-center rounded-lg text-xs font-bold">{idx + 1}</span>
                                            <input value={step} onChange={(e) => updateList('processSteps', idx, e.target.value)} className={inputClass} />
                                            <button onClick={() => removeListItem('processSteps', idx)} className="text-red-400 p-2 hover:bg-red-50 rounded-lg"><TrashIcon className="w-4 h-4"/></button>
                                        </div>
                                    ))}
                                    <button onClick={() => addListItem('processSteps')} className="text-xs font-bold text-admin-dark-primary flex items-center gap-1 mt-2 hover:underline">
                                        <PlusIcon className="w-3 h-3"/> Add Step
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/50 p-4 sm:p-6 rounded-xl border border-admin-dark-border">
                        <h4 className="font-bold text-admin-dark-text mb-4 flex items-center gap-2">
                           <span className="bg-admin-dark-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px]">2</span>
                           Design Ideas Configuration
                        </h4>
                        <div className="space-y-4">
                            <div>
                                <label className={labelClass}>Section Title</label>
                                <input name="designTitle" value={settings.designTitle} onChange={handleChange} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Intro Text</label>
                                <textarea name="designIntro" rows={2} value={settings.designIntro} onChange={handleChange} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Bullet Points</label>
                                <div className="space-y-2">
                                    {settings.designPoints.map((point: string, idx: number) => (
                                        <div key={idx} className="flex gap-2">
                                            <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-xs">🌿</span>
                                            <input value={point} onChange={(e) => updateList('designPoints', idx, e.target.value)} className={inputClass} />
                                            <button onClick={() => removeListItem('designPoints', idx)} className="text-red-400 p-2 hover:bg-red-50 rounded-lg"><TrashIcon className="w-4 h-4"/></button>
                                        </div>
                                    ))}
                                    <button onClick={() => addListItem('designPoints')} className="text-xs font-bold text-admin-dark-primary flex items-center gap-1 mt-2 hover:underline">
                                        <PlusIcon className="w-3 h-3"/> Add Point
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <h3 className="text-sm sm:text-lg font-bold text-admin-dark-text border-b border-admin-dark-border pb-2 mt-8 mb-4">APK & Banking</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                   <div className="md:col-span-2">
                      <label className={labelClass}>Android APK URL</label>
                      <input name="apkUrl" value={settings.apkUrl} onChange={handleChange} className={inputClass} placeholder="https://..." />
                   </div>
                   <div>
                      <label className={labelClass}>Bank Name</label>
                      <input name="bankName" value={settings.bankName} onChange={handleChange} className={inputClass} />
                   </div>
                   <div>
                      <label className={labelClass}>Account No</label>
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

          {/* Booking Options Tab */}
          {activeTab === 'booking-opts' && (
            <div className={sectionClass}>
              <h3 className="text-sm sm:text-lg font-bold text-admin-dark-text border-b border-admin-dark-border pb-2 mb-4">Booking Checklist Options</h3>
              <p className="text-xs text-admin-dark-text-secondary mb-6">These items appear as checkboxes in the "Request Appointment" form in the Client Portal.</p>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bookingOptions.map(opt => (
                    <div key={opt.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm relative group">
                      <button 
                        onClick={() => handleRemoveBookingOption(opt.id)}
                        className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                      <h4 className="font-bold text-gray-900 text-sm mb-1">{opt.label}</h4>
                      <p className="text-[10px] text-gray-500 italic">{opt.description}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-4 sm:p-6">
                  <h4 className="font-bold text-gray-900 mb-4 text-sm">Add New Option</h4>
                  <div className="space-y-4">
                    <div>
                      <label className={labelClass}>Short Name (Label)</label>
                      <input className={inputClass} value={newOptLabel} onChange={e => setNewOptLabel(e.target.value)} placeholder="e.g. Color Ink" />
                    </div>
                    <div>
                      <label className={labelClass}>Tiny Explanation</label>
                      <input className={inputClass} value={newOptDesc} onChange={e => setNewOptDesc(e.target.value)} placeholder="e.g. For multi-color designs." />
                    </div>
                    <button 
                      onClick={handleAddBookingOption}
                      className="bg-admin-dark-primary text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2"
                    >
                      <PlusIcon className="w-3 h-3" /> Add to Checklist
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Financials Tab */}
          {activeTab === 'financials' && (
             <div className={sectionClass}>
               <h3 className="text-sm sm:text-lg font-bold text-admin-dark-text border-b border-admin-dark-border pb-2 mb-4">Tax Config</h3>
               <div className="space-y-4">
                 <div className="flex items-center gap-3 bg-white p-3 sm:p-4 rounded-lg border border-admin-dark-border">
                    <input type="checkbox" id="taxEnabled" name="taxEnabled" checked={settings.taxEnabled} onChange={handleChange} className="w-5 h-5 accent-admin-dark-primary rounded" />
                    <label htmlFor="taxEnabled" className="text-admin-dark-text font-bold text-sm">Enable VAT</label>
                 </div>
                 {settings.taxEnabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                       <div>
                          <label className={labelClass}>VAT %</label>
                          <input type="number" name="vatPercentage" value={settings.vatPercentage} onChange={handleChange} className={inputClass} />
                       </div>
                       <div>
                          <label className={labelClass}>Reg Number</label>
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
               <h3 className="text-sm sm:text-lg font-bold text-admin-dark-text border-b border-admin-dark-border pb-2 mb-4">Loyalty Programs</h3>
               
               <div className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {loyaltyPrograms.map(prog => (
                         <div key={prog.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm relative">
                             <div className="flex justify-between items-start mb-2">
                                 <h4 className="font-bold text-admin-dark-text text-sm">{prog.name}</h4>
                                 <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${prog.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{prog.active ? 'Active' : 'Inactive'}</span>
                             </div>
                             <div className="flex items-center gap-3 mb-3">
                                 {prog.iconUrl ? <img src={prog.iconUrl} className="w-8 h-8 sm:w-10 sm:h-10 object-contain bg-gray-50 rounded-full border" /> : <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xs">?</div>}
                                 <div className="text-xs text-gray-500">
                                     <p>Need: {prog.stickersRequired}</p>
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

                 <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-6">
                     <h4 className="font-bold text-admin-dark-text mb-4 text-sm">Create New Card</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                             <label className={labelClass}>Name</label>
                             <input className={inputClass} placeholder="e.g. Manicure Card" value={newProgram.name} onChange={e => setNewProgram({...newProgram, name: e.target.value})} />
                         </div>
                         <div>
                             <label className={labelClass}>Stickers</label>
                             <input type="number" className={inputClass} value={newProgram.stickersRequired} onChange={e => setNewProgram({...newProgram, stickersRequired: parseInt(e.target.value)})} />
                         </div>
                         <div className="md:col-span-2">
                             <label className={labelClass}>Reward</label>
                             <input className={inputClass} placeholder="e.g. 50% Off" value={newProgram.rewardDescription} onChange={e => setNewProgram({...newProgram, rewardDescription: e.target.value})} />
                         </div>
                         <div>
                             <label className={labelClass}>Icon</label>
                             <input type="file" onChange={e => e.target.files && setNewProgramIcon(e.target.files[0])} className="text-xs w-full text-gray-500" />
                         </div>
                     </div>
                     <div className="mt-4 text-right">
                         <button onClick={handleAddProgram} disabled={isLoading} className="bg-admin-dark-primary text-white px-4 py-2 rounded-lg font-bold text-xs hover:opacity-90 flex items-center gap-2 ml-auto">
                             <PlusIcon className="w-3 h-3"/> Create
                         </button>
                     </div>
                 </div>
               </div>
             </div>
          )}

          {/* Yoco Payments Tab */}
          {activeTab === 'payments' && (
             <div className={sectionClass}>
                <div className="flex justify-between items-center border-b border-admin-dark-border pb-2 mb-4">
                    <h3 className="text-sm sm:text-lg font-bold text-admin-dark-text">Yoco Payment Gateway (Online)</h3>
                    <button onClick={() => props.startTour('yoco')} className="flex items-center gap-1 sm:gap-2 bg-blue-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors">
                        ℹ️ Setup Guide
                    </button>
                </div>
                
                <div className="bg-white p-4 sm:p-6 rounded-lg border border-admin-dark-border space-y-6">
                    <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <input type="checkbox" id="yocoEnabled" name="yocoEnabled" checked={settings.yocoEnabled} onChange={handleChange} className="w-5 h-5 accent-admin-dark-primary rounded" />
                        <label htmlFor="yocoEnabled" className="text-blue-900 font-bold text-sm">Enable Yoco Online Payments</label>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className={labelClass}>Yoco Public Key</label>
                            <input 
                                name="yocoPublicKey" 
                                value={settings.yocoPublicKey} 
                                onChange={handleChange} 
                                className={inputClass} 
                                placeholder="pk_test_..."
                            />
                            <p className="text-[10px] text-gray-400 mt-1">Used to load the payment popup securely on the client portal.</p>
                        </div>
                        <div>
                            <label className={labelClass}>Yoco Secret Key</label>
                            <input 
                                type="password" 
                                name="yocoSecretKey" 
                                value={settings.yocoSecretKey} 
                                onChange={handleChange} 
                                className={inputClass} 
                                placeholder="sk_test_..."
                            />
                            <p className="text-[10px] text-gray-400 mt-1">Required for server-side payment verification and charge finalization.</p>
                        </div>
                    </div>
                </div>
             </div>
          )}

          {/* Yoco Terminal Tab */}
          {activeTab === 'terminal' && (
             <div className={sectionClass}>
                <div className="flex justify-between items-center border-b border-admin-dark-border pb-2 mb-4">
                    <h3 className="text-sm sm:text-lg font-bold text-admin-dark-text">Yoco Machine Integration (Terminal)</h3>
                    <button onClick={() => props.startTour('yoco-terminal')} className="flex items-center gap-1 sm:gap-2 bg-blue-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors">
                        ℹ️ Hardware Guide
                    </button>
                </div>
                
                <div className="bg-white p-4 sm:p-6 rounded-lg border border-admin-dark-border space-y-6">
                    <div className="flex items-center gap-3 bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                        <input type="checkbox" id="terminalEnabled" name="terminalEnabled" checked={settings.terminalEnabled} onChange={handleChange} className="w-5 h-5 accent-admin-dark-primary rounded" />
                        <label htmlFor="terminalEnabled" className="text-yellow-900 font-bold text-sm">Enable Physical Terminal "Push to Pay"</label>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className={labelClass}>Terminal ID</label>
                            <input 
                                name="terminalId" 
                                value={settings.terminalId} 
                                onChange={handleChange} 
                                className={inputClass} 
                                placeholder="e.g. 12345678"
                            />
                            <p className="text-[10px] text-gray-400 mt-1">Found on your physical Yoco machine settings or the Yoco Portal.</p>
                        </div>
                        <div>
                            <label className={labelClass}>Terminal Secret API Key</label>
                            <input 
                                type="password" 
                                name="terminalSecretKey" 
                                value={settings.terminalSecretKey} 
                                onChange={handleChange} 
                                className={inputClass} 
                                placeholder="sk_live_..."
                            />
                            <p className="text-[10px] text-gray-400 mt-1">Found in Yoco Portal &rarr; Settings &rarr; API Keys.</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">How it works</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                        When you select "Card" in the Financials tab, a new "Send to Machine" button will appear. 
                        Clicking it will automatically wake up your Yoco machine and display the correct amount for the client to tap.
                    </p>
                </div>
             </div>
          )}

          {/* Integrations Tab */}
          {activeTab === 'integrations' && (
             <div className={sectionClass}>
               <div className="flex justify-between items-center border-b border-admin-dark-border pb-2 mb-4">
                   <h3 className="text-sm sm:text-lg font-bold text-admin-dark-text">EmailJS</h3>
                   <button onClick={() => setIsHelpOpen(true)} className="flex items-center gap-1 sm:gap-2 bg-blue-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors">
                       ℹ️ Guide
                   </button>
               </div>
               
               <div className="bg-white p-4 sm:p-6 rounded-lg border border-admin-dark-border mb-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                         <label className={labelClass}>Service ID</label>
                         <input name="emailServiceId" value={settings.emailServiceId} onChange={handleChange} className={inputClass} />
                      </div>
                      <div>
                         <label className={labelClass}>Template ID</label>
                         <input name="emailTemplateId" value={settings.emailTemplateId} onChange={handleChange} className={inputClass} />
                      </div>
                      <div className="md:col-span-2">
                         <label className={labelClass}>Public Key</label>
                         <input type="password" name="emailPublicKey" value={settings.emailPublicKey} onChange={handleChange} className={inputClass} />
                      </div>
                   </div>
               </div>

               <h3 className="text-sm sm:text-lg font-bold text-admin-dark-text border-b border-admin-dark-border pb-2 mb-4">Actions</h3>
               <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                     <div className="flex items-center gap-3">
                        <input type="checkbox" id="isMaintenanceMode" name="isMaintenanceMode" checked={settings.isMaintenanceMode} onChange={handleChange} className="w-5 h-5 accent-yellow-500 rounded" />
                        <label htmlFor="isMaintenanceMode" className="text-yellow-800 font-bold text-sm">Maintenance Mode</label>
                     </div>
                     <p className="text-xs text-yellow-700 ml-0 sm:ml-2">Closes the public site with a "Curtain Down" animation.</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <h4 className="text-red-800 font-bold mb-2 text-sm">Danger Zone</h4>
                      <button onClick={props.onClearAllData} className="bg-red-600 text-white px-4 py-2 rounded text-xs font-bold hover:bg-red-700">Clear All Data</button>
                  </div>
               </div>
             </div>
          )}

          {/* System Guide Tab */}
          {activeTab === 'system-guide' && (
            <div className="space-y-12 animate-fade-in text-gray-700 leading-relaxed pb-32">
               <div className="bg-white rounded-3xl p-8 sm:p-12 border border-admin-dark-border shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                      <img src={settings.logoUrl} className="w-64 h-64 object-contain grayscale" />
                  </div>
                  
                  <h3 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6 tracking-tight flex items-center gap-4">
                     <span className="bg-admin-dark-primary text-white w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg">ERP</span>
                     Studio Management Cloud
                  </h3>
                  <p className="text-lg text-gray-500 mb-12 italic max-w-3xl">The definitive guide to your high-performance tattoo studio ecosystem. This platform handles the entire business lifecycle from first contact to lifetime loyalty.</p>

                  <div className="space-y-16">
                     
                     {/* 1. BOOKING ENGINE */}
                     <section className="group">
                        <div className="flex items-center gap-4 mb-6">
                           <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">01</div>
                           <h4 className="text-2xl font-black text-gray-800 uppercase tracking-wide">The Booking Engine</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pl-4 border-l-2 border-gray-100">
                           <div>
                              <h5 className="font-bold text-gray-900 mb-2">Public Client Capture</h5>
                              <p className="text-sm text-gray-600 mb-4">Clients engage with a cinematic, 3D-styled contact form. The system captures critical data points: Name, Method of Contact (WhatsApp or Email), Preferred Date, and Project Details.</p>
                              <h5 className="font-bold text-gray-900 mb-2">Reference Infrastructure</h5>
                              <p className="text-sm text-gray-600">The portal allows for up to 5 reference images per request. These are uploaded to a secure Supabase storage bucket (`booking-references`) and linked directly to the database record for high-fidelity viewing by the artist.</p>
                           </div>
                           <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                              <h6 className="font-black text-[10px] uppercase tracking-widest text-blue-500 mb-3 underline">Pro Feature: Real-time Sync</h6>
                              <p className="text-xs text-gray-500 leading-loose">Leveraging <strong>Supabase Realtime</strong>, new submissions flash onto your dashboard instantly. No manual refreshing is required. The system pushes the new data payload from the cloud to your screen in under 200ms.</p>
                           </div>
                        </div>
                     </section>

                     {/* 2. OPERATIONAL WORKFLOW */}
                     <section className="group">
                        <div className="flex items-center gap-4 mb-6">
                           <div className="bg-purple-100 text-purple-600 w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold group-hover:bg-purple-600 group-hover:text-white transition-colors shadow-sm">02</div>
                           <h4 className="text-2xl font-black text-gray-800 uppercase tracking-wide">Operational Workflow</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pl-4 border-l-2 border-gray-100">
                           <div>
                              <h5 className="font-bold text-gray-900 mb-2">The "Golden" Pipeline</h5>
                              <ul className="text-sm text-gray-600 space-y-3">
                                 <li><strong>Pending:</strong> Newly arrived leads. The "Waiting Room" of your business.</li>
                                 <li><strong>Quote Sent:</strong> Use the "Build Quote" engine to send a professional price estimate.</li>
                                 <li><strong>Confirmed:</strong> Triggered once a client accepts or pays. This locks the date in the Master Calendar.</li>
                                 <li><strong>Completed:</strong> The final stage. This triggers stock deduction and logs the revenue in Financials.</li>
                              </ul>
                           </div>
                           <div>
                              <h5 className="font-bold text-gray-900 mb-2">Intelligent Reminders</h5>
                              <p className="text-sm text-gray-600">The Dashboard features a dedicated <strong>Upcoming Clock</strong>. It scans your future bookings and highlights confirmed appointments for the next 7 days, ensuring you never double-book or miss a session.</p>
                           </div>
                        </div>
                     </section>

                     {/* 3. QUOTE & INVOICE ENGINE */}
                     <section className="group">
                        <div className="flex items-center gap-4 mb-6">
                           <div className="bg-green-100 text-green-600 w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold group-hover:bg-green-600 group-hover:text-white transition-colors shadow-sm">03</div>
                           <h4 className="text-2xl font-black text-gray-800 uppercase tracking-wide">Quotes & Invoicing</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pl-4 border-l-2 border-gray-100">
                           <div>
                              <h5 className="font-bold text-gray-900 mb-2">Dynamic Document Builder</h5>
                              <p className="text-sm text-gray-600">Create estimates (Quotes) or demands for payment (Invoices) in seconds. The system auto-links to existing client profiles or creates new ones on the fly.</p>
                           </div>
                           <div>
                              <h5 className="font-bold text-gray-900 mb-2">The WhatsApp Bridge</h5>
                              <p className="text-sm text-gray-600">Every document generates a unique WhatsApp link. Clicking it opens the client's chat with a pre-written message containing the total, the document number, and their private login PIN for the portal.</p>
                           </div>
                           <div className="col-span-full bg-gray-50 p-6 rounded-2xl border border-gray-100">
                              <h6 className="font-black text-[10px] uppercase tracking-widest text-green-500 mb-2">Professional Output</h6>
                              <p className="text-xs text-gray-500">Documents are formatted with a specific CSS print sheet. They include your logo, banking details, VAT breakdown (if enabled), and terms. They look just as good on paper as they do on screen.</p>
                           </div>
                        </div>
                     </section>

                     {/* 4. PAYMENT SYSTEM */}
                     <section className="group">
                        <div className="flex items-center gap-4 mb-6">
                           <div className="bg-yellow-100 text-yellow-600 w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold group-hover:bg-yellow-600 group-hover:text-white transition-colors shadow-sm">04</div>
                           <h4 className="text-2xl font-black text-gray-800 uppercase tracking-wide">Yoco Payment Gateway</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pl-4 border-l-2 border-gray-100">
                           <div>
                              <h5 className="font-bold text-gray-900 mb-2">Secured Card Checkout</h5>
                              <p className="text-sm text-gray-600">Integrated with the <strong>Yoco SDK</strong>. When a client views their invoice in the Portal, they can click "Pay Now" to open a secure credit/debit card popup. No banking details are stored on your server.</p>
                           </div>
                           <div>
                              <h5 className="font-bold text-gray-900 mb-2">Auto-Reconciliation</h5>
                              <p className="text-sm text-gray-600">Once a payment is authorized, the system triggers a background hook. It marks the invoice as "Paid" and updates the linked Booking to "Confirmed" automatically, reducing manual admin work by 90%.</p>
                           </div>
                        </div>
                     </section>

                     {/* 5. CLIENT PORTAL */}
                     <section className="group">
                        <div className="flex items-center gap-4 mb-6">
                           <div className="bg-indigo-100 text-indigo-600 w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-sm">05</div>
                           <h4 className="text-2xl font-black text-gray-800 uppercase tracking-wide">The Client Portal (CRM)</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pl-4 border-l-2 border-gray-100">
                           <div>
                              <h5 className="font-bold text-gray-900 mb-2">Private Access</h5>
                              <p className="text-sm text-gray-600">Every client gets a dedicated dashboard. They log in using their email and a unique PIN you set in the "Clients" tab. This fosters a sense of exclusivity and professionalism.</p>
                           </div>
                           <div>
                              <h5 className="font-bold text-gray-900 mb-2">Self-Service Utility</h5>
                              <p className="text-sm text-gray-600">Clients can view their "Tattoo Journey" (history), accept quotes, pay deposits via card, and access <strong>Aftercare Instructions</strong> (a built-in guide on how to heal their new work properly).</p>
                           </div>
                        </div>
                     </section>

                     {/* 6. LOYALTY PROGRAM */}
                     <section className="group">
                        <div className="flex items-center gap-4 mb-6">
                           <div className="bg-pink-100 text-pink-600 w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold group-hover:bg-pink-600 group-hover:text-white transition-colors shadow-sm">06</div>
                           <h4 className="text-2xl font-black text-gray-800 uppercase tracking-wide">Loyalty Infrastructure</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pl-4 border-l-2 border-gray-100">
                           <div>
                              <h5 className="font-bold text-gray-900 mb-2">Digital Stamp Cards</h5>
                              <p className="text-sm text-gray-600">Replace lost paper cards. Admins manually add "Stickers" to a client's profile after a session. You can create multiple programs simultaneously (e.g., "Full Back Project" vs "Flash Friday Card").</p>
                           </div>
                           <div>
                              <h5 className="font-bold text-gray-900 mb-2">Reward Logic</h5>
                              <p className="text-sm text-gray-600">When a milestone is reached (e.g., 10 stickers), a <strong>Redeem Reward</strong> button appears in the client's portal. Clicking it resets their count and logs a redemption in your analytics.</p>
                           </div>
                        </div>
                     </section>

                     {/* 7. INVENTORY & SMART DOSING */}
                     <section className="group">
                        <div className="flex items-center gap-4 mb-6">
                           <div className="bg-orange-100 text-orange-600 w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold group-hover:bg-orange-600 group-hover:text-white transition-colors shadow-sm">07</div>
                           <h4 className="text-2xl font-black text-gray-800 uppercase tracking-wide">Inventory Management</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pl-4 border-l-2 border-gray-100">
                           <div>
                              <h5 className="font-bold text-gray-900 mb-2">Smart Dosing Engine</h5>
                              <p className="text-sm text-gray-600">Stop guessing usage. The system knows that a standard tattoo uses approx. 0.5ml of ink and 1 needle set. Clicking <strong>"+1 Service"</strong> in the Log Modal auto-calculates and deducts the correct amount from your stock.</p>
                           </div>
                           <div>
                              <h5 className="font-bold text-gray-900 mb-2">Min-Level Alerts</h5>
                              <p className="text-sm text-gray-600">Set a minimum stock level for every item. When your supply falls below this threshold, the inventory card turns <span className="text-red-500 font-bold">RED</span> on your dashboard, signaling it's time to reorder.</p>
                           </div>
                        </div>
                     </section>

                     {/* 8. FINANCIAL INTELLIGENCE */}
                     <section className="group">
                        <div className="flex items-center gap-4 mb-6">
                           <div className="bg-red-100 text-red-600 w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold group-hover:bg-red-600 group-hover:text-white transition-colors shadow-sm">08</div>
                           <h4 className="text-2xl font-black text-gray-800 uppercase tracking-wide">Financial Intelligence</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pl-4 border-l-2 border-gray-100">
                           <div className="col-span-full bg-gray-900 p-8 rounded-3xl text-white shadow-2xl">
                              <h5 className="font-bold text-admin-dark-primary mb-4 text-center text-lg uppercase tracking-widest">Master Profit Formula</h5>
                              <div className="text-2xl sm:text-3xl text-center font-mono py-6 border-y border-white/10 my-4 bg-white/5 rounded-2xl">
                                 (Revenue) - (Logged Expenses) - (VAT) = <span className="text-green-400">NET PROFIT</span>
                              </div>
                              <p className="text-xs text-gray-400 text-center">Revenue is only recognized when a booking is marked "Completed" and payment is logged.</p>
                           </div>
                           <div>
                              <h5 className="font-bold text-gray-900 mb-2">Yearly Analytics</h5>
                              <p className="text-sm text-gray-600">Visual bar charts help you track month-over-month performance. Use this to identify busy seasons and plan your marketing specials accordingly.</p>
                           </div>
                           <div>
                              <h5 className="font-bold text-gray-900 mb-2">Tax Compliance</h5>
                              <p className="text-sm text-gray-600">If enabled in Settings, the system calculates and separates VAT from your gross revenue, providing a clear figure of your tax liability for the selected month.</p>
                           </div>
                        </div>
                     </section>

                     {/* 9. CMS & LOGIC */}
                     <section className="group">
                        <div className="flex items-center gap-4 mb-6">
                           <div className="bg-gray-100 text-gray-600 w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold group-hover:bg-gray-600 group-hover:text-white transition-colors shadow-sm">09</div>
                           <h4 className="text-2xl font-black text-gray-800 uppercase tracking-wide">CMS & Global Logic</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pl-4 border-l-2 border-gray-100">
                           <div>
                              <h5 className="font-bold text-gray-900 mb-2">No-Code Website Edits</h5>
                              <p className="text-sm text-gray-600">Change your Hero title, the "Our Story" text, your WhatsApp number, and even your bank details without touching a line of code. Every field in this Settings tab maps directly to the live site.</p>
                           </div>
                           <div>
                              <h5 className="font-bold text-gray-900 mb-2">Maintenance Mode</h5>
                              <p className="text-sm text-gray-600">Need to update your prices or re-shoot your portfolio? Flip the Maintenance switch. A "Digital Curtain" drops over the public site, showing a beautiful "Closed for Renovations" page while you work on the admin panel.</p>
                           </div>
                        </div>
                     </section>

                     {/* 10. TECHNICAL INFRASTRUCTURE */}
                     <section className="group">
                        <div className="flex items-center gap-4 mb-6">
                           <div className="bg-cyan-100 text-cyan-600 w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold group-hover:bg-cyan-600 group-hover:text-white transition-colors shadow-sm">10</div>
                           <h4 className="text-2xl font-black text-gray-800 uppercase tracking-wide">Technical Infrastructure</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pl-4 border-l-2 border-gray-100">
                           <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                              <h6 className="font-black text-[10px] uppercase tracking-widest text-cyan-500 mb-3">PWA (Progressive Web App)</h6>
                              <p className="text-xs text-gray-500 leading-loose">Your site isn't just a website; it's a software application. It uses a <strong>Service Worker</strong> to cache assets, allowing it to load even without an internet connection. It can be installed on iOS and Android home screens as a native icon.</p>
                           </div>
                           <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                              <h6 className="font-black text-[10px] uppercase tracking-widest text-cyan-500 mb-3">Hybrid Backend Adapter</h6>
                              <p className="text-xs text-gray-500 leading-loose">The `dbAdapter.ts` module automatically detects your connection status. If Supabase keys are missing, it intelligently switches to <strong>Mock Mode</strong>, using LocalStorage to keep the admin functional for testing purposes.</p>
                           </div>
                        </div>
                     </section>

                  </div>
               </div>
               
               <div className="bg-admin-dark-primary text-white p-10 rounded-3xl text-center shadow-xl">
                  <h4 className="text-3xl font-black mb-4 tracking-tight">Need further help?</h4>
                  <p className="mb-8 text-white/80 max-w-xl mx-auto">Our support line is open for technical walkthroughs or to discuss custom feature development. Click below to chat with the creator.</p>
                  <a 
                    href={`https://wa.me/27695989427?text=${encodeURIComponent("Hi Jason, I need technical support for my Tattoo Studio ERP system.")}`} 
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block bg-white text-admin-dark-primary px-10 py-4 rounded-2xl font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-lg"
                  >
                    Contact Technical Support
                  </a>
               </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default SettingsManager;
