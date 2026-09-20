#!/usr/bin/env node
// Valida el contenido de A2 (reglas A2.2 a A2.7 de docs/REGLAS.md) y renderiza la página una vez.
import { readFileSync, readdirSync, existsSync, statSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { caja, puntosDe, enBorde } from '../../src/arquitectura/diagramas/geometria.js'

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '../..')
const A1 = (f) => JSON.parse(readFileSync(join(RAIZ, 'src/content', f), 'utf8'))
const A2 = (f) => JSON.parse(readFileSync(join(RAIZ, 'src/arquitectura/content', f), 'utf8'))
const errores = []
const fallo = (m) => errores.push(m)

// --- Identificadores de A1 ---
const idsA1 = new Set()
const rf = A1('requerimientos-funcionales.json')
for (const d of rf.dominios) { idsA1.add(d.id); d.requerimientos.forEach((r) => idsA1.add(r.id)) }
A1('requerimientos-no-funcionales.json').requerimientos.forEach((r) => idsA1.add(r.id))
const restr = A1('restricciones.json')
;[...restr.restricciones.filas, ...restr.inversos.filas].forEach((r) => idsA1.add(r.id))
A1('bloqueos.json').bloqueos.forEach((b) => idsA1.add(b.id))
const atributos = new Set(A1('requerimientos-no-funcionales.json').requerimientos.map((r) => r.id))

const meta = A2('meta.json')
const historias = A2('historias.json')
const ms = A2('microservicios.json')
const comp = A2('componentes.json')
const seq = A2('secuencias.json')
const dep = A2('despliegue.json')
const dec = A2('decisiones.json')
const decisiones = dec.grupos.flatMap((g) => g.decisiones)

// --- A2.1 Esqueleto ---
const ESQUELETO = ['intro', 'hu', 'ms', 'seq', 'dep', 'ad', 'imp']
if (meta.secciones.map((s) => s.id).join() !== ESQUELETO.join())
  fallo(`meta.json: el esqueleto A2 debe ser ${ESQUELETO.join(' · ')} (regla A2.1).`)

// --- A2.2 Identificadores únicos y referencias ---
const idsA2 = new Set()
for (const [lista, patron] of [[historias.historias, /^HU-\d{2}$/], [ms.filas, /^MS-\d{2}$/], [decisiones, /^AD-\d{2}$/]]) {
  for (const x of lista) {
    if (!patron.test(x.id)) fallo(`${x.id}: no sigue ${patron}.`)
    if (idsA2.has(x.id)) fallo(`${x.id}: identificador duplicado.`)
    idsA2.add(x.id)
  }
}
const SIGNO = /\u00a7/
for (const f of readdirSync(join(RAIZ, 'src/arquitectura/content'))) {
  const texto = readFileSync(join(RAIZ, 'src/arquitectura/content', f), 'utf8')
  if (SIGNO.test(texto)) fallo(`${f}: contiene el signo de sección; usa asterisco (regla 7 bis).`)
  for (const [id] of texto.matchAll(/\b(?:RF|RNF|RD|RI|B)-\d{2}(?:\.\d{1,2})?\b/g))
    if (!idsA1.has(id)) fallo(`${f}: cita ${id}, que no existe en el SRS.`)
  for (const [id] of texto.matchAll(/\b(?:HU|MS|AD)-\d{2}\b/g))
    if (!idsA2.has(id)) fallo(`${f}: cita ${id}, que no existe en A2.`)
}

// --- A2.3 Historias ---
const cubiertos = new Set()
for (const h of historias.historias) {
  if (!h.rol || !h.accion || !h.beneficio) fallo(`${h.id}: falta rol, acción o beneficio.`)
  if (!['Implementada', 'Diseñada'].includes(h.estado)) fallo(`${h.id}: estado "${h.estado}" no es Implementada ni Diseñada.`)
  if (!h.criterios?.length) fallo(`${h.id}: sin criterios de aceptación.`)
  const quienes = new Set(h.principal.map((p) => (p.quien === 'Sistema' ? 'sistema' : 'actor')))
  if (quienes.size < 2) fallo(`${h.id}: el escenario principal debe alternar actor y sistema.`)
  if (!h.alternos?.length) fallo(`${h.id}: falta al menos un escenario alterno.`)
  if (!h.realiza) fallo(`${h.id}: falta el campo realiza.`)
  for (const [, dom] of (h.realiza ?? '').matchAll(/\b(RF-\d{2})/g)) cubiertos.add(dom)
  if (h.estado === 'Implementada' && !h.prueba) fallo(`${h.id}: una historia implementada necesita su prueba.`)
}
for (const d of rf.dominios)
  if (d.id !== 'RF-06' && !cubiertos.has(d.id)) fallo(`Dominio ${d.id}: ninguna historia lo realiza.`)
