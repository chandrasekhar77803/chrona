import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
    host: true, // Listens on all local IP addresses & network interfaces (0.0.0.0)
    allowedHosts: true, // Permits any public tunnel hostname (ngrok, localtunnel, cloudflare, etc.)
    proxy: {
      '/api/hackerrank': {
        target: 'https://www.hackerrank.com/rest/hackers',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/hackerrank/, ''),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      }
    }
  }
})
