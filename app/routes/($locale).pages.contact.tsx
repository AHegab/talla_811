export const meta = () => {
  return [
    { title: 'Contact Us | Talla' },
    { 
      name: 'description', 
      content: 'Get in touch with Talla. We\'re here to help with any questions about our editorial fashion collections.' 
    },
  ];
};

export async function loader() {
  return {};
}

export default function Contact() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-black text-white py-20 md:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00F4D2]/10 to-transparent"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-16">
          <h1 
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6" 
            style={{ fontFamily: 'Aeonik, sans-serif' }}
          >
            CONTACT
          </h1>
          <p 
            className="text-lg md:text-xl text-gray-300 max-w-2xl" 
            style={{ fontFamily: 'Quicking, sans-serif' }}
          >
            We'd love to hear from you. Reach out to us for any inquiries about our collections, 
            orders, or collaborations.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          
          {/* Contact Information */}
          <div className="space-y-12">
            <div>
              <h2 
                className="text-3xl md:text-4xl font-bold mb-8 tracking-tight" 
                style={{ fontFamily: 'Aeonik, sans-serif' }}
              >
                Get in Touch
              </h2>
              <p 
                className="text-gray-600 text-lg leading-relaxed mb-8" 
                style={{ fontFamily: 'Quicking, sans-serif' }}
              >
                Whether you have questions about our products, need styling advice, or want to discuss 
                a collaboration, our team is here to help.
              </p>
            </div>

            {/* Contact Cards */}
            <div className="space-y-6">
              
              {/* Email */}
              <div className="group relative bg-gray-50 rounded-2xl p-6 hover:bg-black hover:text-white transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-[#00F4D2]/10 group-hover:bg-[#00F4D2]/20 rounded-full flex items-center justify-center transition-colors">
                    <svg 
                      className="w-6 h-6 text-[#00F4D2]" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 
                      className="text-sm font-semibold uppercase tracking-wider mb-2 text-gray-500 group-hover:text-[#00F4D2]" 
                      style={{ fontFamily: 'Aeonik, sans-serif' }}
                    >
                      Email
                    </h3>
                    <a 
                      href="mailto:tallamanagement.shop@gmail.com" 
                      className="text-lg font-medium hover:text-[#00F4D2] transition-colors break-all"
                      style={{ fontFamily: 'Quicking, sans-serif' }}
                    >
                      tallamanagement.shop@gmail.com
                    </a>
                    <p 
                      className="text-sm mt-2 opacity-70" 
                      style={{ fontFamily: 'Quicking, sans-serif' }}
                    >
                      We typically respond within 24 hours
                    </p>
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="group relative bg-gray-50 rounded-2xl p-6 hover:bg-black hover:text-white transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-[#00F4D2]/10 group-hover:bg-[#00F4D2]/20 rounded-full flex items-center justify-center transition-colors">
                    <svg 
                      className="w-6 h-6 text-[#00F4D2]" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" 
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 
                      className="text-sm font-semibold uppercase tracking-wider mb-2 text-gray-500 group-hover:text-[#00F4D2]" 
                      style={{ fontFamily: 'Aeonik, sans-serif' }}
                    >
                      Phone
                    </h3>
                    <a 
                      href="tel:+201500678224" 
                      className="text-lg font-medium hover:text-[#00F4D2] transition-colors"
                      style={{ fontFamily: 'Quicking, sans-serif' }}
                    >
                      +20 15 00678224
                    </a>
                    <p 
                      className="text-sm mt-2 opacity-70" 
                      style={{ fontFamily: 'Quicking, sans-serif' }}
                    >
                      Available during business hours (EET)
                    </p>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="group relative bg-gray-50 rounded-2xl p-6 hover:bg-black hover:text-white transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-[#00F4D2]/10 group-hover:bg-[#00F4D2]/20 rounded-full flex items-center justify-center transition-colors">
                    <svg 
                      className="w-6 h-6 text-[#00F4D2]" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
                      />
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 
                      className="text-sm font-semibold uppercase tracking-wider mb-2 text-gray-500 group-hover:text-[#00F4D2]" 
                      style={{ fontFamily: 'Aeonik, sans-serif' }}
                    >
                      Location
                    </h3>
                    <p 
                      className="text-lg font-medium"
                      style={{ fontFamily: 'Quicking, sans-serif' }}
                    >
                      Cairo, Egypt
                    </p>
                    <p 
                      className="text-sm mt-2 opacity-70" 
                      style={{ fontFamily: 'Quicking, sans-serif' }}
                    >
                      Serving fashion enthusiasts worldwide
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Social Media */}
            <div>
              <h3 
                className="text-sm font-semibold uppercase tracking-wider mb-4" 
                style={{ fontFamily: 'Aeonik, sans-serif' }}
              >
                Follow Us
              </h3>
              <div className="flex items-center gap-4">
                <a 
                  href="https://www.instagram.com/talla.online?igsh=NTJ0bGZqeHBkbGZ5"
                  aria-label="Instagram" 
                  className="group inline-flex items-center justify-center w-12 h-12 rounded-full border-2 border-gray-300 hover:border-[#00F4D2] hover:bg-[#00F4D2]/10 transition-all duration-200" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700 group-hover:text-[#00F4D2] transition-colors">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a 
                  href="https://www.tiktok.com/@talla.online?_r=1&_t=ZS-91VfnEIL6Uq"
                  aria-label="TikTok" 
                  className="group inline-flex items-center justify-center w-12 h-12 rounded-full border-2 border-gray-300 hover:border-[#00F4D2] hover:bg-[#00F4D2]/10 transition-all duration-200" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700 group-hover:text-[#00F4D2] transition-colors">
                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-50 rounded-3xl p-8 lg:p-10">
            <h2 
              className="text-2xl md:text-3xl font-bold mb-2 tracking-tight" 
              style={{ fontFamily: 'Aeonik, sans-serif' }}
            >
              Send us a Message
            </h2>
            <p 
              className="text-gray-600 mb-8" 
              style={{ fontFamily: 'Quicking, sans-serif' }}
            >
              Fill out the form below and we'll get back to you shortly.
            </p>

            <form className="space-y-6">
              {/* Name */}
              <div>
                <label 
                  htmlFor="name" 
                  className="block text-sm font-semibold mb-2 uppercase tracking-wider"
                  style={{ fontFamily: 'Aeonik, sans-serif' }}
                >
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#00F4D2] focus:ring-2 focus:ring-[#00F4D2]/20 transition-all"
                  placeholder="Your full name"
                  style={{ fontFamily: 'Quicking, sans-serif' }}
                />
              </div>

              {/* Email */}
              <div>
                <label 
                  htmlFor="email" 
                  className="block text-sm font-semibold mb-2 uppercase tracking-wider"
                  style={{ fontFamily: 'Aeonik, sans-serif' }}
                >
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#00F4D2] focus:ring-2 focus:ring-[#00F4D2]/20 transition-all"
                  placeholder="your.email@example.com"
                  style={{ fontFamily: 'Quicking, sans-serif' }}
                />
              </div>

              {/* Phone */}
              <div>
                <label 
                  htmlFor="phone" 
                  className="block text-sm font-semibold mb-2 uppercase tracking-wider"
                  style={{ fontFamily: 'Aeonik, sans-serif' }}
                >
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#00F4D2] focus:ring-2 focus:ring-[#00F4D2]/20 transition-all"
                  placeholder="+20 XXX XXXXXXX"
                  style={{ fontFamily: 'Quicking, sans-serif' }}
                />
              </div>

              {/* Subject */}
              <div>
                <label 
                  htmlFor="subject" 
                  className="block text-sm font-semibold mb-2 uppercase tracking-wider"
                  style={{ fontFamily: 'Aeonik, sans-serif' }}
                >
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#00F4D2] focus:ring-2 focus:ring-[#00F4D2]/20 transition-all"
                  placeholder="What is this regarding?"
                  style={{ fontFamily: 'Quicking, sans-serif' }}
                />
              </div>

              {/* Message */}
              <div>
                <label 
                  htmlFor="message" 
                  className="block text-sm font-semibold mb-2 uppercase tracking-wider"
                  style={{ fontFamily: 'Aeonik, sans-serif' }}
                >
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#00F4D2] focus:ring-2 focus:ring-[#00F4D2]/20 transition-all resize-none"
                  placeholder="Tell us more about your inquiry..."
                  style={{ fontFamily: 'Quicking, sans-serif' }}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full px-8 py-4 bg-black text-white rounded-lg text-sm font-semibold uppercase tracking-wider hover:bg-[#00F4D2] hover:text-black transition-all duration-200 active:scale-[0.98]"
                style={{ fontFamily: 'Aeonik, sans-serif' }}
              >
                Send Message
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* FAQ Quick Links */}
      <div className="bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16">
          <h2 
            className="text-3xl md:text-4xl font-bold mb-8 text-center" 
            style={{ fontFamily: 'Aeonik, sans-serif' }}
          >
            Need Quick Help?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <a 
              href="/pages/faq" 
              className="group bg-white/5 rounded-2xl p-6 hover:bg-white/10 transition-all duration-200"
            >
              <h3 
                className="text-xl font-semibold mb-2 group-hover:text-[#00F4D2] transition-colors" 
                style={{ fontFamily: 'Aeonik, sans-serif' }}
              >
                FAQ
              </h3>
              <p 
                className="text-gray-400 text-sm" 
                style={{ fontFamily: 'Quicking, sans-serif' }}
              >
                Find answers to common questions
              </p>
            </a>
            <a 
              href="/pages/shipping" 
              className="group bg-white/5 rounded-2xl p-6 hover:bg-white/10 transition-all duration-200"
            >
              <h3 
                className="text-xl font-semibold mb-2 group-hover:text-[#00F4D2] transition-colors" 
                style={{ fontFamily: 'Aeonik, sans-serif' }}
              >
                Shipping Info
              </h3>
              <p 
                className="text-gray-400 text-sm" 
                style={{ fontFamily: 'Quicking, sans-serif' }}
              >
                Learn about our delivery options
              </p>
            </a>
            <a 
              href="/pages/returns" 
              className="group bg-white/5 rounded-2xl p-6 hover:bg-white/10 transition-all duration-200"
            >
              <h3 
                className="text-xl font-semibold mb-2 group-hover:text-[#00F4D2] transition-colors" 
                style={{ fontFamily: 'Aeonik, sans-serif' }}
              >
                Returns & Exchanges
              </h3>
              <p 
                className="text-gray-400 text-sm" 
                style={{ fontFamily: 'Quicking, sans-serif' }}
              >
                View our return policy
              </p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
