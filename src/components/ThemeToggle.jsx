import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import meta from '../content/meta.json'

const leer = () => {
  try { return localStorage.getItem('tema') } catch { return null }
}

// Sin elección guardada manda la preferencia del sistema.
const delSistema = () =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

export default function ThemeToggle() {
  const [tema, setTema] = useState(() => leer() || delSistema())

  useEffect(() => {
    document.documentElement.dataset.theme = tema
    try { localStorage.setItem('tema', tema) } catch { /* navegación privada */ }
  }, [tema])

  const oscuro = tema === 'dark'
  const Icono = oscuro ? Sun : Moon
  const etiqueta = oscuro ? meta.tema.aClaro : meta.tema.aOscuro

  return (
    <button
      type="button"
      className="tema"
      onClick={() => setTema(oscuro ? 'light' : 'dark')}
      aria-pressed={oscuro}
    >
      <Icono size={20} strokeWidth={1.75} aria-hidden="true" />
      <span>{etiqueta}</span>
    </button>
  )
}
