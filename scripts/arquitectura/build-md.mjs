#!/usr/bin/env node
// Genera la arquitectura A2 en markdown desde src/arquitectura/content/*.json.
// Es SALIDA: nunca se edita a mano (regla A2.8 de docs/REGLAS.md).
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '../..')
const leer = (f) => JSON.parse(readFileSync(join(RAIZ, 'src/arquitectura/content', f), 'utf8'))
const meta = leer('meta.json')
const intro = leer('intro.json')
const historias = leer('historias.json')
const ms = leer('microservicios.json')
const comp = leer('componentes.json')
const seq = leer('secuencias.json')
const dep = leer('despliegue.json')
const dec = leer('decisiones.json')
const imp = leer('implementacion.json')
const atributo = Object.fromEntries(
  JSON.parse(readFileSync(join(RAIZ, 'src/content/requerimientos-no-funcionales.json'), 'utf8')).requerimientos.map((r) => [r.id, r.atributo]),
)

const md = (s = '') =>
  s.replace(/<b[^>]*>(.*?)<\/b>/g, '**$1**').replace(/<i[^>]*>(.*?)<\/i>/g, '*$1*').replace(/<code[^>]*>(.*?)<\/code>/g, '`$1`').replace(/\|/g, '\\|')
const tabla = (cab, filas) =>
  [`| ${cab.join(' | ')} |`, `|${cab.map(() => '---').join('|')}|`, ...filas.map((f) => `| ${f.map(md).join(' | ')} |`)].join('\n')
const lista = (xs) => xs.map((x) => `- ${md(x)}`).join('\n')
const seccion = (id) => meta.secciones.find((s) => s.id === id)
const h1 = (id) => `# ${seccion(id).num} ${seccion(id).titulo}\n\n${md(seccion(id).intro)}`

