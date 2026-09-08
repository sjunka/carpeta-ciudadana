import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: la ruta donde GitHub Pages sirve el sitio.
// Cambiar solo si se renombra el repositorio.
export default defineConfig({
  plugins: [react()],
  base: '/carpeta-ciudadana/',
  build: { outDir: 'dist', assetsDir: 'assets' },
})
