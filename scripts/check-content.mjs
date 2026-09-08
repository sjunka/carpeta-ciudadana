#!/usr/bin/env node
// Valida el contenido antes de construir. Falla ruidosamente para que
// un error de edición no llegue nunca al sitio publicado.
import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIR = join(RAIZ, 'src/content')
const leer = (f) => JSON.parse(readFileSync(join(DIR, f), 'utf8'))

const errores = []
const fallo = (msg) => errores.push(msg)

// --- 1. Todo JSON debe parsear ---
for (const f of readdirSync(DIR).filter((f) => f.endsWith('.json'))) {
  try {
    JSON.parse(readFileSync(join(DIR, f), 'utf8'))
  } catch (e) {
    fallo(`${f}: JSON inválido — ${e.message}`)
  }
}
if (errores.length) {
  console.error('✗ Contenido inválido:\n' + errores.map((e) => '  · ' + e).join('\n'))
  process.exit(1)
}

const meta = leer('meta.json')
const rf = leer('requerimientos-funcionales.json')
const rnf = leer('requerimientos-no-funcionales.json')
const qos = leer('mapeo-qos.json')
const bloqueos = leer('bloqueos.json')
const contexto = leer('contexto.json')

const PRIORIDADES = new Set(['Alta', 'Media', 'Baja'])
const ORIGENES = new Set(['asuncion', 'caso'])
const ESTADOS = new Set(['critico', 'abierto', 'resuelto'])

// --- 2. Requerimientos funcionales ---
const idsRF = new Set()
const idsBloqueo = new Set(bloqueos.bloqueos.map((b) => b.id))

for (const d of rf.dominios) {
  if (!/^RF-\d{2}$/.test(d.id)) fallo(`Dominio "${d.id}": el id debe ser RF-NN.`)
  if (!d.nombre || !d.intro) fallo(`Dominio ${d.id}: falta nombre o intro.`)
  for (const r of d.requerimientos) {
    if (idsRF.has(r.id)) fallo(`${r.id}: identificador duplicado.`)
    idsRF.add(r.id)
    if (!r.id.startsWith(d.id + '.')) fallo(`${r.id}: no pertenece al dominio ${d.id}.`)
    if (!PRIORIDADES.has(r.prioridad)) fallo(`${r.id}: prioridad "${r.prioridad}" no es Alta, Media ni Baja.`)
    if (!r.nombre || r.nombre.length > 60) fallo(`${r.id}: el nombre debe ser corto y estar presente.`)
    if (!r.descripcion?.endsWith('.')) fallo(`${r.id}: la descripción debe terminar en punto.`)
    if (!/^El (sistema|operador|ciudadano|centralizador)|^Una entidad|^Los documentos|^Todo documento|^Las |^Ningún |^Desde |^El paquete|^Toda /.test(r.descripcion))
      fallo(`${r.id}: la descripción debe empezar con un sujeto explícito (regla 2 de REGLAS.md).`)
    if (r.marca) {
      if (!['asuncion', 'bloqueo'].includes(r.marca.tipo)) fallo(`${r.id}: marca "${r.marca.tipo}" desconocida.`)
      if (r.marca.tipo === 'bloqueo' && !idsBloqueo.has(r.marca.ref))
        fallo(`${r.id}: referencia al bloqueo ${r.marca.ref}, que no existe en bloqueos.json.`)
      if (!r.marca.nota) fallo(`${r.id}: la marca necesita una nota que explique por qué.`)
    }
  }
}

// --- 3. Requerimientos no funcionales ---
const idsRNF = new Set()
for (const r of rnf.requerimientos) {
  if (idsRNF.has(r.id)) fallo(`${r.id}: identificador duplicado.`)
  idsRNF.add(r.id)
  if (!/^RNF-\d{2}$/.test(r.id)) fallo(`${r.id}: el id debe ser RNF-NN.`)
  if (!ORIGENES.has(r.origen)) fallo(`${r.id}: origen "${r.origen}" debe ser "asuncion" o "caso".`)
  if (!r.criterio) fallo(`${r.id}: falta el criterio de aceptación.`)
}

// --- 4. Mapeo QoS: cada RNF citado debe existir ---
for (const fila of qos.filas) {
  for (const parte of fila.rnf.split(',').map((s) => s.trim())) {
    const id = parte.startsWith('RNF-') ? parte : `RNF-${parte}`
    if (!idsRNF.has(id)) fallo(`Mapeo QoS "${fila.rnf}": ${id} no existe en requerimientos-no-funcionales.json.`)
  }
  if (!fila.friccion) fallo(`Mapeo QoS "${fila.rnf}": falta el punto de fricción.`)
}

// --- 5. Bloqueos ---
const vistos = new Set()
for (const b of bloqueos.bloqueos) {
  if (vistos.has(b.id)) fallo(`${b.id}: bloqueo duplicado.`)
  vistos.add(b.id)
  if (!ESTADOS.has(b.estado)) fallo(`${b.id}: estado "${b.estado}" desconocido.`)
  if (!b.pregunta?.length) fallo(`${b.id}: falta la pregunta.`)
  if (b.campos.length !== 3) fallo(`${b.id}: debe tener exactamente 3 campos, tiene ${b.campos.length}.`)
}

// --- 6. Secciones: meta debe cuadrar con lo que App.jsx sabe montar ---
const MONTABLES = ['rf', 'rnf', 'qos', 'ctx', 'cu', 'simple', 'api', 'bloqueos']
for (const s of meta.secciones) {
  if (!MONTABLES.includes(s.id)) fallo(`Sección "${s.id}" no tiene componente en App.jsx.`)
  if (!s.num || !s.nav || !s.titulo) fallo(`Sección "${s.id}": falta num, nav o titulo.`)
}
if (!contexto.actores.length) fallo('contexto.json: no hay actores.')

// --- 7. Contadores de la portada ---
const totalRF = rf.dominios.reduce((n, d) => n + d.requerimientos.length, 0)
const abiertos = bloqueos.bloqueos.filter((b) => b.estado !== 'resuelto').length
const esperado = {
  totalRF: `${totalRF} en ${rf.dominios.length} dominios`,
  totalRNF: String(rnf.requerimientos.length),
  bloqueos: `${abiertos} de ${bloqueos.bloqueos.length}`,
}
for (const d of meta.datos) {
  if (d.auto && d.valor !== esperado[d.auto])
    fallo(`meta.json → "${d.titulo}" dice "${d.valor}" pero los datos dan "${esperado[d.auto]}".`)
}

if (errores.length) {
  console.error(`\n✗ ${errores.length} problema(s) de contenido:\n` + errores.map((e) => '  · ' + e).join('\n') + '\n')
  process.exit(1)
}
console.log(`✓ Contenido válido — ${totalRF} RF · ${rnf.requerimientos.length} RNF · ${qos.filas.length} filas QoS · ${bloqueos.bloqueos.length} bloqueos`)
