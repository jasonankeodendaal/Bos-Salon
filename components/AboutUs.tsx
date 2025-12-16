
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
      <section id="about-us" className="relative bg-brand-dark py-10 sm:py-32 overflow-hidden text-brand-light">
        
        <WelcomeBackground />
        
        <div className="relative z-10 container mx-auto px-4 sm:px-6">
          {/* Changed to 2 columns on all devices for side-by-side layout */}
          <div className="grid grid-cols-2 gap-4 md:gap-8 lg:gap-16 items-center">
            
            {/* Image Col - Circular Container */}
            <div className="order-1 w-full flex justify-center lg:justify-end items-center">
               {/* Shrunk image size for mobile to fit side-by-side */}
               <div className="relative w-32 h-32 sm:w-64 sm:h-64 lg:w-96 lg:h-96 rounded-full overflow-hidden border-2 sm:border-4 border-white shadow-xl sm:shadow-2xl hover:scale-105 transition-transform duration-500 ring-1 ring-gray-200 shrink-0">
                  <img 
                    src={aboutUsImageUrl} 
                    alt="Bos Salon Feature" 
                    className="w-full h-full object-cover object-center"
                  />
               </div>
            </div>

            {/* Text Col */}
            <div className="order-2 text-left">
              <h2 className="font-script text-2xl sm:text-6xl text-brand-green mb-2 sm:mb-6 leading-tight">
                {title}
              </h2>
              <div className="w-8 sm:w-24 h-0.5 sm:h-1 bg-brand-gold mb-3 sm:mb-8"></div>
              <div className="space-y-2 sm:space-y-6">
                  <p className="text-gray-600 leading-snug sm:leading-relaxed text-[10px] sm:text-lg">
                    {text1}
                  </p>
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-lg hidden sm:block">
                    {text2}
                  </p>
              </div>
              <a href="#contact-form" onClick={handleAnchorClick} className="inline-block bg-brand-green border border-brand-green text-white px-4 py-1.5 sm:px-8 sm:py-3 rounded-full text-[10px] sm:text-sm font-semibold hover:bg-opacity-90 transition-colors shadow-lg mt-3 sm:mt-10">
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
