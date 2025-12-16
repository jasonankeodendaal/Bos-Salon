
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
  socialLinks: SocialLink[];
  apkUrl: string;
  onNavigate: (view: 'home' | 'admin' | 'client-portal') => void;
}

const Footer: React.FC<FooterProps> = ({ companyName, address, phone, email, socialLinks, apkUrl, onNavigate }) => {
  const [isCreatorModalOpen, setIsCreatorModalOpen] = useState(false);

  return (
    <>
      <footer className="relative bg-brand-off-white text-brand-dark border-t border-gray-200 py-10 sm:py-12 overflow-hidden">
        <PowderSplashBackground />
        <div className="relative z-10 container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 text-center md:text-left">
            <div>
              {/* Updated Company Name for better visibility */}
              <h3 className="font-script text-4xl text-brand-green mb-4">{companyName.replace(' Tattoo Studio', '')}</h3>
              <p className="text-gray-900 font-medium text-sm">&copy; {new Date().getFullYear()} {companyName}. All Rights Reserved.</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-3 text-lg">Contact Us</h4>
              <address className="not-italic text-sm text-gray-700 space-y-2 font-medium">
                <p>{address}</p>
                <p><a href={`tel:${phone.replace(/\s/g, '')}`} className="hover:text-brand-green transition-colors">{phone}</a></p>
                <p><a href={`mailto:${email}`} className="hover:text-brand-green transition-colors">{email}</a></p>
              </address>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-3 text-lg">Follow Us</h4>
              {socialLinks && Array.isArray(socialLinks) && socialLinks.length > 0 ? (
                  <div className="flex justify-center md:justify-start items-center gap-4">
                    {socialLinks.map(link => (
                      <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-brand-green transition-colors transform hover:scale-110">
                        <img src={link.icon} alt="Social media icon" className="w-6 h-6 object-contain" />
                      </a>
                    ))}
                  </div>
              ) : (
                  <p className="text-sm text-gray-500">Social links not set.</p>
              )}
            </div>
            {apkUrl && (
              <div>
                <h4 className="font-bold text-gray-900 mb-3 text-lg">Get The App</h4>
                <a 
                  href={apkUrl} 
                  download 
                  className="inline-flex items-center gap-2 bg-gray-200/80 border border-gray-300/80 text-gray-900 px-4 py-2 rounded-full text-sm font-bold hover:bg-brand-green hover:text-white transition-colors"
                >
                  <AndroidIcon className="w-5 h-5" />
                  Download for Android
                </a>
              </div>
            )}
          </div>
           <div className="text-center text-xs text-gray-500 pt-8 mt-8 border-t border-gray-200 flex flex-col items-center gap-2">
            <div className="flex items-center justify-center gap-2">
                <span className="text-gray-400">Website created by</span>
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
            <button 
                onClick={() => onNavigate('admin')} 
                className="text-[10px] font-bold bg-black text-brand-green px-4 py-1.5 rounded-full hover:bg-brand-green hover:text-black transition-colors mt-2 shadow-sm border border-brand-green/20"
            >
                Admin Login
            </button>
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
