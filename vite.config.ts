import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '');
  
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY || env.API_KEY)
    },
    server: {
      host: true
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      chunkSizeWarningLimit: 1000, // Augmente la limite à 1Mo pour supprimer l'alerte
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html')
        },
        output: {
          // Sépare les grosses bibliothèques pour un chargement plus rapide (Manual Chunking)
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-ai': ['@google/genai'],
            // Note: leaflet est chargé via CDN dans index.html donc pas besoin de le chunker ici
          }
        }
      }
    }
  }
})