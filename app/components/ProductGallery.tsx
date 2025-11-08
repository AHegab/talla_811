import { Image } from '@shopify/hydrogen';
import { useEffect, useState } from 'react';

export interface PDPImage {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  id?: string;
}

interface ProductGalleryProps {
  images: PDPImage[];
  productTitle?: string;
}

export function ProductGallery({images, productTitle = 'Product'}: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({x: 0, y: 0});

  const currentImage = images[selectedIndex] || images[0];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      } else if (e.key === 'ArrowRight') {
        setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({x, y});
  };

  if (!images.length) {
    return (
      <div className="space-y-4">
        <div 
          className="aspect-portrait flex items-center justify-center"
          style={{backgroundColor: '#DDDEE2'}}
        >
          <svg 
            className="w-24 h-24 opacity-40" 
            fill="none" 
            stroke="#6B6C75" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Main Image */}
      <div 
        className="relative aspect-portrait overflow-hidden group cursor-zoom-in"
        style={{backgroundColor: '#FBFBFB'}}
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
        role="img"
        aria-label={currentImage.alt || `${productTitle} - Image ${selectedIndex + 1}`}
      >
        <Image
          data={{
            url: currentImage.url,
            altText: currentImage.alt || `${productTitle} - Image ${selectedIndex + 1}`,
            width: currentImage.width,
            height: currentImage.height,
          }}
          className="w-full h-full object-cover transition-transform duration-slower"
          style={{
            transform: isZoomed ? `scale(1.5)` : 'scale(1)',
            transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
          }}
          sizes="(min-width: 1024px) 50vw, 100vw"
          loading="eager"
        />

        {/* Image counter */}
        {images.length > 1 && (
          <div 
            className="absolute bottom-4 right-4 px-3 py-1.5 text-xs font-medium tracking-wider bg-white/90 backdrop-blur-sm"
            style={{color: '#292929', fontFamily: 'var(--font-sans)'}}
          >
            {selectedIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails - Horizontal scroll on mobile, vertical list on desktop */}
      {images.length > 1 && (
        <>
          {/* Desktop: Vertical Grid */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-3">
            {images.slice(0, 8).map((image, index) => (
              <button
                key={image.id || index}
                onClick={() => setSelectedIndex(index)}
                onFocus={() => setSelectedIndex(index)}
                className={`aspect-square overflow-hidden transition-all duration-base focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 ${
                  selectedIndex === index
                    ? 'ring-2 ring-gray-800 ring-offset-2 scale-95'
                    : 'hover:opacity-80 hover:scale-95'
                }`}
                style={{
                  backgroundColor: '#DDDEE2',
                }}
                aria-label={`View image ${index + 1}`}
                aria-pressed={selectedIndex === index}
              >
                <Image
                  data={{
                    url: image.url,
                    altText: image.alt || `Thumbnail ${index + 1}`,
                    width: image.width,
                    height: image.height,
                  }}
                  className="w-full h-full object-cover"
                  sizes="150px"
                  loading="lazy"
                />
              </button>
            ))}
          </div>

          {/* Mobile: Horizontal Scroll */}
          <div className="lg:hidden flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
            {images.slice(0, 8).map((image, index) => (
              <button
                key={image.id || index}
                onClick={() => setSelectedIndex(index)}
                className={`flex-shrink-0 w-20 h-20 overflow-hidden snap-start transition-all duration-base ${
                  selectedIndex === index
                    ? 'ring-2 ring-gray-800 ring-offset-2 scale-95'
                    : 'hover:opacity-80'
                }`}
                style={{
                  backgroundColor: '#DDDEE2',
                }}
                aria-label={`View image ${index + 1}`}
                aria-pressed={selectedIndex === index}
              >
                <Image
                  data={{
                    url: image.url,
                    altText: image.alt || `Thumbnail ${index + 1}`,
                    width: image.width,
                    height: image.height,
                  }}
                  className="w-full h-full object-cover"
                  sizes="80px"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
