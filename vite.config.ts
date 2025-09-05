import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile' // 👈 named import


// https://vite.dev/config/
export default defineConfig({
    // Tailwind CSS theme configuration should be moved to tailwind.config.js
  plugins: [
    react(),
    tailwindcss(),
    viteSingleFile(), // 👈 inlines JS/CSS into index.html
  ],
  build: {
    target: 'es2017',
    assetsInlineLimit: 100000000, // inline assets
  },
})
