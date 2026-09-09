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
const restr = leer('restricciones.json')

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

// --- 4b. Restricciones de diseño, requerimientos inversos y granularidad ---
// Los drivers de granularidad son los cinco desintegradores del material del curso.
const DRIVERS = new Set([
  'Alcance y función',
  'Volatilidad del código',
  'Escalabilidad y rendimiento',
  'Tolerancia a fallos',
  'Extensibilidad',
  'Escalabilidad y extensibilidad',
  'No aplica',
])
const VEREDICTOS = new Set(['Aislar', 'Partir en dos', 'Mantener unido', 'Fuera del alcance'])

const idsRestr = new Set()
for (const [bloque, patron] of [
  [restr.restricciones, /^RD-\d{2}$/],
  [restr.inversos, /^RI-\d{2}$/],
]) {
  if (!bloque.titulo || !bloque.intro) fallo('restricciones.json: un bloque no tiene título o intro.')
  for (const r of bloque.filas) {
    if (idsRestr.has(r.id)) fallo(`${r.id}: identificador duplicado.`)
    idsRestr.add(r.id)
    if (!patron.test(r.id)) fallo(`${r.id}: el id debe seguir ${patron}.`)
    if (!ORIGENES.has(r.origen)) fallo(`${r.id}: origen "${r.origen}" debe ser "asuncion" o "caso".`)
    if (!r.nombre || r.nombre.length > 60) fallo(`${r.id}: el nombre debe ser corto y estar presente.`)
    if (!r.descripcion?.endsWith('.')) fallo(`${r.id}: la descripción debe terminar en punto.`)
    if (!/^El (sistema|operador) (no )?debe/.test(r.descripcion))
      fallo(`${r.id}: la descripción debe empezar por «El sistema/operador (no) debe» (regla 2 de REGLAS.md).`)
  }
}
// Un requerimiento inverso es una prohibición: sin el "no", no es inverso.
for (const r of restr.inversos.filas) {
  if (!/^El (sistema|operador) no debe/.test(r.descripcion))
    fallo(`${r.id}: un requerimiento inverso tiene que decir qué NO se debe hacer.`)
}
// Una restricción de diseño sin origen citable no es defendible ante el profesor.
for (const r of restr.restricciones.filas) {
  if (!r.fuente) fallo(`${r.id}: falta la fuente (factor, pilar cloud native o caso de estudio).`)
}
const dominiosRF = new Set(rf.dominios.map((d) => d.id))
for (const g of restr.granularidad.filas) {
  const dom = g.dominio.split(' ')[0]
  if (!dominiosRF.has(dom)) fallo(`Granularidad "${g.dominio}": ${dom} no es un dominio funcional.`)
  if (!DRIVERS.has(g.driver)) fallo(`Granularidad ${dom}: driver "${g.driver}" no es uno del material del curso.`)
  if (!VEREDICTOS.has(g.veredicto)) fallo(`Granularidad ${dom}: veredicto "${g.veredicto}" desconocido.`)
  if (!g.razon) fallo(`Granularidad ${dom}: falta la justificación.`)
}
if (restr.granularidad.filas.length !== rf.dominios.length)
  fallo(`Granularidad: hay ${restr.granularidad.filas.length} filas para ${rf.dominios.length} dominios funcionales.`)

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
const MONTABLES = ['rf', 'rnf', 'qos', 'restr', 'ctx', 'cu', 'simple', 'api', 'bloqueos']
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
  restricciones: `${restr.restricciones.filas.length} RD · ${restr.inversos.filas.length} RI`,
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
console.log(
  `✓ Contenido válido — ${totalRF} RF · ${rnf.requerimientos.length} RNF · ` +
    `${restr.restricciones.filas.length} RD · ${restr.inversos.filas.length} RI · ` +
    `${qos.filas.length} filas QoS · ${bloqueos.bloqueos.length} bloqueos`,
)
