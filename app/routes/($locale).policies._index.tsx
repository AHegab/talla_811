import type { LoaderFunctionArgs } from 'react-router';
import { Link, useLoaderData } from 'react-router';
import type { PoliciesQuery, PolicyItemFragment } from 'storefrontapi.generated';

export async function loader({context}: LoaderFunctionArgs) {
  const data: PoliciesQuery = await context.storefront.query(POLICIES_QUERY);

  const shopPolicies = data.shop;
  const policies: PolicyItemFragment[] = [
    shopPolicies?.privacyPolicy,
    shopPolicies?.shippingPolicy,
    shopPolicies?.termsOfService,
    shopPolicies?.refundPolicy,
    shopPolicies?.subscriptionPolicy,
  ].filter((policy): policy is PolicyItemFragment => policy != null);

  if (!policies.length) {
    throw new Response('No policies found', {status: 404});
  }

  return {policies};
}

export default function Policies() {
  const {policies} = useLoaderData<typeof loader>();

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-16 py-16 lg:py-24">
        {/* Header */}
        <div className="mb-12">
          <h1 
            className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight mb-4" 
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Policies
          </h1>
          <p className="text-lg text-gray-600" style={{ fontFamily: 'Quicking, sans-serif' }}>
            Review our store policies and legal information.
          </p>
        </div>

        {/* Policies Grid */}
        <div className="grid gap-6">
          {policies.map((policy) => (
            <Link 
              key={policy.id}
              to={`/policies/${policy.handle}`}
              className="group bg-gray-50 hover:bg-black rounded-2xl p-8 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <h2 
                  className="text-2xl font-semibold text-gray-900 group-hover:text-white transition-colors"
                  style={{ fontFamily: 'Aeonik, sans-serif' }}
                >
                  {policy.title}
                </h2>
                <svg 
                  className="w-6 h-6 text-gray-400 group-hover:text-[#00F4D2] transition-colors transform group-hover:translate-x-2 transition-transform"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* Help Section */}
        <div className="mt-16 bg-gray-50 rounded-2xl p-8">
          <h2 
            className="text-2xl font-semibold mb-4" 
            style={{ fontFamily: 'Aeonik, sans-serif' }}
          >
            Have Questions?
          </h2>
          <p className="text-gray-700 mb-6" style={{ fontFamily: 'Quicking, sans-serif' }}>
            If you need more information or have specific questions about our policies, our customer service team is here to help.
          </p>
          <Link 
            to="/pages/contact" 
            className="inline-flex items-center justify-center px-6 py-3 bg-black text-white rounded-lg hover:bg-[#00F4D2] hover:text-black transition-all font-semibold"
            style={{ fontFamily: 'Aeonik, sans-serif' }}
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}

const POLICIES_QUERY = `#graphql
  fragment PolicyItem on ShopPolicy {
    id
    title
    handle
  }
  query Policies ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    shop {
      privacyPolicy {
        ...PolicyItem
      }
      shippingPolicy {
        ...PolicyItem
      }
      termsOfService {
        ...PolicyItem
      }
      refundPolicy {
        ...PolicyItem
      }
      subscriptionPolicy {
        id
        title
        handle
      }
    }
  }
` as const;
