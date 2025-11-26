// app/components/ui/ProductItem.tsx
import {Image, Money} from '@shopify/hydrogen';
import {Link} from 'react-router';
import type {
  CollectionItemFragment,
  ProductItemFragment,
  RecommendedProductFragment,
} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';

/**
 * Same Zara-style layout as ProductCard
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
      className="group block h-full"
    >
      {/* Image area */}
      <div className="relative w-full bg-[#f5f5f5]">
        <div className="pt-[133%]" />
        <div className="absolute inset-0 flex items-center justify-center">
          {image ? (
            <Image
              alt={image.altText || product.title}
              data={image}
              loading={loading}
              className="max-h-[80%] max-w-[80%] object-contain transition-transform duration-500 ease-out group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <div className="w-16 h-16 border border-dashed border-gray-300" />
            </div>
          )}
        </div>
      </div>

      {/* Text block */}
      <div className="mt-3 px-1">
        <h4
          className="text-[11px] leading-snug tracking-wide uppercase text-[#111111] group-hover:opacity-70 transition-opacity"
          style={{fontFamily: 'var(--font-sans)'}}
        >
          {product.title}
        </h4>

        <div
          className="mt-1 text-[11px] text-[#111111]"
          style={{fontFamily: 'var(--font-sans)'}}
        >
          <Money data={product.priceRange.minVariantPrice} />
        </div>
      </div>
    </Link>
  );
}
