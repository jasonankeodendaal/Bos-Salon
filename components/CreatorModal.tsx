
import React, { useState, useEffect, useCallback } from 'react';

interface CreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreatorModal: React.FC<CreatorModalProps> = ({ isOpen, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300); // Animation duration
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleClose]);

  if (!isOpen && !isClosing) return null;

  const modalAnimation = isOpen && !isClosing ? 'opacity-100' : 'opacity-0';
  const contentAnimation = isOpen && !isClosing ? 'opacity-100 scale-100' : 'opacity-0 scale-95';

  const logoUrl = "https://i.ibb.co/TDC9Xn1N/JSTYP-me-Logo.png";
  const whatsAppNumber = "27695989427";
  const email = "jstypme@gmail.com";
  const whatsAppLink = `https://wa.me/${whatsAppNumber}?text=${encodeURIComponent("Hi! I'm interested in your web development services.")}`;

  // New Assets
  const bgImage = "https://i.ibb.co/dsh2c2hp/unnamed.jpg";
  const whatsappIconUrl = "https://i.ibb.co/Z1YHvjgT/image-removebg-preview-1.png";
  const emailIconUrl = "https://i.ibb.co/r2HkbjLj/image-removebg-preview-2.png";

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300 ease-out ${modalAnimation}`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="creator-title"
    >
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm"></div>

      <div 
        className={`relative z-10 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 ease-in-out ${contentAnimation} text-white border border-white/10`}
        onClick={(e) => e.stopPropagation()}
        style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        }}
      >
        {/* Dark Overlay for readability */}
        <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px]"></div>

        <button 
            onClick={handleClose} 
            className="absolute top-4 right-4 z-20 p-2 text-white/50 hover:text-white transition-colors rounded-full hover:bg-white/10" 
            aria-label="Close dialog"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>

        <div className="relative z-10 p-8 sm:p-10 flex flex-col items-center text-center">
            {/* Logo Container - Free View */}
            <div className="w-48 h-auto mb-6 relative group">
                 <img 
                    src={logoUrl} 
                    alt="JSTYP.me Logo" 
                    className="w-full h-full object-contain drop-shadow-2xl transform group-hover:scale-105 transition-transform duration-500" 
                 />
            </div>
            
            <h2 id="creator-title" className="text-3xl font-bold tracking-wider font-sans mb-1 text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 drop-shadow-sm">JSTYP.me</h2>
            <p className="text-gray-400 italic text-sm mb-10 font-light border-b border-white/10 pb-4 w-full">"Jason's solution to your problems, yes me!"</p>
            
            <div className="flex justify-center gap-8 w-full">
                <a 
                    href={whatsAppLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-white/5 hover:bg-green-600/20 border border-white/10 hover:border-green-500/50 p-4 rounded-2xl transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-green-500/20 hover:-translate-y-1"
                    title="WhatsApp"
                >
                    <img src={whatsappIconUrl} alt="WhatsApp" className="w-10 h-10 object-contain filter drop-shadow-[0_0_8px_rgba(37,211,102,0.5)] transform group-hover:scale-110 transition-transform" />
                </a>
                <a 
                    href={`mailto:${email}`}
                    className="group bg-white/5 hover:bg-blue-600/20 border border-white/10 hover:border-blue-500/50 p-4 rounded-2xl transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-blue-500/20 hover:-translate-y-1"
                    title="Email"
                >
                    <img src={emailIconUrl} alt="Email" className="w-10 h-10 object-contain filter drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] transform group-hover:scale-110 transition-transform" />
                </a>
            </div>
            
            <div className="mt-8 text-[10px] text-gray-600 uppercase tracking-[0.2em] font-bold">
                Web Development • Design
            </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorModal;
