import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: false // Prevents auto-opening browser
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx']
  },
  build: {
    assetsInlineLimit: 0, // Don't inline any assets as base64
    rollupOptions: {
      output: {
        manualChunks: {
          fonts: ['./public/NotoSans-Regular.ttf']
        }
      }
    }
  },
  publicDir: 'public'
})