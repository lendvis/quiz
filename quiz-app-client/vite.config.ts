import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Публичное демо живёт на GitHub Pages по подпути, обычная сборка — в корне.
// BASE_PATH задаётся при сборке демо, чтобы ассеты искались там же, где лежат.
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [tailwindcss(), react()],
})
