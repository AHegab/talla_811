import getSimilarProductsConfig from '~/lib/similarProductsConfig';
import { filterByTagOverlap, productTypeFallback, vendorFallback } from '~/lib/similarProductsUtils';
import type { Route } from './+types/api.search-by-image';
import { logError, sanitizeInput, createErrorResponse, withTimeout, handleGraphQLErrors } from '~/utils/errorHandling';

export async function action({request, context}: Route.ActionArgs) {
  try {
    // Parse request body with timeout
    let body: any;
    try {
      body = await withTimeout(
        request.json(),
        5000,
        'Request timeout while parsing JSON'
      );
    } catch (parseError) {
      logError(parseError, { action: 'api.search-by-image', step: 'parse-body' });
      return createErrorResponse('Invalid JSON request body', 400);
    }

    const {
      imageUrl: rawImageUrl,
      tags: rawTags = [],
      currentHandle: rawCurrentHandle,
      vendor: rawVendor,
      productType: rawProductType,
      allowOneTagFallback,
      fallbackEnabled,
      overlap
    } = body;

    // Validate imageUrl (optional for this endpoint, but validate if provided)
    let imageUrl = '';
    if (rawImageUrl) {
      imageUrl = sanitizeInput(String(rawImageUrl));
      try {
        new URL(imageUrl);
      } catch (urlError) {
        logError(new Error('Invalid imageUrl'), { action: 'api.search-by-image', imageUrl: rawImageUrl });
        return createErrorResponse('Invalid imageUrl: must be a valid URL', 400);
      }
    }

    // Sanitize and validate tags
    const tags = Array.isArray(rawTags)
      ? rawTags.map((t: any) => sanitizeInput(String(t))).filter(Boolean)
      : [];

    // Sanitize optional string fields
    const currentHandle = rawCurrentHandle ? sanitizeInput(String(rawCurrentHandle)) : undefined;
    const vendor = rawVendor ? sanitizeInput(String(rawVendor)) : undefined;
    const productType = rawProductType ? sanitizeInput(String(rawProductType)) : undefined;

    // Get configuration
    let config: any;
    try {
      config = getSimilarProductsConfig();
    } catch (configError) {
      logError(configError, { action: 'api.search-by-image', step: 'get-config' });
      // Use defaults if config fails
      config = { overlap: 2, allowOneTagFallback: true, fallbackEnabled: true };
    }

    const configOverlap = config.overlap;

    const {storefront} = context;

    // Validate storefront is available
    if (!storefront) {
      logError(new Error('Storefront context not available'), { action: 'api.search-by-image' });
      return createErrorResponse('Storefront API not available', 503);
    }

    // Query for some products as candidates with timeout
    let result: any;
    try {
      result = await withTimeout(
        storefront.query(SIMILAR_PRODUCTS_QUERY, {
          variables: {first: 20},
        }),
        10000,
        'GraphQL query timeout'
      );
    } catch (queryError) {
      logError(queryError, { action: 'api.search-by-image', step: 'query-products' });
      return createErrorResponse('Failed to query products', 500, queryError);
    }

    // Handle GraphQL errors
    if (result?.errors) {
      const error = handleGraphQLErrors(result.errors);
      logError(error, { action: 'api.search-by-image', step: 'graphql-errors' });
      return createErrorResponse('GraphQL query failed', 500, error);
    }

    const products = result?.products ?? { nodes: [] };

    // Safely map products with error handling
    let candidates: any[] = [];
    try {
      candidates = (products.nodes ?? []).map((product: any) => ({
        handle: product.handle || '',
        title: product.title || 'Untitled',
        image: product.featuredImage?.url || '',
        price: {
          amount: product.priceRange?.minVariantPrice?.amount ?? '0',
          currencyCode: product.priceRange?.minVariantPrice?.currencyCode ?? 'USD',
        },
        vendor: product.vendor || '',
        tags: Array.isArray(product.tags) ? product.tags : [],
        id: product.id || '',
        productType: product.productType || '',
        featuredImage: product.featuredImage,
      })).filter((p: any) => p.handle && p.id); // Filter out invalid products
    } catch (mappingError) {
      logError(mappingError, { action: 'api.search-by-image', step: 'map-products' });
      return createErrorResponse('Failed to process product data', 500, mappingError);
    }

    // Allow tests or callers to override configuration via request body. If not provided
    // use the environment-driven config from getSimilarProductsConfig()
    const allowOneTagFallbackValue = allowOneTagFallback != null ? Boolean(allowOneTagFallback) : config.allowOneTagFallback;
    const finalFallbackEnabled = fallbackEnabled != null ? Boolean(fallbackEnabled) : config.fallbackEnabled;
    const finalOverlap = overlap != null && !isNaN(Number(overlap)) && Number(overlap) > 0
      ? Number(overlap)
      : configOverlap;

    // Require at least `finalOverlap` tags in common, but if source product has fewer
    // than `finalOverlap` tags, require at least the same number as source tags
    const requiredOverlap = tags.length >= finalOverlap ? finalOverlap : tags.length;
    let usedFallback = false;

    // Filter out the current product and keep only those with sufficient tag overlap
    let similarProducts: any[] = [];
    try {
      similarProducts = filterByTagOverlap(candidates, tags, requiredOverlap)
        .filter((p: any) => p.handle !== currentHandle)
        .slice(0, 5);

      // If none, and allow one-tag fallback is set, retry with 1 overlap
      if (similarProducts.length === 0 && allowOneTagFallbackValue && requiredOverlap > 1) {
        similarProducts = filterByTagOverlap(candidates, tags, 1)
          .filter((p: any) => p.handle !== currentHandle)
          .slice(0, 5);
        if (similarProducts.length > 0) usedFallback = true;
      }
    } catch (filterError) {
      logError(filterError, { action: 'api.search-by-image', step: 'filter-by-tags' });
      // Continue with empty results, will try fallback
    }

    // If no results and fallback is enabled, try vendor or productType fallback
    if ((similarProducts.length === 0) && finalFallbackEnabled) {
      // Vendor fallback first
      if (vendor) {
        // Try a more precise vendor query: vendor:"Vendor Name" to get vendor-specific results
        try {
          const vendorRecs = await withTimeout(
            storefront.query(PRODUCT_RECOMMENDATIONS_QUERY, {
              variables: { first: 20, query: `vendor:"${vendor}"` },
            } as any),
            10000,
            'Vendor query timeout'
          );

          // Handle GraphQL errors
          if (vendorRecs?.errors) {
            throw handleGraphQLErrors(vendorRecs.errors);
          }

          // Filter server result by vendor to be robust for test mocks that may ignore query
          similarProducts = (vendorRecs?.products?.nodes ?? [])
            .filter((p: any) => p.handle !== currentHandle)
            .filter((p: any) => p.vendor === vendor)
            .slice(0, 5);
        } catch (err) {
          logError(err, { action: 'api.search-by-image', step: 'vendor-query', vendor });
          // fallback to in-memory vendor filter if query fails
          try {
            similarProducts = vendorFallback(candidates, vendor)
              .filter((p: any) => p.handle !== currentHandle)
              .slice(0, 5);
          } catch (vendorFallbackError) {
            logError(vendorFallbackError, { action: 'api.search-by-image', step: 'vendor-fallback' });
          }
        }
        if (similarProducts.length > 0) usedFallback = true;
      }

      // If still empty and productType provided, use productType fallback
      if ((similarProducts.length === 0) && productType) {
        try {
          const typeRecs = await withTimeout(
            storefront.query(PRODUCT_RECOMMENDATIONS_QUERY, {
              variables: { first: 20, query: `product_type:"${productType}"` },
            } as any),
            10000,
            'ProductType query timeout'
          );

          // Handle GraphQL errors
          if (typeRecs?.errors) {
            throw handleGraphQLErrors(typeRecs.errors);
          }

          similarProducts = (typeRecs?.products?.nodes ?? [])
            .filter((p: any) => p.handle !== currentHandle)
            .filter((p: any) => p.productType === productType || p.tags?.includes(productType))
            .slice(0, 5);
        } catch (err) {
          logError(err, { action: 'api.search-by-image', step: 'productType-query', productType });
          // fallback to in-memory filter if query fails
          try {
            similarProducts = productTypeFallback(candidates, productType)
              .filter((p: any) => p.handle !== currentHandle)
              .slice(0, 5);
          } catch (typeFallbackError) {
            logError(typeFallbackError, { action: 'api.search-by-image', step: 'productType-fallback' });
          }
        }
        if (similarProducts.length > 0) usedFallback = true;
      }
    }

    return Response.json({
      products: similarProducts,
      // Meta so the client can detect if it's a tag-match or fallback
      meta: { type: 'success', usedFallback },
    });
  } catch (error) {
    logError(error, { action: 'api.search-by-image', step: 'unexpected-error' });
    return createErrorResponse(
      'An unexpected error occurred while searching for similar items',
      500,
      error
    );
  }
}

const SIMILAR_PRODUCTS_QUERY = `#graphql
  query SimilarProducts($first: Int!) {
    products(first: $first) {
      nodes {
        id
        handle
        title
        tags
        vendor
            featuredImage {
          url
          altText
        }
            productType
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
      }
    }
  }
` as const;

const PRODUCT_RECOMMENDATIONS_QUERY = `#graphql
  query ProductRecsVisualSearch($query: String!, $first: Int!) {
    products(first: $first, query: $query) {
      nodes {
        id
        title
        handle
        tags
        vendor
        productType
        featuredImage {
          url
          altText
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
      }
    }
  }
` as const;
