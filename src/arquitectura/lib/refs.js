import { buscarRef as buscarA1 } from '../../lib/refs.js'
import historias from '../content/historias.json'
import microservicios from '../content/microservicios.json'
import decisiones from '../content/decisiones.json'

// Índice A2 encima del de A1: HU, MS y AD con su nombre; el resto lo resuelve A1.
const indice = new Map()
for (const h of historias.historias) indice.set(h.id, `Historia · ${h.titulo} — ${h.estado}`)
for (const m of microservicios.filas) indice.set(m.id, `Microservicio · ${m.nombre} — ${m.estado}`)
for (const g of decisiones.grupos) for (const d of g.decisiones) indice.set(d.id, `Decisión · ${d.titulo}`)

export const buscarRef = (id) => indice.get(id) ?? buscarA1(id)

export const PATRON = /\b(?:RF|RNF|RD|RI|HU|MS|AD)-\d{2}(?:\.\d{1,2})?\b/g
