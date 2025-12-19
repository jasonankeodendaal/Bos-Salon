
import React from 'react';

// Using the provided images as icons for the Salon/Tattoo theme.

export const Bush: React.FC<{ className?: string }> = ({ className }) => (
  <img 
    src="https://i.ibb.co/NdLtXyLB/OIP-1-removebg-preview.png" 
    alt="Floral Element" 
    className={`${className} object-contain`} 
  />
);

export const BullSkull: React.FC<{ className?: string }> = ({ className }) => (
  <img 
    src="https://i.ibb.co/B7KCtsq/bull-skull-art-free-vector-removebg-preview.png" 
    alt="Bull Skull" 
    className={`${className} object-contain`} 
  />
);

export const BullSkullOutline: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className || "w-5 h-5"}
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M12 21V18" />
    <path d="M12 18C10.5 18 9 17.5 8 16C7 14.5 7 12 7 10C7 8 8 6 10 5L12 4L14 5C16 6 17 8 17 10C17 12 17 14.5 16 16C15 17.5 13.5 18 12 18Z" />
    <path d="M7 10H4C3 10 2 9 2 7.5C2 6 3 4 5 3C7 2 8 4 8 6" />
    <path d="M17 10H20C21 10 22 9 22 7.5C22 6 21 4 19 3C17 2 16 4 16 6" />
    <circle cx="10" cy="11" r="1" fill="currentColor" />
    <circle cx="14" cy="11" r="1" fill="currentColor" />
  </svg>
);

export const DeerSkull: React.FC<{ className?: string }> = ({ className }) => (
  <img 
    src="https://i.ibb.co/27RkP4jn/deer-skull-decal-bone-white-270c0255-d6d3-4ee2-bc02-6906b9f0de72-removebg-preview.png" 
    alt="Deer Skull" 
    className={`${className} object-contain`} 
  />
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
