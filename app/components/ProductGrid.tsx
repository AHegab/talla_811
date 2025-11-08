import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import {useState} from 'react';
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
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function ProductCard({product}: {product: ProductType}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/products/${product.handle}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden mb-4">
          {product.featuredImage ? (
            <Image
              data={product.featuredImage}
              alt={product.featuredImage.altText || product.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(min-width: 1024px) 33vw, 50vw"
              loading="lazy"
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

          {/* Quick View Button - Shows on Hover */}
          <div
            className={`absolute inset-x-0 bottom-0 p-4 transition-all duration-300 ${
              isHovered
                ? 'translate-y-0 opacity-100'
                : 'translate-y-4 opacity-0'
            }`}
          >
            <button
              type="button"
              className="w-full bg-white text-black py-3 px-6 text-sm font-semibold uppercase tracking-wider hover:bg-gray-100 transition-colors duration-200 shadow-lg"
              onClick={(e) => {
                e.preventDefault();
                // Quick view functionality can be added here
                window.location.href = `/products/${product.handle}`;
              }}
            >
              Quick View
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-1">
          {/* Brand Name */}
          {product.vendor && (
            <p className="text-xs uppercase tracking-widest text-gray-500">
              {product.vendor}
            </p>
          )}

          {/* Product Title */}
          <h3 className="text-base font-normal text-black group-hover:text-gray-600 transition-colors duration-200 line-clamp-2">
            {product.title}
          </h3>

          {/* Price */}
          <div className="pt-1">
            <Money
              data={product.priceRange.minVariantPrice}
              className="text-sm font-medium text-black"
            />
          </div>
        </div>
      </Link>
    </div>
  );
}
