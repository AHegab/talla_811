// app/components/ui/MenCollectionPage.tsx
import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import {useEffect, useRef, useState} from 'react';
import type {ProductItemFragment} from 'storefrontapi.generated';
import {ProductGrid} from '~/components/ProductGrid';

interface MenCollectionPageProps {
  collection: {
    id: string;
    handle: string;
    title: string;
    description?: string | null;
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

  // Carousel state
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

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

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#111111]">
      {/* Breadcrumb (aligned right) */}
      <div className="mx-auto max-w-[1440px] px-6 pt-8 sm:px-10 lg:px-16 flex justify-end">
        <nav className="flex items-center space-x-2 text-[11px] font-medium uppercase tracking-[0.18em] text-gray-600 text-right">
          <Link to="/" className="transition-colors hover:text-black">
            Home
          </Link>
          <span>/</span>
          <Link to="/collections" className="transition-colors hover:text-black">
            Collections
          </Link>
          <span>/</span>
          <span className="text-black">Men</span>
        </nav>
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-[1440px] px-6 pb-8 pt-10 sm:px-10 lg:px-16">
        <div className="text-center">
          <h1
            className="text-4xl sm:text-5xl lg:text-[52px] font-bold uppercase tracking-[0.18em] text-[#111111]"
            style={{fontFamily: 'Aeonik, sans-serif'}}
          >
            MEN
          </h1>
          <div className="mt-3 flex justify-center">
            <span className="h-[2px] w-24 bg-[#111111]" />
          </div>
          <p
            className="mt-4 text-xs sm:text-sm text-gray-600"
            style={{fontFamily: 'Quicking, sans-serif'}}
          >
            Edited outerwear, tailoring and essentials curated for men.
          </p>
        </div>
      </section>

      {/* FEATURED STRIP / CAROUSEL */}
      {slides.length > 0 && (
        <section className="mx-auto w-full px-4 pb-10 sm:px-8 lg:px-16">
          <div className="mx-auto max-w-[1440px] relative">
            {/* arrows removed */}

            <div
              ref={carouselRef}
              className="overflow-x-auto snap-x snap-mandatory scroll-smooth -mx-4 px-4 sm:-mx-8 sm:px-8"
              role="list"
            >
              <div className="flex gap-4 sm:gap-6">
                {slides.slice(0, 8).map((p) => (
                  <div
                    key={p.id}
                    className="snap-start flex-shrink-0 w-[min(960px,calc(100vw-64px))]"
                    role="listitem"
                  >
                    <div className="relative overflow-hidden rounded-[16px] bg-[#111111]">
                      <Image
                        data={p.featuredImage as any}
                        alt={p.title}
                        className="w-full h-[260px] sm:h-[320px] lg:h-[360px] object-cover opacity-[0.96]"
                        sizes="100vw"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent px-5 pb-4 pt-10 text-left">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-gray-200/80">
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

            {/* dots removed */}
          </div>
        </section>
      )}

      {/* GRID */}
      <section className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-16 pb-20">
        <div className="mb-5 flex items-center justify-between">
          <h2
            className="text-xs tracking-[0.22em] uppercase text-gray-700"
            style={{fontFamily: 'Aeonik, sans-serif'}}
          >
            All menswear
          </h2>
          <span className="text-[11px] tracking-[0.18em] uppercase text-gray-500">
            {products.length} items
          </span>
        </div>

        {/* ProductGrid already handles the responsive columns */}
        <ProductGrid products={gridProducts} />
      </section>
    </div>
  );
}
