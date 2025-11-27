import { Money } from '@shopify/hydrogen';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';

interface SimilarProduct {
  handle: string;
  title: string;
  image: string;
  price: {amount: string; currencyCode: string};
  vendor?: string;
  tags?: string[];
}

interface SimilarItemsProps {
  seedImageUrl: string;
  currentProductHandle: string;
  currentProductTags?: string[] | null;
  vendor?: string | null;
  productType?: string | null;
}

export function SimilarItems({
  seedImageUrl,
  currentProductHandle,
  currentProductTags,
  vendor,
  productType,
}: SimilarItemsProps) {
  const [products, setProducts] = useState<SimilarProduct[]>([]);
  const [usedFallback, setUsedFallback] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchSimilarItems = async () => {
      try {
        const response = await fetch('/api/search-by-image', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            imageUrl: seedImageUrl,
            tags: currentProductTags,
            currentHandle: currentProductHandle,
            vendor,
            productType,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch similar items');
        }

        const data = (await response.json()) as {products?: SimilarProduct[]; meta?: any};
        // If the server used fallback (vendor/productType/1-tag), don't apply strict
        // tag filtering on the client; otherwise, enforce tag >= 2 overlap (or exact)
        let filtered = (data.products || []).filter((p: SimilarProduct) => p.handle !== currentProductHandle);

        const usedFallbackFlag = !!data.meta?.usedFallback;
        if (!usedFallbackFlag) {
          // The server did not use fallback, so enforce tag-overlap locally as a safety net.
          filtered = filtered.filter((p: SimilarProduct) => {
            if (!currentProductTags || currentProductTags.length === 0) return false;
            const overlap = p.tags?.filter((t) => currentProductTags.includes(t)) ?? [];
            const required = currentProductTags.length >= 2 ? 2 : currentProductTags.length;
            return overlap.length >= required;
          });
        }
        filtered = filtered.slice(0, 5);

        setProducts(filtered);
        setUsedFallback(!!data.meta?.usedFallback);
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
  }, [seedImageUrl, currentProductHandle, currentProductTags, vendor, productType]);

  // Render a placeholder when no products were found
  if (error || (!loading && products.length === 0)) {
    return (
      <section className="py-8 sm:py-10">
        <div className="max-w-content mx-auto px-6 sm:px-10 lg:px-16 xl:px-20">
          <h2 className="text-lg font-semibold mb-3">Visually Similar</h2>
          {!loading && !error && (
            <div className="p-4 rounded bg-gray-50 text-gray-500 text-sm">No similar items found</div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section
      className="py-16 sm:py-20 lg:py-24"
      style={{backgroundColor: '#FFFFFF'}}
      aria-labelledby="similar-items-heading"
    >
      <div className="max-w-content mx-auto px-6 sm:px-10 lg:px-16 xl:px-20">
          <div className="flex items-center justify-between">
            <h2
          id="similar-items-heading"
          className="text-xl sm:text-2xl font-normal tracking-tight mb-6 lg:mb-10"
          style={{
            fontFamily: 'var(--font-display)',
            color: '#292929',
            letterSpacing: '-0.02em',
          }}
        >
          Visually Similar
            </h2>
            {usedFallback && (
              <div className="text-xs text-gray-500">Showing results from fallback search</div>
            )}
          </div>

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
            <div className="lg:hidden flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
              {products.map((product) => (
                <Link
                  key={product.handle}
                  to={`/products/${product.handle}`}
                  className="flex-shrink-0 w-56 snap-start group block"
                >
                  <div className="space-y-3">
                    <div className="relative aspect-portrait overflow-hidden bg-white rounded-[8px] shadow-[0_6px_18px_rgba(0,0,0,0.04)] p-4">
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
                        <p className="text-[10px] uppercase tracking-widest text-[#9A9BA3]" style={{fontFamily: 'var(--font-sans)'}}>
                          {product.vendor}
                        </p>
                      )}
                      <h3 className="text-sm font-semibold line-clamp-2 text-black group-hover:text-gray-600 transition-colors duration-200" style={{fontFamily: 'var(--font-sans)'}}>
                        {product.title}
                      </h3>
                      <p className="text-sm font-medium pt-1 text-black" style={{fontFamily: 'var(--font-sans)'}}>
                        <Money data={{amount: product.price.amount, currencyCode: product.price.currencyCode as any}} />
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Desktop: Grid */}
              <div className="hidden lg:grid lg:grid-cols-5 gap-6 lg:gap-8">
              {products.map((product) => (
                <Link
                  key={product.handle}
                  to={`/products/${product.handle}`}
                  className="group block"
                >
                  <div className="space-y-3">
                    {/* Image */}
                      <div className="aspect-portrait overflow-hidden bg-white rounded-[8px] shadow-[0_6px_18px_rgba(0,0,0,0.04)] p-4">
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
                        <p className="text-[10px] uppercase tracking-widest text-[#9A9BA3]" style={{fontFamily: 'var(--font-sans)'}}>
                          {product.vendor}
                        </p>
                      )}
                      <h3 className="text-sm font-semibold line-clamp-2 text-black group-hover:text-gray-600 transition-colors duration-200" style={{fontFamily: 'var(--font-sans)'}}>
                        {product.title}
                      </h3>
                      <p className="text-sm font-medium pt-1 text-black" style={{fontFamily: 'var(--font-sans)'}}>
                        <Money data={{amount: product.price.amount, currencyCode: product.price.currencyCode as any}} />
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
