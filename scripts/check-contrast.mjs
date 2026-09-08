#!/usr/bin/env node
// Comprueba WCAG 2.1 AA sobre los tokens reales de src/styles/tokens.css, en los
// dos temas. Un par que solo cumple en claro es un fallo: el conmutador de tema
// no puede dejar un texto o una etiqueta de diagrama por debajo del umbral.
//
// Umbrales: 4.5 para texto normal, 3.0 para texto grande y para elementos
// gráficos (trazos, rellenos, texto de 18.66px en negrita o mayor).

import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..')
const css = readFileSync(join(RAIZ, 'src/styles/tokens.css'), 'utf8')

// --- tokens ---
const bloque = (inicio) => {
  const i = css.indexOf(inicio)
  if (i < 0) fatal(`No encuentro el bloque "${inicio}" en tokens.css.`)
  const cuerpo = css.slice(i + inicio.length, css.indexOf('}', i))
  const vars = {}
  for (const [, k, v] of cuerpo.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) vars[k] = v.trim().replace(/\s+/g, ' ')
  return vars
}

const resolver = (vars, nombre, visto = new Set()) => {
  const v = vars[nombre]
  if (!v) fatal(`El token --${nombre} no existe.`)
  const ref = v.match(/^var\(--([\w-]+)\)$/)
  if (!ref) return v
  if (visto.has(nombre)) fatal(`Ciclo de var() en --${nombre}.`)
  return resolver(vars, ref[1], visto.add(nombre))
}

// --- contraste ---
const canal = (h) => {
  const n = h.replace('#', '')
  const c = n.length === 3 ? n.split('').map((x) => x + x).join('') : n
  return [0, 2, 4].map((i) => parseInt(c.slice(i, i + 2), 16))
}
const lineal = (c) => (c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
const luz = (hex) => {
  const [r, g, b] = canal(hex)
  return 0.2126 * lineal(r) + 0.7152 * lineal(g) + 0.0722 * lineal(b)
}
const razon = (a, b) => {
  const [x, y] = [luz(a), luz(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}

// [qué es, token de tinta, token de fondo, umbral]
const PARES = [
  ['texto base', 'ink', 'canvas-soft', 4.5],
  ['texto secundario', 'ink-secondary', 'surface', 4.5],
  ['texto apagado', 'ink-muted', 'canvas-soft', 4.5],
  ['texto tenue (.note, prioridad baja)', 'ink-faint-text', 'canvas-soft', 4.5],
  ['texto tenue sobre tarjeta', 'ink-faint-text', 'surface', 4.5],
  ['enlace y número de sección', 'primary-text', 'canvas-soft', 4.5],
  ['enlace sobre tarjeta', 'primary-text', 'surface', 4.5],
  ['texto sobre relleno de acento', 'on-accent', 'primary', 4.5],
  ['portada', 'on-primary', 'secondary', 3],
  ['píldora del caso', 'st-caso', 'st-caso-bg', 4.5],
  ['píldora de asunción', 'st-asuncion', 'st-asuncion-bg', 4.5],
  ['píldora de bloqueo', 'st-bloqueo', 'st-bloqueo-bg', 4.5],
  ['prioridad alta', 'canvas', 'ink', 4.5],
  ['diagrama · nombre de nodo', 'ink', 'surface', 4.5],
  ['diagrama · subtítulo de nodo', 'ink-muted', 'canvas-soft', 4.5],
  ['diagrama · etiqueta de flecha', 'ink-muted', 'surface', 4.5],
  ['diagrama · flecha del flujo activo', 'primary-text', 'surface', 4.5],
  ['diagrama · frontera de automatización', 'st-asuncion', 'surface', 4.5],
  ['diagrama · tags y leyenda', 'ink-faint-text', 'surface', 4.5],
  ['diagrama · nodo del sistema', 'on-primary', 'sut-fill', 4.5],
  ['diagrama · trazo del conector', 'ink-faint', 'surface', 3],
  ['diagrama · trazo del flujo activo', 'primary', 'surface', 3],
]

const TEMAS = [
  ['claro', bloque(':root {')],
  ['oscuro', bloque(':root[data-theme="dark"] {')],
]

const fallos = []
function fatal(msg) {
  console.error(`✗ ${msg}`)
  process.exit(1)
}

for (const [nombre, vars] of TEMAS) {
  for (const [qué, tinta, fondo, min] of PARES) {
    const r = razon(resolver(vars, tinta), resolver(vars, fondo))
    if (r < min) {
      fallos.push(`tema ${nombre}: ${qué} — ${r.toFixed(2)}:1, hace falta ${min}:1 ` +
        `(--${tinta} sobre --${fondo}).`)
    }
  }
}

// El tema oscuro está escrito dos veces: por preferencia del sistema y por
// atributo. Si se desincronizan, el conmutador y el sistema pintan distinto.
const porSistema = bloque(':root:not([data-theme="light"]) {')
const porAtributo = TEMAS[1][1]
for (const k of new Set([...Object.keys(porSistema), ...Object.keys(porAtributo)])) {
  if (porSistema[k] !== porAtributo[k]) {
    fallos.push(`--${k} difiere entre el tema oscuro por sistema (${porSistema[k] ?? 'ausente'}) ` +
      `y por atributo (${porAtributo[k] ?? 'ausente'}).`)
  }
}

if (fallos.length) {
  console.error('✗ Contraste insuficiente:\n')
  for (const f of fallos) console.error(`  · ${f}`)
  console.error(`\n  ${fallos.length} fallo(s). Corrige el token en src/styles/tokens.css.`)
  process.exit(1)
}

console.log(`✓ Contraste AA: ${PARES.length} pares × ${TEMAS.length} temas, y los dos bloques del tema oscuro coinciden.`)
