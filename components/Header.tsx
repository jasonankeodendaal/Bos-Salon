
import React, { useState, MouseEvent } from 'react';
import MenuIcon from './icons/MenuIcon';
import XIcon from './icons/XIcon';

interface HeaderProps {
  onNavigate: (view: 'home' | 'admin' | 'client-portal') => void;
  logoUrl: string;
  companyName: string;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, logoUrl, companyName }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLinkClick = (e: MouseEvent<HTMLAnchorElement>, view?: 'home' | 'admin' | 'client-portal') => {
    e.preventDefault();
    if (view) {
        onNavigate(view);
    } else {
        const href = e.currentTarget.getAttribute('href');
        if (href && href.startsWith('#')) {
            document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
        }
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-50 text-brand-light">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24 md:h-32">
          <a href="#" onClick={(e) => handleLinkClick(e, 'home')} className="flex items-center gap-3 group" aria-label="Bos Salon Home">
            <img 
                src={logoUrl} 
                alt="Bos Salon Logo" 
                className="h-20 w-auto md:h-28 object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-sm" 
            />
          </a>
          
          <div className="flex items-center gap-4">
             <a href="#" onClick={(e) => handleLinkClick(e, 'client-portal')} className="hidden md:block text-xs font-semibold text-brand-green/80 hover:text-brand-green transition-colors">
                Client Portal
            </a>
            <a href="#contact-form" onClick={handleLinkClick} className="hidden sm:block border border-brand-light/50 px-6 py-2 rounded-full text-sm font-semibold hover:bg-brand-light hover:text-brand-dark transition-colors">
              Book Appointment
            </a>
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden z-50 text-brand-light"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <XIcon className="w-8 h-8" /> : <MenuIcon className="w-8 h-8" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-brand-dark z-40 flex flex-col items-center justify-center text-center"
          role="dialog"
          aria-modal="true"
        >
          <div className="space-y-6">
             <a href="#contact-form" onClick={handleLinkClick} className="block border border-brand-light/50 px-8 py-3 rounded-full text-lg font-semibold hover:bg-brand-light hover:text-brand-dark transition-colors">
                Book Appointment
            </a>
             <a href="#" onClick={(e) => handleLinkClick(e, 'client-portal')} className="block text-brand-green font-bold text-lg hover:text-brand-light transition-colors mt-6">
                Client Portal Login
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
