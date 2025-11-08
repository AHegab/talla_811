import {redirect, useLoaderData, Link} from 'react-router';
import type {Route} from './+types/collections.$handle';
import {getPaginationVariables, Analytics} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {ProductGrid} from '~/components/ProductGrid';
import type {ProductItemFragment} from 'storefrontapi.generated';
import {useState} from 'react';

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: `Hydrogen | ${data?.collection.title ?? ''} Collection`}];
};

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 8,
  });

  if (!handle) {
    throw redirect('/collections');
  }

  const [{collection}] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {handle, ...paginationVariables},
      // Add other queries here, so that they are loaded in parallel
    }),
  ]);

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {
      status: 404,
    });
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: collection});

  return {
    collection,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function Collection() {
  const {collection} = useLoaderData<typeof loader>();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState('featured');

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-16 xl:px-20 py-6">
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          <Link to="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link to="/collections" className="hover:text-black transition-colors">
            Collections
          </Link>
          <span>/</span>
          <span className="text-black">{collection.title}</span>
        </nav>
      </div>

      {/* Header with Title and Controls */}
      <div className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-16 xl:px-20 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          {/* Title */}
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight mb-2" style={{ fontFamily: 'Georgia, serif' }}>
              {collection.title}
            </h1>
            {collection.description && (
              <p className="text-gray-600 max-w-2xl">{collection.description}</p>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-300 text-sm font-medium uppercase tracking-wider hover:border-black hover:shadow-md transition-all duration-200 active:scale-95 overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
              <svg className="relative z-10 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="relative z-10">Filters</span>
            </button>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-6 py-3 rounded-xl border-2 border-gray-300 bg-white text-sm font-medium uppercase tracking-wider cursor-pointer hover:border-black hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black/20"
            >
              <option value="featured">Featured</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
              <option value="newest">Newest</option>
              <option value="best-selling">Best Selling</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filters Drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 transition-opacity"
            onClick={() => setFiltersOpen(false)}
          />
          
          {/* Drawer */}
          <div className="absolute inset-y-0 left-0 max-w-md w-full bg-white shadow-xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold uppercase tracking-wider">Filters</h2>
              <button
                onClick={() => setFiltersOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close filters"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Filter Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Size Filter */}
              <FilterSection title="Size">
                <div className="grid grid-cols-4 gap-2">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'].map((size) => (
                    <button
                      key={size}
                      className="group relative py-2 px-3 rounded-xl border-2 border-gray-300 text-sm font-medium hover:border-black hover:bg-black hover:text-white transition-all duration-200 overflow-hidden active:scale-95"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                      <span className="relative z-10">{size}</span>
                    </button>
                  ))}
                </div>
              </FilterSection>

              {/* Color Filter */}
              <FilterSection title="Color">
                <div className="grid grid-cols-6 gap-3">
                  {[
                    { name: 'Black', color: '#000000' },
                    { name: 'White', color: '#FFFFFF' },
                    { name: 'Gray', color: '#9CA3AF' },
                    { name: 'Beige', color: '#D4C5B9' },
                    { name: 'Navy', color: '#1E3A8A' },
                    { name: 'Green', color: '#065F46' },
                  ].map((color) => (
                    <button
                      key={color.name}
                      className="group relative w-12 h-12 rounded-full border-2 border-gray-300 hover:border-black hover:scale-110 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md"
                      style={{ backgroundColor: color.color }}
                      aria-label={color.name}
                      title={color.name}
                    >
                      <span className="absolute inset-0 rounded-full ring-2 ring-transparent group-hover:ring-black/20 transition-all duration-200"></span>
                    </button>
                  ))}
                </div>
              </FilterSection>

              {/* Brand Filter */}
              <FilterSection title="Brand">
                <div className="space-y-3">
                  {['All Brands', 'Designer A', 'Designer B', 'Designer C', 'Designer D'].map((brand) => (
                    <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        className="w-4 h-4 border-gray-300 rounded text-black focus:ring-black"
                      />
                      <span className="text-sm group-hover:text-black transition-colors">{brand}</span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              {/* Price Filter */}
              <FilterSection title="Price Range">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      placeholder="Min"
                      className="flex-1 px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black"
                    />
                    <span className="text-gray-500">—</span>
                    <input
                      type="number"
                      placeholder="Max"
                      className="flex-1 px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black"
                    />
                  </div>
                  <div className="space-y-2">
                    {['Under $50', '$50 - $100', '$100 - $200', '$200+'].map((range) => (
                      <label key={range} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="radio"
                          name="price"
                          className="w-4 h-4 border-gray-300 text-black focus:ring-black"
                        />
                        <span className="text-sm group-hover:text-black transition-colors">{range}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </FilterSection>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setFiltersOpen(false)}
                className="flex-1 py-3 rounded-xl border-2 border-gray-300 text-sm font-semibold uppercase tracking-wider hover:bg-gray-50 hover:border-black transition-all duration-200 active:scale-95"
              >
                Clear All
              </button>
              <button
                onClick={() => setFiltersOpen(false)}
                className="group relative flex-1 py-3 rounded-xl bg-black text-white text-sm font-semibold uppercase tracking-wider hover:bg-gray-900 hover:shadow-lg transition-all duration-200 active:scale-95 overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                <span className="relative z-10">Apply</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid with Pagination */}
      <div className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-16 xl:px-20 pb-16">
        <PaginatedResourceSection<ProductItemFragment>
          connection={collection.products}
          resourcesClassName="space-y-12"
        >
          {({node: product, index}) => {
            // Render ProductGrid for the first item with all products
            if (index === 0) {
              return (
                <ProductGrid 
                  products={collection.products.nodes} 
                  key="product-grid"
                />
              );
            }
            return null;
          }}
        </PaginatedResourceSection>
      </div>

      <Analytics.CollectionView
        data={{
          collection: {
            id: collection.id,
            handle: collection.handle,
          },
        }}
      />
    </div>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItemCollection on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItemCollection on Product {
    id
    handle
    title
    vendor
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyProductItemCollection
      }
      maxVariantPrice {
        ...MoneyProductItemCollection
      }
    }
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/2022-04/objects/collection
const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
      ) {
        nodes {
          ...ProductItemCollection
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
` as const;
