import getSimilarProductsConfig from '~/lib/similarProductsConfig';
import { filterByTagOverlap, productTypeFallback, vendorFallback } from '~/lib/similarProductsUtils';
import type { Route } from './+types/api.search-by-image';

export async function action({request, context}: Route.ActionArgs) {
  try {
    const body = (await request.json()) as {imageUrl: string; tags?: string[]; currentHandle?: string; vendor?: string; productType?: string};
    const {imageUrl, tags = [], currentHandle, vendor, productType} = body;
    const config = getSimilarProductsConfig();
    // debug: console.log('request body', JSON.stringify(body));
    const configOverlap = config.overlap;

    // TODO: Implement actual visual search using AI/ML
    // This is a placeholder that returns mock similar products
    
    // For now, return empty array or fetch random products from Shopify
    const {storefront} = context;

    // Query for some products as candidates
    const result: any = await storefront.query(SIMILAR_PRODUCTS_QUERY, {
      variables: {first: 20},
    });
    const products = result?.products ?? { nodes: [] };

    const candidates = (products.nodes ?? []).map((product: any) => ({
      handle: product.handle,
      title: product.title,
      image: product.featuredImage?.url || '',
      price: {
        amount: product.priceRange?.minVariantPrice?.amount ?? '0',
        currencyCode: product.priceRange?.minVariantPrice?.currencyCode ?? 'USD',
      },
      vendor: product.vendor,
      tags: product.tags || [],
      id: product.id,
      productType: product.productType,
      featuredImage: product.featuredImage,
    }));

    // Allow tests or callers to override configuration via request body. If not provided
    // use the environment-driven config from getSimilarProductsConfig()
    const allowOneTagFallback = body.allowOneTagFallback != null ? Boolean(body.allowOneTagFallback) : config.allowOneTagFallback;
    const finalFallbackEnabled = body.fallbackEnabled != null ? Boolean(body.fallbackEnabled) : config.fallbackEnabled;
    const finalOverlap = body.overlap != null ? Number(body.overlap) : configOverlap;

    // Require at least `finalOverlap` tags in common, but if source product has fewer
    // than `finalOverlap` tags, require at least the same number as source tags
    const requiredOverlap = tags.length >= finalOverlap ? finalOverlap : tags.length;
    let usedFallback = false;

    // Filter out the current product and keep only those with sufficient tag overlap
    let similarProducts = filterByTagOverlap(candidates, tags, requiredOverlap)
      .filter((p: any) => p.handle !== currentHandle)
      .slice(0, 5);

    // If none, and allow one-tag fallback is set, retry with 1 overlap
    if (similarProducts.length === 0 && allowOneTagFallback && requiredOverlap > 1) {
      similarProducts = filterByTagOverlap(candidates, tags, 1)
        .filter((p: any) => p.handle !== currentHandle)
        .slice(0, 5);
      if (similarProducts.length > 0) usedFallback = true;
    }

    // If no results and fallback is enabled, try vendor or productType fallback
    if ((similarProducts.length === 0) && finalFallbackEnabled) {
      // Vendor fallback first
      if (vendor) {
        // Try a more precise vendor query: vendor:"Vendor Name" to get vendor-specific results
        try {
          const vendorRecs = await storefront.query(PRODUCT_RECOMMENDATIONS_QUERY, {
            variables: { first: 20, query: `vendor:"${vendor}"` },
          } as any);

          // Filter server result by vendor to be robust for test mocks that may ignore query
          similarProducts = (vendorRecs?.products?.nodes ?? [])
            .filter((p: any) => p.handle !== currentHandle)
            .filter((p: any) => p.vendor === vendor)
            .slice(0, 5);
        } catch (err) {
          // fallback to in-memory vendor filter if query fails
          similarProducts = vendorFallback(candidates, vendor)
            .filter((p: any) => p.handle !== currentHandle)
            .slice(0, 5);
        }
        if (similarProducts.length > 0) usedFallback = true;
      }

      // If still empty and productType provided, use productType fallback
      if ((similarProducts.length === 0) && productType) {
        try {
          const typeRecs = await storefront.query(PRODUCT_RECOMMENDATIONS_QUERY, {
            variables: { first: 20, query: `product_type:"${productType}"` },
          } as any);
          similarProducts = (typeRecs?.products?.nodes ?? [])
            .filter((p: any) => p.handle !== currentHandle)
            .filter((p: any) => p.productType === productType || p.tags?.includes(productType))
            .slice(0, 5);
        } catch (err) {
          similarProducts = productTypeFallback(candidates, productType)
            .filter((p: any) => p.handle !== currentHandle)
            .slice(0, 5);
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
    console.error('Visual search error:', error);
    return Response.json(
      {error: 'Failed to find similar items'},
      {status: 500},
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
