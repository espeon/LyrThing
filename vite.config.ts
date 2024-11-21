import { defineConfig } from 'vite'
import legacy from '@vitejs/plugin-legacy';

import preact from '@preact/preset-vite';


// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [preact(),
            legacy({
            targets: ['Chrome 69'], // Specify the browsers you want to support
        }),],
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        assetFileNames: '[name]-[hash][extname]',
        chunkFileNames: '[name]-[hash].js',
        entryFileNames: '[name]-[hash].js',
      },
    }
  }
})
