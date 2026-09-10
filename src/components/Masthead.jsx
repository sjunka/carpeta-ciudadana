import Rich from './Rich.jsx'

const TONO = { alerta: 'alert', ok: 'ok' }

export default function Masthead({ meta }) {
  return (
    <header className="masthead">
      <div className="mast-in">
        <div className="mast-txt">
          <span className="stamp">{meta.sello}</span>
          <h1>
            {meta.titulo}
            <Rich as="span" className="sub" html={meta.subtitulo} />
          </h1>
        </div>
        {/* La misma imagen que la tarjeta de enlace: quien llega desde el enlace
            compartido ve en la primera pantalla lo que hizo clic. Aparece una vez. */}
        <figure className="mast-img">
          <img src={`${import.meta.env?.BASE_URL ?? '/'}${meta.portada.archivo}`} alt={meta.portada.alt} width="1200" height="630" />
        </figure>
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
