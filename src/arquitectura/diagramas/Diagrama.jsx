import {
  caja, puntosDe, tramoLargo, SEQ, seqAncho, seqAlto, seqX, MAPA,
} from './geometria.js'
import historias from '../content/historias.json'

// Un solo renderer para los cuatro tipos de diagrama de A2. Todo sale del JSON:
// aquí no hay texto propio. Los grupos st1…stN los usa DiagramFrame para ir por pasos.

const anchoTexto = (lineas) => Math.max(...lineas.map((t) => t.length)) * 6 + 12

function Etiqueta({ a, b, lineas, acento }) {
  const w = anchoTexto(lineas)
  const h = lineas.length * 12 + 6
  const clase = (i) => (i === 0 ? `alab${acento ? ' ac' : ''}` : 'op')
  if (a[1] === b[1]) {
    const cx = (a[0] + b[0]) / 2
    const y = a[1] - 8 - h
    return (
      <>
        <rect x={cx - w / 2} y={y} width={w} height={h} rx="2" className="bg" />
        {lineas.map((t, i) => (
          <text key={i} x={cx} y={y + 12 + 12 * i} className={clase(i)}>{t}</text>
        ))}
      </>
    )
  }
  const x = a[0] + 8
  const y = (a[1] + b[1]) / 2 - h / 2
  return (
    <>
      <rect x={x} y={y} width={w} height={h} rx="2" className="bg" />
      {lineas.map((t, i) => (
        <text key={i} x={x + 6} y={y + 12 + 12 * i} className={`${clase(i)} lft`}>{t}</text>
      ))}
    </>
  )
}

const trazo = (p) => 'M ' + p.map((q) => q.join(',')).join(' L ')

function Flecha({ id, puntos, lineas, acento, st }) {
  const [a, b] = tramoLargo(puntos)
  return (
    <g className={`st${st}`}>
      <path pathLength="1" className={`ap ${acento ? 'ln-a' : 'ln-m'}`} d={trazo(puntos)} markerEnd={`url(#${id}-${acento ? 'a' : 'm'})`} />
      <Etiqueta a={a} b={b} lineas={lineas} acento={acento} />
    </g>
  )
}

function Marcadores({ id }) {
  return (
    <defs>
      <marker id={`${id}-m`} markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" className="mk-m" /></marker>
      <marker id={`${id}-a`} markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" className="mk-a" /></marker>
    </defs>
  )
}

function Leyenda({ y, w, items }) {
  let x = 128
  return (
    <>
      <line x1="40" y1={y} x2={w - 40} y2={y} className="hair" />
      <text x="40" y={y + 16} className="lgd-t">LEYENDA</text>
      {items.map(([clase, texto]) => {
        const x0 = x
        x += 48 + texto.length * 6 + 32
        return (
          <g key={texto}>
            {clase === 'n-ext'
              ? <rect x={x0} y={y + 6} width="32" height="12" rx="2" className="n-ext" />
              : <line x1={x0} y1={y + 12} x2={x0 + 32} y2={y + 12} className={clase} />}
            <text x={x0 + 40} y={y + 16} className="lgd">{texto}</text>
          </g>
        )
      })}
    </>
  )
}

function Svg({ d, w, h, children }) {
  return (
    <svg className="dd" viewBox={`0 0 ${w} ${h}`} role="img" aria-labelledby={`${d.id}-t ${d.id}-d`}>
      <title id={`${d.id}-t`}>{d.titulo}</title>
      <desc id={`${d.id}-d`}>{d.pasos.join(' ')}</desc>
      <Marcadores id={d.id} />
      <rect width="100%" height="100%" className="bg" />
      {children}
    </svg>
  )
}

function Nodo({ n, icono = true }) {
  const c = caja(n)
  const cx = c.x + c.w / 2
  return (
    <g>
      <rect x={c.x} y={c.y} width={c.w} height={c.h} rx="4" className={n.externo ? 'n-ext' : `n-sys${n.acento ? ' n-ac' : ''}`} />
      {icono && !n.externo && (
        <g className="uml">
          <rect x={c.x + c.w - 22} y={c.y + 8} width="14" height="16" rx="1" />
          <rect x={c.x + c.w - 26} y={c.y + 11} width="8" height="4" />
          <rect x={c.x + c.w - 26} y={c.y + 17} width="8" height="4" />
        </g>
      )}
      <text x={cx} y={c.y + (n.sub ? 28 : 36)} className="nname">{n.nombre}</text>
      {n.sub && <text x={cx} y={c.y + 46} className="nsub">{n.sub}</text>}
    </g>
  )
}

