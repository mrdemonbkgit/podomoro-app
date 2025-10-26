import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  esbuild: {
    drop: ['debugger'], // Only drop debugger statements, NOT console!
    // NOTE: We DON'T drop 'console' because:
    // - logger.error() relies on console.error for production logging
    // - Dropping 'console' would remove ALL console methods including .error
    // - logger.debug/info already check isDevelopment at runtime
  },
})

