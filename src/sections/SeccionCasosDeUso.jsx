import Section from '../components/Section.jsx'
import DiagramFrame from '../components/DiagramFrame.jsx'
import Rich from '../components/Rich.jsx'
import UseCaseDiagram from '../diagrams/UseCaseDiagram.jsx'
import datos from '../content/casos-de-uso.json'
import diagramas from '../content/diagramas.json'

export default function SeccionCasosDeUso({ meta }) {
  return (
    <Section meta={meta}>
      <DiagramFrame id="d-cu" pasos={diagramas.casosDeUso.pasos}>
        <UseCaseDiagram />
      </DiagramFrame>
      <Rich as="p" html={datos.cierre} />
    </Section>
  )
}
