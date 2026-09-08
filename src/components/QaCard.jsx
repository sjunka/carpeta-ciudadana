import Rich from './Rich.jsx'

export default function QaCard({ pregunta, parrafos }) {
  return (
    <div className="qa">
      <h3>{pregunta}</h3>
      {parrafos.map((p, i) => (
        <Rich key={i} as="p" html={p} />
      ))}
    </div>
  )
}
