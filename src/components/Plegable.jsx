// Contenido que sigue estando pero no compite por atención en la exposición.
// Fuera de la vista comprimida se muestra tal cual, sin envoltorio.
export default function Plegable({ titulo, comprimido, children }) {
  if (!comprimido) return <>{children}</>
  return (
    <details className="fold">
      <summary>{titulo}</summary>
      <div className="fold-in">{children}</div>
    </details>
  )
}
