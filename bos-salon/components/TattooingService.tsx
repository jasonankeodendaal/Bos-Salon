
import React from 'react';

const TattooingService: React.FC = () => {
  return (
    <section className="bg-brand-gray py-20">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
           <div>
            <img 
              src="https://picsum.photos/800/600?random=3" 
              alt="Detailed tattoo on an arm" 
              className="rounded-lg shadow-2xl object-cover w-full h-full"
            />
          </div>
          <div className="text-center md:text-left">
            <h2 className="font-display text-6xl md:text-7xl mb-6">TATTOOING SERVICE</h2>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Magna nisl egestas amet nietus luctus iaculis. Praesent ut vitae tempus sollicitudin praesent id Viverra. Magna nisl egestas amet nietus luctus iaculis. Praesent ut vitae tempus sollicitudin praesent.
            </p>
            <button className="bg-brand-red text-white px-8 py-3 rounded-md font-bold text-lg hover:bg-red-700 transition-colors">
              Book now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TattooingService;
