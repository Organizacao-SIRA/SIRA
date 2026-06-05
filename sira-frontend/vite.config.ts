import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('/react/') || id.includes('/react-dom/')) return 'vendor-react'
          if (id.includes('/i18next/') || id.includes('/react-i18next/')) return 'vendor-i18n'
          if (id.includes('/@tanstack/')) return 'vendor-query'
          if (id.includes('/framer-motion/')) return 'vendor-motion'
          if (id.includes('/lucide-react/')) return 'vendor-icons'
          return 'vendor'
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
      '/uploads': 'http://localhost:3000',
    },
  },
})
