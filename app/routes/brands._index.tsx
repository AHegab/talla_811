import { Image } from '@shopify/hydrogen';
import { Link, useLoaderData } from 'react-router';
import type { Route } from './+types/brands._index';

/**
 * Brands Index Page
 *
 * Fetches all brand collections from the "brands" menu in Shopify.
 * Each menu item should link to a Collection that represents one brand.
 *
 * To add this page to your navigation:
 * - Add a menu item in Shopify Admin linking to /brands
 * - Or manually add <Link to="/brands">Brands</Link> in your Header component
 */

// Page metadata
export const meta: Route.MetaFunction = () => {
  return [
    { title: 'TALLA | Brands' },
    { name: 'description', content: 'Shop our curated collection of premium fashion brands.' },
  ];
};

interface BrandCard {
  id: string; 
  title: string;
  handle: string;
  // Keep the original image object so we can use Hydrogen's Image component
  image: any | null;
  imageAlt: string | null;
  url: string;
}

export async function loader({ context }: Route.LoaderArgs) {
  const { storefront } = context;

  // Use a shorter cache strategy in development so menu changes appear immediately.
  // In production, continue using a long-lived cache for performance.
  const cacheStrategy =
    process.env.NODE_ENV === 'development'
      ? storefront.CacheNone()
      : storefront.CacheLong();

  // Fetch the "brands" menu from Shopify
  const { menu } = await storefront.query(BRANDS_MENU_QUERY, {
    variables: {
      handle: 'brands',
    },
    cache: cacheStrategy,
  });

  if (!menu) {
    throw new Response('Brands menu not found', { status: 404 });
  }

  // Debug log the menu items so we can verify what the server returned
  // (This appears in server logs, not the browser console.)
  // eslint-disable-next-line no-console
  console.log('Brands menu items:', menu?.items?.map((i: any) => ({ id: i.id, title: i.title, url: i.url, resourceType: i.resource?.__typename })));

  // Transform menu items into brand cards. We include any menu item so folks who added
  // menu links as custom URLs (eg. /collections/brand-handle) can still see the brand.
  // For custom URL items that look like collections, we'll try to fetch the collection
  // by handle to acquire image metadata.
  const fallbackHandles = new Set<string>();
  const itemsWithFallbackHandle: Record<string, any> = {};

  for (const item of menu.items) {
    if (item.resource?.__typename !== 'Collection') {
      const fallbackHandle = (item.url || '')?.match(/\/collections\/([^/?#]+)/)?.[1] ?? null;
      if (fallbackHandle) {
        fallbackHandles.add(fallbackHandle);
        itemsWithFallbackHandle[item.id] = fallbackHandle;
      }
    }
  }

  // If we discovered fallback handles, fetch collection details for each handle
  const fallbackCollectionsByHandle: Record<string, any> = {};
  if (fallbackHandles.size > 0) {
    const handles = [...fallbackHandles];
    const collectionQueryPromises = handles.map((h) =>
      storefront
        .query(GET_COLLECTION_BY_HANDLE_QUERY, {
          variables: { handle: h },
          cache: cacheStrategy,
        })
        .then((res: any) => ({ handle: h, collection: res.collectionByHandle }))
        .catch((err: unknown) => {
          // Swallow errors per loader pattern — logging is enough
          // eslint-disable-next-line no-console
          console.error(`Failed to fetch collection for handle: ${h}`, err);
          return { handle: h, collection: null };
        })
    );

    const collectionResults = await Promise.all(collectionQueryPromises);
    for (const result of collectionResults) {
      if (result.collection) fallbackCollectionsByHandle[result.handle] = result.collection;
    }
    // eslint-disable-next-line no-console
    console.log('Fetched collections for fallback handles:', Object.keys(fallbackCollectionsByHandle));
  }

  const brands: BrandCard[] = menu.items.map((item: any) => {
    if (item.resource?.__typename === 'Collection') {
      const collection = item.resource;
      const image = collection.image || null;
      return {
        id: collection.id,
        title: collection.title,
        handle: collection.handle,
        image: image,
        imageAlt: image?.altText || collection.title,
        url: `/collections/${collection.handle}`,
      };
    }

    // Fallback: If the menu item doesn't point at a 'Collection' resource but links
    // to a collections URL (or is a custom URL pointing to /collections/handle), keep it.
    const fallbackHandle = itemsWithFallbackHandle[item.id];
    const fetchedCollection = fallbackHandle ? fallbackCollectionsByHandle[fallbackHandle] : null;
    if (fetchedCollection) {
      const img = fetchedCollection.image || null;
      return {
        id: fetchedCollection.id,
        title: fetchedCollection.title,
        handle: fetchedCollection.handle,
        image: img,
        imageAlt: img?.altText || fetchedCollection.title,
        url: `/collections/${fetchedCollection.handle}`,
      };
    }
    // else generic fallback card without image
    return {
      id: item.id,
      title: item.title,
      handle: fallbackHandle ?? item.title,
      image: null,
      imageAlt: item.title,
      url: item.url || '#',
    };
  });
    

  // Debug logging removed

  return { brands };
}

export default function BrandsIndex() {
  const { brands } = useLoaderData<typeof loader>();
  console.log(brands);
  // Debug logging removed

  return (
    <div className="min-h-screen bg-[var(--color-bg,#FBFBFB)] overflow-x-hidden">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-12 lg:py-16">
        {/* Page Header */}
        <header className="mb-12 text-center">
          <h1
            className="text-4xl md:text-5xl lg:text-6xl tracking-tight text-[var(--color-text,#292929)] mb-4"
            style={{ fontFamily: '"Playfair Display SC", serif' }}
          >
            Brands
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our curated selection of premium fashion brands
          </p>
        </header>

        {/* Debug box removed */}

        {/* Brands Grid */}
        {brands.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No brands available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 lg:gap-8">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                to={brand.url}
                prefetch="intent"
                className="group flex flex-col items-center justify-center rounded-2xl border border-[var(--color-surface,#DDDEE2)] bg-[var(--color-bg,#FBFBFB)] p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              >
                {/* Brand Logo */}
                <div className="w-full aspect-square mb-4 flex items-center justify-center">
                  {brand.image ? (
                    <Image
                      data={brand.image}
                      alt={brand.imageAlt || brand.title}
                      aspectRatio="1/1"
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                      sizes="(min-width: 45em) 400px, 100vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                      <span
                        className="text-2xl font-semibold text-gray-400 uppercase tracking-wider"
                        style={{ fontFamily: '"Playfair Display SC", serif' }}
                      >
                        {brand.title.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Brand Name */}
                <h2 className="text-sm md:text-base font-medium uppercase tracking-wider text-[var(--color-text,#292929)] text-center">
                  {brand.title}
                </h2>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// GraphQL Query to fetch brands menu
const BRANDS_MENU_QUERY = `#graphql
  query BrandsMenu($handle: String!) {
    menu(handle: $handle) {
      id
      items {
        id
        title
        url
        resource {
          __typename
          ... on Collection {
            id
            title
            handle
            image {
              id
              url
              altText
              width
              height
            }
          }
        }
      }
    }
  }
` as const;

// GraphQL Query to fetch a collection by handle (for URL fallback items)
const GET_COLLECTION_BY_HANDLE_QUERY = `#graphql
  query CollectionByHandle($handle: String!) {
    collectionByHandle(handle: $handle) {
      id
      title
      handle
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
