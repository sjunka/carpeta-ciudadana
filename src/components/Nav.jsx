import { forwardRef } from 'react'
import ThemeToggle from './ThemeToggle.jsx'
import DescargarPdf from './DescargarPdf.jsx'

// La navegación baja un nivel en la sección 3: las tres tablas que más se consultan
// —funcionales, no funcionales y QoS— tienen su propia barra, y solo mientras se está en ella.
const Nav = forwardRef(function Nav({ secciones, activa }, ref) {
  const conSubs = secciones.find((s) => s.subs?.length)
  const dentro = conSubs && (activa === conSubs.id || conSubs.subs.some((sub) => sub.id === activa))

  return (
    <nav className="toc" ref={ref}>
      <div className="toc-bar">
        <div className="toc-in">
          {secciones.map((s) => (
            <a key={s.id} href={`#${s.id}`} className={activa === s.id || (s === conSubs && dentro) ? 'on' : undefined}>
              {Number(s.num)} · {s.nav}
            </a>
          ))}
        </div>
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
