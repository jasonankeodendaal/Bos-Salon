
import React, { MouseEvent } from 'react';

interface HeaderProps {
  onNavigate: (view: 'home' | 'admin' | 'magicalmemories') => void;
  logoUrl: string;
  companyName: string;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, logoUrl, companyName }) => {
  const handleLinkClick = (e: MouseEvent<HTMLAnchorElement>, view?: 'home' | 'admin' | 'magicalmemories') => {
    e.preventDefault();
    if (view) {
        onNavigate(view);
    } else {
        const href = e.currentTarget.getAttribute('href');
        if (href && href.startsWith('#')) {
            document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
        }
    }
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-50 text-brand-light pointer-events-none">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24 md:h-32">
          <a href="#" onClick={(e) => handleLinkClick(e, 'home')} className="flex items-center gap-3 group pointer-events-auto" aria-label="Bos Salon Home">
            <img 
                src={logoUrl} 
                alt="Bos Salon Logo" 
                className="h-20 w-auto md:h-28 object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-sm" 
            />
          </a>
          <div className="pointer-events-auto flex items-center gap-4">
              <button 
                onClick={() => onNavigate('magicalmemories')} 
                className="bg-white text-black hover:bg-gray-100 px-4 py-2 md:px-8 md:py-3.5 rounded-full md:rounded-3xl shadow-xl md:shadow-2xl uppercase font-black tracking-widest text-[10px] md:text-sm transition-all duration-300 hover:scale-105 hover:-translate-y-1 block border border-white/50"
                style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
              >
                  Magical Memories
              </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
