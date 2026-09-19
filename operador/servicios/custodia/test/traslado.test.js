import { test } from 'node:test'
import assert from 'node:assert/strict'
import { crearTraslados, validarRecepcion } from '../src/traslado.js'

const NOS = { id: 'mcs', nombre: 'Mi Carpeta Segura' }
const DESTINO = { id: 'otro', nombre: 'Operador Otro', transferAPIURL: 'https://otro.co/api/transferCitizen' }
const ANA = { cedula: '1032236578', cuenta: 'ana.gil.36578@carpetacolombia.co', nombre: 'Ana Gil', correo: 'ana@x.co', direccion: 'Calle 1' }

// Base en memoria con solo las consultas que usa traslado.js.
function baseFalsa(documentos = []) {
  const traslados = new Map()
  return {
    traslados,
    documentos,
    async query(sql, p) {
      if (sql.startsWith('INSERT INTO traslados')) {
        const k = `${p[0]}|${p[1]}`
        traslados.set(k, { ...traslados.get(k), cedula: p[0], sentido: p[1], estado: p[2], operador: p[3] ?? traslados.get(k)?.operador })
        return { rows: [] }
      }
      if (sql.startsWith('SELECT * FROM traslados')) return { rows: [traslados.get(`${p[0]}|${p[1]}`)].filter(Boolean) }
      if (sql.startsWith('SELECT') && sql.includes('FROM documentos')) return { rows: documentos.filter((d) => d.titular === p[0]) }
      if (sql.startsWith('DELETE FROM documentos')) { documentos.splice(0, Infinity, ...documentos.filter((d) => d.titular !== p[0])); return { rows: [] } }
      if (sql.startsWith('INSERT INTO documentos')) { documentos.push({ titular: p[1], clave: p[2], titulo: p[3], tipo: p[4], tamano: p[5], sha256: p[6] }); return { rows: [] } }
      throw new Error(`consulta no prevista: ${sql}`)
    },
  }
}

function montar({ documentos, central = { afiliado: false }, destinoResponde = 200, descargas = {}, operadores = [NOS, DESTINO] } = {}) {
  const pasos = []
  const objetos = new Map()
  const enviados = []
  const db = baseFalsa(documentos)
  const t = crearTraslados({
    db,
    operador: NOS,
    urlPublica: 'https://mcs.co',
    almacen: {
      urlLectura: async (clave) => `https://almacen.mcs.co/${clave}?firma=1`,
      guardar: async (clave, cuerpo) => { objetos.set(clave, cuerpo) },
      borrar: async (clave) => { pasos.push(['borrarObjeto', clave]); objetos.delete(clave) },
    },
    pasarela: {
      operadores: async () => operadores,
      consultar: async () => central,
      desafiliar: async () => pasos.push(['desafiliar']),
      registrar: async (c) => pasos.push(['registrar', c.id]),
    },
    afiliacion: {
      ciudadano: async () => ANA,
      crear: async (c) => { pasos.push(['crearCiudadano', c.cedula]); return { cuenta: 'carlos.castro.36578@carpetacolombia.co' } },
      borrar: async () => pasos.push(['borrarCiudadano']),
    },
    fetch: async (url, op = {}) => {
      if (op.method === 'POST') {
        enviados.push({ url, cuerpo: JSON.parse(op.body) })
        pasos.push(['post', url])
        return new Response('{}', { status: url === DESTINO.transferAPIURL ? destinoResponde : 200 })
      }
      const d = descargas[url]
      return d ? new Response(d, { headers: { 'content-type': 'application/pdf' } }) : new Response('', { status: 404 })
    },
  })
  return { t, db, pasos, objetos, enviados }
}

const DOCS = () => [
  { titular: ANA.cuenta, titulo: 'Diploma', clave: `${ANA.cuenta}/1`, estado: 'cargado' },
  { titular: ANA.cuenta, titulo: 'Cédula', clave: `${ANA.cuenta}/2`, estado: 'autenticado' },
]

test('enviar: baja en GovCarpeta antes de llamar al destino, con el body acordado', async () => {
  const { t, pasos, enviados, db } = montar({ documentos: DOCS() })
  const r = await t.enviar(ANA, 'otro')
  assert.equal(r.estado, 'enviado')
  assert.deepEqual(pasos.map((p) => p[0]), ['desafiliar', 'post'])
  const { cuerpo } = enviados[0]
  assert.deepEqual(Object.keys(cuerpo).sort(), ['citizenEmail', 'citizenName', 'confirmAPI', 'id', 'urlDocuments'])
  assert.equal(cuerpo.id, 1032236578)
  assert.equal(cuerpo.confirmAPI, 'https://mcs.co/api/transferCitizenConfirm')
  assert.deepEqual(Object.keys(cuerpo.urlDocuments), ['Diploma', 'Cédula'])
  assert.equal(db.traslados.get(`${ANA.cedula}|saliente`).estado, 'enviado')
})

test('enviar: operador sin transferAPIURL o uno mismo, 422 sin tocar GovCarpeta', async () => {
  const { t, pasos } = montar()
  await assert.rejects(t.enviar(ANA, 'mcs'), { status: 422 })
  await assert.rejects(t.enviar(ANA, 'inexistente'), { status: 422 })
  assert.deepEqual(pasos, [])
})

