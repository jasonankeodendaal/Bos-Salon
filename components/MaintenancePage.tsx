import React from 'react';

interface MaintenancePageProps {
  onNavigate: (view: 'home' | 'admin') => void;
  logoUrl: string;
}

const MaintenancePage: React.FC<MaintenancePageProps> = ({ onNavigate, logoUrl }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
      <div className="text-center text-brand-light animate-fade-in-up">
        <div className="border border-white/20 bg-brand-dark/90 backdrop-blur-lg rounded-2xl p-8 sm:p-12 shadow-2xl shadow-gray-200">
          <img src={logoUrl} alt="Bos Salon Logo" className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 object-contain animate-subtle-glow"/>
          <h1 className="font-script text-4xl sm:text-6xl mb-4 text-brand-green">Under Construction</h1>
          <p className="text-gray-600 max-w-sm mx-auto mb-8 text-sm sm:text-base">
            Our salon website is currently being updated to bring you an even better experience. We'll be back online shortly!
          </p>
          <button
            onClick={() => onNavigate('admin')}
            className="border border-brand-light/50 px-8 py-3 rounded-full text-sm font-semibold hover:bg-brand-light hover:text-brand-dark transition-colors"
          >
            Admin Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;