import { useEffect, useState } from 'react'
import { FilePlus2, FileText, FolderOpen, Send } from 'lucide-react'
import { listar } from '../api.js'
import Aviso from './Aviso.jsx'
import Estado from './Estado.jsx'

const fecha = (iso) => new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
const tamano = (b) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.ceil(b / 1024)} KB`)

export default function Carpeta() {
  const [docs, setDocs] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => { listar().then(setDocs).catch((e) => setError(e.message)) }, [])

  return (
    <section className="contenedor" aria-labelledby="t-carpeta">
      <div className="encabezado">
        <div>
          <h1 id="t-carpeta">Mi carpeta</h1>
          <p className="guia">{docs ? `${docs.length} de 20 documentos` : 'Tus documentos guardados'}</p>
        </div>
        <div className="acciones">
          <a className="btn secundario" href="#traslado">
            <Send size={20} strokeWidth={1.75} aria-hidden="true" /> Trasladar carpeta
          </a>
          <a className="btn primario" href="#subir">
            <FilePlus2 size={20} strokeWidth={1.75} aria-hidden="true" /> Subir documento
          </a>
        </div>
      </div>
      {error && <Aviso tipo="peligro" titulo="No pudimos abrir tu carpeta">{error}</Aviso>}
      {!docs && !error && <p className="cargando" role="status">Cargando tus documentos…</p>}
      {docs?.length === 0 && (
        <div className="vacio tarjeta">
          <FolderOpen size={24} strokeWidth={1.75} aria-hidden="true" />
          <h2>Todavía no tienes documentos</h2>
          <p>Sube tu primer documento y pide que el centralizador lo autentique.</p>
        </div>
      )}
      {docs?.length > 0 && (
        <ul className="documentos">
          {docs.map((d) => (
            <li key={d.id}>
              <a className="tarjeta documento" href={`#documento/${d.id}`}>
                <FileText size={24} strokeWidth={1.75} aria-hidden="true" />
                <div>
                  <h2>{d.titulo}</h2>
                  <p className="meta">Subido por ti · {fecha(d.creado)} · {tamano(d.tamano)}</p>
                  <Estado estado={d.estado} />
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
