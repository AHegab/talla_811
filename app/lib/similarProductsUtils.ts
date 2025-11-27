/**
 * Utilities for filtering similar products by tag overlap and fallbacks.
 */
export function overlapTagsCount(a: string[], b: string[]) {
    if (!a || !b) return 0;
    const setB = new Set(b);
    return a.reduce((count, tag) => (setB.has(tag) ? count + 1 : count), 0);
}

export function filterByTagOverlap(candidates: any[], tags: string[], requiredOverlap: number) {
    if (!tags || tags.length === 0) return [];
    return candidates.filter((c) => {
        const overlap = overlapTagsCount(c.tags || [], tags || []);
        return overlap >= requiredOverlap;
    });
}

export function vendorFallback(candidates: any[], vendor: string) {
    if (!vendor) return [];
    return candidates.filter((c) => c.vendor === vendor);
}

export function productTypeFallback(candidates: any[], productType: string) {
    if (!productType) return [];
    return candidates.filter((c) => (c.tags?.includes(productType) || c.productType === productType));
}

export default {
    overlapTagsCount,
    filterByTagOverlap,
    vendorFallback,
    productTypeFallback,
};
