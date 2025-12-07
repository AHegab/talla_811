import {useLoaderData, Link} from 'react-router';
import type {Route} from './+types/collections._index';
import {getPaginationVariables, Image} from '@shopify/hydrogen';
import type {CollectionFragment} from 'storefrontapi.generated';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, request}: Route.LoaderArgs) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 4,
  });

  const [{collections}] = await Promise.all([
    context.storefront.query(COLLECTIONS_QUERY, {
      variables: paginationVariables,
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {collections};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function Collections() {
  const {collections} = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-[#FDF8F7]">
      {/* HERO SECTION */}
      <section className="relative py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-16">
          <div className="text-center">
            <p
              className="text-[11px] tracking-[0.28em] uppercase text-[#5A4A4C]/70 mb-3"
              style={{
                fontFamily: 'Georgia, "Playfair Display SC", serif',
              }}
            >
              Explore Our
            </p>
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[0.18em] uppercase text-[#1F191A] mb-4"
              style={{fontFamily: 'Aeonik, sans-serif'}}
            >
              Collections
            </h1>
            <div className="mx-auto h-[2px] w-16 rounded-full bg-[#1F191A] mb-5" />
            <p
              className="mx-auto max-w-2xl text-sm sm:text-base leading-relaxed text-[#5A4A4C]"
              style={{fontFamily: 'Quicking, sans-serif'}}
            >
              Discover our curated collections of premium fashion pieces, thoughtfully designed for the modern wardrobe.
            </p>
          </div>
        </div>
      </section>

      {/* COLLECTIONS GRID */}
      <section className="pb-20 lg:pb-24">
        <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-16">
          <PaginatedResourceSection<CollectionFragment>
            connection={collections}
            resourcesClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10"
          >
            {({node: collection, index}) => (
              <CollectionItem
                key={collection.id}
                collection={collection}
                index={index}
              />
            )}
          </PaginatedResourceSection>
        </div>
      </section>
    </div>
  );
}

function CollectionItem({
  collection,
  index,
}: {
  collection: CollectionFragment;
  index: number;
}) {
  return (
    <Link
      className="group block"
      key={collection.id}
      to={`/collections/${collection.handle}`}
      prefetch="intent"
    >
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all duration-300 group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] group-hover:-translate-y-1">
        {collection?.image && (
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image
              alt={collection.image.altText || collection.title}
              data={collection.image}
              loading={index < 3 ? 'eager' : undefined}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        )}

        {/* Collection Title */}
        <div className="p-5 sm:p-6">
          <h3
            className="text-base sm:text-lg font-semibold tracking-[0.12em] uppercase text-[#1F191A] transition-colors duration-200 group-hover:text-[#5A4A4C]"
            style={{fontFamily: 'Aeonik, sans-serif'}}
          >
            {collection.title}
          </h3>

          {/* Explore link */}
          <div className="mt-3 flex items-center gap-2 text-[11px] tracking-[0.12em] uppercase text-[#5A4A4C] font-medium transition-all duration-200 group-hover:gap-3 group-hover:text-[#1F191A]">
            <span>Explore</span>
            <svg
              className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}

const COLLECTIONS_QUERY = `#graphql
  fragment Collection on Collection {
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
  query StoreCollections(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    collections(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      nodes {
        ...Collection
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
` as const;
