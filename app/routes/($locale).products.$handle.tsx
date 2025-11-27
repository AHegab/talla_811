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
import getSimilarProductsConfig from '~/lib/similarProductsConfig';

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

  const config = getSimilarProductsConfig();
  let similarProducts: any[] = [];

  try {
    const tagQuery = (product.tags || []).slice(0, 3).join(' OR ');
    if (tagQuery) {
      const recs = await storefront.query(
        PRODUCT_RECOMMENDATIONS_QUERY,
        {
          variables: {query: tagQuery, first: 20},
        },
      );

      const productTags = product.tags || [];
      const requiredOverlap = productTags.length >= config.overlap ? config.overlap : productTags.length;

      similarProducts = (recs?.products?.nodes ?? [])
        .filter((node: any) => node.handle !== product.handle)
        .filter((node: any) => {
          const overlap = (node.tags || []).filter((t: string) => productTags.includes(t));
          return overlap.length >= requiredOverlap && overlap.length > 0;
        })
        .slice(0, 5);

      if (similarProducts.length === 0 && config.allowOneTagFallback && requiredOverlap > 1) {
        similarProducts = (recs?.products?.nodes ?? [])
          .filter((node: any) => node.handle !== product.handle)
          .filter((node: any) => {
            const overlap = (node.tags || []).filter((t: string) => productTags.includes(t));
            return overlap.length >= 1;
          })
          .slice(0, 5);
      }
    }
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.warn('Product recommendations query failed', err);
  }

  // Fallback vendor/productType
  if ((similarProducts.length === 0) && config.fallbackEnabled) {
    if (product.vendor) {
      try {
        const vendorRecs = await storefront.query(PRODUCT_RECOMMENDATIONS_QUERY, {
          variables: { query: `vendor:"${product.vendor}"`, first: 20 },
        } as any);
        similarProducts = (vendorRecs?.products?.nodes ?? []).filter((n: any) => n.handle !== product.handle).slice(0, 5);
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') console.warn('Product recommendations vendor fallback failed', err);
      }
    }
    if ((similarProducts.length === 0) && product.productType) {
      try {
        const typeRecs = await storefront.query(PRODUCT_RECOMMENDATIONS_QUERY, {
          variables: { query: `product_type:"${product.productType}"`, first: 20 },
        } as any);
        similarProducts = (typeRecs?.products?.nodes ?? []).filter((n: any) => n.handle !== product.handle).slice(0, 5);
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') console.warn('Product recommendations productType fallback failed', err);
      }
    }
  }

  const returnData = {
    product,
    similarProducts,
  };

  // return data ready

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

  const {product, similarProducts} = loaderData;
  // Product data ready

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
  query ProductRecsLocale(
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
