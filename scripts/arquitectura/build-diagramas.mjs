#!/usr/bin/env node
// Exporta los diagramas de A2 como HTML autónomo y PNG 2× a ../assignment2/diagramas/.
// El SVG sale del mismo Diagrama.jsx que pinta el sitio, renderizado en Node.
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { tmpdir, homedir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build } from 'esbuild'
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '../..')
const SALIDA = join(RAIZ, '../assignment2/diagramas')
const ESCALA = 2
const leer = (f) => JSON.parse(readFileSync(join(RAIZ, 'src/arquitectura/content', f), 'utf8'))

// La carpeta de entregas vive fuera del repositorio: en CI no existe y se salta el paso.
if (!existsSync(join(RAIZ, '../assignment1'))) {
  console.log('· Diagramas A2 omitidos: no hay carpeta de entregas junto al repositorio.')
  process.exit(0)
}
mkdirSync(SALIDA, { recursive: true })

const historias = leer('historias.json')
const diagramas = [
  { ...historias.mapa, num: '2.1' },
  ...leer('componentes.json').diagramas,
  ...leer('secuencias.json').secuencias,
  ...leer('despliegue.json').diagramas,
]

const bundle = join(RAIZ, `.diag-a2-${process.pid}.mjs`)
await build({
  entryPoints: [join(RAIZ, 'src/arquitectura/diagramas/Diagrama.jsx')],
  bundle: true, format: 'esm', platform: 'node', jsx: 'automatic', outfile: bundle,
  external: ['react', 'react/jsx-runtime'], logLevel: 'error',
})
const { default: Diagrama } = await import(pathToFileURL(bundle))
rmSync(bundle, { force: true })

const tokens = readFileSync(join(RAIZ, 'src/styles/tokens.css'), 'utf8')
const raiz = tokens.slice(tokens.indexOf(':root {'), tokens.indexOf('}', tokens.indexOf(':root {')) + 1)
const css = raiz + readFileSync(join(RAIZ, 'src/styles/diagrams.css'), 'utf8') + readFileSync(join(RAIZ, 'src/arquitectura/arquitectura.css'), 'utf8')

const CHROME = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  process.env.CHROME_PATH,
].find((p) => p && existsSync(p))
const SELF_CHECK = join(homedir(), '.claude/skills/diagram-design/scripts/self_check.py')
const tmp = mkdtempSync(join(tmpdir(), 'a2-'))

try {
  for (const d of diagramas) {
    const svg = renderToStaticMarkup(createElement(Diagrama, { d })).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ')
    const [w, h] = svg.match(/viewBox="0 0 (\d+) (\d+)"/).slice(1).map(Number)
    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${d.titulo} — Carpeta Ciudadana</title>
<style>
${css}
body { margin: 0; background: var(--canvas-soft); color: var(--ink); font-family: var(--font) }
.page { max-width: 1200px; margin: 0 auto; padding: 48px 32px 64px }
.eyebrow { font-family: var(--font-mono); font-size: 12px; color: var(--primary-text); margin: 0 0 10px }
h1 { font-size: 28px; font-weight: 700; letter-spacing: -.5px; margin: 0 0 6px }
.sub { color: var(--ink-muted); font-size: 15px; margin: 0 0 32px; max-width: 68ch }
.box { border: 1px solid var(--hairline); border-radius: 16px; background: var(--surface); padding: 24px; overflow-x: auto }
</style></head><body><div class="page">
<p class="eyebrow">Arquitectura *${d.num} · Arquitecturas Avanzadas de Software</p>
<h1>${d.titulo}</h1>
<p class="sub">${(d.introduccion ?? d.pasos.join(' ')).replace(/<[^>]+>/g, '')}</p>
<div class="box">
${svg}
</div>
</div></body></html>
`
    const destino = join(SALIDA, `${d.id}.html`)
    writeFileSync(destino, html)
    console.log(`✓ ${destino}`)

    if (CHROME) {
      const fuente = join(tmp, `${d.id}.html`)
      writeFileSync(fuente, `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${css}
html, body { margin: 0; padding: 0; background: var(--surface) }
svg.dd { display: block; width: ${w}px; height: ${h}px; min-width: 0 }</style></head><body>${svg}</body></html>`)
      execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--force-device-scale-factor=${ESCALA}`,
        `--window-size=${w},${h}`, '--default-background-color=FFFFFF', `--screenshot=${join(SALIDA, `${d.id}.png`)}`, `file://${fuente}`],
      { stdio: ['ignore', 'ignore', 'pipe'] })
      console.log(`✓ ${d.id}.png — ${w * ESCALA}×${h * ESCALA}`)
    }
    // Regla A2.7: la verificación del skill diagram-design corre sobre cada HTML exportado.
    if (existsSync(SELF_CHECK)) {
      try {
        execFileSync('python3', [SELF_CHECK, destino], { stdio: 'inherit' })
      } catch {
        process.exitCode = 1
      }
    }
  }
} finally {
  rmSync(tmp, { recursive: true, force: true })
}
