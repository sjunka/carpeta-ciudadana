import { defineConfig } from '@playwright/test'

// Local: levanta Vite y usa compose. Nube: BASE_URL apunta a GitHub Pages y no se levanta nada.
const BASE_URL = process.env.BASE_URL ?? 'http://localhost:4173/carpeta-ciudadana/operador/'

export default defineConfig({
  testDir: '.',
  timeout: 90_000,
  retries: 1, // GovCarpeta en Heroku puede tardar en despertar
  workers: 1,
  reporter: [['list']],
  use: { baseURL: BASE_URL, locale: 'es-CO', trace: 'retain-on-failure' },
  webServer: process.env.BASE_URL ? undefined : {
    command: 'npx vite --port 4173 --strictPort',
    cwd: '../..',
    url: BASE_URL,
    reuseExistingServer: true,
  },
})
