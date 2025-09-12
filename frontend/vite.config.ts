import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const apiBase = process.env.VITE_API_BASE || 'http://localhost:3000';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: apiBase,
        changeOrigin: true,
      },
    },
  },
});


