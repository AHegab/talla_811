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
 * Zara-style product item: image, then name, then price
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
      {/* Image area */}
      <div className="mb-4">
        <div className="relative w-full bg-transparent">
          {/* 3:4 portrait aspect ratio */}
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

      {/* Text block: name under pic, price under name */}
      <div className="mt-9 px-1">
        <h4
          className="text-[11px] font-normal uppercase text-black tracking-wide line-clamp-2"
          style={{fontFamily: 'var(--font-sans)'}}
        >
          {product.title}
        </h4>

        <p
          className="mt-1 text-[11px] font-normal text-black"
          style={{fontFamily: 'var(--font-sans)'}}
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
