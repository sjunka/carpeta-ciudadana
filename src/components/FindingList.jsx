export default function FindingList({ hallazgos }) {
  return (
    <div className="finds">
      {hallazgos.map((h) => (
        <div key={h.n} className={h.critico ? 'find hot' : 'find'}>
          <span className="n">{h.n}</span>
          <p>{h.texto}</p>
        </div>
      ))}
    </div>
  )
}
