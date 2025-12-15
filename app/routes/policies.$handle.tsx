import { type Shop } from '@shopify/hydrogen/storefront-api-types';
import {
    Link,
    useLoaderData,
} from 'react-router';
import type { Route } from './+types/policies.$handle';

type SelectedPolicies = keyof Pick<
  Shop,
  'privacyPolicy' | 'shippingPolicy' | 'termsOfService' | 'refundPolicy'
>;

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: `Hydrogen | ${data?.policy.title ?? ''}`}];
};

export async function loader({params, context}: Route.LoaderArgs) {
  if (!params.handle) {
    throw new Response('No handle was passed in', {status: 404});
  }

  const policyName = params.handle.replace(
    /-([a-z])/g,
    (_: unknown, m1: string) => m1.toUpperCase(),
  ) as SelectedPolicies;

  const data = await context.storefront.query(POLICY_CONTENT_QUERY, {
    variables: {
      privacyPolicy: false,
      shippingPolicy: false,
      termsOfService: false,
      refundPolicy: false,
      [policyName]: true,
      language: context.storefront.i18n?.language,
    },
  });

  let policy = data.shop?.[policyName];

  if (!policy) {
    const fallbackMap: Record<string, {title: string; body: string}> = {
      termsOfService: {
        title: 'Terms of Service',
        body: `<h2>Terms of Service</h2>
          <p>Welcome to TALLA. By accessing or using our website and services, you agree to be bound by these Terms of Service.</p>
          <p>Please read them carefully before making a purchase or using our services. For the full Terms of Service, visit our <a href=\"/pages/terms\">Terms page</a>.</p>`,
      },
      refundPolicy: {
        title: 'Refund Policy',
        body: `<h2>Refund Policy</h2>
          <p>We offer a 30-day money-back guarantee on eligible items. If you're not satisfied, we'll refund your money.</p>
          <p>See the full Refund Policy on our <a href=\"/pages/refunds\">Refunds page</a>.</p>`,
      },
      shippingPolicy: {
        title: 'Shipping Policy',
        body: `<h2>Shipping Policy</h2>
          <p>We partner with Bosta for deliveries across Egypt. Delivery times, costs, and tracking are available on our <a href=\"/pages/shipping\">Shipping Information page</a>.</p>`,
      },
      privacyPolicy: {
        title: 'Privacy Policy',
        body: `<h2>Privacy Policy</h2>
          <p>We take your privacy seriously. Our Privacy Policy explains how we collect and use your data. Visit the <a href=\"/policies/privacy-policy\">Privacy Policy</a> for full details.</p>`,
      },
    };

    if (fallbackMap[policyName]) {
      policy = fallbackMap[policyName] as unknown as Shop[SelectedPolicies];
    }
  }

  if (!policy) {
    throw new Response('Could not find the policy', {status: 404});
  }

  return {policy};
}

export default function Policy() {
  const {policy} = useLoaderData<typeof loader>();

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-16 py-16 lg:py-24">
        {/* Back Button */}
        <Link 
          to="/policies" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-[#00F4D2] transition-colors mb-8 group"
          style={{ fontFamily: 'Quicking, sans-serif' }}
        >
          <svg 
            className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Policies
        </Link>

        {/* Header */}
        <div className="mb-12">
          <h1 
            className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight mb-4" 
            style={{ fontFamily: 'Georgia, serif' }}
          >
            {policy.title}
          </h1>
        </div>

        {/* Policy Content */}
        <div 
          className="prose prose-lg max-w-none"
          style={{ fontFamily: 'Quicking, sans-serif' }}
          dangerouslySetInnerHTML={{__html: policy.body}} 
        />

        {/* Footer CTA */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              to="/pages/contact" 
              className="inline-flex items-center justify-center px-6 py-3 bg-black text-white rounded-lg hover:bg-[#00F4D2] hover:text-black transition-all font-semibold"
              style={{ fontFamily: 'Aeonik, sans-serif' }}
            >
              Contact Support
            </Link>
            <Link 
              to="/pages/faq" 
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-black text-black rounded-lg hover:bg-black hover:text-white transition-all font-semibold"
              style={{ fontFamily: 'Aeonik, sans-serif' }}
            >
              View FAQ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/Shop
const POLICY_CONTENT_QUERY = `#graphql
  fragment Policy on ShopPolicy {
    body
    handle
    id
    title
    url
  }
  query Policy(
    $country: CountryCode
    $language: LanguageCode
    $privacyPolicy: Boolean!
    $refundPolicy: Boolean!
    $shippingPolicy: Boolean!
    $termsOfService: Boolean!
  ) @inContext(language: $language, country: $country) {
    shop {
      privacyPolicy @include(if: $privacyPolicy) {
        ...Policy
      }
      shippingPolicy @include(if: $shippingPolicy) {
        ...Policy
      }
      termsOfService @include(if: $termsOfService) {
        ...Policy
      }
      refundPolicy @include(if: $refundPolicy) {
        ...Policy
      }
    }
  }
` as const;
