import Section from '../components/Section.jsx'
import QaCard from '../components/QaCard.jsx'
import datos from '../content/simple.json'

export default function SeccionSimple({ meta }) {
  return (
    <Section meta={meta}>
      <div className="simple">
        {datos.tarjetas.map((t) => (
          <QaCard key={t.pregunta} pregunta={t.pregunta} parrafos={t.parrafos} />
        ))}
      </div>
    </Section>
  )
}
