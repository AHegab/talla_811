import { useEffect, useState } from 'react';

  // {
  //   image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop',
  //   tagline: 'Contemporary Cairo Style',
  //   cta: 'Discover Now',
  //   link: '/collections/brands',
  // },
// Local hero slides. Place your images in `public/hero/` with the filenames below.
const slides = [
  {
    image: '/hero/hero-1.jpeg',
    tagline: 'Editorial One',
    cta: 'Shop the Edit',
    link: '/collections/new-arrivals',
  },
  {
    image: '/hero/hero-2.jpeg',
    tagline: 'Editorial Two',
    cta: 'Explore Collection',
    link: '/collections/women',
  },
  {
    image: '/hero/hero-3.jpeg',
    tagline: 'Editorial Three',
    cta: 'Discover',
    link: '/collections/accessories',
  },
];

export function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6000); // 6 seconds auto-play

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 12000);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 12000);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 12000);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  return (
    <div className="w-full">
      <div
        className="relative w-full h-[380px] sm:h-[440px] md:h-[520px] lg:h-[600px] xl:h-[680px] overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src={slide.image}
                  alt={slide.tagline}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>
          ))}
        </div>
    </div>
  );
}
