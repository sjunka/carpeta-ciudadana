import { forwardRef } from 'react'
import ThemeToggle from './ThemeToggle.jsx'

const Nav = forwardRef(function Nav({ secciones, activa }, ref) {
  return (
    <nav className="toc" ref={ref}>
      <div className="toc-bar">
        <div className="toc-in">
          {secciones.map((s) => (
            <a key={s.id} href={`#${s.id}`} className={activa === s.id ? 'on' : undefined}>
              {Number(s.num)} · {s.nav}
            </a>
          ))}
        </div>
        <ThemeToggle />
      </div>
    </nav>
  )
})

export default Nav
