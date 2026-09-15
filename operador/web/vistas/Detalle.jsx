import { useEffect, useState } from 'react'
import { ArrowLeft, BadgeCheck } from 'lucide-react'
import { autenticar, listar } from '../api.js'
import Aviso from './Aviso.jsx'
import Estado from './Estado.jsx'

const fecha = (iso) => new Date(iso).toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short' })

export default function Detalle({ id }) {
  const [doc, setDoc] = useState(null)
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    listar().then((l) => {
      const d = l.find((x) => x.id === id)
      d ? setDoc(d) : setError('Este documento no está en tu carpeta.')
    }).catch((e) => setError(e.message))
  }, [id])

  async function pedirAutenticacion() {
    setEnviando(true)
    setError(null)
    try {
      setDoc(await autenticar(id))
    } catch (e) {
      setError(`El centralizador no autenticó el documento. ${e.message}`)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="contenedor estrecho" aria-labelledby="t-doc">
      <a className="volver" href="#carpeta"><ArrowLeft size={20} strokeWidth={1.75} aria-hidden="true" /> Mi carpeta</a>
      {error && <Aviso tipo="peligro" titulo="Algo no salió bien">{error}</Aviso>}
      {!doc && !error && <p className="cargando" role="status">Cargando el documento…</p>}
      {doc && (
        <>
          <h1 id="t-doc">{doc.titulo}</h1>
          <Estado estado={doc.estado} />
          <dl className="datos tarjeta">
            <div><dt>Emitido por</dt><dd>Subido por ti (no es un documento emitido por una entidad)</dd></div>
            <div><dt>Fecha de carga</dt><dd>{fecha(doc.creado)}</dd></div>
            <div><dt>Tipo</dt><dd>{{ 'application/pdf': 'PDF', 'image/jpeg': 'Imagen JPG', 'image/png': 'Imagen PNG' }[doc.tipo]}</dd></div>
          </dl>

          {doc.estado === 'cargado' && (
            <div className="tarjeta accion">
              <h2>Autenticar con el centralizador</h2>
              <p>Enviaremos al centralizador de Carpeta Ciudadana un enlace a este documento que vence en 15 minutos. El archivo no sale de tu carpeta.</p>
              <button type="button" className="btn primario" onClick={pedirAutenticacion} disabled={enviando}>
                <BadgeCheck size={20} strokeWidth={1.75} aria-hidden="true" />
                {enviando ? 'Esperando respuesta del centralizador…' : 'Autenticar este documento'}
              </button>
            </div>
          )}

          {doc.estado === 'autenticado' && (
            <Aviso tipo="exito" titulo={`Autenticado el ${fecha(doc.autenticacion.fecha)}`}>
              Respuesta del centralizador: «{doc.autenticacion.respuesta}»
            </Aviso>
          )}

          <details className="tecnico">
            <summary>Ver información de verificación</summary>
            <p>Huella SHA-256 del archivo, calculada al recibirlo:</p>
            <code>{doc.sha256}</code>
          </details>
        </>
      )}
    </section>
  )
}