for (const a of historias.mapa.actividades)
  for (const id of a.historias) if (!idsA2.has(id)) fallo(`Mapa de historias: ${id} no existe.`)

// --- A2.4 Microservicios contra la granularidad del SRS ---
const POR_VEREDICTO = { 'Partir en dos': 2, Aislar: 1, 'Mantener unido': 1, 'Fuera del alcance': 1 }
for (const g of restr.granularidad.filas) {
  const dom = g.dominio.split(' ')[0]
  const suyos = ms.filas.filter((m) => m.dominio === dom)
  if (suyos.length !== POR_VEREDICTO[g.veredicto])
    fallo(`${dom} (${g.veredicto}): tiene ${suyos.length} microservicio(s), el veredicto pide ${POR_VEREDICTO[g.veredicto]}.`)
  for (const m of suyos) {
    if (m.veredicto !== g.veredicto) fallo(`${m.id}: dice "${m.veredicto}" pero el SRS dio "${g.veredicto}" a ${dom}.`)
    for (const k of ['responsabilidad', 'historias', 'api', 'depende', 'eventos', 'datos', 'estado']) if (!m[k]) fallo(`${m.id}: falta ${k}.`)
  }
}
const realizadas = new Set(ms.filas.flatMap((m) => [...(m.historias ?? '').matchAll(/HU-\d{2}/g)].map(([id]) => id)))
for (const h of historias.historias)
  if (!realizadas.has(h.id)) fallo(`${h.id}: ningún microservicio la realiza (regla A2.4).`)

// --- A2.5 Decisiones UAM ---
const VALORES = new Set(['Cumple', 'Parcial', 'No cumple'])
for (const ad of decisiones) {
  for (const k of ['decision', 'problema', 'contexto', 'alcance', 'solucion', 'justificacion', 'consenso', 'disenso'])
    if (!ad[k]) fallo(`${ad.id}: falta "${k}" de la plantilla UAM.`)
  for (const k of ['impactos', 'restricciones', 'supuestos', 'relacionadas'])
    if (!ad[k]?.length) fallo(`${ad.id}: "${k}" está vacío.`)
  for (const c of ad.criterios)
    if (!atributos.has(c) && !['Coste', 'Regulación'].includes(c)) fallo(`${ad.id}: criterio "${c}" fuera del conjunto cerrado.`)
  if (ad.alternativas.length < 2) fallo(`${ad.id}: necesita al menos 2 alternativas.`)
  if (ad.alternativas.filter((a) => a.elegida).length !== 1) fallo(`${ad.id}: debe haber exactamente una alternativa elegida.`)
  for (const a of ad.alternativas) {
    if (a.eval.length !== ad.criterios.length) fallo(`${ad.id} · ${a.nombre}: ${a.eval.length} evaluaciones para ${ad.criterios.length} criterios.`)
    for (const [v, motivo] of a.eval) {
      if (!VALORES.has(v)) fallo(`${ad.id} · ${a.nombre}: "${v}" no es Cumple, Parcial ni No cumple.`)
      if (!motivo) fallo(`${ad.id} · ${a.nombre}: una evaluación no tiene motivo.`)
    }
  }
}

