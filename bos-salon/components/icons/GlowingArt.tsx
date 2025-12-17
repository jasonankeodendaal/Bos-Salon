
import React from 'react';

// FIX: Add style to props to allow inline styling
const GlowingArt: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <svg
    viewBox="-10 -10 120 120"
    className={className}
    style={style}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M50 0 C77.6 0 100 22.4 100 50 C100 77.6 77.6 100 50 100 C22.4 100 0 77.6 0 50 C0 35 6 21.6 16.1 12.1 M50 0 Q70 20 50 40 T50 80 M50 100 Q30 80 50 60 T50 20"
      stroke="url(#gradient)"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      className="animate-stroke-draw"
      style={{
        strokeDasharray: 800,
        strokeDashoffset: 800,
      }}
    />
    <defs>
      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#e0e0e0', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#EAB308', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
  </svg>
);

export default GlowingArt;