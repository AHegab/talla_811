// app/components/ui/WomenCollectionPage.tsx
import { Image, Money } from '@shopify/hydrogen';
import type { MoneyV2 } from '@shopify/hydrogen/storefront-api-types';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import type { ProductItemFragment } from 'storefrontapi.generated';
import { ProductGrid } from '../ProductGrid';
import CollectionFilters from './CollectionFilters';

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

export function WomenCollectionPage({
  collection,
  products,
}: WomenCollectionPageProps) {
  const gridProducts: ProductType[] = products.map((p) => ({
    id: p.id,
    title: p.title,
    handle: p.handle,
    vendor: (p as any).vendor ?? undefined, // optional
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

  // Carousel refs and state
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const autoplayTimer = useRef<number | null>(null);
  const currentIndexRef = useRef(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const AUTOPLAY_INTERVAL_MS = 3000;

  const slides = gridProducts.filter((g) => g.featuredImage);
  const loopSlides = [...slides, ...slides];
  const slideCount = slides.length;
  const startRawIndex = slideCount; // start in the middle copy
  const [filters, setFilters] = useState<{vendors: string[]; minPrice?: number | null; maxPrice?: number | null}>({vendors: [], minPrice: null, maxPrice: null});
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const vendors = Array.from(new Set(gridProducts.map((p) => p.vendor).filter(Boolean))) as string[];
  const filteredProducts = gridProducts.filter((p) => {
    const price = p.priceRange?.minVariantPrice?.amount ? Number(p.priceRange.minVariantPrice.amount) : 0;
    if (filters.vendors.length > 0 && (!p.vendor || !filters.vendors.includes(p.vendor))) return false;
    if (typeof filters.minPrice === 'number' && price < filters.minPrice) return false;
    if (typeof filters.maxPrice === 'number' && price > filters.maxPrice) return false;
    return true;
  });

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

  // toggle filter visibility when user scrolls past the carousel sentinel
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        setShowFilters(!entry.isIntersecting);
      },
      {threshold: 0},
    );
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, []);

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

  const accent = '#F3D5D8'; // soft blush accent

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
                    <div className="relative overflow-hidden">
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

      {/* GRID – use ProductGrid directly (it already handles columns) */}
      <div ref={sentinelRef} />
      <section className="px-4 sm:px-8 lg:px-16 pb-20">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-5 flex items-center justify-between">
            <h2
              className="text-xs tracking-[0.22em] uppercase text-[#5A4A4C]"
              style={{fontFamily: 'Aeonik, sans-serif'}}
            >
              All womenswear
            </h2>
            {/* items pill removed per request */}
          </div>

          <div className="lg:grid lg:grid-cols-[1fr,320px] gap-8">
            <div>
              {/* ProductGrid draws its own responsive grid; no extra grid wrapper */}
              <ProductGrid products={filteredProducts} />
            </div>
            <div className="hidden lg:block">
              <div className={`transition-all duration-200 ${showFilters ? 'fixed right-6 top-[110px] w-80' : 'invisible opacity-0'}`}>
                <CollectionFilters vendors={vendors} initial={{vendors: filters.vendors, minPrice: filters.minPrice ?? null, maxPrice: filters.maxPrice ?? null}} onChange={(f) => setFilters({vendors: f.vendors, minPrice: f.minPrice, maxPrice: f.maxPrice})} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
