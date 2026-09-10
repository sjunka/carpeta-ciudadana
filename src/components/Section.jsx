import Rich from './Rich.jsx'

export default function Section({ meta, comprimido, children }) {
  const entrada = comprimido ? null : meta.intro
  return (
    <section id={meta.id}>
      <div className="sec-head">
        <span className="sec-num">{meta.num}</span>
        <h2>{meta.titulo}</h2>
        {entrada && <Rich as="p" html={entrada} />}
      </div>
      {children}
    </section>
  )
}

export function SubTitulo({ num, texto, id }) {
  return (
    <h3 className="dom" id={id}>
      {num} <span>{texto}</span>
    </h3>
  )
}
