import Section, { SubTitulo } from '../components/Section.jsx'
import DataTable from '../components/DataTable.jsx'
import Badge, { Prioridad } from '../components/Badge.jsx'
import Nota from '../components/Nota.jsx'
import Plegable from '../components/Plegable.jsx'
import Refs from '../components/Refs.jsx'
import Rich from '../components/Rich.jsx'
import srs from '../content/srs.json'
import api from '../content/api.json'
import rf from '../content/requerimientos-funcionales.json'
import rnf from '../content/requerimientos-no-funcionales.json'
import qos from '../content/mapeo-qos.json'
import clases from '../content/clases.json'
import restr from '../content/restricciones.json'
import datosLogicos from '../content/datos-logicos.json'

const dominios = [...rf.dominios].sort((a, b) => a.id.localeCompare(b.id))

const COL_RF = [
  { clave: 'id', cabecera: 'ID', ancho: '82px', celda: (r) => <Refs texto={r.id} /> },
  { clave: 'nombre', cabecera: 'Requerimiento', ancho: '210px', clase: 'nm' },
  {
    clave: 'descripcion',
    cabecera: 'Descripción',
    celda: (r) => (
      <>
        {r.descripcion}
        {r.marca && (
          <>
            {' '}
            <Badge tipo={r.marca.tipo} texto={r.marca.tipo === 'bloqueo' ? 'Supuesto' : undefined} />
            <Nota>{r.marca.ref ? `${r.marca.ref} · ${r.marca.nota}` : r.marca.nota}</Nota>
          </>
        )}
      </>
    ),
  },
  { clave: 'prioridad', cabecera: 'Prioridad', ancho: '86px', celda: (r) => <Prioridad valor={r.prioridad} /> },
]

const COL_RNF = [
  { clave: 'id', cabecera: 'ID', ancho: '86px', celda: (r) => <Refs texto={r.id} /> },
  { clave: 'atributo', cabecera: 'Atributo', ancho: '170px', clase: 'nm' },
  { clave: 'requerimiento', cabecera: 'Requerimiento', celda: (r) => (<>{r.requerimiento} <Badge tipo={r.origen} /></>) },
  { clave: 'criterio', cabecera: 'Criterio de aceptación', ancho: '300px' },
]

const COL_QOS = [
  { clave: 'rnf', cabecera: 'RNF', ancho: '110px', celda: (r) => <Refs texto={r.rnf} /> },
  { clave: 'atributo', cabecera: 'Atributo de QoS', ancho: '130px', clase: 'nm' },
  { clave: 'metrica', cabecera: 'Métrica o indicador', ancho: '150px' },
  { clave: 'objetivo', cabecera: 'Objetivo / umbral', ancho: '180px' },
  { clave: 'tactica', cabecera: 'Táctica arquitectónica' },
  { clave: 'friccion', cabecera: 'Punto de fricción' },
]

const COL_RD = [
  { clave: 'id', cabecera: 'ID', ancho: '78px', celda: (r) => <Refs texto={r.id} /> },
  { clave: 'nombre', cabecera: 'Restricción', ancho: '210px', clase: 'nm' },
  { clave: 'descripcion', cabecera: 'Descripción', celda: (r) => (<>{r.descripcion} <Badge tipo={r.origen} /></>) },
  { clave: 'fuente', cabecera: 'Origen', ancho: '210px' },
]

const COL_RI = [
  { clave: 'id', cabecera: 'ID', ancho: '78px', celda: (r) => <Refs texto={r.id} /> },
  { clave: 'nombre', cabecera: 'Límite', ancho: '210px', clase: 'nm' },
  { clave: 'descripcion', cabecera: 'El sistema no debe…', celda: (r) => (<>{r.descripcion} <Badge tipo={r.origen} /></>) },
]

const COL_GRAN = [
  { clave: 'dominio', cabecera: 'Dominio', ancho: '190px', celda: (g) => <Refs texto={g.dominio} className="nm" /> },
  { clave: 'driver', cabecera: 'Driver dominante', ancho: '180px' },
  { clave: 'veredicto', cabecera: 'Veredicto', ancho: '120px', clase: 'id' },
  { clave: 'razon', cabecera: 'Por qué' },
]

const COL_IU = [
  { clave: 'interfaz', cabecera: 'Interfaz', ancho: '210px', clase: 'nm' },
  { clave: 'descripcion', cabecera: 'Descripción' },
  { clave: 'requerimientos', cabecera: 'Requerimientos', ancho: '230px', celda: (r) => <Refs texto={r.requerimientos} /> },
]

