
import React, { useState, useEffect, useCallback } from 'react';
import { SpecialItem } from '../App';
import FullScreenImageViewer from './FullScreenImageViewer';
import { BullSkullOutline } from './icons/SalonIcons';

interface SpecialModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: SpecialItem;
  createWhatsAppLink: (item: SpecialItem) => string;
}

const SpecialModal: React.FC<SpecialModalProps> = ({ isOpen, onClose, item, createWhatsAppLink }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Combine imageUrl and images array, filtering duplicates
  const allImages = React.useMemo(() => {
      const imgs = item.images ? [...item.images] : [];
      if (item.imageUrl && !imgs.includes(item.imageUrl)) {
          imgs.unshift(item.imageUrl);
      }
      return imgs.length > 0 ? imgs : [item.imageUrl]; // Fallback
  }, [item]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setCurrentImageIndex(0);
    }, 300); // Animation duration
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (fullScreenImage) {
          setFullScreenImage(null);
        } else {
          handleClose();
        }
      }
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleClose, fullScreenImage, allImages.length]);

  const nextImage = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  if (!isOpen && !isClosing) return null;

  const modalAnimation = isOpen && !isClosing ? 'opacity-100' : 'opacity-0';
  const contentAnimation = isOpen && !isClosing ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4';

  const formatPrice = (item: SpecialItem) => {
    switch (item.priceType) {
      case 'fixed':
        return <><span className="text-4xl font-bold text-brand-green">R{item.priceValue || item.price}</span><span className="text-brand-light/60">/fixed</span></>;
      case 'hourly':
        return <><span className="text-4xl font-bold text-brand-green">R{item.priceValue || item.price}</span><span className="text-brand-light/60">/hr</span></>;
      case 'percentage':
        return <><span className="text-4xl font-bold text-brand-green">{item.priceValue || item.price}%</span><span className="text-brand-light/60"> OFF</span></>;
      default:
        return <span className="text-2xl font-bold text-brand-green">Inquire</span>;
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300 ease-out ${modalAnimation}`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="special-title"
    >
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm"></div>

      <button onClick={handleClose} className="absolute top-4 right-4 z-20 p-2 text-3xl text-white/80 hover:text-white transition-colors drop-shadow-md" aria-label="Close dialog">
        <span role="img" aria-label="close">✖️</span>
      </button>

      <div 
        className={`relative z-10 w-full max-w-md bg-brand-dark rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ease-out ${contentAnimation}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-h-[85vh] flex flex-col">
          <div className="relative flex-shrink-0 h-64 bg-black group">
            <button onClick={() => setFullScreenImage(allImages[currentImageIndex])} className="w-full h-full block cursor-zoom-in" aria-label="View image in full screen">
              <img 
                src={allImages[currentImageIndex]} 
                alt={`${item.title} - ${currentImageIndex + 1}`} 
                className="w-full h-full object-cover pointer-events-none transition-opacity duration-300"
              />
            </button>
            <div className="absolute inset-0 bg-gradient-to-t from-brand-light/80 to-transparent pointer-events-none"></div>
            
            {/* Navigation Arrows */}
            {allImages.length > 1 && (
                <>
                    <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        &#x25C0;
                    </button>
                    <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        &#x25B6;
                    </button>
                    {/* Dots */}
                    <div className="absolute bottom-20 left-0 w-full flex justify-center gap-1.5 pointer-events-none">
                        {allImages.map((_, idx) => (
                            <div key={idx} className={`w-1.5 h-1.5 rounded-full shadow-sm ${idx === currentImageIndex ? 'bg-white' : 'bg-white/40'}`}></div>
                        ))}
                    </div>
                </>
            )}

            <div className="absolute bottom-0 left-0 p-6 w-full pointer-events-none">
              <h2 id="special-title" className="font-script text-4xl text-white drop-shadow-md">{item.title}</h2>
            </div>
          </div>
          
          <div className="p-8 flex-grow overflow-y-auto text-brand-light">
            <p className="text-brand-light/80 mb-6 leading-relaxed">{item.description}</p>
            
            <div className="bg-white/50 border border-brand-light/10 rounded-xl p-6 my-4 text-center shadow-sm">
              {formatPrice(item)}
            </div>

            {item.details && item.details.length > 0 && (
              <>
                <h4 className="font-bold text-brand-light mt-6 mb-3 uppercase text-xs tracking-wider">What's Included:</h4>
                <ul className="space-y-3 text-left text-brand-light/80 my-4 text-sm">
                  {item.details.map((detail, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span role="img" aria-label="sparkle" className="flex-shrink-0 mt-0.5 text-brand-gold">✨</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {item.voucherCode && (
                <div className="my-6 border-2 border-dashed border-brand-gold/50 bg-brand-gold/10 rounded-xl p-4">
                    <p className="flex items-center justify-center gap-2 text-brand-light text-sm font-semibold">
                        <span role="img" aria-label="tag">🏷️</span>
                        <span>Voucher Code: <span className="font-bold text-brand-green">{item.voucherCode}</span></span>
                    </p>
                </div>
            )}
          </div>
          
          <div className="p-6 border-t border-brand-light/10 mt-auto flex-shrink-0 bg-brand-dark">
             <a 
                href={createWhatsAppLink(item)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-brand-green text-white px-4 py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-brand-light hover:text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
                aria-label={`Inquire about ${item.title} on WhatsApp`}
            >
                <BullSkullOutline className="w-5 h-5" />
                Inquire on WhatsApp
            </a>
          </div>
        </div>
      </div>
      {fullScreenImage && (
        <FullScreenImageViewer
          src={fullScreenImage}
          alt={item.title}
          onClose={() => setFullScreenImage(null)}
        />
      )}
    </div>
  );
};

export default SpecialModal;
