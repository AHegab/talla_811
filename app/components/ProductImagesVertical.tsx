import { Image } from '@shopify/hydrogen';
import { useEffect, useRef, useState } from 'react';

export interface PDPImage {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  id?: string;
}

interface ProductImagesVerticalProps {
  images: PDPImage[];
  productTitle?: string;
  sizeChartUrl?: string;
  onSizeGuideClick?: () => void;
}

export function ProductImagesVertical({
  images,
  productTitle = 'Product',
  sizeChartUrl,
  onSizeGuideClick,
}: ProductImagesVerticalProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalThumbRef = useRef<HTMLDivElement | null>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const openModal = (index: number) => {
    setSelectedIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  // Touch handlers for swipe gestures in modal
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      // Swiped left - go to next image
      handleNext();
    }
    if (touchStartX.current - touchEndX.current < -50) {
      // Swiped right - go to previous image
      handlePrev();
    }
  };

  // Keyboard navigation in modal
  useEffect(() => {
    if (!isModalOpen) return;

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
  }, [isModalOpen, selectedIndex, images.length]);

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  // Scroll modal thumbnail into view
  useEffect(() => {
    if (!isModalOpen) return;
    const node = modalThumbRef.current;
    if (!node) return;
    const currentThumb = node.querySelector(
      `button[data-modal-idx="${selectedIndex}"]`,
    ) as HTMLElement | null;
    currentThumb?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, [selectedIndex, isModalOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  if (!images.length) {
    return (
      <div className="aspect-[3/4] flex items-center justify-center bg-gray-100 rounded-lg">
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
    );
  }

  return (
    <div className="space-y-0">
      {/* Vertically stacked images - full width, no frames */}
      {images.map((img, idx) => (
        <button
          key={img.id || idx}
          onClick={() => openModal(idx)}
          className="w-full aspect-[3/4] overflow-hidden bg-gray-100 group cursor-pointer block relative"
          aria-label={`View image ${idx + 1} in fullscreen`}
        >
          <Image
            data={{
              url: img.url,
              altText: img.alt || `${productTitle} - Image ${idx + 1}`,
              width: img.width,
              height: img.height,
            }}
            className="w-full h-full object-cover"
            loading={idx < 2 ? 'eager' : 'lazy'}
            sizes="100vw"
          />

          {/* Zoom indicator on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 flex items-center justify-center pointer-events-none">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-3 shadow-lg">
              <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
            </div>
          </div>
        </button>
      ))}

      {/* Modal viewer - Fullscreen (reused from ProductGallery) */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[200] bg-black animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          {/* Close button */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 md:top-6 md:right-6 z-50 w-12 h-12 flex items-center justify-center bg-gray-900/80 hover:bg-gray-900 backdrop-blur-sm rounded-full transition-all shadow-lg"
            aria-label="Close image viewer"
          >
            <svg
              className="text-white"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ display: 'block' }}
            >
              <line x1="2" y1="2" x2="16" y2="16"></line>
              <line x1="16" y1="2" x2="2" y2="16"></line>
            </svg>
          </button>

          {/* Main image - Full screen with space for thumbnails */}
          <div
            className={`w-full flex items-center justify-center px-4 md:px-8 lg:px-16 ${
              images.length > 1 ? 'h-[calc(100vh-120px)]' : 'h-screen'
            }`}
            onClick={(e) => {
              // Only close on desktop when clicking the background
              if (e.target === e.currentTarget && window.innerWidth >= 768) {
                closeModal();
              }
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="relative w-full h-full md:w-auto md:h-auto md:max-w-xl md:max-h-[80vh] lg:max-w-2xl lg:max-h-[85vh] flex items-center justify-center">
              <Image
                data={{
                  url: images[selectedIndex]?.url,
                  altText: images[selectedIndex]?.alt || productTitle,
                  width: images[selectedIndex]?.width,
                  height: images[selectedIndex]?.height,
                }}
                className="w-full h-full object-contain"
                loading="eager"
                sizes="(min-width: 1024px) 1200px, 100vw"
              />
            </div>
          </div>

          {/* Thumbnail carousel at bottom */}
          {images.length > 1 && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent py-6 px-4">
              <div
                ref={modalThumbRef}
                className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-2"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch',
                } as React.CSSProperties}
              >
                {images.map((img, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={img.id || idx}
                      data-modal-idx={idx}
                      type="button"
                      aria-label={`View image ${idx + 1}`}
                      aria-pressed={isSelected}
                      onClick={() => setSelectedIndex(idx)}
                      className={`snap-center flex-shrink-0 rounded-md overflow-hidden transition-all duration-200 ${
                        isSelected
                          ? 'ring-2 ring-white scale-110'
                          : 'ring-1 ring-white/40 opacity-50 hover:opacity-80'
                      }`}
                      style={{
                        width: '56px',
                        height: '74px',
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
          )}
        </div>
      )}
    </div>
  );
}
