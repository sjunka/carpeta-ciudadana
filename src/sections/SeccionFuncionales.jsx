import { useMemo, useState } from 'react'
import Section from '../components/Section.jsx'
import DataTable from '../components/DataTable.jsx'
import FilterBar from '../components/FilterBar.jsx'
import Badge, { Prioridad } from '../components/Badge.jsx'
import Nota from '../components/Nota.jsx'
import datos from '../content/requerimientos-funcionales.json'

const FILTROS = [
  { id: 'todos', texto: 'Todos', pasa: () => true },
  { id: 'alta', texto: 'Solo prioridad alta', pasa: (r) => r.prioridad === 'Alta' },
  { id: 'abierto', texto: 'Con asunción o bloqueo', pasa: (r) => Boolean(r.marca) },
]

const COLUMNAS = [
  { clave: 'id', cabecera: 'ID', ancho: '82px', clase: 'id' },
  { clave: 'nombre', cabecera: 'Requerimiento', ancho: '210px', clase: 'nm' },
  {
    clave: 'descripcion',
    cabecera: 'Descripción',
    celda: (r) => (
      <>
        {r.descripcion}
        {r.marca && (
          <>
            {' '}
            <Badge tipo={r.marca.tipo} />
            <Nota>{r.marca.ref ? `${r.marca.ref} · ${r.marca.nota}` : r.marca.nota}</Nota>
          </>
        )}
      </>
    ),
  },
  { clave: 'prioridad', cabecera: 'Prioridad', ancho: '86px', celda: (r) => <Prioridad valor={r.prioridad} /> },
]

export default function SeccionFuncionales({ meta }) {
  const [filtro, setFiltro] = useState('todos')
  const pasa = FILTROS.find((f) => f.id === filtro).pasa

  const { dominios, total, visibles } = useMemo(() => {
    const dominios = datos.dominios.map((d) => ({
      ...d,
      requerimientos: d.requerimientos.filter(pasa),
    }))
    return {
      dominios,
      total: datos.dominios.reduce((n, d) => n + d.requerimientos.length, 0),
      visibles: dominios.reduce((n, d) => n + d.requerimientos.length, 0),
    }
  }, [pasa])

  return (
    <Section meta={meta}>
      <FilterBar
        opciones={FILTROS}
        activa={filtro}
        onCambio={setFiltro}
        resumen={`${visibles} de ${total} visibles`}
      />
      {dominios.map((d) =>
        d.requerimientos.length === 0 ? null : (
          <div key={d.id}>
            <h3 className="dom">
              {d.id} · {d.nombre} <span>— {d.intro}</span>
            </h3>
            <DataTable columnas={COLUMNAS} filas={d.requerimientos} claveFila={(r) => r.id}
              claseFila={(r) => (r.marca ? (r.marca.tipo === 'bloqueo' ? 'block' : 'asum') : undefined)} />
          </div>
        ),
      )}
    </Section>
  )
}
