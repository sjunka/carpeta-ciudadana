import { useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, Copy } from 'lucide-react'
import { registrar, sesion } from '../api.js'
import Aviso from './Aviso.jsx'

const PASOS = [
  {
    titulo: 'Tu identidad',
    campos: [
      { id: 'cedula', etiqueta: 'Número de cédula', ayuda: 'Solo números, sin puntos. Lo usamos para confirmar que no tengas carpeta en otro operador.', inputMode: 'numeric', autoComplete: 'off', patron: /^[0-9]{6,10}$/, error: 'Escribe entre 6 y 10 números, sin puntos ni espacios.' },
      { id: 'nombre', etiqueta: 'Nombres', autoComplete: 'given-name', patron: /^.{1,60}$/, error: 'Escribe tus nombres.' },
      { id: 'apellido', etiqueta: 'Apellidos', autoComplete: 'family-name', patron: /^.{1,60}$/, error: 'Escribe tus apellidos.' },
    ],
  },
  {
    titulo: 'Contacto',
    campos: [
      { id: 'direccion', etiqueta: 'Dirección de residencia', ayuda: 'El directorio nacional la exige para registrar tu afiliación.', autoComplete: 'street-address', patron: /^.{1,120}$/, error: 'Escribe tu dirección.' },
      { id: 'correoContacto', etiqueta: 'Correo personal', ayuda: 'Te escribiremos aquí. Tu cuenta en la carpeta será un correo institucional distinto.', type: 'email', autoComplete: 'email', patron: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, error: 'Escribe un correo válido, por ejemplo ana@correo.co.' },
    ],
  },
  {
    titulo: 'Tu clave',
    campos: [
      { id: 'clave', etiqueta: 'Crea una clave', ayuda: 'Mínimo 12 caracteres. Después de 5 intentos fallidos bloqueamos el ingreso por unos minutos.', type: 'password', autoComplete: 'new-password', patron: /^.{12,64}$/, error: 'La clave debe tener entre 12 y 64 caracteres.' },
    ],
  },
]

const MENSAJES = {
  409: 'Ya tienes carpeta en otro operador. Para cambiarte debes pedir el traslado desde tu operador actual.',
  503: 'El directorio nacional no responde. No podemos confirmar tu afiliación todavía; intenta en unos minutos.',
  429: 'Hiciste demasiados intentos desde esta conexión. Intenta de nuevo en una hora.',
}

export default function Registro() {
  const [paso, setPaso] = useState(0)
  const [datos, setDatos] = useState({})
  const [errores, setErrores] = useState({})
  const [estado, setEstado] = useState({ tipo: 'editando' })
  const titulo = useRef(null)

  const actual = PASOS[paso]

  function validar() {
    const e = {}
    for (const c of actual.campos) if (!c.patron.test((datos[c.id] ?? '').trim())) e[c.id] = c.error
    setErrores(e)
    const primero = Object.keys(e)[0]
    if (primero) document.getElementById(primero).focus()
    return !primero
  }

  async function siguiente(ev) {
    ev.preventDefault()
    if (!validar()) return
    if (paso < PASOS.length - 1) {
      setPaso(paso + 1)
      setTimeout(() => titulo.current?.focus())
      return
    }
    setEstado({ tipo: 'enviando' })
    try {
      const r = await registrar(Object.fromEntries(Object.entries(datos).map(([k, v]) => [k, k === 'clave' ? v : v.trim()])))
      setEstado({ tipo: 'listo', cuenta: r.cuenta })
    } catch (e) {
      setEstado({ tipo: 'error', mensaje: MENSAJES[e.status] ?? e.message })
    }
  }

  if (estado.tipo === 'listo') {
    return (
      <section className="contenedor estrecho" aria-labelledby="t-listo">
        <div className="tarjeta exito">
          <CheckCircle2 size={24} strokeWidth={1.75} aria-hidden="true" />
          <h1 id="t-listo" tabIndex={-1} ref={(n) => n?.focus()}>Ya estás afiliado</h1>
          <p>Tu carpeta quedó registrada en el directorio nacional. Ingresa con esta cuenta y la clave que creaste:</p>
          <p className="cuenta" data-testid="cuenta">{estado.cuenta}</p>
          <div className="fila-botones">
            <button type="button" className="btn primario" onClick={() => sesion.signinRedirect({ state: '#carpeta', login_hint: estado.cuenta })}>Ingresar a mi carpeta</button>
            <button type="button" className="btn secundario" onClick={() => navigator.clipboard?.writeText(estado.cuenta)}>
              <Copy size={20} strokeWidth={1.75} aria-hidden="true" /> Copiar cuenta
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="contenedor estrecho" aria-labelledby="t-registro">
      <p className="paso-indicador">Paso {paso + 1} de {PASOS.length}</p>
      <h1 id="t-registro" tabIndex={-1} ref={titulo}>{actual.titulo}</h1>
      <ol className="progreso" aria-hidden="true">
        {PASOS.map((p, i) => <li key={p.titulo} className={i <= paso ? 'hecho' : ''} />)}
      </ol>
      {estado.tipo === 'error' && <Aviso tipo="peligro" titulo="No pudimos afiliarte">{estado.mensaje}</Aviso>}
      <form onSubmit={siguiente} noValidate className="formulario">
        {actual.campos.map((c) => (
          <div key={c.id} className="campo">
            <label htmlFor={c.id}>{c.etiqueta}</label>
            {c.ayuda && <p id={`${c.id}-ayuda`} className="ayuda">{c.ayuda}</p>}
            <input
              id={c.id} name={c.id} type={c.type ?? 'text'} inputMode={c.inputMode} autoComplete={c.autoComplete}
              value={datos[c.id] ?? ''} onChange={(e) => setDatos({ ...datos, [c.id]: e.target.value })}
              aria-invalid={!!errores[c.id]} aria-describedby={[c.ayuda && `${c.id}-ayuda`, errores[c.id] && `${c.id}-error`].filter(Boolean).join(' ') || undefined}
            />
            {errores[c.id] && <p id={`${c.id}-error`} className="error">{errores[c.id]}</p>}
          </div>
        ))}
        <div className="fila-botones">
          {paso > 0 && (
            <button type="button" className="btn secundario" onClick={() => setPaso(paso - 1)}>
              <ArrowLeft size={20} strokeWidth={1.75} aria-hidden="true" /> Volver
            </button>
          )}
          <button type="submit" className="btn primario" disabled={estado.tipo === 'enviando'}>
            {paso < PASOS.length - 1 ? 'Continuar' : estado.tipo === 'enviando' ? 'Confirmando con el directorio nacional…' : 'Afiliarme'}
            {paso < PASOS.length - 1 && <ArrowRight size={20} strokeWidth={1.75} aria-hidden="true" />}
          </button>
        </div>
      </form>
    </section>
  )
}
