# TALLA Design System Guide

## 🎨 Brand Identity

**TALLA** is a premium fashion ecommerce platform with a minimal, elegant aesthetic inspired by brands like Aritzia, COS, and The Row.

### Color Palette

```css
--talla-bg: #FBFBFB        /* Background - Off-white */
--talla-text: #292929      /* Primary text - Charcoal */
--talla-surface: #DDDEE2   /* Neutral surface */
```

### Typography

**Display Font (Headers):** Playfair Display SC  
**Body Font:** Open Sans (fallback for Open Sauce)

```tsx
// Usage in components
className="font-display"  // For headings
className="font-sans"     // For body text
```

## 📦 Component Library

### Buttons

```tsx
import { Button } from '~/components/ui';

// Primary button
<Button variant="primary">Add to Cart</Button>

// Secondary button
<Button variant="secondary">Learn More</Button>

// Ghost button
<Button variant="ghost">Cancel</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// Full width
<Button fullWidth>Full Width Button</Button>
```

### Form Elements

```tsx
import { Input, Textarea, Select } from '~/components/ui';

// Input
<Input 
  label="Email Address"
  type="email"
  placeholder="you@example.com"
  error="Invalid email"
  helperText="We'll never share your email"
/>

// Textarea
<Textarea 
  label="Message"
  rows={5}
  placeholder="Tell us about yourself..."
/>

// Select
<Select 
  label="Size"
  options={[
    { value: 'xs', label: 'Extra Small' },
    { value: 's', label: 'Small' },
    { value: 'm', label: 'Medium' },
    { value: 'l', label: 'Large' },
    { value: 'xl', label: 'Extra Large' },
  ]}
/>
```

### Layout Components

```tsx
import { Container, SectionHeading, ProductGrid } from '~/components/ui';

// Container
<Container size="default">
  {/* Your content */}
</Container>

<Container size="narrow">
  {/* Narrow content like blog posts */}
</Container>

<Container size="wide">
  {/* Full-width content */}
</Container>

// Section Heading
<SectionHeading 
  title="New Arrivals"
  subtitle="Discover our latest curated collection"
  align="center"
/>

// Product Grid (automatically responsive)
<ProductGrid>
  {products.map(product => (
    <ProductItem key={product.id} product={product} />
  ))}
</ProductGrid>
```

### Product Card

```tsx
import { ProductItem } from '~/components/ProductItem';

<ProductItem 
  product={product}
  loading="lazy" // or "eager" for above-the-fold
/>
```

### Badges

```tsx
import { Badge } from '~/components/ui';

<Badge variant="default">Featured</Badge>
<Badge variant="sale">Sale</Badge>
<Badge variant="new">New</Badge>
<Badge variant="soldout">Sold Out</Badge>
```

## 🎯 Utility Classes

### Spacing

```tsx
// Use Tailwind spacing scale
className="p-6"        // padding
className="m-4"        // margin
className="space-y-8"  // vertical spacing between children

// Section padding (responsive)
className="section-padding"  // py-12 md:py-16 lg:py-20 xl:py-24
```

### Colors

```tsx
className="bg-talla-bg"      // Background color
className="text-talla-text"  // Text color
className="bg-talla-surface" // Surface color
className="text-gray-600"    // Gray variants (50-900)
```

### Typography

```tsx
className="font-display"  // Playfair Display SC
className="font-sans"     // Open Sans
className="font-serif"    // Georgia fallback

// Responsive sizing
className="text-4xl md:text-5xl lg:text-6xl"

// Tracking (letter-spacing)
className="tracking-tighter"  // -0.04em
className="tracking-tight"    // -0.01em
className="tracking-wide"     // 0.02em
className="tracking-widest"   // 0.1em
```

### Transitions

```tsx
className="transition-all duration-fast"   // 150ms
className="transition-all duration-base"   // 250ms
className="transition-all duration-slow"   // 400ms
className="transition-all duration-slower" // 600ms
```

### Shadows

```tsx
className="shadow-premium"     // Subtle shadow
className="shadow-premium-lg"  // Medium shadow
className="shadow-premium-xl"  // Large shadow
```

### Hover Effects

```tsx
// Image zoom
<div className="image-zoom-container">
  <img className="image-zoom" />
</div>

// Card hover
<div className="card-hover">
  {/* Card content */}
</div>
```

### Aspect Ratios

```tsx
className="aspect-portrait"   // 3:4 ratio (perfect for product images)
className="aspect-square"     // 1:1 ratio
className="aspect-video"      // 16:9 ratio
```

## 📱 Responsive Design

All components are mobile-first and fully responsive:

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

```tsx
// Example responsive classes
className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
className="text-base md:text-lg lg:text-xl"
className="px-6 md:px-12 lg:px-16"
```

## 🎨 Example Page

```tsx
import { useLoaderData } from 'react-router';
import { Container, SectionHeading, ProductGrid, Button } from '~/components/ui';
import { ProductItem } from '~/components/ProductItem';

export default function CollectionPage() {
  const { products } = useLoaderData();
  
  return (
    <div className="bg-talla-bg min-h-screen">
      {/* Hero Section */}
      <div className="bg-talla-surface py-20">
        <Container>
          <h1 className="font-display text-6xl md:text-7xl tracking-tighter text-center mb-6">
            Spring Collection
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Curated pieces for the modern wardrobe
          </p>
          <div className="flex justify-center">
            <Button variant="primary" size="lg">
              Shop Now
            </Button>
          </div>
        </Container>
      </div>
      
      {/* Products */}
      <Container className="section-padding">
        <SectionHeading 
          title="Featured Items"
          subtitle={`${products.length} products`}
        />
        
        <ProductGrid>
          {products.map(product => (
            <ProductItem 
              key={product.id} 
              product={product}
              loading="lazy"
            />
          ))}
        </ProductGrid>
      </Container>
    </div>
  );
}
```

## 🚀 Best Practices

1. **Use semantic HTML**: `<main>`, `<section>`, `<article>`, etc.
2. **Prefer Tailwind utilities** over custom CSS when possible
3. **Keep images optimized**: Use Shopify's Image component
4. **Maintain consistent spacing**: Use the spacing scale (4, 6, 8, 10, 12, 16, 20, 24)
5. **Test on mobile first**: Design and build for mobile, then enhance for desktop
6. **Use design tokens**: Reference Tailwind config colors instead of hex codes

## 📝 Typography Scale

```
h1: text-5xl md:text-6xl lg:text-7xl
h2: text-4xl md:text-5xl lg:text-6xl
h3: text-3xl md:text-4xl lg:text-5xl
h4: text-2xl md:text-3xl lg:text-4xl
h5: text-xl md:text-2xl
h6: text-lg md:text-xl
Body: text-base (16px)
Small: text-sm (14px)
Tiny: text-xs (12px)
```

## 🎭 Animation Examples

```tsx
// Fade in
<div className="animate-fade-in">
  Content fades in
</div>

// Slide up
<div className="animate-slide-up">
  Content slides up
</div>

// Scale in
<div className="animate-scale-in">
  Content scales in
</div>

// Custom hover
<div className="transition-all duration-base hover:scale-105 hover:shadow-premium-lg">
  Hover me
</div>
```

---

**Questions?** Refer to the Tailwind config (`tailwind.config.js`) for all available tokens and utilities.
