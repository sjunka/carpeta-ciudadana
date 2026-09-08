import Section, { SubTitulo } from '../components/Section.jsx'
import DataTable from '../components/DataTable.jsx'
import DiagramFrame from '../components/DiagramFrame.jsx'
import Rich from '../components/Rich.jsx'
import ContextDiagram from '../diagrams/ContextDiagram.jsx'
import datos from '../content/contexto.json'
import diagramas from '../content/diagramas.json'

const COLUMNAS = [
  { clave: 'actor', cabecera: 'Actor', ancho: '200px', clase: 'nm' },
  { clave: 'descripcion', cabecera: 'Descripción', celda: (r) => <Rich html={r.descripcion} /> },
  { clave: 'interaccion', cabecera: 'Tipo de interacción', ancho: '290px', celda: (r) => <Rich html={r.interaccion} /> },
]

export default function SeccionContexto({ meta }) {
  return (
    <Section meta={meta}>
      <SubTitulo num="4.1" texto="Actores del sistema" />
      <DataTable ancha columnas={COLUMNAS} filas={datos.actores} claveFila={(r) => r.actor} />

      <SubTitulo num="4.2" texto="Flujo de información" />
      <ol className="flow">
        {datos.flujo.map((paso, i) => (
          <Rich key={i} as="li" html={paso} />
        ))}
      </ol>

      <SubTitulo num="4.3" texto="Representación gráfica" />
      <DiagramFrame id="d-ctx" pasos={diagramas.contexto.pasos}>
        <ContextDiagram />
      </DiagramFrame>

      <SubTitulo num="4.4" texto="Lógica del diagrama" />
      <ul className="logic">
        {datos.logica.map((linea, i) => (
          <Rich key={i} as="li" html={linea} />
        ))}
      </ul>

      <p className="pull">{datos.idea}</p>
      <Rich as="p" html={datos.cierre} />
    </Section>
  )
}
