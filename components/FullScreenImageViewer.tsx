import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface FullScreenImageViewerProps {
  src: string;
  alt: string;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

const FullScreenImageViewer: React.FC<FullScreenImageViewerProps> = ({ src, alt, onClose, onNext, onPrev }) => {
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && onNext) {
      onNext();
    }
    if (isRightSwipe && onPrev) {
      onPrev();
    }
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {onPrev && (
          <button 
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 text-white bg-black/60 hover:bg-black/90 md:hover:scale-110 rounded-full w-12 h-12 flex items-center justify-center transition-all backdrop-blur-md border border-white/10"
          >
            <ChevronLeft size={32} strokeWidth={1.5} />
          </button>
      )}
      <img
        src={src}
        alt={alt}
        className="max-w-[85vw] max-h-[95vh] object-contain shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on image
      />
      {onNext && (
          <button 
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 text-white bg-black/60 hover:bg-black/90 md:hover:scale-110 rounded-full w-12 h-12 flex items-center justify-center transition-all backdrop-blur-md border border-white/10"
          >
            <ChevronRight size={32} strokeWidth={1.5} />
          </button>
      )}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 md:top-6 md:right-6 text-white hover:text-red-400 bg-black/60 hover:bg-black/90 rounded-full w-10 h-10 flex items-center justify-center transition-all backdrop-blur-md border border-white/10"
        aria-label="Close full screen image viewer"
      >
        <X size={24} strokeWidth={1.5} />
      </button>
    </div>
  );
};

export default FullScreenImageViewer;
