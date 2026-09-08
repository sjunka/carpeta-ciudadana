import { useEffect, useState } from 'react'

export default function useActiveSection(ids) {
  const [activa, setActiva] = useState(ids[0])

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => e.isIntersecting && setActiva(e.target.id))
      },
      { rootMargin: '-52px 0px -70% 0px' },
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [ids])

  return activa
}
