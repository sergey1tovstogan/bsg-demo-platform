import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  cacheDir: '.vite',
  base: '/', // Ensure base path is root for Azure Static Web Apps
  define: {
    'global': 'globalThis',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'buffer': 'buffer/'
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true
  },
  server: {
    port: 3000,
    host: true,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            // Only log non-connection errors
            if (err.code !== 'ECONNRESET' && err.code !== 'ECONNREFUSED') {
              console.log('Proxy error:', err.code, err.message);
            }
          });
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setTimeout(900000);
          });
        },
        timeout: 900000
      }
    }
  }
})

