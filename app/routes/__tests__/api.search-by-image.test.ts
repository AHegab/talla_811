/// <reference types="vitest" />
import { action } from '../api.search-by-image';

function makeRequest(body: Record<string, any>) {
    return {
        json: async () => body,
    } as any;
}

describe('api.search-by-image action', () => {
    it('returns tag-overlap matches when available', async () => {
        const candidateProducts = [
            { handle: 'a', id: '1', tags: ['men', 'blazer'], vendor: 'Talla', featuredImage: { url: 'a.jpg' }, priceRange: { minVariantPrice: { amount: '50', currencyCode: 'USD' } } },
            { handle: 'b', id: '2', tags: ['women', 'dress'], vendor: 'Aurora', featuredImage: { url: 'b.jpg' }, priceRange: { minVariantPrice: { amount: '60', currencyCode: 'USD' } } },
        ];

        const mockContext: any = {
            storefront: {
                query: async () => ({ products: { nodes: candidateProducts } }),
            },
        };

        const request = makeRequest({ imageUrl: 'https://example.com', tags: ['men', 'blazer'], currentHandle: 'c' });
        const res = await action({ request, context: mockContext } as any);
        const json = (await res.json()) as any;
        expect(Array.isArray(json.products)).toBe(true);
        expect(json.products.length).toBeGreaterThan(0);
        expect(json.products[0].handle).toBe('a');
    });

    it('returns vendor fallback when no tag matches', async () => {
        const candidateProducts = [
            { handle: 'a', id: '1', tags: ['women', 'top'], vendor: 'Talla', featuredImage: { url: 'a.jpg' }, priceRange: { minVariantPrice: { amount: '50', currencyCode: 'USD' } } },
            { handle: 'b', id: '2', tags: ['women', 'dress'], vendor: 'Aurora', featuredImage: { url: 'b.jpg' }, priceRange: { minVariantPrice: { amount: '60', currencyCode: 'USD' } } },
        ];

        const mockContext: any = {
            storefront: {
                query: async () => ({ products: { nodes: candidateProducts } }),
            },
        };

        const request = makeRequest({ imageUrl: 'https://example.com', tags: ['men', 'blazer'], currentHandle: 'c', vendor: 'Talla' });
        const res = await action({ request, context: mockContext } as any);
        const json = (await res.json()) as any;
        // console.log('vendor fallback json:', JSON.stringify(json, null, 2));
        expect(json.products.length).toBe(1);
        expect(json.products[0].vendor).toBe('Talla');
    });

    it('falls back to 1-tag overlap when allowed', async () => {
        const candidateProducts = [
            { handle: 'a', id: '1', tags: ['men'], vendor: 'Talla', featuredImage: { url: 'a.jpg' }, priceRange: { minVariantPrice: { amount: '50', currencyCode: 'USD' } } },
        ];

        const mockContext: any = {
            storefront: {
                query: async () => ({ products: { nodes: candidateProducts } }),
            },
        };

        process.env.SIMILAR_PRODUCTS_ALLOW_ONE_TAG_FALLBACK = 'true';
        process.env.SIMILAR_PRODUCTS_TAG_OVERLAP = '2';

        const request = makeRequest({ imageUrl: 'https://example.com', tags: ['men', 'blazer'], currentHandle: 'c', allowOneTagFallback: true });
        const res = await action({ request, context: mockContext } as any);
        const json = (await res.json()) as any;
        expect(json.products.length).toBe(1);
    });

    it('does not return 1-tag overlap when disabled', async () => {
        const candidateProducts = [
            { handle: 'a', id: '1', tags: ['men'], vendor: 'Talla', featuredImage: { url: 'a.jpg' }, priceRange: { minVariantPrice: { amount: '50', currencyCode: 'USD' } } },
        ];

        const mockContext: any = {
            storefront: {
                query: async () => ({ products: { nodes: candidateProducts } }),
            },
        };

        process.env.SIMILAR_PRODUCTS_ALLOW_ONE_TAG_FALLBACK = 'false';
        process.env.SIMILAR_PRODUCTS_TAG_OVERLAP = '2';

        const request = makeRequest({ imageUrl: 'https://example.com', tags: ['men', 'blazer'], currentHandle: 'c', allowOneTagFallback: false });
        const res = await action({ request, context: mockContext } as any);
        const json = (await res.json()) as any;
        // console.log('1-tag overlap disabled json:', JSON.stringify(json, null, 2));
        expect(json.products.length).toBe(0);
    });
});
