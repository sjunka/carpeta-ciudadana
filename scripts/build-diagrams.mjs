#!/usr/bin/env node
// Exporta los diagramas de *4 como HTML autónomo a assignment1/diagramas/.
// El SVG sale del mismo JSX que pinta el sitio: una sola fuente, dos salidas.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { extraerSvg, estilos, RAIZ } from './svg.mjs'

const SALIDA = join(RAIZ, '../assignment1/diagramas')
const modelos = JSON.parse(readFileSync(join(RAIZ, 'src/content/modelos.json'), 'utf8'))

const FUENTE = { seq: 'SequenceDiagram', std: 'StateDiagram', dfd: 'DataFlowDiagram' }

// La carpeta de la entrega vive fuera del repositorio: en CI no existe y se salta el paso.
if (!existsSync(SALIDA)) {
  console.log(`· Diagramas omitidos: no existe ${SALIDA}.`)
  process.exit(0)
}

const { raiz, diagramas } = estilos()

for (const m of modelos.modelos) {
  const svg = extraerSvg(FUENTE[m.id])

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${m.titulo} — Carpeta Ciudadana</title>
<style>
${raiz}
body { margin: 0; background: var(--canvas-soft); color: var(--ink); font-family: var(--font) }
.page { max-width: 1180px; margin: 0 auto; padding: 48px 32px 64px }
.eyebrow { font-family: var(--font-mono); font-size: 12px; letter-spacing: .125px; color: var(--primary-text); margin: 0 0 10px }
h1 { font-size: 28px; font-weight: 700; letter-spacing: -.5px; margin: 0 0 6px }
.sub { color: var(--ink-muted); font-size: 15px; margin: 0 0 32px; max-width: 68ch }
.box { border: 1px solid var(--hairline); border-radius: 16px; background: var(--surface); padding: 24px; overflow-x: auto }
${diagramas}
</style></head><body><div class="page">
<p class="eyebrow">SRS *${m.num} · Arquitecturas Avanzadas de Software</p>
<h1>${m.titulo}</h1>
<p class="sub">${m.introduccion.replace(/<[^>]+>/g, '')}</p>
<div class="box">
${svg}
</div>
</div></body></html>
`
  const destino = join(SALIDA, m.archivo.replace('diagramas/', ''))
  writeFileSync(destino, html)
  console.log(`✓ ${destino}`)
}
