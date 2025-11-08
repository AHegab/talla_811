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
      <div className="space-y-3">
        <div 
          className="aspect-[3/4] flex items-center justify-center bg-gray-100"
        >
          <svg 
            className="w-16 h-16 opacity-20" 
            fill="none" 
            stroke="#9E9E9E" 
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
    <div className="space-y-3 lg:space-y-4">
      {/* Main Image */}
      <div 
        className="relative aspect-[3/4] overflow-hidden bg-gray-50"
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
          className="w-full h-full object-cover"
          sizes="(min-width: 1024px) 50vw, 100vw"
          loading="eager"
        />

        {/* Image counter */}
        {images.length > 1 && (
          <div 
            className="absolute bottom-3 right-3 px-2.5 py-1 text-xs bg-white/80 backdrop-blur-sm"
            style={{color: '#000000', fontFamily: 'var(--font-sans)'}}
          >
            {selectedIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.slice(0, 8).map((image, index) => (
            <button
              key={image.id || index}
              onClick={() => setSelectedIndex(index)}
              className={`flex-shrink-0 w-16 h-20 overflow-hidden transition-all duration-200 ${
                selectedIndex === index
                  ? 'ring-2 ring-black'
                  : 'opacity-60 hover:opacity-100'
              }`}
              style={{
                backgroundColor: '#F5F5F5',
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
      )}
    </div>
  );
}
