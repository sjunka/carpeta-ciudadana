import Section from '../components/Section.jsx'
import BlockerCard from '../components/BlockerCard.jsx'
import datos from '../content/bloqueos.json'

export default function SeccionBloqueos({ meta }) {
  return (
    <Section meta={meta}>
      <div className="blockers">
        {datos.bloqueos.map((b) => (
          <BlockerCard key={b.id} bloqueo={b} />
        ))}
      </div>
    </Section>
  )
}
