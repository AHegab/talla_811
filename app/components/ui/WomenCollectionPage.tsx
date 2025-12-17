// app/components/ui/WomenCollectionPage.tsx
import { Image, Money } from '@shopify/hydrogen';
import type { MoneyV2 } from '@shopify/hydrogen/storefront-api-types';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import type { ProductItemFragment } from 'storefrontapi.generated';
import { ProductItem } from '~/components/ProductItem';

type ProductType = {
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

type CollectionType = {
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

interface WomenCollectionPageProps {
  collection: CollectionType;
  products: ProductItemFragment[];
}

// Filter configuration
const COLORS = [
  { name: 'Black', value: 'black', hex: '#000000' },
  { name: 'White', value: 'white', hex: '#FFFFFF' },
  { name: 'Navy', value: 'navy', hex: '#1B3A5F' },
  { name: 'Gray', value: 'gray', hex: '#9E9E9E' },
  { name: 'Brown', value: 'brown', hex: '#A0652A' },
  { name: 'Green', value: 'green', hex: '#2F5A1F' },
  { name: 'Beige', value: 'beige', hex: '#D4C4A8' },
  { name: 'Red', value: 'red', hex: '#C62828' },
  { name: 'Pink', value: 'pink', hex: '#EC407A' },
  { name: 'Blue', value: 'blue', hex: '#1E88E5' },
];

// Category keywords to look for in product titles/tags
const CATEGORY_KEYWORDS = [
  { name: 'Dresses', keywords: ['dress', 'gown', 'frock'] },
  { name: 'Tops', keywords: ['top', 'blouse', 'shirt', 't-shirt', 'tee', 'tank'] },
  { name: 'Bottoms', keywords: ['pant', 'trouser', 'jean', 'skirt', 'short', 'legging'] },
  { name: 'Outerwear', keywords: ['jacket', 'coat', 'blazer', 'cardigan'] },
  { name: 'Sweaters', keywords: ['sweater', 'knit', 'pullover', 'hoodie', 'sweatshirt'] },
  { name: 'Activewear', keywords: ['athletic', 'sport', 'yoga', 'gym', 'active'] },
  { name: 'Accessories', keywords: ['accessory', 'belt', 'bag', 'hat', 'scarf', 'jewelry'] },
];

export function WomenCollectionPage({
  collection,
  products,
}: WomenCollectionPageProps) {
  const gridProducts: ProductType[] = products.map((p) => ({
    id: p.id,
    title: p.title,
    handle: p.handle,
    vendor: (p as any).vendor ?? undefined,
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

  // Dynamically extract available categories from products
  const availableCategories = new Set<string>();
  gridProducts.forEach(product => {
    const title = product.title.toLowerCase();
    CATEGORY_KEYWORDS.forEach(category => {
      if (category.keywords.some(keyword => title.includes(keyword))) {
        availableCategories.add(category.name);
      }
    });
  });

  // Build dynamic TYPES array: always start with 'All', then add found categories
  const TYPES = ['All', ...Array.from(availableCategories).sort()];

  // Filter state
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState('All');
  const [priceRange, setPriceRange] = useState<[number, number]>([minProductPrice, maxProductPrice]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc'>('featured');

  // Carousel refs and state
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const autoplayTimer = useRef<number | null>(null);
  const currentIndexRef = useRef(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const AUTOPLAY_INTERVAL_MS = 3000;

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

    // Type filter - use dynamic category keywords
    if (selectedType !== 'All') {
      const categoryMatch = CATEGORY_KEYWORDS.find(cat => cat.name === selectedType);
      if (categoryMatch) {
        const hasCategory = categoryMatch.keywords.some(keyword => title.includes(keyword));
        if (!hasCategory) return false;
      }
    }

    // Price filter (slider)
    if (price < priceRange[0] || price > priceRange[1]) return false;

    // Brand filter
    if (selectedBrands.length > 0 && (!p.vendor || !selectedBrands.includes(p.vendor))) return false;

    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return Number(a.priceRange.minVariantPrice.amount) - Number(b.priceRange.minVariantPrice.amount);
      case 'price-desc':
        return Number(b.priceRange.minVariantPrice.amount) - Number(a.priceRange.minVariantPrice.amount);
      case 'name-asc':
        return a.title.localeCompare(b.title);
      case 'name-desc':
        return b.title.localeCompare(a.title);
      case 'featured':
      default:
        return 0; // Keep original order
    }
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

      // active is raw index into loopSlides
      const raw = active;
      currentIndexRef.current = raw;
      // displayed index is raw % slideCount
      setCurrentIndex(raw % Math.max(1, slideCount));

      // Reset position to the middle copy when at ends
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
    // Center current index - start at loop middle
    currentIndexRef.current = startRawIndex;
    scrollToIndex(startRawIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.length]);

  // Autoplay: advance the carousel every AUTOPLAY_INTERVAL_MS when not paused
  useEffect(() => {
    if (!carouselRef.current || slides.length === 0) return;

    // Clear any existing timer
    if (autoplayTimer.current) {
      clearInterval(autoplayTimer.current);
      autoplayTimer.current = null;
    }

    if (!isPaused && slideCount > 0) {
      autoplayTimer.current = window.setInterval(() => {
        // increment raw index
        let nextRaw = currentIndexRef.current + 1;
        // if moving past the end, prefer to keep continuity; scrollToIndex will be followed by onScroll reset
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
    let rawIndex = i;
    // wrap rawIndex into loopSlides range
    if (children.length === 0) return;
    if (i < 0) {
      rawIndex = ((i % children.length) + children.length) % children.length;
    } else if (i >= children.length) {
      rawIndex = i % children.length;
    }
    const child = children[rawIndex];
    if (child) {
      const left = child.offsetLeft - (el.offsetWidth - child.offsetWidth) / 2;
      el.scrollTo({left, behavior: 'smooth'});
    }
  }

  return (
    <div className="min-h-screen bg-[#FDF8F7] text-[#292529]">
      {/* HERO */}
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

          {/* Soft gradient + centered title */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#FDF8F7] via-[#FDF8F7]/70 to-transparent" />

          <div className="absolute inset-x-0 bottom-8 px-6 sm:px-10 lg:px-16">
            <div className="max-w-[1440px] mx-auto flex flex-col items-center text-center">
              <p
                className="text-[11px] tracking-[0.28em] uppercase text-[#5A4A4C]/70"
                style={{
                  fontFamily: 'Georgia, "Playfair Display SC", serif',
                }}
              >
                Women&apos;s Edit
              </p>
              <h1
                className="mt-2 text-3xl sm:text-4xl lg:text-[40px] font-semibold tracking-[0.18em] uppercase text-[#1F191A]"
                style={{fontFamily: 'Aeonik, sans-serif'}}
              >
                {collection.title || 'WOMEN'}
              </h1>
              <div className="mt-3 h-[2px] w-16 rounded-full bg-[#1F191A]" />
              <p
                className="mt-4 max-w-xl text-xs sm:text-sm leading-relaxed text-[#5A4A4C]"
                style={{fontFamily: 'Quicking, sans-serif'}}
              >
                {collection.description ||
                  'Soft tailoring, elevated basics, and statement pieces curated for everyday ease.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED CAROUSEL */}
      {slides.length > 0 && (
        <section className="mx-auto w-full px-4 pb-10 sm:px-8 lg:px-16">
          <div className="mx-auto max-w-[1440px] relative">
            {/* arrows – desktop only */}
            {/* arrows removed */}

            <div
              ref={carouselRef}
              className="overflow-x-auto snap-x snap-mandatory scroll-smooth -mx-4 px-4 sm:-mx-8 sm:px-8 scrollbar-hide"
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
                    className="snap-center flex-shrink-0 w-[min(840px,calc(100vw-160px))] block"
                    role="listitem"
                  >
                    <div className="relative overflow-hidden rounded-[18px] bg-white shadow-[0_10px_35px_rgba(0,0,0,0.05)]">
                      <Image
                        data={p.featuredImage as any}
                        alt={p.title}
                        className="w-full h-[260px] sm:h-[320px] lg:h-[360px] object-cover"
                        sizes="100vw"
                      />
                    </div>
                    {/* Title and price under the card like product tiles */}
                    <div className="mt-4 px-1">
                      <h3 className="text-[11px] leading-snug tracking-wide uppercase text-[#111111] group-hover:opacity-70 transition-opacity line-clamp-2" style={{ fontFamily: 'var(--font-sans)' }}>
                        {p.title}
                      </h3>
                      <p className="mt-1 text-[11px] text-[#111111]" style={{ fontFamily: 'var(--font-sans)' }}>
                        <Money data={p.priceRange.minVariantPrice as any} />
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* arrows removed */}

            {/* Dots removed */}
          </div>
        </section>
      )}

      {/* MAIN CONTENT */}
      <section className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-16 pb-20">
        {/* FILTERS - Ultra Premium Minimal Design */}
        <div className="mb-16">
          {/* Filter Toggle Bar */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="w-full group"
          >
            <div className="relative overflow-hidden bg-white border border-[#E8E9EC] rounded-xl sm:rounded-2xl transition-all duration-300 hover:border-[#C4C5CB] hover:shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 gap-2 sm:gap-4">
                {/* Left Section */}
                <div className="flex items-center gap-2 sm:gap-5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <svg
                      className={`w-4 h-4 sm:w-5 sm:h-5 text-[#292929] transition-transform duration-300 flex-shrink-0 ${filtersOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                    <span className="text-xs sm:text-sm font-medium tracking-[0.08em] uppercase text-[#292929]">
                      Filters
                    </span>
                  </div>

                  {activeFilterCount > 0 && (
                    <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 bg-[#292929] rounded-full">
                      <span className="text-xs font-semibold text-white">{activeFilterCount}</span>
                      <span className="hidden sm:inline text-[10px] text-white/70 uppercase tracking-wider">Active</span>
                    </div>
                  )}
                </div>

                {/* Right Section */}
                {activeFilterCount > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearAllFilters();
                    }}
                    className="px-3 sm:px-5 py-1.5 sm:py-2 text-[9px] sm:text-[10px] font-medium tracking-[0.08em] uppercase text-[#292929] hover:text-[#1a1a1a] border border-[#E8E9EC] rounded-full hover:border-[#292929] transition-all duration-200 whitespace-nowrap flex-shrink-0"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>
          </button>

          {/* Expanded Filter Panel */}
          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              filtersOpen ? 'max-h-[1000px] opacity-100 mt-6' : 'max-h-0 opacity-0 mt-0'
            }`}
          >
            <div className="bg-white border border-[#E8E9EC] rounded-2xl p-6 sm:p-8 lg:p-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12">

                {/* Color Filter */}
                <div className="space-y-5">
                  <h4 className="text-xs font-semibold tracking-[0.12em] uppercase text-[#292929] pb-3 border-b border-[#E8E9EC]">
                    Color
                  </h4>
                  <div className="grid grid-cols-4 gap-3.5">
                    {COLORS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => toggleColor(color.value)}
                        className="group flex flex-col items-center justify-center gap-2 transition-all bg-transparent border-0 p-0 mx-auto"
                        title={color.name}
                      >
                        <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
                          <div
                            className={`absolute inset-0 rounded-full transition-all duration-200 ${
                              selectedColors.includes(color.value)
                                ? 'ring-2 ring-[#292929] ring-offset-2 scale-105'
                                : 'group-hover:scale-105'
                            } ${
                              color.value === 'white' ? 'border border-gray-200' : ''
                            }`}
                            style={{
                              backgroundColor: color.hex
                            }}
                          />
                          {selectedColors.includes(color.value) && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <svg
                                className={`w-5 h-5 ${
                                  color.value === 'white' || color.value === 'beige'
                                    ? 'text-[#292929]'
                                    : 'text-white'
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <span className={`text-[9px] tracking-[0.05em] uppercase transition-colors text-center ${
                          selectedColors.includes(color.value)
                            ? 'text-[#292929] font-semibold'
                            : 'text-[#9A9BA3] font-medium'
                        }`}>
                          {color.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Filter */}
                <div className="space-y-5">
                  <h4 className="text-xs font-semibold tracking-[0.12em] uppercase text-[#292929] pb-3 border-b border-[#E8E9EC]">
                    Category
                  </h4>
                  <div className="flex flex-wrap gap-2.5">
                    {TYPES.map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`px-4 py-2.5 text-[10px] font-medium tracking-[0.06em] uppercase rounded-lg transition-all duration-200 ${
                          selectedType === type
                            ? 'bg-[#292929] text-white shadow-sm'
                            : 'bg-[#F5F5F5] text-[#6B6C75] hover:bg-[#E8E9EC] hover:text-[#292929]'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div className="space-y-5">
                  <h4 className="text-xs font-semibold tracking-[0.12em] uppercase text-[#292929] pb-3 border-b border-[#E8E9EC]">
                    Price Range
                  </h4>

                  <div className="space-y-6">
                    {/* Price Display */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[#FAFAFA] border border-[#E8E9EC] rounded-lg px-4 py-3">
                        <span className="block text-[9px] font-medium tracking-[0.08em] uppercase text-[#9A9BA3] mb-1">
                          Min
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-base font-semibold text-[#292929]">
                            {priceRange[0].toLocaleString()}
                          </span>
                          <span className="text-[10px] text-[#6B6C75]">EGP</span>
                        </div>
                      </div>
                      <div className="bg-[#FAFAFA] border border-[#E8E9EC] rounded-lg px-4 py-3">
                        <span className="block text-[9px] font-medium tracking-[0.08em] uppercase text-[#9A9BA3] mb-1">
                          Max
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-base font-semibold text-[#292929]">
                            {priceRange[1].toLocaleString()}
                          </span>
                          <span className="text-[10px] text-[#6B6C75]">EGP</span>
                        </div>
                      </div>
                    </div>

                    {/* Slider */}
                    <div className="relative pt-2 pb-1 px-1">
                      <div className="relative h-1.5">
                        <div className="absolute inset-0 bg-[#E8E9EC] rounded-full"></div>
                        <div
                          className="absolute h-full bg-[#292929] rounded-full"
                          style={{
                            left: `${((priceRange[0] - minProductPrice) / (maxProductPrice - minProductPrice)) * 100}%`,
                            right: `${100 - ((priceRange[1] - minProductPrice) / (maxProductPrice - minProductPrice)) * 100}%`
                          }}
                        ></div>
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
                          className="absolute w-full h-full appearance-none bg-transparent cursor-pointer z-10
                            [&::-webkit-slider-thumb]:appearance-none
                            [&::-webkit-slider-thumb]:w-4
                            [&::-webkit-slider-thumb]:h-4
                            [&::-webkit-slider-thumb]:bg-white
                            [&::-webkit-slider-thumb]:border-2
                            [&::-webkit-slider-thumb]:border-[#292929]
                            [&::-webkit-slider-thumb]:rounded-full
                            [&::-webkit-slider-thumb]:cursor-pointer
                            [&::-webkit-slider-thumb]:shadow-[0_1px_3px_rgba(0,0,0,0.12)]
                            [&::-webkit-slider-thumb]:hover:scale-125
                            [&::-webkit-slider-thumb]:transition-transform
                            [&::-moz-range-thumb]:w-4
                            [&::-moz-range-thumb]:h-4
                            [&::-moz-range-thumb]:bg-white
                            [&::-moz-range-thumb]:border-2
                            [&::-moz-range-thumb]:border-[#292929]
                            [&::-moz-range-thumb]:rounded-full
                            [&::-moz-range-thumb]:cursor-pointer
                            [&::-moz-range-thumb]:shadow-[0_1px_3px_rgba(0,0,0,0.12)]"
                        />
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
                          className="absolute w-full h-full appearance-none bg-transparent cursor-pointer z-20
                            [&::-webkit-slider-thumb]:appearance-none
                            [&::-webkit-slider-thumb]:w-4
                            [&::-webkit-slider-thumb]:h-4
                            [&::-webkit-slider-thumb]:bg-white
                            [&::-webkit-slider-thumb]:border-2
                            [&::-webkit-slider-thumb]:border-[#292929]
                            [&::-webkit-slider-thumb]:rounded-full
                            [&::-webkit-slider-thumb]:cursor-pointer
                            [&::-webkit-slider-thumb]:shadow-[0_1px_3px_rgba(0,0,0,0.12)]
                            [&::-webkit-slider-thumb]:hover:scale-125
                            [&::-webkit-slider-thumb]:transition-transform
                            [&::-moz-range-thumb]:w-4
                            [&::-moz-range-thumb]:h-4
                            [&::-moz-range-thumb]:bg-white
                            [&::-moz-range-thumb]:border-2
                            [&::-moz-range-thumb]:border-[#292929]
                            [&::-moz-range-thumb]:rounded-full
                            [&::-moz-range-thumb]:cursor-pointer
                            [&::-moz-range-thumb]:shadow-[0_1px_3px_rgba(0,0,0,0.12)]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Brand Filter - Full Width */}
              {vendors.length > 0 && (
                <div className="mt-10 pt-10 border-t border-[#E8E9EC]">
                  <h4 className="text-xs font-semibold tracking-[0.12em] uppercase text-[#292929] mb-5">
                    Brand
                  </h4>
                  <div className="flex flex-wrap gap-2.5">
                    {vendors.map((vendor) => (
                      <button
                        key={vendor}
                        onClick={() => toggleBrand(vendor)}
                        className={`px-5 py-2.5 text-[10px] font-medium tracking-[0.06em] uppercase rounded-lg transition-all duration-200 ${
                          selectedBrands.includes(vendor)
                            ? 'bg-[#292929] text-white shadow-sm'
                            : 'bg-[#F5F5F5] text-[#6B6C75] hover:bg-[#E8E9EC] hover:text-[#292929]'
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

        {/* GRID HEADER */}
        <div ref={sentinelRef} />
        <div className="mb-5 mt-16 sm:mt-20 lg:mt-32 xl:mt-40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-xs tracking-[0.22em] uppercase text-gray-700">
            All womenswear ({sortedProducts.length} items)
          </h2>

          {/* Sort Dropdown */}
          <div className="relative">
            <label htmlFor="sort-select" className="sr-only">Sort by</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none bg-white border border-[#E8E9EC] rounded-lg pl-4 pr-10 py-2.5 text-[10px] font-medium tracking-[0.06em] uppercase text-[#292929] hover:border-[#C4C5CB] focus:outline-none focus:ring-2 focus:ring-[#292929] focus:border-transparent transition-all cursor-pointer"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A-Z</option>
              <option value="name-desc">Name: Z-A</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <svg className="w-4 h-4 text-[#6B6C75]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* PRODUCT GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {sortedProducts.map((p) => (
            <ProductItem key={p.id} product={p as any} />
          ))}
        </div>

        {sortedProducts.length === 0 && (
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
