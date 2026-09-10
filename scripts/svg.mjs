// Extrae el SVG del mismo JSX que pinta el sitio. Lo usan build-diagrams.mjs (HTML)
// y build-png.mjs (PNG): una sola fuente, tres salidas.
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

export const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..')

export function extraerSvg(componente) {
  const jsx = readFileSync(join(RAIZ, `src/diagrams/${componente}.jsx`), 'utf8')
  return jsx
    .slice(jsx.indexOf('<svg'), jsx.lastIndexOf('</svg>') + 6)
    .replace(/className=/g, 'class=')
    .replace(/\{\/\*/g, '<!--')
    .replace(/\*\/\}/g, '-->')
    .replace(/style=\{\{\s*(\w+):\s*'?([^,}']+)'?\s*\}\}/g, (_, k, v) => `style="${k.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase())}:${v.trim()}"`)
    .replace('<svg class="dd"', '<svg class="dd" xmlns="http://www.w3.org/2000/svg"')
}

export function viewBox(svg) {
  const [, , w, h] = svg.match(/viewBox="([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+)"/).slice(1).map(Number)
  return { w, h }
}

// Solo el bloque claro de :root: las salidas estáticas no tienen conmutador de tema.
export function estilos() {
  const tokens = readFileSync(join(RAIZ, 'src/styles/tokens.css'), 'utf8')
  const raiz = tokens.slice(tokens.indexOf(':root {'), tokens.indexOf('}', tokens.indexOf(':root {')) + 1)
  return { raiz, diagramas: readFileSync(join(RAIZ, 'src/styles/diagrams.css'), 'utf8') }
}
