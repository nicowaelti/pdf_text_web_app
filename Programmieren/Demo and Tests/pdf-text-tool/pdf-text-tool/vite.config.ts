import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        format: 'es'
      }
    }
  },
  esbuild: {
    target: 'esnext',
    supported: {
      'top-level-await': true
    }
  },
  server: {
    headers: {
      // Set correct MIME type for PDF.js worker
      'pdf.worker.min.js': {
        'Content-Type': 'application/javascript',
      },
    },
  },
})
