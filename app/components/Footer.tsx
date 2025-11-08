import { Suspense } from 'react';
import { Await, NavLink } from 'react-router';
import type { FooterQuery, HeaderQuery } from 'storefrontapi.generated';

interface FooterProps {
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  publicStoreDomain: string;
}

export function Footer({
  footer: footerPromise,
  header,
  publicStoreDomain,
}: FooterProps) {
  return (
    <Suspense>
      <Await resolve={footerPromise}>
        {(footer) => (
          <footer className="bg-black text-white">
            <div className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-16 xl:px-20">
              {/* Main Footer Content */}
              <div className="py-16 lg:py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
                {/* Brand Section - Centered on mobile */}
                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                  <NavLink to="/" className="inline-block mb-4">
                    <img 
                      src="/talla-logo-white.svg" 
                      alt={header.shop.name}
                      className="h-8 w-auto"
                    />
                  </NavLink>
                  <p className="text-sm text-gray-400 mb-6" style={{ fontFamily: 'Quicking, sans-serif' }}>
                    Editorial fashion & lifestyle
                  </p>
                  
                  {/* Social Icons */}
                  <div className="flex items-center gap-4">
                    <a 
                      href="https://instagram.com" 
                      aria-label="Instagram" 
                      className="group inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-700 hover:border-[#00F4D2] hover:bg-[#00F4D2]/10 transition-all duration-200" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-[#00F4D2] transition-colors">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                      </svg>
                    </a>
                    <a 
                      href="https://tiktok.com" 
                      aria-label="TikTok" 
                      className="group inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-700 hover:border-[#00F4D2] hover:bg-[#00F4D2]/10 transition-all duration-200" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-[#00F4D2] transition-colors">
                        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Shop Links */}
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ fontFamily: 'Aeonik, sans-serif' }}>
                    Shop
                  </h3>
                  <ul className="space-y-3">
                    <li>
                      <NavLink to="/collections/women" className="text-sm text-gray-400 hover:text-[#00F4D2] transition-colors" style={{ fontFamily: 'Quicking, sans-serif' }}>
                        Women
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/collections/men" className="text-sm text-gray-400 hover:text-[#00F4D2] transition-colors" style={{ fontFamily: 'Quicking, sans-serif' }}>
                        Men
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/collections/accessories" className="text-sm text-gray-400 hover:text-[#00F4D2] transition-colors" style={{ fontFamily: 'Quicking, sans-serif' }}>
                        Accessories
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/collections/brands" className="text-sm text-gray-400 hover:text-[#00F4D2] transition-colors" style={{ fontFamily: 'Quicking, sans-serif' }}>
                        Brands
                      </NavLink>
                    </li>
                  </ul>
                </div>

                {/* Customer Care */}
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ fontFamily: 'Aeonik, sans-serif' }}>
                    Customer Care
                  </h3>
                  <ul className="space-y-3">
                    <li>
                      <NavLink to="/pages/contact" className="text-sm text-gray-400 hover:text-[#00F4D2] transition-colors" style={{ fontFamily: 'Quicking, sans-serif' }}>
                        Contact Us
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/pages/shipping" className="text-sm text-gray-400 hover:text-[#00F4D2] transition-colors" style={{ fontFamily: 'Quicking, sans-serif' }}>
                        Shipping Information
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/pages/returns" className="text-sm text-gray-400 hover:text-[#00F4D2] transition-colors" style={{ fontFamily: 'Quicking, sans-serif' }}>
                        Returns & Exchanges
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/pages/faq" className="text-sm text-gray-400 hover:text-[#00F4D2] transition-colors" style={{ fontFamily: 'Quicking, sans-serif' }}>
                        FAQ
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/pages/size-guide" className="text-sm text-gray-400 hover:text-[#00F4D2] transition-colors" style={{ fontFamily: 'Quicking, sans-serif' }}>
                        Size Guide
                      </NavLink>
                    </li>
                  </ul>
                </div>

                {/* Newsletter */}
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ fontFamily: 'Aeonik, sans-serif' }}>
                    Newsletter
                  </h3>
                  <p className="text-sm text-gray-400 mb-4" style={{ fontFamily: 'Quicking, sans-serif' }}>
                    Stay updated with our latest editorial
                  </p>
                  <form className="space-y-3">
                    <input 
                      type="email" 
                      placeholder="Your email" 
                      className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00F4D2] focus:bg-white/10 transition-all"
                      aria-label="Email for newsletter"
                      style={{ fontFamily: 'Quicking, sans-serif' }}
                    />
                    <button 
                      type="submit" 
                      className="w-full px-4 py-3 bg-white text-black rounded-lg text-sm font-semibold uppercase tracking-wider hover:bg-[#00F4D2] hover:text-black transition-all duration-200 active:scale-95"
                      style={{ fontFamily: 'Aeonik, sans-serif' }}
                    >
                      Subscribe
                    </button>
                  </form>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-800"></div>

              {/* Bottom Bar */}
              <div className="py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
                <p style={{ fontFamily: 'Quicking, sans-serif' }}>
                  © {new Date().getFullYear()} {header.shop.name}. All rights reserved.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-6">
                  <NavLink to="/policies/privacy-policy" className="hover:text-[#00F4D2] transition-colors" style={{ fontFamily: 'Quicking, sans-serif' }}>
                    Privacy
                  </NavLink>
                  <NavLink to="/policies/terms-of-service" className="hover:text-[#00F4D2] transition-colors" style={{ fontFamily: 'Quicking, sans-serif' }}>
                    Terms
                  </NavLink>
                  <NavLink to="/policies/refund-policy" className="hover:text-[#00F4D2] transition-colors" style={{ fontFamily: 'Quicking, sans-serif' }}>
                    Refunds
                  </NavLink>
                  <NavLink to="/policies/shipping-policy" className="hover:text-[#00F4D2] transition-colors" style={{ fontFamily: 'Quicking, sans-serif' }}>
                    Shipping
                  </NavLink>
                </div>
              </div>
            </div>
          </footer>
        )}
      </Await>
    </Suspense>
  );
}
