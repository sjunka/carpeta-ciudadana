import express from 'express'
import { timingSafeEqual } from 'node:crypto'
import { cuentaInstitucional, validarRegistro, cedulaEnmascarada } from './cuenta.js'

const problema = (res, status, title, detail) =>
  res.status(status).type('application/problem+json').json({ type: 'about:blank', title, status, detail })

const log = (nivel, mensaje, extra = {}) => console.log(JSON.stringify({ nivel, mensaje, ...extra }))

// ponytail: límite por IP en memoria de la instancia; pasar a Cloud Armor en la arquitectura objetivo.
export function crearLimite({ max = 5, ventanaMs = 3_600_000, ahora = Date.now } = {}) {
  const hits = new Map()
  return (ip) => {
    const t = ahora()
    const lista = (hits.get(ip) ?? []).filter((x) => t - x < ventanaMs)
    lista.push(t)
    hits.set(ip, lista)
    return lista.length <= max
  }
}

// dependencias: db (query), pasarela (consultar, registrar), keycloak (existe, crearDeshabilitado, habilitar, borrar)
// ponytail: clave compartida entre servicios; en Cloud Run se sustituye por ID token de Google (run.invoker).
const claveValida = (dada, esperada) =>
  !!esperada && typeof dada === 'string' && dada.length === esperada.length && timingSafeEqual(Buffer.from(dada), Buffer.from(esperada))

