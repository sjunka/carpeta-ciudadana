import { Download } from 'lucide-react'
import meta from '../content/meta.json'

// Descargar PDF. El archivo vive en public/ y se nombra en meta.json.
export default function DescargarPdf() {
  const archivo = meta.pdf?.archivo
  if (!archivo) return null

  return (
    <a
      className="tema"
      href={`${import.meta.env?.BASE_URL ?? '/'}${archivo}`}
      download
      aria-label={meta.pdf.aria}
    >
      <Download size={20} strokeWidth={1.75} aria-hidden="true" />
      <span>{meta.pdf.texto}</span>
    </a>
  )
}
