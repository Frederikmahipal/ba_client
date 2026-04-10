import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const proxyTarget = process.env.VITE_PROXY_TARGET || 'http://localhost:4000';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': {
        target: proxyTarget,
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
