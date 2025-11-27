import type { Route } from './+types/products.$handle';

import { useLoaderData } from '@remix-run/react';
import {
  Analytics,
  getAdjacentAndFirstAvailableVariants,
  getSelectedProductOptions,
  useOptimisticVariant,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import { redirect } from '@shopify/remix-oxygen';

import type { ProductQuery } from 'storefrontapi.generated';
import { ProductPage } from '~/components/ProductPage';
import { redirectIfHandleIsLocalized } from '~/lib/redirect';

export const meta: Route.MetaFunction = ({data}) => {
  const title = data?.product?.title ?? 'Product';
  const handle = data?.product?.handle ?? '';

  return [
    {title: `TALLA | ${title}`},
    {
      rel: 'canonical',
      // Relative canonical is fine when served from the main domain
      href: handle ? `/products/${handle}` : '/products',
    },
  ];
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);

  const finalData = {...deferredData, ...criticalData};
  console.log('MAIN LOADER - finalData:', finalData);
  console.log('MAIN LOADER - finalData.similarProducts:', finalData.similarProducts);

  return finalData;
}

/**
 * Critical data: product + selected variant.
 * If this fails, the page should 404 / error.
 */
async function loadCriticalData({
  context,
  params,
  request,
}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw redirect('/products');
  }

  const selectedOptions = getSelectedProductOptions(request);

  const [{product}] = await Promise.all([
    storefront.query<ProductQuery>(PRODUCT_QUERY, {
      variables: {handle, selectedOptions},
    }),
    // Add other parallel queries here if needed (e.g. recommendations)
  ]);

  if (!product?.id) {
    throw new Response('Product not found', {status: 404});
  }

  // The API handle might be localized, so redirect if needed
  redirectIfHandleIsLocalized(request, {handle, data: product});

  // Fetch similar products - TEMPORARY TEST DATA
  const similarProducts: any[] = [
    {
      id: 'test-1',
      title: 'Test Product 1',
      handle: 'test-1',
      tags: ['blazer', 'men'],
      priceRange: {
        minVariantPrice: {
          amount: '99.00',
          currencyCode: 'EGP',
        },
      },
      featuredImage: {
        url: 'https://cdn.shopify.com/s/files/1/0688/1755/1382/files/Ribbon_Jacket-1.jpg?v=1703145651',
        altText: 'Test Product',
      },
    },
    {
      id: 'test-2',
      title: 'Test Product 2',
      handle: 'test-2',
      tags: ['blazer', 'formal'],
      priceRange: {
        minVariantPrice: {
          amount: '149.00',
          currencyCode: 'EGP',
        },
      },
      featuredImage: {
        url: 'https://cdn.shopify.com/s/files/1/0688/1755/1382/files/Ribbon_Jacket-1.jpg?v=1703145651',
        altText: 'Test Product 2',
      },
    },
  ];

  console.log('LOADER - About to return similarProducts:', similarProducts);
  console.log('LOADER - similarProducts.length:', similarProducts.length);

  const returnData = {
    product,
    similarProducts,
  };

  console.log('LOADER - returnData:', returnData);

  return returnData;
}

/**
 * Deferred data: safe-to-fail, below-the-fold extras.
 */
function loadDeferredData({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  context,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  params,
}: Route.LoaderArgs) {
  return {};
}

export default function Product() {
  const loaderData = useLoaderData<typeof loader>();
  console.log('Product component - full loaderData:', loaderData);

  const {product, similarProducts} = loaderData;
  console.log('Product component - product:', product);
  console.log('Product component - similarProducts:', similarProducts);

  // Optimistically select a variant based on availability/adjacent variants
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Sync selected options into the URL search params (no navigation)
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  return (
    <>
      <ProductPage product={product} selectedVariant={selectedVariant} similarProducts={similarProducts} />

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount ?? '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id ?? '',
              variantTitle: selectedVariant?.title ?? '',
              quantity: 1,
            },
          ],
        }}
      />
    </>
  );
}

// ---------------- GraphQL ----------------

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    productType
    tags
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 10) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    encodedVariantExistence
    encodedVariantAvailability
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(
      selectedOptions: $selectedOptions
      ignoreUnknownOptions: true
      caseInsensitiveMatch: true
    ) {
      ...ProductVariant
    }
    adjacentVariants(selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    variants(first: 100) {
      nodes {
        ...ProductVariant
      }
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;

const PRODUCT_RECOMMENDATIONS_QUERY = `#graphql
  query ProductRecommendations(
    $query: String!
    $first: Int!
  ) {
    products(first: $first, query: $query) {
      nodes {
        id
        title
        handle
        tags
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        featuredImage {
          url
          altText
        }
      }
    }
  }
`;
