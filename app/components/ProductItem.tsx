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
      className="group product-item block h-full flex flex-col"
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
          {image ? (
            <Image
              alt={image.altText || product.title}
              aspectRatio="9/16"
              data={image}
              loading={loading}
              sizes="(min-width: 1280px) 30vw, (min-width: 1024px) 32vw, (min-width: 768px) 33vw, 50vw"
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="px-1 pt-3 pb-1">
        <h4 className="text-sm font-normal leading-tight text-talla-text group-hover:opacity-70 transition-opacity duration-fast line-clamp-2 mb-1">
          {product.title}
        </h4>

        <div className="text-sm font-medium text-talla-text/80">
          <Money data={product.priceRange.minVariantPrice} />
        </div>
      </div>
    </Link>
  );
}
