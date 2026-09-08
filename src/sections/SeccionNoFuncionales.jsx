import Section from '../components/Section.jsx'
import DataTable from '../components/DataTable.jsx'
import Badge from '../components/Badge.jsx'
import datos from '../content/requerimientos-no-funcionales.json'

const COLUMNAS = [
  { clave: 'id', cabecera: 'ID', ancho: '86px', clase: 'id' },
  { clave: 'atributo', cabecera: 'Atributo de calidad', ancho: '170px', clase: 'nm' },
  {
    clave: 'requerimiento',
    cabecera: 'Requerimiento',
    celda: (r) => (
      <>
        {r.requerimiento} <Badge tipo={r.origen} />
      </>
    ),
  },
  { clave: 'criterio', cabecera: 'Criterio de aceptación', ancho: '300px' },
]

export default function SeccionNoFuncionales({ meta }) {
  return (
    <Section meta={meta}>
      <DataTable
        ancha
        columnas={COLUMNAS}
        filas={datos.requerimientos}
        claveFila={(r) => r.id}
        claseFila={(r) => (r.origen === 'asuncion' ? 'asum' : undefined)}
      />
    </Section>
  )
}
