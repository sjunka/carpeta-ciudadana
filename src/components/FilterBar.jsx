export default function FilterBar({ opciones, activa, onCambio, resumen }) {
  return (
    <div className="filter">
      <span className="lab">Filtrar</span>
      {opciones.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={activa === o.id}
          onClick={() => onCambio(o.id)}
        >
          {o.texto}
        </button>
      ))}
      <span className="count">{resumen}</span>
    </div>
  )
}
