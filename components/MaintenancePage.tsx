
import React from 'react';

interface MaintenancePageProps {
  onNavigate: (view: 'home' | 'admin') => void;
  logoUrl: string;
}

const MaintenancePage: React.FC<MaintenancePageProps> = ({ onNavigate, logoUrl }) => {
  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden flex flex-col items-center justify-center bg-brand-green">
      {/* Background Curtain - Vibrant Pink Theme */}
      <div className="absolute inset-0 bg-[#ff1493] z-0 animate-curtain-down origin-top shadow-[0_0_100px_rgba(0,0,0,0.5)]"></div>
      
      {/* Content Layer */}
      <div className="relative z-10 flex flex-col items-center text-center p-8 opacity-0 animate-fade-in-delayed">
        <div className="w-48 h-48 md:w-64 md:h-64 mb-10 relative">
            <div className="absolute inset-0 bg-white/20 rounded-full animate-ping scale-150 opacity-20"></div>
            <img 
                src={logoUrl} 
                alt="Studio Logo" 
                className="w-full h-full object-contain relative z-10 drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)] animate-subtle-glow"
            />
        </div>
        
        <h1 className="font-script text-6xl md:text-8xl text-white mb-4 drop-shadow-lg tracking-wider">Closed</h1>
        <div className="h-1 w-24 bg-white/30 rounded-full mb-8"></div>
        <h2 className="text-sm md:text-lg font-bold uppercase tracking-[0.4em] text-white/90 mb-4 px-4 py-2 border-y border-white/20">
            Under Maintenance
        </h2>
        
        <p className="text-white/70 max-w-xs md:max-w-md leading-relaxed text-sm md:text-base italic">
            We are currently updating our sanctuary. <br/>
            Check back soon for the new collection.
        </p>
      </div>

      {/* Tiny Admin Button at bottom */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center z-20 opacity-0 animate-fade-in-delayed" style={{ animationDelay: '2s' }}>
          <button
              onClick={() => onNavigate('admin')}
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 hover:text-white/80 transition-all px-4 py-2 rounded-full border border-white/5 hover:border-white/20"
          >
              Admin Access
          </button>
      </div>
    </div>
  );
};

export default MaintenancePage;
