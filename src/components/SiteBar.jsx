import { Map, PlayCircle, FolderGit2, ExternalLink } from 'lucide-react'
import sitio from '../sitio.json'

const BASE = import.meta.env?.BASE_URL ?? '/'
const ICONOS = { map: Map, video: PlayCircle, github: FolderGit2 }

// Barra común a todas las entregas: salta entre el SRS y la arquitectura y abre los
// recursos que no viven dentro de una sección (mapa, videos, repositorio).
export default function SiteBar({ actual }) {
  return (
    <nav className="sitebar" aria-label={sitio.aria}>
      <div className="sitebar-in">
        <span className="sitebar-marca">{sitio.marca}</span>
        <ul className="sitebar-entregas">
          {sitio.entregas.map((e) => (
            <li key={e.id}>
              <a href={`${BASE}${e.ruta}`} aria-current={e.id === actual ? 'page' : undefined}>
                <span className="num">{e.num}</span>
                <span className="largo">{e.nombre}</span>
                <span className="corto" aria-hidden="true">{e.corto}</span>
              </a>
            </li>
          ))}
        </ul>
        <ul className="sitebar-recursos">
          {sitio.recursos.map((r) => {
            const Icono = ICONOS[r.icono]
            const externo = Boolean(r.url)
            return (
              <li key={r.id}>
                <a href={externo ? r.url : `${BASE}${r.ruta}`} {...(externo ? { target: '_blank', rel: 'noopener' } : {})}>
                  <Icono size={18} strokeWidth={1.75} aria-hidden="true" />
                  <span className="txt">{r.nombre}</span>
                  {externo && <ExternalLink className="ext" size={14} strokeWidth={1.75} aria-hidden="true" />}
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