const COL_SW = [
  { clave: 'sistema', cabecera: 'Sistema externo', ancho: '230px', clase: 'nm' },
  { clave: 'proposito', cabecera: 'Para qué se usa' },
  { clave: 'contrato', cabecera: 'Contrato', ancho: '300px' },
]

const COL_API = [
  { clave: 'metodo', cabecera: 'Método', ancho: '70px', clase: 'id' },
  { clave: 'path', cabecera: 'Path', ancho: '230px', celda: (r) => <code>{r.path}</code> },
  { clave: 'comportamiento', cabecera: 'Comportamiento verificado' },
]

const COL_DATOS = [
  { clave: 'entidad', cabecera: 'Entidad de datos', ancho: '180px', clase: 'nm' },
  { clave: 'formato', cabecera: 'Formato' },
  { clave: 'volumen', cabecera: 'Volumen', ancho: '230px' },
  { clave: 'retencion', cabecera: 'Retención', ancho: '230px' },
  { clave: 'integridad', cabecera: 'Integridad' },
]

function Bloque({ titulo, items }) {
  return (
    <>
      <p className="lede"><b>{titulo}</b></p>
      <ul className="logic">
        {items.map((x, i) => (
          <Rich key={i} as="li" html={x} />
        ))}
      </ul>
    </>
  )
}

