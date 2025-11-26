// app/components/ui/MenCollectionPage.tsx
import { Link } from 'react-router';
import type { ProductItemFragment } from 'storefrontapi.generated';
import { ProductGrid } from '~/components/ProductGrid';

interface MenCollectionPageProps {
  collection: {
    id: string;
    handle: string;
    title: string;
    description?: string | null;
  };
  products: ProductItemFragment[];
}

export function MenCollectionPage({collection, products}: MenCollectionPageProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="mx-auto max-w-[1440px] px-6 pt-8 sm:px-10 lg:px-16">
        <nav className="flex items-center space-x-2 text-[11px] font-medium uppercase tracking-[0.18em] text-gray-600">
          <Link to="/" className="transition-colors hover:text-black">
            Home
          </Link>
          <span>/</span>
          <Link to="/collections" className="transition-colors hover:text-black">
            Collections
          </Link>
          <span>/</span>
          <span className="text-black">Men</span>
        </nav>
      </div>

      {/* Hero title */}
      <section className="mx-auto max-w-[1440px] px-6 pb-10 pt-10 sm:px-10 lg:px-16">
        <div className="text-center">
          <h1
            className="text-4xl sm:text-5xl lg:text-[52px] font-bold uppercase tracking-[0.18em] text-black"
            style={{fontFamily: 'Aeonik, sans-serif'}}
          >
            MEN
          </h1>
          <div className="mt-2 flex justify-center">
            <span className="h-[2px] w-20 bg-black" />
          </div>
          <p
            className="mt-4 text-xs sm:text-sm text-gray-600"
            style={{fontFamily: 'Quicking, sans-serif'}}
          >
            Shop our edit curated for men44
          </p>
        </div>
      </section>

      {/* Products */}
      <section className="mx-auto max-w-[1440px] px-6 pb-16 sm:px-10 lg:px-16">
        {/* Force 4 columns on large screens, 2 on tablet, 1–2 on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-x-10 gap-y-16">
          {products.map((product) => (
            <div key={product.id} className="flex flex-col">
              {/* Image “poster” */}
              <div className="bg-[#f5f5f5] p-6">
                <div className="bg-white">
                  {/* Let your existing ProductCard / ProductImage handle inner layout.
                     If you want to keep using ProductGrid + ProductCard, you can instead
                     render <ProductCard product={product} /> here. */}
                  <ProductGrid
                    products={[
                      {
                        ...product,
                        featuredImage: product.featuredImage
                          ? {
                              id: product.featuredImage.id ?? '',
                              url: product.featuredImage.url,
                              altText: product.featuredImage.altText,
                              width: product.featuredImage.width,
                              height: product.featuredImage.height,
                            }
                          : null,
                      },
                    ]}
                  />
                </div>
              </div>

              {/* Product text – left aligned like your screenshot */}
              <div className="mt-3">
                {product.title && (
                  <p
                    className="text-[11px] uppercase tracking-[0.16em] text-black"
                    style={{fontFamily: 'Aeonik, sans-serif'}}
                  >
                    {product.title}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
