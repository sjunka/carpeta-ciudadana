import Masthead from '../components/Masthead.jsx'
import SiteBar from '../components/SiteBar.jsx'
import Nav from '../components/Nav.jsx'
import Rich from '../components/Rich.jsx'
import VistaBar from '../components/VistaBar.jsx'
import useNavHeight from '../hooks/useNavHeight.js'
import useActiveSection from '../hooks/useActiveSection.js'
import useVista from '../hooks/useVista.js'
import {
  SeccionIntro, SeccionHistorias, SeccionMicroservicios, SeccionSecuencias,
  SeccionDespliegue, SeccionDecisiones, SeccionImplementacion,
} from './sections/Secciones.jsx'

import meta from './content/meta.json'

// Orden de secciones: lo fija meta.json. El esqueleto es la regla A2.1 de REGLAS.md.
export const SECCIONES = {
  intro: SeccionIntro,
  hu: SeccionHistorias,
  ms: SeccionMicroservicios,
  seq: SeccionSecuencias,
  dep: SeccionDespliegue,
  ad: SeccionDecisiones,
  imp: SeccionImplementacion,
}

const IDS = meta.secciones.map((s) => s.id)

export default function App() {
  const navRef = useNavHeight()
  const activa = useActiveSection(IDS)
  const { vista, elegir, comprimido } = useVista()

  return (
    <>
      <SiteBar actual="arquitectura" />
      <Masthead meta={meta} />
      <Nav ref={navRef} secciones={meta.secciones} activa={activa} meta={meta} />
      <VistaBar vista={vista} elegir={elegir} />
      <main className="wrap">
        {meta.secciones.map((s) => {
          const Componente = SECCIONES[s.id]
          return <Componente key={s.id} meta={s} comprimido={comprimido} />
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
