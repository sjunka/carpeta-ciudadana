#!/usr/bin/env node
// Genera el SRS en markdown desde src/content/*.json.
// El markdown es SALIDA: nunca se edita a mano. Así el sitio y el documento
// no pueden desincronizarse (regla 8 de docs/REGLAS.md).
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..')
const leer = (f) => JSON.parse(readFileSync(join(RAIZ, 'src/content', f), 'utf8'))

const meta = leer('meta.json')
const srs = leer('srs.json')
const rf = leer('requerimientos-funcionales.json')
const rnf = leer('requerimientos-no-funcionales.json')
const qos = leer('mapeo-qos.json')
const restr = leer('restricciones.json')
const contexto = leer('contexto.json')
const api = leer('api.json')
const clases = leer('clases.json')
const datosLogicos = leer('datos-logicos.json')
const modelos = leer('modelos.json')
const bloqueos = leer('bloqueos.json')

// El marcado ligero de los JSON (<b>, <i>, <code>) pasa a markdown.
const md = (s = '') =>
  s
    .replace(/<b[^>]*>(.*?)<\/b>/g, '**$1**')
    .replace(/<i[^>]*>(.*?)<\/i>/g, '*$1*')
    .replace(/<code[^>]*>(.*?)<\/code>/g, '`$1`')
    .replace(/\|/g, '\\|')

const MARCA = { asuncion: '**[ASUNCIÓN]**', caso: '**[Del caso]**', bloqueo: '**[SUPUESTO]**' }

const tabla = (cabeceras, filas) =>
  [
    `| ${cabeceras.join(' | ')} |`,
    `|${cabeceras.map(() => '---').join('|')}|`,
    ...filas.map((f) => `| ${f.join(' | ')} |`),
  ].join('\n')

const dominios = [...rf.dominios].sort((a, b) => a.id.localeCompare(b.id))

// Figura: el PNG embebido —para el PDF— más el enlace al HTML, que sí es navegable.
const figura = (variante, archivo, alt) => {
  const nombre = archivo.replace('diagramas/', '')
  const png = `${variante.img}/${nombre.replace('.html', '.png')}`
  return `![${alt}](${png})\n\nVersión interactiva: \`diagramas/${nombre}\``
}

// Una sola salida: el documento completo, en el orden del template.
// Todo lo demás es idéntico, y sale del mismo JSON.
// El markdown es el documento completo: en papel no hay acordeón que abrir.
const VARIANTE = {
  // Cada destino ve assignment1/diagramas/ desde un sitio distinto.
  destinos: [
    { ruta: 'docs/srs-assignment1.md', img: '../../assignment1/diagramas' },
    { ruta: '../assignment1/srs-assignment1.md', img: 'diagramas' },
  ],
  nota:
    'Los cinco sub-bloques que pide el template —introducción, entradas, procesamiento, salidas y ' +
    'manejo de errores— se escriben una vez por dominio, y la tabla lista los requerimientos de ese ' +
    'dominio con su prioridad.',
}

