
import React from 'react';

const StaticTattooBackground: React.FC = () => (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-5">
        {/* Top Right - Bull Skull */}
        <img 
            src="https://i.ibb.co/B7KCtsq/bull-skull-art-free-vector-removebg-preview.png" 
            alt="" 
            className="absolute -top-20 -right-20 w-[300px] md:w-[500px] h-auto rotate-12"
        />
        {/* Bottom Left - Deer Skull */}
        <img 
            src="https://i.ibb.co/27RkP4jn/deer-skull-decal-bone-white-270c0255-d6d3-4ee2-bc02-6906b9f0de72-removebg-preview.png" 
            alt="" 
            className="absolute bottom-0 -left-20 w-[300px] md:w-[600px] h-auto -rotate-12"
        />
        {/* Middle Right - Floral */}
        <img 
            src="https://i.ibb.co/NdLtXyLB/OIP-1-removebg-preview.png" 
            alt="" 
            className="absolute top-1/3 -right-10 w-[200px] md:w-[400px] h-auto rotate-45"
        />
        {/* Top Left - Floral Flipped */}
        <img 
            src="https://i.ibb.co/NdLtXyLB/OIP-1-removebg-preview.png" 
            alt="" 
            className="absolute top-20 -left-10 w-[200px] md:w-[300px] h-auto -scale-x-100 -rotate-12"
        />
    </div>
);

export default StaticTattooBackground;
