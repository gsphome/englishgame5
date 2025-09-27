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
        output: {
          // Manual CSS chunk splitting to stay under 500KB per chunk
          manualChunks: (id) => {
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
          },
          // Optimize chunk size limits for CSS
          chunkFileNames: 'assets/[name]-[hash].js'
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
      modules: false,
      // CSS preprocessing optimizations for pure CSS
      preprocessorOptions: {
        css: {
          // Remove charset declarations to reduce bundle size
          charset: false,
          // Optimize CSS output for pure CSS architecture
          additionalData: ''
        }
      },
      // CSS transformer optimizations
      transformer: 'postcss'
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, '../src')
      }
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'zustand'],
      exclude: []
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