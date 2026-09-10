import { useEffect, useRef } from 'react'

// Publica el alto real de la navegación en --navh.
// De ahí cuelga el anclaje de las cabeceras de tabla fijas.
export default function useNavHeight() {
  const ref = useRef(null)

  useEffect(() => {
    const medir = () => {
      const alto = ref.current?.getBoundingClientRect().height
      if (alto > 0) document.documentElement.style.setProperty('--navh', `${Math.round(alto)}px`)
    }
    medir()
    // La barra cambia de alto al entrar y salir de la sección 3, no solo al redimensionar.
    const ro = new ResizeObserver(medir)
    if (ref.current) ro.observe(ref.current)
    document.fonts?.ready.then(medir)
    return () => ro.disconnect()
  }, [])

  return ref
}
