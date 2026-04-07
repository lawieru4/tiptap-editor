import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import viteCompression from 'vite-plugin-compression'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // Gzip Compression
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240, // 10kb
      algorithm: 'gzip',
      ext: '.gz',
    }),
    // Bundle Analysis
    visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
      filename: 'stats.html'
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    open: true
  },
  esbuild: {
    // Remove console and debugger in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
  },
  build: {
    rollupOptions: {
      output: {
        // Static Asset Classification
        chunkFileNames: 'static/js/[name]-[hash].js',
        entryFileNames: 'static/js/[name]-[hash].js',
        assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
        // Code Splitting Strategy
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('primevue')) {
              return 'vendor-primevue'
            }
            if (id.includes('vue') || id.includes('pinia') || id.includes('router')) {
              return 'vendor-core'
            }
            if (id.includes('gsap')) {
              return 'vendor-gsap'
            }
            return 'vendor-libs'
          }
        }
      }
    }
  }
})
