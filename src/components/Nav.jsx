import { forwardRef } from 'react'

const Nav = forwardRef(function Nav({ secciones, activa }, ref) {
  return (
    <nav className="toc" ref={ref}>
      <div className="toc-in">
        {secciones.map((s) => (
          <a key={s.id} href={`#${s.id}`} className={activa === s.id ? 'on' : undefined}>
            {Number(s.num)} · {s.nav}
          </a>
        ))}
      </div>
    </nav>
  )
})

export default Nav
