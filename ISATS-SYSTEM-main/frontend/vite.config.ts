import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // In development, serve from root '/' so URL is http://localhost:3000/home
  // In production build, prefix with '/static/frontend/' for Django staticfiles
  base: command === 'serve' ? '/' : '/static/frontend/',
  build: {
    outDir: '../backend/static/frontend',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/index.js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  server: {
    port: 3000,
    open: '/home',
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/login': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/logout': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/register': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/static/media': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
}))
