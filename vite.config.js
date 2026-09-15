import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: la ruta donde GitHub Pages sirve el sitio.
// Cambiar solo si se renombra el repositorio.
export default defineConfig({
  plugins: [react()],
  base: '/carpeta-ciudadana/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Una página por entrega: A1 en la raíz y A2 en arquitectura/. La SPA del operador (operador/index.html)
    // se publica cuando el backend esté en Cloud Run; mientras tanto corre solo en local con `vite`.
    rollupOptions: { input: { srs: 'index.html', arquitectura: 'arquitectura/index.html' } },
  },
})
