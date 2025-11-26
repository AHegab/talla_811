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
        <div className="mb-5 flex items-center justify-center">
          <button
            type="button"
            aria-label="Open image viewer"
            onClick={openModal}
            className="aspect-[3/4] max-w-full rounded-xl overflow-hidden p-0 border-none bg-white"
            style={{width: '340px', height: '440px'}}
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
              className="w-full h-full object-cover rounded-xl"
              loading="eager"
              sizes="(min-width: 1024px) 50vw, 100vw"
              style={{boxShadow: '0 2px 16px 0 rgba(220,220,230,0.12)'}}
            />
          </button>
        </div>

        {/* Thumbnails */}
        <div className="w-full max-w-[420px]">
          <div className="relative">
            <div
              ref={thumbRef}
              className="flex gap-3 items-center justify-center overflow-x-auto py-2 px-3"
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
                    className={`cursor-pointer flex h-[96px] w-[96px] items-center justify-center rounded-lg bg-white border ${
                      isSelected ? 'border-gray-500' : 'border-gray-300'
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.alt || `${productTitle} ${idx + 1}`}
                      className="h-full w-full rounded-md object-contain p-1"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal viewer */}
        {isModalOpen && (
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-transparent p-6"
            role="dialog"
            aria-modal="true"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeModal();
            }}
          >
            <button
              type="button"
              onClick={closeModal}
              aria-label="Close image viewer"
              className="absolute right-6 top-6 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-black"
            >
              ✕
            </button>

            <div className="max-h-full max-w-full flex items-center justify-center">
              <Image
                data={{
                  url: images[selectedIndex]?.url,
                  altText: images[selectedIndex]?.alt || productTitle,
                  width: images[selectedIndex]?.width,
                  height: images[selectedIndex]?.height,
                }}
                className="max-h-[90vh] max-w-[90vw] object-cover rounded"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
