import { Link, useLoaderData } from '@remix-run/react';
import { useEffect, useRef, useState } from 'react';
import type { Route } from './+types/_index';

import { HeroCarousel } from '~/components/HeroCarousel';
import { Container } from '~/components/ui';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'TALLA | Premium Fashion'},
    {
      name: 'description',
      content:
        'Discover curated premium fashion from local brands on TALLA. Shop new arrivals, timeless essentials, and statement pieces.',
    },
  ];
};

type CollectionsQuery = {
  collections: {
    nodes: Array<{
      id: string;
      title: string;
      handle: string;
      image?: {
        url: string;
        altText?: string;
      };
    }>;
  };
};

export async function loader({context}: Route.LoaderArgs) {
  const data = await context.storefront.query<CollectionsQuery>(
    COLLECTIONS_QUERY,
  );

  // Filter to show only these specific categories
  const categoryHandles = ['loungewear', 'basics', 'partywear', 'streetwear', 'bags'];
  const filteredCollections = data.collections?.nodes.filter(
    collection => categoryHandles.includes(collection.handle.toLowerCase())
  ) ?? [];

  return {
    collections: filteredCollections,
  };
}

export default function Homepage() {
  const { collections } = useLoaderData<typeof loader>();
  const [scrollScale, setScrollScale] = useState<Record<string, number>>({});
  const categoryRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  useEffect(() => {
    const handleScroll = () => {
      const viewportHeight = window.innerHeight;
      const headerHeight = 72; // approximate header height
      const triggerOffset = 350; // Start transition 350px earlier
      
      const newScales: Record<string, number> = {};
      
      collections.forEach((collection) => {
        const element = categoryRefs.current[collection.id];
        if (!element) return;
        
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top;
        const elementHeight = rect.height;
        
        // Calculate if element is going out of view at the top (with earlier trigger)
        if (elementTop < (headerHeight + triggerOffset) && elementTop > -elementHeight) {
          // Element is transitioning out at the top
          const progress = Math.abs(elementTop - (headerHeight + triggerOffset)) / (elementHeight + triggerOffset);
          // Scale from 1 to 1.15 as it goes up
          const scale = 1 + (progress * 0.15);
          newScales[collection.id] = Math.min(scale, 1.15);
        } else {
          newScales[collection.id] = 1;
        }
      });
      
      setScrollScale(newScales);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [collections]);

  return (
    <main className="min-h-screen bg-talla-bg">
      {/* Hero Section with proper top spacing for fixed header */}
      <section className="w-full pt-14 sm:pt-16 lg:pt-[72px]">
        <HeroCarousel />
      </section>

      {/* Categories Section */}
      <section className="w-full pt-6 pb-12 sm:pt-8 sm:pb-16 lg:pt-10 lg:pb-20">
        <Container>
          
          
          <div className="space-y-6">
            {collections.map((collection, index) => {
              const scale = scrollScale[collection.id] || 1;
              // Calculate additional margin based on scale to prevent overlap
              const additionalMargin = (scale - 1) * 100; // Adds margin proportional to scale increase
              
              return (
                <Link
                  key={collection.id}
                  ref={(el) => { categoryRefs.current[collection.id] = el; }}
                  to={`/collections/${collection.handle}`}
                  className="group relative block w-full aspect-[3/4] overflow-hidden transition-all duration-300 origin-center"
                  style={{
                    transform: `scale(${scale})`,
                    transition: 'transform 0.3s ease-out, margin 0.3s ease-out',
                    marginBottom: index < collections.length - 1 ? `${24 + additionalMargin}px` : undefined,
                  }}
                >
                {/* Category Image */}
                {collection.image && (
                  <img
                    src={collection.image.url}
                    alt={collection.image.altText || collection.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
              </Link>
            );
            })}
          </div>
        </Container>
      </section>
    </main>
  );
}

const COLLECTIONS_QUERY = `#graphql
  query Collections($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    collections(first: 10) {
      nodes {
        id
        title
        handle
        image {
          url
          altText
        }
      }
    }
  }
` as const;
