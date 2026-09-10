import useDiagramSteps from '../hooks/useDiagramSteps.js'

// Envuelve un diagrama y le da el conmutador estático / por pasos.
// El SVG solo tiene que marcar sus grupos con las clases st1…stN.
export default function DiagramFrame({ id, pasos, ritmo, children }) {
  // ritmo: segundos de dibujo y de pausa cuando este diagrama pide ir más despacio.
  const { animado, paso, leyenda, reproduciendo, activar, ir, alternarReproduccion } = useDiagramSteps(pasos, ritmo ? ritmo * 2000 : undefined)
  const total = pasos.length

  return (
    <>
      <div className="diagctl">
        <span className="lab">Vista</span>
        <button type="button" aria-pressed={!animado} onClick={() => activar(false)}>
          Completo
        </button>
        <button type="button" aria-pressed={animado} onClick={() => activar(true)}>
          Por pasos
        </button>
        {animado && (
          <span className="pasos">
            <button type="button" onClick={() => ir(paso - 1)} disabled={paso <= 1} aria-label="Paso anterior">
              ‹
            </button>
            <button type="button" onClick={alternarReproduccion} aria-label={reproduciendo ? 'Pausar' : 'Reproducir'}>
              {reproduciendo ? '❙❙' : '▶'}
            </button>
            <button type="button" onClick={() => ir(paso + 1)} disabled={paso >= total} aria-label="Paso siguiente">
              ›
            </button>
            <span className="cuenta">
              {Math.max(paso, 1)} / {total}
            </span>
          </span>
        )}
      </div>
      <div className="diagbox">
        <div
          id={id}
          className={animado ? 'dd-host anim' : 'dd-host'}
          style={ritmo ? { '--dd-draw': `${ritmo}s`, '--dd-gap': `${ritmo}s` } : undefined} data-paso={animado ? paso : total} data-fin={animado && paso >= total && !reproduciendo ? '1' : undefined}>
          {children}
        </div>
      </div>
      {animado && (
        <p className="diagcap" role="status">
          {leyenda}
        </p>
      )}
    </>
  )
}
