import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/', // ตั้ง base เป็น root ของ Netlify
  plugins: [react(), tailwindcss()]
})
