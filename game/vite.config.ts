import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isItchBuild = mode === 'itch' || process.env.VITE_ITCH === '1'

  return {
  plugins: [react()],
  // GitHub Pages: VITE_BASE_PATH=/ . itch.io: always relative ./ (see build:itch).
  base: isItchBuild ? './' : (process.env.VITE_BASE_PATH || '/'),
  build: isItchBuild
    ? {
        outDir: path.resolve(__dirname, '../itch-build'),
        emptyOutDir: true,
        rollupOptions: {
          input: path.resolve(__dirname, 'index.itch.html'),
        },
      }
    : undefined,
  }
})
