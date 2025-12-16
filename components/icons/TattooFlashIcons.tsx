import React from 'react';

// Using the provided images as icons. 
// Since they are images, we use <img> tags. ClassName is passed for sizing and opacity control.

export const Bush: React.FC<{ className?: string }> = ({ className }) => (
  <img 
    src="https://i.ibb.co/NdLtXyLB/OIP-1-removebg-preview.png" 
    alt="Floral Element" 
    className={`${className} object-contain`} 
  />
);

export const NailPolish: React.FC<{ className?: string }> = ({ className }) => (
  // Keeping the SVG for Nail Polish to maintain the 'Nail' aspect of the salon, 
  // as no specific image was provided for this, but it was requested previously.
  <svg viewBox="0 0 64 64" className={className} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
    <path d="M24,24 L40,24 L40,54 Q40,58 36,58 L28,58 Q24,58 24,54 Z" />
    <path d="M28,6 L36,6 L36,24 L28,24 Z" fill="currentColor" fillOpacity="0.2" />
    <path d="M26,35 Q32,40 38,35" strokeOpacity="0.5" />
  </svg>
);

export const Leaf: React.FC<{ className?: string }> = ({ className }) => (
  // Reusing the floral element but flipped for variety
  <img 
    src="https://i.ibb.co/NdLtXyLB/OIP-1-removebg-preview.png" 
    alt="Floral Element" 
    className={`${className} object-contain`} 
    style={{ transform: 'scaleX(-1)' }}
  />
);

export const BullHead: React.FC<{ className?: string }> = ({ className }) => (
  <img 
    src="https://i.ibb.co/B7KCtsq/bull-skull-art-free-vector-removebg-preview.png" 
    alt="Bull Skull" 
    className={`${className} object-contain`} 
  />
);

export const BuckHead: React.FC<{ className?: string }> = ({ className }) => (
  <img 
    src="https://i.ibb.co/27RkP4jn/deer-skull-decal-bone-white-270c0255-d6d3-4ee2-bc02-6906b9f0de72-removebg-preview.png" 
    alt="Deer Skull" 
    className={`${className} object-contain`} 
  />
);