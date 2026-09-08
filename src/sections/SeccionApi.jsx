import Section from '../components/Section.jsx'
import DataTable from '../components/DataTable.jsx'
import FindingList from '../components/FindingList.jsx'
import datos from '../content/api.json'

const COLUMNAS = [
  { clave: 'metodo', cabecera: 'Método', ancho: '70px', clase: 'id' },
  { clave: 'path', cabecera: 'Path', ancho: '230px', celda: (r) => <code>{r.path}</code> },
  { clave: 'comportamiento', cabecera: 'Comportamiento verificado' },
]

export default function SeccionApi({ meta }) {
  return (
    <Section meta={meta}>
      <DataTable
        ancha
        columnas={COLUMNAS}
        filas={datos.endpoints}
        claveFila={(r) => r.metodo + r.path}
        claseFila={(r) => (r.critico ? 'block' : undefined)}
      />
      <h3 className="dom" style={{ marginTop: 28 }}>
        <span>Hallazgos verificados contra el servicio real</span>
      </h3>
      <FindingList hallazgos={datos.hallazgos} />
    </Section>
  )
}
