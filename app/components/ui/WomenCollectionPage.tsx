// app/components/ui/WomenCollectionPage.tsx
import {Image} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import {useEffect, useRef, useState} from 'react';
import type {ProductItemFragment} from 'storefrontapi.generated';
import {ProductGrid} from '../ProductGrid';

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
  const [currentIndex, setCurrentIndex] = useState(0);

  const slides = gridProducts.filter((g) => g.featuredImage);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    const onScroll = () => {
      const children = Array.from(el.children) as HTMLElement[];
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

      setCurrentIndex(active);
    };

    el.addEventListener('scroll', onScroll, {passive: true});
    return () => el.removeEventListener('scroll', onScroll);
  }, [slides.length]);

  function scrollToIndex(i: number) {
    const el = carouselRef.current;
    if (!el) return;
    const children = Array.from(el.children) as HTMLElement[];
    const child = children[i];
    if (child) {
      el.scrollTo({left: child.offsetLeft, behavior: 'smooth'});
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
              className="overflow-x-auto snap-x snap-mandatory scroll-smooth -mx-4 px-4 sm:-mx-8 sm:px-8"
              role="list"
            >
              <div className="flex gap-4 sm:gap-6">
                {slides.map((p, i) => (
                  <div
                    key={p.id}
                    className="snap-start flex-shrink-0 w-[min(960px,calc(100vw-64px))]"
                    role="listitem"
                  >
                    <div className="relative overflow-hidden rounded-[18px] bg-white shadow-[0_10px_35px_rgba(0,0,0,0.05)]">
                      <Image
                        data={p.featuredImage as any}
                        alt={p.title}
                        className="w-full h-[260px] sm:h-[320px] lg:h-[360px] object-cover"
                        sizes="100vw"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent px-5 pb-4 pt-10 text-left">
                        <p className="text-xs uppercase tracking-[0.2em] text-white/80">
                          Featured
                        </p>
                        <p className="mt-1 text-sm sm:text-base font-medium text-white line-clamp-2">
                          {p.title}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* arrows removed */}

            {/* Dots removed */}
          </div>
        </section>
      )}

      {/* GRID – use ProductGrid directly (it already handles columns) */}
      <section className="px-4 sm:px-8 lg:px-16 pb-20">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-5 flex items-center justify-between">
            <h2
              className="text-xs tracking-[0.22em] uppercase text-[#5A4A4C]"
              style={{fontFamily: 'Aeonik, sans-serif'}}
            >
              All womenswear
            </h2>
            <span
              className="inline-flex items-center gap-1 rounded-full border border-[#EAD4D8] bg-white/60 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[#8A6A6F]"
              style={{fontFamily: 'Quicking, sans-serif'}}
            >
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{backgroundColor: accent}}
              />
              {products.length} items
            </span>
          </div>

          {/* ProductGrid draws its own responsive grid; no extra grid wrapper */}
          <ProductGrid products={gridProducts} />
        </div>
      </section>
    </div>
  );
}
