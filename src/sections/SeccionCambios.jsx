import Section from '../components/Section.jsx'
import DataTable from '../components/DataTable.jsx'
import Plegable from '../components/Plegable.jsx'
import Rich from '../components/Rich.jsx'
import srs from '../content/srs.json'

const COL_PASOS = [
  { clave: 'paso', cabecera: 'Paso', ancho: '210px', clase: 'nm' },
  { clave: 'texto', cabecera: 'En qué consiste' },
]

const COL_HIST = [
  { clave: 'fecha', cabecera: 'Fecha', ancho: '120px', clase: 'id' },
  { clave: 'version', cabecera: 'Versión', ancho: '80px', clase: 'id' },
  { clave: 'descripcion', cabecera: 'Descripción' },
  { clave: 'autor', cabecera: 'Autor', ancho: '150px' },
  { clave: 'comentarios', cabecera: 'Comentarios', ancho: '210px' },
]

const COL_APROB = [
  { clave: 'firma', cabecera: 'Firma', ancho: '200px', celda: () => '' },
  { clave: 'nombre', cabecera: 'Nombre impreso', ancho: '230px', clase: 'nm' },
  { clave: 'cargo', cabecera: 'Cargo' },
  { clave: 'fecha', cabecera: 'Fecha', ancho: '140px', celda: () => '' },
]

export default function SeccionCambios({ meta, comprimido }) {
  return (
    <Section meta={meta} comprimido={comprimido}>
      {!comprimido && <Rich as="p" html={srs.gestionCambios.intro} />}
      <DataTable ancha columnas={COL_PASOS} filas={srs.gestionCambios.pasos} claveFila={(p) => p.paso} />
      <Plegable titulo="Por qué el documento es salida y no se edita a mano" comprimido={comprimido}>
        <Rich as="p" html={srs.gestionCambios.nota} />
      </Plegable>

      <Plegable titulo={`Historial de revisiones — ${srs.historial.length} versiones`} comprimido={comprimido}>
        <h4 className="sub3">Historial de revisiones</h4>
        <DataTable ancha columnas={COL_HIST} filas={srs.historial} claveFila={(h) => h.version} />
      </Plegable>

      <h4 className="sub3">Aprobación del documento</h4>
      {!comprimido && (
        <p className="lede">La presente Especificación de Requerimientos de Software ha sido aceptada y aprobada por:</p>
      )}
      <DataTable ancha columnas={COL_APROB} filas={srs.aprobacion} claveFila={(a) => a.cargo} />
    </Section>
  )
}
