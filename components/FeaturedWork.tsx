
import React from 'react';

const FeaturedWork: React.FC = () => {
  return (
    <section className="bg-brand-gray py-20">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left">
                <div className="flex items-center gap-6 mb-8 border border-gray-700 p-4 rounded-lg max-w-sm">
                    <img src="https://picsum.photos/80/80?random=6" alt="Matt Cannon" className="w-16 h-16 rounded-full object-cover" />
                    <div>
                        <h4 className="font-bold text-lg">MATT CANNON</h4>
                        <p className="text-brand-red">American Oldschool Style</p>
                    </div>
                </div>
                <h2 className="font-display text-6xl md:text-7xl mb-4">TRIVAL SKULL</h2>
                <p className="text-gray-400 leading-relaxed max-w-md">
                    Praesent ut vitae tempus sollicitudin praesent id Viverra. Magna nisl egestas amet nietus.
                </p>
            </div>
            <div className="flex flex-col items-center gap-8">
                <img src="https://picsum.photos/600/800?random=7" alt="Trival Skull tattoo on a man's back" className="rounded-lg object-cover w-full max-w-md" />
            </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedWork;
