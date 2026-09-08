import useDiagramSteps from '../hooks/useDiagramSteps.js'

// Envuelve un diagrama y le da el conmutador estático / animado.
// El SVG solo tiene que marcar sus grupos con las clases st1…stN.
export default function DiagramFrame({ id, pasos, children }) {
  const { animado, leyenda, activar } = useDiagramSteps(pasos)
  return (
    <>
      <div className="diagctl">
        <span className="lab">Vista</span>
        <button type="button" aria-pressed={!animado} onClick={() => activar(false)}>
          Estático
        </button>
        <button type="button" aria-pressed={animado} onClick={() => activar(true)}>
          ▶ Animado por pasos
        </button>
        <span className="step">{leyenda}</span>
      </div>
      <div className="diagbox">
        <div id={id} className={animado ? 'dd-host anim play' : 'dd-host'}>
          {children}
        </div>
      </div>
    </>
  )
}