function construir(variante) {
const out = []
const p = (...l) => out.push(...l, '')
const lista = (items) => p(items.map((x) => `- ${md(x)}`).join('\n'))

// ---------- Portada ----------
const po = srs.portada
p(`# ${meta.titulo}`)
p(`## ${po.documento}`)
p(
  tabla(
    ['', ''],
    [
      ['**Versión**', po.version],
      ['**Fecha**', po.fecha],
      [`**${po.autores.length > 1 ? 'Autores' : 'Autor'}**`, `${po.autores.join(' · ')} — ${po.cargo}`],
      ['**Preparado para**', po.preparadoPara],
      ['**Docente**', po.docente],
      ['**Periodo**', po.periodo],
    ],
  ),
)
p(md(po.estandar))
p(`> Generado por \`npm run md\` desde \`src/content/*.json\`. **No editar a mano.**`)
p('---')

p('## Historial de revisiones')
p(
  tabla(
    ['Fecha', 'Versión', 'Descripción', 'Autor', 'Comentarios'],
    srs.historial.map((h) => [h.fecha, h.version, md(h.descripcion), h.autor, md(h.comentarios)]),
  ),
)

p('## Aprobación del documento')
p('La siguiente Especificación de Requerimientos de Software ha sido aceptada y aprobada por:')
p(
  tabla(
    ['Firma', 'Nombre impreso', 'Cargo', 'Fecha'],
    srs.aprobacion.map((a) => ['', a.nombre, a.cargo, '']),
  ),
)
p('---')

// ---------- 1. Introducción ----------
p('# 1. Introducción')
p('## 1.1 Propósito')
for (const t of srs.proposito) p(md(t))

p('## 1.2 Alcance')
p(`El producto que este documento especifica se llama **${srs.alcance.producto}**.`)
p('**Qué hace**')
lista(srs.alcance.hace)
p('**Qué no hace**')
lista(srs.alcance.noHace)
p('**Beneficios**')
lista(srs.alcance.beneficios)
p('**Objetivos**')
lista(srs.alcance.objetivos)

p('## 1.3 Definiciones, acrónimos y abreviaturas')
p(tabla(['Término', 'Definición'], srs.glosario.map((g) => [md(g.termino), md(g.definicion)])))

p('## 1.4 Referencias')
p(srs.referencias.map((r) => `${r.n} ${md(r.texto)}`).join('\n\n'))

p('## 1.5 Visión general del documento')
lista(srs.vision)

// ---------- 2. Descripción general ----------
p('# 2. Descripción general')
p(md(meta.secciones.find((s) => s.id === 'gen').intro))

p('## 2.1 Perspectiva del producto')
for (const t of srs.perspectiva) p(md(t))
p(figura(variante, 'diagramas/contexto-sistema.html', 'Diagrama de contexto del Operador de Carpeta Ciudadana'))
p('**Actores**')
p(
  tabla(
    ['Actor', 'Descripción', 'Tipo de interacción'],
    contexto.actores.map((a) => [md(a.actor), md(a.descripcion), md(a.interaccion)]),
  ),
)
p('**Flujo de información**')
p(contexto.flujo.map((f, i) => `${i + 1}. ${md(f)}`).join('\n'))
p('**Lógica del diagrama**')
lista(contexto.logica)
p(`**Idea central:** ${md(contexto.idea)}`)
p(md(contexto.cierre))

p('## 2.2 Funciones del producto')
p(md(srs.funcionesIntro))
p(
  tabla(
    ['Dominio', 'Nombre', 'Qué resuelve', 'RF'],
    dominios.map((d) => [d.id, md(d.nombre), md(d.intro), String(d.requerimientos.length)]),
  ),
)

p('## 2.3 Características de los usuarios')
p(
  tabla(
    ['Perfil', 'Descripción', 'Nivel técnico', 'Frecuencia de uso'],
    srs.usuarios.map((u) => [md(u.perfil), md(u.descripcion), md(u.nivel), md(u.frecuencia)]),
  ),
)

p('## 2.4 Restricciones generales')
p(md(srs.restriccionesGenerales.intro))
p(
  tabla(
    ['Familia', 'Qué acota', 'Detalle en'],
    srs.restriccionesGenerales.familias.map((f) => [md(f.familia), md(f.texto), md(f.refs)]),
  ),
)
p(md(srs.restriccionesGenerales.normativas))

p('## 2.5 Suposiciones y dependencias')
p(md(srs.supuestos.intro))
lista(srs.supuestos.generales)
p(
  tabla(
    srs.supuestos.columnas,
    bloqueos.bloqueos
      .filter((b) => b.estado !== 'resuelto')
      .map((b) => [b.id, md(b.campos[1]?.texto ?? ''), md(b.campos[2]?.texto ?? '')]),
  ),
)
p('**Dependencias externas**')
lista(srs.dependencias)

// ---------- 3. Requerimientos específicos ----------
p('# 3. Requerimientos específicos')
p(md(meta.secciones.find((s) => s.id === 'req').intro))

p('## 3.1 Requerimientos de interfaces externas')
const iface = srs.interfaces
p('### 3.1.1 Interfaces de usuario')
p(md(iface.usuario.intro))
p(
  tabla(
    ['Interfaz', 'Descripción', 'Requerimientos'],
    iface.usuario.filas.map((f) => [md(f.interfaz), md(f.descripcion), f.requerimientos]),
  ),
)
p('**Reglas que toda interfaz cumple**')
lista(iface.usuario.reglas)

p('### 3.1.2 Interfaces de hardware')
p(md(iface.hardware))

p('### 3.1.3 Interfaces de software')
p(md(iface.software.intro))
p(
  tabla(
    ['Sistema externo', 'Para qué se usa', 'Contrato'],
    iface.software.sistemas.map((s) => [md(s.sistema), md(s.proposito), md(s.contrato)]),
  ),
)
p('**Operaciones del centralizador, verificadas en vivo**')
p(
  tabla(
    ['Método', 'Path', 'Comportamiento verificado'],
    api.endpoints.map((e) => [`\`${e.metodo}\``, `\`${e.path}\``, md(e.comportamiento)]),
  ),
)

p('### 3.1.4 Interfaces de comunicaciones')
p(md(iface.comunicaciones.intro))
lista(iface.comunicaciones.condiciones)

p('## 3.2 Requerimientos funcionales')
p(
  'Los 65 requerimientos se agrupan en nueve dominios. Cada dominio lleva el desglose que pide el ' +
    'template: introducción, entradas, procesamiento, salidas y manejo de errores. ' +
    md(variante.nota),
)
dominios.forEach((d, i) => {
  const n = `3.2.${i + 1}`
  p(`### ${n} ${d.id} · ${d.nombre}`)
  p(`#### ${n}.1 Introducción`, '', md(d.desglose.introduccion))
  p(`#### ${n}.2 Entradas`)
  lista(d.desglose.entradas)
  p(`#### ${n}.3 Procesamiento`)
  lista(d.desglose.procesamiento)
  p(`#### ${n}.4 Salidas`)
  lista(d.desglose.salidas)
  p(`#### ${n}.5 Manejo de errores`)
  lista(d.desglose.errores)
  p(`#### ${n}.6 Requerimientos del dominio`)
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
})

p('## 3.3 Clases y objetos')
p(md(clases.intro))
clases.clases.forEach((c, i) => {
  p(`### 3.3.${i + 1} ${c.nombre}`, '', md(c.proposito))
  p('**Atributos**')
  lista(c.atributos)
  p('**Funciones**')
  lista(c.funciones)
  if (c.especializaciones) {
    p('**Especializaciones**')
    lista(c.especializaciones.map((e) => `**${e.nombre}** — ${e.detalle}`))
  }
  p(`**Realiza:** ${c.realiza}`)
})
p(md(clases.cierre))

p('## 3.4 Requerimientos no funcionales')
p(
  'Los 30 requerimientos se reparten en los seis atributos de calidad del template más uno añadido, ' +
    'la usabilidad, que el caso declara máxima prioridad. Cada uno lleva el criterio con el que se ' +
    'verifica; los marcados como asunción llevan un número que pusimos nosotros.',
)
for (const g of rnf.grupos) {
  p(`### ${g.num} ${g.nombre}`, '', md(g.intro))
  p(
    tabla(
      ['ID', 'Atributo', 'Requerimiento', 'Criterio de aceptación'],
      rnf.requerimientos
        .filter((r) => r.grupo === g.nombre)
        .map((r) => [r.id, md(r.atributo), `${md(r.requerimiento)} ${MARCA[r.origen]}`, md(r.criterio)]),
    ),
  )
}
p('### 3.4.8 Mapeo de requerimientos no funcionales contra QoS')
p(
  'Cada atributo de calidad con su métrica, su umbral y la táctica que lo sostiene. La última columna es ' +
    'el precio de esa táctica: es lo que hay que poder defender.',
)
p(
  tabla(
    ['RNF', 'Atributo de QoS', 'Métrica o indicador', 'Objetivo / umbral', 'Táctica arquitectónica', 'Punto de fricción'],
    qos.filas.map((f) => [f.rnf, md(f.atributo), md(f.metrica), md(f.objetivo), md(f.tactica), md(f.friccion)]),
  ),
)

p('## 3.5 Requerimientos inversos')
p(md(restr.inversos.intro))
p(
  tabla(
    ['ID', 'Límite', 'El sistema no debe…'],
    restr.inversos.filas.map((r) => [r.id, md(r.nombre), `${md(r.descripcion)} ${MARCA[r.origen]}`]),
  ),
)

p('## 3.6 Restricciones de diseño')
p(md(restr.restricciones.intro))
p(
  tabla(
    ['ID', 'Restricción', 'Descripción', 'Origen'],
    restr.restricciones.filas.map((r) => [r.id, md(r.nombre), `${md(r.descripcion)} ${MARCA[r.origen]}`, md(r.fuente)]),
  ),
)

p('## 3.7 Requerimientos lógicos de base de datos')
p(md(datosLogicos.intro))
p(
  tabla(
    ['Entidad de datos', 'Formato', 'Volumen', 'Retención', 'Integridad'],
    datosLogicos.entidades.map((e) => [md(e.entidad), md(e.formato), md(e.volumen), md(e.retencion), md(e.integridad)]),
  ),
)
p('**Reglas transversales de los datos**')
lista(datosLogicos.reglas)

p('## 3.8 Otros requerimientos — granularidad de los servicios')
p(md(restr.granularidad.intro))
p(
  tabla(
    ['Dominio', 'Driver dominante', 'Veredicto', 'Por qué'],
    restr.granularidad.filas.map((g) => [md(g.dominio), md(g.driver), md(g.veredicto), md(g.razon)]),
  ),
)

// ---------- 4. Modelos de análisis ----------
p('# 4. Modelos de análisis')
p(md(modelos.intro))
for (const m of modelos.modelos) {
  p(`## ${m.num} ${m.titulo}`)
  p(md(m.introduccion))
  p(figura(variante, m.archivo, m.titulo))
  lista(m.narrativa)
  p(md(m.cierre))
  p(`**Trazabilidad:** ${m.trazabilidad}`)
}

// ---------- 5. Gestión de cambios ----------
p('# 5. Proceso de gestión de cambios')
p(md(srs.gestionCambios.intro))
p(
  tabla(
    ['Paso', 'En qué consiste'],
    srs.gestionCambios.pasos.map((x) => [md(x.paso), md(x.texto)]),
  ),
)
p(md(srs.gestionCambios.nota))

p('---')
p(md(meta.pie))

return out.join('\n').replace(/\n{3,}/g, '\n\n') + '\n'
}

for (const d of VARIANTE.destinos) {
  const destino = join(RAIZ, d.ruta)
  // El destino fuera del paquete solo existe en el equipo local, no en CI.
  if (d.ruta.startsWith('..') && !existsSync(dirname(destino))) continue
  writeFileSync(destino, construir({ ...VARIANTE, img: d.img }))
  console.log(`✓ ${destino}`)
}
