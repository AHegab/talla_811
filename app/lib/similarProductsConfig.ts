export function getSimilarProductsConfig() {
    // Default overlap requirement is 2 tags
    const overlap = Number(process.env.SIMILAR_PRODUCTS_TAG_OVERLAP ?? 2);
    // Whether to enable fallback matching by vendor/productType when tag overlap yields none
    const fallbackEnabled = (process.env.SIMILAR_PRODUCTS_FALLBACK || 'true') === 'true';
    // Whether to allow 1-tag fallback when no 2-tag results are available
    const allowOneTagFallback = (process.env.SIMILAR_PRODUCTS_ALLOW_ONE_TAG_FALLBACK || 'true') === 'true';

    return {
        overlap: Number.isFinite(overlap) ? Math.max(1, Math.floor(overlap)) : 2,
        fallbackEnabled,
        allowOneTagFallback,
    };
}

export default getSimilarProductsConfig;
