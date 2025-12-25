// app/components/ui/ProductItem.tsx
import { Image } from '@shopify/hydrogen';
import { Link } from 'react-router';
import type {
    CollectionItemFragment,
    ProductItemFragment,
    RecommendedProductFragment,
} from 'storefrontapi.generated';
import { useVariantUrl } from '~/lib/variants';

/**
 * Zara-style product item: image, then name, then price
 */
export function ProductItem({
  product,
  loading,
  to,
  isDarkTheme,
}: {
  product:
    | CollectionItemFragment
    | ProductItemFragment
    | RecommendedProductFragment;
  loading?: 'eager' | 'lazy';
  to?: string;
  isDarkTheme?: boolean;
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
                <div className={`w-16 h-16 border border-dashed ${isDarkTheme ? 'border-gray-600' : 'border-gray-300'}`} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Text block: name under pic, price under name */}
      <div className="mt-6 px-1">
        <h4
          className="text-sm font-normal tracking-wide mb-2"
          style={{
            fontFamily: 'Aeonik, sans-serif',
            color: isDarkTheme ? '#FFFFFF' : '#000000',
            fontWeight: 400
          }}
        >
          {product.title}
        </h4>

        <p
          className="text-base font-normal"
          style={{
            fontFamily: 'Quicking, sans-serif',
            color: isDarkTheme ? '#FFFFFF' : '#000000'
          }}
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
