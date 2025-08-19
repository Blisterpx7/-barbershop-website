import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const isProduction = mode === 'production';
  const PRODUCTION_DOMAIN = 'https://your-app.vercel.app'; // FREE SUBDOMAIN (update after deployment)
  
  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: true,
      open: true,
      proxy: {
        '/api': {
          target: isProduction 
            ? PRODUCTION_DOMAIN
            : 'http://localhost:3000',
          changeOrigin: true,
          secure: isProduction,
        }
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            ui: ['lucide-react'],
            utils: ['axios', 'react-hot-toast']
          }
        }
      }
    },
    resolve: {
      alias: {
        '@': '/src'
      }
    },
    define: {
      __API_BASE_URL__: JSON.stringify(
        isProduction 
          ? PRODUCTION_DOMAIN
          : 'http://localhost:3000'
      )
    }
  }
})