function documento(img) {
  const figura = (d) =>
    [`### ${d.num} ${d.titulo}`, d.introduccion && md(d.introduccion), `![${d.titulo}](${img}/${d.id}.png)`,
      d.cierre && `> ${md(d.cierre)}`, lista(d.pasos), `Trazabilidad: ${d.realiza ?? d.hu}`].filter(Boolean).join('\n\n')

  const historia = (h) => [
    `### ${h.id} · ${h.titulo} (${h.estado})`,
    `**Como** ${h.rol}, **quiero** ${h.accion} **para** ${h.beneficio}.`,
    `**Criterios de aceptación**\n\n${lista(h.criterios)}`,
    `**Escenario principal**\n\n${h.principal.map((p, i) => `${i + 1}. **${p.quien}:** ${md(p.paso)}`).join('\n')}`,
    `**Escenarios alternos**\n\n${h.alternos.map((a) => `*${a.titulo}*\n\n${lista(a.pasos)}`).join('\n\n')}`,
    `Realiza: ${h.realiza}${h.prueba ? ` · Prueba: \`${h.prueba}\`` : ''}`,
  ].join('\n\n')

  const decision = (ad) => [
    `### ${ad.id} · ${ad.titulo}`,
    `**Decisión.** ${md(ad.decision)}`,
    `**Impactos e implicaciones**\n\n${lista(ad.impactos)}`,
    `**Problema.** ${md(ad.problema)}`, `**Contexto.** ${md(ad.contexto)}`, `**Alcance.** ${md(ad.alcance)}`,
    `**Restricciones**\n\n${lista(ad.restricciones)}`, `**Supuestos**\n\n${lista(ad.supuestos)}`,
    `**Arquitectura de la solución.** ${md(ad.solucion)}`,
    ad.matriz && tabla(['Clase de componente', 'Modelo', 'Motivo'], ad.matriz.map((m) => [m.clase, m.modelo, m.motivo])),
    `**Análisis comparativo**`,
    tabla(['Criterio', ...ad.alternativas.map((a) => (a.elegida ? `${a.nombre} (elegida)` : a.nombre))],
      ad.criterios.map((c, j) => [atributo[c] ? `${c} ${atributo[c]}` : c, ...ad.alternativas.map((a) => `**${a.eval[j][0]}.** ${a.eval[j][1]}`)])),
    `**Justificación.** ${md(ad.justificacion)}`,
    `**Consenso.** ${md(ad.consenso)}`, `**Disenso.** ${md(ad.disenso)}`,
    `**Decisiones relacionadas:** ${ad.relacionadas.join(', ')}`,
  ].filter(Boolean).join('\n\n')

  return [
    `# ${meta.titulo}`,
    `*${meta.sello}*`,
    md(meta.subtitulo),
    tabla(['Dato', 'Valor'], meta.datos.map((d) => [d.titulo, [d.valor].flat().join(', ')])),
    `> Documento generado desde \`src/arquitectura/content/*.json\` con \`npm run md\`. No se edita a mano.`,

    h1('intro'), md(intro.proposito), `## 1.1 Alcance`, lista(intro.alcance),
    `## 1.2 Glosario`, tabla(['Término', 'Definición'], intro.glosario.map((g) => [g.termino, g.definicion])),
    `## 1.3 Qué hereda del SRS y qué cambia`, tabla(['Supuesto', 'En el SRS', 'En la arquitectura'], intro.herencia.map((h) => [h.ref, h.a1, h.a2])),
    md(intro.congelado),

    h1('hu'), md(historias.intro), figura({ ...historias.mapa, num: '2.1', realiza: historias.historias.map((h) => h.id).join(', ') }),
    `## 2.2 Historias`, ...historias.historias.map(historia),

    h1('ms'), `## 3.1 Microservicios y responsabilidades`, md(ms.intro),
    tabla(['ID', 'Microservicio', 'Responsabilidad', 'Dominio · veredicto', 'API', 'Eventos', 'Datos', 'Estado'],
      ms.filas.map((m) => [m.id, m.nombre, m.responsabilidad, `${m.dominio} · ${m.veredicto}`, m.api, m.eventos, m.datos, m.nota ? `${m.estado}. ${m.nota}` : m.estado])),
    `## 3.2 Componentes lógicos y 3.3 técnicos`, md(comp.intro), ...comp.diagramas.map(figura),
    `### 3.3.3 Tecnología y versión por componente`,
    tabla(['Componente', 'Tecnología', 'Versión', 'Rol'], comp.tecnologias.map((t) => [t.componente, t.tecnologia, t.version, t.rol])),

    h1('seq'), md(seq.intro), ...seq.secuencias.map(figura),

    h1('dep'), md(dep.intro), ...dep.diagramas.map(figura),
    `## 5.3 Conectores: protocolo, formato y autenticación`,
    tabla(['Origen', 'Destino', 'Protocolo', 'Formato', 'Autenticación', 'Modo', 'Estado'],
      dep.conectores.map((c) => [c.origen, c.destino, c.protocolo, c.formato, c.autenticacion, c.modo, c.estado])),

    h1('ad'), md(dec.intro), ...dec.grupos.flatMap((g) => [`## ${g.num} ${g.titulo}`, ...g.decisiones.map(decision)]),

    h1('imp'), md(imp.intro), `## 7.1 Operaciones implementadas`,
    tabla(['Historia', 'Operación', 'Endpoints', 'Prueba'], imp.operaciones.map((o) => [o.hu, o.operacion, `\`${o.endpoints}\``, `\`${o.prueba}\``])),
    `## 7.2 Cómo se levanta`, imp.correr.map((p, i) => `${i + 1}. ${md(p)}`).join('\n'),
    `## 7.3 Estado y evidencia`, tabla(['Verificación', 'Resultado'], imp.estado.map((e) => [e.item, e.valor])),
    `## 7.4 Fuera del prototipo`, lista(imp.pendientes),
    `---\n\n${md(meta.pie)}`,
  ].join('\n\n') + '\n'
}

const destinos = [
  { ruta: join(RAIZ, 'docs/arquitectura-assignment2.md'), img: '../../assignment2/diagramas' },
  { ruta: join(RAIZ, '../assignment2/arquitectura-assignment2.md'), img: 'diagramas', local: true },
]
for (const d of destinos) {
  if (d.local) {
    if (!existsSync(join(RAIZ, '../assignment1'))) continue
    mkdirSync(dirname(d.ruta), { recursive: true })
  }
  writeFileSync(d.ruta, documento(d.img))
  console.log(`✓ ${d.ruta}`)
}
