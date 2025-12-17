

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PortfolioItem } from '../App';

const getMimeType = (url: string): string => {
    if (url.startsWith('data:')) {
        const mime = url.substring(5, url.indexOf(';'));
        return mime || 'video/mp4';
    }
    const extension = url.split(/[#?]/)[0].split('.').pop()?.trim().toLowerCase();
    switch (extension) {
        case 'mp4': return 'video/mp4';
        case 'webm': return 'video/webm';
        case 'ogg': return 'video/ogg';
        default: return 'video/mp4';
    }
};

const CarouselMediaItem: React.FC<{ item: PortfolioItem }> = ({ item }) => {
  const [media, setMedia] = useState<(string)[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Combine all media into one array
  useEffect(() => {
    const combinedMedia = [item.primaryImage, ...item.galleryImages];
    if (item.videoData) {
      combinedMedia.push(item.videoData);
    }
    setMedia(combinedMedia.filter((url): url is string => !!url));
  }, [item]);

  const isVideo = (url: string) => {
    // A simple check based on common video extensions or data URL mime types
    return /\.(mp4|webm|ogg)$/i.test(url) || url.startsWith('data:video/');
  };

  const goToNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % (media.length || 1));
  }, [media.length]);

  // Timer for images
  useEffect(() => {
    if (media.length <= 1) return;

    const currentUrl = media[currentIndex];
    if (currentUrl && !isVideo(currentUrl)) {
      const timer = setTimeout(goToNext, 4000); // 4 seconds for images
      return () => clearTimeout(timer);
    }
  }, [currentIndex, media, goToNext]);
  
  const handleVideoEnd = () => {
    goToNext();
  };
  
  if (media.length === 0) {
      return <div className="w-full h-full bg-black"></div>;
  }
  
  return (
    <div className="relative w-full h-full bg-black">
      {media.map((url, index) => {
        const active = index === currentIndex;
        
        return (
          <div key={`${item.id}-${index}`} className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${active ? 'opacity-100' : 'opacity-0'}`}>
            {isVideo(url) ? (
              <video
                ref={active ? videoRef : null}
                className="w-full h-full object-cover"
                autoPlay={active}
                muted
                loop={media.length === 1}
                onEnded={media.length > 1 ? handleVideoEnd : undefined}
                playsInline
                preload="metadata"
                key={url} // Add key to force re-render on src change
              >
                <source src={url} type={getMimeType(url)} />
              </video>
            ) : (
              <img
                src={url}
                alt={`${item.title} media ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CarouselMediaItem;