import Rich from './Rich.jsx'

const TONO = { alerta: 'alert', ok: 'ok' }

export default function Masthead({ meta }) {
  return (
    <header className="masthead">
      <div className="mast-in">
        <span className="stamp">{meta.sello}</span>
        <h1>
          {meta.titulo}
          <Rich as="span" className="sub" html={meta.subtitulo} />
        </h1>
        <dl className="meta">
          {meta.datos.map((d) => (
            <div key={d.titulo}>
              <dt>{d.titulo}</dt>
              <dd className={TONO[d.tono]}>
                {Array.isArray(d.valor) ? d.valor.map((v) => <span key={v}>{v}</span>) : d.valor}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </header>
  )
}
