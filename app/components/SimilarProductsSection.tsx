import { Link } from 'react-router';

export interface SimilarProduct {
  id: string;
  title: string;
  handle: string;
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
  };
  featuredImage?: {
    url: string;
    altText?: string;
  };
  tags?: string[];
}

interface SimilarProductsSectionProps {
  products: SimilarProduct[];
}

export function SimilarProductsSection({ products }: SimilarProductsSectionProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Similar Products
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {products.map((similar) => (
          <Link
            key={similar.id}
            to={`/products/${similar.handle}`}
            className="group flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-3 transition-all hover:border-gray-900 hover:shadow-md"
          >
            {similar.featuredImage && (
              <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-100">
                <img
                  src={similar.featuredImage.url}
                  alt={similar.featuredImage.altText || similar.title}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
            )}
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                {similar.title}
              </h3>
              <p className="text-sm font-semibold text-gray-900">
                {similar.priceRange.minVariantPrice.currencyCode}{' '}
                {similar.priceRange.minVariantPrice.amount}
              </p>
              {similar.tags && similar.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {similar.tags.slice(0, 2).map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
