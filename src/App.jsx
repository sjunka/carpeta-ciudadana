import Masthead from './components/Masthead.jsx'
import Nav from './components/Nav.jsx'
import Rich from './components/Rich.jsx'
import VistaBar from './components/VistaBar.jsx'
import useNavHeight from './hooks/useNavHeight.js'
import useActiveSection from './hooks/useActiveSection.js'
import useVista from './hooks/useVista.js'

import SeccionIntro from './sections/SeccionIntro.jsx'
import SeccionGeneral from './sections/SeccionGeneral.jsx'
import SeccionRequerimientos from './sections/SeccionRequerimientos.jsx'
import SeccionModelos from './sections/SeccionModelos.jsx'
import SeccionCambios from './sections/SeccionCambios.jsx'

import meta from './content/meta.json'

// Orden de secciones: lo fija meta.json. Reordenar aquí exige reordenar allí.
const SECCIONES = {
  intro: SeccionIntro,
  gen: SeccionGeneral,
  req: SeccionRequerimientos,
  mod: SeccionModelos,
  cam: SeccionCambios,
}

// El observador sigue también las anclas de subsección, para que la navegación las marque.
const IDS = meta.secciones.flatMap((s) => [s.id, ...(s.subs ?? []).map((x) => x.id)])

export default function App() {
  const navRef = useNavHeight()
  const activa = useActiveSection(IDS)
  const { vista, elegir, comprimido } = useVista()

  return (
    <>
      <Masthead meta={meta} />
      <Nav ref={navRef} secciones={meta.secciones} activa={activa} />
      <VistaBar vista={vista} elegir={elegir} />
      <main className="wrap">
        {meta.secciones.map((s) => {
          const Componente = SECCIONES[s.id]
          return Componente ? <Componente key={s.id} meta={s} comprimido={comprimido} /> : null
        })}
      </main>
      <footer>
        <div className="wrap">
          <Rich as="p" html={meta.pie} />
        </div>
      </footer>
    </>
  )
}
