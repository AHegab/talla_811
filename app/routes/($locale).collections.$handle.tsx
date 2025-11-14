import type {Route} from './+types/collections.$handle';

import {redirect} from '@shopify/remix-oxygen';
import {Link, useLoaderData} from '@remix-run/react';
import {getPaginationVariables, Analytics} from '@shopify/hydrogen';
import {useState, type ReactNode} from 'react';

import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {ProductGrid} from '~/components/ProductGrid';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import type {ProductItemFragment} from 'storefrontapi.generated';

export const meta: Route.MetaFunction = ({data}) => {
  const title = data?.collection?.title ?? 'Collection';
  return [
    {
      title: `TALLA | ${title}`,
    },
    {
      name: 'description',
      content: `Explore the ${title} selection on TALLA – curated premium fashion from local and regional brands.`,
    },
  ];
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Critical data: collection + products (above-the-fold).
 */
async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw redirect('/collections');
  }

  const paginationVariables = getPaginationVariables(request, {
    pageBy: 8,
  });

  const [{collection}] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {handle, ...paginationVariables},
    }),
  ]);

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {
      status: 404,
    });
  }

  // Might throw a redirect if the handle should be localized
  redirectIfHandleIsLocalized(request, {handle, data: collection});

  return {
    collection,
  };
}

/**
 * Deferred data: below-the-fold extras (safe to fail).
 */
function loadDeferredData({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  context,
}: Route.LoaderArgs) {
  // Add non-critical queries here later (e.g. recommendations, editorial content)
  return {};
}