export function crearApp({ db, pasarela, keycloak, limite = crearLimite(), origenes = [], claveInterna }) {
  const app = express()
  app.set('trust proxy', true)
  app.use((req, res, next) => {
    const o = req.headers.origin
    if (o && origenes.includes(o)) {
      res.set({ 'access-control-allow-origin': o, 'access-control-allow-headers': 'content-type', vary: 'origin' })
    }
    req.method === 'OPTIONS' ? res.sendStatus(204) : next()
  })
  app.use(express.json({ limit: '4kb' }))

  app.get('/salud', (_req, res) => res.json({ estado: 'ok' }))

  app.post('/ciudadanos', async (req, res, next) => {
    const errores = validarRegistro(req.body)
    if (errores.length) return problema(res, 400, 'Datos inválidos', `Revisa: ${errores.join(', ')}`)
    if (!limite(req.ip)) return problema(res, 429, 'Demasiados registros', 'Intenta de nuevo en una hora')

    const d = req.body
    const cedula = cedulaEnmascarada(d.cedula)
    try {
      // B-06: la verificación de identidad contra la Registraduría se simula en el prototipo.
      let afiliacion
      try {
        afiliacion = await pasarela.consultar(d.cedula)
      } catch (e) {
        await db.query(
          `INSERT INTO ciudadanos (cedula, estado) VALUES ($1, 'pendiente') ON CONFLICT (cedula) DO NOTHING`, [d.cedula])
        log('warn', 'centralizador no disponible; registro pendiente', { cedula })
        return problema(res, 503, 'Centralizador no disponible', 'No podemos confirmar que no estés afiliado a otro operador. Intenta más tarde.')
      }
      if (afiliacion.afiliado) {
        return problema(res, 409, 'Ya estás afiliado', `El centralizador te reporta en el operador ${afiliacion.operador ?? 'otro operador'}.`)
      }

      let cuenta
      for (let i = 0; i < 5; i++) {
        cuenta = cuentaInstitucional(d, i)
        if (!(await keycloak.existe(cuenta))) break
      }
      const idUsuario = await keycloak.crearDeshabilitado({ ...d, cuenta })
      try {
        await pasarela.registrar({ id: d.cedula, nombre: `${d.nombre} ${d.apellido}`, direccion: d.direccion, correo: cuenta })
      } catch (e) {
        await keycloak.borrar(idUsuario) // compensación: sin registro central no hay cuenta
        log('warn', 'registro central rechazado; usuario compensado', { cedula, detalle: e.message })
        return problema(res, e.status === 503 ? 503 : 502, 'El centralizador no registró la afiliación', e.message)
      }
      await keycloak.habilitar(idUsuario)
      await db.query(
        `INSERT INTO ciudadanos (cedula, cuenta, estado, direccion) VALUES ($1, $2, 'afiliado', $3)
         ON CONFLICT (cedula) DO UPDATE SET cuenta = $2, estado = 'afiliado', direccion = $3`, [d.cedula, cuenta, d.direccion])
      log('info', 'ciudadano afiliado', { cedula })
      res.status(201).json({ cedula: d.cedula, cuenta, estado: 'afiliado' })
    } catch (e) { next(e) }
  })

  // Rutas internas del traslado (MS-07). Solo las llama custodia, nunca el portal.
  const interno = (req, res, next) =>
    claveValida(req.headers['x-clave-interna'], claveInterna) ? next() : problema(res, 401, 'Llamada interna no autorizada')
  const afiliado = async (cedula) =>
    (await db.query(`SELECT cuenta, direccion FROM ciudadanos WHERE cedula = $1 AND estado = 'afiliado'`, [cedula])).rows[0]

  app.get('/internos/ciudadanos/:cedula', interno, async (req, res, next) => {
    try {
      const fila = await afiliado(req.params.cedula)
      const u = fila && await keycloak.buscar(fila.cuenta)
      if (!u) return problema(res, 404, 'Ciudadano no afiliado')
      res.json({
        cedula: req.params.cedula, cuenta: fila.cuenta, nombre: `${u.firstName} ${u.lastName}`.trim(),
        correo: u.attributes?.correoContacto?.[0] ?? fila.cuenta, direccion: fila.direccion,
      })
    } catch (e) { next(e) }
  })

  // Alta de un ciudadano que llega por traslado: el origen ya lo dio de baja en GovCarpeta.
  app.post('/internos/ciudadanos', interno, async (req, res, next) => {
    const { cedula, nombre, correo } = req.body ?? {}
    if (!/^[0-9]{6,10}$/.test(cedula ?? '') || typeof nombre !== 'string' || !nombre.trim() || nombre.length > 120 || typeof correo !== 'string') {
      return problema(res, 400, 'Datos inválidos')
    }
    const [primero, ...resto] = nombre.trim().split(/\s+/)
    const d = { cedula, nombre: primero, apellido: resto.join(' ') || primero, correoContacto: correo }
    try {
      let cuenta
      for (let i = 0; i < 5; i++) {
        cuenta = cuentaInstitucional(d, i)
        if (!(await keycloak.existe(cuenta))) break
      }
      const idUsuario = await keycloak.crearTrasladado({ ...d, cuenta })
      try {
        await pasarela.registrar({ id: cedula, nombre: nombre.trim(), direccion: 'Sin dirección registrada', correo: cuenta })
      } catch (e) {
        await keycloak.borrar(idUsuario)
        return problema(res, e.status === 503 ? 503 : 502, 'El centralizador no registró la afiliación', e.message)
      }
      await db.query(
        `INSERT INTO ciudadanos (cedula, cuenta, estado) VALUES ($1, $2, 'afiliado')
         ON CONFLICT (cedula) DO UPDATE SET cuenta = $2, estado = 'afiliado'`, [cedula, cuenta])
      log('info', 'ciudadano recibido por traslado', { cedula: cedulaEnmascarada(cedula) })
      res.status(201).json({ cedula, cuenta })
    } catch (e) { next(e) }
  })

  // Baja local tras un traslado confirmado. GovCarpeta ya no lo tiene: no se le avisa.
  app.delete('/internos/ciudadanos/:cedula', interno, async (req, res, next) => {
    try {
      const fila = await afiliado(req.params.cedula)
      const u = fila && await keycloak.buscar(fila.cuenta)
      if (u) await keycloak.borrar(u.id)
      await db.query('DELETE FROM ciudadanos WHERE cedula = $1', [req.params.cedula])
      res.sendStatus(204)
    } catch (e) { next(e) }
  })

  app.use((err, _req, res, _next) => {
    log('error', err.message)
    problema(res, 500, 'Error interno')
  })
  return app
}
