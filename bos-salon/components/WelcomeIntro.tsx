
import React, { useEffect, useState } from 'react';
import WelcomeBackground from './WelcomeBackground';

interface WelcomeIntroProps {
  isVisible: boolean;
  onEnter: () => void;
  logoUrl: string;
}

const WelcomeIntro: React.FC<WelcomeIntroProps> = ({ isVisible, onEnter, logoUrl }) => {
  const [showContent, setShowContent] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const handleEnterClick = () => {
    setIsFadingOut(true);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-brand-dark transition-opacity duration-700 ease-in-out ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}
      onTransitionEnd={() => {
        if (isFadingOut) {
          onEnter();
        }
      }}
      aria-hidden={!isVisible}
    >
      <WelcomeBackground />

      <div 
        className={`relative w-72 h-72 sm:w-96 sm:h-96 transition-opacity duration-1000 ease-in-out ${showContent ? 'opacity-100' : 'opacity-0'}`}
      >
        <img src={logoUrl} alt="Bos Salon Logo" className="w-full h-full object-contain animate-subtle-glow"/>
      </div>

      <div
        className={`text-center transition-all duration-1000 ease-in-out mt-4 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
        style={{ transitionDelay: '1s' }}
      >
        <div className="[filter:drop-shadow(0_2px_4px_rgba(0,0,0,0.5))] mt-8">
          <h1 className="font-script text-brand-light text-5xl sm:text-7xl [text-shadow:0_2px_5px_rgba(0,0,0,0.1)]">
            Bos Salon
          </h1>
          <p className="mt-3 text-brand-light/70 text-base tracking-widest uppercase font-semibold">
            Nature • Nails • Beauty
          </p>
          <button
            onClick={handleEnterClick}
            className="mt-10 border-2 border-brand-green text-brand-green bg-white/80 backdrop-blur-sm px-10 py-3 rounded-full text-sm font-bold uppercase tracking-wider hover:bg-brand-green hover:text-white transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Enter Nail Salon
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeIntro;
