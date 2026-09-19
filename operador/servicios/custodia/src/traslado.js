import { createHash, randomUUID } from 'node:crypto'
import { MAX_ARCHIVO, CUOTA } from './app.js'

// Traslado entre operadores (MS-07), según el acuerdo de los equipos del curso:
// el origen da de baja en GovCarpeta, llama a transferCitizen del destino con su confirmAPI
// y solo borra base y almacén cuando el destino responde req_status 1 en transferCitizenConfirm.
// En el prototipo corre dentro de custodia, que ya tiene los documentos y el almacén.

const log = (nivel, mensaje, extra = {}) => console.log(JSON.stringify({ nivel, mensaje, ...extra }))

export class ErrorTraslado extends Error {
  constructor(status, titulo, detalle) {
    super(detalle ?? titulo)
    this.status = status
    this.titulo = titulo
  }
}

const URL_LECTURA_S = 24 * 3600 // el destino puede tardar en descargar

export function urlPermitida(url, soloHttps = true) {
  try {
    const u = new URL(url)
    return u.protocol === 'https:' || (!soloHttps && u.protocol === 'http:')
  } catch {
    return false
  }
}

export function validarRecepcion(b, soloHttps = true) {
  if (!Number.isInteger(b?.id) || !/^[0-9]{6,10}$/.test(String(b.id))) return 'id'
  if (typeof b.citizenName !== 'string' || !b.citizenName.trim() || b.citizenName.length > 120) return 'citizenName'
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(b.citizenEmail ?? '')) return 'citizenEmail'
  if (!urlPermitida(b.confirmAPI, soloHttps)) return 'confirmAPI'
  const docs = b.urlDocuments
  if (!docs || typeof docs !== 'object' || Array.isArray(docs)) return 'urlDocuments'
  const urls = Object.values(docs)
  if (!urls.every((l) => Array.isArray(l) && l.every((u) => urlPermitida(u, soloHttps)))) return 'urlDocuments'
  if (urls.flat().length > CUOTA.documentos) return 'urlDocuments'
  return null
}

