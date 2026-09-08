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
    window.addEventListener('resize', medir)
    document.fonts?.ready.then(medir)
    return () => window.removeEventListener('resize', medir)
  }, [])

  return ref
}
