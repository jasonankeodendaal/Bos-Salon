import React, { useState } from 'react';

interface Props {
  settings: any;
  currentView: 'home' | 'library' | 'booking';
  onNavigate: (view: 'home' | 'library' | 'booking') => void;
  onNavigateBosSalon: () => void;
}

const PhotographyHeader: React.FC<Props> = ({ settings, currentView, onNavigate, onNavigateBosSalon }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navClass = (view: string) => `cursor-pointer transition-colors uppercase text-[10px] tracking-widest font-bold px-3 py-1.5 rounded-full ${currentView === view ? 'bg-stone-200 text-black shadow-md' : 'text-stone-400 hover:text-white hover:bg-white/10'}`;

  const switchView = (view: 'home' | 'library' | 'booking') => {
      onNavigate(view);
      setIsMobileMenuOpen(false);
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 md:px-12 text-white">
        <div className="flex items-center gap-4">
          <a onClick={() => switchView('home')} className="cursor-pointer">
            {settings?.logoUrl ? (
                <img src={settings.logoUrl} alt={settings.companyName || 'Photography'} className="h-16 md:h-20 w-auto object-contain filter drop-shadow opacity-90 hover:opacity-100 transition" />
            ) : (
                <h1 className="text-sm font-black uppercase tracking-[0.2em] text-stone-200">{settings?.companyName || 'Photography'}</h1>
            )}
          </a>
        </div>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2">
            <span onClick={() => switchView('home')} className={navClass('home')}>Home</span>
            <span onClick={() => switchView('library')} className={navClass('library')}>Library</span>
            <span onClick={() => switchView('booking')} className={navClass('booking')}>Pricing</span>
            <button onClick={onNavigateBosSalon} className="ml-4 px-4 py-1.5 bg-neutral-800 border border-white/10 hover:bg-neutral-700 hover:border-white/30 rounded-full text-[10px] uppercase tracking-widest transition-all shadow-inner text-stone-300">
                Bos Salon
            </button>
        </nav>

        {/* Mobile Toggle */}
        <button className="md:hidden p-2 text-stone-300 hover:text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16m-7 6h7" /></svg>
        </button>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
          <div className="md:hidden bg-[#161616]/95 backdrop-blur-3xl absolute top-20 left-0 right-0 p-6 flex flex-col gap-4 items-center shadow-[0_30px_60px_rgba(0,0,0,0.9)] border border-white/10 rounded-2xl mx-4">
              <span onClick={() => switchView('home')} className={navClass('home')}>Home</span>
              <span onClick={() => switchView('library')} className={navClass('library')}>Library</span>
              <span onClick={() => switchView('booking')} className={navClass('booking')}>Pricing</span>
              <div className="w-full h-px bg-white/5 my-2"></div>
              <button onClick={onNavigateBosSalon} className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-full text-xs uppercase tracking-widest transition-colors w-full border border-white/10 shadow-inner">
                  Back to Bos Salon
              </button>
          </div>
      )}
    </header>
  );
};

export default PhotographyHeader;