function Componentes({ d }) {
  const porId = Object.fromEntries(d.nodos.map((n) => [n.id, n]))
  return (
    <Svg d={d} w={d.w} h={d.h}>
      {d.nodos.map((n) => <Nodo key={n.id} n={n} icono={d.iconos !== false} />)}
      {d.flechas.map((f, i) => (
        <Flecha key={i} id={d.id} puntos={puntosDe(f, porId)} lineas={[f.datos]} acento={f.acento} st={f.st} />
      ))}
      <Leyenda y={d.h - 40} w={d.w} items={d.leyenda ?? [['ln-m', 'Dependencia'], ['ln-a', 'Tramo crítico'], ['n-ext', 'Sistema externo']]} />
    </Svg>
  )
}

function Despliegue({ d }) {
  const porId = Object.fromEntries(d.nodos.map((n) => [n.id, n]))
  return (
    <Svg d={d} w={d.w} h={d.h}>
      {d.zonas.map((z) => (
        <g key={z.id}>
          <rect x={z.x} y={z.y} width={z.w} height={z.h} rx="8" className="zone" />
          <text x={z.x + 12} y={z.y + 20} className="zlab">{z.nombre}</text>
        </g>
      ))}
      {d.nodos.map((n) => (
        <g key={n.id}>
          <rect x={n.x} y={n.y} width={n.w} height={n.h} rx="4" className="n-sys" />
          <text x={n.x + n.w / 2} y={n.y + 24} className="nname">{n.nombre}</text>
          <text x={n.x + n.w / 2} y={n.y + 40} className="nsub">{n.tecnologia}</text>
          {n.artefactos.map((a, i) => (
            <g key={a}>
              <rect x={n.x + 16} y={n.y + 54 + i * 20} width="8" height="10" rx="1" className="tag-ext" />
              <text x={n.x + 30} y={n.y + 63 + i * 20} className="lgd">{a}</text>
            </g>
          ))}
        </g>
      ))}
      {d.rutas.map((r, i) => (
        <Flecha key={i} id={d.id} puntos={puntosDe(r, porId)} lineas={[r.protocolo, r.formato]} acento={r.acento} st={r.st} />
      ))}
      <Leyenda y={d.h - 40} w={d.w} items={[['ln-m', 'Ruta de red'], ['ln-a', 'Tramo crítico']]} />
    </Svg>
  )
}

