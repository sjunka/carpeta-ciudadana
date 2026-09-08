import { useCallback, useEffect, useRef, useState } from 'react'

const PASO_MS = 2000

// Conmuta un diagrama entre estático y animado, y va narrando cada paso.
export default function useDiagramSteps(pasos) {
  const [animado, setAnimado] = useState(false)
  const [leyenda, setLeyenda] = useState('')
  const timers = useRef([])

  const limpiar = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }, [])

  useEffect(() => limpiar, [limpiar])

  const activar = useCallback(
    (encender) => {
      limpiar()
      setAnimado(encender)
      if (!encender) return setLeyenda('')

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return setLeyenda('Movimiento reducido: se muestra el diagrama completo.')
      }
      pasos.forEach((texto, i) => {
        timers.current.push(setTimeout(() => setLeyenda(texto), i * PASO_MS + 150))
      })
      timers.current.push(
        setTimeout(() => setLeyenda('Diagrama completo.'), pasos.length * PASO_MS + 200),
      )
    },
    [pasos, limpiar],
  )

  return { animado, leyenda, activar }
}
