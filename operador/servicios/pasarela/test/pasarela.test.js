import { test } from 'node:test'
import assert from 'node:assert/strict'
import { leerAfiliacion, crearBreaker, crearCliente, Indisponible, Rechazo } from '../src/govcarpeta.js'
import { crearApp, urlValida } from '../src/app.js'

test('204 significa libre; 200 extrae el operador aunque haya espacio final', () => {
  assert.deepEqual(leerAfiliacion(204, ''), { afiliado: false, operador: null })
  const r = leerAfiliacion(200, 'El ciudadano 99123 ya se encuentra registrado en el operador Operador 123 ')
  assert.deepEqual(r, { afiliado: true, operador: 'Operador 123' })
  assert.throws(() => leerAfiliacion(500, ''), Indisponible)
})

test('el breaker abre tras el umbral y cierra tras el enfriamiento', () => {
  let t = 0
  const b = crearBreaker({ umbral: 2, enfriamientoMs: 100, ahora: () => t })
  b.fallo(); assert.equal(b.abierto(), false)
  b.fallo(); assert.equal(b.abierto(), true)
  t = 101; assert.equal(b.abierto(), false)
})

test('solo acepta URL https', () => {
  assert.equal(urlValida('https://storage.googleapis.com/x'), true)
  assert.equal(urlValida('http://localhost:9000/x'), false)
  assert.equal(urlValida('data:application/pdf;base64,AAAA'), false)
})

test('rechaza contenido documental: cuerpo mayor a 2 KB da 413', async () => {
  const app = crearApp({ cliente: {}, operador: { id: 'x', nombre: 'y' } })
  const srv = app.listen(0)
  const { port } = srv.address()
  const r = await fetch(`http://localhost:${port}/centralizador/documentos/autenticacion`, {
    method: 'PUT', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ idCiudadano: '9912345678', url: 'https://a.b/c', titulo: 'x', contenido: 'A'.repeat(4000) }),
  })
  srv.close()
  assert.equal(r.status, 413)
  assert.match(r.headers.get('content-type'), /problem\+json/)
})

test('un 500 del centralizador se traduce en Indisponible', async () => {
  const cliente = crearCliente({ base: 'http://x', fetch: async () => new Response('', { status: 500 }) })
  await assert.rejects(cliente.registrar({}), Indisponible)
})

test('operadores: solo los que publican transferAPIURL, con _id como id', async () => {
  const lista = [
    { _id: 'a1', operatorName: 'Uno', transferAPIURL: ' https://uno.co/api/transferCitizen ' },
    { _id: 'b2', operatorName: 'Dos' },
  ]
  const cliente = crearCliente({ base: 'http://x', fetch: async () => new Response(JSON.stringify(lista)) })
  assert.deepEqual(await cliente.operadores(), [{ id: 'a1', nombre: 'Uno', transferAPIURL: 'https://uno.co/api/transferCitizen' }])
})

test('desafiliar: 201 y 204 son éxito; 501 es rechazo', async () => {
  for (const status of [201, 204]) {
    const cliente = crearCliente({ base: 'http://x', fetch: async () => new Response(null, { status }) })
    await cliente.desafiliar({ id: 1 })
  }
  const malo = crearCliente({ base: 'http://x', fetch: async () => new Response('', { status: 501 }) })
  await assert.rejects(malo.desafiliar({ id: 1 }), Rechazo)
})
