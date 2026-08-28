import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png', 'logo-light.png', 'favicon.svg', 'apple-touch-icon.png', 'logo/*.png'],
      manifest: {
        name: 'Sushi Shop Egypt',
        short_name: 'Sushi Shop',
        description: 'Finest sushi on Egypt\'s North Coast',
        theme_color: '#04120e',
        background_color: '#04120e',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        lang: 'en',
        dir: 'ltr',
        categories: ['food', 'shopping'],
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'Menu', short_name: 'Menu', url: '/#menu', icons: [{ src: 'pwa-192.png', sizes: '192x192' }] },
          { name: 'Admin Panel', short_name: 'Admin', url: '/admin/login', icons: [{ src: 'pwa-192.png', sizes: '192x192' }] },
          { name: 'Staff Portal', short_name: 'Staff', url: '/staff', icons: [{ src: 'pwa-192.png', sizes: '192x192' }] },
          { name: 'Cart', short_name: 'Cart', url: '/cart', icons: [{ src: 'pwa-192.png', sizes: '192x192' }] },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/soshi-eg-api\.nvrgvup205\.workers\.dev\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 300 },
            },
          },
          {
            urlPattern: /\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 300 },
            },
          },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
});
