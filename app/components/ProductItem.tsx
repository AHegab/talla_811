// app/components/ui/ProductItem.tsx
import { Image, Money } from '@shopify/hydrogen';
import { Link } from 'react-router';
import type {
  CollectionItemFragment,
  ProductItemFragment,
  RecommendedProductFragment,
} from 'storefrontapi.generated';
import { useVariantUrl } from '~/lib/variants';

/**
 * Same Zara-style layout as ProductCard
 */
export function ProductItem({
  product,
  loading,
  to,
}: {
  product:
    | CollectionItemFragment
    | ProductItemFragment
    | RecommendedProductFragment;
  loading?: 'eager' | 'lazy';
  to?: string;
}) {
  const variantUrl = to || useVariantUrl(product.handle);
  const image = product.featuredImage;

  return (
    <Link to={variantUrl} prefetch="intent" className="group block h-full">
      {/* Image area (removed outer white card & shadow) */}
      <div className="mb-4">
        <div className="relative w-full bg-transparent">
          <div className="pt-[133%]" />
          <div className="absolute inset-0 flex items-center justify-center">
          {image ? (
            <Image
              alt={image.altText || product.title}
              data={image}
              loading={loading}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <div className="w-16 h-16 border border-dashed border-gray-300" />
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Text block */}
      <div className="mt-4 px-1">
        <h4 className="text-base font-semibold line-clamp-2 uppercase text-black group-hover:text-gray-600 transition-colors duration-200" style={{fontFamily: 'var(--font-sans)'}}>
          {product.title}
        </h4>

        <div className="mt-1 text-sm font-medium text-black" style={{fontFamily: 'var(--font-sans)'}}>
          <Money data={product.priceRange.minVariantPrice} />
        </div>
      </div>
    </Link>
  );
}
