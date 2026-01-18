import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.VITE_PROXY_TARGET || 'https://api-fuelabc.onrender.com';

  return {
    plugins: [
      // The React and Tailwind plugins are both required for Make, even if
      // Tailwind is not being actively used – do not remove them
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        // Alias @ to the src directory
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: true,
      port: Number(process.env.PORT) || 5173,
      proxy: {
        '/api': {
          target: target,
          changeOrigin: true,
          secure: false,
        },
        '/auth': {
          target: target,
          changeOrigin: true,
          secure: false,
        },
        '/notification': {
          target: target,
          changeOrigin: true,
          secure: false,
          bypass: (req, res, options) => {
            if (req.headers.accept && req.headers.accept.includes('text/html')) {
              return req.url;
            }
          }
        }
      }
    },
    preview: {
      host: true,
      port: Number(process.env.PORT) || 4173,
      allowedHosts: true
    },
    define: {
      'process.env': {}
    }
  }
})