// --- A2.6 Diagramas ---
const m4 = (v) => v % 4 === 0
function pasosCuadran(d, sts) {
  const max = Math.max(...sts)
  if (d.pasos.length !== max) fallo(`${d.id}: ${d.pasos.length} pasos para ${max} grupos st.`)
}
function geometria(d, nodos, flechas) {
  const porId = Object.fromEntries(nodos.map((n) => [n.id, n]))
  for (const n of nodos) {
    const c = caja(n)
    if (![c.x, c.y, c.w, c.h].every(m4)) fallo(`${d.id} · ${n.id}: coordenadas y tamaños deben ser múltiplos de 4.`)
    if (c.x + c.w > d.w || c.y + c.h > d.h) fallo(`${d.id} · ${n.id}: se sale del lienzo.`)
  }
  for (const f of flechas) {
    if (!porId[f.de] || !porId[f.a]) { fallo(`${d.id}: flecha ${f.de} → ${f.a} con extremo inexistente.`); continue }
    const p = puntosDe(f, porId)
    if (!p.flat().every(m4)) fallo(`${d.id} · ${f.de} → ${f.a}: puntos no múltiplos de 4.`)
    for (let i = 0; i < p.length - 1; i++)
      if (p[i][0] !== p[i + 1][0] && p[i][1] !== p[i + 1][1]) fallo(`${d.id} · ${f.de} → ${f.a}: segmento diagonal.`)
    if (!enBorde(p[0], porId[f.de])) fallo(`${d.id} · ${f.de} → ${f.a}: no sale del borde de ${f.de}.`)
    if (!enBorde(p.at(-1), porId[f.a])) fallo(`${d.id} · ${f.de} → ${f.a}: no llega al borde de ${f.a}.`)
  }
}
const acentos = (xs) => xs.filter((x) => x.acento).length

for (const d of [A2('intro.json').contexto, ...comp.diagramas]) {
  if (d.nodos.length > 9) fallo(`${d.id}: ${d.nodos.length} nodos; máximo 9.`)
  if (d.flechas.length > 12) fallo(`${d.id}: ${d.flechas.length} flechas; máximo 12.`)
  if (acentos(d.nodos) + acentos(d.flechas) > 2) fallo(`${d.id}: acento en más de 2 elementos.`)
  geometria(d, d.nodos, d.flechas)
  pasosCuadran(d, d.flechas.map((f) => f.st))
}
for (const d of dep.diagramas) {
  if (d.zonas.length > 3) fallo(`${d.id}: ${d.zonas.length} zonas; máximo 3.`)
  if (d.nodos.length > 6) fallo(`${d.id}: ${d.nodos.length} nodos; máximo 6.`)
  const art = d.nodos.reduce((n, x) => n + x.artefactos.length, 0)
  if (art > 9) fallo(`${d.id}: ${art} artefactos; máximo 9.`)
  if (d.rutas.length > 8) fallo(`${d.id}: ${d.rutas.length} rutas; máximo 8.`)
  if (acentos(d.rutas) > 2) fallo(`${d.id}: acento en más de 2 rutas.`)
  for (const z of d.zonas) if (![z.x, z.y, z.w, z.h].every(m4)) fallo(`${d.id} · zona ${z.id}: no múltiplo de 4.`)
  geometria(d, d.nodos, d.rutas)
  pasosCuadran(d, d.rutas.map((r) => r.st))
  for (const c of dep.conectores) for (const [k, v] of Object.entries(c)) if (!v) fallo(`Conector ${c.origen} → ${c.destino}: celda "${k}" vacía.`)
}

