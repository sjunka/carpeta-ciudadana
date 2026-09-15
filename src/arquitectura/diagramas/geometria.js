// Geometría compartida por el renderer (Diagrama.jsx) y el validador (check.mjs):
// una sola función decide por dónde va cada flecha, así lo que se valida es lo que se dibuja.
export const NW = 160
export const NH = 64

export const caja = (n) => ({ x: n.x, y: n.y, w: n.w ?? NW, h: n.h ?? NH })

const r4 = (v) => Math.round(v / 4) * 4

// Ruta ortogonal por defecto: recta si las cajas se solapan en un eje, en L si no.
export function ruta(a, b) {
  const A = caja(a)
  const B = caja(b)
  const y0 = Math.max(A.y, B.y)
  const y1 = Math.min(A.y + A.h, B.y + B.h)
  if (y0 < y1) {
    const y = r4((y0 + y1) / 2)
    return B.x > A.x ? [[A.x + A.w, y], [B.x, y]] : [[A.x, y], [B.x + B.w, y]]
  }
  const x0 = Math.max(A.x, B.x)
  const x1 = Math.min(A.x + A.w, B.x + B.w)
  if (x0 < x1) {
    const x = r4((x0 + x1) / 2)
    return B.y > A.y ? [[x, A.y + A.h], [x, B.y]] : [[x, A.y], [x, B.y + B.h]]
  }
  const ay = A.y + A.h / 2
  const bx = B.x + B.w / 2
  return [[B.x > A.x ? A.x + A.w : A.x, ay], [bx, ay], [bx, B.y > A.y ? B.y : B.y + B.h]]
}

export const puntosDe = (f, porId) => f.puntos ?? ruta(porId[f.de], porId[f.a])

export function tramoLargo(p) {
  let i = 0
  let largo = -1
  for (let k = 0; k < p.length - 1; k++) {
    const l = Math.abs(p[k + 1][0] - p[k][0]) + Math.abs(p[k + 1][1] - p[k][1])
    if (l > largo) [i, largo] = [k, l]
  }
  return [p[i], p[i + 1]]
}

export function enBorde([x, y], n) {
  const c = caja(n)
  const enX = x >= c.x && x <= c.x + c.w
  const enY = y >= c.y && y <= c.y + c.h
  return (enX && (y === c.y || y === c.y + c.h)) || (enY && (x === c.x || x === c.x + c.w))
}

// Secuencia: columnas y filas fijas, el JSON solo da el orden.
export const SEQ = { paso: 216, x0: 40, cabezaY: 40, cabezaH: 56, y0: 152, dy: 56 }
export const seqAncho = (n) => SEQ.x0 * 2 + n * SEQ.paso - 40
export const seqAlto = (m) => SEQ.y0 + m * SEQ.dy + 56
export const seqX = (i) => SEQ.x0 + i * SEQ.paso + 88

// Mapa de historias: columnas por actividad, corte entre implementadas y diseñadas.
export const MAPA = { x0: 40, paso: 208, colW: 192, cabezaY: 40, cabezaH: 48, y0: 112, dy: 60, cartaH: 48 }
