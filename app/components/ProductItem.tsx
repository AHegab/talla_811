import { Image, Money } from '@shopify/hydrogen';
import { Link } from 'react-router';
import type {
  CollectionItemFragment,
  ProductItemFragment,
  RecommendedProductFragment,
} from 'storefrontapi.generated';
import { useVariantUrl } from '~/lib/variants';

/**
 * TALLA Premium Product Card
 * Clean, minimal design with smooth hover transitions
 */
export function ProductItem({
  product,
  loading,
}: {
  product:
    | CollectionItemFragment
    | ProductItemFragment
    | RecommendedProductFragment;
  loading?: 'eager' | 'lazy';
}) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;

  return (
    // Make each product take full width on small screens so mobile shows one item per row.
    <Link
      to={variantUrl}
      prefetch="intent"
      className="group block w-full sm:w-1/2 md:w-1/3 lg:w-1/4"
    >
      {/* Image - taller poster with overlay bookmark */}
      <div className="relative image-zoom-container aspect-poster bg-gray-100 mb-4 overflow-hidden rounded-md">
        {image ? (
          <Image
            alt={image.altText || product.title}
            aspectRatio="9/16"
            data={image}
            loading={loading}
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="image-zoom w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Bookmark icon (visual only) */}
        <span className="absolute top-2 left-2 bg-white/90 dark:bg-black/60 rounded-full p-1 shadow-sm">
          <svg className="w-4 h-4 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v16l7-5 7 5V3z" />
          </svg>
        </span>
      </div>

      {/* Product Info */}
      <div className="space-y-1">
        <h4 className="text-[11px] font-normal leading-4 text-talla-text group-hover:opacity-70 transition-opacity duration-fast line-clamp-1">
          {product.title}
        </h4>

        <div className="text-[11px] font-medium text-gray-700">
          <Money data={product.priceRange.minVariantPrice} />
        </div>
      </div>
    </Link>
  );
}
