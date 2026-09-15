import { useState } from 'react'
import { ArrowLeft, Upload } from 'lucide-react'
import { subir } from '../api.js'
import Aviso from './Aviso.jsx'

const TIPOS = ['application/pdf', 'image/jpeg', 'image/png']
const MAX = 10 * 1024 * 1024
const ETAPAS = {
  reservando: 'Preparando espacio en tu carpeta…',
  subiendo: 'Subiendo el archivo…',
  verificando: 'Verificando que el archivo llegó completo…',
}

export default function Subir() {
  const [titulo, setTitulo] = useState('')
  const [archivo, setArchivo] = useState(null)
  const [error, setError] = useState(null)
  const [etapa, setEtapa] = useState(null)

  async function enviar(ev) {
    ev.preventDefault()
    if (!titulo.trim()) return setError('Escribe un nombre para el documento.')
    if (!archivo) return setError('Elige el archivo que quieres guardar.')
    if (!TIPOS.includes(archivo.type)) return setError('Solo aceptamos PDF, JPG o PNG.')
    if (archivo.size > MAX) return setError('El archivo pesa más de 10 MB. Reduce su tamaño e intenta de nuevo.')
    setError(null)
    try {
      const doc = await subir({ titulo: titulo.trim(), archivo }, setEtapa)
      window.location.hash = `#documento/${doc.id}`
    } catch (e) {
      setEtapa(null)
      setError(e.status === 422 && /Cuota/.test(e.titulo) ? 'Tu carpeta está llena: admite 20 documentos y 200 MB.' : e.message)
    }
  }

  return (
    <section className="contenedor estrecho" aria-labelledby="t-subir">
      <a className="volver" href="#carpeta"><ArrowLeft size={20} strokeWidth={1.75} aria-hidden="true" /> Mi carpeta</a>
      <h1 id="t-subir">Subir documento</h1>
      <p className="guia">Quedará como documento temporal hasta que pidas su autenticación.</p>
      {error && <Aviso tipo="peligro" titulo="No pudimos guardar el documento">{error}</Aviso>}
      <form onSubmit={enviar} noValidate className="formulario">
        <div className="campo">
          <label htmlFor="titulo">Nombre del documento</label>
          <input id="titulo" value={titulo} maxLength={120} onChange={(e) => setTitulo(e.target.value)} placeholder="Diploma de bachiller" />
        </div>
        <div className="campo">
          <label htmlFor="archivo">Archivo</label>
          <p id="archivo-ayuda" className="ayuda">PDF, JPG o PNG de hasta 10 MB.</p>
          <input id="archivo" type="file" accept=".pdf,.jpg,.jpeg,.png" aria-describedby="archivo-ayuda" onChange={(e) => setArchivo(e.target.files[0] ?? null)} />
        </div>
        {etapa && <p className="cargando" role="status">{ETAPAS[etapa]}</p>}
        <button type="submit" className="btn primario" disabled={!!etapa}>
          <Upload size={20} strokeWidth={1.75} aria-hidden="true" /> Guardar en mi carpeta
        </button>
      </form>
    </section>
  )
}
