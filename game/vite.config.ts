import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // On GitHub Pages, app is served from /<repo-name>/.
  // Workflow sets VITE_BASE_PATH automatically.
  base: process.env.VITE_BASE_PATH || '/',
})
