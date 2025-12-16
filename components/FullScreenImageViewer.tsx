import React from 'react';

interface FullScreenImageViewerProps {
  src: string;
  alt: string;
  onClose: () => void;
}

const FullScreenImageViewer: React.FC<FullScreenImageViewerProps> = ({ src, alt, onClose }) => {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <img
        src={src}
        alt={alt}
        className="max-w-[95vw] max-h-[95vh] object-contain shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on image
      />
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-3xl font-bold hover:opacity-80 transition-opacity [text-shadow:0_1px_4px_rgba(0,0,0,0.7)]"
        aria-label="Close full screen image viewer"
      >
        &times;
      </button>
    </div>
  );
};

export default FullScreenImageViewer;
