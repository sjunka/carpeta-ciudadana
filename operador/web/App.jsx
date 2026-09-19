import { useEffect, useState } from 'react'
import { FolderLock, LogIn, LogOut, UserPlus } from 'lucide-react'
import ThemeToggle from '../../src/components/ThemeToggle.jsx'
import { sesion } from './api.js'
import Inicio from './vistas/Inicio.jsx'
import Registro from './vistas/Registro.jsx'
import Carpeta from './vistas/Carpeta.jsx'
import Subir from './vistas/Subir.jsx'
import Detalle from './vistas/Detalle.jsx'
import Traslado from './vistas/Traslado.jsx'

const TEMA = { tema: { aClaro: 'Tema claro', aOscuro: 'Tema oscuro' } }

// Sin router: la vista vive en el hash (#registro, #carpeta, #subir, #traslado, #documento/<id>).
function useHash() {
  const [hash, setHash] = useState(window.location.hash.slice(1))
  useEffect(() => {
    const cambiar = () => { setHash(window.location.hash.slice(1)); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', cambiar)
    return () => window.removeEventListener('hashchange', cambiar)
  }, [])
  return hash
}

export default function App() {
  const hash = useHash()
  const [usuario, setUsuario] = useState(undefined)

  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    const inicio = p.has('code')
      ? sesion.signinRedirectCallback().then((u) => {
          window.history.replaceState(null, '', window.location.pathname + (u.state || '#carpeta'))
          window.dispatchEvent(new HashChangeEvent('hashchange'))
          return u
        })
      : sesion.getUser()
    inicio.then((u) => setUsuario(u && !u.expired ? u : null)).catch(() => setUsuario(null))
  }, [])

  const [vista, id] = hash.split('/')
  const protegida = ['carpeta', 'subir', 'traslado', 'documento'].includes(vista)
  if (protegida && usuario === null) sesion.signinRedirect({ state: `#${hash}` })

  let contenido
  if (usuario === undefined || (protegida && !usuario)) contenido = <p className="cargando" role="status">Abriendo tu carpeta…</p>
  else if (vista === 'registro') contenido = <Registro />
  else if (vista === 'carpeta') contenido = <Carpeta />
  else if (vista === 'subir') contenido = <Subir />
  else if (vista === 'traslado') contenido = <Traslado />
  else if (vista === 'documento') contenido = <Detalle id={id} />
  else contenido = <Inicio conectado={!!usuario} />

  return (
    <>
      <a className="saltar" href="#principal" onClick={(e) => { e.preventDefault(); document.getElementById('principal').focus() }}>
        Saltar al contenido
      </a>
      <header className="barra">
        <a className="marca" href={usuario ? '#carpeta' : '#'}>
          <FolderLock size={24} strokeWidth={1.75} aria-hidden="true" />
          <span>Mi Carpeta Segura</span>
        </a>
        <nav className="acciones" aria-label="Cuenta">
          <ThemeToggle meta={TEMA} />
          {usuario ? (
            <button type="button" className="btn secundario" onClick={() => sesion.signoutRedirect()}>
              <LogOut size={20} strokeWidth={1.75} aria-hidden="true" /> Cerrar sesión
            </button>
          ) : (
            <>
              <a className="btn secundario solo-ancho" href="#registro">
                <UserPlus size={20} strokeWidth={1.75} aria-hidden="true" /> Afiliarme
              </a>
              <button type="button" className="btn primario" onClick={() => sesion.signinRedirect({ state: '#carpeta' })}>
                <LogIn size={20} strokeWidth={1.75} aria-hidden="true" /> Ingresar
              </button>
            </>
          )}
        </nav>
      </header>
      <main id="principal" tabIndex={-1}>{contenido}</main>
      <footer className="pie">
        Prototipo académico · Arquitecturas Avanzadas de Software · Operador de Carpeta Ciudadana
      </footer>
    </>
  )
}
