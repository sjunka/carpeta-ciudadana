import Section from '../components/Section.jsx'
import DataTable from '../components/DataTable.jsx'
import datos from '../content/mapeo-qos.json'

const COLUMNAS = [
  { clave: 'rnf', cabecera: 'RNF', ancho: '110px', clase: 'id' },
  { clave: 'atributo', cabecera: 'Atributo de QoS', ancho: '130px', clase: 'nm' },
  { clave: 'metrica', cabecera: 'Métrica o indicador', ancho: '150px' },
  { clave: 'objetivo', cabecera: 'Objetivo / umbral', ancho: '180px' },
  { clave: 'tactica', cabecera: 'Táctica arquitectónica' },
  { clave: 'friccion', cabecera: 'Punto de fricción' },
]

export default function SeccionQos({ meta }) {
  return (
    <Section meta={meta}>
      <DataTable ancha columnas={COLUMNAS} filas={datos.filas} claveFila={(r) => r.rnf} />
    </Section>
  )
}
