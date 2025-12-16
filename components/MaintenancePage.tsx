
import React from 'react';

interface MaintenancePageProps {
  onNavigate: (view: 'home' | 'admin') => void;
  logoUrl: string;
}

const MaintenancePage: React.FC<MaintenancePageProps> = ({ onNavigate, logoUrl }) => {
  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden">
      {/* Background Curtain - The Wall */}
      <div className="absolute inset-0 bg-brand-light z-0 animate-curtain-down origin-top shadow-2xl"></div>
      
      {/* Content Layer - Fades in after curtain drops */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-brand-dark p-8 opacity-0 animate-fade-in-delayed">
        <div className="bg-brand-dark/90 backdrop-blur-md p-8 sm:p-12 rounded-3xl border-2 border-brand-gold/30 shadow-2xl max-w-md w-full text-center transform hover:scale-105 transition-transform duration-500">
            <div className="w-32 h-32 mx-auto mb-6 relative">
                <div className="absolute inset-0 bg-brand-green/20 rounded-full animate-ping"></div>
                <img 
                    src={logoUrl} 
                    alt="Bos Salon Logo" 
                    className="w-full h-full object-contain relative z-10 drop-shadow-lg"
                />
            </div>
            
            <h1 className="font-script text-5xl sm:text-6xl text-brand-green mb-2 drop-shadow-sm">Closed</h1>
            <h2 className="text-xl font-bold uppercase tracking-widest text-brand-light mb-6">Under Construction</h2>
            
            <p className="text-brand-light/70 mb-8 leading-relaxed font-medium">
                We are currently updating our salon experience to serve you better. 
                Please check back soon for our fresh new look!
            </p>
            
            <button
                onClick={() => onNavigate('admin')}
                className="inline-block border-2 border-brand-green/50 text-brand-green px-8 py-3 rounded-full text-sm font-bold uppercase tracking-wider hover:bg-brand-green hover:text-white hover:border-brand-green transition-all shadow-lg"
            >
                Staff Access
            </button>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
