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

  return {
    product,
    similarProducts,
    // brandSizeChart: optional brand-level size chart derived from vendor collection metafields
    brandSizeChart: await loadBrandSizeChart(storefront, product.vendor),
  };
}

/**
 * Attempts to load a size chart for a brand (collection) using multiple strategies
 * - First: try collectionByHandle using a slugified vendor
 * - Then: search collections by title using the vendor name
 */
async function loadBrandSizeChart(storefront: any, vendor?: string | null) {
  if (!vendor) return null;
  const vendorHandle = vendor.trim().toLowerCase().replace(/[^a-z0-9\-]+/g, '-').replace(/(^-|-$)/g, '');

  try {
    const byHandle = await storefront.query(COLLECTION_BY_HANDLE_FULL_QUERY, {
      variables: { handle: vendorHandle },
      cache: storefront.CacheShort(),
    });
    const collection = byHandle?.collectionByHandle;
    if (collection) {
    // check metafields similar to product
    const nodes = collection.metafields ?? [];
      const keyNames = ['size_chart', 'size-chart', 'sizeChart', 'sizechart', 'size_chart_image', 'size-chart-image', 'sizechartimage'];
        const found = nodes.find((m: any) => {
          if (!m) return false;
          const key = (m.key || '').toString().toLowerCase();
          const ns = (m.namespace || '').toString().toLowerCase();
          const val = (m.value || '').toString().toLowerCase();
          const refAlt = (m.reference?.image?.altText || m.reference?.alt || '').toString().toLowerCase();
          return (
            keyNames.some((k) => key.includes(k)) ||
            key.includes('size') ||
            ns.includes('size') ||
            val.includes('size') ||
            refAlt.includes('size')
          );
        });
      if (found) {
          if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.log('Product size chart metafield found:', found);
          }
        // more robust extraction similar to product
        const ref = found.reference;
        if (ref && ref.__typename === 'MediaImage' && ref.image?.url) {
          return { url: ref.image.url, alt: ref.image.altText ?? 'Size chart', source: 'brand' };
        }
        if (ref && ref.url) {
          return { url: ref.url, alt: found?.value ?? 'Size chart', source: 'brand' };
        }
        if (found.value && typeof found.value === 'string') {
          const trimmed = found.value.trim();
          if (trimmed.startsWith('http')) return { url: trimmed, alt: found?.value ?? 'Size chart', source: 'brand' };
          if (trimmed.startsWith('{')) {
            try {
              const parsed: any = JSON.parse(trimmed);
              const url = parsed.url || parsed.src || parsed.file?.url || parsed.previewImage?.url;
              const alt = parsed.alt || parsed.altText || parsed.previewImage?.altText;
              if (url) return { url, alt: alt ?? found?.value ?? 'Size chart', source: 'brand' };
            } catch (err) {
              // ignore
            }
          }
          const imgSrcMatch = trimmed.match(/<img[^>]+src=["']([^"'>]+)["']/i);
          if (imgSrcMatch) return { url: imgSrcMatch[1], alt: found?.value ?? 'Size chart', source: 'brand' };
        }
      }
    }
  } catch (err) {
    // ignore and fallback
  }

  // Fallback: search collections by title
  try {
    const search = await storefront.query(COLLECTIONS_BY_TITLE_QUERY, {
      variables: { title: vendor },
      cache: storefront.CacheShort(),
    });
    const nodes = search?.collections?.nodes ?? [];
    if (nodes.length) {
      const collection = nodes[0];
      const mfNodes = collection.metafields ?? [];
      const keyNames = ['size_chart', 'size-chart', 'sizeChart', 'sizechart', 'size_chart_image', 'size-chart-image', 'sizechartimage'];
      const found = mfNodes.find((m: any) => {
        if (!m) return false;
        const key = (m.key || '').toString().toLowerCase();
        const ns = (m.namespace || '').toString().toLowerCase();
        const val = (m.value || '').toString().toLowerCase();
        const refAlt = (m.reference?.image?.altText || m.reference?.alt || '').toString().toLowerCase();
        return (
          keyNames.some((k) => key.includes(k)) ||
          key.includes('size') ||
          ns.includes('size') ||
          val.includes('size') ||
          refAlt.includes('size')
        );
      });
      if (found) {
        const ref = found.reference;
        if (ref && ref.__typename === 'MediaImage' && ref.image?.url) {
          return { url: ref.image.url, alt: ref.image.altText ?? 'Size chart', source: 'brand' };
        }
        if (ref && (ref.url)) {
          return { url: ref.url, alt: found?.value ?? 'Size chart', source: 'brand' };
        }
        if (found.value && typeof found.value === 'string' && found.value.startsWith('http')) {
          return { url: found.value, alt: 'Size chart', source: 'brand' };
        }
      }
    }
  } catch (err) {
    // ignore
  }

  return null;
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
  const {product, similarProducts, brandSizeChart} = useLoaderData<typeof loader>();

  // Optimistically select a variant based on availability/adjacent variants
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Sync selected options into the URL search params (no navigation)
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  return (
    <>
      <ProductPage product={product} selectedVariant={selectedVariant} similarProducts={similarProducts} brandSizeChart={brandSizeChart} />

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

// Collection query by handle with metafields (used for brand size charts)
const COLLECTION_BY_HANDLE_FULL_QUERY = `#graphql
  query CollectionByHandleFull($handle: String!) {
    collectionByHandle(handle: $handle) {
      id
      title
      handle
      metafields(identifiers: [
        {namespace: "custom", key: "size_chart"},
        {namespace: "custom", key: "size-chart"},
        {namespace: "custom", key: "sizeChart"},
        {namespace: "custom", key: "sizechart"},
        {namespace: "custom", key: "size_chart_image"},
        {namespace: "custom", key: "size-chart-image"},
        {namespace: "custom", key: "sizechartimage"},
        {namespace: "size", key: "chart"},
        {namespace: "size", key: "guide"}
      ]) {
        id
        key
        namespace
        value
        type
        reference {
          __typename
          ... on MediaImage {
            image {
              id
              url
              altText
              width
              height
            }
          }
          ... on GenericFile {
            alt
            mimeType
            url
          }
        }
      }
      image {
        id
        url
        altText
        width
        height
      }
    }
  }
` as const;

const COLLECTIONS_BY_TITLE_QUERY = `#graphql
  query CollectionsByTitle($title: String!) {
    collections(first: 5, query: $title) {
      nodes {
        id
        title
        handle
        metafields(identifiers: [
          {namespace: "custom", key: "size_chart"},
          {namespace: "custom", key: "size-chart"},
          {namespace: "custom", key: "sizeChart"},
          {namespace: "custom", key: "sizechart"},
          {namespace: "custom", key: "size_chart_image"},
          {namespace: "custom", key: "size-chart-image"},
          {namespace: "custom", key: "sizechartimage"},
          {namespace: "size", key: "chart"},
          {namespace: "size", key: "guide"}
        ]) {
          id
          key
          namespace
          value
          type
          reference {
            __typename
            ... on MediaImage {
              image {
                id
                url
                altText
                width
                height
              }
            }
            ... on GenericFile {
              alt
              mimeType
              url
            }
          }
        }
      }
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
    metafields(identifiers: [
      {namespace: "custom", key: "size_chart"},
      {namespace: "custom", key: "size-chart"},
      {namespace: "custom", key: "sizeChart"},
      {namespace: "custom", key: "sizechart"},
      {namespace: "custom", key: "size_chart_image"},
      {namespace: "custom", key: "size-chart-image"},
      {namespace: "custom", key: "sizechartimage"},
      {namespace: "size", key: "chart"},
      {namespace: "size", key: "guide"}
    ]) {
      id
      key
      namespace
      value
      type
      reference {
        __typename
        ... on MediaImage {
          image {
            id
            url
            altText
            width
            height
          }
        }
        ... on GenericFile {
          alt
          mimeType
          url
        }
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
