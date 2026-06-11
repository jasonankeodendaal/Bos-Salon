import React, { useState, useEffect } from 'react';
import { dbLogout, dbSubscribeToDoc, dbSubscribeToCollection, dbAddItem, dbDeleteItem, dbSetDoc, dbUploadFile, dbUpdateItem } from '../../utils/dbAdapter';
import TrashIcon from '../../components/icons/TrashIcon';

interface Props {
  user: any;
  onNavigate: (view: 'home' | 'admin' | 'photography' | 'magicalmemories_admin') => void;
}

const PhotographyAdminDashboard: React.FC<Props> = ({ user, onNavigate }) => {
  const [activeTab, setActiveTab] = useState('settings');
  const [settings, setSettings] = useState<any>({ theme: {} });
  const [library, setLibrary] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [viewingInvoice, setViewingInvoice] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  // Library State
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [newLibItem, setNewLibItem] = useState({ title: '', story1: '', story2: '', story3: '' });
  const [libPrimaryFile, setLibPrimaryFile] = useState<File | null>(null);
  const [libGalleryFiles, setLibGalleryFiles] = useState<FileList | null>(null);
  const [existingGalleryImages, setExistingGalleryImages] = useState<string[]>([]);

  // Social Link State
  const [newSocialUrl, setNewSocialUrl] = useState('');
  const [newSocialIcon, setNewSocialIcon] = useState<File | null>(null);

  // Admin Booking State
  const [newBooking, setNewBooking] = useState({ clientName: '', clientEmail: '', clientPhone: '', date: '', time: '', service: 'Photoshoot' });
  
  // Package/Investment State
  const [newPackage, setNewPackage] = useState({ label: '', price: '', description: '' });
  const [packageFiles, setPackageFiles] = useState<FileList | null>(null);

  useEffect(() => {
     let unsubs: Function[] = [];
     
     const load = async () => {
         unsubs.push(dbSubscribeToDoc('settings', 'photography', (data) => {
             if (data) {
                 if (!data.theme) data.theme = {};
                 setSettings(data);
             }
         }));
         unsubs.push(dbSubscribeToCollection('photo_library', (data) => setLibrary(data)));
         unsubs.push(dbSubscribeToCollection('photo_bookings', (data) => setBookings(data)));
         unsubs.push(dbSubscribeToCollection('photo_invoices', (data) => setInvoices(data)));
         setIsLoading(false);
     };
     load();
     
     return () => unsubs.forEach(u => u());
  }, []);

  const handleSaveSettings = async () => {
      setMsg('Saving settings...');
      try {
          await dbSetDoc('settings', 'photography', settings);
          setMsg('Settings saved!');
          setTimeout(() => setMsg(''), 2000);
      } catch (err: any) {
          setMsg(err.message || 'Error saving settings');
      }
  };

  const handleAddSocialLink = async () => {
      if (!newSocialUrl || !newSocialIcon) return;
      setIsUploading(true);
      setMsg('Uploading social icon...');
      try {
          const iconUrl = await dbUploadFile(newSocialIcon, 'media', 'photography/socials/');
          const currentLinks = settings.socialLinks || [];
          const newSettings = { ...settings, socialLinks: [...currentLinks, { id: Date.now().toString(), url: newSocialUrl, icon: iconUrl }] };
          setSettings(newSettings);
          setNewSocialUrl('');
          setNewSocialIcon(null);
          setMsg('Social link added. Remember to save.');
      } catch (e: any) {
          setMsg(e.message || 'Error uploading social icon');
      } finally {
          setIsUploading(false);
      }
  };

  const handleAddPackage = async () => {
      if (!newPackage.label || !newPackage.price) return;
      setIsUploading(true);
      setMsg('Uploading package media...');
      try {
          let imageUrls: string[] = [];
          if (packageFiles && packageFiles.length > 0) {
              for (let i = 0; i < packageFiles.length; i++) {
                  const url = await dbUploadFile(packageFiles[i], 'media', `photography/packages/${Date.now()}_${i}`);
                  imageUrls.push(url);
              }
          }
          const currentOpts = settings.bookingOptions || [];
          const newOpt = {
              id: Date.now().toString(),
              label: newPackage.label,
              price: newPackage.price,
              description: newPackage.description,
              images: imageUrls
          };
          const newSettings = { ...settings, bookingOptions: [...currentOpts, newOpt] };
          setSettings(newSettings);
          setNewPackage({ label: '', price: '', description: '' });
          setPackageFiles(null);
          setMsg('Package added! Remember to Push Engine (Store Changes).');
      } catch (e) {
          setMsg('Error adding package.');
      } finally {
          setIsUploading(false);
      }
  };

  const handleDeletePackage = (id: string) => {
      const currentOpts = settings.bookingOptions || [];
      const newSettings = { ...settings, bookingOptions: currentOpts.filter((o:any) => o.id !== id) };
      setSettings(newSettings);
  };

  const handleDeleteSocialLink = (id: string) => {
      const currentLinks = settings.socialLinks || [];
      const newSettings = { ...settings, socialLinks: currentLinks.filter((l: any) => l.id !== id) };
      setSettings(newSettings);
  };

  const handleAddAdminBooking = async () => {
      if (!newBooking.clientName) return;
      try {
          await dbAddItem('photo_bookings', newBooking);
          setNewBooking({ clientName: '', clientEmail: '', clientPhone: '', date: '', time: '', service: 'Photoshoot' });
          setMsg('Booking scheduled!');
          setTimeout(() => setMsg(''), 2000);
      } catch (e: any) {
          setMsg('Error adding booking');
      }
  };

  const generateQuote = (booking: any) => {
      setViewingInvoice({
          type: 'quote',
          clientName: booking.clientName,
          email: booking.clientEmail,
          whatsapp: booking.clientPhone,
          date: new Date().toISOString().split('T')[0],
          items: [{ description: booking.service, quantity: 1, price: 0 }],
          status: 'draft',
          notes: booking.message || ''
      });
  };

  const generateInvoice = (booking: any) => {
      setViewingInvoice({
          type: 'invoice',
          clientName: booking.clientName,
          email: booking.clientEmail,
          whatsapp: booking.clientPhone,
          date: new Date().toISOString().split('T')[0],
          items: [{ description: booking.service, quantity: 1, price: 0 }],
          status: 'draft',
          notes: booking.message || ''
      });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setIsUploading(true);
      setMsg('Uploading file...');
      try {
          const url = await dbUploadFile(file, 'media', 'photography/');
          const newSettings = { ...settings };
          newSettings[fieldName] = url;
          setSettings(newSettings);
          setMsg('Upload successful! Remember to save.');
      } catch (err: any) {
          setMsg(err.message || 'Error uploading file');
      } finally {
          setIsUploading(false);
      }
  };

  const handleHeroBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      setIsUploading(true);
      setMsg('Uploading hero assets...');
      try {
          const newSettings = { ...settings };
          const urls = newSettings.heroBgUrls || [];
          
          const uploadPromises = Array.from(files).map(file => dbUploadFile(file, 'media', 'photography/hero/'));
          const newUrls = await Promise.all(uploadPromises);
          urls.push(...newUrls);
          
          newSettings.heroBgUrls = urls;
          setSettings(newSettings);
          setMsg('Upload successful! Remember to save.');
      } catch (err: any) {
          setMsg(err.message || 'Error uploading files');
      } finally {
          setIsUploading(false);
      }
  };


  const handleWipePhotographyData = async () => {
      if (!window.confirm('ARE YOU SURE? This will delete ALL Photography settings, portfolio items, and bookings. THIS IS IRREVERSIBLE!')) return;
      setIsUploading(true);
      setMsg('Wiping photography data...');
      try {
          // Reset photography settings
          await dbSetDoc('settings', 'photography', { theme: {} });
          
          // Delete all library items
          for (const item of library) {
              await dbDeleteItem('photo_library', item.id);
          }
          
          // Delete all bookings
          for (const b of bookings) {
              await dbDeleteItem('photo_bookings', b.id);
          }
          
          setSettings({ theme: {} });
          setLibrary([]);
          setBookings([]);
          
          setMsg('Wipe successful. All data cleared.');
          setTimeout(() => setMsg(''), 3000);
      } catch (err: any) {
          setMsg(err.message || 'Error wiping data');
      } finally {
          setIsUploading(false);
      }
  };

  const handleSaveLibraryItem = async () => {
      if (!newLibItem.title) return;
      setIsUploading(true);
      setMsg(selectedItemId ? 'Updating library item...' : 'Uploading library assets...');
      try {
          let primaryUrl = libPrimaryFile ? await dbUploadFile(libPrimaryFile, 'media', 'photography/library/') : (selectedItemId ? library.find(item => item.id === selectedItemId)?.primaryImage : '');

          let newGalleryUrls: string[] = [];
          if (libGalleryFiles && libGalleryFiles.length > 0) {
              const uploadPromises = Array.from(libGalleryFiles).map(file => dbUploadFile(file, 'media', 'photography/library/gallery/'));
              newGalleryUrls = await Promise.all(uploadPromises);
          }
          
          const galleryUrls = [...existingGalleryImages, ...newGalleryUrls];

          const itemData = {
              title: newLibItem.title,
              story1: newLibItem.story1,
              story2: newLibItem.story2,
              story3: newLibItem.story3,
              primaryImage: primaryUrl,
              galleryImages: galleryUrls
          };

          if (selectedItemId) {
              await dbUpdateItem('photo_library', { ...itemData, id: selectedItemId });
              setMsg('Library item updated successfully!');
          } else {
              await dbAddItem('photo_library', itemData);
              setMsg('Library item added successfully!');
          }

          setNewLibItem({ title: '', story1: '', story2: '', story3: '' });
          setLibPrimaryFile(null);
          setLibGalleryFiles(null);
          setExistingGalleryImages([]);
          setSelectedItemId(null);
          setTimeout(() => setMsg(''), 2000);
      } catch (e) {
          console.error(e);
          setMsg('Error processing library item.');
      } finally {
          setIsUploading(false);
      }
  }

  const startEditItem = (item: any) => {
      setNewLibItem({ title: item.title, story1: item.story1 || '', story2: item.story2 || '', story3: item.story3 || '' });
      setExistingGalleryImages(item.galleryImages || []);
      setSelectedItemId(item.id);
      window.scrollTo({ top: 300, behavior: 'smooth' });
  }

  const handleDeleteSub = async (col: any, id: string) => {
      if (confirm('Are you sure?')) {
          if (col === 'photo_invoices') setInvoices(prev => prev.filter(i => i.id !== id));
          if (col === 'photo_bookings') setBookings(prev => prev.filter(b => b.id !== id));
          if (col === 'photo_library') setLibrary(prev => prev.filter(l => l.id !== id));
          await dbDeleteItem(col, id);
      }
  }

  const tabClass = (tab: string) => `px-5 py-3 font-bold text-xs uppercase tracking-widest rounded-t-xl transition-all ${activeTab === tab ? 'bg-[#1a1a1a] text-white border-t border-x border-white/10 shadow-[0_-5px_10px_rgba(0,0,0,0.5)]' : 'bg-[#0f0f0f] text-stone-500 hover:bg-[#141414] hover:text-stone-300 border-t border-x border-transparent'}`;
  const inputClass = "w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-3 text-sm text-stone-200 focus:ring-1 focus:ring-stone-400 focus:border-stone-400 outline-none transition shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]";
  
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]"><p className="animate-pulse tracking-widest text-sm uppercase text-stone-500 font-bold">Loading Workspace...</p></div>;

  if (viewingInvoice) {
      return (
          <PhotographyInvoiceEditor 
              invoice={viewingInvoice === 'new' ? { type: 'quote', items: [], status: 'draft', date: new Date().toISOString().split('T')[0] } : viewingInvoice} 
              settings={settings}
              onClose={() => setViewingInvoice(null)} 
              onSaveInvoice={(savedInv) => {
                  setInvoices(prev => {
                      const exists = prev.find(i => i.id === savedInv.id);
                      if (exists) return prev.map(i => i.id === savedInv.id ? savedInv : i);
                      return [savedInv, ...prev];
                  });
              }}
          />
      );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-stone-200 font-sans selection:bg-stone-300 selection:text-black">
        {/* Superior Top Bar */}
        <header className="bg-[#121212]/90 backdrop-blur-xl sticky top-0 z-50 shadow-[0_10px_30px_rgba(0,0,0,0.8)] border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded border border-white/20 flex items-center justify-center shadow-inner">
                        <span className="font-bold text-sm text-stone-300">P</span>
                    </div>
                    <h1 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-stone-300">HQ Studio Workspace</h1>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => onNavigate('photography')} className="text-[10px] uppercase tracking-widest px-3 py-2 text-stone-500 hover:text-white transition">Public Engine</button>
                    <button onClick={() => onNavigate('admin')} className="text-[10px] bg-stone-200 text-black px-4 py-2 rounded-lg font-bold uppercase tracking-widest hover:bg-white transition shadow-lg">Bos Terminal</button>
                </div>
            </div>
        </header>

        <main className="max-w-6xl mx-auto p-4 md:p-8 mt-4">
            {/* Tabs */}
            <div className="flex overflow-x-auto border-b border-white/10 space-x-2">
                <button className={tabClass('settings')} onClick={() => setActiveTab('settings')}>Content</button>
                <button className={tabClass('investment')} onClick={() => setActiveTab('investment')}>Investment</button>
                <button className={tabClass('theme')} onClick={() => setActiveTab('theme')}>Design</button>
                <button className={tabClass('library')} onClick={() => setActiveTab('library')}>Library</button>
                <button className={tabClass('bookings')} onClick={() => setActiveTab('bookings')}>Bookings</button>
                <button className={tabClass('invoices')} onClick={() => setActiveTab('invoices')}>Quotes & Invoices</button>
            </div>

            {/* Status Notifications */}
            {msg && (
                <div className="mt-6 mb-2 bg-[#1a1a1a] text-stone-200 p-4 rounded-xl text-xs uppercase tracking-widest border border-white/10 text-center flex items-center justify-center space-x-3 shadow-xl relative z-20">
                    {isUploading && <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></span>}
                    <span>{msg}</span>
                </div>
            )}

            <div className="bg-[#1a1a1a] rounded-b-2xl rounded-tr-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 p-6 md:p-8 mt-0 relative z-10">

            {/* Settings Tab */}
            {activeTab === 'settings' && (
                <div className="space-y-12">
                    <div className="flex justify-between items-center border-b border-white/10 pb-6">
                        <h2 className="text-2xl font-serif font-bold text-white tracking-tight">Studio Fundamentals</h2>
                        <button onClick={handleSaveSettings} className="bg-white text-black px-6 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-stone-200 transition">Save Updates</button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Essential Config */}
                        <div className="lg:col-span-2 space-y-8">
                            <section className="bg-[#121212] p-6 rounded-2xl border border-white/5 shadow-sm">
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 mb-6 italic">Hero Section</h3>                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-600 mb-1.5 ml-1">Hero Title</label>
                                        <input className={inputClass} value={settings.hero?.title || ''} onChange={e => setSettings({...settings, hero: {...(settings.hero||{}), title: e.target.value}})} placeholder="Capturing The Moment" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-600 mb-1.5 ml-1">Hero Subtitle</label>
                                        <textarea className={inputClass} rows={2} value={settings.hero?.subtitle || ''} onChange={e => setSettings({...settings, hero: {...(settings.hero||{}), subtitle: e.target.value}})} placeholder="We specialize in professional photography..." />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-600 mb-2">Background Layers (Multi-Upload)</label>
                                        <input type="file" accept="image/*,video/mp4,video/webm" multiple onChange={handleHeroBgUpload} className="block w-full text-[10px] file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-[9px] file:uppercase file:font-bold file:bg-stone-800 file:text-stone-300 text-stone-500 custom-file-input cursor-pointer" />
                                        <p className="text-[9px] text-stone-600 mt-2">Upload multiple images or videos for the hero background.</p>
                                        
                                        {/* Hero Background Preview Grid */}
                                        {settings.heroBgUrls && settings.heroBgUrls.length > 0 && (
                                            <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mt-4">
                                                {settings.heroBgUrls.map((url: string, idx: number) => (
                                                    <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-white/10 bg-black group">
                                                        {url.match(/\.(mp4|webm|ogg)$/i) ? (
                                                            <video src={url} className="w-full h-full object-cover" muted />
                                                        ) : (
                                                            <img src={url} className="w-full h-full object-cover" alt="Hero background layer" />
                                                        )}
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                const newUrls = settings.heroBgUrls.filter((_: any, i: number) => i !== idx);
                                                                setSettings({ ...settings, heroBgUrls: newUrls });
                                                            }}
                                                            className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-red-900 rounded-full text-white opacity-0 group-hover:opacity-100 transition"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>
                            <section className="bg-[#121212] p-6 rounded-2xl border border-white/5 shadow-sm">
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 mb-6 italic">Core Identity & Contact</h3>                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-600 mb-1.5 ml-1">Company Name</label>
                                        <input className={inputClass} value={settings.companyName || ''} onChange={e => setSettings({...settings, companyName: e.target.value})} placeholder="Studio Name" />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-600 mb-1.5 ml-1">WhatsApp</label>
                                        <input className={inputClass} value={settings.whatsAppNumber || ''} onChange={e => setSettings({...settings, whatsAppNumber: e.target.value})} placeholder="+1234567890" />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-600 mb-1.5 ml-1">Support Email</label>
                                        <input className={inputClass} type="email" value={settings.email || ''} onChange={e => setSettings({...settings, email: e.target.value})} placeholder="Email" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-600 mb-1.5 ml-1">Address</label>
                                        <textarea className={inputClass} rows={2} value={settings.address || ''} onChange={e => setSettings({...settings, address: e.target.value})} placeholder="Address" />
                                    </div>
                                </div>
                            </section>

                            <section className="bg-[#121212] p-6 rounded-2xl border border-white/5 shadow-sm">
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 mb-6 italic">Brand Story</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-600 mb-1.5 ml-1">Editorial P1</label>
                                        <textarea className={inputClass} rows={2} value={settings.about?.story_p1 || ''} onChange={e => setSettings({...settings, about: {...(settings.about||{}), story_p1: e.target.value}})} placeholder="I believe that every picture tells a story..."></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-600 mb-1.5 ml-1">Editorial P2</label>
                                        <textarea className={inputClass} rows={2} value={settings.about?.story_p2 || ''} onChange={e => setSettings({...settings, about: {...(settings.about||{}), story_p2: e.target.value}})} placeholder="Whether it's a wedding..."></textarea>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Assets Panel */}
                        <div className="space-y-6">
                            <section className="bg-[#121212] p-6 rounded-2xl border border-white/5 shadow-sm">
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 mb-6 italic">Brand Assets</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-600 mb-2">Primary Logo</label>
                                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'logoUrl')} className="block w-full text-[10px] file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-[9px] file:uppercase file:font-bold file:bg-stone-800 file:text-stone-300 text-stone-500 custom-file-input cursor-pointer" />
                                        {settings.logoUrl && <img src={settings.logoUrl} alt="Logo" className="mt-2 h-10 w-auto rounded border border-white/10" />}
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-600 mb-2">About Us Reference Image</label>
                                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'aboutUsImageUrl')} className="block w-full text-[10px] file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-[9px] file:uppercase file:font-bold file:bg-stone-800 file:text-stone-300 text-stone-500 custom-file-input cursor-pointer" />
                                        {settings.aboutUsImageUrl && <img src={settings.aboutUsImageUrl} alt="About" className="mt-2 h-20 w-auto rounded border border-white/10" />}
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            )}

            {/* Theme Tab */}
            {activeTab === 'investment' && (
                <div className="space-y-8">
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <h2 className="text-xl font-bold tracking-tight text-white drop-shadow-md">Investment Packages</h2>
                        <button onClick={handleSaveSettings} className="bg-stone-200 text-black px-6 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-white transition shadow-xl">Push Engine</button>
                    </div>

                    <div className="bg-[#161616] p-6 rounded-2xl border border-white/5 shadow-inner">
                        <h3 className="font-bold text-[10px] uppercase tracking-widest mb-6 text-stone-400 border-b border-white/5 pb-2">Add New Package</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-1">Package Name</label><input className={inputClass} value={newPackage.label} onChange={e => setNewPackage({...newPackage, label: e.target.value})} placeholder="e.g. Platinum Wedding" /></div>
                            
                            <div><label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-1">Price</label><input className={inputClass} value={newPackage.price} onChange={e => setNewPackage({...newPackage, price: e.target.value})} placeholder="e.g. 15000" /></div>
                            
                            <div className="md:col-span-2"><label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-1">Description</label><textarea className={inputClass} rows={3} value={newPackage.description} onChange={e => setNewPackage({...newPackage, description: e.target.value})} placeholder="Describe what's included..."></textarea></div>
                            
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-1">Package Media (Multiple Uploads)</label>
                                <input type="file" multiple accept="image/*" onChange={(e) => setPackageFiles(e.target.files)} className="block w-full text-xs file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-stone-800 file:text-stone-300 hover:file:bg-stone-700 transition cursor-pointer bg-[#0a0a0a] border border-white/10 rounded-xl h-[46px] p-1 text-stone-500" />
                                <p className="text-[10px] text-stone-600 mt-2 tracking-wide">Select multiple images to showcase this package.</p>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button onClick={handleAddPackage} disabled={isUploading} className="bg-stone-200 text-black px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition hover:bg-white disabled:opacity-50 shadow-lg">
                                {isUploading ? 'Uploading...' : 'Add Package'}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold text-[10px] uppercase tracking-widest text-stone-400 border-b border-white/5 pb-2">Active Packages</h3>
                        {(!settings.bookingOptions || settings.bookingOptions.length === 0) ? (
                            <div className="p-8 border border-dashed border-white/10 rounded-2xl flex items-center justify-center bg-[#121212]">
                                <p className="text-xs text-stone-600 font-medium tracking-widest uppercase">No Packages Added</p>
                            </div>
                        ) : (
                            settings.bookingOptions.map((opt: any) => (
                                <div key={opt.id} className="bg-[#121212] border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-md">
                                    <div className="flex flex-col gap-2 w-full md:w-auto">
                                        <div className="flex justify-between md:justify-start items-center gap-4">
                                            <h4 className="font-bold text-base text-stone-200">{opt.label}</h4>
                                            <span className="text-[10px] uppercase tracking-widest font-bold bg-[#1a1a1a] border border-white/5 px-2 py-1 rounded-md text-stone-400">R {opt.price}</span>
                                        </div>
                                        <p className="text-xs text-stone-500 line-clamp-2 max-w-lg mt-1 font-light">{opt.description}</p>
                                        {opt.images && opt.images.length > 0 && (
                                            <div className="flex gap-2 mt-2 flex-wrap">
                                                {opt.images.slice(0, 4).map((imgUrl: string, idx: number) => (
                                                    <img key={idx} src={imgUrl} className="w-12 h-12 object-cover rounded-lg border border-white/10 opacity-70" alt={`pkg-img-${idx}`} />
                                                ))}
                                                {opt.images.length > 4 && (
                                                    <div className="w-12 h-12 rounded-lg border border-white/10 bg-[#1a1a1a] flex items-center justify-center text-[10px] text-stone-500 font-medium tracking-wide">
                                                        +{opt.images.length - 4}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <button onClick={() => handleDeletePackage(opt.id)} className="shrink-0 text-red-500 hover:text-red-400 border border-red-500/20 bg-red-950/20 hover:bg-red-950/40 p-2.5 rounded-xl transition" title="Delete Package">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Theme Tab */}
            {activeTab === 'theme' && (
                <div className="space-y-8">
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <h2 className="text-xl font-bold tracking-tight text-white drop-shadow-md">Aesthetic Parameters</h2>
                        <button onClick={handleSaveSettings} className="bg-stone-200 text-black px-6 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-white transition shadow-xl">Push Engine</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-[#161616] p-6 rounded-2xl border border-white/5 shadow-inner">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-6 border-b border-white/5 pb-2">Palette Roots</h3>
                            <div className="space-y-4">
                                <div className="flex items-center pb-4 border-b border-white/5">
                                    <label className="w-1/3 text-[10px] font-bold uppercase tracking-widest text-stone-500">Void (Bg)</label>
                                    <input type="color" value={settings.theme?.brandDark || '#1a1a1a'} onChange={e => setSettings({...settings, theme: {...settings.theme, brandDark: e.target.value}})} className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0 bg-transparent" />
                                    <span className="ml-4 font-mono text-xs text-stone-400">{settings.theme?.brandDark || '#1a1a1a'}</span>
                                </div>
                                <div className="flex items-center pb-4 border-b border-white/5">
                                    <label className="w-1/3 text-[10px] font-bold uppercase tracking-widest text-stone-500">Surface (Card)</label>
                                    <input type="color" value={settings.theme?.brandLight || '#f5f5f5'} onChange={e => setSettings({...settings, theme: {...settings.theme, brandLight: e.target.value}})} className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0 bg-transparent" />
                                    <span className="ml-4 font-mono text-xs text-stone-400">{settings.theme?.brandLight || '#f5f5f5'}</span>
                                </div>
                                <div className="flex items-center pb-4">
                                    <label className="w-1/3 text-[10px] font-bold uppercase tracking-widest text-stone-500">Primary Ink</label>
                                    <input type="color" value={settings.theme?.brandOffWhite || '#ffffff'} onChange={e => setSettings({...settings, theme: {...settings.theme, brandOffWhite: e.target.value}})} className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0 bg-transparent" />
                                    <span className="ml-4 font-mono text-xs text-stone-400">{settings.theme?.brandOffWhite || '#ffffff'}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-6 border-b border-white/5 pb-2">Typography & Scale</h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Display Family</label>
                                    <select className={`${inputClass} appearance-none`} value={settings.theme?.fontSans || 'Inter, sans-serif'} onChange={e => setSettings({...settings, theme: {...settings.theme, fontSans: e.target.value}})}>
                                        <option value="Inter, sans-serif">Inter (Modern Clean)</option>
                                        <option value="'Space Grotesk', sans-serif">Space Grotesk (Tech / Edgy)</option>
                                        <option value="'Playfair Display', serif">Playfair Display (Editorial / Elegant)</option>
                                        <option value="'JetBrains Mono', monospace">JetBrains Mono (Technical)</option>
                                        <option value="system-ui, sans-serif">System Default</option>
                                    </select>
                                </div>
                                
                                <div className="p-6 rounded-2xl border border-white/10 shadow-lg relative overflow-hidden" style={{ backgroundColor: settings.theme?.brandDark || '#1a1a1a', color: settings.theme?.brandOffWhite || '#ffffff', fontFamily: settings.theme?.fontSans || 'Inter, sans-serif' }}>
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-[30px] pointer-events-none"></div>
                                    <h4 className="text-2xl font-bold mb-2 tracking-tight drop-shadow-md">Frame Review</h4>
                                    <p className="text-sm opacity-60 font-light leading-relaxed">This visualizes layout text rendering with the specified CSS parameters applied within the public space.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Library Tab */}
            {activeTab === 'library' && (
                <div className="space-y-8">
                    <h2 className="text-xl font-bold tracking-tight text-white border-b border-white/5 pb-4">Library Vault</h2>
                    
                    <div className="bg-[#161616] border border-white/5 p-6 rounded-2xl shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                        <h3 className="font-bold text-[10px] uppercase tracking-widest mb-6 text-stone-400 border-b border-white/5 pb-2">Stage New Feature</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-1">Asset Frame Title</label><input className={inputClass} value={newLibItem.title} onChange={e => setNewLibItem({...newLibItem, title: e.target.value})} placeholder="e.g. Summer Edition" /></div>
                            
                            <div><label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-1">Cover (1 Asset)</label><input type="file" accept="image/*,video/mp4" onChange={(e) => setLibPrimaryFile(e.target.files?.[0] || null)} className="block w-full text-xs file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-stone-800 file:text-stone-300 hover:file:bg-stone-700 transition cursor-pointer bg-[#0a0a0a] border border-white/10 rounded-xl h-[46px] p-1 text-stone-500" /></div>
                            
                            <div className="md:col-span-2"><label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-1">Editorial Note P1</label><textarea className={inputClass} rows={2} value={newLibItem.story1} onChange={e => setNewLibItem({...newLibItem, story1: e.target.value})} placeholder="Paragraph 1..."></textarea></div>
                            <div className="md:col-span-2"><label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-1">Editorial Note P2</label><textarea className={inputClass} rows={2} value={newLibItem.story2} onChange={e => setNewLibItem({...newLibItem, story2: e.target.value})} placeholder="Paragraph 2..."></textarea></div>
                            <div className="md:col-span-2"><label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-1">Editorial Note P3</label><textarea className={inputClass} rows={2} value={newLibItem.story3} onChange={e => setNewLibItem({...newLibItem, story3: e.target.value})} placeholder="Paragraph 3..."></textarea></div>
                            
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-1">Gallery Payload (Multiple)</label>
                                <input type="file" multiple accept="image/*,video/mp4,application/pdf" onChange={(e) => setLibGalleryFiles(e.target.files)} className="block w-full text-xs file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-stone-800 file:text-stone-300 hover:file:bg-stone-700 transition cursor-pointer bg-[#0a0a0a] border border-white/10 rounded-xl h-[46px] p-1 text-stone-500" />
                                <p className="text-[10px] text-stone-600 mt-2 tracking-wide">Select multiple standard aspect ratio outputs.</p>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button onClick={handleSaveLibraryItem} disabled={isUploading} className="bg-stone-200 text-black px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition hover:bg-white disabled:opacity-50 shadow-lg">
                                {isUploading ? 'Transferring...' : (selectedItemId ? 'Update Vector' : 'Publish Vector')}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold text-[10px] uppercase tracking-widest text-stone-400 border-b border-white/5 pb-2">Active Staged Frames</h3>
                        {library.length === 0 ? (
                            <div className="p-8 border border-dashed border-white/10 rounded-2xl flex items-center justify-center bg-[#121212]">
                                <p className="text-xs text-stone-600 font-medium tracking-widest uppercase">Grid Empty</p>
                            </div>
                        ) : (
                            library.map(item => (
                                <div key={item.id} className="bg-[#121212] border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-white/20 hover:bg-[#161616] transition shadow-md">
                                    <div className="flex items-center gap-6">
                                        {item.primaryImage ? (
                                            <div className="w-16 h-16 shrink-0 bg-[#0a0a0a] rounded-xl overflow-hidden border border-white/10 shadow-inner">
                                                <img src={item.primaryImage} alt="" className="w-full h-full object-cover" />
                                            </div>
                                        ) : (
                                            <div className="w-16 h-16 shrink-0 bg-[#0a0a0a] rounded-xl flex items-center justify-center border border-white/10 text-[10px] text-stone-600 font-bold uppercase tracking-widest shadow-inner">Null</div>
                                        )}
                                        <div>
                                            <h4 className="font-bold text-base text-stone-200">{item.title}</h4>
                                            <p className="text-xs text-stone-500 line-clamp-2 max-w-lg mt-1 font-light">{item.story1}</p>
                                            <div className="flex gap-2 mt-2">
                                                <span className="text-[10px] uppercase tracking-widest font-bold bg-[#1a1a1a] border border-white/5 px-2 py-1 rounded-md text-stone-400">{item.galleryImages?.length || 0} Traces</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => startEditItem(item)} className="shrink-0 text-stone-300 hover:text-white border border-white/10 bg-white/5 hover:bg-white/10 p-2.5 rounded-xl transition" title="Edit Record">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                                        </button>
                                        <button onClick={() => handleDeleteSub('photo_library', item.id)} className="shrink-0 text-red-500 hover:text-red-400 border border-red-500/20 bg-red-950/20 hover:bg-red-950/40 p-2.5 rounded-xl transition" title="Purge Record">
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
                <div className="space-y-8">
                    <h2 className="text-xl font-bold tracking-tight text-white border-b border-white/5 pb-4">Schedule Command</h2>

                    <div className="bg-[#161616] border border-white/5 p-6 rounded-2xl shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] mb-8">
                        <h3 className="font-bold text-[10px] uppercase tracking-widest mb-6 text-stone-400 border-b border-white/5 pb-2">Manual Dispatch</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div><label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-1">Target Identity</label><input className={inputClass} value={newBooking.clientName} onChange={e => setNewBooking({...newBooking, clientName: e.target.value})} placeholder="Jane Doe" /></div>
                            <div><label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-1">Origin Node (Email)</label><input type="email" className={inputClass} value={newBooking.clientEmail} onChange={e => setNewBooking({...newBooking, clientEmail: e.target.value})} placeholder="jane@example.com" /></div>
                            <div><label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-1">Terminal (Phone)</label><input className={inputClass} value={newBooking.clientPhone} onChange={e => setNewBooking({...newBooking, clientPhone: e.target.value})} placeholder="123-456-7890" /></div>
                            <div><label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-1">Timestamp Grid</label><input type="date" className={`${inputClass} [color-scheme:dark]`} value={newBooking.date} onChange={e => setNewBooking({...newBooking, date: e.target.value})} /></div>
                            <div><label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-1">Phase Coord</label><input type="time" className={`${inputClass} [color-scheme:dark]`} value={newBooking.time} onChange={e => setNewBooking({...newBooking, time: e.target.value})} /></div>
                            <div><label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5 ml-1">Protocol Matrix</label><input className={inputClass} value={newBooking.service} onChange={e => setNewBooking({...newBooking, service: e.target.value})} placeholder="Package Type" /></div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button onClick={handleAddAdminBooking} className="bg-stone-200 text-black px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition hover:bg-white shadow-lg">
                                Authorize Block
                            </button>
                        </div>
                    </div>

                    <h3 className="font-bold text-[10px] uppercase tracking-widest text-stone-400 border-b border-white/5 pb-2 mb-6">Dispatch History Queue</h3>
                    {bookings.length === 0 ? <p className="text-stone-600 text-xs tracking-widest uppercase italic font-medium">Grid is clear.</p> : (
                        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#121212] shadow-xl">
                            <table className="w-full text-left text-xs whitespace-nowrap">
                                <thead className="bg-[#1a1a1a] text-stone-400 text-[10px] uppercase tracking-widest border-b border-white/10">
                                    <tr>
                                        <th className="p-4 font-bold">Identity</th>
                                        <th className="p-4 font-bold">Vector Line</th>
                                        <th className="p-4 font-bold">Block Time</th>
                                        <th className="p-4 font-bold">Request Object</th>
                                        <th className="p-4 font-bold text-right">Execute</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {bookings.map(b => (
                                        <tr key={b.id} className="hover:bg-[#161616] transition text-stone-300">
                                            <td className="p-4 font-medium">{b.clientName}</td>
                                            <td className="p-4 font-light text-stone-400 hover:text-white transition"><a href={`mailto:${b.clientEmail}`}>{b.clientEmail}</a> <br/><span className="text-[10px] font-mono">{b.clientPhone}</span></td>
                                            <td className="p-4"><span className="bg-stone-800/80 px-2 py-1 rounded text-[10px] font-mono border border-white/5 block w-max">{b.date || 'HOLD'}</span><span className="text-stone-500 text-[10px] mt-1 block">{b.time || 'N/A'}</span></td>
                                            <td className="p-4"><span className="bg-stone-200/5 backdrop-blur-sm text-stone-300 font-bold px-3 py-1 rounded-lg border border-white/10 tracking-wide text-[10px] uppercase">{b.service}</span></td>
                                            <td className="p-4 text-right space-x-2">
                                                <button onClick={() => generateQuote(b)} className="text-stone-300 hover:text-black hover:bg-stone-200 font-bold text-[10px] uppercase tracking-widest bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg transition shadow-sm">Eval</button>
                                                <button onClick={() => generateInvoice(b)} className="text-emerald-400 hover:text-black hover:bg-emerald-400 border border-emerald-400/30 font-bold text-[10px] uppercase tracking-widest bg-emerald-950/20 px-3 py-1.5 rounded-lg transition shadow-sm">Mint</button>
                                                <button onClick={() => handleDeleteSub('photo_bookings', b.id)} className="text-red-500 hover:bg-red-500 hover:text-white border border-red-500/30 font-bold text-[10px] uppercase tracking-widest ml-4 px-3 py-1.5 rounded-lg transition shadow-sm bg-[#0a0a0a]">X</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
            
            {/* Invoices Tab */}
            {activeTab === 'invoices' && (
                <div className="space-y-8">
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <h2 className="text-xl font-bold tracking-tight text-white drop-shadow-md">Quotes & Invoices</h2>
                        <button onClick={() => setViewingInvoice('new')} className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-500 transition shadow-lg">+ New Document</button>
                    </div>

                    {!invoices.length ? (
                        <div className="text-center py-20 border border-white/5 bg-[#161616] rounded-2xl shadow-inner">
                            <TrashIcon className="w-8 h-8 mx-auto text-stone-600 mb-4" />
                            <p className="text-sm font-medium text-stone-400">No active documents</p>
                        </div>
                    ) : (
                        <div className="bg-[#161616] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-[#0a0a0a] text-stone-500 border-b border-white/5 text-[10px] uppercase tracking-widest font-bold">
                                    <tr>
                                        <th className="p-4">Client</th>
                                        <th className="p-4">Type</th>
                                        <th className="p-4">Date</th>
                                        <th className="p-4">Total</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {invoices.map(inv => (
                                        <tr key={inv.id} className="hover:bg-white/5 transition text-stone-300">
                                            <td className="p-4 font-medium">{inv.clientName}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border ${inv.type === 'quote' ? 'bg-indigo-900/30 text-indigo-400 border-indigo-500/20' : 'bg-emerald-900/30 text-emerald-400 border-emerald-500/20'}`}>
                                                    {inv.type}
                                                </span>
                                            </td>
                                            <td className="p-4 font-mono text-[10px]">{inv.date}</td>
                                            <td className="p-4">R {inv.total}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border ${
                                                    inv.status === 'draft' ? 'bg-stone-800 text-stone-400 border-stone-700' :
                                                    inv.status === 'sent' ? 'bg-blue-900/30 text-blue-400 border-blue-500/20' :
                                                    inv.status === 'paid' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/20' :
                                                    'bg-red-900/30 text-red-400 border-red-500/20'
                                                }`}>
                                                    {inv.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right space-x-2">
                                                <button onClick={() => setViewingInvoice(inv)} className="text-stone-300 hover:text-white hover:bg-stone-800 font-bold text-[10px] uppercase tracking-widest px-3 py-1.5 rounded disabled:opacity-50 transition border border-white/10">View</button>
                                                <button onClick={() => handleDeleteSub('photo_invoices', inv.id)} className="text-red-500 hover:bg-red-500/20 p-2 rounded transition"><TrashIcon className="w-4 h-4" /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
            
            </div>
        </main>
    </div>
  );
}

export default PhotographyAdminDashboard;

const PhotographyInvoiceEditor: React.FC<{ invoice: any, onClose: () => void, settings: any, onSaveInvoice: (inv: any) => void }> = ({ invoice, onClose, settings, onSaveInvoice }) => {
    const [inv, setInv] = useState(invoice);
    const [msg, setMsg] = useState('');
    
    const handleSave = async () => {
        setMsg('Saving...');
        try {
            const subtotal = inv.items.reduce((acc: number, cur: any) => acc + (parseFloat(cur.price) || 0) * (parseInt(cur.quantity) || 1), 0);
            const discount = parseFloat(inv.discount) || 0;
            const total = subtotal - discount;
            const finalInv = { ...inv, subtotal, discount, total };
            
            let saved;
            if (finalInv.id) {
                await dbUpdateItem('photo_invoices', finalInv);
                saved = finalInv;
            } else {
                saved = await dbAddItem('photo_invoices', finalInv);
            }
            onSaveInvoice(saved);
            onClose();
        } catch (e: any) {
            setMsg(e.message || 'Error saving');
        }
    };
    
    return (
        <div className="min-h-screen bg-[#111111] text-stone-200 p-4 md:p-10 font-sans">
            <div className="max-w-4xl mx-auto space-y-6">
                
                <div className="flex justify-between items-center mb-6">
                    <button onClick={onClose} className="text-stone-400 hover:text-white uppercase text-[10px] tracking-widest font-bold">← Back to Dashboard</button>
                    <div className="flex gap-4 items-center">
                        {msg && <span className="text-emerald-400 text-xs">{msg}</span>}
                        <button onClick={handleSave} className="bg-stone-200 text-black px-6 py-2 rounded uppercase text-[10px] tracking-widest font-bold hover:bg-white transition">Save Document</button>
                    </div>
                </div>
                
                <div className="bg-white text-black p-8 md:p-14 rounded shadow-2xl relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-stone-100 rounded-bl-[100px] -z-10" />
                    
                    <div className="flex flex-col md:flex-row justify-between mb-12">
                        <div>
                            {settings.logoUrl ? <div className="bg-black inline-block p-4 rounded-xl mb-4 border border-stone-800"><img src={settings.logoUrl} alt="Logo" className="h-16 object-contain" /></div> : <h1 className="text-3xl font-black mb-4">{settings.companyName || 'Studio'}</h1>}
                            <p className="text-xs text-stone-500 whitespace-pre-line">{settings.address}</p>
                            <p className="text-xs text-stone-500">{settings.phone}</p>
                            <p className="text-xs text-stone-500">{settings.email}</p>
                        </div>
                        <div className="text-left md:text-right mt-6 md:mt-0 flex flex-col justify-end space-y-2">
                            <select value={inv.type} onChange={e => setInv({...inv, type: e.target.value})} className="text-4xl font-light text-stone-300 w-auto text-right bg-transparent border-b border-dashed border-stone-300 focus:border-stone-500 outline-none uppercase tracking-widest pb-2 appearance-none cursor-pointer">
                                <option value="quote">QUOTE</option>
                                <option value="invoice">INVOICE</option>
                            </select>
                            <div className="flex items-center justify-end gap-2 text-sm mt-4">
                                <span className="text-stone-400 uppercase tracking-widest text-[10px] font-bold">Status</span>
                                <select value={inv.status} onChange={e => setInv({...inv, status: e.target.value})} className="bg-stone-100 text-black p-1 border font-bold text-[10px] uppercase tracking-widest rounded outline-none border-stone-200">
                                    <option value="draft">Draft</option>
                                    <option value="sent">Sent</option>
                                    <option value="paid">Paid</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10 border-t border-b border-stone-200 py-8">
                        <div>
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-4">Bill To</h3>
                            <input className="block w-full text-xl font-bold mb-2 outline-none border-b border-dashed border-stone-200 focus:border-stone-400 bg-transparent placeholder-stone-300" placeholder="Client Name" value={inv.clientName || ''} onChange={e => setInv({...inv, clientName: e.target.value})} />
                            <input className="block w-full text-sm outline-none border-b border-dashed border-stone-200 focus:border-stone-400 bg-transparent placeholder-stone-300 mb-2" placeholder="Email Address" value={inv.email || ''} onChange={e => setInv({...inv, email: e.target.value})} />
                            <input className="block w-full text-sm outline-none border-b border-dashed border-stone-200 focus:border-stone-400 bg-transparent placeholder-stone-300" placeholder="WhatsApp / Phone" value={inv.whatsapp || ''} onChange={e => setInv({...inv, whatsapp: e.target.value})} />
                        </div>
                        <div className="md:text-right">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-4">Document Details</h3>
                            <div className="flex md:justify-end items-center gap-4 mb-2">
                                <span className="text-xs text-stone-500 font-bold uppercase tracking-widest w-16">Date</span>
                                <input type="date" className="text-sm outline-none border-b border-dashed border-stone-200 focus:border-stone-400 bg-transparent text-right font-mono" value={inv.date || ''} onChange={e => setInv({...inv, date: e.target.value})} />
                            </div>
                        </div>
                    </div>
                    
                    <table className="w-full mb-8 text-sm">
                        <thead>
                            <tr className="border-b-2 border-black text-left text-[10px] uppercase tracking-widest text-stone-500">
                                <th className="pb-2">Description</th>
                                <th className="pb-2 w-20 text-right">Qty</th>
                                <th className="pb-2 w-32 text-right">Unit Price</th>
                                <th className="pb-2 w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {inv.items.map((it: any, i: number) => (
                                <tr key={i} className="border-b border-stone-100 group">
                                    <td className="py-3"><input className="w-full outline-none bg-transparent placeholder-stone-300" placeholder="Item description" value={it.description || ''} onChange={e => { const items = [...inv.items]; items[i].description = e.target.value; setInv({...inv, items}); }} /></td>
                                    <td className="py-3 text-right"><input type="number" className="w-full text-right outline-none bg-transparent placeholder-stone-300 font-mono" placeholder="1" value={it.quantity || ''} onChange={e => { const items = [...inv.items]; items[i].quantity = e.target.value; setInv({...inv, items}); }} /></td>
                                    <td className="py-3 text-right"><input type="number" className="w-full text-right outline-none bg-transparent placeholder-stone-300 font-mono" placeholder="0.00" value={it.price || ''} onChange={e => { const items = [...inv.items]; items[i].price = e.target.value; setInv({...inv, items}); }} /></td>
                                    <td className="py-3 text-right">
                                        <button onClick={() => { const items = inv.items.filter((_: any, idx: number) => idx !== i); setInv({...inv, items}); }} className="text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><TrashIcon className="w-4 h-4 mx-auto" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    <button onClick={() => setInv({...inv, items: [...inv.items, { description: '', quantity: 1, price: '' }]})} className="text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-black transition">+ Add Item</button>
                    
                    <div className="mt-12 flex flex-col md:flex-row justify-between items-end gap-10">
                        <div className="w-full md:w-1/2">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Notes & Terms</h3>
                            <textarea className="w-full min-h-[100px] outline-none border border-stone-200 rounded p-4 text-xs bg-stone-50 focus:border-stone-400 transition resize-none text-stone-600" placeholder="Transfer details, valid until dates, thank you note..." value={inv.notes || ''} onChange={e => setInv({...inv, notes: e.target.value})} />
                        </div>
                        
                        <div className="w-full md:w-1/3 space-y-3 pb-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-stone-500 uppercase tracking-widest text-[10px] font-bold">Subtotal</span>
                                <span className="font-mono">R {inv.items.reduce((a: number, c: any) => a + (parseFloat(c.price) || 0) * (parseInt(c.quantity) || 1), 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-b border-stone-200 pb-3">
                                <span className="text-stone-500 uppercase tracking-widest text-[10px] font-bold">Discount</span>
                                <div className="flex items-center text-red-500">
                                    <span className="mr-1">- R </span>
                                    <input type="number" className="w-16 text-right outline-none bg-transparent font-mono border-b border-dashed border-red-200 focus:border-red-400" placeholder="0.00" value={inv.discount || ''} onChange={e => setInv({...inv, discount: e.target.value})} />
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="font-bold uppercase tracking-widest text-xs">Total</span>
                                <span className="text-2xl font-bold font-mono tracking-tighter">
                                    R {(inv.items.reduce((a: number, c: any) => a + (parseFloat(c.price) || 0) * (parseInt(c.quantity) || 1), 0) - (parseFloat(inv.discount) || 0)).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                </div>
            </div>
        </div>
    );
};
