import React, { useState } from 'react';
import CreatorModal from '../../components/CreatorModal';

const PhotographyFooter: React.FC<{ settings: any, onNavigateAdmin?: () => void }> = ({ settings, onNavigateAdmin }) => {
  const [isCreatorModalOpen, setIsCreatorModalOpen] = useState(false);

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return '';
    let cleaned = phone.replace(/\s+/g, '');
    if (cleaned.startsWith('+27')) {
      cleaned = '0' + cleaned.slice(3);
    }
    
    // Check if it's a 10-digit South African local number now
    if (cleaned.length === 10 && /^\d+$/.test(cleaned)) {
      return `(${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)})`;
    }
    return phone;
  };

  return (
    <>
      <footer className="w-full border-t border-white/5 bg-[#0d0d0d] relative mt-12 z-10 px-4 py-8 md:py-12">
      <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 text-stone-400 text-xs">
          
        {/* Brand Column */}
        <div className="md:col-span-4 flex flex-col items-start space-y-4">
            {settings?.logoUrl ? (
                 <img src={settings.logoUrl} alt="Footer Logo" className="h-8 opacity-70 hover:opacity-100 transition filter grayscale" />
            ) : (
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-stone-300">{settings?.companyName || 'Photography'}</h2>
            )}
            <p className="font-light max-w-[200px] leading-relaxed">
                Capturing authentic moments with premium lighting and modern artistry.
            </p>
        </div>

        {/* Connect & Contact */}
        <div className="md:col-span-3 space-y-2">
             <h4 className="font-bold text-stone-300 mb-3 uppercase tracking-widest text-[10px]">Reach Out</h4>
             {settings.email && <div className="hover:text-stone-200 transition cursor-pointer">{settings.email}</div>}
             {settings.phone && <div className="hover:text-stone-200 transition cursor-pointer">{formatPhoneNumber(settings.phone)}</div>}
             {settings.whatsAppNumber && (
                 <a href={`https://wa.me/${settings.whatsAppNumber.replace(/[^0-9]/g, '')}?text=Hi, I would like to enquire about photography services.`} target="_blank" rel="noopener noreferrer" className="text-stone-300 hover:text-white block mt-2">{formatPhoneNumber(settings.whatsAppNumber)}</a>
             )}
        </div>
        
        {/* Locations / Times */}
        <div className="md:col-span-3 space-y-2">
             <h4 className="font-bold text-stone-300 mb-3 uppercase tracking-widest text-[10px]">Studio & Times</h4>
             {settings.openingTimes && (
                <p className="whitespace-pre-line leading-relaxed">{settings.openingTimes}</p>
             )}
             {settings.address && (
                <p className="whitespace-pre-line mt-2 leading-relaxed">{settings.address}</p>
             )}
        </div>

        {/* Social Links */}
        <div className="md:col-span-2 flex flex-col items-start md:items-end w-full">
            <h4 className="font-bold text-stone-300 mb-3 uppercase tracking-widest text-[10px]">Follow</h4>
            {settings.socialLinks && settings.socialLinks.length > 0 ? (
                <div className="flex gap-4">
                    {settings.socialLinks.map((link: any) => (
                        <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 hover:-translate-y-1 transform transition-all p-1.5 bg-white/5 rounded-md border border-white/5">
                            <img src={link.icon} alt="Social link" className="w-4 h-4 object-contain filter grayscale invert" />
                        </a>
                    ))}
                </div>
            ) : (
                <span className="opacity-50">No socials connected.</span>
            )}
        </div>
        
      </div>
      
      <div className="max-w-[1000px] mx-auto mt-12 pt-6 border-t border-white/5 flex flex-col items-center gap-4 text-[10px] uppercase tracking-widest text-stone-600">
          <div className="flex flex-col md:flex-row items-center justify-between w-full">
              <p>&copy; {new Date().getFullYear()} {settings.companyName || 'Photography'}. All rights reserved.</p>
              <p className="mt-2 md:mt-0">Powered by Bos Salon Engine</p>
          </div>
          
          {/* Credits Row */}
          <div className="flex flex-col items-center gap-4 mt-4 w-full">
            <div className="flex items-center justify-center gap-2">
                <span className="text-stone-500 font-medium normal-case tracking-normal">Website designed and developed by</span>
                <button
                    onClick={() => setIsCreatorModalOpen(true)}
                    className="transition-transform hover:scale-110 focus:outline-none"
                    aria-label="View Creator"
                >
                    <img 
                        src="https://i.ibb.co/BHJM0n0v/image-removebg-preview.png" 
                        alt="Creator Logo" 
                        className="h-10 w-auto object-contain transition" 
                    />
                </button>
            </div>
            {onNavigateAdmin && (
                <button 
                    onClick={onNavigateAdmin} 
                    className="font-bold bg-white/5 text-stone-400 px-4 py-1.5 rounded-full hover:bg-white hover:text-black transition-colors shadow-sm border border-transparent"
                >
                    Admin Access
                </button>
            )}
          </div>
      </div>
    </footer>
    <CreatorModal
      isOpen={isCreatorModalOpen}
      onClose={() => setIsCreatorModalOpen(false)}
    />
    </>
  );
};

export default PhotographyFooter;
