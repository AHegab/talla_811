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
    <Link
      to={variantUrl}
      prefetch="intent"
      className="group block"
    >
      {/* Image - 3:4 aspect ratio with zoom effect */}
      <div className="image-zoom-container aspect-portrait bg-gray-100 mb-4">
        {image ? (
          <Image
            alt={image.altText || product.title}
            aspectRatio="3/4"
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
      </div>

      {/* Product Info */}
      <div className="space-y-1">
        <h4 className="text-sm font-normal leading-tight tracking-wide text-talla-text group-hover:opacity-70 transition-opacity duration-fast line-clamp-2">
          {product.title}
        </h4>
        
        <div className="text-sm font-medium text-gray-600">
          <Money data={product.priceRange.minVariantPrice} />
        </div>
      </div>
    </Link>
  );
}
