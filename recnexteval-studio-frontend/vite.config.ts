import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  // Load environment variables based on mode
  // const env = loadEnv(mode, process.cwd(), 'VITE_')
  
  return {
    plugins: [react(), tailwindcss()],
    root: '.',
    build: {
      outDir: 'dist'
    },
    server: {
      port: 80,
      watch: {
        usePolling: true,
      }
    }
  }
})