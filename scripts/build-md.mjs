#!/usr/bin/env node
// Genera docs/entrega-1.md desde src/content/*.json.
// El markdown es SALIDA: nunca se edita a mano. Así el sitio y el documento
// no pueden desincronizarse (regla 8 de docs/REGLAS.md).
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..')
const leer = (f) => JSON.parse(readFileSync(join(RAIZ, 'src/content', f), 'utf8'))

const meta = leer('meta.json')
const rf = leer('requerimientos-funcionales.json')
const rnf = leer('requerimientos-no-funcionales.json')
const qos = leer('mapeo-qos.json')
const restr = leer('restricciones.json')
const contexto = leer('contexto.json')
const cu = leer('casos-de-uso.json')
const simple = leer('simple.json')
const api = leer('api.json')
const bloqueos = leer('bloqueos.json')

// El marcado ligero de los JSON (<b>, <i>, <code>) pasa a markdown.
const md = (s = '') =>
  s
    .replace(/<b>(.*?)<\/b>/g, '**$1**')
    .replace(/<i>(.*?)<\/i>/g, '*$1*')
    .replace(/<code>(.*?)<\/code>/g, '`$1`')
    .replace(/\|/g, '\\|')

const MARCA = { asuncion: '**[ASUNCIÓN]**', caso: '**[Del caso]**', bloqueo: '**[BLOQUEO]**' }

const tabla = (cabeceras, filas) =>
  [
    `| ${cabeceras.join(' | ')} |`,
    `|${cabeceras.map(() => '---').join('|')}|`,
    ...filas.map((f) => `| ${f.join(' | ')} |`),
  ].join('\n')

const titulo = (id) => {
  const s = meta.secciones.find((x) => x.id === id)
  return `## ${Number(s.num)}. ${s.titulo}`
}

const out = []
const p = (...l) => out.push(...l, '')

p(`# ${meta.titulo} — Entrega 1`)
p(`> Generado por \`npm run md\` desde \`src/content/*.json\`. **No editar a mano.**`)
p(`> Sitio: https://sjunka.github.io/carpeta-ciudadana/`)
p(`> ${md(meta.pie)}`)
p('---')

// 1 · Funcionales
p(titulo('rf'))
for (const d of rf.dominios) {
  p(`### ${d.id} · ${d.nombre}`, '', md(d.intro))
  p(
    tabla(
      ['ID', 'Requerimiento', 'Descripción', 'Prioridad'],
      d.requerimientos.map((r) => [
        r.id,
        md(r.nombre),
        md(r.descripcion) +
          (r.marca ? ` ${MARCA[r.marca.tipo]} *${[r.marca.ref, r.marca.nota].filter(Boolean).join(' · ')}*` : ''),
        r.prioridad,
      ]),
    ),
  )
}

// 2 · No funcionales
p(titulo('rnf'))
p(
  tabla(
    ['ID', 'Atributo de calidad', 'Requerimiento', 'Criterio de aceptación'],
    rnf.requerimientos.map((r) => [r.id, md(r.atributo), `${md(r.requerimiento)} ${MARCA[r.origen]}`, md(r.criterio)]),
  ),
)

// 3 · Mapeo QoS
p(titulo('qos'))
p(
  tabla(
    ['RNF', 'Atributo de QoS', 'Métrica o indicador', 'Objetivo / umbral', 'Táctica arquitectónica', 'Punto de fricción'],
    qos.filas.map((f) => [f.rnf, md(f.atributo), md(f.metrica), md(f.objetivo), md(f.tactica), md(f.friccion)]),
  ),
)

