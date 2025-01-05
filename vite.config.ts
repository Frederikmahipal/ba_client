import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://ba-server.vercel.app', // TODO: vercel url
        changeOrigin: true,
        secure: false,
      }
    }
  }
})