import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
    host: true, // Listens on all local IP addresses & network interfaces (0.0.0.0)
    allowedHosts: true // Permits any public tunnel hostname (ngrok, localtunnel, cloudflare, etc.)
  }
})
