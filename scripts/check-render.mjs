#!/usr/bin/env node
// Renderiza App una vez en Node. Atrapa el fallo que `vite build` no ve:
// una referencia rota deja la página en blanco y el build sigue diciendo que todo va bien.
import { build } from 'esbuild'
import { renderToString } from 'react-dom/server'
import { createElement } from 'react'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { rmSync } from 'node:fs'

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..')

// Mínimo de navegador para que el primer render funcione fuera del navegador.
globalThis.window = { matchMedia: () => ({ matches: false }), addEventListener() {}, removeEventListener() {} }
globalThis.matchMedia = window.matchMedia
globalThis.document = { documentElement: { dataset: {} }, getElementById: () => null }
// El bundle se escribe dentro del paquete para que resuelva react desde node_modules.
const salida = join(RAIZ, `.smoke-${process.pid}.mjs`)

await build({
  entryPoints: [join(RAIZ, 'src/App.jsx')],
  bundle: true,
  format: 'esm',
  platform: 'node',
  jsx: 'automatic',
  outfile: salida,
  external: ['react', 'react-dom', 'react/jsx-runtime', 'lucide-react'],
  logLevel: 'error',
})

try {
  const { default: App } = await import(pathToFileURL(salida))
  const html = renderToString(createElement(App))
  if (html.length < 5000) throw new Error(`La página renderiza ${html.length} caracteres: está prácticamente vacía.`)
  // Comprobaciones de lo que no puede faltar en la página.
  const exigido = [
    ['ancla de funcionales', 'id="rf"'],
    ['ancla de no funcionales', 'id="rnf"'],
    ['ancla de QoS', 'id="qos"'],
    ['referencias con descripción', 'class="ref"'],
    ['secciones', 'id="req"'],
  ]
  const faltan = exigido.filter(([, marca]) => !html.includes(marca)).map(([que]) => que)
  if (faltan.length) throw new Error(`La página renderiza pero le falta: ${faltan.join(', ')}.`)
  console.log(`✓ La página renderiza — ${(html.length / 1024).toFixed(0)} KB de HTML`)
} catch (e) {
  console.error(`\n✗ La página no renderiza:\n  ${e.message}\n`)
  process.exitCode = 1
} finally {
  rmSync(salida, { force: true })
}
