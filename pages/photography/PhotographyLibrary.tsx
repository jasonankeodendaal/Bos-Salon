import React, { useState, useEffect, useRef } from 'react';
import { dbSubscribeToCollection } from '../../utils/dbAdapter';
import FullScreenImageViewer from '../../components/FullScreenImageViewer';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const GalleryRow: React.FC<{ images: string[], onSelect: (img: string) => void }> = ({ images, onSelect }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const scroll = (direction: 'left' | 'right') => {
        if(scrollRef.current) {
            const container = scrollRef.current;
            const scrollAmount = 250;
            container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    }

    return (
        <div className="relative pt-4 group">
            <button onClick={() => scroll('left')} className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all">
                <ChevronLeft size={20} />
            </button>
            <div ref={scrollRef} className="flex gap-1.5 pb-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {images.map((img, i) => (
                    <div key={i} onClick={() => onSelect(img)} className="cursor-pointer min-w-[70px] md:min-w-[120px] w-[70px] md:w-[120px] aspect-square overflow-hidden bg-[#0a0a0a] rounded-sm md:rounded-lg">
                        <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                    </div>
                ))}
            </div>
            <button onClick={() => scroll('right')} className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all">
                <ChevronRight size={20} />
            </button>
        </div>
    )
}

const LibraryItem: React.FC<{ item: any, index: number }> = ({ item, index }) => {
    const [currentImage, setCurrentImage] = useState(item.primaryImage);
    const [isFullScreen, setIsFullScreen] = useState(false);

    const allImages = [item.primaryImage, ...(item.galleryImages || [])].filter(Boolean);

    const handleNext = () => {
        const curIndex = allImages.indexOf(currentImage);
        if (curIndex >= 0 && curIndex < allImages.length - 1) {
            setCurrentImage(allImages[curIndex + 1]);
        } else if (allImages.length > 0) {
            setCurrentImage(allImages[0]); // Loop back to start
        }
    };

    const handlePrev = () => {
        const curIndex = allImages.indexOf(currentImage);
        if (curIndex > 0) {
            setCurrentImage(allImages[curIndex - 1]);
        } else if (allImages.length > 0) {
            setCurrentImage(allImages[allImages.length - 1]); // Loop to end
        }
    };

    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe && allImages.length > 1) {
            handleNext();
        }
        if (isRightSwipe && allImages.length > 1) {
            handlePrev();
        }
        
        setTouchStart(0);
        setTouchEnd(0);
    };

    return (
        <>
            {/* Desktop View */}
            <div className={`hidden md:flex group flex-row ${index % 2 !== 0 ? 'flex-row-reverse' : 'flex-row'} items-center gap-12 lg:gap-24 py-20 border-b border-stone-800/50 last:border-0`}>
                {/* Primary Image Cover */}
                <div className="w-[45%] shrink-0 relative group/primary">
                     {allImages.length > 1 && (
                         <button 
                             onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                             className="absolute -left-6 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black/80 hover:scale-110 text-white p-3 rounded-full opacity-0 group-hover/primary:opacity-100 transition-all backdrop-blur-sm border border-white/10 hidden md:flex"
                         >
                             <ChevronLeft size={24} />
                         </button>
                     )}
                     <div 
                         className="relative w-full cursor-pointer overflow-hidden rounded-[2rem] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8)] transition-all duration-1000 ease-out hover:shadow-[0_20px_50px_-15px_rgba(255,255,255,0.05)] bg-[#050505] border border-white/5 aspect-[4/5] group/img" 
                         onClick={() => setIsFullScreen(true)}
                         onTouchStart={handleTouchStart}
                         onTouchMove={handleTouchMove}
                         onTouchEnd={handleTouchEnd}
                     >
                        {currentImage ? (
                            <>
                                <img src={currentImage} alt={item.title} className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover/img:scale-105 opacity-90 group-hover/img:opacity-100" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/80 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                            </>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <span className="text-stone-700 text-sm uppercase tracking-[0.3em] font-light italic">Void</span>
                            </div>
                        )}
                    </div>
                     {allImages.length > 1 && (
                         <button 
                             onClick={(e) => { e.stopPropagation(); handleNext(); }}
                             className="absolute -right-6 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black/80 hover:scale-110 text-white p-3 rounded-full opacity-0 group-hover/primary:opacity-100 transition-all backdrop-blur-sm border border-white/10 hidden md:flex"
                         >
                             <ChevronRight size={24} />
                         </button>
                     )}
                </div>
                
                {/* Story & Details */}
                <div className="w-[55%] flex flex-col justify-center">
                    <div className="mb-10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-[1px] w-8 bg-stone-700"></div>
                            <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-stone-500 italic">Edition {String(index + 1).padStart(2, '0')}</p>
                        </div>
                        <h3 className="text-5xl lg:text-7xl font-serif font-light tracking-tighter text-stone-50 leading-[1.1] mb-10">
                            {item.title}
                        </h3>
                        
                        <div className="border-l border-stone-800/80 pl-8 lg:pl-10 text-stone-400 text-base lg:text-lg font-light leading-relaxed tracking-wider opacity-90 space-y-5">
                            <p className="first-letter:text-4xl first-letter:font-serif first-letter:text-stone-300 first-letter:mr-2 first-letter:float-left">{item.story1}</p>
                            {item.story2 && <p>{item.story2}</p>}
                            {item.story3 && <p>{item.story3}</p>}
                        </div>
                    </div>
                    
                    {/* Gallery Miniatures */}
                    {item.galleryImages && item.galleryImages.length > 0 && (
                        <div className="mt-4">
                            <div className="flex items-center gap-4 mb-4 pl-2">
                                <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-stone-600">Archival Gallery</p>
                                <div className="h-[1px] flex-1 bg-gradient-to-r from-stone-800/80 to-transparent"></div>
                            </div>
                            <div className="bg-[#080808] rounded-2xl p-4 lg:p-6 border border-white/5">
                                <GalleryRow images={item.galleryImages} onSelect={setCurrentImage} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile View */}
            <div className="flex md:hidden flex-col mb-10 w-full relative group/primary">
                 <div className="bg-[#121212] rounded-[1.5rem] overflow-hidden border border-white/5 shadow-2xl relative flex flex-col">
                    <div 
                        className="w-full aspect-square relative cursor-pointer shrink-0" 
                        onClick={() => setIsFullScreen(true)}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        {currentImage ? (
                            <>
                                <img src={currentImage} alt={item.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/30 to-transparent pointer-events-none"></div>
                            </>
                        ) : (
                            <div className="w-full h-full bg-stone-900 flex items-center justify-center">
                                <span className="text-stone-700 text-[10px] uppercase tracking-tighter italic">Void</span>
                            </div>
                        )}
                        <div className="absolute bottom-5 left-5 right-5 pointer-events-none">
                            <p className="text-[9px] font-black tracking-[0.4em] uppercase text-stone-400 drop-shadow-md mb-1">Edition {index + 1}</p>
                            <h3 className="text-4xl font-serif font-light tracking-tight text-white leading-none drop-shadow-2xl">{item.title}</h3>
                        </div>
                    </div>

                    <div className="px-5 pb-6 pt-4">
                        {item.galleryImages && item.galleryImages.length > 0 && (
                            <div className="mb-6 bg-[#080808] rounded-xl p-3 border border-white/5">
                                <p className="text-[8px] font-bold tracking-[0.3em] uppercase text-stone-500 mb-2 px-1">Gallery</p>
                                <GalleryRow images={item.galleryImages} onSelect={setCurrentImage} />
                            </div>
                        )}

                        <div className="text-stone-400 text-xs font-light leading-relaxed tracking-wide space-y-3">
                            <p>{item.story1}</p>
                            {item.story2 && <p>{item.story2}</p>}
                            {item.story3 && <p>{item.story3}</p>}
                        </div>
                    </div>
                </div>
            </div>

            {isFullScreen && <FullScreenImageViewer 
                src={currentImage} 
                alt={item.title} 
                onClose={() => setIsFullScreen(false)} 
                onNext={allImages.length > 1 ? handleNext : undefined}
                onPrev={allImages.length > 1 ? handlePrev : undefined}
            />}
        </>
    )
}

const PhotographyLibrary: React.FC<{ settings: any }> = ({ settings }) => {
  const [libraryData, setLibraryData] = useState<any[]>(() => {
    try {
        const cached = localStorage.getItem('photography_library_cache');
        return cached ? JSON.parse(cached) : [];
    } catch {
        return [];
    }
  });
  const [loading, setLoading] = useState(() => !localStorage.getItem('photography_library_cache'));

  useEffect(() => {
    const unsub = dbSubscribeToCollection('photo_library', (data) => {
        setLibraryData(data);
        localStorage.setItem('photography_library_cache', JSON.stringify(data));
        setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) {
      return (
          <div className="py-24 text-center">
              <p className="animate-pulse tracking-widest text-sm uppercase text-stone-500">Loading Library...</p>
          </div>
      );
  }

  return (
    <div className="w-full space-y-8">
        <div className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-white drop-shadow-lg">Selected Work</h2>
            <div className="w-16 h-1 bg-stone-300 mx-auto mt-4 rounded-full shadow-[0_2px_10px_rgba(255,255,255,0.2)]"></div>
        </div>
        
        {libraryData.length === 0 ? (
            <div className="text-center text-stone-500 py-16 bg-[#161616]/50 backdrop-blur-xl border border-white/5 rounded-[2rem] shadow-[inset_0_2px_15px_rgba(0,0,0,0.5)]">
                No portfolio items available yet.
            </div>
        ) : (
            <div className="space-y-16">
                {libraryData.map((item, index) => (
                    <LibraryItem key={item.id} item={item} index={index} />
                ))}
            </div>
        )}
    </div>
  );
};

export default PhotographyLibrary;
