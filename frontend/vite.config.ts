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
      includeAssets: ['logo.png', 'favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Sushi Shop Egypt | سوشي شوب مصر',
        short_name: 'Sushi Shop',
        description: 'Finest sushi on Egypt\'s North Coast',
        theme_color: '#0A0A0A',
        background_color: '#0A0A0A',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        lang: 'ar',
        dir: 'rtl',
        categories: ['food', 'shopping'],
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'القائمة', short_name: 'Menu', url: '/#menu', icons: [{ src: 'pwa-192.png', sizes: '192x192' }] },
          { name: 'لوحة التحكم', short_name: 'Admin', url: '/admin', icons: [{ src: 'pwa-192.png', sizes: '192x192' }] },
          { name: 'بوابة الموظفين', short_name: 'Staff', url: '/staff', icons: [{ src: 'pwa-192.png', sizes: '192x192' }] },
          { name: 'السلة', short_name: 'Cart', url: '/cart', icons: [{ src: 'pwa-192.png', sizes: '192x192' }] },
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
