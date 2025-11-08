/**
 * TALLA Premium Product Card
 * 
 * Features:
 * - 3:4 aspect ratio for product images
 * - Smooth hover transitions
 * - Clean typography using brand fonts
 * - Minimal design with focus on imagery
 */

import { Image, Money } from '@shopify/hydrogen';
import { Link } from 'react-router';
import type {
    CollectionItemFragment,
    ProductItemFragment,
    RecommendedProductFragment,
} from 'storefrontapi.generated';
import { useVariantUrl } from '~/lib/variants';

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
      className={`group block ${className}`}
    >
      {/* Image Container with 3:4 aspect ratio */}
      <div className="relative overflow-hidden bg-gray-50 mb-3 sm:mb-4">
        <div className="aspect-portrait">
          {image && (
            <Image
              alt={image.altText || product.title}
              aspectRatio="3/4"
              data={image}
              loading={loading}
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              className="w-full h-full object-cover transition-all duration-slow group-hover:scale-105"
            />
          )}
        </div>
        
        {/* Quick view overlay (optional - can be added later) */}
        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-base pointer-events-none" />
      </div>

      {/* Product Info */}
      <div className="space-y-1">
        {/* Product Title */}
        <h3 
          className="text-sm font-sans font-normal leading-tight tracking-wide text-talla-text line-clamp-2 group-hover:opacity-70 transition-opacity duration-fast"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          {product.title}
        </h3>

        {/* Price */}
        <p 
          className="text-sm font-medium text-talla-text/80"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          <Money data={product.priceRange.minVariantPrice} />
        </p>
      </div>
    </Link>
  );
}

/**
 * Product Grid Container
 * Responsive grid that adjusts columns based on screen size
 */
export function ProductGrid({ 
  children,
  className = '' 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`grid-products ${className}`}>
      {children}
    </div>
  );
}