// dependencias: db, almacen, pasarela (consultar, registrar, desafiliar, operadores),
// afiliacion (ciudadano, crear, borrar), operador { id, nombre }, urlPublica, fetch
export function crearTraslados({ db, almacen, pasarela, afiliacion, operador, urlPublica, soloHttps = true, fetch = globalThis.fetch }) {
  const estado = (cedula, sentido, valor, otro = null) =>
    db.query(
      `INSERT INTO traslados (cedula, sentido, estado, operador) VALUES ($1, $2, $3, $4)
       ON CONFLICT (cedula, sentido) DO UPDATE SET estado = $3, operador = coalesce($4, traslados.operador), actualizado = now()`,
      [cedula, sentido, valor, otro])
  const traslado = async (cedula, sentido) =>
    (await db.query('SELECT * FROM traslados WHERE cedula = $1 AND sentido = $2', [cedula, sentido])).rows[0]

  const reafiliar = (c) => pasarela.registrar({ id: c.cedula, nombre: c.nombre, direccion: c.direccion ?? 'Sin dirección registrada', correo: c.cuenta })

  const post = (url, cuerpo) =>
    fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(cuerpo), signal: AbortSignal.timeout(30_000) })

  async function operadoresDestino() {
    return (await pasarela.operadores()).filter((o) => o.id !== operador.id)
  }

  // Salida: el titular pide irse a otro operador.
  async function enviar({ cedula, cuenta }, operadorId) {
    const destino = (await operadoresDestino()).find((o) => o.id === operadorId)
    if (!destino) throw new ErrorTraslado(422, 'Operador sin dirección de traslado', 'El operador elegido no publica transferAPIURL en GovCarpeta.')
    if ((await traslado(cedula, 'saliente'))?.estado === 'enviado') throw new ErrorTraslado(409, 'Ya hay un traslado en curso')

    const ciudadano = await afiliacion.ciudadano(cedula)
    const { rows: docs } = await db.query(`SELECT titulo, clave FROM documentos WHERE titular = $1 AND estado <> 'pendiente'`, [cuenta])
    const urlDocuments = {}
    for (const d of docs) (urlDocuments[d.titulo] ??= []).push(await almacen.urlLectura(d.clave, URL_LECTURA_S))

    await estado(cedula, 'saliente', 'enviado', destino.id)
    try {
      await pasarela.desafiliar(cedula)
    } catch (e) {
      await estado(cedula, 'saliente', 'fallido')
      throw new ErrorTraslado(502, 'El centralizador no dio de baja al ciudadano', e.message)
    }
    let r
    try {
      r = await post(destino.transferAPIURL, {
        id: Number(cedula), citizenName: ciudadano.nombre, citizenEmail: ciudadano.correo, urlDocuments,
        confirmAPI: `${urlPublica}/api/transferCitizenConfirm`,
      })
    } catch (e) {
      r = { ok: false, status: 0, statusText: e.message }
    }
    if (!r.ok) {
      await reafiliar(ciudadano) // compensación: vuelve a quedar con nosotros
      await estado(cedula, 'saliente', 'fallido')
      throw new ErrorTraslado(502, 'El operador destino no aceptó el traslado', `transferCitizen respondió ${r.status} ${r.statusText ?? ''}`.trim())
    }
    log('info', 'traslado enviado', { operador: destino.nombre, documentos: docs.length })
    return { estado: 'enviado', operador: destino.nombre, documentos: docs.length }
  }

  // Confirmación del destino. Antes de borrar se comprueba en GovCarpeta que el ciudadano
  // ya está con otro operador: el endpoint es público y nadie debe poder borrar una carpeta con un POST.
  async function confirmar({ id, req_status: resultado }) {
    const cedula = String(id)
    if (!/^[0-9]{6,10}$/.test(cedula) || ![0, 1].includes(resultado)) throw new ErrorTraslado(400, 'Solicitud inválida', 'Se exige id y req_status 0 o 1')
    if ((await traslado(cedula, 'saliente'))?.estado !== 'enviado') throw new ErrorTraslado(404, 'No hay traslado en curso para ese ciudadano')

    const central = await pasarela.consultar(cedula)
    if (resultado === 0) {
      if (!central.afiliado) await reafiliar(await afiliacion.ciudadano(cedula))
      await estado(cedula, 'saliente', 'fallido')
      log('warn', 'traslado rechazado por el destino')
      return { estado: 'fallido' }
    }
    if (!central.afiliado || central.operador === operador.nombre) {
      throw new ErrorTraslado(409, 'Confirmación no verificable', 'GovCarpeta no muestra al ciudadano en otro operador.')
    }
    const { cuenta } = await afiliacion.ciudadano(cedula)
    const { rows: docs } = await db.query('SELECT clave FROM documentos WHERE titular = $1', [cuenta])
    for (const d of docs) await almacen.borrar(d.clave)
    await db.query('DELETE FROM documentos WHERE titular = $1', [cuenta])
    await afiliacion.borrar(cedula)
    await estado(cedula, 'saliente', 'completado')
    log('info', 'traslado completado; carpeta borrada', { documentos: docs.length })
    return { estado: 'completado' }
  }

  async function descargar(url) {
    const r = await fetch(url, { signal: AbortSignal.timeout(60_000) })
    if (!r.ok) throw new Error(`descarga ${r.status}`)
    if (Number(r.headers.get('content-length')) > MAX_ARCHIVO) throw new Error('documento de más de 10 MB')
    const cuerpo = Buffer.from(await r.arrayBuffer())
    if (cuerpo.length > MAX_ARCHIVO) throw new Error('documento de más de 10 MB')
    return { cuerpo, tipo: (r.headers.get('content-type') ?? 'application/octet-stream').split(';')[0] }
  }

  async function procesar(b) {
    const cedula = String(b.id)
    const guardados = []
    let cuenta
    try {
      if ((await pasarela.consultar(cedula)).afiliado) throw new Error('el origen no dio de baja al ciudadano en GovCarpeta')
      for (const [titulo, urls] of Object.entries(b.urlDocuments)) {
        for (const url of urls) {
          const { cuerpo, tipo } = await descargar(url)
          const clave = `traslados/${cedula}/${randomUUID()}`
          await almacen.guardar(clave, cuerpo, tipo)
          guardados.push({ titulo: titulo.slice(0, 120), clave, tipo, tamano: cuerpo.length, sha256: createHash('sha256').update(cuerpo).digest('hex') })
        }
      }
      ;({ cuenta } = await afiliacion.crear({ cedula, nombre: b.citizenName.trim(), correo: b.citizenEmail }))
      for (const g of guardados) {
        await db.query(
          `INSERT INTO documentos (id, titular, clave, titulo, tipo, tamano, sha256, estado) VALUES ($1, $2, $3, $4, $5, $6, $7, 'cargado')`,
          [randomUUID(), cuenta, g.clave, g.titulo, g.tipo, g.tamano, g.sha256])
      }
    } catch (e) {
      log('warn', 'recepción fallida; se descarta lo recibido', { detalle: e.message })
      for (const g of guardados) await almacen.borrar(g.clave).catch(() => {})
      if (cuenta) {
        await db.query('DELETE FROM documentos WHERE titular = $1', [cuenta]).catch(() => {})
        await afiliacion.borrar(cedula).catch(() => {})
        await pasarela.desafiliar(cedula).catch(() => {})
      }
      await estado(cedula, 'entrante', 'fallido')
      await post(b.confirmAPI, { id: b.id, req_status: 0 }).catch(() => {})
      return 'fallido'
    }
    await estado(cedula, 'entrante', 'completado')
    const r = await post(b.confirmAPI, { id: b.id, req_status: 1 }).catch((e) => ({ ok: false, status: e.message }))
    if (!r.ok) log('warn', 'el origen no recibió la confirmación', { status: r.status })
    log('info', 'traslado recibido', { documentos: guardados.length })
    return 'completado'
  }

  // Entrada: otro operador nos envía un ciudadano. Se acepta en el acto y se procesa aparte;
  // el resultado viaja después a su confirmAPI. `proceso` existe para las pruebas.
  async function recibir(b) {
    const invalido = validarRecepcion(b, soloHttps)
    if (invalido) throw new ErrorTraslado(400, 'Solicitud inválida', `Revisa: ${invalido}`)
    // El confirmAPI debe pertenecer a un operador del directorio: evita que cualquiera
    // nos haga llamar a una URL arbitraria.
    const origen = new URL(b.confirmAPI).origin
    if (!(await pasarela.operadores()).some((o) => { try { return new URL(o.transferAPIURL).origin === origen } catch { return false } })) {
      throw new ErrorTraslado(403, 'Operador desconocido', 'El confirmAPI no pertenece a ningún operador registrado en GovCarpeta.')
    }
    const cedula = String(b.id)
    if ((await traslado(cedula, 'entrante'))?.estado === 'recibiendo') return { respuesta: { recibido: true }, proceso: Promise.resolve('en curso') }
    await estado(cedula, 'entrante', 'recibiendo', origen)
    // ponytail: proceso en memoria; si la instancia se reinicia a mitad, el origen no recibe confirmación.
    // Pasar a una cola (Pub/Sub o Kafka) con la bandeja de salida de MS-07.
    const proceso = procesar(b).catch((e) => { log('error', e.message); return 'error' })
    return { respuesta: { recibido: true }, proceso }
  }

  return { enviar, confirmar, recibir, operadoresDestino }
}
