// app/components/ui/WomenCollectionPage.tsx
import {Image} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
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
  products: ProductType[];
}

export function WomenCollectionPage({
  collection,
  products,
}: WomenCollectionPageProps) {
  return (
    <div className="min-h-screen bg-[#FBFBFB] text-[#292929]">
      {/* HERO */}
      <section className="mb-10 lg:mb-14">
        {collection.image && (
          <div className="w-full overflow-hidden bg-[#FBFBFB]">
            <Image
              data={collection.image}
              alt={collection.image.altText || collection.title}
              className="w-full h-auto object-cover"
              sizes="100vw"
            />
          </div>
        )}

        <div className="mt-4 flex justify-between items-baseline px-2 lg:px-0">
          <h1
            className="text-xs tracking-[0.25em] uppercase text-[#292929]/70"
            style={{
              fontFamily: 'Georgia, "Playfair Display SC", serif',
            }}
          >
            WOMEN
          </h1>
          <p className="text-[11px] tracking-[0.22em] uppercase text-[#292929]/50">
            Curated pieces for everyday ease
          </p>
        </div>
      </section>

      {/* GRID */}
      <section className="px-2 lg:px-0 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10 lg:gap-x-10 lg:gap-y-16">
          <ProductGrid products={products} />
        </div>
      </section>
    </div>
  );
}
