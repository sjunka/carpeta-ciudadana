import { useCallback, useEffect, useRef, useState } from 'react'

// Ritmo de la animación. El paso dura lo que tarda en dibujarse más la pausa
// para leerlo; los dos valores viven también en diagrams.css como --dd-draw y --dd-gap.
export const DIBUJO_MS = 600
export const PAUSA_MS = 600
const CADENCIA_MS = DIBUJO_MS + PAUSA_MS

// Lleva un diagrama paso a paso. El presentador manda: puede reproducir, pausar
// y moverse a mano. paso 0 = nada dibujado; paso === pasos.length = diagrama completo.
export default function useDiagramSteps(pasos, cadencia = CADENCIA_MS) {
  const [animado, setAnimado] = useState(false)
  const [paso, setPaso] = useState(0)
  const [reproduciendo, setReproduciendo] = useState(false)
  const timer = useRef(null)

  const parar = useCallback(() => {
    clearTimeout(timer.current)
    timer.current = null
  }, [])

  useEffect(() => parar, [parar])

  // El avance automático se reprograma en cada paso: así pausar es dejar de reprogramar.
  useEffect(() => {
    if (!animado || !reproduciendo) return
    if (paso >= pasos.length) return setReproduciendo(false)
    timer.current = setTimeout(() => setPaso((p) => p + 1), cadencia)
    return () => clearTimeout(timer.current)
  }, [animado, reproduciendo, paso, pasos.length, cadencia])

  const activar = useCallback(
    (encender) => {
      parar()
      setAnimado(encender)
      setPaso(encender ? 1 : pasos.length)
      setReproduciendo(false)
      if (!encender) return
      const reducido =
        typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reducido) return setPaso(pasos.length)
      setReproduciendo(true)
    },
    [pasos.length, parar],
  )

  const ir = useCallback(
    (destino) => {
      parar()
      setReproduciendo(false)
      setPaso(Math.max(1, Math.min(pasos.length, destino)))
    },
    [pasos.length, parar],
  )

  const alternarReproduccion = useCallback(() => {
    if (paso >= pasos.length) setPaso(1)
    setReproduciendo((r) => !r)
  }, [paso, pasos.length])

  const leyenda = pasos[paso - 1] ?? pasos[0]

  return { animado, paso, leyenda, reproduciendo, activar, ir, alternarReproduccion }
}