test('enviar: si el destino rechaza, se reafilia al ciudadano y nada se borra', async () => {
  const { t, pasos, db } = montar({ documentos: DOCS(), destinoResponde: 500 })
  await assert.rejects(t.enviar(ANA, 'otro'), { status: 502 })
  assert.deepEqual(pasos.map((p) => p[0]), ['desafiliar', 'post', 'registrar'])
  assert.equal(db.documentos.length, 2)
  assert.equal(db.traslados.get(`${ANA.cedula}|saliente`).estado, 'fallido')
})

test('confirmar 1: borra objetos, documentos y afiliación solo si GovCarpeta lo muestra en otro operador', async () => {
  const { t, pasos, db } = montar({ documentos: DOCS(), central: { afiliado: true, operador: 'Operador Otro' } })
  await t.enviar(ANA, 'otro')
  assert.deepEqual(await t.confirmar({ id: 1032236578, req_status: 1 }), { estado: 'completado' })
  assert.deepEqual(pasos.filter((p) => p[0] === 'borrarObjeto').length, 2)
  assert.ok(pasos.some((p) => p[0] === 'borrarCiudadano'))
  assert.equal(db.documentos.length, 0)
})

test('confirmar 1 no verificable en GovCarpeta: 409 y la carpeta sigue intacta', async () => {
  const { t, pasos, db } = montar({ documentos: DOCS(), central: { afiliado: false } })
  await t.enviar(ANA, 'otro')
  await assert.rejects(t.confirmar({ id: 1032236578, req_status: 1 }), { status: 409 })
  assert.equal(db.documentos.length, 2)
  assert.ok(!pasos.some((p) => p[0] === 'borrarCiudadano'))
})

test('confirmar 0: se reafilia y se conserva la carpeta; sin traslado en curso, 404', async () => {
  const { t, pasos, db } = montar({ documentos: DOCS() })
  await assert.rejects(t.confirmar({ id: 1032236578, req_status: 1 }), { status: 404 })
  await t.enviar(ANA, 'otro')
  assert.deepEqual(await t.confirmar({ id: 1032236578, req_status: 0 }), { estado: 'fallido' })
  assert.equal(pasos.at(-1)[0], 'registrar')
  assert.equal(db.documentos.length, 2)
})

const RECIBIDO = {
  id: 1032236578, citizenName: 'Carlos Castro', citizenEmail: 'myemail@example.com',
  urlDocuments: { URL1: ['https://otro.co/doc1'], URL2: ['https://otro.co/doc2'] },
  confirmAPI: 'https://otro.co/api/transferCitizenConfirm',
}

test('valida el body de transferCitizen', () => {
  assert.equal(validarRecepcion(RECIBIDO), null)
  assert.equal(validarRecepcion({ ...RECIBIDO, id: '1032236578' }), 'id')
  assert.equal(validarRecepcion({ ...RECIBIDO, urlDocuments: { a: ['file:///etc/passwd'] } }), 'urlDocuments')
  assert.equal(validarRecepcion({ ...RECIBIDO, confirmAPI: 'http://otro.co/c' }), 'confirmAPI')
})

test('recibir: confirmAPI de un operador que no está en el directorio, 403', async () => {
  const { t } = montar()
  await assert.rejects(t.recibir({ ...RECIBIDO, confirmAPI: 'https://atacante.co/x' }), { status: 403 })
})

test('recibir: descarga, afilia, guarda documentos y confirma con req_status 1', async () => {
  const { t, db, objetos, enviados, pasos } = montar({ descargas: { 'https://otro.co/doc1': 'PDF-1', 'https://otro.co/doc2': 'PDF-2' } })
  const { respuesta, proceso } = await t.recibir(RECIBIDO)
  assert.deepEqual(respuesta, { recibido: true })
  assert.equal(await proceso, 'completado')
  assert.equal(objetos.size, 2)
  assert.deepEqual(db.documentos.map((d) => d.titulo), ['URL1', 'URL2'])
  assert.ok(pasos.findIndex((p) => p[0] === 'crearCiudadano') < pasos.findIndex((p) => p[0] === 'post'))
  assert.deepEqual(enviados.at(-1), { url: RECIBIDO.confirmAPI, cuerpo: { id: 1032236578, req_status: 1 } })
})

test('recibir: si una descarga falla, borra lo guardado, no afilia y confirma con req_status 0', async () => {
  const { t, db, objetos, enviados, pasos } = montar({ descargas: { 'https://otro.co/doc1': 'PDF-1' } })
  assert.equal(await (await t.recibir(RECIBIDO)).proceso, 'fallido')
  assert.equal(objetos.size, 0)
  assert.equal(db.documentos.length, 0)
  assert.ok(!pasos.some((p) => p[0] === 'crearCiudadano'))
  assert.deepEqual(enviados.at(-1).cuerpo, { id: 1032236578, req_status: 0 })
})

test('recibir: ciudadano aún afiliado en GovCarpeta, confirma 0 sin descargar', async () => {
  const { t, objetos, enviados } = montar({ central: { afiliado: true, operador: 'Operador Otro' }, descargas: { 'https://otro.co/doc1': 'x', 'https://otro.co/doc2': 'y' } })
  assert.equal(await (await t.recibir(RECIBIDO)).proceso, 'fallido')
  assert.equal(objetos.size, 0)
  assert.equal(enviados.at(-1).cuerpo.req_status, 0)
})
