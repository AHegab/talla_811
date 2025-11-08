import { useLoaderData } from 'react-router';
import { HeroCarousel } from '~/components/HeroCarousel';
import { ProductItem } from '~/components/ProductItem';
import { Container, ProductGrid, SectionHeading } from '~/components/ui';
import type { Route } from './+types/_index';

export const meta: Route.MetaFunction = () => {
  return [{title: 'TALLA | Premium Fashion'}];
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
  const [{products}] = await Promise.all([
    context.storefront.query(ALL_PRODUCTS_QUERY),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {
    products: products.nodes,
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

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="bg-talla-bg">
      {/* Hero Section */}
      <div className="w-full">
        <HeroCarousel />
      </div>
      
      {/* Products Section */}
      <AllProducts products={data.products} />
    </div>
  );
}

function AllProducts({products}: {products: any[]}) {
  if (!products || products.length === 0) {
    return (
      <Container className="section-padding">
        <SectionHeading 
          title="All Products"
          subtitle="No products available"
        />
        <div className="text-center text-gray-600">
          <p>No products found. Please make sure your products are published to the Headless sales channel in Shopify.</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="section-padding">
      <SectionHeading 
        title="All Products"
        subtitle={`Discover ${products.length} curated ${products.length === 1 ? 'piece' : 'pieces'}`}
      />
      
      <ProductGrid>
        {products.map((product) => (
          <ProductItem key={product.id} product={product} loading="lazy" />
        ))}
      </ProductGrid>
    </Container>
  );
}

const ALL_PRODUCTS_QUERY = `#graphql
  fragment ProductCard on Product {
    id
    title
    handle
    publishedAt
    availableForSale
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 1) {
      nodes {
        id
        url
        altText
        width
        height
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
  query AllProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 250) {
      nodes {
        ...ProductCard
      }
    }
  }
` as const;
