const VARIANTES = {
  asuncion: { clase: 'f-asum', texto: 'Asunción' },
  bloqueo: { clase: 'f-block', texto: 'Bloqueo' },
  caso: { clase: 'f-firme', texto: 'Del caso' },
  resuelto: { clase: 'f-firme', texto: 'Resuelto' },
}

export default function Badge({ tipo, texto }) {
  const v = VARIANTES[tipo]
  if (!v) return null
  return <span className={`flag ${v.clase}`}>{texto || v.texto}</span>
}

export function Prioridad({ valor }) {
  const clase = { Alta: 'p-a', Media: 'p-m', Baja: 'p-b' }[valor] || 'p-b'
  return <span className={`pri ${clase}`}>{valor}</span>
}
