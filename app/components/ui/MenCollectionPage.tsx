// app/components/ui/MenCollectionPage.tsx
import { Image, Money } from '@shopify/hydrogen';
import type { MoneyV2 } from '@shopify/hydrogen/storefront-api-types';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import type { ProductItemFragment } from 'storefrontapi.generated';
import { ProductItem } from '~/components/ProductItem';

interface MenCollectionPageProps {
  collection: {
    id: string;
    handle: string;
    title: string;
    description?: string | null;
    image?: {
      id?: string;
      url: string;
      altText?: string | null;
      width?: number | null;
      height?: number | null;
    } | null;
  };
  products: ProductItemFragment[];
}

type MenGridProduct = {
  id: string;
  title: string;
  handle: string;
  vendor?: string | null;
  priceRange: {
    minVariantPrice: MoneyV2;
  };
  featuredImage?: {
    id: string;
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
};

// Filter configuration
const COLORS = [
  { name: 'Black', value: 'black', hex: '#1a1a1a' },
  { name: 'White', value: 'white', hex: '#FAFAFA' },
  { name: 'Navy', value: 'navy', hex: '#1e3a5f' },
  { name: 'Gray', value: 'gray', hex: '#8b8b8b' },
  { name: 'Brown', value: 'brown', hex: '#8B5A2B' },
  { name: 'Green', value: 'green', hex: '#3d5c3d' },
  { name: 'Beige', value: 'beige', hex: '#c8b896' },
  { name: 'Red', value: 'red', hex: '#c41e3a' },
];

const TYPES = ['All', 'T-Shirts', 'Shirts', 'Pants', 'Jackets', 'Sweaters', 'Accessories'];

export function MenCollectionPage({collection, products}: MenCollectionPageProps) {
  // Normalize products into the shape ProductGrid expects
  const gridProducts: MenGridProduct[] = products.map((p) => ({
    id: p.id,
    title: p.title,
    handle: p.handle,
    vendor: (p as any).vendor ?? null,
    priceRange: {
      minVariantPrice: p.priceRange.minVariantPrice as MoneyV2,
    },
    featuredImage: p.featuredImage
      ? {
          id: p.featuredImage.id ?? '',
          url: p.featuredImage.url,
          altText: p.featuredImage.altText ?? undefined,
          width: p.featuredImage.width ?? undefined,
          height: p.featuredImage.height ?? undefined,
        }
      : null,
  }));

  const slides = gridProducts.filter((g) => g.featuredImage);
  const loopSlides = [...slides, ...slides];
  const slideCount = slides.length;
  const startRawIndex = slideCount;
  
  // Calculate price range from products
  const allPrices = gridProducts.map(p => Number(p.priceRange?.minVariantPrice?.amount || 0));
  const minProductPrice = Math.floor(Math.min(...allPrices));
  const maxProductPrice = Math.ceil(Math.max(...allPrices));
  
  // Filter state
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState('All');
  const [priceRange, setPriceRange] = useState<[number, number]>([minProductPrice, maxProductPrice]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const vendors = Array.from(new Set(gridProducts.map((p) => p.vendor).filter(Boolean))) as string[];
  
  // Filter products based on all criteria
  const filteredProducts = gridProducts.filter((p) => {
    const price = p.priceRange?.minVariantPrice?.amount ? Number(p.priceRange.minVariantPrice.amount) : 0;
    const title = p.title.toLowerCase();
    
    // Color filter (check if product title contains the color)
    if (selectedColors.length > 0) {
      const hasColor = selectedColors.some(color => title.includes(color.toLowerCase()));
      if (!hasColor) return false;
    }
    
    // Type filter
    if (selectedType !== 'All') {
      const typeKeyword = selectedType.toLowerCase().replace('s', ''); // Remove plural
      if (!title.includes(typeKeyword)) return false;
    }
    
    // Price filter (slider)
    if (price < priceRange[0] || price > priceRange[1]) return false;
    
    // Brand filter
    if (selectedBrands.length > 0 && (!p.vendor || !selectedBrands.includes(p.vendor))) return false;
    
    return true;
  });
  
  const isPriceFiltered = priceRange[0] !== minProductPrice || priceRange[1] !== maxProductPrice;
  const activeFilterCount = selectedColors.length + (selectedType !== 'All' ? 1 : 0) + 
    (isPriceFiltered ? 1 : 0) + selectedBrands.length;

  const clearAllFilters = () => {
    setSelectedColors([]);
    setSelectedType('All');
    setPriceRange([minProductPrice, maxProductPrice]);
    setSelectedBrands([]);
  };

  const toggleColor = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  // Carousel state
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const autoplayTimer = useRef<number | null>(null);
  const currentIndexRef = useRef(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const AUTOPLAY_INTERVAL_MS = 3000;

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    const onScroll = () => {
      const inner = el.firstElementChild as HTMLElement | null;
      const children = inner ? (Array.from(inner.children) as HTMLElement[]) : [];
      const center = el.scrollLeft + el.offsetWidth / 2;
      let active = 0;
      let minDistance = Number.POSITIVE_INFINITY;

      children.forEach((child, i) => {
        const childCenter = child.offsetLeft + child.offsetWidth / 2;
        const dist = Math.abs(center - childCenter);
        if (dist < minDistance) {
          minDistance = dist;
          active = i;
        }
      });

      const raw = active;
      currentIndexRef.current = raw;
      setCurrentIndex(raw % Math.max(1, slideCount));

      if (slideCount > 1) {
        if (raw <= 0) {
          const newRaw = raw + slideCount;
          const child = children[newRaw];
          if (child) {
            el.scrollTo({left: child.offsetLeft - (el.offsetWidth - child.offsetWidth) / 2, behavior: 'auto'});
            currentIndexRef.current = newRaw;
            setCurrentIndex(newRaw % slideCount);
          }
        } else if (raw >= loopSlides.length - 1) {
          const newRaw = raw - slideCount;
          const child = children[newRaw];
          if (child) {
            el.scrollTo({left: child.offsetLeft - (el.offsetWidth - child.offsetWidth) / 2, behavior: 'auto'});
            currentIndexRef.current = newRaw;
            setCurrentIndex(newRaw % slideCount);
          }
        }
      }
    };

    el.addEventListener('scroll', onScroll, {passive: true});
    return () => el.removeEventListener('scroll', onScroll);
  }, [slides.length]);

  // Ensure the active slide is centered initially
  useEffect(() => {
    if (!carouselRef.current || slides.length === 0) return;
    currentIndexRef.current = startRawIndex;
    scrollToIndex(startRawIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.length]);

  // Autoplay: advance the carousel every AUTOPLAY_INTERVAL_MS when not paused
  useEffect(() => {
    if (!carouselRef.current || slides.length === 0) return;

    if (autoplayTimer.current) {
      clearInterval(autoplayTimer.current);
      autoplayTimer.current = null;
    }

    if (!isPaused && slideCount > 0) {
      autoplayTimer.current = window.setInterval(() => {
        const nextRaw = currentIndexRef.current + 1;
        scrollToIndex(nextRaw);
      }, AUTOPLAY_INTERVAL_MS);
    }

    return () => {
      if (autoplayTimer.current) {
        clearInterval(autoplayTimer.current);
        autoplayTimer.current = null;
      }
    };
  }, [isPaused, slides.length]);

  function scrollToIndex(i: number) {
    const el = carouselRef.current;
    if (!el) return;
    const inner = el.firstElementChild as HTMLElement | null;
    const children = inner ? (Array.from(inner.children) as HTMLElement[]) : [];
    if (children.length === 0) return;
    let rawIndex = i;
    if (i < 0) rawIndex = ((i % children.length) + children.length) % children.length;
    if (i >= children.length) rawIndex = i % children.length;
    const child = children[rawIndex];
    if (child) {
      const left = child.offsetLeft - (el.offsetWidth - child.offsetWidth) / 2;
      el.scrollTo({left, behavior: 'smooth'});
    }
  }

  return (
    <div className="min-h-screen bg-[#FDF8F7] text-[#292529]">
      {/* HERO (match Women layout) */}
      <section className="mb-10 lg:mb-14">
        <div className="relative w-full overflow-hidden bg-[#FDF8F7]">
          {collection.image && (
            <Image
              data={collection.image}
              alt={collection.image.altText || collection.title}
              className="w-full h-[320px] sm:h-[380px] lg:h-[440px] object-cover"
              sizes="100vw"
            />
          )}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#FDF8F7] via-[#FDF8F7]/70 to-transparent" />

          <div className="absolute inset-x-0 bottom-8 px-6 sm:px-10 lg:px-16">
            <div className="max-w-[1440px] mx-auto flex flex-col items-center text-center">
              <p
                className="text-[11px] tracking-[0.28em] uppercase text-[#5A4A4C]/70"
                style={{
                  fontFamily: 'Georgia, "Playfair Display SC", serif',
                }}
              >
                Men's Edit
              </p>
              <h1
                className="mt-2 text-3xl sm:text-4xl lg:text-[40px] font-semibold tracking-[0.18em] uppercase text-[#1F191A]"
                style={{fontFamily: 'Aeonik, sans-serif'}}
              >
                {collection.title || 'MEN'}
              </h1>
              <div className="mt-3 h-[2px] w-16 rounded-full bg-[#1F191A]" />
              <p
                className="mt-4 max-w-xl text-xs sm:text-sm leading-relaxed text-[#5A4A4C]"
                style={{fontFamily: 'Quicking, sans-serif'}}
              >
                {collection.description ||
                  'Edited outerwear, tailoring and essentials curated for men.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-16 pb-20">
        {/* FEATURED STRIP / CAROUSEL */}
        {slides.length > 0 && (
          <div className="mb-8">
            <div className="relative">
              <div
                ref={carouselRef}
                className="overflow-x-auto snap-x snap-mandatory scroll-smooth -mx-4 px-4 scrollbar-hide"
                role="list"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onTouchStart={() => setIsPaused(true)}
                onTouchEnd={() => setIsPaused(false)}
                onPointerDown={() => setIsPaused(true)}
                onPointerUp={() => setIsPaused(false)}
              >
                <div className="flex gap-4 sm:gap-6">
                  {loopSlides.map((p, i) => (
                    <Link
                      key={`${p.id}-${i}`}
                      to={`/products/${p.handle}`}
                      className="snap-center flex-shrink-0 w-[min(600px,calc(100vw-200px))] block"
                      role="listitem"
                    >
                      <div className="relative overflow-hidden rounded-[18px] bg-white shadow-[0_10px_35px_rgba(0,0,0,0.05)]">
                        <Image
                          data={p.featuredImage as any}
                          alt={p.title}
                          className="w-full h-[220px] sm:h-[280px] object-cover"
                          sizes="100vw"
                        />
                      </div>
                      <div className="mt-4 px-1">
                        <h3 className="text-[11px] leading-snug tracking-wide uppercase text-[#111111] line-clamp-2">
                          {p.title}
                        </h3>
                        <p className="mt-1 text-[11px] text-[#111111]">
                          <Money data={p.priceRange.minVariantPrice as any} />
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* COLLAPSIBLE FILTERS - Premium Design */}
        <div className="mb-12">
          <div className="rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            {/* Filter Header - Dark elegant toggle */}
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="w-full px-6 sm:px-8 py-5 bg-gradient-to-r from-[#2a2a2a] to-[#1a1a1a] flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 flex-shrink-0">
                  <svg 
                    className={`w-4 h-4 sm:w-5 sm:h-5 text-white transition-transform duration-300 ${filtersOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <div className="text-left">
                  {activeFilterCount > 0 ? (
                    <p className="text-sm sm:text-base font-medium text-white tracking-wide">
                      <span className="text-[#C9A962]">{activeFilterCount}</span> {activeFilterCount === 1 ? 'Filter' : 'Filters'} Active
                    </p>
                  ) : (
                    <h3 className="text-sm sm:text-lg font-light text-white tracking-[0.15em] uppercase">
                      Refine Selection
                    </h3>
                  )}
                  <p className="text-[10px] sm:text-[11px] text-white/40 mt-0.5 tracking-[0.1em] uppercase">
                    Color • Category • Price
                  </p>
                </div>
              </div>
              {activeFilterCount > 0 && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    clearAllFilters();
                  }}
                  className="px-4 sm:px-6 py-2 sm:py-2.5 bg-white text-[#1a1a1a] text-[9px] sm:text-[10px] font-semibold rounded-full hover:bg-white/90 transition-all duration-200 uppercase tracking-[0.15em] flex-shrink-0"
                >
                  Clear All
                </span>
              )}
            </button>

            {/* Collapsible Filter Content - Premium Layout */}
            <div className={`transition-all duration-500 ease-out overflow-hidden ${filtersOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="px-6 sm:px-8 py-6 sm:py-8 bg-white border-t border-[#E5E5E5]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                  
                  {/* Color Filter - Elegant swatches */}
                  <div>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-7 h-7 rounded-full bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                      </div>
                      <p className="text-[11px] font-semibold text-[#1a1a1a] uppercase tracking-[0.15em]">Color</p>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      {COLORS.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => toggleColor(color.value)}
                          className="group flex flex-col items-center gap-1.5"
                          title={color.name}
                        >
                          <div className={`relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl transition-all duration-200 ${
                            selectedColors.includes(color.value)
                              ? 'ring-2 ring-[#1a1a1a] ring-offset-2 scale-105'
                              : 'hover:scale-105'
                          }`}>
                            <span
                              className="absolute inset-0 rounded-xl"
                              style={{ 
                                backgroundColor: color.hex,
                                boxShadow: color.value === 'white' ? 'inset 0 0 0 1px rgba(0,0,0,0.1)' : 'inset 0 0 0 1px rgba(0,0,0,0.05)'
                              }}
                            />
                            {selectedColors.includes(color.value) && (
                              <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/20">
                                <svg className={`w-4 h-4 ${color.value === 'white' || color.value === 'beige' ? 'text-[#1a1a1a]' : 'text-white'}`} fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </span>
                            )}
                          </div>
                          <span className={`text-[8px] uppercase tracking-wide transition-colors ${
                            selectedColors.includes(color.value) ? 'text-[#1a1a1a] font-semibold' : 'text-[#888]'
                          }`}>
                            {color.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Type Filter - Refined pills */}
                  <div>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-7 h-7 rounded-full bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <p className="text-[11px] font-semibold text-[#1a1a1a] uppercase tracking-[0.15em]">Category</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {TYPES.map((type) => (
                        <button
                          key={type}
                          onClick={() => setSelectedType(type)}
                          className={`px-4 py-2 text-[10px] font-semibold tracking-[0.1em] uppercase rounded-full transition-all duration-200 ${
                            selectedType === type
                              ? 'bg-[#1a1a1a] text-white'
                              : 'bg-[#F3F3F3] text-[#555] hover:bg-[#E8E8E8]'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range Slider - Premium */}
                  <div>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-7 h-7 rounded-full bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-[11px] font-semibold text-[#1a1a1a] uppercase tracking-[0.15em]">Price Range</p>
                    </div>
                    
                    {/* Price Display Cards */}
                    <div className="flex items-center gap-3 mb-5">
                      <div className="flex-1 px-3 py-2.5 bg-[#F5F5F5] rounded-lg">
                        <span className="text-[8px] text-[#888] uppercase tracking-wide block">From</span>
                        <p className="text-sm font-semibold text-[#1a1a1a]">{priceRange[0].toLocaleString()} <span className="text-[9px] font-normal text-[#666]">EGP</span></p>
                      </div>
                      <div className="w-4 h-px bg-[#CCC]"></div>
                      <div className="flex-1 px-3 py-2.5 bg-[#F5F5F5] rounded-lg text-right">
                        <span className="text-[8px] text-[#888] uppercase tracking-wide block">To</span>
                        <p className="text-sm font-semibold text-[#1a1a1a]">{priceRange[1].toLocaleString()} <span className="text-[9px] font-normal text-[#666]">EGP</span></p>
                      </div>
                    </div>
                    
                    {/* Dual Range Slider */}
                    <div className="relative h-2 mt-2 mb-4 mx-1">
                      {/* Track background */}
                      <div className="absolute inset-0 bg-[#E0E0E0] rounded-full"></div>
                      {/* Active track */}
                      <div 
                        className="absolute h-full bg-[#1a1a1a] rounded-full"
                        style={{
                          left: `${((priceRange[0] - minProductPrice) / (maxProductPrice - minProductPrice)) * 100}%`,
                          right: `${100 - ((priceRange[1] - minProductPrice) / (maxProductPrice - minProductPrice)) * 100}%`
                        }}
                      ></div>
                      {/* Min slider */}
                      <input
                        type="range"
                        min={minProductPrice}
                        max={maxProductPrice}
                        step={50}
                        value={priceRange[0]}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          if (value < priceRange[1]) {
                            setPriceRange([value, priceRange[1]]);
                          }
                        }}
                        className="absolute w-full h-full appearance-none bg-transparent cursor-pointer z-10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#1a1a1a] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-all"
                      />
                      {/* Max slider */}
                      <input
                        type="range"
                        min={minProductPrice}
                        max={maxProductPrice}
                        step={50}
                        value={priceRange[1]}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          if (value > priceRange[0]) {
                            setPriceRange([priceRange[0], value]);
                          }
                        }}
                        className="absolute w-full h-full appearance-none bg-transparent cursor-pointer z-20 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#1a1a1a] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-all"
                      />
                    </div>
                    
                    {/* Price labels */}
                    <div className="flex justify-between px-1">
                      <span className="text-[9px] text-[#888] uppercase tracking-wide">{minProductPrice.toLocaleString()} EGP</span>
                      <span className="text-[9px] text-[#888] uppercase tracking-wide">{maxProductPrice.toLocaleString()} EGP</span>
                    </div>
                  </div>

                </div>

                {/* Brand Filter - If vendors exist */}
                {vendors.length > 0 && (
                  <div className="mt-10 pt-8 border-t border-[#EBEBEB]">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      </div>
                      <p className="text-[11px] font-semibold text-[#1a1a1a] uppercase tracking-[0.2em]">Brand</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {vendors.map((vendor) => (
                        <button
                          key={vendor}
                          onClick={() => toggleBrand(vendor)}
                          className={`px-5 py-3 text-[10px] font-semibold tracking-[0.15em] uppercase rounded-full transition-all duration-300 ${
                            selectedBrands.includes(vendor)
                              ? 'bg-[#1a1a1a] text-white shadow-lg'
                              : 'bg-[#F5F5F5] text-[#666] hover:bg-[#EBEBEB] hover:text-[#1a1a1a]'
                          }`}
                        >
                          {vendor}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* GRID HEADER */}
        <div ref={sentinelRef} />
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xs tracking-[0.22em] uppercase text-gray-700">
            All menswear ({filteredProducts.length} items)
          </h2>
        </div>

        {/* PRODUCT GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((p) => (
            <ProductItem key={p.id} product={p as any} />
          ))}
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">No products match your filters</p>
            <button
              onClick={clearAllFilters}
              className="px-6 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}