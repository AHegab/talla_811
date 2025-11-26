import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';

type ProductType = {
  id: string;
  title: string;
  handle: string;
  vendor?: string | null;
  priceRange: {
    minVariantPrice: MoneyV2;
  };
  featuredImage?: {
    id: string;
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
};

interface ProductGridProps {
  products: ProductType[];
}

export function ProductGrid({products}: ProductGridProps) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">No products found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function ProductCard({product}: {product: ProductType}) {
  const image = product.featuredImage;

  return (
    <Link
      to={`/products/${product.handle}`}
      prefetch="intent"
      className="group block h-full"
    >
      {/* Outer light-grey block, like Zara */}
      <div className="relative w-full bg-[#f5f5f5]">
        {/* 3:4 aspect ratio (4/3 ≈ 133%) */}
        <div className="pt-[133%]" />

        {/* Centered image */}
        <div className="absolute inset-0 flex items-center justify-center">
          {image ? (
            <Image
              data={image}
              alt={image.altText || product.title}
              loading="lazy"
              sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              className="max-h-[80%] max-w-[80%] object-contain transition-transform duration-500 ease-out group-hover:scale-[1.02]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <svg
                className="w-16 h-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Text block under image */}
      <div className="mt-3 px-1">
        {/* Title */}
        <h3
          className="text-[11px] leading-snug tracking-wide uppercase text-[#111111] group-hover:opacity-70 transition-opacity line-clamp-2"
          style={{fontFamily: 'var(--font-sans)'}}
        >
          {product.title}
        </h3>

        {/* Price */}
        <p
          className="mt-1 text-[11px] text-[#111111]"
          style={{fontFamily: 'var(--font-sans)'}}
        >
          <Money data={product.priceRange.minVariantPrice} />
        </p>
      </div>
    </Link>
  );
}
