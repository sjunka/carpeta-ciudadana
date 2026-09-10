import Section, { SubTitulo } from '../components/Section.jsx'
import DataTable from '../components/DataTable.jsx'
import Plegable from '../components/Plegable.jsx'
import Rich from '../components/Rich.jsx'
import srs from '../content/srs.json'

const COL_GLOSARIO = [
  { clave: 'termino', cabecera: 'Término', ancho: '230px', clase: 'nm' },
  { clave: 'definicion', cabecera: 'Definición', celda: (r) => <Rich html={r.definicion} /> },
]

function Lista({ titulo, items }) {
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

export default function SeccionIntro({ meta, comprimido }) {
  const a = srs.alcance
  return (
    <Section meta={meta} comprimido={comprimido}>
      {/* En exposición el alcance va primero: es lo que hay que poder decir en una frase. */}
      <SubTitulo num="1.2" texto="Alcance" />
      <p>
        El producto que este documento especifica se llama <b>{a.producto}</b>.
      </p>
      <Lista titulo="Qué hace" items={a.hace} />
      <Lista titulo="Qué no hace" items={a.noHace} />
      <Plegable titulo="1.2 · Beneficios y objetivos" comprimido={comprimido}>
        <Lista titulo="Beneficios" items={a.beneficios} />
        <Lista titulo="Objetivos" items={a.objetivos} />
      </Plegable>

      <Plegable titulo="1.1 · Propósito y audiencia del documento" comprimido={comprimido}>
        <SubTitulo num="1.1" texto="Propósito" />
        {srs.proposito.map((p, i) => (
          <Rich key={i} as="p" html={p} />
        ))}
      </Plegable>

      <Plegable titulo={`1.3 · Definiciones y acrónimos — ${srs.glosario.length} términos`} comprimido={comprimido}>
        <SubTitulo num="1.3" texto="Definiciones, acrónimos y abreviaturas" />
        <DataTable columnas={COL_GLOSARIO} filas={srs.glosario} claveFila={(r) => r.termino} />
      </Plegable>

      <Plegable titulo={`1.4 · Referencias — ${srs.referencias.length}`} comprimido={comprimido}>
        <SubTitulo num="1.4" texto="Referencias" />
        <ol className="flow">
          {srs.referencias.map((r) => (
            <Rich key={r.n} as="li" html={r.texto} />
          ))}
        </ol>
      </Plegable>

      <Plegable titulo="1.5 · Visión general del documento" comprimido={comprimido}>
        <SubTitulo num="1.5" texto="Visión general del documento" />
        <ul className="logic">
          {srs.vision.map((v, i) => (
            <Rich key={i} as="li" html={v} />
          ))}
        </ul>
      </Plegable>
    </Section>
  )
}
