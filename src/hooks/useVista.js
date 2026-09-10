import { useState } from 'react'

// La vista del documento vive en ?rf= para poder compartir la comparación tal cual se ve.
// "comprimido" es la vista de exposición: lo importante arriba, el resto plegado.
export const VISTAS = [
  { id: 'comprimido', texto: 'Exposición' },
  { id: 'dominio', texto: 'Documento completo' },
]

const leerUrl = () =>
  (typeof location !== 'undefined' && new URLSearchParams(location.search).get('rf')) || 'comprimido'

export default function useVista() {
  const [id, setId] = useState(leerUrl)
  const vista = VISTAS.find((v) => v.id === id) ?? VISTAS[0]
  const elegir = (siguiente) => {
    setId(siguiente)
    const url = new URL(location.href)
    url.searchParams.set('rf', siguiente)
    history.replaceState(null, '', url)
  }
  return { vista, elegir, comprimido: vista.id === 'comprimido' }
}
