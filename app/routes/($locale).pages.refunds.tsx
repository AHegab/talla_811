export const meta = () => {
  return [
    { title: 'Refund Policy | TALLA' },
    { name: 'description', content: 'Learn about our refund policy and how we process refunds' },
  ];
};

export async function loader() {
  return {};
}

export default function RefundsPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-16 py-16 lg:py-24">
        {/* Header */}
        <div className="mb-12">
          <h1 
            className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight mb-4" 
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Refund Policy
          </h1>
          <p className="text-lg text-gray-600" style={{ fontFamily: 'Quicking, sans-serif' }}>
            We stand behind the quality of our products and want you to be completely satisfied with your purchase.
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none space-y-8" style={{ fontFamily: 'Quicking, sans-serif' }}>
          
          {/* Overview */}
          <section className="bg-[#00F4D2]/5 rounded-2xl p-8">
            <h2 className="text-2xl font-semibold mb-4 m-0" style={{ fontFamily: 'Aeonik, sans-serif' }}>
              Our Commitment to You
            </h2>
            <p className="text-gray-700 leading-relaxed mb-0">
              At TALLA, we offer a <strong>30-day money-back guarantee</strong> on all eligible items. If you're not 
              completely satisfied with your purchase, we'll refund your money—no questions asked.
            </p>
          </section>

          {/* Eligibility */}
          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Aeonik, sans-serif' }}>
              Refund Eligibility
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To be eligible for a refund, your item must meet the following conditions:
            </p>
            <ul className="list-disc list-inside space-y-3 text-gray-700 ml-4">
              <li>Returned within <strong>30 days</strong> of delivery date</li>
              <li>In unworn, unwashed, and unused condition</li>
              <li>With all original tags and packaging intact</li>
              <li>Not on the non-returnable items list (see below)</li>
              <li>Accompanied by proof of purchase (order number or receipt)</li>
            </ul>
          </section>

          {/* Non-Refundable Items */}
          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Aeonik, sans-serif' }}>
              Non-Refundable Items
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              For hygiene and safety reasons, the following items cannot be returned or refunded:
            </p>
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl">
              <ul className="list-disc list-inside space-y-2 text-gray-800 m-0">
                <li>Underwear and intimate apparel</li>
                <li>Swimwear and beachwear</li>
                <li>Earrings and pierced jewelry</li>
                <li>Beauty and cosmetic products</li>
                <li>Items marked as "Final Sale" or "Clearance"</li>
                <li>Gift cards and digital products</li>
                <li>Custom or personalized items</li>
              </ul>
            </div>
          </section>

          {/* Refund Process */}
          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Aeonik, sans-serif' }}>
              How to Request a Refund
            </h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#00F4D2] text-black rounded-full flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="font-semibold text-gray-900 mb-2">Contact Customer Service</h3>
                  <p className="text-gray-700 text-sm">
                    Email us at <a href="mailto:returns@talla.com" className="text-[#00F4D2] hover:underline">returns@talla.com</a> with 
                    your order number and reason for return. We'll respond within 24 hours.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#00F4D2] text-black rounded-full flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="font-semibold text-gray-900 mb-2">Receive Return Authorization</h3>
                  <p className="text-gray-700 text-sm">
                    We'll send you a Return Authorization (RA) number and a prepaid return shipping label via email.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#00F4D2] text-black rounded-full flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="font-semibold text-gray-900 mb-2">Pack and Ship</h3>
                  <p className="text-gray-700 text-sm">
                    Securely pack your item(s) in the original packaging, attach the return label, and drop it off at 
                    any authorized Bosta location or arrange pickup.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#00F4D2] text-black rounded-full flex items-center justify-center font-bold text-lg">
                  4
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="font-semibold text-gray-900 mb-2">Get Your Refund</h3>
                  <p className="text-gray-700 text-sm">
                    Once we receive and inspect your return (typically 3-5 business days), we'll process your refund 
                    within 5-7 business days.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Refund Methods */}
          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Aeonik, sans-serif' }}>
              Refund Methods & Processing Times
            </h2>
            <div className="bg-gray-50 rounded-xl overflow-hidden">
              <div className="divide-y divide-gray-200">
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">Credit/Debit Card Payments</h3>
                      <p className="text-gray-700 text-sm">
                        Refunds will be credited to your original payment method within <strong>5-7 business days</strong> after 
                        we process your return. Depending on your bank, it may take an additional 3-5 business days to appear 
                        in your account.
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <span className="text-sm font-semibold text-[#00F4D2]">5-7 days</span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">Cash on Delivery Orders</h3>
                      <p className="text-gray-700 text-sm">
                        For COD orders, you can choose between a bank transfer (provide bank details) or store credit. 
                        Bank transfers take <strong>7-10 business days</strong>. Store credit is issued immediately upon return approval.
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <span className="text-sm font-semibold text-[#00F4D2]">7-10 days</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Shipping Costs */}
          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Aeonik, sans-serif' }}>
              Return Shipping Costs
            </h2>
            <div className="space-y-4">
              <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-xl">
                <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Free Return Shipping
                </h3>
                <p className="text-green-900 text-sm m-0">
                  If your return is due to our error (wrong item, defective product, or quality issue), we'll provide 
                  a prepaid return label at no cost to you.
                </p>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Standard Return Shipping
                </h3>
                <p className="text-blue-900 text-sm m-0">
                  For returns due to sizing issues, change of mind, or personal preference, a return shipping fee of 
                  <strong> EGP 50</strong> will be deducted from your refund amount.
                </p>
              </div>

              <p className="text-gray-700 text-sm italic">
                Note: Original shipping fees are non-refundable except in cases of defective or incorrect items.
              </p>
            </div>
          </section>

          {/* Partial Refunds */}
          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Aeonik, sans-serif' }}>
              Partial Refunds
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              In certain situations, only partial refunds may be granted:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Items with obvious signs of wear or use</li>
              <li>Items without original tags or packaging</li>
              <li>Items returned more than 30 days after delivery</li>
              <li>Items that are damaged but not due to our error</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              The refund amount will be determined based on the condition of the item upon return. We'll notify you 
              of the partial refund amount before processing.
            </p>
          </section>

          {/* Exchanges */}
          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Aeonik, sans-serif' }}>
              Exchanges vs. Refunds
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Need a different size or color? We recommend processing an exchange instead of a refund, which is often faster:
            </p>
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex gap-4 items-start">
                <svg className="w-6 h-6 text-[#00F4D2] flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <div>
                  <p className="text-gray-700 text-sm mb-2">
                    <strong>Exchange Process:</strong> We'll ship your replacement item as soon as we receive your return, 
                    often before processing the return inspection. This means you get your new item faster!
                  </p>
                  <a 
                    href="/pages/returns" 
                    className="text-[#00F4D2] hover:underline text-sm font-semibold"
                  >
                    Learn more about exchanges →
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Damaged or Defective Items */}
          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Aeonik, sans-serif' }}>
              Damaged or Defective Items
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you receive a damaged or defective item, please contact us immediately:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
              <li>Email <a href="mailto:support@talla.com" className="text-[#00F4D2] hover:underline">support@talla.com</a> within 
                <strong> 48 hours</strong> of delivery</li>
              <li>Include photos of the damage/defect and your order number</li>
              <li>We'll send a prepaid return label and process your refund or replacement immediately</li>
              <li>No return shipping fees will be charged for damaged/defective items</li>
            </ol>
          </section>

          {/* Late or Missing Refunds */}
          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Aeonik, sans-serif' }}>
              Late or Missing Refunds
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              If you haven't received your refund within the expected timeframe:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
              <li>Check your bank account or credit card statement again</li>
              <li>Contact your credit card company or bank (processing times vary)</li>
              <li>If you've done all of this and still haven't received your refund, contact us at 
                <a href="mailto:refunds@talla.com" className="text-[#00F4D2] hover:underline"> refunds@talla.com</a>
              </li>
            </ol>
          </section>

          {/* Contact */}
          <section className="bg-gray-50 rounded-2xl p-8 mt-12">
            <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Aeonik, sans-serif' }}>
              Questions About Refunds?
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Our customer service team is here to help with any refund questions or concerns.
            </p>
            <div className="space-y-3 mb-6">
              <p className="text-gray-700">
                <strong>Returns & Refunds Email:</strong>{' '}
                <a href="mailto:returns@talla.com" className="text-[#00F4D2] hover:underline">returns@talla.com</a>
              </p>
              <p className="text-gray-700">
                <strong>General Support:</strong>{' '}
                <a href="mailto:tallamanagement.shop@gmail.com" className="text-[#00F4D2] hover:underline">tallamanagement.shop@gmail.com</a>
              </p>
              <p className="text-gray-700">
                <strong>Phone:</strong>{' '}
                <a href="tel:+201500678224" className="text-[#00F4D2] hover:underline">+20 15 00678224</a>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="/pages/contact" 
                className="inline-flex items-center justify-center px-6 py-3 bg-black text-white rounded-lg hover:bg-[#00F4D2] hover:text-black transition-all font-semibold"
                style={{ fontFamily: 'Aeonik, sans-serif' }}
              >
                Contact Support
              </a>
              <a 
                href="/pages/returns" 
                className="inline-flex items-center justify-center px-6 py-3 border-2 border-black text-black rounded-lg hover:bg-black hover:text-white transition-all font-semibold"
                style={{ fontFamily: 'Aeonik, sans-serif' }}
              >
                View Returns Policy
              </a>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
