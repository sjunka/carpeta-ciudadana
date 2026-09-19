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
