import React, { useState, useEffect } from 'react';

const fallbackImages = [
  "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1554046920-90dcac4a3500?auto=format&fit=crop&w=1920&q=80"
];

const PhotographyHome: React.FC<{ settings: any; onNavigate?: (view: 'home' | 'library' | 'booking') => void }> = ({ settings, onNavigate }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = [];
  if (settings.heroBgUrls && settings.heroBgUrls.length > 0) {
    images.push(...settings.heroBgUrls);
  } else if (settings.heroBgUrl) {
    images.push(settings.heroBgUrl);
  }
  if (settings.aboutUsImageUrl) images.push(settings.aboutUsImageUrl);
  if (images.length === 0) images.push(...fallbackImages);
  else if (images.length === 1) images.push(...fallbackImages.slice(0, 2));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 4500); 
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="animate-fade-in w-full flex flex-col items-center">
      
      {/* -------------------- DESKTOP VIEW (AVANT-GARDE) -------------------- */}
      <div className="hidden md:flex flex-col w-full bg-[#030303] text-stone-100">
        
        {/* Immersive Cinematic Hero */}
        <section className="w-full h-[85vh] relative flex items-end pb-24 px-12 lg:px-24 border-b border-stone-900">
            {images.map((img, idx) => {
                const isVideo = img.match(/\.(mp4|webm|ogg)$/i);
                return (
                    <div 
                        key={idx}
                        className={`absolute inset-0 overflow-hidden transition-opacity duration-[2000ms] ease-in-out ${idx === currentImageIndex ? 'opacity-100 z-0' : 'opacity-0 -z-10'}`}
                    >
                        {isVideo ? (
                            <video src={img} autoPlay muted loop playsInline className="w-full h-full object-cover scale-105 filter grayscale-[20%]" />
                        ) : (
                            <img src={img} alt={`Hero ${idx}`} className="w-full h-full object-cover scale-105 filter grayscale-[20%]" />
                        )}
                        {/* Film grain and abstract lighting */}
                        <div className="absolute inset-0 bg-black/20 mix-blend-overlay pointer-events-none"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-[#030303]/40 to-transparent pointer-events-none"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-[#030303]/80 via-[#030303]/10 to-transparent w-full lg:w-2/3 pointer-events-none"></div>
                    </div>
                );
            })}

            {/* Asymmetrical Type Lockup */}
            <div className="relative z-10 w-full flex justify-between items-end">
                <div className="max-w-4xl">
                    <p className="text-[10px] font-bold tracking-[0.5em] uppercase text-stone-400 mb-8 flex items-center gap-6">
                        <span className="w-12 h-px bg-stone-600"></span> 
                        {settings.companyName || 'Fine Art Photography'}
                    </p>
                    <h1 className="text-5xl lg:text-[4.5rem] font-light tracking-tighter text-white leading-[1.1] drop-shadow-xl pl-6 lg:pl-10 mix-blend-difference">
                        {settings.hero?.title || 'Capturing The Moment'}
                    </h1>
                </div>
                <div className="hidden lg:flex flex-col items-end pb-4 space-y-6">
                    <div className="w-px h-32 bg-gradient-to-b from-stone-500 to-transparent"></div>
                    <span className="text-[9px] font-medium tracking-[0.3em] uppercase text-stone-500 whitespace-nowrap rotate-90 origin-bottom-right translate-x-3 mb-10">Discover</span>
                </div>
            </div>
        </section>

        {/* Abstract Philosophy Statement */}
        <section className="w-full py-32 px-12 lg:px-24">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 justify-between items-start">
                <div className="w-1/3 shrink-0 pt-2">
                    <h2 className="text-[9px] font-bold tracking-[0.4em] uppercase text-stone-500 block border-b border-stone-800/80 pb-6 w-full">
                        Studio Philosophy
                    </h2>
                </div>
                <div className="w-2/3 flex flex-col space-y-12">
                    <h3 className="text-2xl lg:text-4xl font-serif italic text-stone-200 leading-snug font-light">
                        "{settings.hero?.subtitle || 'We specialize in professional photography tailored to your unique story. Beautifully crafted, minimal, and authentic.'}"
                    </h3>
                    <div>
                        <button 
                            onClick={() => onNavigate && onNavigate('booking')}
                            className="text-[9px] font-bold uppercase tracking-[0.3em] text-white border-b hover:border-white/50 border-white pb-2 hover:text-stone-300 transition-all">
                            View Pricing Profile
                        </button>
                    </div>
                </div>
            </div>
        </section>

        {/* Deconstructed Profile Layout */}
        <section className="w-full pt-16 pb-40 px-12 lg:px-24 border-t border-stone-900/50">
            <div className="max-w-7xl mx-auto flex flex-row items-center justify-between relative">
                
                {/* Offset Typography Component */}
                <div className="w-[45%] flex flex-col z-20">
                    <div className="mb-16">
                        <p className="text-[9px] font-bold tracking-[0.4em] uppercase text-stone-500 mb-8 flex items-center gap-4">
                            <span className="w-6 h-[2px] bg-stone-700"></span> The Visionary
                        </p>
                        <h2 className="text-5xl lg:text-6xl font-light tracking-tighter text-white leading-[1.05]">
                            Behind<br />the Lens
                        </h2>
                    </div>

                    <div className="pl-6 lg:pl-10 border-l border-stone-800/60 space-y-8 text-stone-400 text-sm font-light leading-relaxed tracking-wide max-w-lg">
                         <p className="first-line:uppercase first-line:tracking-widest first-line:text-stone-200">
                             {settings.about?.story_p1 || "I believe that every picture tells a story. My journey began with a passion for capturing the raw, authentic moments that make life beautiful."}
                         </p>
                         <p>
                             {settings.about?.story_p2 || "Whether it's a wedding, a corporate event, or a personal portrait session, my approach is always the same: to blend into the background and let the natural magic unfold."}
                         </p>
                         <p>
                             {settings.about?.story_p3 || "I utilize state-of-the-art equipment paired with a deep understanding of natural and artificial lighting to ensure every frame is a masterpiece you'll cherish forever."}
                         </p>
                    </div>

                    {settings.logoUrl && (
                        <div className="mt-16 pl-6 lg:pl-10 relative">
                            <img src={settings.logoUrl} alt="Signature" className="h-16 opacity-30 mix-blend-screen filter grayscale" />
                            <div className="absolute top-1/2 -left-12 w-8 h-px bg-stone-800/80"></div>
                        </div>
                    )}
                </div>

                {/* Floating Image Component */}
                <div className="w-[50%] relative z-10 pl-10">
                    <div className="w-full aspect-[4/5] overflow-hidden filter grayscale-[70%] hover:grayscale-0 transition-all duration-[2000ms] ease-in-out border border-stone-800/40 relative">
                        {settings.aboutUsImageUrl ? (
                            <img src={settings.aboutUsImageUrl} alt="Meet the owner" className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-[4000ms] ease-out opacity-90 hover:opacity-100" />
                        ) : (
                            <div className="w-full h-full bg-[#080808] flex items-center justify-center">
                                <span className="text-[9px] tracking-[0.4em] uppercase text-stone-600 font-bold">Portrait Base</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-stone-900/10 mix-blend-color pointer-events-none"></div>
                    </div>
                </div>

            </div>
        </section>
      </div>

      {/* -------------------- MOBILE VIEW -------------------- */}
      <div className="flex md:hidden flex-col w-full items-center">
        {/* Flipping Background Hero Section - Bleeding Full Viewport */}
        <section className="w-full relative h-[60vh] -mt-24 mb-10 overflow-hidden flex items-center justify-center">
          {images.map((img, idx) => {
              const isVideo = img.match(/\.(mp4|webm|ogg)$/i);
              return (
                <div 
                  key={idx}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentImageIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
                >
                  <div className="absolute inset-0 bg-black/40 z-10 mix-blend-multiply"></div>
                  <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10"></div>
                  {isVideo ? (
                      <video src={img} autoPlay muted loop playsInline className="w-full h-full object-cover grayscale-[30%]" />
                  ) : (
                      <img src={img} alt={`Hero ${idx}`} className="w-full h-full object-cover grayscale-[30%]" />
                  )}
                </div>
              );
          })}
          
          <div className="relative z-20 text-center px-4 max-w-4xl mx-auto flex flex-col items-center mt-12">
             <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-stone-300 mb-4 drop-shadow-sm">
                 {settings.companyName || 'Fine Art Photography'}
             </p>
             <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-white drop-shadow-2xl leading-[1.1] mix-blend-overlay">
               {settings.hero?.title || 'Capturing The Moment'}
             </h1>
          </div>
        </section>

        {/* Welcome to Photography Section */}
        <section className="w-full max-w-4xl mx-auto px-4 py-12 text-center space-y-6 border-b border-white/5">
           <h2 className="text-2xl font-light tracking-tight text-stone-200">
               Welcome to our Studio
           </h2>
           <div className="w-px h-10 bg-gradient-to-b from-stone-500/0 via-stone-500/50 to-stone-500/0 mx-auto"></div>
           <p className="text-base text-stone-400 font-light leading-relaxed max-w-2xl mx-auto px-2">
               {settings.hero?.subtitle || 'We specialize in professional photography tailored to your unique story. Beautifully crafted, minimal, and authentic.'}
           </p>
           <button 
              onClick={() => onNavigate && onNavigate('booking')}
              className="px-6 py-2 bg-transparent text-stone-300 border border-stone-600 hover:border-white hover:text-white uppercase tracking-widest text-[9px] font-bold transition-colors mt-6">
              View Pricing
           </button>
        </section>

        {/* Meet the Owner Section */}
        <section className="w-full max-w-5xl mx-auto px-4 py-16">
          <div className="flex flex-col items-center gap-10">
              {/* Free flowing portrait */}
              <div className="w-full relative">
                  {settings.aboutUsImageUrl ? (
                      <img src={settings.aboutUsImageUrl} alt="Meet the owner" className="w-full aspect-[3/4] object-cover grayscale opacity-90 hover:grayscale-0 hover:opacity-100 transition-all duration-1000 ease-out" />
                  ) : (
                      <div className="w-full aspect-[3/4] bg-neutral-900 border border-white/5 flex items-center justify-center">
                          <span className="text-stone-600 text-xs tracking-widest uppercase">Portrait Placeholder</span>
                      </div>
                  )}
              </div>

              {/* Free flowing text */}
              <div className="w-full space-y-8">
                 <div className="space-y-2">
                     <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-stone-500">Meet the Owner</p>
                     <h2 className="text-3xl font-black tracking-tighter text-stone-200 drop-shadow-sm">The Visionary Behind the Lens</h2>
                 </div>
                 
                 <div className="prose prose-invert prose-stone text-stone-400 font-light leading-relaxed">
                     <p className="mb-6">
                         {settings.about?.story_p1 || "I believe that every picture tells a story. My journey began with a passion for capturing the raw, authentic moments that make life beautiful."}
                     </p>
                     <p className="mb-6">
                         {settings.about?.story_p2 || "Whether it's a wedding, a corporate event, or a personal portrait session, my approach is always the same: to blend into the background and let the natural magic unfold."}
                     </p>
                     <p>
                         {settings.about?.story_p3 || "I utilize state-of-the-art equipment paired with a deep understanding of natural and artificial lighting to ensure every frame is a masterpiece you'll cherish forever."}
                     </p>
                 </div>
                 <div className="pt-8 flex items-center gap-6">
                    {settings.logoUrl && (
                        <img src={settings.logoUrl} alt="Signature" className="h-10 opacity-50 filter grayscale mix-blend-screen" />
                    )}
                    <p className="text-xs uppercase tracking-widest text-stone-600 font-bold">Principal Photographer</p>
                 </div>
              </div>
          </div>
        </section>
      </div>

    </div>
  );
};

export default PhotographyHome;
