import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // Import plugin Tailwind v4 chính hãng

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Kích hoạt Tailwind v4 tích hợp sâu vào Vite
  ],
})