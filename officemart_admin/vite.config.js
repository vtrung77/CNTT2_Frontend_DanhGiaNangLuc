// Cấu hình Vite (không sửa). Mọi request bắt đầu bằng /api được chuyển tới API mock ở cổng 3001.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tu_kiem_tra/setup.js',
  },
});
