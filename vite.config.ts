
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
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html')
        },
        // On indique à Rollup de ne pas essayer de résoudre ces modules
        // car ils sont chargés via l'importmap dans index.html
        external: [
          'firebase/app',
          'firebase/firestore',
          'firebase/auth'
        ],
        output: {
          // On s'assure que les modules externes sont correctement gérés
          globals: {
            'firebase/app': 'firebaseApp',
            'firebase/firestore': 'firebaseFirestore',
            'firebase/auth': 'firebaseAuth'
          },
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-ai': ['@google/genai'],
          }
        }
      }
    }
  }
})
