// Tabla genérica. `columnas` define ancho, cabecera y cómo se pinta cada celda.
// Añadir una columna es añadir un objeto aquí, no tocar el marcado.
export default function DataTable({ columnas, filas, ancha = false, claveFila, claseFila }) {
  return (
    <div className="tw">
      <table className={ancha ? 'wide' : undefined}>
        <thead>
          <tr>
            {columnas.map((c) => (
              <th key={c.clave} style={c.ancho ? { width: c.ancho } : undefined}>
                {c.cabecera}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((fila, i) => (
            <tr key={claveFila ? claveFila(fila) : i} className={claseFila?.(fila)}>
              {columnas.map((c) => (
                <td key={c.clave} className={c.clase}>
                  {c.celda ? c.celda(fila) : fila[c.clave]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
