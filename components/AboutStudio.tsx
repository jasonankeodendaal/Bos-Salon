
import React from 'react';

const AboutStudio: React.FC = () => {
  return (
    <section className="bg-brand-dark py-20">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left">
            <h2 className="font-display text-6xl md:text-7xl mb-6">ABOUT OUR STUDIO</h2>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Magna nisl egestas amet nietus luctus iaculis. Praesent ut vitae tempus sollicitudin praesent id Viverra. Magna nisl egestas amet nietus luctus iaculis. Praesent ut vitae tempus sollicitudin praesent id Viverra.
            </p>
            <button className="bg-brand-red text-white px-8 py-3 rounded-md font-bold text-lg hover:bg-red-700 transition-colors">
              Read our story
            </button>
          </div>
          <div>
            <img 
              src="https://picsum.photos/800/600?random=2" 
              alt="Tattoo artist at work" 
              className="rounded-lg shadow-2xl object-cover w-full h-full" 
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutStudio;
