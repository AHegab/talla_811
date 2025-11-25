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
      className={`group block h-full flex flex-col ${className}`}
    >
      {/* Image Container - Gallery-style premium frame */}
      <div className="relative flex-1 bg-white transition-all duration-500 group-hover:shadow-2xl"
           style={{
             padding: 'clamp(10px, 1.8vw, 20px)',
             border: '1px solid #E5E7EB',
             borderRadius: '8px',
             boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.03)',
             display: 'flex',
             flexDirection: 'column'
           }}>
        {/* Inner shadow frame for depth */}
        <div className="relative flex-1 overflow-hidden"
             style={{
               borderRadius: '4px',
               boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.04)'
             }}>
          {image && (
            <Image
              alt={image.altText || product.title}
              aspectRatio="9/16"
              data={image}
              loading={loading}
              sizes="(min-width: 1280px) 30vw, (min-width: 1024px) 32vw, (min-width: 768px) 33vw, 50vw"
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="px-1 pt-3 pb-1">
        {/* Product Title */}
        <h3
          className="text-sm font-sans font-normal leading-tight tracking-wide text-talla-text line-clamp-2 group-hover:opacity-70 transition-opacity duration-fast mb-1"
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
