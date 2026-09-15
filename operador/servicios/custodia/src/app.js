import express from 'express'
import { randomUUID } from 'node:crypto'

export const TIPOS = ['application/pdf', 'image/jpeg', 'image/png']
export const MAX_ARCHIVO = 10 * 1024 * 1024
export const CUOTA = { documentos: 20, bytes: 200 * 1024 * 1024 } // RNF-24

const problema = (res, status, title, detail) =>
  res.status(status).type('application/problem+json').json({ type: 'about:blank', title, status, detail })

const log = (nivel, mensaje, extra = {}) => console.log(JSON.stringify({ nivel, mensaje, ...extra }))

const aDocumento = (f) => ({
  id: f.id, titulo: f.titulo, tipo: f.tipo, tamano: Number(f.tamano), sha256: f.sha256, estado: f.estado,
  autenticacion: f.autenticado_en ? { fecha: f.autenticado_en, respuesta: f.respuesta_centralizador } : undefined,
  creado: f.creado,
})

export function validarSolicitud({ titulo, tipo, tamano } = {}) {
  if (typeof titulo !== 'string' || !titulo.trim() || titulo.length > 120) return [422, 'El título es obligatorio y tiene máximo 120 caracteres']
  if (!TIPOS.includes(tipo)) return [415, 'Solo se aceptan PDF, JPG o PNG']
  if (!Number.isInteger(tamano) || tamano <= 0) return [422, 'Tamaño inválido']
  if (tamano > MAX_ARCHIVO) return [413, 'El archivo supera 10 MB']
  return null
}

// dependencias: db (query), verificar(token) → claims, almacen (urlCarga, urlLectura, cabecera, sha256, borrar), pasarela (autenticar)
export function crearApp({ db, verificar, almacen, pasarela, origenes = [] }) {
  const app = express()
  app.use((req, res, next) => {
    const o = req.headers.origin
    if (o && origenes.includes(o)) {
      res.set({ 'access-control-allow-origin': o, 'access-control-allow-headers': 'authorization, content-type', vary: 'origin' })
    }
    req.method === 'OPTIONS' ? res.sendStatus(204) : next()
  })
  app.use(express.json({ limit: '2kb' }))

  app.get('/salud', (_req, res) => res.json({ estado: 'ok' }))

  app.use(async (req, res, next) => {
    const token = /^Bearer (.+)$/.exec(req.headers.authorization ?? '')?.[1]
    if (!token) return problema(res, 401, 'Sesión requerida')
    try {
      const c = await verificar(token)
      if (c.azp !== 'portal' || !c.preferred_username || !c.cedula) return problema(res, 401, 'Token no válido para custodia')
      req.titular = { cuenta: c.preferred_username, cedula: c.cedula }
      next()
    } catch {
      problema(res, 401, 'Sesión inválida o expirada')
    }
  })

  // Carga un documento del titular o responde 403/404. La verificación de dueño va en la consulta.
  async function propio(req, res) {
    if (!/^[0-9a-f-]{36}$/.test(req.params.id)) { problema(res, 404, 'Documento no encontrado'); return null }
    const { rows } = await db.query('SELECT * FROM documentos WHERE id = $1', [req.params.id])
    if (!rows[0]) { problema(res, 404, 'Documento no encontrado'); return null }
    if (rows[0].titular !== req.titular.cuenta) { problema(res, 403, 'El documento no es tuyo'); return null }
    return rows[0]
  }

  app.get('/documentos', async (req, res, next) => {
    try {
      const { rows } = await db.query('SELECT * FROM documentos WHERE titular = $1 ORDER BY creado DESC', [req.titular.cuenta])
      res.json(rows.map(aDocumento))
    } catch (e) { next(e) }
  })

  app.post('/documentos', async (req, res, next) => {
    const invalido = validarSolicitud(req.body)
    if (invalido) return problema(res, ...invalido)
    try {
      const { rows: [uso] } = await db.query(
        'SELECT count(*)::int AS n, coalesce(sum(tamano), 0)::bigint AS bytes FROM documentos WHERE titular = $1', [req.titular.cuenta])
      if (uso.n >= CUOTA.documentos || Number(uso.bytes) + req.body.tamano > CUOTA.bytes) {
        return problema(res, 422, 'Cuota llena', 'Tu carpeta admite 20 documentos y 200 MB')
      }
      const id = randomUUID()
      const clave = `${req.titular.cuenta}/${id}`
      await db.query(
        `INSERT INTO documentos (id, titular, clave, titulo, tipo, tamano, estado) VALUES ($1, $2, $3, $4, $5, $6, 'pendiente')`,
        [id, req.titular.cuenta, clave, req.body.titulo.trim(), req.body.tipo, req.body.tamano])
      res.status(201).json({ id, urlCarga: await almacen.urlCarga(clave, req.body.tipo) })
    } catch (e) { next(e) }
  })

  app.post('/documentos/:id/confirmacion', async (req, res, next) => {
    try {
      const doc = await propio(req, res)
      if (!doc) return
      if (doc.estado !== 'pendiente') return res.json(aDocumento(doc))
      const cab = await almacen.cabecera(doc.clave)
      if (!cab || cab.tamano !== Number(doc.tamano) || cab.tipo !== doc.tipo) {
        if (cab) await almacen.borrar(doc.clave)
        await db.query('DELETE FROM documentos WHERE id = $1', [doc.id])
        return problema(res, 422, 'El archivo no coincide', 'El tamaño o el tipo subido no coinciden con lo declarado')
      }
      const sha256 = await almacen.sha256(doc.clave)
      const { rows } = await db.query(
        `UPDATE documentos SET estado = 'cargado', sha256 = $2 WHERE id = $1 RETURNING *`, [doc.id, sha256])
      res.json(aDocumento(rows[0]))
    } catch (e) { next(e) }
  })

  app.post('/documentos/:id/autenticacion', async (req, res, next) => {
    try {
      const doc = await propio(req, res)
      if (!doc) return
      if (doc.estado === 'pendiente') return problema(res, 409, 'El documento aún no está cargado')
      const url = await almacen.urlLectura(doc.clave) // RI-01: viaja la URL, nunca el documento
      let r
      try {
        r = await pasarela.autenticar({ idCiudadano: req.titular.cedula, url, titulo: doc.titulo })
      } catch (e) {
        log('warn', 'autenticación rechazada', { documento: doc.id, detalle: e.message })
        return problema(res, 502, 'El centralizador no autenticó el documento', e.message)
      }
      const { rows } = await db.query(
        `UPDATE documentos SET estado = 'autenticado', autenticado_en = now(), respuesta_centralizador = $2 WHERE id = $1 RETURNING *`,
        [doc.id, r.respuesta])
      res.json(aDocumento(rows[0]))
    } catch (e) { next(e) }
  })

  app.use((err, _req, res, _next) => {
    log('error', err.message)
    problema(res, 500, 'Error interno')
  })
  return app
}
