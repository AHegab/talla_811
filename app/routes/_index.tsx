import { Suspense } from 'react';
import {
    Await,
    Link,
    useLoaderData,
} from 'react-router';
import type {
    RecommendedProductsQuery
} from 'storefrontapi.generated';
import { HeroCarousel } from '~/components/HeroCarousel';
import { ProductItem } from '~/components/ProductItem';
import { ProductGrid } from '~/components/ui';
import type { Route } from './+types/_index';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Hydrogen | Home'}];
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
async function loadCriticalData({context}: Route.LoaderArgs) {
  const [{collections}] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {
    featuredCollection: collections.nodes[0],
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error: Error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
  };
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="homepage">
      {/* Hero Carousel - Full Width */}
      <div className="full-width">
        <HeroCarousel />
      </div>

      {/* Curated Category Cards */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-16 xl:px-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* New Designers */}
            <CategoryCard
              title="New Designers"
              image="/images/new-designers.jpg"
              link="/collections/new-designers"
              description="Discover emerging talent"
            />

            {/* Everyday Essentials */}
            <CategoryCard
              title="Everyday Essentials"
              image="/images/everyday-essentials.jpg"
              link="/collections/everyday-essentials"
              description="Timeless pieces for every day"
            />

            {/* Modern Abayas */}
            <CategoryCard
              title="Modern Abayas"
              image="/images/modern-abayas.jpg"
              link="/collections/modern-abayas"
              description="Contemporary elegance"
            />
          </div>
        </div>
      </section>

      {/* AI Size Finder Section */}
      <section className="py-20 sm:py-24 lg:py-32 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light mb-6 tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
            Find Your Perfect Fit
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Find your perfect fit in seconds — try our Size Recommender.
          </p>
          <Link
            to="/size-finder"
            className="inline-flex items-center justify-center px-10 py-4 bg-black text-white text-sm font-semibold tracking-widest uppercase transition-all duration-300 hover:bg-gray-900 hover:scale-105 active:scale-95"
          >
            Try Size Finder
            <svg 
              className="ml-3 w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Recommended Products */}
      <RecommendedProducts products={data.recommendedProducts} />
    </div>
  );
}

function CategoryCard({
  title,
  image,
  link,
  description,
}: {
  title: string;
  image: string;
  link: string;
  description: string;
}) {
  return (
    <Link
      to={link}
      className="group relative overflow-hidden bg-gray-100 aspect-[3/4] block"
    >
      {/* Image */}
      <div className="absolute inset-0 bg-gray-200">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 p-8 text-white">
        <p className="text-sm uppercase tracking-widest mb-2 opacity-90">
          {description}
        </p>
        <h3 className="text-2xl lg:text-3xl font-light mb-4 tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
          {title}
        </h3>
        <span className="inline-flex items-center text-sm font-semibold uppercase tracking-wider group-hover:translate-x-2 transition-transform duration-300">
          Explore
          <svg 
            className="ml-2 w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

function RecommendedProducts({
  products,
}: {
  products: Promise<RecommendedProductsQuery | null>;
}) {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-16 xl:px-20">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            Recommended for You
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Curated selections based on your style
          </p>
        </div>
        
        <Suspense fallback={
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
          </div>
        }>
          <Await resolve={products}>
            {(response) => {
              const recProducts = response
                ? response.products.nodes.map((product) => ({
                    id: product.id,
                    title: product.title,
                    handle: product.handle,
                    featuredImage: product.featuredImage,
                    priceRange: { minVariantPrice: product.priceRange.minVariantPrice },
                  }))
                : [];

              return (
                <ProductGrid>
                  {recProducts.map((p) => (
                    <ProductItem key={p.id} product={p as any} />
                  ))}
                </ProductGrid>
              );
            }}
          </Await>
        </Suspense>
      </div>
    </section>
  );
}

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
` as const;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
` as const;
