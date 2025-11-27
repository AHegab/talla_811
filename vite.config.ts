import { reactRouter } from '@react-router/dev/vite';
import { hydrogen } from '@shopify/hydrogen/vite';
import { oxygen } from '@shopify/mini-oxygen/vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  // Resolve paths to prevent URL encoding issues with spaces
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './app'),
      'react-router-dom/server': 'react-router',
    },
  },
  plugins: [
    tailwindcss(),
    hydrogen(),
    oxygen(),
    reactRouter(),
    tsconfigPaths(),
  ],
  build: {
    // Allow a strict Content-Security-Policy
    // withtout inlining assets as base64:
    assetsInlineLimit: 0,
  },
  ssr: {
    optimizeDeps: {
      /**
       * Include dependencies here if they throw CJS<>ESM errors.
       * For example, for the following error:
       *
       * > ReferenceError: module is not defined
       * >   at /Users/.../node_modules/example-dep/index.js:1:1
       *
       * Include 'example-dep' in the array below.
       * @see https://vitejs.dev/config/dep-optimization-options
       */
      include: ['set-cookie-parser', 'cookie', 'react-router'],
    },
    // Force Vite to bundle these ESM-only packages for SSR which avoids
    // issues with CommonJS/exports resolution and missing subpath specifiers
    // If a Node built-in or a dev dependency (like vitest) is accidentally
    // pulled into the server bundle, mark built-in modules external so Vite
    // doesn't try to bundle them (e.g. 'async_hooks' used by p-limit).
    external: ['async_hooks'],
    noExternal: ['react-router', 'react-router-dom', '@remix-run/react'],
  },
  server: {
    allowedHosts: ['.tryhydrogen.dev'],
  },
});
