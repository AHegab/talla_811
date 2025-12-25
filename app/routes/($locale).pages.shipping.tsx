export const meta = () => {
  return [
    { title: 'Shipping Information | TALLA' },
    { name: 'description', content: 'Learn about our shipping options and delivery times powered by Bosta' },
  ];
};

export async function loader() {
  return {};
}

export default function ShippingPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-16 py-16 lg:py-24">
        {/* Header */}
        <div className="mb-12">
          <h1 
            className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight mb-4" 
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Shipping Information
          </h1>
          <p className="text-lg text-gray-600" style={{ fontFamily: 'Quicking, sans-serif' }}>
            Fast, reliable delivery powered by Bosta. We're committed to getting your order to you quickly and safely.
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div className="space-y-8" style={{ fontFamily: 'Quicking, sans-serif' }}>
            
            {/* Delivery Partners */}
            <section className="bg-[#00F4D2]/5 rounded-2xl p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-[#00F4D2] rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold m-0" style={{ fontFamily: 'Aeonik, sans-serif' }}>
                  Powered by Bosta
                </h2>
              </div>
              <p className="text-gray-700 leading-relaxed mb-0">
                We've partnered with <strong>Bosta</strong>, Egypt's leading delivery platform, to ensure your orders arrive 
                quickly and safely. Bosta's advanced logistics network and real-time tracking give you complete visibility 
                of your shipment from warehouse to doorstep.
              </p>
            </section>

            {/* Delivery Times */}
            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Aeonik, sans-serif' }}>
                Delivery Times
              </h2>
              <div className="space-y-4">
                <div className="border-l-4 border-[#00F4D2] pl-6 py-2">
                  <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: 'Aeonik, sans-serif' }}>
                    Cairo & Giza
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    <strong>2-3 business days</strong> for standard delivery<br />
                    <strong>Next-day delivery</strong> available for orders placed before 2 PM
                  </p>
                </div>

                <div className="border-l-4 border-gray-300 pl-6 py-2">
                  <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: 'Aeonik, sans-serif' }}>
                    Alexandria & Major Cities
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    <strong>3-4 business days</strong> for standard delivery<br />
                    Includes: Alexandria, Mansoura, Tanta, Zagazig, Ismailia, Suez
                  </p>
                </div>

                <div className="border-l-4 border-gray-300 pl-6 py-2">
                  <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: 'Aeonik, sans-serif' }}>
                    Other Governorates
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    <strong>4-6 business days</strong> for standard delivery<br />
                    Remote areas may take an additional 1-2 days
                  </p>
                </div>
              </div>
            </section>

            {/* Shipping Costs */}
            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Aeonik, sans-serif' }}>
                Shipping Costs
              </h2>
              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                  <div>
                    <p className="font-semibold text-gray-900">Free Standard Shipping</p>
                    <p className="text-sm text-gray-600">Orders over EGP 1,000</p>
                  </div>
                  <span className="text-2xl font-bold text-[#00F4D2]">FREE</span>
                </div>
                
                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                  <div>
                    <p className="font-semibold text-gray-900">Standard Shipping</p>
                    <p className="text-sm text-gray-600">Orders under EGP 1,000</p>
                  </div>
                  <span className="text-xl font-semibold text-gray-900">EGP 80</span>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-900">Express Delivery</p>
                    <p className="text-sm text-gray-600">Next-day in Cairo & Alexandria</p>
                  </div>
                  <span className="text-xl font-semibold text-gray-900">EGP 100</span>
                </div>
              </div>
            </section>

            {/* Order Tracking */}
            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Aeonik, sans-serif' }}>
                Track Your Order
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Once your order ships, you'll receive:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                <li>A confirmation email with your <strong>Bosta tracking number</strong></li>
                <li>Real-time SMS updates on your delivery status</li>
                <li>A link to track your shipment on Bosta's platform</li>
                <li>Estimated delivery date and time window</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                You can also track your order directly from your account dashboard on our website. 
                Simply log in and visit the "Orders" section to see real-time updates.
              </p>
            </section>

            {/* Order Processing */}
            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Aeonik, sans-serif' }}>
                Order Processing
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                All orders are processed within <strong>1-2 business days</strong> (excluding weekends and holidays). 
                You'll receive a confirmation email once your order has been placed, and another email once it ships 
                with your tracking information.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <p className="text-sm text-blue-900 m-0">
                  <strong>📦 Pro Tip:</strong> Orders placed on Friday evenings or weekends will be processed on the 
                  next business day (usually Sunday in Egypt).
                </p>
              </div>
            </section>

            {/* Delivery Options */}
            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Aeonik, sans-serif' }}>
                Delivery Options
              </h2>
              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2" style={{ fontFamily: 'Aeonik, sans-serif' }}>
                    <svg className="w-5 h-5 text-[#00F4D2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Home Delivery
                  </h3>
                  <p className="text-gray-700 text-sm">
                    Our Bosta driver will deliver your order directly to your address. 
                    You'll receive a call 30 minutes before arrival.
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2" style={{ fontFamily: 'Aeonik, sans-serif' }}>
                    <svg className="w-5 h-5 text-[#00F4D2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Cash on Delivery (COD)
                  </h3>
                  <p className="text-gray-700 text-sm">
                    Pay when you receive your order. Bosta accepts cash payments upon delivery. 
                    Please have exact change when possible.
                  </p>
                </div>
              </div>
            </section>

            {/* Shipping Restrictions */}
            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Aeonik, sans-serif' }}>
                Important Information
              </h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Please ensure someone is available to receive the delivery during business hours</li>
                <li>Our drivers will attempt delivery up to <strong>3 times</strong> before returning the package</li>
                <li>Bosta will contact you via phone/SMS before each delivery attempt</li>
                <li>If delivery fails after 3 attempts, the order will be returned and you'll be refunded (minus shipping costs)</li>
                <li>P.O. Box addresses are not accepted - please provide a physical street address</li>
              </ul>
            </section>

            {/* Damaged Items */}
            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Aeonik, sans-serif' }}>
                Damaged or Lost Packages
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                All shipments are insured through Bosta. If your package arrives damaged or goes missing:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Contact us immediately at <a href="mailto:tallamanagement.shop@gmail.com" className="text-[#00F4D2] hover:underline">tallamanagement.shop@gmail.com</a></li>
                <li>Provide photos of the damaged package (if applicable)</li>
                <li>Include your order number and tracking information</li>
                <li>We'll file a claim with Bosta and send you a replacement or full refund within 5-7 business days</li>
              </ol>
            </section>

            {/* Contact */}
            <section className="bg-gray-50 rounded-2xl p-8 mt-12">
              <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Aeonik, sans-serif' }}>
                Questions About Shipping?
              </h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                Our customer service team is here to help with any shipping questions or concerns.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="/pages/contact" 
                  className="inline-flex items-center justify-center px-6 py-3 bg-black text-white rounded-lg hover:bg-[#00F4D2] hover:text-black transition-all font-semibold"
                  style={{ fontFamily: 'Aeonik, sans-serif' }}
                >
                  Contact Support
                </a>
                <a 
                  href="/pages/faq" 
                  className="inline-flex items-center justify-center px-6 py-3 border-2 border-black text-black rounded-lg hover:bg-black hover:text-white transition-all font-semibold"
                  style={{ fontFamily: 'Aeonik, sans-serif' }}
                >
                  View FAQ
                </a>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
