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
    // Una página por entrega: A1 en la raíz, A2 en arquitectura/.
    rollupOptions: { input: { srs: 'index.html', arquitectura: 'arquitectura/index.html' } },
  },
})
