/**
 * TALLA Design System - Component Showcase
 * 
 * This file demonstrates all available components and their usage.
 * Use this as a reference when building new pages.
 */

import { ProductItem } from '~/components/ProductItem';
import {
    Badge,
    Button,
    Container,
    Input,
    ProductGrid,
    SectionHeading,
    Select,
    Textarea
} from '~/components/ui';

export default function DesignSystemShowcase() {
  // Sample data for demonstration
  const sampleProduct = {
    id: '1',
    title: 'Premium Cashmere Sweater',
    handle: 'cashmere-sweater',
    priceRange: {
      minVariantPrice: {
        amount: '295.00',
        currencyCode: 'USD' as const
      }
    },
    featuredImage: {
      id: 'img-1',
      url: 'https://cdn.shopify.com/...',
      altText: 'Cashmere sweater',
      width: 800,
      height: 1000
    }
  };

  const sizeOptions = [
    { value: 'xs', label: 'Extra Small' },
    { value: 's', label: 'Small' },
    { value: 'm', label: 'Medium' },
    { value: 'l', label: 'Large' },
    { value: 'xl', label: 'Extra Large' },
  ];

  return (
    <div className="bg-talla-bg min-h-screen">
      {/* Typography Section */}
      <Container className="section-padding">
        <SectionHeading 
          title="Typography System"
          subtitle="Premium fonts and text styles"
        />
        
        <div className="space-y-8">
          <div>
            <h1 className="font-display">Heading 1 - Playfair Display SC</h1>
            <p className="text-sm text-gray-500">text-5xl md:text-6xl lg:text-7xl tracking-tighter</p>
          </div>
          
          <div>
            <h2 className="font-display">Heading 2 - Playfair Display SC</h2>
            <p className="text-sm text-gray-500">text-4xl md:text-5xl lg:text-6xl tracking-tighter</p>
          </div>
          
          <div>
            <h3 className="font-display">Heading 3 - Playfair Display SC</h3>
            <p className="text-sm text-gray-500">text-3xl md:text-4xl lg:text-5xl tracking-tight</p>
          </div>
          
          <div>
            <p className="font-sans text-base">
              Body text uses Open Sans with a comfortable line height for optimal readability.
              The font-sans class applies our custom font stack.
            </p>
            <p className="text-sm text-gray-500">text-base (16px), leading-relaxed</p>
          </div>
        </div>
      </Container>

      {/* Color Palette */}
      <div className="bg-white">
        <Container className="section-padding">
          <SectionHeading 
            title="Color Palette"
            subtitle="Brand colors and neutrals"
          />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="h-24 bg-talla-bg border border-gray-300 rounded"></div>
              <p className="text-sm font-medium">Background</p>
              <p className="text-xs text-gray-500">#FBFBFB</p>
            </div>
            
            <div className="space-y-2">
              <div className="h-24 bg-talla-text rounded"></div>
              <p className="text-sm font-medium">Primary Text</p>
              <p className="text-xs text-gray-500">#292929</p>
            </div>
            
            <div className="space-y-2">
              <div className="h-24 bg-talla-surface rounded"></div>
              <p className="text-sm font-medium">Surface</p>
              <p className="text-xs text-gray-500">#DDDEE2</p>
            </div>
            
            <div className="space-y-2">
              <div className="h-24 bg-white border border-gray-300 rounded"></div>
              <p className="text-sm font-medium">White</p>
              <p className="text-xs text-gray-500">#FFFFFF</p>
            </div>
          </div>
        </Container>
      </div>

      {/* Buttons */}
      <Container className="section-padding">
        <SectionHeading 
          title="Buttons"
          subtitle="Primary, secondary, and ghost variants"
        />
        
        <div className="space-y-8">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Variants</h4>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="primary" disabled>Disabled</Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Sizes</h4>
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="primary" size="sm">Small</Button>
              <Button variant="primary" size="md">Medium</Button>
              <Button variant="primary" size="lg">Large</Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Full Width</h4>
            <Button variant="primary" fullWidth>Full Width Button</Button>
          </div>
        </div>
      </Container>

      {/* Form Elements */}
      <div className="bg-white">
        <Container className="section-padding">
          <SectionHeading 
            title="Form Elements"
            subtitle="Inputs, textareas, and selects"
          />
          
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="space-y-6">
              <Input 
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                helperText="We'll never share your email"
              />
              
              <Input 
                label="Password"
                type="password"
                placeholder="Enter your password"
              />
              
              <Input 
                label="With Error"
                type="text"
                placeholder="Invalid input"
                error="This field is required"
              />
              
              <Textarea 
                label="Message"
                rows={5}
                placeholder="Tell us about yourself..."
                helperText="Maximum 500 characters"
              />
              
              <Select 
                label="Size"
                options={sizeOptions}
              />
            </div>
            
            <Button variant="primary" fullWidth>
              Submit Form
            </Button>
          </div>
        </Container>
      </div>

      {/* Badges */}
      <Container className="section-padding">
        <SectionHeading 
          title="Badges"
          subtitle="Status and label indicators"
        />
        
        <div className="flex flex-wrap gap-4">
          <Badge variant="default">Featured</Badge>
          <Badge variant="sale">Sale -30%</Badge>
          <Badge variant="new">New Arrival</Badge>
          <Badge variant="soldout">Sold Out</Badge>
        </div>
      </Container>

      {/* Product Cards */}
      <div className="bg-white">
        <Container className="section-padding">
          <SectionHeading 
            title="Product Cards"
            subtitle="3:4 aspect ratio with hover effects"
          />
          
          <ProductGrid>
            {[...Array(4)].map((_, i) => (
              <ProductItem 
                key={i} 
                product={{
                  ...sampleProduct,
                  id: `product-${i}`,
                  title: `Product ${i + 1}`
                } as any} 
                loading="lazy"
              />
            ))}
          </ProductGrid>
        </Container>
      </div>

      {/* Spacing Examples */}
      <Container className="section-padding">
        <SectionHeading 
          title="Spacing System"
          subtitle="Consistent spacing scale based on 8px grid"
        />
        
        <div className="space-y-8">
          <div className="space-y-2">
            <div className="h-6 bg-talla-surface rounded w-1/2"></div>
            <p className="text-sm text-gray-500">space-y-6 (24px)</p>
          </div>
          
          <div className="space-y-4">
            <div className="h-8 bg-talla-surface rounded w-3/4"></div>
            <p className="text-sm text-gray-500">space-y-8 (32px)</p>
          </div>
          
          <div className="space-y-6">
            <div className="h-10 bg-talla-surface rounded w-full"></div>
            <p className="text-sm text-gray-500">space-y-12 (48px)</p>
          </div>
        </div>
      </Container>

      {/* Shadows */}
      <div className="bg-white">
        <Container className="section-padding">
          <SectionHeading 
            title="Shadows"
            subtitle="Premium shadow system"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-white shadow-premium rounded">
              <p className="font-medium">Premium</p>
              <p className="text-sm text-gray-500 mt-2">shadow-premium</p>
            </div>
            
            <div className="p-8 bg-white shadow-premium-lg rounded">
              <p className="font-medium">Premium Large</p>
              <p className="text-sm text-gray-500 mt-2">shadow-premium-lg</p>
            </div>
            
            <div className="p-8 bg-white shadow-premium-xl rounded">
              <p className="font-medium">Premium XL</p>
              <p className="text-sm text-gray-500 mt-2">shadow-premium-xl</p>
            </div>
          </div>
        </Container>
      </div>

      {/* Responsive Grid */}
      <Container className="section-padding">
        <SectionHeading 
          title="Responsive Grid"
          subtitle="2 → 3 → 4 columns across breakpoints"
        />
        
        <div className="grid-products">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-portrait bg-talla-surface rounded flex items-center justify-center">
              <span className="text-2xl font-display text-gray-500">{i + 1}</span>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
