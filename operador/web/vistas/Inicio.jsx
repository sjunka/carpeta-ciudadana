import { ShieldCheck, FileUp, BadgeCheck } from 'lucide-react'
import { sesion } from '../api.js'

const PASOS = [
  { Icono: ShieldCheck, titulo: 'Afíliate una sola vez', texto: 'Confirmamos con el directorio nacional que no tengas carpeta en otro operador.' },
  { Icono: FileUp, titulo: 'Guarda tus documentos', texto: 'PDF, JPG o PNG de hasta 10 MB. Solo tú puedes verlos.' },
  { Icono: BadgeCheck, titulo: 'Autentícalos', texto: 'Pedimos al centralizador que los autentique enviando un enlace temporal, nunca el archivo.' },
]

export default function Inicio({ conectado }) {
  return (
    <section className="contenedor inicio" aria-labelledby="t-inicio">
      <h1 id="t-inicio">Tus documentos, en una carpeta que controlas</h1>
      <p className="guia">Mi Carpeta Segura es tu operador de Carpeta Ciudadana. Guarda tus documentos y pide su autenticación sin volver a hacer filas.</p>
      <div className="fila-botones">
        {conectado ? (
          <a className="btn primario" href="#carpeta">Ir a mi carpeta</a>
        ) : (
          <>
            <a className="btn primario" href="#registro">Afiliarme</a>
            <button type="button" className="btn secundario" onClick={() => sesion.signinRedirect({ state: '#carpeta' })}>Ya tengo cuenta</button>
          </>
        )}
      </div>
      <ol className="pasos">
        {PASOS.map(({ Icono, titulo, texto }) => (
          <li key={titulo} className="tarjeta">
            <Icono size={24} strokeWidth={1.75} aria-hidden="true" />
            <h2>{titulo}</h2>
            <p>{texto}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
