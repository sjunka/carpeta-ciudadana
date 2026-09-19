import { test } from 'node:test'
import assert from 'node:assert/strict'
import { cuentaInstitucional, validarRegistro, cedulaEnmascarada } from '../src/cuenta.js'
import { crearApp, crearLimite } from '../src/app.js'

const datos = { cedula: '9912345678', nombre: 'José Ángel', apellido: 'Muñoz Pérez', direccion: 'Calle 1', correoContacto: 'j@x.co', clave: 'clave-muy-segura' }

test('cuenta institucional: sin tildes, determinista y distinta en colisión', () => {
  assert.equal(cuentaInstitucional(datos), 'jose.munoz.45678@carpetacolombia.co')
  assert.equal(cuentaInstitucional(datos), cuentaInstitucional(datos))
  assert.notEqual(cuentaInstitucional(datos, 1), cuentaInstitucional(datos))
  assert.match(cuentaInstitucional(datos, 1), /^jose\.munoz\.\d{5}@carpetacolombia\.co$/)
})

test('valida entrada y enmascara la cédula en logs', () => {
  assert.deepEqual(validarRegistro(datos), [])
  assert.deepEqual(validarRegistro({ ...datos, cedula: '12a', clave: 'corta' }), ['cedula', 'clave'])
  assert.equal(cedulaEnmascarada('9912345678'), '******5678')
})

test('el límite por IP corta al sexto intento', () => {
  const lim = crearLimite({ max: 5 })
  for (let i = 0; i < 5; i++) assert.equal(lim('1.1.1.1'), true)
  assert.equal(lim('1.1.1.1'), false)
  assert.equal(lim('2.2.2.2'), true)
})

async function registrar(deps) {
  const llamadas = []
  const keycloak = {
    existe: async () => false,
    crearDeshabilitado: async () => { llamadas.push('crear'); return 'u1' },
    habilitar: async () => llamadas.push('habilitar'),
    borrar: async () => llamadas.push('borrar'),
  }
  const app = crearApp({ db: { query: async () => {} }, keycloak, ...deps })
  const srv = app.listen(0)
  const r = await fetch(`http://localhost:${srv.address().port}/ciudadanos`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(datos),
  })
  srv.close()
  return { status: r.status, cuerpo: await r.json(), llamadas }
}

test('ya afiliado a otro operador: 409 sin crear usuario', async () => {
  const r = await registrar({ pasarela: { consultar: async () => ({ afiliado: true, operador: 'Otro' }) } })
  assert.equal(r.status, 409)
  assert.deepEqual(r.llamadas, [])
})

test('centralizador caído: 503, nunca se asume libre', async () => {
  const r = await registrar({ pasarela: { consultar: async () => { throw new Error('caído') } } })
  assert.equal(r.status, 503)
  assert.deepEqual(r.llamadas, [])
})

test('rechazo del registro central: compensa borrando el usuario', async () => {
  const r = await registrar({
    pasarela: { consultar: async () => ({ afiliado: false }), registrar: async () => { throw Object.assign(new Error('no'), { status: 502 }) } },
  })
  assert.equal(r.status, 502)
  assert.deepEqual(r.llamadas, ['crear', 'borrar'])
})

test('camino feliz: crea deshabilitado, registra y habilita', async () => {
  const r = await registrar({ pasarela: { consultar: async () => ({ afiliado: false }), registrar: async () => ({}) } })
  assert.equal(r.status, 201)
  assert.equal(r.cuerpo.cuenta, 'jose.munoz.45678@carpetacolombia.co')
  assert.deepEqual(r.llamadas, ['crear', 'habilitar'])
})

async function interno(ruta, { metodo = 'GET', cuerpo, clave = 'secreta', filas = [], pasarela = {} } = {}) {
  const llamadas = []
  const keycloak = {
    existe: async () => false,
    buscar: async () => ({ id: 'u1', firstName: 'Ana', lastName: 'Gil', attributes: { correoContacto: ['ana@x.co'] } }),
    crearTrasladado: async (u) => { llamadas.push(['crear', u.cuenta]); return 'u1' },
    borrar: async (id) => llamadas.push(['borrar', id]),
  }
  const db = { query: async (sql) => { llamadas.push([sql.split(' ')[0]]); return { rows: filas } } }
  const app = crearApp({ db, keycloak, pasarela, claveInterna: 'secreta' })
  const srv = app.listen(0)
  const r = await fetch(`http://localhost:${srv.address().port}${ruta}`, {
    method: metodo, headers: { 'content-type': 'application/json', 'x-clave-interna': clave }, body: cuerpo && JSON.stringify(cuerpo),
  })
  srv.close()
  return { status: r.status, cuerpo: await r.json().catch(() => null), llamadas }
}

test('rutas internas: sin la clave compartida responden 401', async () => {
  assert.equal((await interno('/internos/ciudadanos/9912345678', { clave: 'otra' })).status, 401)
})

test('consulta interna: nombre y correo de contacto para el traslado', async () => {
  const r = await interno('/internos/ciudadanos/9912345678', { filas: [{ cuenta: 'ana.gil.45678@carpetacolombia.co', direccion: 'Calle 1' }] })
  assert.equal(r.status, 200)
  assert.deepEqual(r.cuerpo, { cedula: '9912345678', cuenta: 'ana.gil.45678@carpetacolombia.co', nombre: 'Ana Gil', correo: 'ana@x.co', direccion: 'Calle 1' })
})

test('alta por traslado: registra en GovCarpeta; si rechaza, borra el usuario', async () => {
  const cuerpo = { cedula: '1032236578', nombre: 'Carlos Castro', correo: 'c@x.co' }
  const ok = await interno('/internos/ciudadanos', { metodo: 'POST', cuerpo, pasarela: { registrar: async () => ({}) } })
  assert.equal(ok.status, 201)
  assert.equal(ok.cuerpo.cuenta, 'carlos.castro.36578@carpetacolombia.co')
  const malo = await interno('/internos/ciudadanos', {
    metodo: 'POST', cuerpo, pasarela: { registrar: async () => { throw Object.assign(new Error('501'), { status: 502 }) } },
  })
  assert.equal(malo.status, 502)
  assert.deepEqual(malo.llamadas.filter((l) => l[0] === 'borrar'), [['borrar', 'u1']])
})