function Secuencia({ d }) {
  const col = Object.fromEntries(d.lineas.map((l, i) => [l.id, i]))
  const w = seqAncho(d.lineas.length)
  const h = seqAlto(d.mensajes.length)
  const fondo = h - 56
  return (
    <Svg d={d} w={w} h={h}>
      {d.lineas.map((l, i) => {
        const x = seqX(i)
        return (
          <g key={l.id}>
            <line x1={x} y1={SEQ.cabezaY + SEQ.cabezaH} x2={x} y2={fondo} className="hair" />
            <rect x={x - 88} y={SEQ.cabezaY} width="176" height={SEQ.cabezaH} rx="4" className={l.propio ? 'n-sys' : 'n-ext'} />
            <text x={x} y={SEQ.cabezaY + 24} className="nname">{l.nombre}</text>
            <text x={x} y={SEQ.cabezaY + 42} className="nsub">{l.sub}</text>
          </g>
        )
      })}
      {d.mensajes.map((m, k) => {
        const y = SEQ.y0 + k * SEQ.dy
        const x1 = seqX(col[m.de])
        const lineas = [m.datos, m.op]
        if (m.de === m.a) {
          const p = [[x1, y - 12], [x1 + 40, y - 12], [x1 + 40, y + 8], [x1 + 8, y + 8]]
          return (
            <g key={k} className={`st${m.paso}`}>
              <path pathLength="1" className={`ap ${m.acento ? 'ln-a' : 'ln-m'}`} d={trazo(p)} markerEnd={`url(#${d.id}-${m.acento ? 'a' : 'm'})`} />
              <Etiqueta a={[x1 + 40, y - 36]} b={[x1 + 40, y + 20]} lineas={lineas} acento={m.acento} />
              <text x={x1 - 12} y={y + 3} className="tag">{k + 1}</text>
            </g>
          )
        }
        const x2 = seqX(col[m.a])
        const s = Math.sign(x2 - x1)
        return (
          <g key={k} className={`st${m.paso}`}>
            <path pathLength="1" className={`ap ${m.acento ? 'ln-a' : 'ln-m'}`} d={`M ${x1},${y} H ${x2 - 8 * s}`} markerEnd={`url(#${d.id}-${m.acento ? 'a' : 'm'})`} />
            <Etiqueta a={[x1, y]} b={[x2, y]} lineas={lineas} acento={m.acento} />
            <circle cx={x1 + 12 * s} cy={y} r="9" className="bg" />
            <circle cx={x1 + 12 * s} cy={y} r="9" className="n-sys" />
            <text x={x1 + 12 * s} y={y + 3} className="tag">{k + 1}</text>
          </g>
        )
      })}
      <Leyenda y={h - 40} w={w} items={[['ln-m', 'Mensaje'], ['ln-a', 'Tramo crítico'], ['n-ext', 'Fuera del operador']]} />
    </Svg>
  )
}

const estado = Object.fromEntries(historias.historias.map((h) => [h.id, h]))

function MapaHistorias({ d }) {
  const cols = d.actividades.map((a) => ({
    ...a,
    impl: a.historias.filter((id) => estado[id].estado === 'Implementada'),
    dis: a.historias.filter((id) => estado[id].estado !== 'Implementada'),
  }))
  const maxI = Math.max(...cols.map((c) => c.impl.length))
  const maxD = Math.max(...cols.map((c) => c.dis.length))
  const corte = MAPA.y0 + maxI * MAPA.dy + 4
  const y1 = corte + 24
  const w = MAPA.x0 * 2 + cols.length * MAPA.paso - 16
  const h = y1 + maxD * MAPA.dy + 56
  const carta = (id, x, y) => (
    <g key={id}>
      <rect x={x} y={y} width={MAPA.colW} height={MAPA.cartaH} rx="4" className="uc" />
      <text x={x + MAPA.colW / 2} y={y + 18} className="uct">{id}</text>
      <text x={x + MAPA.colW / 2} y={y + 36} className="ucn sm">{estado[id].titulo}</text>
    </g>
  )
  return (
    <Svg d={d} w={w} h={h}>
      <line x1="24" y1={corte} x2={w - 24} y2={corte} className="bnd-auto" />
      <rect x={w - 184} y={corte - 8} width="160" height="16" className="bg" />
      <text x={w - 104} y={corte + 3} className="bnd-lab auto">{d.corte}</text>
      {cols.map((c, i) => {
        const x = MAPA.x0 + i * MAPA.paso
        return (
          <g key={c.nombre} className={`st${i + 1}`}>
            <rect x={x} y={MAPA.cabezaY} width={MAPA.colW} height={MAPA.cabezaH} rx="4" className="n-sys" />
            <text x={x + MAPA.colW / 2} y={MAPA.cabezaY + 29} className="nname">{c.nombre}</text>
            {c.impl.map((id, k) => carta(id, x, MAPA.y0 + k * MAPA.dy))}
            {c.dis.map((id, k) => carta(id, x, y1 + k * MAPA.dy))}
          </g>
        )
      })}
      <text x="40" y={h - 20} className="lgd">Arriba del corte: implementadas en el prototipo. Abajo: diseñadas.</text>
    </Svg>
  )
}

const TIPOS = { componentes: Componentes, despliegue: Despliegue, secuencia: Secuencia, 'mapa-historias': MapaHistorias }

export default function Diagrama({ d }) {
  const Tipo = TIPOS[d.tipo]
  return <Tipo d={d} />
}
