
export const meta = () => {
  return [
    { title: 'Returns & Exchanges | TALLA' },
    { name: 'description', content: 'Learn about our return and exchange policy' },
  ];
};

export async function loader() {
  return {};
}

export default function ReturnsPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-16 py-16 lg:py-24">
        {/* Header */}
        <div className="mb-12">
          <h1 
            className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight mb-4" 
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Returns & Exchanges
          </h1>
          <p className="text-lg text-gray-600" style={{ fontFamily: 'Quicking, sans-serif' }}>
            We want you to love your TALLA purchase. If you're not completely satisfied, we're here to help.
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div className="space-y-8" style={{ fontFamily: 'Quicking, sans-serif' }}>
            {/* Return Period */}
            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Aeonik, sans-serif' }}>
                30-Day Return Period
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You have <strong>30 days</strong> from the date of delivery to return your item(s) for a full refund or exchange. 
                Items must be unworn, unwashed, and in their original condition with all tags attached.
              </p>
            </section>

            {/* How to Return */}
            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Aeonik, sans-serif' }}>
                How to Return
              </h2>
              <ol className="list-decimal list-inside space-y-3 text-gray-700">
                <li>Contact our customer service team at <a href="mailto:returns@talla.com" className="text-[#00F4D2] hover:underline">returns@talla.com</a> with your order number</li>
                <li>We'll send you a prepaid return label within 24 hours</li>
                <li>Pack your items securely in the original packaging</li>
                <li>Attach the return label and drop off at any authorized shipping location</li>
                <li>Once we receive and inspect your return, we'll process your refund within 5-7 business days</li>
              </ol>
            </section>

            {/* Exchange Policy */}
            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Aeonik, sans-serif' }}>
                Exchanges
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Need a different size or color? We offer free exchanges on all items. Simply follow the return process 
                and indicate in your email that you'd like to exchange for a different size or color. We'll ship your 
                replacement item as soon as we receive your original return.
              </p>
            </section>

            {/* Non-Returnable Items */}
            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Aeonik, sans-serif' }}>
                Non-Returnable Items
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                For hygiene and safety reasons, the following items cannot be returned:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Underwear and swimwear (unless defective)</li>
                <li>Earrings and pierced jewelry</li>
                <li>Items marked as "Final Sale"</li>
                <li>Gift cards</li>
              </ul>
            </section>

            {/* Refunds */}
            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Aeonik, sans-serif' }}>
                Refunds
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Refunds will be issued to your original payment method within 5-7 business days after we receive and 
                inspect your return. You'll receive an email confirmation once your refund has been processed.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Please note that shipping fees are non-refundable, except in cases where the item received was 
                defective or incorrect.
              </p>
            </section>

            {/* International Returns */}
            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Aeonik, sans-serif' }}>
                International Returns
              </h2>
              <p className="text-gray-700 leading-relaxed">
                International customers are responsible for return shipping costs. Please contact our customer service 
                team for return instructions. Customs duties and taxes are non-refundable.
              </p>
            </section>

            {/* Damaged or Defective */}
            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Aeonik, sans-serif' }}>
                Damaged or Defective Items
              </h2>
              <p className="text-gray-700 leading-relaxed">
                If you receive a damaged or defective item, please contact us immediately at{' '}
                <a href="mailto:support@talla.com" className="text-[#00F4D2] hover:underline">support@talla.com</a>{' '}
                with photos of the issue. We'll arrange for a replacement or full refund, including shipping costs.
              </p>
            </section>

            {/* Contact */}
            <section className="border-t border-gray-200 pt-8 mt-12">
              <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Aeonik, sans-serif' }}>
                Need Help?
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our customer service team is here to assist you with any questions about returns or exchanges.
              </p>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <strong>Email:</strong> <a href="mailto:returns@talla.com" className="text-[#00F4D2] hover:underline">returns@talla.com</a>
                </p>
                <p className="text-gray-700">
                  <strong>Phone:</strong> +20 123 456 7890
                </p>
                <p className="text-gray-700">
                  <strong>Hours:</strong> Sunday - Thursday, 9:00 AM - 6:00 PM (Cairo Time)
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
