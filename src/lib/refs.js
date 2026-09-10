import rf from '../content/requerimientos-funcionales.json'
import rnf from '../content/requerimientos-no-funcionales.json'
import restr from '../content/restricciones.json'

// Índice de identificadores → qué es cada uno. Sirve para que una lista de trazabilidad
// se pueda leer sin volver a la tabla de origen.
const indice = new Map()

for (const d of rf.dominios) {
  indice.set(d.id, `Dominio funcional · ${d.nombre} — ${d.requerimientos.length} RF`)
  for (const r of d.requerimientos) indice.set(r.id, `${r.nombre} — prioridad ${r.prioridad}`)
}
for (const r of rnf.requerimientos) indice.set(r.id, `${r.atributo} · ${r.requerimiento}`)
for (const r of restr.restricciones.filas) indice.set(r.id, `${r.nombre} — ${r.fuente}`)
for (const r of restr.inversos.filas) indice.set(r.id, `El sistema no debe: ${r.nombre}`)

export const buscarRef = (id) => indice.get(id)

// RF-01, RF-01.10, RNF-30, RD-02, RI-08.
export const PATRON = /\b(?:RF|RNF|RD|RI)-\d{2}(?:\.\d{1,2})?\b/g
