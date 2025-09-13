import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const apiBase = 'https://yt-analysis-yr5t.onrender.com';

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


