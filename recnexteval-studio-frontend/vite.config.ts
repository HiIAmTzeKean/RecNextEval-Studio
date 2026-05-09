import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  return {
    plugins: [react(), tailwindcss()],
    root: '.',
    build: {
      outDir: 'dist'
    },
    server: {
      port: 80,
      allowedHosts: ['recnexteval-studio.asuscomm.com'],
      watch: {
        usePolling: true,
      }
    },
  }
})