import type { Route } from './+types/collections.$handle';

import { Link, useLoaderData, useSearchParams, useNavigate } from '@remix-run/react';
import { Analytics, getPaginationVariables } from '@shopify/hydrogen';
import { redirect } from '@shopify/remix-oxygen';
import { useState, useEffect, type ReactNode } from 'react';

import type { ProductItemFragment } from 'storefrontapi.generated';
import { PaginatedResourceSection } from '~/components/PaginatedResourceSection';
import { ProductItem } from '~/components/ProductItem';
import { ProductGrid } from '~/components/ui';
import { redirectIfHandleIsLocalized } from '~/lib/redirect';

// Filter types
interface FilterState {
  sizes: string[];
  colors: string[];
  brands: string[];
  priceMin: string;
  priceMax: string;
  priceRange: string;
}

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
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-low-high' | 'price-high-low' | 'newest' | 'best-selling'>('featured');

  // Initialize filters from URL params
  const [filters, setFilters] = useState<FilterState>({
    sizes: searchParams.get('sizes')?.split(',').filter(Boolean) ?? [],
    colors: searchParams.get('colors')?.split(',').filter(Boolean) ?? [],
    brands: searchParams.get('brands')?.split(',').filter(Boolean) ?? [],
    priceMin: searchParams.get('priceMin') ?? '',
    priceMax: searchParams.get('priceMax') ?? '',
    priceRange: searchParams.get('priceRange') ?? '',
  });

  const products = collection.products?.nodes ?? [];
  const isMenCollection = collection.handle === 'men';
  const isWomenCollection = collection.handle === 'women';

  const accentColor = isWomenCollection ? '#00F4D2' : '#000000';

  // Update URL when filters change
  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updated = {...filters, ...newFilters};
    setFilters(updated);

    // Build URL params
    const params = new URLSearchParams();
    if (updated.sizes.length) params.set('sizes', updated.sizes.join(','));
    if (updated.colors.length) params.set('colors', updated.colors.join(','));
    if (updated.brands.length) params.set('brands', updated.brands.join(','));
    if (updated.priceMin) params.set('priceMin', updated.priceMin);
    if (updated.priceMax) params.set('priceMax', updated.priceMax);
    if (updated.priceRange) params.set('priceRange', updated.priceRange);

    setSearchParams(params, {replace: true});
  };

  // Toggle array filter (size, color, brand)
  const toggleFilter = (type: 'sizes' | 'colors' | 'brands', value: string) => {
    const current = filters[type];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    updateFilters({[type]: updated});
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      sizes: [],
      colors: [],
      brands: [],
      priceMin: '',
      priceMax: '',
      priceRange: '',
    });
    setSearchParams(new URLSearchParams(), {replace: true});
  };

  // Filter products client-side
  const filteredProducts = products.filter((product: any) => {
    // Price filter
    if (filters.priceMin || filters.priceMax) {
      const price = parseFloat(product.priceRange?.minVariantPrice?.amount ?? '0');
      const min = filters.priceMin ? parseFloat(filters.priceMin) : 0;
      const max = filters.priceMax ? parseFloat(filters.priceMax) : Infinity;
      if (price < min || price > max) return false;
    }

    // Price range filter
    if (filters.priceRange) {
      const price = parseFloat(product.priceRange?.minVariantPrice?.amount ?? '0');
      const ranges: Record<string, [number, number]> = {
        'under-50': [0, 50],
        '50-100': [50, 100],
        '100-200': [100, 200],
        '200-plus': [200, Infinity],
      };
      const [min, max] = ranges[filters.priceRange] ?? [0, Infinity];
      if (price < min || price > max) return false;
    }

    // TODO: Size/Color filters require product variant data
    // For now, these will be visual-only until we fetch variant data

    return true;
  });

  const hasActiveFilters =
    filters.sizes.length > 0 ||
    filters.colors.length > 0 ||
    filters.brands.length > 0 ||
    filters.priceMin !== '' ||
    filters.priceMax !== '' ||
    filters.priceRange !== '';

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
        <div className="mb-6 flex flex-col gap-6">
          {/* Title + description - Centered */}
          <div className="text-center">
            <h1
              className="mb-3 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl uppercase text-black"
              style={{
                fontFamily: 'Aeonik, sans-serif',
                letterSpacing: '0.05em'
              }}
            >
              {collection.title}
            </h1>
            {collection.description && (
              <p className="mx-auto max-w-2xl text-base text-gray-600" style={{fontFamily: 'Quicking, sans-serif'}}>
                {collection.description}
              </p>
            )}
          </div>

          {/* Filters + sort - Centered */}
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-lg border border-gray-300 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.12em] transition-all duration-200 hover:border-gray-800 hover:shadow-md active:scale-95"
              style={{fontFamily: 'Aeonik, sans-serif'}}
            >
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
              {hasActiveFilters && (
                <span className="ml-1 rounded-full bg-gray-900 px-2 py-0.5 text-xs text-white">
                  {filters.sizes.length + filters.colors.length + filters.brands.length + (filters.priceRange ? 1 : 0) + (filters.priceMin || filters.priceMax ? 1 : 0)}
                </span>
              )}
            </button>

            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as typeof sortBy)
              }
              className="cursor-pointer rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-xs font-medium uppercase tracking-[0.12em] transition-all duration-200 hover:border-gray-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-300"
              style={{fontFamily: 'Aeonik, sans-serif'}}
            >
              <option value="featured">Featured</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
              <option value="newest">Newest</option>
              <option value="best-selling">Best Selling</option>
            </select>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              {filters.sizes.map(size => (
                <button
                  key={`size-${size}`}
                  onClick={() => toggleFilter('sizes', size)}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-xs transition-all hover:border-gray-800"
                >
                  <span>Size: {size}</span>
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ))}
              {filters.colors.map(color => (
                <button
                  key={`color-${color}`}
                  onClick={() => toggleFilter('colors', color)}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-xs transition-all hover:border-gray-800"
                >
                  <span>Color: {color}</span>
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ))}
              {filters.brands.map(brand => (
                <button
                  key={`brand-${brand}`}
                  onClick={() => toggleFilter('brands', brand)}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-xs transition-all hover:border-gray-800"
                >
                  <span>Brand: {brand}</span>
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ))}
              {filters.priceRange && (
                <button
                  onClick={() => updateFilters({priceRange: ''})}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-xs transition-all hover:border-gray-800"
                >
                  <span>Price: {filters.priceRange.replace('-', ' - ')}</span>
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              {(filters.priceMin || filters.priceMax) && (
                <button
                  onClick={() => updateFilters({priceMin: '', priceMax: ''})}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-xs transition-all hover:border-gray-800"
                >
                  <span>
                    Price: ${filters.priceMin || '0'} - ${filters.priceMax || '∞'}
                  </span>
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <button
                onClick={clearFilters}
                className="text-xs font-medium text-gray-600 underline transition-colors hover:text-gray-900"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filters Drawer */}
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
              <h2 className="text-base font-bold uppercase tracking-[0.12em]" style={{fontFamily: 'Aeonik, sans-serif', color: accentColor}}>
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
                    (size) => {
                      const isSelected = filters.sizes.includes(size);
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => toggleFilter('sizes', size)}
                          className="relative overflow-hidden rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-200 active:scale-95"
                          style={{
                            fontFamily: 'Aeonik, sans-serif',
                            borderColor: isSelected ? accentColor : '#D1D5DB',
                            backgroundColor: isSelected ? accentColor : 'transparent',
                            color: isSelected ? '#FFFFFF' : '#000000',
                          }}
                        >
                          <span className="relative z-10">{size}</span>
                        </button>
                      );
                    },
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
                      className="group relative h-12 w-12 rounded-full border-2 border-gray-300 shadow-sm transition-all duration-200 hover:scale-110 hover:shadow-md active:scale-95"
                      style={{backgroundColor: color.color}}
                      aria-label={color.name}
                      title={color.name}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = accentColor;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '';
                      }}
                    >
                      <span className="absolute inset-0 rounded-full ring-2 ring-transparent transition-all duration-200" />
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
                        className="h-4 w-4 rounded border-gray-300 focus:ring-2"
                        style={{
                          accentColor: accentColor,
                        }}
                      />
                      <span className="text-sm transition-colors group-hover:text-black" style={{fontFamily: 'Quicking, sans-serif'}}>
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
                      className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2"
                      style={{
                        fontFamily: 'Quicking, sans-serif',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = accentColor;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '';
                      }}
                    />
                    <span className="text-gray-500">—</span>
                    <input
                      type="number"
                      placeholder="Max"
                      className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2"
                      style={{
                        fontFamily: 'Quicking, sans-serif',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = accentColor;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '';
                      }}
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
                            className="h-4 w-4 border-gray-300 focus:ring-2"
                            style={{
                              accentColor: accentColor,
                            }}
                          />
                          <span className="text-sm transition-colors group-hover:text-black" style={{fontFamily: 'Quicking, sans-serif'}}>
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
                className="flex-1 rounded-lg border border-gray-300 py-3 text-xs font-semibold uppercase tracking-[0.12em] transition-all duration-200 hover:border-gray-800 hover:bg-gray-50 active:scale-95"
                style={{fontFamily: 'Aeonik, sans-serif'}}
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="group relative flex-1 overflow-hidden rounded-lg py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white transition-all duration-200 hover:shadow-lg active:scale-95"
                style={{
                  fontFamily: 'Aeonik, sans-serif',
                  backgroundColor: accentColor,
                }}
              >
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
                <ProductGrid key="product-grid">
                  {products.map((p: any) => (
                    <ProductItem key={p.id} product={p as any} loading="lazy" />
                  ))}
                </ProductGrid>
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
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-[0.12em]" style={{fontFamily: 'Aeonik, sans-serif'}}>
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
