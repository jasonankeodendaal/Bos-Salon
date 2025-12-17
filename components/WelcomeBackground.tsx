
import React from 'react';
import { Bush, Leaf, BullHead, BuckHead } from './icons/TattooFlashIcons';

// Explicitly select the icons requested
const icons = [Leaf, Bush, BullHead, BuckHead];

// Configuration for "Perfectly Spaced and Scattered"
const COLS = 8; // Number of columns
const ROWS = 8; // Number of rows
const TOTAL_ITEMS = COLS * ROWS; // 64 items total (Added more)

// Generate items using a stratified sampling (grid + jitter) approach
const floatingItems = Array.from({ length: TOTAL_ITEMS }).map((_, i) => {
  const Icon = icons[Math.floor(Math.random() * icons.length)];
  
  // Calculate grid position
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  
  // Size of each grid cell in percentage
  const cellWidth = 100 / COLS;
  const cellHeight = 100 / ROWS;
  
  // Add random "jitter" to place item somewhere within its cell, 
  // but keep it away from edges to prevent heavy overlap
  const jitterX = (Math.random() * 0.6 + 0.2) * cellWidth; // 20% to 80% of cell width
  const jitterY = (Math.random() * 0.6 + 0.2) * cellHeight; // 20% to 80% of cell height
  
  const left = (col * cellWidth) + jitterX - (cellWidth / 2); // Adjust to center in cell roughly
  const top = (row * cellHeight) + jitterY - (cellHeight / 2);

  const size = 50 + Math.random() * 70; // Size between 50px and 120px
  const duration = 25 + Math.random() * 20; // Slower float for a relaxed vibe
  const delay = -Math.random() * 20; // Start at random times
  const rotation = Math.random() * 360;
  const zIndex = Math.floor(Math.random() * 10);

  return {
    id: i,
    Icon,
    style: {
      left: `${Math.max(0, Math.min(100, left))}%`, // Clamp to 0-100%
      top: `${Math.max(0, Math.min(100, top))}%`,   // Clamp to 0-100%
      width: `${size}px`,
      height: `${size}px`,
      animationDuration: `${duration}s`,
      animationDelay: `${delay}s`,
      transform: `rotate(${rotation}deg)`,
      zIndex: zIndex,
      // Removed blur for visibility, kept subtle shadow for depth
      filter: `drop-shadow(0 4px 6px rgba(0,0,0,0.1))`, 
    },
  };
});

const WelcomeBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden bg-brand-dark [perspective:1000px]" aria-hidden="true">
      {/* Light gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-off-white via-white to-brand-green/5"></div>
      
      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {floatingItems.map(({ id, Icon, style }) => (
          <div
            key={id}
            // Logic:
            // - Hide every 2nd item on mobile (id % 2 === 0 condition for flex, else hidden on mobile)
            // - Reduced opacity on mobile (opacity-10 vs sm:opacity-35)
            // - Scale down on mobile (scale-75 vs sm:scale-100)
            className={`absolute animate-subtle-float items-center justify-center text-brand-light grayscale-[20%] hover:grayscale-0 hover:opacity-60 transition-all duration-500 ease-in-out hover:scale-110
              ${id % 2 === 0 ? 'flex' : 'hidden sm:flex'}
              opacity-10 sm:opacity-35
              scale-75 sm:scale-100`}
            style={style}
          >
             <Icon className="w-full h-full" />
          </div>
        ))}
      </div>

      {/* Foreground gradient overlay - made lighter to reveal background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(252,251,249,0.2)_100%)] z-10 pointer-events-none"></div>
    </div>
  );
};

export default WelcomeBackground;
