import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import preact from "@preact/preset-vite";


// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    preact(), react()
  ]
})
