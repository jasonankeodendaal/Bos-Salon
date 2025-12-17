
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

export const DeerSkull: React.FC<{ className?: string }> = ({ className }) => (
  <img 
    src="https://i.ibb.co/27RkP4jn/deer-skull-decal-bone-white-270c0255-d6d3-4ee2-bc02-6906b9f0de72-removebg-preview.png" 
    alt="Deer Skull" 
    className={`${className} object-contain`} 
  />
);

// Retaining NailPolish export for compatibility but re-routing it to BullSkull or marking deprecated if strictly sticking to request.
// However, since we are rebranding, let's just alias it or remove it.
// To prevent breaking changes in WelcomeBackground if it wasn't updated simultaneously (though I will update it), I will export it as BullSkull temporarily or just export a new set.
// The WelcomeBackground import will be updated.

export const Leaf: React.FC<{ className?: string }> = ({ className }) => (
  // Reusing the floral element but flipped for variety
  <img 
    src="https://i.ibb.co/NdLtXyLB/OIP-1-removebg-preview.png" 
    alt="Floral Element" 
    className={`${className} object-contain`} 
    style={{ transform: 'scaleX(-1)' }}
  />
);
