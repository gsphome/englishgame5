import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => {
  // Load env file from config directory based on mode
  const env = loadEnv(mode, __dirname, '');

  // Set NODE_ENV properly based on mode (Vite best practice)
  const isProduction = mode === 'production';

  return {
    plugins: [
      react({
        // Ensure React is available globally to prevent createContext issues
        jsxRuntime: 'automatic',
        jsxImportSource: 'react',
        // Add babel config to ensure proper React handling
        babel: {
          plugins: []
        }
      })
    ],
    root: resolve(__dirname, '..'),
    base: env.VITE_APP_BASE_URL || '/',
    build: {
      outDir: resolve(__dirname, '../dist'),
      emptyOutDir: true,
      // CSS chunk optimization for 500KB target compliance (pure CSS architecture)
      rollupOptions: {
        // Ensure proper loading order for dependencies
        external: [],
        output: {
          // Ensure vendor chunk loads first (contains React)
          chunkFileNames: (chunkInfo) => {
            if (chunkInfo.name === 'vendor') {
              return 'assets/vendor-[hash].js';
            }
            return 'assets/[name]-[hash].js';
          },
          // Manual chunk splitting with proper dependency order
          manualChunks: (id) => {
            // CRITICAL: Keep React in main bundle to ensure synchronous loading
            // Don't separate React into vendor chunk to avoid async loading issues
            if (id.includes('node_modules/react') ||
              id.includes('node_modules/react-dom')) {
              return undefined; // Keep in main bundle
            }

            // Other vendor dependencies can be separate
            if (id.includes('node_modules/zustand') ||
              id.includes('node_modules/@tanstack/react-query') ||
              id.includes('node_modules/lucide-react') ||
              id.includes('node_modules/fuse.js')) {
              return 'vendor';
            }

            // Split CSS by type for better chunk management
            if (id.includes('src/styles/design-system/')) {
              return 'design-system';
            }
            if (id.includes('src/styles/themes/')) {
              return 'themes';
            }
            if (id.includes('src/styles/components/')) {
              return 'components';
            }

            // Keep learning components together for lazy loading
            if (id.includes('src/components/learning/')) {
              return 'learning-components';
            }
            // Keep layout components together
            if (id.includes('src/components/layout/') || id.includes('src/components/ui/')) {
              return 'ui-components';
            }

            return undefined;
          },
          // Optimize CSS file naming for better caching and identification
          assetFileNames: (assetInfo) => {
            if (assetInfo.name?.endsWith('.css')) {
              // Descriptive names for CSS chunks to monitor size
              if (assetInfo.name.includes('index') || assetInfo.name.includes('main')) {
                return 'assets/main-[hash].css';
              }
              if (assetInfo.name.includes('design-system')) {
                return 'assets/design-system-[hash].css';
              }
              if (assetInfo.name.includes('themes')) {
                return 'assets/themes-[hash].css';
              }
              if (assetInfo.name.includes('components')) {
                return 'assets/components-[hash].css';
              }
              return 'assets/[name]-[hash].css';
            }
            return 'assets/[name]-[hash][extname]';
          }
        }
      },
      // Enable CSS code splitting for better chunk management
      cssCodeSplit: true,
      // Optimize CSS minification for pure CSS
      cssMinify: 'esbuild',
      // Set chunk size warnings for CSS monitoring
      chunkSizeWarningLimit: 500 // 500KB warning limit
    },
    publicDir: resolve(__dirname, '../public'),
    css: {
      postcss: resolve(__dirname, 'postcss.config.js'),
      // CSS optimization settings for pure CSS architecture
      devSourcemap: mode === 'development',
      // Disable CSS modules - using pure BEM methodology
      modules: false
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, '../src')
      }
    },
    optimizeDeps: {
      // Pre-bundle critical dependencies to ensure they're available
      include: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'zustand',
        '@tanstack/react-query'
      ],
      exclude: [],
      // Don't force optimization to allow proper bundling
      force: false
    },
    server: {
      fs: {
        allow: ['..']
      },
      port: 5173,
      host: true,
      hmr: {
        port: 5173,
        clientPort: 5173
      }
    },
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      'window.__BUILD_TIME__': JSON.stringify(new Date().toISOString()),
      // Properly define NODE_ENV for runtime (Vite best practice)
      'process.env.NODE_ENV': JSON.stringify(mode),
      // Make environment variables available at build time
      'import.meta.env.VITE_IS_PRODUCTION': JSON.stringify(isProduction)
    },
    envDir: __dirname
  };
});