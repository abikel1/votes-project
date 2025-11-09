import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // כל מה שמתחיל ב-/api יופנה לשרת ה-Node
      '/api': {
        target: 'http://localhost:3000', // שנה אם השרת על פורט אחר
        changeOrigin: true,
      },
    },
  },
})
