import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true, // Enable service worker in development for offline testing
        type: 'module'
      },
      workbox: {
  globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
  runtimeCaching: [{
    urlPattern: /^https:\/\/ipdc-oss-platform\.onrender\.com\/.*/i,
    handler: 'NetworkFirst',
    options: { cacheName: 'api-cache' }
  }]
}
      includeAssets: ['favicon.ico', 'robots.txt'],
      manifest: {
        name: 'IPDC-OSS Platform',
        short_name: 'IPDC-OSS',
        description: 'Ethiopian Industrial Parks Development Corporation - One-Stop Service Platform',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'ipdc-oss-icon.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'ipdc-oss-icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'firebase-storage-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 1 week
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'mui': ['@mui/material', '@emotion/react', '@emotion/styled'],
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore']
        }
      }
    }
  }
})
