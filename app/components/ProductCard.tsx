// app/components/ProductCard.tsx
import { Image } from '@shopify/hydrogen';
import { Link } from 'react-router';
import type {
  CollectionItemFragment,
  ProductItemFragment,
  RecommendedProductFragment,
} from 'storefrontapi.generated';
import { useVariantUrl } from '~/lib/variants';

/**
 * Shared Zara-style product card:
 * full image, then small name, then small price (same font).
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
      {/* Image area: 3:4 portrait aspect ratio */}
      <div className="relative w-full bg-[#f5f5f5]">
        {/* aspect-ratio shim (4/3 = 133%) */}
        <div className="pt-[133%]" />
        <div className="absolute inset-0">
          {image ? (
            <Image
              alt={image.altText || product.title}
              data={image}
              loading={loading}
              sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <div className="w-16 h-16 border border-dashed border-gray-300" />
            </div>
          )}
        </div>
      </div>

      {/* Text block – title then price under the image */}
      <div className="mt-4 px-1">
        <h3
          className="text-[11px] font-normal uppercase text-black tracking-wide line-clamp-2"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          {product.title}
        </h3>
        <p
          className="mt-1 text-[11px] font-normal text-black"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          {new Intl.NumberFormat('en-EG', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(parseFloat(product.priceRange.minVariantPrice.amount))}{' '}
          {product.priceRange.minVariantPrice.currencyCode}
        </p>
      </div>
    </Link>
  );
}
