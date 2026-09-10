import { buscarRef, PATRON } from '../lib/refs.js'

// Convierte los identificadores de una lista de trazabilidad en referencias con
// su descripción al pasar el cursor. El texto que no reconoce lo deja intacto.
export default function Refs({ texto, className }) {
  const trozos = []
  let ultimo = 0
  for (const m of texto.matchAll(PATRON)) {
    const desc = buscarRef(m[0])
    if (!desc) continue
    if (m.index > ultimo) trozos.push(texto.slice(ultimo, m.index))
    trozos.push(
      <span key={`${m[0]}-${m.index}`} className="ref" data-tip={desc} tabIndex={0}>
        {m[0]}
      </span>,
    )
    ultimo = m.index + m[0].length
  }
  trozos.push(texto.slice(ultimo))
  return <span className={className}>{trozos}</span>
}
