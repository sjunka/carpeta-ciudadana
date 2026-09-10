import Section, { SubTitulo } from '../components/Section.jsx'
import DiagramFrame from '../components/DiagramFrame.jsx'
import Plegable from '../components/Plegable.jsx'
import Refs from '../components/Refs.jsx'
import Rich from '../components/Rich.jsx'
import SequenceDiagram from '../diagrams/SequenceDiagram.jsx'
import StateDiagram from '../diagrams/StateDiagram.jsx'
import DataFlowDiagram from '../diagrams/DataFlowDiagram.jsx'
import modelos from '../content/modelos.json'
import diagramas from '../content/diagramas.json'

const DIBUJO = {
  seq: { Componente: SequenceDiagram, pasos: diagramas.secuencia.pasos },
  std: { Componente: StateDiagram, pasos: diagramas.estados.pasos },
  dfd: { Componente: DataFlowDiagram, pasos: diagramas.flujoDatos.pasos, ritmo: 0.8 },
}

export default function SeccionModelos({ meta, comprimido }) {
  return (
    <Section meta={meta} comprimido={comprimido}>
      {!comprimido && <Rich as="p" html={modelos.intro} />}
      {modelos.modelos.map((m) => {
        const { Componente, pasos, ritmo } = DIBUJO[m.id]
        return (
          <div key={m.id}>
            <SubTitulo num={m.num} texto={m.titulo} />
            {!comprimido && <p className="lede">{m.introduccion}</p>}
            <DiagramFrame id={`d-${m.id}`} pasos={pasos} ritmo={ritmo}>
              <Componente />
            </DiagramFrame>
            <Rich as="p" className="pull" html={m.cierre} />
            <Plegable titulo={`${m.num} · Lectura paso a paso del diagrama`} comprimido={comprimido}>
              {comprimido && <p className="lede">{m.introduccion}</p>}
              <ul className="logic">
                {m.narrativa.map((n, i) => (
                  <Rich key={i} as="li" html={n} />
                ))}
              </ul>
            </Plegable>
            <p className="lede">
              Trazabilidad: <Refs texto={m.trazabilidad} />
            </p>
          </div>
        )
      })}
    </Section>
  )
}