export default function SeccionRequerimientos({ meta, comprimido }) {
  const iface = srs.interfaces
  return (
    <Section meta={meta} comprimido={comprimido}>
      <SubTitulo num="3.1" texto="Requerimientos de interfaces externas" />

      <h4 className="sub3">3.1.3 Interfaces de software</h4>
      {!comprimido && <Rich as="p" html={iface.software.intro} />}
      <DataTable ancha columnas={COL_SW} filas={iface.software.sistemas} claveFila={(r) => r.sistema} />
      <Plegable titulo={`3.1.3 · Operaciones del centralizador verificadas en vivo — ${api.endpoints.length}`} comprimido={comprimido}>
        <p className="lede"><b>Operaciones del centralizador, verificadas en vivo</b></p>
        <DataTable ancha columnas={COL_API} filas={api.endpoints} claveFila={(r) => r.metodo + r.path}
          claseFila={(r) => (r.critico ? 'block' : undefined)} />
      </Plegable>

      <h4 className="sub3">3.1.4 Interfaces de comunicaciones</h4>
      {!comprimido && <Rich as="p" html={iface.comunicaciones.intro} />}
      <ul className="logic">
        {iface.comunicaciones.condiciones.map((c, i) => (
          <Rich key={i} as="li" html={c} />
        ))}
      </ul>

      <Plegable titulo="3.1.1 · Interfaces de usuario" comprimido={comprimido}>
        <h4 className="sub3">3.1.1 Interfaces de usuario</h4>
        <Rich as="p" html={iface.usuario.intro} />
        <DataTable ancha columnas={COL_IU} filas={iface.usuario.filas} claveFila={(r) => r.interfaz} />
        <Bloque titulo="Reglas que toda interfaz cumple" items={iface.usuario.reglas} />
      </Plegable>

      <Plegable titulo="3.1.2 · Interfaces de hardware — no aplica" comprimido={comprimido}>
        <h4 className="sub3">3.1.2 Interfaces de hardware</h4>
        <Rich as="p" html={iface.hardware} />
      </Plegable>

      <SubTitulo num="3.2" texto="Requerimientos funcionales" id="rf" />
      {!comprimido && (
        <p className="lede">
          Los 65 requerimientos se agrupan en nueve dominios. Cada dominio lleva el desglose que pide el
          template —introducción, entradas, procesamiento, salidas y manejo de errores—.
        </p>
      )}
      {dominios.map((d, n) => (
        <div key={d.id}>
          <h4 className="sub3">{`3.2.${n + 1} ${d.id} · ${d.nombre} — ${d.requerimientos.length} RF`}</h4>
          {!comprimido && <p className="lede">{d.desglose.introduccion}</p>}
          <DataTable columnas={COL_RF} filas={d.requerimientos} claveFila={(r) => r.id}
            claseFila={(r) => (r.marca ? 'asum' : undefined)} />
          <Plegable titulo={`${d.id} · Entradas, procesamiento, salidas y errores`} comprimido={comprimido}>
            {comprimido && <p className="lede">{d.desglose.introduccion}</p>}
            <Bloque titulo="Entradas" items={d.desglose.entradas} />
            <Bloque titulo="Procesamiento" items={d.desglose.procesamiento} />
            <Bloque titulo="Salidas" items={d.desglose.salidas} />
            <Bloque titulo="Manejo de errores" items={d.desglose.errores} />
          </Plegable>
        </div>
      ))}

      <SubTitulo num="3.3" texto="Clases y objetos" />
      <Rich as="p" html={comprimido ? clases.cierre : clases.intro} />
      {clases.clases.map((c) => (
        <Plegable key={c.nombre} titulo={`${c.nombre} — ${c.proposito}`} comprimido={comprimido}>
        <div className="qa">
          <h3>{c.nombre}</h3>
          <p>{c.proposito}</p>
          <p className="lede"><b>Atributos</b></p>
          <ul className="logic">{c.atributos.map((a, i) => <li key={i}>{a}</li>)}</ul>
          <p className="lede"><b>Funciones</b></p>
          <ul className="logic">{c.funciones.map((f, i) => <li key={i}>{f}</li>)}</ul>
          {c.especializaciones && (
            <>
              <p className="lede"><b>Especializaciones</b></p>
              <ul className="logic">
                {c.especializaciones.map((e) => (
                  <li key={e.nombre}><b>{e.nombre}</b> — {e.detalle}</li>
                ))}
              </ul>
            </>
          )}
          <p className="lede">Realiza: <Refs texto={c.realiza} /></p>
        </div>
        </Plegable>
      ))}
      {!comprimido && <Rich as="p" html={clases.cierre} />}

      <SubTitulo num="3.4" texto="Requerimientos no funcionales" id="rnf" />
      {!comprimido && (
        <p className="lede">
          Los 30 requerimientos se reparten en los seis atributos de calidad del template más uno añadido,
          la usabilidad, que el caso declara máxima prioridad. Cada uno lleva el criterio con el que se
          verifica; los marcados como asunción llevan un número que pusimos nosotros.
        </p>
      )}
      {rnf.grupos.map((g) => {
        const filas = rnf.requerimientos.filter((r) => r.grupo === g.nombre)
        return (
          <div key={g.nombre}>
            <h4 className="sub3">{`${g.num} ${g.nombre} — ${filas.length} RNF`}</h4>
            {!comprimido && <p className="lede">{g.intro}</p>}
            <DataTable ancha columnas={COL_RNF} filas={filas} claveFila={(r) => r.id}
              claseFila={(r) => (r.origen === 'asuncion' ? 'asum' : undefined)} />
          </div>
        )
      })}
      <h4 className="sub3" id="qos">3.4.8 Mapeo de requerimientos no funcionales contra QoS</h4>
      {!comprimido && (
        <p className="lede">
          Cada atributo de calidad con su métrica, su umbral y la táctica que lo sostiene. La última columna
          es el precio de esa táctica: es lo que hay que poder defender.
        </p>
      )}
      <DataTable ancha columnas={COL_QOS} filas={qos.filas} claveFila={(r) => r.rnf} />

      <SubTitulo num="3.5" texto="Requerimientos inversos" />
      {!comprimido && <Rich as="p" html={restr.inversos.intro} />}
      <DataTable ancha columnas={COL_RI} filas={restr.inversos.filas} claveFila={(r) => r.id}
        claseFila={(r) => (r.origen === 'asuncion' ? 'asum' : undefined)} />

      <SubTitulo num="3.6" texto="Restricciones de diseño" />
      {!comprimido && <Rich as="p" html={restr.restricciones.intro} />}
      <DataTable ancha columnas={COL_RD} filas={restr.restricciones.filas} claveFila={(r) => r.id}
        claseFila={(r) => (r.origen === 'asuncion' ? 'asum' : undefined)} />

      <SubTitulo num="3.7" texto="Requerimientos lógicos de base de datos" />
      {!comprimido && <Rich as="p" html={datosLogicos.intro} />}
      <DataTable ancha columnas={COL_DATOS} filas={datosLogicos.entidades} claveFila={(r) => r.entidad} />
      <Plegable titulo="3.7 · Reglas transversales de los datos" comprimido={comprimido}>
        <Bloque titulo="Reglas transversales de los datos" items={datosLogicos.reglas} />
      </Plegable>

      <SubTitulo num="3.8" texto="Otros requerimientos — granularidad de los servicios" />
      {!comprimido && <Rich as="p" html={restr.granularidad.intro} />}
      <DataTable ancha columnas={COL_GRAN} filas={restr.granularidad.filas} claveFila={(r) => r.dominio} />
    </Section>
  )
}
