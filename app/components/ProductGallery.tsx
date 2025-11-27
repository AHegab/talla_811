import {Image} from '@shopify/hydrogen';
import {useEffect, useRef, useState} from 'react';

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

export function ProductGallery({
  images,
  productTitle = 'Product',
}: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [turning, setTurning] = useState<'left' | 'right' | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({x: 0, y: 0});
  const thumbRef = useRef<HTMLDivElement | null>(null);

  const currentImage = images[selectedIndex] || images[0];

  // Modal state handled locally
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
      }
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

  // Scroll thumbnail into view
  useEffect(() => {
    const node = thumbRef.current;
    if (!node) return;
    const currentThumb = node.querySelector(
      `button[data-idx="${selectedIndex}"]`,
    ) as HTMLElement | null;
    currentThumb?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, [selectedIndex]);

  if (!images.length) {
    return (
      <div className="space-y-3">
        <div className="aspect-[3/4] flex items-center justify-center bg-gray-100">
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
      {/* Hero image with thumbnails carousel below */}
      <div className="w-full flex flex-col items-center">
        {/* Main Image - Responsive */}
        <div className="mb-6 flex items-center justify-center w-full">
          <button
            type="button"
            aria-label="Open image viewer"
            onClick={openModal}
            className="relative aspect-[3/4] w-full max-w-[480px] rounded-2xl overflow-hidden p-0 border-none bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 group"
          >
            <Image
              data={{
                url: currentImage.url,
                altText:
                  currentImage.alt ||
                  `${productTitle} - Image ${selectedIndex + 1}`,
                width: currentImage.width,
                height: currentImage.height,
              }}
              className="w-full h-full object-cover"
              loading="eager"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
            {/* Zoom indicator on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-3 shadow-lg">
                <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                </svg>
              </div>
            </div>
          </button>
        </div>

        {/* Thumbnails - Enhanced */}
        <div className="w-full max-w-[520px]">
          <div className="relative">
            <div
              ref={thumbRef}
              className="flex gap-3 items-center justify-start overflow-x-auto py-3 px-1 scrollbar-hide"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {images.map((img, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={img.id || idx}
                    data-idx={idx}
                    type="button"
                    aria-label={`Select image ${idx + 1}`}
                    aria-pressed={isSelected}
                    onClick={() => setSelectedIndex(idx)}
                    className={`
                      flex-shrink-0 cursor-pointer rounded-xl overflow-hidden
                      transition-all duration-300 ease-out
                      ${isSelected
                        ? 'ring-2 ring-gray-800 ring-offset-2 scale-105 shadow-md'
                        : 'ring-1 ring-gray-200 hover:ring-gray-400 hover:shadow-md opacity-70 hover:opacity-100'
                      }
                    `}
                    style={{
                      width: '72px',
                      height: '96px',
                    }}
                  >
                    <img
                      src={img.url}
                      alt={img.alt || `${productTitle} ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal viewer - Fullscreen */}
        {isModalOpen && (
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-md animate-fadeIn cursor-pointer"
            role="dialog"
            aria-modal="true"
            onClick={closeModal}
          >
            {/* Main image - Fullscreen */}
            <div className="w-full h-full flex items-center justify-center p-4">
              <Image
                data={{
                  url: images[selectedIndex]?.url,
                  altText: images[selectedIndex]?.alt || productTitle,
                  width: images[selectedIndex]?.width,
                  height: images[selectedIndex]?.height,
                }}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
