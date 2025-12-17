
import React from 'react';

const BossalonsService: React.FC = () => {
  return (
    <section className="bg-brand-dark py-20 text-brand-light">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
           <div>
            <img 
              src="https://picsum.photos/800/600?random=3" 
              alt="Bos Salon Service" 
              className="rounded-lg shadow-2xl object-cover w-full h-full"
            />
          </div>
          <div className="text-center md:text-left">
            <h2 className="font-display text-6xl md:text-7xl mb-6 text-brand-green">BOS SALON SERVICE</h2>
            <p className="text-gray-500 mb-6 leading-relaxed">
              Experience premier tattoo artistry. Our studio specializes in custom designs, ensuring every piece is a unique masterpiece tailored to your story. From intricate fine lines to bold traditional work, we bring your vision to life.
            </p>
            <button className="bg-brand-green text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-opacity-90 transition-colors shadow-lg">
              Book now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BossalonsService;