// 4 · Restricciones
p(titulo('restr'))
p(md(meta.secciones.find((s) => s.id === 'restr').intro))
p(`### ${restr.restricciones.titulo}`, '', md(restr.restricciones.intro))
p(
  tabla(
    ['ID', 'Restricción', 'Descripción', 'Origen'],
    restr.restricciones.filas.map((r) => [r.id, md(r.nombre), `${md(r.descripcion)} ${MARCA[r.origen]}`, md(r.fuente)]),
  ),
)
p(`### ${restr.inversos.titulo}`, '', md(restr.inversos.intro))
p(
  tabla(
    ['ID', 'Límite', 'El sistema no debe…'],
    restr.inversos.filas.map((r) => [r.id, md(r.nombre), `${md(r.descripcion)} ${MARCA[r.origen]}`]),
  ),
)
p(`### ${restr.granularidad.titulo}`, '', md(restr.granularidad.intro))
p(
  tabla(
    ['Dominio', 'Driver dominante', 'Veredicto', 'Por qué'],
    restr.granularidad.filas.map((g) => [md(g.dominio), md(g.driver), md(g.veredicto), md(g.razon)]),
  ),
)

// 5 · Contexto
const nCtx = Number(meta.secciones.find((s) => s.id === 'ctx').num)
p(titulo('ctx'))
p(md(meta.secciones.find((s) => s.id === 'ctx').intro))
p(`Archivo: \`diagramas/contexto-sistema.html\``)
p(`### ${nCtx}.1 Actores`)
p(
  tabla(
    ['Actor', 'Descripción', 'Tipo de interacción'],
    contexto.actores.map((a) => [md(a.actor), md(a.descripcion), md(a.interaccion)]),
  ),
)
p(`### ${nCtx}.2 Flujo de información`)
p(contexto.flujo.map((f, i) => `${i + 1}. ${md(f)}`).join('\n'))
p(`### ${nCtx}.3 Lógica del diagrama`)
p(contexto.logica.map((l) => `- ${md(l)}`).join('\n'))
p(`**Idea central:** ${md(contexto.idea)}`)
p(md(contexto.cierre))

// 6 · Casos de uso
p(`${titulo('cu')} *(referencia interna, no se entrega)*`)
p(`Archivo: \`diagramas/casos-de-uso.html\``)
p(
  tabla(
    ['Bloque', 'Caso de uso', 'Requerimientos que realiza'],
    cu.bloques.flatMap((b) => b.casos.map((c, i) => [i === 0 ? md(b.titulo) : '', md(c.nombre), md(c.req)])),
  ),
)
p(md(cu.cierre))

// 7 · En palabras simples
p(titulo('simple'))
for (const t of simple.tarjetas) p(`**${md(t.pregunta)}**`, '', t.parrafos.map(md).join('\n\n'))

// 8 · Evidencia API
p(titulo('api'))
p(md(meta.secciones.find((s) => s.id === 'api').intro))
p(
  tabla(
    ['Método', 'Path', 'Comportamiento verificado'],
    api.endpoints.map((e) => [`\`${e.metodo}\``, `\`${e.path}\``, md(e.comportamiento)]),
  ),
)
p('**Hallazgos verificados contra el servicio real**')
p(api.hallazgos.map((h) => `${h.n}. ${md(h.texto)}`).join('\n'))

// 9 · Bloqueos
p(titulo('bloqueos'))
for (const b of bloqueos.bloqueos) {
  p(`**${b.id}${b.etiqueta ? ` · ${md(b.etiqueta)}` : ''} — ${md(b.pregunta)}**`)
  p(b.campos.map((c) => `- *${md(c.titulo)}:* ${md(c.texto)}`).join('\n'))
}

const texto = out.join('\n').replace(/\n{3,}/g, '\n\n') + '\n'
const destinos = [join(RAIZ, 'docs/entrega-1.md'), join(RAIZ, '../assignment1/simulacion-borrador.md')]
for (const d of destinos) {
  // El segundo destino solo existe en el equipo local, no en CI.
  if (d.includes('assignment1') && !existsSync(dirname(d))) continue
  writeFileSync(d, texto)
  console.log(`✓ ${d}`)
}
