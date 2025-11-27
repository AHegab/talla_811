import {
    Analytics,
    getAdjacentAndFirstAvailableVariants,
    getSelectedProductOptions,
    useOptimisticVariant,
    useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {
    useLoaderData
} from 'react-router';
import { ProductPage } from '~/components/ProductPage';
import { redirectIfHandleIsLocalized } from '~/lib/redirect';
import getSimilarProductsConfig from '~/lib/similarProductsConfig';
import { filterByTagOverlap, productTypeFallback, vendorFallback } from '~/lib/similarProductsUtils';
import type { Route } from './+types/products.$handle';

export const meta: Route.MetaFunction = ({data}) => {
  return [
    {title: `Hydrogen | ${data?.product.title ?? ''}`},
    {
      rel: 'canonical',
      href: `/products/${data?.product.handle}`,
    },
  ];
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
async function loadCriticalData({
  context,
  params,
  request,
}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: product});

  // Attempt to fetch visually or tag-based similar products using product tags as query
  let similarProducts: any[] = [];

  const config = getSimilarProductsConfig();
  try {
    const tagQuery = (product.tags || []).slice(0, 3).join(' OR ');
    if (tagQuery) {
      const recs = await storefront.query(
        PRODUCT_RECOMMENDATIONS_QUERY,
        {
          variables: {query: tagQuery, first: 20},
        },
      );

      // Apply overlap requirement based on config
      const productTags = product.tags || [];
      const requiredOverlap = productTags.length >= config.overlap ? config.overlap : productTags.length;

      similarProducts = filterByTagOverlap(recs?.products?.nodes ?? [], productTags, requiredOverlap)
        .filter((node: any) => node.handle !== product.handle)
        .slice(0, 5);

      if (similarProducts.length === 0 && config.allowOneTagFallback && requiredOverlap > 1) {
        similarProducts = filterByTagOverlap(recs?.products?.nodes ?? [], productTags, 1)
          .filter((node: any) => node.handle !== product.handle)
          .slice(0, 5);
      }
    }
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.warn('Product recommendations query failed', err);
  }

  // If none and fallback is enabled, attempt vendor/productType fallback
  if ((similarProducts.length === 0) && config.fallbackEnabled) {
    // Vendor fallback
    if (product.vendor) {
      try {
        const vendorRecs = await storefront.query(PRODUCT_RECOMMENDATIONS_QUERY, {
          variables: { query: product.vendor, first: 20 },
        });
        similarProducts = vendorFallback(vendorRecs?.products?.nodes ?? [], product.vendor)
          .filter((n: any) => n.handle !== product.handle)
          .slice(0, 5);
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') console.warn('Product recommendations vendor fallback failed', err);
      }
    }

    // productType fallback
    if ((similarProducts.length === 0) && product.productType) {
      try {
        const typeRecs = await storefront.query(PRODUCT_RECOMMENDATIONS_QUERY, {
          variables: { query: product.productType, first: 20 },
        });
        similarProducts = productTypeFallback(typeRecs?.products?.nodes ?? [], product.productType)
          .filter((n: any) => n.handle !== product.handle)
          .slice(0, 5);
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') console.warn('Product recommendations productType fallback failed', err);
      }
    }
  }

  return {
    product,
    similarProducts,
  };
}
  const PRODUCT_RECOMMENDATIONS_QUERY = `#graphql
    query ProductRecsNonLocale(
      $query: String!
      $first: Int!
    ) {
      products(first: $first, query: $query) {
        nodes {
          id
          title
          handle
          tags
          productType
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

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context, params}: Route.LoaderArgs) {
  // Put any API calls that is not critical to be available on first page render
  // For example: product reviews, product recommendations, social feeds.

  return {};
}

export default function Product({params}: Route.ComponentProps) {
  const {product, similarProducts} = useLoaderData<typeof loader>();
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  useSelectedOptionInUrlParam(selectedVariant?.selectedOptions);

  return (
    <>
      <ProductPage product={product} selectedVariant={selectedVariant} similarProducts={similarProducts} />
      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </>
  );
}

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
  fragment ProductNonLocale on Product {
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
      maxVariantPrice {
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
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
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
  query ProductNonLocale(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...ProductNonLocale
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;
