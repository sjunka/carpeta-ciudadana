import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion'
import Diagrama from '../src/arquitectura/diagramas/Diagrama.jsx'
import { SEQ, seqAncho, seqAlto, seqX } from '../src/arquitectura/diagramas/geometria.js'
import datos from '../src/arquitectura/content/secuencias.json'
import '../src/styles/tokens.css'
import '../src/styles/diagrams.css'
import '../src/arquitectura/arquitectura.css'

// Los colores salen de tokens.css (tema claro): el video no define paleta propia.
export const FPS = 30
const INTRO = 2.5 * FPS
const PASO = 3.5 * FPS
const CIERRE = 4.5 * FPS
const AREA = { x: 40, y: 112, w: 1200, h: 456 }
const EASE = Easing.bezier(0.16, 1, 0.3, 1)
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const

type Mensaje = { de: string; a: string; paso: number; acento?: boolean }
type Secuencia = {
  id: string; titulo: string; hu: string; introduccion: string; cierre: string
  lineas: { id: string }[]; mensajes: Mensaje[]; pasos: string[]
}

const buscar = (id: string) => (datos.secuencias as Secuencia[]).find((s) => s.id === id)!
const nPasos = (s: Secuencia) => Math.max(...s.mensajes.map((m) => m.paso))
export const duracion = (s: Secuencia) => INTRO + nPasos(s) * PASO + CIERRE

// Cámara: encuadra los mensajes de un paso (paso 0 = diagrama completo).
function camara(s: Secuencia, paso: number) {
  const w = seqAncho(s.lineas.length)
  const h = seqAlto(s.mensajes.length)
  const col = Object.fromEntries(s.lineas.map((l, i) => [l.id, i]))
  let caja = { x: 0, y: 0, w, h }
  if (paso > 0) {
    const ks = s.mensajes.map((m, k) => [m, k] as const).filter(([m]) => m.paso === paso)
    const xs = ks.flatMap(([m]) => [seqX(col[m.de]), seqX(col[m.a])])
    const y0 = SEQ.y0 + ks[0][1] * SEQ.dy - 48
    const y1 = SEQ.y0 + ks[ks.length - 1][1] * SEQ.dy + 32
    caja = { x: Math.min(...xs) - 120, y: Math.min(y0, SEQ.cabezaY), w: Math.max(...xs) - Math.min(...xs) + 240, h: y1 - Math.min(y0, SEQ.cabezaY) }
  }
  const escala = Math.min(1.6, AREA.w / caja.w, AREA.h / caja.h)
  return {
    escala,
    x: AREA.x + AREA.w / 2 - (caja.x + caja.w / 2) * escala,
    y: AREA.y + AREA.h / 2 - (caja.y + caja.h / 2) * escala,
  }
}

export const Operacion = ({ id }: { id: string }) => {
  const frame = useCurrentFrame()
  const s = buscar(id)
  const n = nPasos(s)
  const w = seqAncho(s.lineas.length)
  const h = seqAlto(s.mensajes.length)

  // Paso activo en función del tiempo; al cierre vuelve al diagrama completo.
  const t = frame - INTRO
  const activo = t < 0 ? 0 : Math.min(n, Math.floor(t / PASO) + 1)
  const enCierre = t >= n * PASO
  const destino = enCierre ? camara(s, 0) : camara(s, activo)
  const origen = enCierre ? camara(s, n) : camara(s, Math.max(0, activo - 1))
  const inicioTramo = enCierre ? INTRO + n * PASO : INTRO + (activo - 1) * PASO
  const k = activo === 0 ? 1 : interpolate(frame, [inicioTramo, inicioTramo + 0.8 * FPS], [0, 1], { ...clamp, easing: EASE })
  const cam = {
    escala: origen.escala + (destino.escala - origen.escala) * k,
    x: origen.x + (destino.x - origen.x) * k,
    y: origen.y + (destino.y - origen.y) * k,
  }

  // Cada grupo stN aparece cuando le toca; los pasos ya vistos quedan visibles.
  const reglas = Array.from({ length: n }, (_, i) => {
    const desde = INTRO + i * PASO
    const o = interpolate(frame, [desde, desde + 0.6 * FPS], [0, 1], clamp)
    return `.video-seq .st${i + 1}{opacity:${o}}`
  }).join('') + '.video-seq .dd{min-width:0}' // el sitio fija 900px; la cámara necesita encoger

  const texto = enCierre ? s.cierre : activo === 0 ? s.introduccion : s.pasos[activo - 1]
  const cambio = enCierre ? INTRO + n * PASO : activo === 0 ? 0 : INTRO + (activo - 1) * PASO
  const opTexto = interpolate(frame, [cambio, cambio + 0.5 * FPS], [0, 1], clamp)

  return (
    <AbsoluteFill style={{ background: 'var(--canvas-soft)', fontFamily: 'Inter, system-ui, sans-serif', color: 'var(--ink)' }}>
      <style>{reglas}</style>
      <div style={{ position: 'absolute', left: 40, top: 28, right: 40, display: 'flex', alignItems: 'baseline', gap: 20 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 600, color: 'var(--primary-text)' }}>{s.hu}</span>
        <span style={{ fontSize: 44, fontWeight: 700, letterSpacing: '-0.01em' }}>{s.titulo}</span>
        <span style={{ marginLeft: 'auto', fontSize: 22, color: 'var(--ink-muted)' }}>
          {enCierre || activo === 0 ? 'Mi Carpeta Segura' : `Paso ${activo} de ${n}`}
        </span>
      </div>

      <div style={{ position: 'absolute', left: AREA.x, top: AREA.y, width: AREA.w, height: AREA.h, overflow: 'hidden', borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--hairline)' }}>
        <div className="video-seq" style={{ position: 'absolute', left: cam.x - AREA.x, top: cam.y - AREA.y, width: w * cam.escala, height: h * cam.escala }}>
          <Diagrama d={s} />
        </div>
      </div>

      <div style={{ position: 'absolute', left: 40, right: 40, top: 592, height: 100, display: 'flex', alignItems: 'center', opacity: opTexto }}>
        <p style={{ margin: 0, fontSize: 30, lineHeight: 1.35, fontWeight: enCierre ? 600 : 400 }}>{texto}</p>
      </div>
    </AbsoluteFill>
  )
}
