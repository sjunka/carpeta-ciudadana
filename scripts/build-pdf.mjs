#!/usr/bin/env node
// Genera el PDF del SRS a public/, que es de donde lo descarga el botón de la barra.
// Cadena: markdown -> HTML con pandoc -> PDF con el Chrome del sistema.
// No entra en `npm run build`: CI no tiene ni pandoc ni Chrome. El PDF se versiona ya hecho.
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync, existsSync, copyFileSync, statSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join, resolve, dirname } from 'node:path'
import { estilos, RAIZ } from './svg.mjs'

const FUENTE = join(RAIZ, 'docs/srs-assignment1.md')
const NOMBRE = 'srs-carpeta-ciudadana.pdf'
const DESTINO = join(RAIZ, 'public', NOMBRE)
const COPIA = join(RAIZ, '../assignment1', NOMBRE)

const CHROME = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  process.env.CHROME_PATH,
].find((p) => p && existsSync(p))

if (!CHROME) {
  console.error('\n✗ No se encontró Chrome. Instálalo o exporta CHROME_PATH con la ruta al binario.\n')
  process.exit(1)
}

// Las imágenes del markdown son relativas a docs/. Chrome las resuelve desde el temporal,
// así que se pasan a rutas absolutas antes de convertir.
const md = readFileSync(FUENTE, 'utf8').replace(
  /!\[([^\]]*)\]\(([^)]+)\)/g,
  (_, alt, ruta) => `![${alt}](file://${resolve(dirname(FUENTE), ruta)})`,
)

const cuerpo = execFileSync('pandoc', ['--from=gfm', '--to=html5'], { input: md, encoding: 'utf8' })
const { raiz } = estilos()

const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>SRS — Carpeta Ciudadana</title><style>
${raiz}
@page { size: A4; margin: 18mm 14mm 16mm }
body { margin: 0; font-family: var(--font); color: var(--ink); font-size: 10pt; line-height: 1.5 }

/* Cada sección de primer nivel abre página; la portada no. */
h1 { font-size: 19pt; font-weight: 700; letter-spacing: -.5px; margin: 0 0 10px; break-before: page }
h1:first-of-type { break-before: auto }
h2 { font-size: 13.5pt; font-weight: 700; letter-spacing: -.25px; margin: 22px 0 8px }
h3 { font-size: 11.5pt; font-weight: 700; margin: 18px 0 6px }
h4 { font-size: 10pt; font-weight: 700; color: var(--ink-muted); margin: 14px 0 4px }
h1, h2, h3, h4 { break-after: avoid }
p, li { orphans: 3; widows: 3 }
ul { padding-left: 18px; margin: 6px 0 }
code { font-family: var(--font-mono); font-size: 8.5pt; background: var(--canvas-soft); padding: 1px 4px; border-radius: 4px }
a { color: var(--primary-text); text-decoration: none }
hr { border: 0; border-top: 1px solid var(--hairline); margin: 20px 0 }

/* Las tablas son el grueso del documento: cabecera repetida en cada página y sin cortar filas. */
table { width: 100%; border-collapse: collapse; font-size: 8pt; margin: 8px 0 14px; table-layout: fixed }
thead { display: table-header-group }
tr { break-inside: avoid }
th, td { border: 1px solid var(--hairline); padding: 5px 7px; text-align: left; vertical-align: top; overflow-wrap: anywhere }
th { background: var(--canvas-soft); font-weight: 700 }

/* Los diagramas van a página completa, nunca partidos. */
img { display: block; max-width: 100%; height: auto; margin: 10px auto; break-inside: avoid }
</style></head><body>
${cuerpo}
</body></html>
`

const tmp = mkdtempSync(join(tmpdir(), 'pdf-'))
try {
  const fuente = join(tmp, 'srs.html')
  writeFileSync(fuente, html)
  mkdirSync(dirname(DESTINO), { recursive: true })
  execFileSync(CHROME, [
    '--headless=new',
    '--disable-gpu',
    '--no-pdf-header-footer',
    `--print-to-pdf=${DESTINO}`,
    `file://${fuente}`,
  ], { stdio: ['ignore', 'ignore', 'pipe'] })
  console.log(`✓ ${DESTINO} — ${(statSync(DESTINO).size / 1024 / 1024).toFixed(1)} MB`)

  // La misma copia en la carpeta de la entrega, si existe en local.
  if (existsSync(dirname(COPIA))) {
    copyFileSync(DESTINO, COPIA)
    console.log(`✓ ${COPIA}`)
  }
} finally {
  rmSync(tmp, { recursive: true, force: true })
}
