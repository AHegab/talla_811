import type {Route} from './+types/_index';
import {useLoaderData} from '@remix-run/react';

import {HeroCarousel} from '~/components/HeroCarousel';
import {ProductItem} from '~/components/ProductItem';
import {Container, ProductGrid, SectionHeading} from '~/components/ui';
import type {AllProductsQuery} from 'storefrontapi.generated';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'TALLA | Premium Fashion'},
    {
      name: 'description',
      content:
        'Discover curated premium fashion from local brands on TALLA. Shop new arrivals, timeless essentials, and statement pieces.',
    },
  ];
};

type Products = AllProductsQuery['products']['nodes'];

export async function loader({context}: Route.LoaderArgs) {
  // Critical, above-the-fold data
  const criticalData = await loadCriticalData({context});

  // Deferred / below-the-fold data placeholder (extend later if needed)
  const deferredData = loadDeferredData({context});

  return {...criticalData, ...deferredData};
}

/**
 * Load data necessary for rendering content above the fold.
 * If this fails, the whole page should error.
 */
async function loadCriticalData({
  context,
}: {
  context: Route.LoaderArgs['context'];
}) {
  const data = await context.storefront.query<AllProductsQuery>(
    ALL_PRODUCTS_QUERY,
  );

  return {
    products: data.products?.nodes ?? [],
  };
}

/**
 * Load data for rendering content below the fold.
 * This should never throw; the page must still succeed without it.
 */
function loadDeferredData({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  context,
}: {
  context: Route.LoaderArgs['context'];
}) {
  // Add deferred queries here later (e.g. recommendations, editorials, etc.)
  return {};
}

export default function Homepage() {
  const {products} = useLoaderData<typeof loader>();

  return (
    <main className="min-h-screen bg-talla-bg">
      {/* Hero Section with proper top spacing for fixed header */}
      <section className="w-full pt-14 sm:pt-16 lg:pt-[72px]">
        <HeroCarousel />
      </section>

      {/* Products Section */}
      <AllProducts products={products} />
    </main>
  );
}

function AllProducts({products}: {products: Products}) {
  const count = products?.length ?? 0;

  if (!products || count === 0) {
    return (
      <Container className="section-padding">
        <SectionHeading
          title="All Products"
          subtitle="No products available"
        />
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>
            No products found. Make sure your products are published to the
            Headless sales channel in Shopify.
          </p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="section-padding">
      <SectionHeading
        title="All Products"
        subtitle={`Discover ${count} curated ${
          count === 1 ? 'piece' : 'pieces'
        } from our partner brands`}
      />

      <ProductGrid>
        {products.map((product) => (
          <ProductItem
            key={product.id}
            product={product}
            loading="lazy"
          />
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

  query AllProducts($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    products(first: 250) {
      nodes {
        ...ProductCard
      }
    }
  }
` as const;
