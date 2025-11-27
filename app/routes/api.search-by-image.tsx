import getSimilarProductsConfig from '~/lib/similarProductsConfig';
import { filterByTagOverlap, productTypeFallback, vendorFallback } from '~/lib/similarProductsUtils';
import type { Route } from './+types/api.search-by-image';

export async function action({request, context}: Route.ActionArgs) {
  try {
    const body = (await request.json()) as {imageUrl: string; tags?: string[]; currentHandle?: string};
    const {imageUrl, tags = [], currentHandle, vendor, productType} = body;
    const config = getSimilarProductsConfig();
    const configOverlap = config.overlap;

    // TODO: Implement actual visual search using AI/ML
    // This is a placeholder that returns mock similar products
    
    // For now, return empty array or fetch random products from Shopify
    const {storefront} = context;

    // Query for some products as candidates
    const {products} = await storefront.query(SIMILAR_PRODUCTS_QUERY, {
      variables: {first: 20},
    });

    const candidates = products.nodes.map((product: any) => ({
      handle: product.handle,
      title: product.title,
      image: product.featuredImage?.url || '',
      price: {
        amount: product.priceRange.minVariantPrice.amount,
        currencyCode: product.priceRange.minVariantPrice.currencyCode,
      },
      vendor: product.vendor,
      tags: product.tags || [],
      id: product.id,
      productType: product.productType,
      featuredImage: product.featuredImage,
    }));

    // Require at least 2 tags in common, but if source product has fewer than 2 tags,
    // require at least the same number as source tags (i.e., if source has 1 tag, require 1 match)
    const requiredOverlap = tags.length >= configOverlap ? configOverlap : tags.length;
    let usedFallback = false;

    // Filter out the current product and keep only those with sufficient tag overlap
    let similarProducts = filterByTagOverlap(candidates, tags, requiredOverlap)
      .filter((p) => p.handle !== currentHandle)
      .slice(0, 5);

    // If none, and allow one-tag fallback is set, retry with 1 overlap
    if (similarProducts.length === 0 && config.allowOneTagFallback && requiredOverlap > 1) {
      similarProducts = filterByTagOverlap(candidates, tags, 1)
        .filter((p) => p.handle !== currentHandle)
        .slice(0, 5);
      if (similarProducts.length > 0) usedFallback = true;
    }

    // If no results and fallback is enabled, try vendor or productType fallback
    if ((similarProducts.length === 0) && config.fallbackEnabled) {
      // Vendor fallback first
      if (vendor) {
        similarProducts = vendorFallback(candidates, vendor)
          .filter((p) => p.handle !== currentHandle)
          .slice(0, 5);
        if (similarProducts.length > 0) usedFallback = true;
      }

      // If still empty and productType provided, use productType fallback
      if ((similarProducts.length === 0) && productType) {
        similarProducts = productTypeFallback(candidates, productType)
          .filter((p) => p.handle !== currentHandle)
          .slice(0, 5);
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
