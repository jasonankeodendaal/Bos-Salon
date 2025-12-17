
import React from 'react';

const TattooistXLogo: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`flex items-center gap-2 font-display text-2xl tracking-wider ${className}`}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-brand-red">
      <path d="M12 2L14.09 8.26L20 9.27L15.55 13.97L16.42 20.24L12 17.27L7.58 20.24L8.45 13.97L4 9.27L9.91 8.26L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17.6599 6.34009L6.33984 17.6601" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
    <span>TATTOOIST X</span>
  </div>
);

export default TattooistXLogo;
