import { AlertTriangle, Info, CheckCircle2, XCircle } from 'lucide-react'

const ICONOS = { peligro: XCircle, advertencia: AlertTriangle, info: Info, exito: CheckCircle2 }

export default function Aviso({ tipo = 'info', titulo, children }) {
  const Icono = ICONOS[tipo]
  return (
    <div className={`aviso ${tipo}`} role={tipo === 'peligro' ? 'alert' : 'status'}>
      <Icono size={20} strokeWidth={1.75} aria-hidden="true" />
      <div>
        <p className="aviso-titulo">{titulo}</p>
        {children && <p>{children}</p>}
      </div>
    </div>
  )
}
