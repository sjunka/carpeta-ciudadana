import { forwardRef, useEffect, useState } from 'react'
import ThemeToggle from './ThemeToggle.jsx'
import DescargarPdf from './DescargarPdf.jsx'

// La navegación baja un nivel en la sección 3: las tres tablas que más se consultan
// —funcionales, no funcionales y QoS— tienen su propia barra, y solo mientras se está en ella.
const Nav = forwardRef(function Nav({ secciones, activa }, ref) {
  const conSubs = secciones.find((s) => s.subs?.length)
  const dentro = conSubs && (activa === conSubs.id || conSubs.subs.some((sub) => sub.id === activa))

  // En pantalla estrecha las nueve pestañas no caben: la tira horizontal obliga a
  // arrastrar para leer. Debajo de 640px la lista se pliega en un desplegable
  // vertical que muestra la sección en curso; arriba de 640px sigue siendo la tira.
  const [ancho, setAncho] = useState(() => typeof window === 'undefined' || window.innerWidth > 640)
  const [abierto, setAbierto] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 641px)')
    const ver = () => setAncho(mq.matches)
    ver()
    mq.addEventListener('change', ver)
    return () => mq.removeEventListener('change', ver)
  }, [])

  const actual = secciones.find((s) => s.id === activa) || (dentro ? conSubs : secciones[0])

  return (
    <nav className="toc" ref={ref}>
      <div className="toc-bar">
        <details className="toc-drop" open={ancho || abierto} onToggle={(e) => setAbierto(e.currentTarget.open)}>
          <summary>{Number(actual.num)} · {actual.nav}</summary>
          <div className="toc-in" onClick={() => setAbierto(false)}>
            {secciones.map((s) => (
              <a key={s.id} href={`#${s.id}`} className={activa === s.id || (s === conSubs && dentro) ? 'on' : undefined}>
                {Number(s.num)} · {s.nav}
              </a>
            ))}
          </div>
        </details>
        <ThemeToggle />
        <DescargarPdf />
      </div>
      {dentro && (
        <div className="toc-sub">
          <div className="toc-in">
            <span className="lab">{Number(conSubs.num)} · {conSubs.nav}</span>
            {conSubs.subs.map((sub) => (
              <a key={sub.id} href={`#${sub.id}`} className={activa === sub.id ? 'sub on' : 'sub'}>
                {sub.nav}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
})

export default Nav
