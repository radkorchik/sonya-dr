import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['caticon.jpg', 'favicon.svg', 'sounds/*'],
      manifest: {
        name: 'Соне',
        short_name: 'Соне',
        description: 'Личное пространство для Сонечки',
        theme_color: '#FF6FA5',
        background_color: '#FFF8FB',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/caticon.jpg', sizes: '512x512', type: 'image/jpeg', purpose: 'any' },
          { src: '/caticon.jpg', sizes: '512x512', type: 'image/jpeg', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg,jpg,jpeg,webp,woff2,json,m4a,mp3}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.open-meteo\.com\//,
            handler: 'CacheFirst',
            options: { cacheName: 'weather', expiration: { maxAgeSeconds: 3600 } },
          },
          {
            urlPattern: /^https:\/\/cataas\.com\//,
            handler: 'CacheFirst',
            options: { cacheName: 'cats', expiration: { maxAgeSeconds: 600 } },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