export default function Collection() {
  const {collection} = useLoaderData<typeof loader>();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-low-high' | 'price-high-low' | 'newest' | 'best-selling'>('featured');

  const products = collection.products?.nodes ?? [];

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="mx-auto max-w-[1920px] px-6 py-6 sm:px-8 lg:px-16 xl:px-20">
        <nav className="flex items-center space-x-2 text-xs font-medium uppercase tracking-[0.18em] text-gray-600">
          <Link to="/" className="transition-colors hover:text-black">
            Home
          </Link>
          <span>/</span>
          <Link
            to="/collections"
            className="transition-colors hover:text-black"
          >
            Collections
          </Link>
          <span>/</span>
          <span className="text-black">{collection.title}</span>
        </nav>
      </div>

      {/* Header with title + controls */}
      <div className="mx-auto max-w-[1920px] px-6 pb-8 sm:px-8 lg:px-16 xl:px-20">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          {/* Title + description */}
          <div>
            <h1
              className="mb-2 text-3xl font-light tracking-tight text-black sm:text-4xl lg:text-5xl"
              style={{fontFamily: 'Georgia, serif'}}
            >
              {collection.title}
            </h1>
            {collection.description && (
              <p className="max-w-2xl text-sm text-gray-600">
                {collection.description}
              </p>
            )}
          </div>

          {/* Filters + sort */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl border-2 border-gray-300 px-6 py-3 text-xs font-medium uppercase tracking-[0.18em] transition-all duration-200 hover:border-black hover:shadow-md active:scale-95"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-gray-100 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <svg
                className="relative z-10 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              <span className="relative z-10">Filters</span>
            </button>

            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as typeof sortBy)
              }
              className="cursor-pointer rounded-xl border-2 border-gray-300 bg-white px-6 py-3 text-xs font-medium uppercase tracking-[0.18em] transition-all duration-200 hover:border-black hover:shadow-md focus:outline-none focus:ring-2 focus:ring-black/20"
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

      {/* Filters Drawer (visual only for now) */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <button
            type="button"
            className="absolute inset-0 bg-black/30 transition-opacity"
            onClick={() => setFiltersOpen(false)}
            aria-label="Close filters"
          />

          {/* Drawer */}
          <div className="absolute inset-y-0 left-0 flex w-full max-w-md flex-col bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-6">
              <h2 className="text-base font-semibold uppercase tracking-[0.18em]">
                Filters
              </h2>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                aria-label="Close filters"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Filter Content (UX shell for now) */}
            <div className="flex-1 space-y-8 overflow-y-auto p-6">
              {/* Size Filter */}
              <FilterSection title="Size">
                <div className="grid grid-cols-4 gap-2">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'].map(
                    (size) => (
                      <button
                        key={size}
                        type="button"
                        className="group relative overflow-hidden rounded-xl border-2 border-gray-300 px-3 py-2 text-sm font-medium transition-all duration-200 hover:border-black hover:bg-black hover:text-white active:scale-95"
                      >
                        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                        <span className="relative z-10">{size}</span>
                      </button>
                    ),
                  )}
                </div>
              </FilterSection>

              {/* Color Filter */}
              <FilterSection title="Color">
                <div className="grid grid-cols-6 gap-3">
                  {[
                    {name: 'Black', color: '#000000'},
                    {name: 'White', color: '#FFFFFF'},
                    {name: 'Gray', color: '#9CA3AF'},
                    {name: 'Beige', color: '#D4C5B9'},
                    {name: 'Navy', color: '#1E3A8A'},
                    {name: 'Green', color: '#065F46'},
                  ].map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      className="group relative h-12 w-12 rounded-full border-2 border-gray-300 shadow-sm transition-all duration-200 hover:scale-110 hover:border-black hover:shadow-md active:scale-95"
                      style={{backgroundColor: color.color}}
                      aria-label={color.name}
                      title={color.name}
                    >
                      <span className="absolute inset-0 rounded-full ring-2 ring-transparent transition-all duration-200 group-hover:ring-black/20" />
                    </button>
                  ))}
                </div>
              </FilterSection>

              {/* Brand Filter */}
              <FilterSection title="Brand">
                <div className="space-y-3">
                  {[
                    'All Brands',
                    'Designer A',
                    'Designer B',
                    'Designer C',
                    'Designer D',
                  ].map((brand) => (
                    <label
                      key={brand}
                      className="group flex cursor-pointer items-center gap-3"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                      />
                      <span className="text-sm transition-colors group-hover:text-black">
                        {brand}
                      </span>
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
                      className="flex-1 border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                    />
                    <span className="text-gray-500">—</span>
                    <input
                      type="number"
                      placeholder="Max"
                      className="flex-1 border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    {['Under $50', '$50 - $100', '$100 - $200', '$200+'].map(
                      (range) => (
                        <label
                          key={range}
                          className="group flex cursor-pointer items-center gap-3"
                        >
                          <input
                            type="radio"
                            name="price"
                            className="h-4 w-4 border-gray-300 text-black focus:ring-black"
                          />
                          <span className="text-sm transition-colors group-hover:text-black">
                            {range}
                          </span>
                        </label>
                      ),
                    )}
                  </div>
                </div>
              </FilterSection>
            </div>

            {/* Footer */}
            <div className="flex gap-3 border-t border-gray-200 p-6">
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="flex-1 rounded-xl border-2 border-gray-300 py-3 text-xs font-semibold uppercase tracking-[0.18em] transition-all duration-200 hover:border-black hover:bg-gray-50 active:scale-95"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="group relative flex-1 overflow-hidden rounded-xl bg-black py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-all duration-200 hover:bg-gray-900 hover:shadow-lg active:scale-95"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <span className="relative z-10">Apply</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid + Pagination */}
      <div className="mx-auto max-w-[1920px] px-6 pb-16 sm:px-8 lg:px-16 xl:px-20">
        <PaginatedResourceSection<ProductItemFragment>
          connection={collection.products}
          resourcesClassName="space-y-12"
        >
          {({node: _product, index}) => {
            // Render a single ProductGrid for the first node using all products
            if (index === 0) {
              return (
                <ProductGrid
                  key="product-grid"
                  products={products}
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
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-[0.18em]">
        {title}
      </h3>
      {children}
    </section>
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
        first: $first
        last: $last
        before: $startCursor
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
