import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: '::',
    port: 8080,
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: path => path,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
      // Specific proxy for Google Calendar OAuth initiation
      '/auth/google': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        // No rewrite, so /auth/google goes to http://localhost:3000/auth/google
      },
      // The generic /auth proxy remains commented out to allow Vite to handle /auth/callback for SPA routing
      /*
      '/auth': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: path => path,
      },
      */
    },
  },
  plugins: [
    react(),
    // mode === 'development' && componentTagger() // Temporarily disable lovable-tagger
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    // Pass calendar IDs to frontend during build
    // In production, these are hardcoded since they're not sensitive
    'import.meta.env.VITE_GOOGLE_CALENDAR_PROJECTS': JSON.stringify(
      process.env.VITE_GOOGLE_CALENDAR_PROJECTS ||
        'c_9922ed38fd075f4e7f24561de50df694acadd8df4f8a73026ca4448aa85e55c5@group.calendar.google.com'
    ),
    'import.meta.env.VITE_GOOGLE_CALENDAR_WORK_ORDER': JSON.stringify(
      process.env.VITE_GOOGLE_CALENDAR_WORK_ORDER ||
        'c_ad5019e5b89334560b5bff86d2f7f7dfa0ae4dda8c0684c40d7737cf29b46be3@group.calendar.google.com'
    ),
  },
}));
