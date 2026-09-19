import { useEffect, useState } from 'react'
import { ArrowLeft, Send } from 'lucide-react'
import { operadores, trasladar } from '../api.js'
import Aviso from './Aviso.jsx'

// HU-13: el titular se va a otro operador. Solo se listan los que publican transferAPIURL.
export default function Traslado() {
  const [lista, setLista] = useState(null)
  const [destino, setDestino] = useState('')
  const [acepta, setAcepta] = useState(false)
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [hecho, setHecho] = useState(null)

  useEffect(() => { operadores().then(setLista).catch((e) => setError(e.message)) }, [])

  async function enviar(ev) {
    ev.preventDefault()
    if (!destino) return setError('Elige el operador al que te quieres trasladar.')
    if (!acepta) return setError('Confirma que entiendes que tu carpeta se borrará de Mi Carpeta Segura.')
    setError(null)
    setEnviando(true)
    try {
      setHecho(await trasladar(destino))
    } catch (e) {
      setError(e.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="contenedor estrecho" aria-labelledby="t-traslado">
      <a className="volver" href="#carpeta"><ArrowLeft size={20} strokeWidth={1.75} aria-hidden="true" /> Mi carpeta</a>
      <h1 id="t-traslado">Trasladar mi carpeta</h1>
      <p className="guia">Tus documentos pasan al operador que elijas. Cuando ese operador confirme que los recibió, los borramos de aquí.</p>
      {hecho ? (
        <Aviso tipo="exito" titulo={`Traslado enviado a ${hecho.operador}`}>
          Enviamos {hecho.documentos} documentos. Mientras {hecho.operador} confirma, tu carpeta queda en solo lectura.
        </Aviso>
      ) : (
        <>
          {error && <Aviso tipo="peligro" titulo="No pudimos iniciar el traslado">{error}</Aviso>}
          {!lista && !error && <p className="cargando" role="status">Consultando operadores en GovCarpeta…</p>}
          {lista && (
            <form onSubmit={enviar} noValidate className="formulario">
              <div className="campo">
                <label htmlFor="destino">Operador destino</label>
                <p id="destino-ayuda" className="ayuda">Solo aparecen los {lista.length} operadores que reciben traslados.</p>
                <select id="destino" value={destino} aria-describedby="destino-ayuda" onChange={(e) => setDestino(e.target.value)}>
                  <option value="">Elige un operador</option>
                  {lista.map((o) => <option key={o.id} value={o.id}>{o.nombre}</option>)}
                </select>
              </div>
              <div className="campo">
                <label>
                  <input type="checkbox" checked={acepta} onChange={(e) => setAcepta(e.target.checked)} />{' '}
                  Entiendo que dejaré de estar afiliado a Mi Carpeta Segura y que mi carpeta se borrará de aquí cuando el otro operador confirme.
                </label>
              </div>
              {enviando && <p className="cargando" role="status">Enviando tu carpeta…</p>}
              <button type="submit" className="btn primario" disabled={enviando}>
                <Send size={20} strokeWidth={1.75} aria-hidden="true" /> Trasladar mi carpeta
              </button>
            </form>
          )}
        </>
      )}
    </section>
  )
}
