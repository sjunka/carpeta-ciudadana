#!/usr/bin/env node
// Exporta cada diagrama como PNG a assignment1/diagramas/, para que el SRS en markdown
// lleve la imagen embebida y el PDF no salga con huecos.
// Render con el Chrome ya instalado en el sistema: no añade dependencia al paquete.
import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { extraerSvg, viewBox, estilos, RAIZ } from './svg.mjs'

const SALIDA = join(RAIZ, '../assignment1/diagramas')
const ESCALA = 2 // 2× para que el diagrama aguante impresión

// El diagrama de contexto (*2.1) no está en modelos.json: es de la sección 2.
const modelos = JSON.parse(readFileSync(join(RAIZ, 'src/content/modelos.json'), 'utf8'))
const FUENTE = { seq: 'SequenceDiagram', std: 'StateDiagram', dfd: 'DataFlowDiagram' }
const trabajos = [
  { componente: 'ContextDiagram', png: 'contexto-sistema.png' },
  ...modelos.modelos.map((m) => ({
    componente: FUENTE[m.id],
    png: m.archivo.replace('diagramas/', '').replace('.html', '.png'),
  })),
]

const CHROME = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  process.env.CHROME_PATH,
].find((p) => p && existsSync(p))

// Sin Chrome o sin la carpeta de la entrega —el caso de CI— se salta el paso:
// los PNG ya están generados y versionados, y `npm run build` no debe caerse por esto.
if (!CHROME || !existsSync(SALIDA)) {
  console.log(`· PNG omitidos: ${CHROME ? 'no existe ' + SALIDA : 'no se encontró Chrome'}.`)
  process.exit(0)
}

const { raiz, diagramas } = estilos()
const tmp = mkdtempSync(join(tmpdir(), 'png-'))

try {
  for (const t of trabajos) {
    const svg = extraerSvg(t.componente)
    const { w, h } = viewBox(svg)
    // El SVG se fija al tamaño de su viewBox: así el recorte de la ventana es exacto.
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
${raiz}
html, body { margin: 0; padding: 0; background: var(--surface) }
svg.dd { display: block; width: ${w}px; height: ${h}px }
${diagramas}
</style></head><body>${svg}</body></html>`
    const fuente = join(tmp, `${t.png}.html`)
    const destino = join(SALIDA, t.png)
    writeFileSync(fuente, html)
    execFileSync(CHROME, [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      `--force-device-scale-factor=${ESCALA}`,
      `--window-size=${w},${h}`,
      '--default-background-color=FFFFFF',
      `--screenshot=${destino}`,
      `file://${fuente}`,
    ], { stdio: ['ignore', 'ignore', 'pipe'] })
    console.log(`✓ ${destino} — ${w * ESCALA}×${h * ESCALA}`)
  }
} finally {
  rmSync(tmp, { recursive: true, force: true })
}
