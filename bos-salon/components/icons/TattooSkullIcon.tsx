import React from 'react';

const TattooSkullIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Skull Outline */}
      <path d="M30 90 C 10 70, 10 40, 30 20 S 70 20, 70 20 S 90 40, 90 70 C 90 90, 70 90, 70 90 L 60 85 L 50 90 L 40 85 Z" />
      {/* Eye Sockets */}
      <circle cx="38" cy="45" r="10" fill="currentColor" fillOpacity="0.2" />
      <circle cx="62" cy="45" r="10" fill="currentColor" fillOpacity="0.2" />
      {/* Nose */}
      <path d="M48 60 L 52 60 L 50 50 Z" />
      {/* Teeth */}
      <line x1="35" y1="75" x2="65" y2="75" />
      <line x1="40" y1="75" x2="40" y2="82" />
      <line x1="45" y1="75" x2="45" y2="82" />
      <line x1="50" y1="75" x2="50" y2="82" />
      <line x1="55" y1="75" x2="55" y2="82" />
      <line x1="60" y1="75" x2="60" y2="82" />
       {/* Cracks */}
      <path d="M 60 25 L 65 35" />
      <path d="M 35 22 L 30 30" />
    </g>
  </svg>
);

export default TattooSkullIcon;
