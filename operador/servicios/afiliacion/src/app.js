import express from 'express'
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
export function crearApp({ db, pasarela, keycloak, limite = crearLimite(), origenes = [] }) {
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
        `INSERT INTO ciudadanos (cedula, cuenta, estado) VALUES ($1, $2, 'afiliado')
         ON CONFLICT (cedula) DO UPDATE SET cuenta = $2, estado = 'afiliado'`, [d.cedula, cuenta])
      log('info', 'ciudadano afiliado', { cedula })
      res.status(201).json({ cedula: d.cedula, cuenta, estado: 'afiliado' })
    } catch (e) { next(e) }
  })

  app.use((err, _req, res, _next) => {
    log('error', err.message)
    problema(res, 500, 'Error interno')
  })
  return app
}
