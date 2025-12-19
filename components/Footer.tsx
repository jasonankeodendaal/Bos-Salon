
import React, { useState } from 'react';
import { SocialLink } from '../App';
import CreatorModal from './CreatorModal'; // Import the new modal component
import PowderSplashBackground from './PowderSplashBackground';
import AndroidIcon from './icons/AndroidIcon';

interface FooterProps {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  businessHours: string;
  socialLinks: SocialLink[];
  apkUrl: string;
  onNavigate: (view: 'home' | 'admin' | 'client-portal') => void;
}

const ClockIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const Footer: React.FC<FooterProps> = ({ companyName, address, phone, email, businessHours, socialLinks, apkUrl, onNavigate }) => {
  const [isCreatorModalOpen, setIsCreatorModalOpen] = useState(false);

  // Function to stylize business hours string
  const renderBusinessHours = () => {
    if (!businessHours) return <p className="text-sm text-gray-500 italic">Hours not set.</p>;
    
    const lines = businessHours.split('\n');
    return (
      <div className="space-y-2 mt-3">
        {lines.map((line, idx) => {
          const parts = line.split(':');
          if (parts.length >= 2) {
            const day = parts[0].trim();
            const hours = parts.slice(1).join(':').trim();
            return (
              <div key={idx} className="flex justify-between items-center text-xs group">
                <span className="font-bold text-gray-900 uppercase tracking-tighter group-hover:text-brand-green transition-colors">{day}</span>
                <div className="flex-grow mx-2 border-b border-dotted border-gray-300"></div>
                <span className="font-medium text-gray-600">{hours}</span>
              </div>
            );
          }
          return <p key={idx} className="text-xs text-gray-600 italic">{line}</p>;
        })}
      </div>
    );
  };

  return (
    <>
      <footer className="relative bg-brand-off-white text-brand-dark border-t border-gray-200 py-10 sm:py-16 overflow-hidden">
        <PowderSplashBackground />
        <div className="relative z-10 container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12 text-center md:text-left">
            
            {/* Branding Column */}
            <div>
              <h3 className="font-script text-4xl text-brand-green mb-4">{companyName.replace(' Tattoo Studio', '')}</h3>
              <p className="text-gray-900 font-medium text-sm">&copy; {new Date().getFullYear()} {companyName}. All Rights Reserved.</p>
              <div className="mt-6">
                <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-widest">Follow Us</h4>
                {socialLinks && Array.isArray(socialLinks) && socialLinks.length > 0 ? (
                    <div className="flex justify-center md:justify-start items-center gap-4">
                      {socialLinks.map(link => (
                        <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-brand-green transition-colors transform hover:scale-110">
                          <img src={link.icon} alt="Social media icon" className="w-6 h-6 object-contain" />
                        </a>
                      ))}
                    </div>
                ) : (
                    <p className="text-xs text-gray-500 italic">No social links.</p>
                )}
              </div>
            </div>

            {/* Contact Column */}
            <div>
              <h4 className="font-bold text-gray-900 mb-4 text-lg border-b border-gray-200 pb-2">Location & Contact</h4>
              <address className="not-italic text-sm text-gray-700 space-y-4 font-medium">
                <div className="flex items-start gap-3 justify-center md:justify-start">
                   <span className="text-brand-green mt-1">📍</span>
                   <p className="max-w-[200px]">{address}</p>
                </div>
                <div className="flex items-center gap-3 justify-center md:justify-start group">
                   <span className="text-brand-green">📞</span>
                   <a href={`tel:${phone.replace(/\s/g, '')}`} className="hover:text-brand-green transition-colors">{phone}</a>
                </div>
                <div className="flex items-center gap-3 justify-center md:justify-start group">
                   <span className="text-brand-green">✉️</span>
                   <a href={`mailto:${email}`} className="hover:text-brand-green transition-colors truncate">{email}</a>
                </div>
              </address>
            </div>

            {/* Business Hours Column */}
            <div className="bg-brand-dark/30 p-6 rounded-[2rem] border border-white/50 shadow-sm">
              <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
                <ClockIcon className="text-brand-green w-5 h-5" />
                <h4 className="font-bold text-gray-900 text-lg">Studio Hours</h4>
              </div>
              {renderBusinessHours()}
              <div className="mt-4 pt-3 border-t border-gray-200 text-center">
                 <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest italic">Booking Required</p>
              </div>
            </div>

            {/* App / Call to Action Column */}
            <div className="flex flex-col gap-6">
                <div>
                   <h4 className="font-bold text-gray-900 mb-4 text-lg">Sanctuary Access</h4>
                   <button 
                        onClick={() => onNavigate('client-portal')}
                        className="w-full bg-[#4e342e] text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95"
                    >
                        Client Portal Login
                    </button>
                </div>
                
                {apkUrl && (
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3 text-xs uppercase tracking-widest">Get The App</h4>
                    <a 
                      href={apkUrl} 
                      download 
                      className="inline-flex items-center gap-2 bg-gray-200/80 border border-gray-300/80 text-gray-900 px-5 py-2.5 rounded-full text-xs font-bold hover:bg-brand-green hover:text-white transition-all shadow-sm"
                    >
                      <AndroidIcon className="w-5 h-5" />
                      Download APK
                    </a>
                  </div>
                )}
            </div>
          </div>

          {/* Credits Row */}
          <div className="text-center text-[10px] text-gray-500 pt-8 mt-8 border-t border-gray-200 flex flex-col items-center gap-4">
            <div className="flex items-center justify-center gap-2">
                <span className="text-gray-400 font-medium">Website designed and developed by</span>
                <button
                    onClick={() => setIsCreatorModalOpen(true)}
                    className="transition-transform hover:scale-110 focus:outline-none"
                    aria-label="View Creator JSTYP.me"
                >
                    <img 
                        src="https://i.ibb.co/WRn7WFs/unnamed-1-1-removebg-preview.png" 
                        alt="JSTYP.me Logo" 
                        className="h-10 w-auto object-contain" 
                    />
                </button>
            </div>
            <div className="flex gap-4">
                <button 
                    onClick={() => onNavigate('admin')} 
                    className="font-bold bg-black/5 text-gray-400 px-4 py-1.5 rounded-full hover:bg-brand-green hover:text-white transition-colors shadow-sm border border-transparent"
                >
                    Admin Access
                </button>
            </div>
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

export default Footer;
