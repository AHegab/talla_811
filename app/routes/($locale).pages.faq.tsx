import { useState } from 'react';

export const meta = () => {
  return [
    { title: 'FAQ | TALLA' },
    { name: 'description', content: 'Frequently asked questions about TALLA' },
  ];
};

export async function loader() {
  return {};
}

const faqs = [
  {
    category: 'Orders & Shipping',
    questions: [
      {
        q: 'Who delivers my order?',
        a: 'We partner with Bosta, Egypt\'s leading delivery platform, to ensure fast and reliable shipping. Bosta provides real-time tracking and professional delivery service across all of Egypt.'
      },
      {
        q: 'How long does shipping take?',
        a: 'Delivery times with Bosta: Cairo & Giza: 2-3 business days (next-day available). Alexandria & major cities: 3-4 business days. Other governorates: 4-6 business days. Orders are processed within 1-2 business days before shipping.'
      },
      {
        q: 'Do you offer free shipping?',
        a: 'Yes! We offer free standard shipping on all orders over EGP 1,000 within Egypt. Orders under EGP 1,000 have a flat shipping fee of EGP 50. Express next-day delivery is available for EGP 100.'
      },
      {
        q: 'Can I track my order?',
        a: 'Absolutely! Once your order ships, you\'ll receive a Bosta tracking number via email and SMS. You can track your shipment in real-time through your account dashboard or directly on Bosta\'s platform. You\'ll also receive SMS updates and a call 30 minutes before delivery.'
      },
      {
        q: 'What if I\'m not home for delivery?',
        a: 'Bosta will attempt delivery up to 3 times. You\'ll receive a phone call and SMS before each attempt. If you miss all 3 delivery attempts, the package will be returned and you\'ll be refunded (minus shipping costs).'
      },
      {
        q: 'Do you accept cash on delivery?',
        a: 'Yes! You can pay cash when you receive your order through Bosta\'s cash on delivery service. Please have exact change when possible to make the process smoother.'
      },
    ]
  },
  {
    category: 'Returns & Exchanges',
    questions: [
      {
        q: 'What is your return policy?',
        a: 'We offer a 30-day return policy for all items in unworn, unwashed condition with tags attached. Simply contact our customer service team to initiate a return.'
      },
      {
        q: 'How do I exchange an item?',
        a: 'To exchange an item, contact us at returns@talla.com with your order number and the item you\'d like to exchange. We\'ll arrange free pickup and ship your replacement item.'
      },
      {
        q: 'When will I receive my refund?',
        a: 'Refunds are processed within 5-7 business days after we receive and inspect your return. The refund will be issued to your original payment method.'
      },
    ]
  },
  {
    category: 'Products & Sizing',
    questions: [
      {
        q: 'How do I find my size?',
        a: 'Visit our Size Guide page for detailed measurements. Each product page also includes specific sizing information. If you\'re between sizes, we recommend sizing up for a more comfortable fit.'
      },
      {
        q: 'Are your products authentic?',
        a: 'Yes, 100%. We source all our products directly from authorized distributors and brand partners. Every item comes with authenticity guarantees.'
      },
      {
        q: 'Do you restock sold-out items?',
        a: 'We try to restock popular items when possible. Sign up for restock notifications on product pages to be alerted when items become available again.'
      },
    ]
  },
  {
    category: 'Payment & Account',
    questions: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major credit cards (Visa, Mastercard, American Express), debit cards, and cash on delivery for orders within Egypt.'
      },
      {
        q: 'Is it safe to use my credit card?',
        a: 'Yes, absolutely. We use industry-standard SSL encryption to protect your payment information. Your card details are never stored on our servers.'
      },
      {
        q: 'Do I need an account to place an order?',
        a: 'No, you can checkout as a guest. However, creating an account allows you to track orders, save addresses, and access exclusive member benefits.'
      },
    ]
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggleQuestion = (categoryIndex: number, questionIndex: number) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setOpenIndex(openIndex === key ? null : key);
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-16 py-16 lg:py-24">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 
            className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight mb-4" 
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600" style={{ fontFamily: 'Quicking, sans-serif' }}>
            Find answers to common questions about shopping with TALLA
          </p>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-12">
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h2 
                className="text-2xl font-semibold mb-6 pb-2 border-b border-gray-200" 
                style={{ fontFamily: 'Aeonik, sans-serif' }}
              >
                {category.category}
              </h2>
              <div className="space-y-4">
                {category.questions.map((faq, questionIndex) => {
                  const key = `${categoryIndex}-${questionIndex}`;
                  const isOpen = openIndex === key;
                  
                  return (
                    <div 
                      key={questionIndex}
                      className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 hover:border-gray-300"
                    >
                      <button
                        onClick={() => toggleQuestion(categoryIndex, questionIndex)}
                        className="w-full px-6 py-4 flex items-center justify-between text-left bg-white hover:bg-gray-50 transition-colors"
                      >
                        <span 
                          className="text-base font-medium pr-4" 
                          style={{ fontFamily: 'Aeonik, sans-serif' }}
                        >
                          {faq.q}
                        </span>
                        <svg
                          className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M19 9l-7 7-7-7" 
                          />
                        </svg>
                      </button>
                      <div
                        className={`overflow-hidden transition-all duration-200 ${
                          isOpen ? 'max-h-96' : 'max-h-0'
                        }`}
                      >
                        <div 
                          className="px-6 py-4 bg-gray-50 text-gray-700 leading-relaxed"
                          style={{ fontFamily: 'Quicking, sans-serif' }}
                        >
                          {faq.a}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-16 p-8 bg-gray-50 rounded-2xl text-center">
          <h3 
            className="text-2xl font-semibold mb-3" 
            style={{ fontFamily: 'Aeonik, sans-serif' }}
          >
            Still have questions?
          </h3>
          <p 
            className="text-gray-600 mb-6" 
            style={{ fontFamily: 'Quicking, sans-serif' }}
          >
            Our customer service team is here to help
          </p>
          <a
            href="mailto:support@talla.com"
            className="inline-flex items-center gap-2 px-8 py-3 bg-black text-white rounded-lg font-semibold uppercase tracking-wider hover:bg-gray-900 transition-all duration-200 active:scale-95"
            style={{ fontFamily: 'Aeonik, sans-serif' }}
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
