import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { readFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// Los flujos que escriben en GovCarpeta (registro y autenticación) solo corren con GOVCARPETA_ESCRITURA=1.
const ESCRIBE = process.env.GOVCARPETA_ESCRITURA === '1'
const EVIDENCIAS = fileURLToPath(new URL('../../public/arquitectura/evidencias/', import.meta.url))
mkdirSync(EVIDENCIAS, { recursive: true })

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n').filter((l) => l.includes('=')).map((l) => l.split(/=(.*)/s).slice(0, 2)),
)
const KC = process.env.KEYCLOAK_URL ?? 'http://localhost:8081'
const GOV = 'https://govcarpeta-apis-4905ff3c005b.herokuapp.com'

// Cédula de prueba 99xxxxxxxx única por corrida.
const cedula = `99${String(Date.now()).slice(-8)}`
const CLAVE = 'clave-de-prueba-e2e-2026'
let cuenta = `prueba.eetoe.${cedula.slice(-5)}@carpetacolombia.co`

async function sinViolaciones(page, nombre) {
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
  expect(r.violations.map((v) => `${v.id}: ${v.nodes[0]?.target}`), `axe en ${nombre}`).toEqual([])
}

async function adminToken() {
  const r = await fetch(`${KC}/realms/carpeta/protocol/openid-connect/token`, {
    method: 'POST',
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: 'afiliacion-admin', client_secret: env.KC_AFILIACION_SECRETO }),
  })
  return (await r.json()).access_token
}

async function ingresar(page) {
  await page.goto('./')
  await page.getByRole('button', { name: 'Ingresar' }).click()
  await page.locator('#username').fill(cuenta)
  await page.locator('#password').fill(CLAVE)
  await page.locator('#kc-login').click()
  await expect(page.getByRole('heading', { name: 'Mi carpeta' })).toBeVisible()
}

test.describe.configure({ mode: 'serial' })

