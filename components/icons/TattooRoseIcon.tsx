import React from 'react';

const TattooRoseIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Center Petals */}
      <path d="M50 50 C 45 45, 45 55, 50 50 Z" />
      <path d="M50 50 C 55 45, 55 55, 50 50 Z" />
      <path d="M50 50 C 45 55, 55 55, 50 50 Z" />
      {/* Outer Petals */}
      <path d="M50 35 C 30 35, 30 65, 50 65" />
      <path d="M50 35 C 70 35, 70 65, 50 65" />
      <path d="M40 30 C 40 10, 80 10, 60 30" />
      <path d="M35 50 C 15 40, 15 80, 35 70" />
      <path d="M65 50 C 85 40, 85 80, 65 70" />
      {/* Stem and Leaves */}
      <path d="M50 65 C 50 80, 45 90, 40 95" />
      <path d="M40 80 C 20 85, 30 70, 40 80 Z" fill="currentColor" fillOpacity="0.1" />
      <path d="M55 85 C 65 95, 75 80, 55 85 Z" fill="currentColor" fillOpacity="0.1" />
    </g>
  </svg>
);

export default TattooRoseIcon;
