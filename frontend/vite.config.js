import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import compression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    react(),
    compression({
      verbose: true, // Exibe informações de compressão no console
      disable: false,
      threshold: 10240, // Comprime arquivos maiores que 10KB
      algorithm: 'gzip',
      ext: '.gz',
    }),
  ],
  server: {
    port: 3001, // Frontend em 3001, backend em 3000
    open: true,
    https: true, // Necessário para comunicar com backend HTTPS
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Desabilita sourcemap em build para produção
    minify: 'terser',
    rollupOptions: {
      input: 'index.html',
    },
  },
  // Remove base de gh-pages já que temos backend local
})
