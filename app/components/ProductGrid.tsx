import type { MoneyV2 } from '@shopify/hydrogen/storefront-api-types';
import { ProductCard as SharedProductCard } from '~/components/ProductCard';

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
        <SharedProductCard key={product.id} product={product as any} />
      ))}
    </div>
  );
}

// Use shared ProductCard from components for consistent UI

