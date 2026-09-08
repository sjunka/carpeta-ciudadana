const CLASE = { critico: 'bk crit', resuelto: 'bk done', abierto: 'bk' }

export default function BlockerCard({ bloqueo }) {
  return (
    <article className={CLASE[bloqueo.estado]}>
      <div className="bk-top">
        <span className="bk-id">{bloqueo.id}</span>
        {bloqueo.etiqueta && <span className="bk-solved">{bloqueo.etiqueta}</span>}
        <h3 className="bk-q">{bloqueo.pregunta}</h3>
      </div>
      <div className="bk-grid">
        {bloqueo.campos.map((c, i) => (
          <div key={c.titulo} className={i === 0 ? 'why' : undefined}>
            <h4>{c.titulo}</h4>
            <p>{c.texto}</p>
          </div>
        ))}
      </div>
    </article>
  )
}
