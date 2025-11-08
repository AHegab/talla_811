import { useCallback, useEffect, useRef, useState } from 'react';
import type { CartApiQueryFragment } from 'storefrontapi.generated';

type CheckoutFormProps = {
  cart: CartApiQueryFragment | null;
};

// Google Maps Types
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export function CheckoutForm({ cart }: CheckoutFormProps) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);

  // Load Google Maps Script
  useEffect(() => {
    const existingScript = document.getElementById('google-maps-script');
    
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      // Replace with your Google Maps API key
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCdGhlWqS0SU4Y3MMBxoQLTV0mBtRGzkzk&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        setIsMapLoaded(true);
      };

      script.onerror = () => {
        setMapError(true);
      };
      
      document.head.appendChild(script);
    } else if (window.google) {
      setIsMapLoaded(true);
    } else {
      // Script exists but hasn't loaded yet
      setTimeout(() => {
        if (window.google) {
          setIsMapLoaded(true);
        } else {
          setMapError(true);
        }
      }, 3000);
    }
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || mapInstanceRef.current) return;

    const defaultCenter = { lat: 30.0444, lng: 31.2357 }; // Cairo, Egypt

    // Create map
    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    // Create geocoder
    geocoderRef.current = new window.google.maps.Geocoder();

    // Create draggable marker
    markerRef.current = new window.google.maps.Marker({
      position: defaultCenter,
      map: mapInstanceRef.current,
      draggable: true,
      title: 'Drag to select your location',
    });

    // Update location when marker is dragged
    markerRef.current.addListener('dragend', () => {
      const position = markerRef.current.getPosition();
      updateLocationFromLatLng(position.lat(), position.lng());
    });

    // Allow clicking on map to set location
    mapInstanceRef.current.addListener('click', (e: any) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      markerRef.current.setPosition(e.latLng);
      updateLocationFromLatLng(lat, lng);
    });

    // Try to get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          mapInstanceRef.current.setCenter(userLocation);
          markerRef.current.setPosition(userLocation);
          updateLocationFromLatLng(userLocation.lat, userLocation.lng);
        },
        () => {
          // User denied location or error occurred
          updateLocationFromLatLng(defaultCenter.lat, defaultCenter.lng);
        }
      );
    }
  }, [isMapLoaded]);

  const updateLocationFromLatLng = useCallback((lat: number, lng: number) => {
    if (!geocoderRef.current) return;

    geocoderRef.current.geocode(
      { location: { lat, lng } },
      (results: any[], status: string) => {
        if (status === 'OK' && results[0]) {
          setLocation({
            lat,
            lng,
            address: results[0].formatted_address,
          });
        } else {
          setLocation({
            lat,
            lng,
            address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          });
        }
      }
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !phone) {
      alert('Please fill in your email and phone number');
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address');
      return;
    }

    // If map loaded but no location selected
    if (!mapError && !location) {
      alert('Please select your delivery location on the map');
      return;
    }

    // Store checkout data in localStorage
    const checkoutData = {
      email,
      phone,
      location: location || null,
      cartId: cart?.id,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem('talla_checkout_data', JSON.stringify(checkoutData));

    // Proceed to Shopify checkout with attributes
    if (cart?.checkoutUrl) {
      // Add custom attributes to the checkout URL
      const checkoutUrl = new URL(cart.checkoutUrl);
      checkoutUrl.searchParams.set('checkout[email]', email);
      checkoutUrl.searchParams.set('checkout[shipping_address][phone]', phone);
      
      if (location) {
        checkoutUrl.searchParams.set('checkout[note]', 
          `Delivery Location: ${location.address} (${location.lat}, ${location.lng})`
        );
      }
      
      window.location.href = checkoutUrl.toString();
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-semibold text-talla-text">Checkout Details</h2>
        <p className="text-sm text-talla-text/60 mt-1">
          Please provide your contact information and delivery location
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Contact Information */}
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-talla-text mb-2">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-talla-text focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-talla-text mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+20 123 456 7890"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-talla-text focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Location Selection */}
        <div>
          <label className="block text-sm font-medium text-talla-text mb-2">
            Delivery Location {!mapError && '*'}
          </label>
          <p className="text-xs text-talla-text/60 mb-3">
            Click on the map or drag the marker to select your exact delivery location
          </p>
          
          {mapError ? (
            <div className="border border-yellow-300 rounded-lg bg-yellow-50 p-4">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800 mb-1">Map couldn't load</p>
                  <p className="text-xs text-yellow-700">
                    Don't worry! You can still proceed to checkout. We'll ask for your delivery address on the next page.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div
                ref={mapRef}
                className="w-full h-80 bg-gray-100"
              >
                {!isMapLoaded && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-talla-text mx-auto mb-3"></div>
                      <p className="text-sm text-talla-text/60">Loading map...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {location && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">Selected Location:</p>
                  <p className="text-xs text-green-700 mt-1">{location.address}</p>
                  <p className="text-xs text-green-600 mt-1">
                    Coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!email || !phone || (!mapError && !location)}
          className="w-full px-6 py-4 bg-talla-text text-talla-bg text-center text-sm font-semibold uppercase tracking-wider hover:bg-talla-text/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg rounded-lg"
        >
          Continue to Payment
        </button>

        <p className="text-xs text-center text-talla-text/50">
          {mapError 
            ? "You'll provide your delivery address on the next page"
            : "You'll be redirected to Shopify's secure checkout to complete your order"
          }
        </p>
      </form>
    </div>
  );
}
