import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Down-level syntax (optional chaining, nullish coalescing, etc.) so the
    // bundle runs on older iOS Safari (iOS 12/13 era), not just current browsers.
    target: ['es2017', 'safari12'],
  },
})
