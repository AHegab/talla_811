import { useEffect, useState } from 'react';
import { Link } from 'react-router';

interface SimilarProduct {
  handle: string;
  title: string;
  image: string;
  price: {amount: string; currencyCode: string};
  vendor?: string;
}

interface SimilarItemsProps {
  seedImageUrl: string;
  currentProductHandle: string;
}

export function SimilarItems({
  seedImageUrl,
  currentProductHandle,
}: SimilarItemsProps) {
  const [products, setProducts] = useState<SimilarProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchSimilarItems = async () => {
      try {
        const response = await fetch('/api/search-by-image', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({imageUrl: seedImageUrl}),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch similar items');
        }

        const data = (await response.json()) as {products?: SimilarProduct[]};
        // Filter out current product and limit to 5 items
        const filtered = (data.products || [])
          .filter((p: SimilarProduct) => p.handle !== currentProductHandle)
          .slice(0, 5);

        setProducts(filtered);
      } catch (err) {
        console.error('Similar items error:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (seedImageUrl) {
      fetchSimilarItems();
    }
  }, [seedImageUrl, currentProductHandle]);

  // Don't render if loading failed or no products
  if (error || (!loading && products.length === 0)) {
    return null;
  }

  return (
    <section
      className="py-16 sm:py-20 lg:py-24"
      style={{backgroundColor: '#FFFFFF'}}
      aria-labelledby="similar-items-heading"
    >
      <div className="max-w-content mx-auto px-6 sm:px-10 lg:px-16 xl:px-20">
        <h2
          id="similar-items-heading"
          className="text-2xl sm:text-3xl lg:text-4xl font-normal tracking-tight mb-8 lg:mb-12"
          style={{
            fontFamily: 'var(--font-display)',
            color: '#292929',
            letterSpacing: '-0.02em',
          }}
        >
          Visually Similar
        </h2>

        {loading ? (
          // Skeleton Loaders
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 lg:gap-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-3 animate-pulse">
                <div
                  className="aspect-portrait"
                  style={{backgroundColor: '#E8E9EC'}}
                />
                <div
                  className="h-4 rounded"
                  style={{backgroundColor: '#E8E9EC', width: '60%'}}
                />
                <div
                  className="h-3 rounded"
                  style={{backgroundColor: '#E8E9EC', width: '40%'}}
                />
              </div>
            ))}
          </div>
        ) : (
          // Horizontal Scroll on Mobile, Grid on Desktop
          <>
            {/* Mobile: Horizontal Scroll */}
            <div className="lg:hidden flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
              {products.map((product) => (
                <Link
                  key={product.handle}
                  to={`/products/${product.handle}`}
                  className="flex-shrink-0 w-64 snap-start group block"
                >
                  <div className="space-y-3">
                    <div className="relative aspect-portrait overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-all duration-slower group-hover:scale-105 group-hover:opacity-90"
                        style={{backgroundColor: '#DDDEE2'}}
                      />
                    </div>
                    <div className="space-y-1">
                      {product.vendor && (
                        <p className="text-xs uppercase tracking-widest text-[#9A9BA3]" style={{fontFamily: 'var(--font-sans)'}}>
                          {product.vendor}
                        </p>
                      )}
                      <h3 className="text-base font-semibold line-clamp-2 uppercase text-black group-hover:text-gray-600 transition-colors duration-200" style={{fontFamily: 'var(--font-sans)'}}>
                        {product.title}
                      </h3>
                      <p className="text-sm font-medium pt-1 text-black" style={{fontFamily: 'var(--font-sans)'}}>
                        {product.price.currencyCode} {product.price.amount}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Desktop: Grid */}
              <div className="hidden lg:grid lg:grid-cols-4 xl:grid-cols-5 gap-6 lg:gap-8">
              {products.map((product) => (
                <Link
                  key={product.handle}
                  to={`/products/${product.handle}`}
                  className="group block"
                >
                  <div className="space-y-3">
                    {/* Image */}
                    <div className="aspect-portrait overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-all duration-slower group-hover:scale-105 group-hover:opacity-90"
                        style={{backgroundColor: '#DDDEE2'}}
                      />
                    </div>

                    {/* Info */}
                    <div className="space-y-1">
                      {product.vendor && (
                        <p className="text-xs uppercase tracking-widest text-[#9A9BA3]" style={{fontFamily: 'var(--font-sans)'}}>
                          {product.vendor}
                        </p>
                      )}
                      <h3 className="text-base font-normal line-clamp-2 uppercase text-black group-hover:text-gray-600 transition-colors duration-200" style={{fontFamily: 'var(--font-sans)'}}>
                        {product.title}
                      </h3>
                      <p className="text-sm font-medium pt-1 text-black" style={{fontFamily: 'var(--font-sans)'}}>
                        {product.price.currencyCode} {product.price.amount}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
