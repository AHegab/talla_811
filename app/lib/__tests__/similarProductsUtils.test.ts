/// <reference types="vitest" />
import {
    filterByTagOverlap,
    overlapTagsCount,
    productTypeFallback,
    vendorFallback,
} from '../similarProductsUtils';

describe('similarProductsUtils', () => {
    it('counts overlapping tags correctly', () => {
        const a = ['blazer', 'men', 'formal'];
        const b = ['men', 'casual', 'blazer'];
        expect(overlapTagsCount(a, b)).toBe(2);
    });

    it('filters by required overlap', () => {
        const candidates = [
            { tags: ['men', 'blazer'] },
            { tags: ['women', 'dress'] },
            { tags: ['men', 'casual', 'blazer'] },
        ];
        const matches = filterByTagOverlap(candidates as any, ['men', 'blazer'], 2);
        expect(matches.length).toBe(2);
    });

    it('vendor fallback returns only vendor matches', () => {
        const candidates = [
            { vendor: 'Talla' },
            { vendor: 'Aurora' },
            { vendor: 'Talla' },
        ];
        const matches = vendorFallback(candidates as any, 'Talla');
        expect(matches.length).toBe(2);
    });

    it('productType fallback returns productType matches', () => {
        const candidates = [
            { tags: ['dress'] },
            { tags: ['jacket'], productType: 'Jackets' },
            { tags: [], productType: 'Dresses' },
        ];
        const matches = productTypeFallback(candidates as any, 'Jackets');
        expect(matches.length).toBe(1);
    });
});
