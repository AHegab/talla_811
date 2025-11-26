// app/components/ui/ProductCard.tsx
import {Image, Money} from '@shopify/hydrogen';
import {Link} from 'react-router';
import type {
  CollectionItemFragment,
  ProductItemFragment,
  RecommendedProductFragment,
} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';

/**
 * Zara-style product card
 * Tall centered image on light background, title + price below
 */
export function ProductCard({
  product,
  loading,
  className = '',
}: {
  product:
    | CollectionItemFragment
    | ProductItemFragment
    | RecommendedProductFragment;
  loading?: 'eager' | 'lazy';
  className?: string;
}) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;

  return (
    <Link
      to={variantUrl}
      prefetch="intent"
      className={`group block h-full ${className}`}
    >
      {/* Image area: light grey background, centered product, 3:4 ratio */}
      <div className="relative w-full bg-[#f5f5f5]">
        {/* aspect-ratio shim: 4/3 ≈ 133% */}
        <div className="pt-[133%]" />
        <div className="absolute inset-0 flex items-center justify-center">
          {image && (
            <Image
              alt={image.altText || product.title}
              data={image}
              loading={loading}
              sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              className="max-h-[80%] max-w-[80%] object-contain transition-transform duration-500 ease-out group-hover:scale-[1.02]"
            />
          )}
        </div>
      </div>

      {/* Text block – title then price, like the screenshot */}
      <div className="mt-3 px-1">
        <h3
          className="text-[11px] leading-snug tracking-wide uppercase text-[#111111] group-hover:opacity-70 transition-opacity"
          style={{fontFamily: 'var(--font-sans)'}}
        >
          {product.title}
        </h3>

        <p
          className="mt-1 text-[11px] text-[#111111]"
          style={{fontFamily: 'var(--font-sans)'}}
        >
          <Money data={product.priceRange.minVariantPrice} />
        </p>
      </div>
    </Link>
  );
}

/**
 * Product Grid Container – 4 per row on large screens
 */
export function ProductGrid({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`grid gap-y-12 gap-x-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ${className}`}
    >
      {children}
    </div>
  );
}
