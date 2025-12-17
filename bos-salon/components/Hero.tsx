
import React, { useState, MouseEvent } from 'react';
import { PortfolioItem } from '../App';
import PortfolioModal from './PortfolioModal';
import SearchIcon from './icons/SearchIcon';
import CarouselMediaItem from './CarouselMediaItem';

interface HeroProps {
  portfolioData: PortfolioItem[];
  onNavigate: (view: 'home' | 'admin') => void;
  heroBgUrl: string;
  // New props for CMS
  title?: string;
  subtitle?: string;
  buttonText?: string;
}

const Hero: React.FC<HeroProps> = ({ 
  portfolioData, 
  onNavigate, 
  heroBgUrl,
  title = "Nail and beauty",
  subtitle = "Experience the art of nature",
  buttonText = "Book an Appointment"
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

  const handleImageClick = (item: PortfolioItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // Delay clearing the item to allow for the closing animation
    setTimeout(() => setSelectedItem(null), 500);
  };
  
  const handleLinkClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute('href');
    if (!href) return;

    if (href.startsWith('#')) {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const featuredItems = portfolioData.filter(item => item.featured);
  // Use featured items if available, otherwise fall back to the first 6 portfolio items to ensure the carousel is not empty.
  const itemsForCarousel = featuredItems.length > 0 ? featuredItems : portfolioData.slice(0, 6);
  // Duplicate the array for a seamless infinite scroll effect
  const allPortfolioItems = itemsForCarousel.length > 0 ? [...itemsForCarousel, ...itemsForCarousel] : [];


  return (
    <>
      <section className="relative h-screen bg-brand-dark text-brand-light overflow-hidden perspective-1000">
        
        {/* Light Mode Gradient - Reduced opacity to show image better */}
        <div className="absolute top-0 left-0 w-full h-full z-0 bg-gradient-to-t from-white via-white/40 to-transparent"></div>
        
        {/* Background Image - Moved here to sit behind text and carousel */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%] z-0 w-full text-center pointer-events-none">
            <img 
                src={heroBgUrl}
                alt="Background Art"
                aria-hidden="true"
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] sm:w-[50rem] md:w-[65rem] lg:w-[80rem] max-w-none h-auto opacity-75 object-cover"
            />
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%] z-20 w-full text-center px-4">
          <div className="relative">
            <h1 
              className="relative z-10 font-script text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] leading-tight tracking-wide text-brand-light transform transition-transform duration-500 hover:scale-105 cursor-default"
              style={{
                  textShadow: `
                    0px 1px 0px #c9c9c9,
                    0px 2px 0px #b9b9b9,
                    0px 3px 0px #a9a9a9,
                    0px 4px 0px #999999,
                    0px 5px 10px rgba(0,0,0,0.1),
                    0px 10px 10px rgba(0,0,0,0.05),
                    0px 20px 20px rgba(0,0,0,0.05)
                  `
              }}
            >
              {title}
            </h1>
            
            <div className="relative z-10 mt-10 flex flex-col sm:flex-row items-center justify-center gap-6">
              <a href="#contact-form" onClick={handleLinkClick} className="w-full sm:w-auto bg-brand-green border border-brand-green text-white px-8 py-3.5 rounded-full text-sm font-bold tracking-wide hover:bg-opacity-90 transition-all shadow-[0_10px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_15px_25px_rgba(16,185,129,0.4)] hover:-translate-y-1">
                {buttonText}
              </a>
              <a href="#showroom" onClick={handleLinkClick} className="w-full sm:w-auto border-2 border-brand-light/20 bg-white/50 backdrop-blur-sm px-8 py-3.5 rounded-full text-sm font-bold tracking-wide hover:bg-white hover:border-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 text-brand-light">
                View Gallery
              </a>
            </div>
            <div className="relative z-10 mt-20 sm:mt-28">
              <div className="flex items-center justify-center gap-4 text-brand-light/40">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 animate-bounce-horizontal-reverse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                </svg>
                <span className="text-xs font-bold tracking-[0.2em]">{subtitle.toUpperCase()}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 animate-bounce-horizontal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
          </div>
          </div>
        </div>
        
        <div className="absolute top-[56%] sm:top-[62%] md:top-[60%] left-0 w-full h-[60%] z-10 [perspective:1000px]">
          <div className="absolute top-0 w-full h-full [transform-style:preserve-3d] [transform:rotateX(55deg)] md:[transform:rotateX(50deg)]">
            <div className="absolute h-full w-max flex animate-infinite-scroll group">
              {allPortfolioItems.map((item, index) => (
                <div key={`${item.id}-${index}`} className="w-[140px] h-[210px] sm:w-[180px] h-[270px] md:w-[250px] md:h-[350px] m-1 sm:m-3 md:m-4 rounded-2xl overflow-hidden shadow-2xl shadow-brand-green/20 bg-white flex-shrink-0 transition-all duration-500 hover:!scale-110 hover:!z-50 hover:-translate-y-4 relative border-4 border-white">
                  <CarouselMediaItem item={item} />
                  <button 
                    onClick={() => handleImageClick(item)} 
                    className="w-full h-full block absolute inset-0"
                    aria-label={`View details for ${item.title}`}
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-100 group-hover:opacity-0 transition-opacity duration-300"></div>
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px]">
                      <SearchIcon className="w-12 h-12 text-white drop-shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300" />
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Updated Gradient to White for Light Mode */}
        <div className="absolute inset-0 [background:radial-gradient(ellipse_at_center,_transparent_40%,_#fcfbf9_90%)] z-30 pointer-events-none"></div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[150%] bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.03)_0%,rgba(255,255,255,0)_60%)] z-0 pointer-events-none"></div>

      </section>

      {selectedItem && (
        <PortfolioModal 
          isOpen={isModalOpen}
          onClose={closeModal}
          item={selectedItem}
        />
      )}
    </>
  );
};

export default Hero;
