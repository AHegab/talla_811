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
  const [turning, setTurning] = useState<'left' | 'right' | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({x: 0, y: 0});

  const currentImage = images[selectedIndex] || images[0];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, selectedIndex]);

  // Carousel navigation handlers with animation
  const handlePrev = () => {
    setTurning('left');
    setTimeout(() => {
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      setTurning(null);
    }, 350);
  };
  const handleNext = () => {
    setTurning('right');
    setTimeout(() => {
      setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
      setTurning(null);
    }, 350);
  };

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
    <div className="space-y-6 lg:space-y-8">
      {/* Vertical list of all images */}
      {images.length > 0 && (
        <div className="flex flex-col gap-6 items-center">
          {images.map((img, idx) => (
            <div key={img.id || idx} className="w-full flex items-center justify-center">
              <Image
                data={{
                  url: img.url,
                  altText: img.alt || `${productTitle} - Image ${idx + 1}`,
                  width: img.width,
                  height: img.height,
                }}
                className="rounded-xl object-cover"
                style={{width: '320px', height: '420px', maxWidth: '100%', aspectRatio: '3/4', boxShadow: '0 2px 16px 0 rgba(220,220,230,0.12)'}}
                sizes="(min-width: 1024px) 50vw, 100vw"
                loading={idx === 0 ? 'eager' : 'lazy'}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
