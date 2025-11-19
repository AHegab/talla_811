/** @type {import('tailwindcss').Config} */
export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // TALLA Premium Brand Colors
        talla: {
          bg: '#FBFBFB',
          text: '#292929',
          surface: '#DDDEE2',
        },
        // Alias for the brand spec
        base: '#FBFBFB',
        neutral: '#DDDEE2',
        dark: '#292929',
        // Grayscale palette
        gray: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E8E9EC',
          300: '#DDDEE2',
          400: '#C4C5CB',
          500: '#9A9BA3',
          600: '#6B6C75',
          700: '#4A4B52',
          800: '#292929',
          900: '#1A1A1A',
        },
      },
      fontFamily: {
        display: ['"Playfair Display SC"', 'Georgia', 'serif'],
        sans: ['"Open Sans"', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        serif: ['Georgia', '"Times New Roman"', 'serif'],
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        26: '6.5rem',
        30: '7.5rem',
      },
      maxWidth: {
        container: '1920px',
        content: '1400px',
        narrow: '800px',
      },
      boxShadow: {
        premium: '0 2px 8px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.06)',
        'premium-lg': '0 4px 16px rgba(0, 0, 0, 0.06), 0 8px 32px rgba(0, 0, 0, 0.08)',
        'premium-xl': '0 8px 32px rgba(0, 0, 0, 0.08), 0 16px 64px rgba(0, 0, 0, 0.1)',
      },
      transitionDuration: {
        fast: '150ms',
        base: '250ms',
        slow: '400ms',
        slower: '600ms',
      },
      aspectRatio: {
        portrait: '3 / 4',
        // Taller poster-style aspect ratio (width / height). Use 9/16 for a taller poster look.
        poster: '9 / 16',
      },
    },
  },
  plugins: [],
}
