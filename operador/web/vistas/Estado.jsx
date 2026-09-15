import { BadgeCheck, FileClock, FileWarning } from 'lucide-react'

// Estado con texto + icono + color. Nunca se dice «certificado»: el sello es del centralizador.
const ESTADOS = {
  pendiente: { clase: 'advertencia', Icono: FileWarning, texto: 'Carga incompleta' },
  cargado: { clase: 'neutro', Icono: FileClock, texto: 'Documento temporal · sin autenticar' },
  autenticado: { clase: 'exito', Icono: BadgeCheck, texto: 'Autenticado por el centralizador' },
}

export default function Estado({ estado }) {
  const { clase, Icono, texto } = ESTADOS[estado] ?? ESTADOS.pendiente
  return (
    <span className={`estado ${clase}`}>
      <Icono size={16} strokeWidth={2} aria-hidden="true" /> {texto}
    </span>
  )
}
