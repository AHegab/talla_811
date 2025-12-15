export const meta = () => {
  return [
    { title: 'Terms of Service | TALLA' },
    { name: 'description', content: 'Terms and conditions for shopping at TALLA' },
  ];
};

export async function loader() {
  return {};
}

export default function TermsPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-16 py-16 lg:py-24">
        {/* Header */}
        <div className="mb-12">
          <h1 
            className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight mb-4" 
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Terms of Service
          </h1>
          <p className="text-lg text-gray-600" style={{ fontFamily: 'Quicking, sans-serif' }}>
            Last updated: December 15, 2025
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none space-y-8" style={{ fontFamily: 'Quicking, sans-serif' }}>
          
          {/* Introduction */}
          <section>
            <p className="text-gray-700 leading-relaxed">
              Welcome to TALLA. By accessing or using our website and services, you agree to be bound by these Terms of Service. 
              Please read them carefully before making a purchase or using our services.
            </p>
          </section>

          {/* 1. Acceptance of Terms */}
          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Aeonik, sans-serif' }}>
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              By accessing and placing an order with TALLA, you confirm that you are in agreement with and bound by the terms 
              and conditions contained in these Terms of Service. These terms apply to the entire website and any email or other 
              type of communication between you and TALLA.
            </p>
            <p className="text-gray-700 leading-relaxed">
              If you do not agree to these terms, you must not use our website or purchase our products.
            </p>
          </section>

          {/* 2. Use of Website */}
          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Aeonik, sans-serif' }}>
              2. Use of Website
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              You may use our website for lawful purposes only. You agree not to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Use the website in any way that breaches any applicable local, national, or international law</li>
              <li>Use the website in any way that is unlawful or fraudulent</li>
              <li>Use the website to transmit or send unsolicited commercial communications</li>
              <li>Attempt to gain unauthorized access to our website, servers, or networks</li>
              <li>Reproduce, duplicate, copy, or resell any part of our website without our express written permission</li>
            </ul>
          </section>

          {/* 3. Account Registration */}
          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Aeonik, sans-serif' }}>
              3. Account Registration
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To access certain features of our website, you may be required to create an account. When creating an account, 
              you must provide accurate, complete, and current information.
            </p>
            <p className="text-gray-700 leading-relaxed mb-3">
              You are responsible for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Maintaining the confidentiality of your account password</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use of your account</li>
            </ul>
          </section>

          {/* 4. Products and Pricing */}
          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Aeonik, sans-serif' }}>
              4. Products and Pricing
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              All products are subject to availability. We reserve the right to discontinue any product at any time. 
              We make every effort to display the colors and images of our products as accurately as possible, but we 
              cannot guarantee that your device's display will accurately reflect the actual product color.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              All prices are in Egyptian Pounds (EGP) and are inclusive of applicable taxes unless otherwise stated. 
              We reserve the right to change prices at any time without notice. Promotional prices are valid for the 
              specified period only.
            </p>
            <p className="text-gray-700 leading-relaxed">
              In the event of a pricing error, we reserve the right to cancel or refuse any orders placed for products 
              listed at the incorrect price, regardless of whether the order has been confirmed.
            </p>
          </section>

          {/* 5. Orders and Payment */}
          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Aeonik, sans-serif' }}>
              5. Orders and Payment
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              When you place an order, you will receive an email confirmation. This confirmation does not constitute 
              acceptance of your order. We reserve the right to refuse or cancel any order for any reason, including 
              product availability, errors in pricing or product information, or suspected fraud.
            </p>
            <p className="text-gray-700 leading-relaxed mb-3">
              We accept the following payment methods:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Credit cards (Visa, Mastercard, American Express)</li>
              <li>Debit cards</li>
              <li>Cash on delivery (within Egypt only)</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Payment is due at the time of ordering for online payments. For cash on delivery orders, payment is 
              due upon receipt of goods.
            </p>
          </section>

          {/* 6. Shipping and Delivery */}
          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Aeonik, sans-serif' }}>
              6. Shipping and Delivery
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We partner with Bosta for all deliveries within Egypt. Delivery times and costs are outlined on our 
              Shipping Information page. While we make every effort to meet estimated delivery times, we cannot guarantee 
              delivery dates and will not be liable for any delays.
            </p>
            <p className="text-gray-700 leading-relaxed">
              You are responsible for providing accurate delivery information. If a package is returned due to incorrect 
              address information or failed delivery attempts, shipping costs will not be refunded.
            </p>
          </section>

          {/* 7. Returns and Refunds */}
          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Aeonik, sans-serif' }}>
              7. Returns and Refunds
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We offer a 30-day return policy for most items. Please refer to our Returns & Exchanges page and Refund 
              Policy for complete details on eligibility, procedures, and processing times.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Items must be returned in their original condition with all tags attached. Certain items such as underwear, 
              swimwear, and earrings cannot be returned for hygiene reasons.
            </p>
          </section>

          {/* 8. Intellectual Property */}
          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Aeonik, sans-serif' }}>
              8. Intellectual Property
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              All content on this website, including but not limited to text, graphics, logos, images, and software, 
              is the property of TALLA or its content suppliers and is protected by Egyptian and international copyright laws.
            </p>
            <p className="text-gray-700 leading-relaxed">
              You may not reproduce, distribute, modify, create derivative works of, publicly display, or exploit any 
              content from our website without our express written permission.
            </p>
          </section>

          {/* 9. Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Aeonik, sans-serif' }}>
              9. Limitation of Liability
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To the fullest extent permitted by law, TALLA shall not be liable for any indirect, incidental, special, 
              consequential, or punitive damages arising out of or related to your use of our website or products.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Our total liability to you for any claim arising from your use of our website or products shall not exceed 
              the amount you paid for the product in question.
            </p>
          </section>

          {/* 10. Privacy and Data Protection */}
          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Aeonik, sans-serif' }}>
              10. Privacy and Data Protection
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Your use of our website is also governed by our Privacy Policy. Please review our Privacy Policy to 
              understand how we collect, use, and protect your personal information.
            </p>
          </section>

          {/* 11. Governing Law */}
          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Aeonik, sans-serif' }}>
              11. Governing Law
            </h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms of Service shall be governed by and construed in accordance with the laws of the Arab Republic 
              of Egypt. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the 
              Egyptian courts.
            </p>
          </section>

          {/* 12. Changes to Terms */}
          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Aeonik, sans-serif' }}>
              12. Changes to Terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately 
              upon posting to the website. Your continued use of the website following any changes constitutes your 
              acceptance of the new terms.
            </p>
          </section>

          {/* 13. Contact Information */}
          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Aeonik, sans-serif' }}>
              13. Contact Information
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-gray-50 rounded-xl p-6 space-y-2">
              <p className="text-gray-700">
                <strong>Email:</strong> <a href="mailto:tallamanagement.shop@gmail.com" className="text-[#00F4D2] hover:underline">tallamanagement.shop@gmail.com</a>
              </p>
              <p className="text-gray-700">
                <strong>Phone:</strong> <a href="tel:+201500678224" className="text-[#00F4D2] hover:underline">+20 15 00678224</a>
              </p>
            </div>
          </section>

        </div>

        {/* Footer CTA */}
        <div className="mt-16 pt-8 border-t border-gray-200">
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
        </div>
      </div>
    </div>
  );
}
