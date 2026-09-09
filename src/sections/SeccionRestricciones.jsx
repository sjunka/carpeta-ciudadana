import Section from '../components/Section.jsx'
import DataTable from '../components/DataTable.jsx'
import Badge from '../components/Badge.jsx'
import Rich from '../components/Rich.jsx'
import datos from '../content/restricciones.json'

const COL_RD = [
  { clave: 'id', cabecera: 'ID', ancho: '78px', clase: 'id' },
  { clave: 'nombre', cabecera: 'Restricción', ancho: '210px', clase: 'nm' },
  {
    clave: 'descripcion',
    cabecera: 'Descripción',
    celda: (r) => (
      <>
        {r.descripcion} <Badge tipo={r.origen} />
      </>
    ),
  },
  { clave: 'fuente', cabecera: 'Origen', ancho: '210px' },
]

const COL_RI = [
  { clave: 'id', cabecera: 'ID', ancho: '78px', clase: 'id' },
  { clave: 'nombre', cabecera: 'Límite', ancho: '210px', clase: 'nm' },
  {
    clave: 'descripcion',
    cabecera: 'El sistema no debe…',
    celda: (r) => (
      <>
        {r.descripcion} <Badge tipo={r.origen} />
      </>
    ),
  },
]

const COL_GRAN = [
  { clave: 'dominio', cabecera: 'Dominio', ancho: '190px', clase: 'nm' },
  { clave: 'driver', cabecera: 'Driver dominante', ancho: '180px' },
  { clave: 'veredicto', cabecera: 'Veredicto', ancho: '120px', clase: 'id' },
  { clave: 'razon', cabecera: 'Por qué' },
]

// Cada bloque es el mismo par título + tabla; solo cambian las columnas.
const BLOQUES = [
  { datos: datos.restricciones, columnas: COL_RD, clave: (r) => r.id },
  { datos: datos.inversos, columnas: COL_RI, clave: (r) => r.id },
  { datos: datos.granularidad, columnas: COL_GRAN, clave: (r) => r.dominio },
]

export default function SeccionRestricciones({ meta }) {
  return (
    <Section meta={meta}>
      {BLOQUES.map(({ datos: d, columnas, clave }, i) => (
        <div key={d.titulo}>
          <h3 className="dom" style={i === 0 ? { marginTop: 0 } : undefined}>
            {d.titulo}
          </h3>
          <Rich as="p" className="lede" html={d.intro} />
          <DataTable
            ancha
            columnas={columnas}
            filas={d.filas}
            claveFila={clave}
            claseFila={(r) => (r.origen === 'asuncion' ? 'asum' : undefined)}
          />
        </div>
      ))}
    </Section>
  )
}
