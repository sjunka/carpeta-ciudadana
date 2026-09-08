import Rich from './Rich.jsx'

export default function Section({ meta, children }) {
  return (
    <section id={meta.id}>
      <div className="sec-head">
        <span className="sec-num">{meta.num}</span>
        <h2>{meta.titulo}</h2>
        {meta.intro && <Rich as="p" html={meta.intro} />}
      </div>
      {children}
    </section>
  )
}

export function SubTitulo({ num, texto }) {
  return (
    <h3 className="dom">
      {num} <span>{texto}</span>
    </h3>
  )
}