// Contratos: cada operación dirigida a un servicio propio debe existir en su OpenAPI.
const contratos = {}
for (const f of readdirSync(join(RAIZ, 'operador/contratos'))) {
  const nombre = f.replace('.openapi.yaml', '')
  const ops = new Set()
  let ruta = null
  for (const linea of readFileSync(join(RAIZ, 'operador/contratos', f), 'utf8').split('\n')) {
    const p = linea.match(/^ {2}(\/\S*):\s*$/)
    if (p) ruta = p[1]
    const m = linea.match(/^ {4}(get|post|put|delete|patch):/)
    if (m && ruta) ops.add(`${m[1].toUpperCase()} ${ruta}`)
  }
  contratos[nombre] = ops
}
for (const s of seq.secuencias) {
  if (s.lineas.length > 5) fallo(`${s.id}: ${s.lineas.length} líneas de vida; máximo 5.`)
  if (s.mensajes.length > 12) fallo(`${s.id}: ${s.mensajes.length} mensajes; máximo 12.`)
  if (acentos(s.mensajes) > 2) fallo(`${s.id}: acento en más de 2 mensajes.`)
  if (!idsA2.has(s.hu)) fallo(`${s.id}: la historia ${s.hu} no existe.`)
  const lineas = Object.fromEntries(s.lineas.map((l) => [l.id, l]))
  for (const m of s.mensajes) {
    if (!lineas[m.de] || !lineas[m.a]) { fallo(`${s.id}: mensaje con línea de vida inexistente (${m.de} → ${m.a}).`); continue }
    if (!m.datos || !m.op) fallo(`${s.id}: cada mensaje lleva datos y operación (regla A2.6).`)
    const destino = lineas[m.a].contrato
    const op = m.op.match(/^(GET|POST|PUT|DELETE|PATCH) (\/\S*)/)
    if (destino && op && m.de !== m.a && !contratos[destino]?.has(`${op[1]} ${op[2]}`))
      fallo(`${s.id}: "${op[1]} ${op[2]}" no existe en operador/contratos/${destino}.openapi.yaml.`)
  }
  pasosCuadran(s, s.mensajes.map((m) => m.paso))
}

// Videos: si una secuencia declara video, el MP4 y el póster deben existir y el MP4 pesar 4 MB o menos.
for (const s of seq.secuencias) {
  if (!s.video) continue
  for (const f of [s.video.mp4, s.video.poster])
    if (!existsSync(join(RAIZ, 'public', f))) fallo(`${s.id}: falta public/${f}.`)
  const mp4 = join(RAIZ, 'public', s.video.mp4)
  if (existsSync(mp4) && statSync(mp4).size > 4 * 1024 * 1024) fallo(`${s.id}: el video pesa más de 4 MB.`)
}

// --- Contadores de la portada ---
const impl = historias.historias.filter((h) => h.estado === 'Implementada').length
const msImpl = ms.filas.filter((m) => m.estado === 'Implementado').length
const esperado = {
  hu: `${historias.historias.length} · ${impl} implementadas`,
  ms: `${ms.filas.length} · ${msImpl} implementados`,
  ad: `${decisiones.length} en plantilla UAM`,
}
for (const d of meta.datos)
  if (d.auto && d.valor !== esperado[d.auto]) fallo(`meta.json → "${d.titulo}" dice "${d.valor}" pero los datos dan "${esperado[d.auto]}".`)

if (errores.length) {
  console.error(`\n✗ A2 · ${errores.length} problema(s):\n` + errores.map((e) => '  · ' + e).join('\n') + '\n')
  process.exit(1)
}

// --- Render de la página A2 una vez, como check-render.mjs para A1 ---
const { build } = await import('esbuild')
const { renderToString } = await import('react-dom/server')
const { createElement } = await import('react')
globalThis.window = { matchMedia: () => ({ matches: false }), addEventListener() {}, removeEventListener() {} }
globalThis.matchMedia = window.matchMedia
globalThis.document = { documentElement: { dataset: {} }, getElementById: () => null }
const salida = join(RAIZ, `.smoke-a2-${process.pid}.mjs`)
await build({
  entryPoints: [join(RAIZ, 'src/arquitectura/App.jsx')],
  bundle: true, format: 'esm', platform: 'node', jsx: 'automatic', outfile: salida,
  external: ['react', 'react-dom', 'react/jsx-runtime', 'lucide-react'], logLevel: 'error',
})
try {
  const { default: App } = await import(pathToFileURL(salida))
  const html = renderToString(createElement(App))
  const faltan = [...ESQUELETO.map((id) => `id="${id}"`), 'class="dd"', 'class="ref"'].filter((m) => !html.includes(m))
  if (faltan.length) throw new Error(`le falta: ${faltan.join(', ')}`)
  console.log(`✓ A2 válida — ${historias.historias.length} HU · ${ms.filas.length} MS · ${decisiones.length} AD · ` +
    `${comp.diagramas.length + seq.secuencias.length + dep.diagramas.length + 2} diagramas · página de ${(html.length / 1024).toFixed(0)} KB`)
} catch (e) {
  console.error(`\n✗ La página A2 no renderiza: ${e.message}\n`)
  process.exitCode = 1
} finally {
  rmSync(salida, { force: true })
}
