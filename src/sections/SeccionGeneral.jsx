import Section, { SubTitulo } from '../components/Section.jsx'
import DataTable from '../components/DataTable.jsx'
import DiagramFrame from '../components/DiagramFrame.jsx'
import Plegable from '../components/Plegable.jsx'
import Refs from '../components/Refs.jsx'
import Rich from '../components/Rich.jsx'
import ContextDiagram from '../diagrams/ContextDiagram.jsx'
import srs from '../content/srs.json'
import contexto from '../content/contexto.json'
import diagramas from '../content/diagramas.json'
import rf from '../content/requerimientos-funcionales.json'
import bloqueos from '../content/bloqueos.json'

const COL_ACTORES = [
  { clave: 'actor', cabecera: 'Actor', ancho: '200px', clase: 'nm' },
  { clave: 'descripcion', cabecera: 'Descripción', celda: (r) => <Rich html={r.descripcion} /> },
  { clave: 'interaccion', cabecera: 'Tipo de interacción', ancho: '290px', celda: (r) => <Rich html={r.interaccion} /> },
]

const COL_USUARIOS = [
  { clave: 'perfil', cabecera: 'Perfil', ancho: '190px', clase: 'nm' },
  { clave: 'descripcion', cabecera: 'Descripción' },
  { clave: 'nivel', cabecera: 'Nivel técnico', ancho: '260px' },
  { clave: 'frecuencia', cabecera: 'Frecuencia de uso', ancho: '220px' },
]

const COL_FAMILIAS = [
  { clave: 'familia', cabecera: 'Familia', ancho: '230px', clase: 'nm' },
  { clave: 'texto', cabecera: 'Qué acota' },
  { clave: 'refs', cabecera: 'Detalle en', ancho: '170px', celda: (f) => <Refs texto={f.refs} /> },
]

const COL_SUPUESTOS = [
  { clave: 'ref', cabecera: 'Ref.', ancho: '70px', clase: 'id' },
  { clave: 'supuesto', cabecera: 'Supuesto que tomamos', ancho: '380px' },
  { clave: 'cambia', cabecera: 'Qué cambia si el supuesto es falso' },
]

// Los dominios se ordenan por identificador: el JSON los guarda por relevancia.
const dominios = [...rf.dominios].sort((a, b) => a.id.localeCompare(b.id))

const COL_FUNCIONES = [
  { clave: 'id', cabecera: 'Dominio', ancho: '82px', celda: (d) => <Refs texto={d.id} /> },
  { clave: 'nombre', cabecera: 'Nombre', ancho: '260px', clase: 'nm' },
  { clave: 'intro', cabecera: 'Qué resuelve' },
  { clave: 'n', cabecera: 'RF', ancho: '56px', celda: (d) => d.requerimientos.length },
]

// El campo "Asunción provisional" de cada pregunta abierta es, en esta entrega,
// un supuesto declarado; el tercero dice qué cambia si resulta falso.
const supuestos = bloqueos.bloqueos
  .filter((b) => b.estado !== 'resuelto')
  .map((b) => ({
    ref: b.id,
    supuesto: b.campos[1]?.texto ?? '',
    cambia: b.campos[2]?.texto ?? '',
  }))

export default function SeccionGeneral({ meta, comprimido }) {
  return (
    <Section meta={meta} comprimido={comprimido}>
      <SubTitulo num="2.1" texto="Perspectiva del producto" />
      <DiagramFrame id="d-ctx" pasos={diagramas.contexto.pasos}>
        <ContextDiagram />
      </DiagramFrame>
      <p className="pull">{contexto.idea}</p>
      <Plegable titulo="2.1 · El operador dentro de la federación" comprimido={comprimido}>
        {srs.perspectiva.map((p, i) => (
          <Rich key={i} as="p" html={p} />
        ))}
        <Rich as="p" html={contexto.cierre} />
      </Plegable>
      <Plegable titulo={`2.1 · Actores — ${contexto.actores.length}`} comprimido={comprimido}>
        <DataTable ancha columnas={COL_ACTORES} filas={contexto.actores} claveFila={(r) => r.actor} />
      </Plegable>
      <Plegable titulo="2.1 · Flujo de información y lógica del diagrama" comprimido={comprimido}>
        <p className="lede"><b>Flujo de información</b></p>
        <ol className="flow">
          {contexto.flujo.map((paso, i) => (
            <Rich key={i} as="li" html={paso} />
          ))}
        </ol>
        <ul className="logic">
          {contexto.logica.map((l, i) => (
            <Rich key={i} as="li" html={l} />
          ))}
        </ul>
      </Plegable>

      <SubTitulo num="2.2" texto="Funciones del producto" />
      {!comprimido && <Rich as="p" className="lede" html={srs.funcionesIntro} />}
      <DataTable ancha columnas={COL_FUNCIONES} filas={dominios} claveFila={(d) => d.id} />

      <Plegable titulo={`2.3 · Características de los usuarios — ${srs.usuarios.length} perfiles`} comprimido={comprimido}>
        <SubTitulo num="2.3" texto="Características de los usuarios" />
        <DataTable ancha columnas={COL_USUARIOS} filas={srs.usuarios} claveFila={(u) => u.perfil} />
      </Plegable>

      <SubTitulo num="2.4" texto="Restricciones generales" />
      {!comprimido && <Rich as="p" html={srs.restriccionesGenerales.intro} />}
      <DataTable ancha columnas={COL_FAMILIAS} filas={srs.restriccionesGenerales.familias} claveFila={(f) => f.familia} />
      <Plegable titulo="2.4 · Normativa aplicable" comprimido={comprimido}>
        <Rich as="p" html={srs.restriccionesGenerales.normativas} />
      </Plegable>

      <SubTitulo num="2.5" texto="Suposiciones y dependencias" />
      {!comprimido && <Rich as="p" html={srs.supuestos.intro} />}
      <ul className="logic">
        {srs.supuestos.generales.map((s, i) => (
          <Rich key={i} as="li" html={s} />
        ))}
      </ul>
      <Plegable titulo={`2.5 · Supuestos abiertos, uno por uno — ${supuestos.length}`} comprimido={comprimido}>
        <DataTable ancha columnas={COL_SUPUESTOS} filas={supuestos} claveFila={(s) => s.ref} claseFila={() => 'asum'} />
      </Plegable>
      <Plegable titulo="2.5 · Dependencias externas" comprimido={comprimido}>
        <p className="lede"><b>Dependencias externas</b></p>
        <ul className="logic">
          {srs.dependencias.map((d, i) => (
            <Rich key={i} as="li" html={d} />
          ))}
        </ul>
      </Plegable>
    </Section>
  )
}
