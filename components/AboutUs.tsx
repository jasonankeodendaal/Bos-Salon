
import React, { MouseEvent } from 'react';
import WelcomeBackground from './WelcomeBackground';

interface AboutUsProps {
  aboutUsImageUrl: string;
  title?: string;
  text1?: string;
  text2?: string;
}

const AboutUs: React.FC<AboutUsProps> = ({ 
  aboutUsImageUrl,
  title = "Our Story",
  text1 = "Bos Salon was born from a love for natural beauty and intricate art. We have transformed the traditional salon experience into a sanctuary of calm, surrounded by the subtle elegance of nature.",
  text2 = "We specialize in bespoke nail art, ensuring your hands and feet look their absolute best. From the moment you step in, you'll be enveloped in a peaceful atmosphere where creativity meets relaxation."
}) => {
  const handleAnchorClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute('href');
    if (href) {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <div className="bg-brand-dark">
        <div className="container mx-auto px-4">
          <div className="h-px bg-gradient-to-r from-brand-dark via-gray-200 to-brand-dark"></div>
        </div>
      </div>
      <section id="about-us" className="relative bg-brand-dark py-12 sm:py-32 overflow-hidden text-brand-light">
        
        <WelcomeBackground />
        
        <div className="relative z-10 container mx-auto px-4 sm:px-6">
          {/* Changed to 1 column on mobile to allow larger image */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            
            {/* Image Col - Circular Container */}
            <div className="order-1 w-full flex justify-center items-center">
               <div className="relative w-64 h-64 sm:w-96 sm:h-96 rounded-full overflow-hidden border-4 border-white shadow-2xl hover:scale-105 transition-transform duration-500 ring-1 ring-gray-200">
                  <img 
                    src={aboutUsImageUrl} 
                    alt="Bos Salon Feature" 
                    className="w-full h-full object-cover"
                  />
               </div>
            </div>

            {/* Text Col */}
            <div className="order-2 text-center lg:text-left">
              <h2 className="font-script text-4xl sm:text-6xl text-brand-green mb-4 sm:mb-6">
                {title}
              </h2>
              <div className="w-12 sm:w-24 h-0.5 sm:h-1 bg-brand-gold mb-6 sm:mb-8 mx-auto lg:mx-0"></div>
              <div className="space-y-4 sm:space-y-6">
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-lg">
                    {text1}
                  </p>
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-lg hidden sm:block">
                    {text2}
                  </p>
              </div>
              <a href="#contact-form" onClick={handleAnchorClick} className="inline-block bg-brand-green border border-brand-green text-white px-6 py-2.5 sm:px-8 sm:py-3 rounded-full text-xs sm:text-sm font-semibold hover:bg-opacity-90 transition-colors shadow-lg mt-6 sm:mt-10">
                Book Now
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutUs;