test.beforeAll(async () => {
  if (ESCRIBE) return // el usuario lo crea el flujo de registro
  // Sin escrituras al centralizador: el usuario se crea directo en Keycloak.
  const t = await adminToken()
  await fetch(`${KC}/admin/realms/carpeta/users`, {
    method: 'POST', headers: { authorization: `Bearer ${t}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      username: cuenta, email: cuenta, emailVerified: true, firstName: 'Prueba', lastName: 'Eetoe', enabled: true,
      attributes: { cedula: [cedula] }, credentials: [{ type: 'password', value: CLAVE, temporary: false }],
    }),
  })
})

test.afterAll(async () => {
  const t = await adminToken()
  const [u] = await (await fetch(`${KC}/admin/realms/carpeta/users?exact=true&username=${cuenta}`, { headers: { authorization: `Bearer ${t}` } })).json()
  if (u) await fetch(`${KC}/admin/realms/carpeta/users/${u.id}`, { method: 'DELETE', headers: { authorization: `Bearer ${t}` } })
  if (ESCRIBE && env.OPERADOR_ID) {
    await fetch(`${GOV}/apis/unregisterCitizen`, {
      method: 'DELETE', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: Number(cedula), operatorId: env.OPERADOR_ID, operatorName: 'Mi Carpeta Segura' }),
    })
  }
})

test('HU-01 · registro y afiliación', async ({ page }) => {
  test.skip(!ESCRIBE, 'Escribe en GovCarpeta: requiere GOVCARPETA_ESCRITURA=1')
  await page.goto('./#registro')
  await sinViolaciones(page, 'registro')
  await page.getByLabel('Número de cédula').fill(cedula)
  await page.getByLabel('Nombres').fill('Prueba')
  await page.getByLabel('Apellidos').fill('Eetoe')
  await page.getByRole('button', { name: 'Continuar' }).click()
  await page.getByLabel('Dirección de residencia').fill('Calle 10 # 20-30, Bogotá')
  await page.getByLabel('Correo personal').fill('prueba.e2e@example.com')
  await page.getByRole('button', { name: 'Continuar' }).click()
  await page.getByLabel('Crea una clave').fill(CLAVE)
  await page.getByRole('button', { name: 'Afiliarme' }).click()
  await expect(page.getByRole('heading', { name: 'Ya estás afiliado' })).toBeVisible({ timeout: 60_000 })
  cuenta = (await page.getByTestId('cuenta').textContent()).trim()
  await sinViolaciones(page, 'registro completado')
  await page.screenshot({ path: `${EVIDENCIAS}01-registro.png`, fullPage: true })
})

test('HU-01 · alterno: cédula inválida no avanza', async ({ page }) => {
  await page.goto('./#registro')
  await page.getByLabel('Número de cédula').fill('12a')
  await page.getByRole('button', { name: 'Continuar' }).click()
  await expect(page.getByText('Escribe entre 6 y 10 números')).toBeVisible()
})

test('HU-02 · ingreso con PKCE y cierre de sesión', async ({ page }) => {
  await page.goto('./')
  await sinViolaciones(page, 'inicio')
  await ingresar(page)
  await sinViolaciones(page, 'carpeta')
  await page.screenshot({ path: `${EVIDENCIAS}02-login.png`, fullPage: true })
  await page.getByRole('button', { name: 'Cerrar sesión' }).click()
  await expect(page.getByRole('button', { name: 'Ingresar' })).toBeVisible()
})

test('HU-02 · alterno: clave incorrecta', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'Ingresar' }).click()
  await page.locator('#username').fill(cuenta)
  await page.locator('#password').fill('no-es-la-clave')
  await page.locator('#kc-login').click()
  await expect(page.locator('#input-error, .kc-feedback-text, [id*="error"]').first()).toBeVisible()
})

test('HU-03 · carga de documento temporal', async ({ page }) => {
  await ingresar(page)
  await page.getByRole('link', { name: 'Subir documento' }).click()
  await sinViolaciones(page, 'subir')
  await page.getByLabel('Nombre del documento').fill('Diploma de bachiller')
  await page.getByLabel('Archivo').setInputFiles({ name: 'diploma.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n% prueba e2e\n%%EOF\n') })
  await page.getByRole('button', { name: 'Guardar en mi carpeta' }).click()
  await expect(page.getByRole('heading', { name: 'Diploma de bachiller' })).toBeVisible()
  await expect(page.getByText('Documento temporal · sin autenticar')).toBeVisible()
  await sinViolaciones(page, 'detalle')
  await page.screenshot({ path: `${EVIDENCIAS}03-carga.png`, fullPage: true })
})

test('HU-03 · alterno: tipo no permitido', async ({ page }) => {
  await ingresar(page)
  await page.goto('./#subir')
  await page.getByLabel('Nombre del documento').fill('Hoja')
  await page.getByLabel('Archivo').setInputFiles({ name: 'hoja.zip', mimeType: 'application/zip', buffer: Buffer.from('PK') })
  await page.getByRole('button', { name: 'Guardar en mi carpeta' }).click()
  await expect(page.getByText('Solo aceptamos PDF, JPG o PNG.')).toBeVisible()
})

test('HU-04 · autenticación vía GovCarpeta', async ({ page }) => {
  test.skip(!ESCRIBE, 'Escribe en GovCarpeta: requiere GOVCARPETA_ESCRITURA=1')
  await ingresar(page)
  await page.getByRole('link', { name: /Diploma de bachiller/ }).click()
  await page.getByRole('button', { name: 'Autenticar este documento' }).click()
  await expect(page.getByText('Autenticado por el centralizador')).toBeVisible({ timeout: 60_000 })
  await sinViolaciones(page, 'autenticado')
  await page.screenshot({ path: `${EVIDENCIAS}04-autenticacion.png`, fullPage: true })
})
