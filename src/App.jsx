import Masthead from './components/Masthead.jsx'
import Nav from './components/Nav.jsx'
import Rich from './components/Rich.jsx'
import useNavHeight from './hooks/useNavHeight.js'
import useActiveSection from './hooks/useActiveSection.js'

import SeccionFuncionales from './sections/SeccionFuncionales.jsx'
import SeccionNoFuncionales from './sections/SeccionNoFuncionales.jsx'
import SeccionQos from './sections/SeccionQos.jsx'
import SeccionContexto from './sections/SeccionContexto.jsx'
import SeccionCasosDeUso from './sections/SeccionCasosDeUso.jsx'
import SeccionSimple from './sections/SeccionSimple.jsx'
import SeccionApi from './sections/SeccionApi.jsx'
import SeccionBloqueos from './sections/SeccionBloqueos.jsx'

import meta from './content/meta.json'

// Orden de secciones: lo fija meta.json. Reordenar aquí exige reordenar allí.
const SECCIONES = {
  rf: SeccionFuncionales,
  rnf: SeccionNoFuncionales,
  qos: SeccionQos,
  ctx: SeccionContexto,
  cu: SeccionCasosDeUso,
  simple: SeccionSimple,
  api: SeccionApi,
  bloqueos: SeccionBloqueos,
}

const IDS = meta.secciones.map((s) => s.id)

export default function App() {
  const navRef = useNavHeight()
  const activa = useActiveSection(IDS)

  return (
    <>
      <Masthead meta={meta} />
      <Nav ref={navRef} secciones={meta.secciones} activa={activa} />
      <main className="wrap">
        {meta.secciones.map((s) => {
          const Componente = SECCIONES[s.id]
          return Componente ? <Componente key={s.id} meta={s} /> : null
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
