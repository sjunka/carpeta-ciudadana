import { VISTAS } from '../hooks/useVista.js'

export default function VistaBar({ vista, elegir }) {
  return (
    <div className="wrap">
      <div className="diagctl vistas">
        <span className="lab">Vista</span>
        {VISTAS.map((v) => (
          <button key={v.id} type="button" aria-pressed={vista.id === v.id} onClick={() => elegir(v.id)}>
            {v.texto}
          </button>
        ))}
      </div>
    </div>
  )
}
