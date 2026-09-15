import { test } from 'node:test'
import assert from 'node:assert/strict'
import { crearApp, validarSolicitud } from '../src/app.js'

test('valida tipo, tamaño y título de la solicitud', () => {
  assert.equal(validarSolicitud({ titulo: 'Diploma', tipo: 'application/pdf', tamano: 100 }), null)
  assert.equal(validarSolicitud({ titulo: 'x', tipo: 'application/zip', tamano: 100 })[0], 415)
  assert.equal(validarSolicitud({ titulo: 'x', tipo: 'image/png', tamano: 11 * 1024 * 1024 })[0], 413)
  assert.equal(validarSolicitud({ titulo: '', tipo: 'image/png', tamano: 1 })[0], 422)
})

const DOC = { id: '11111111-1111-1111-1111-111111111111', titular: 'ana.gil.45678@carpetacolombia.co', clave: 'k', titulo: 'Diploma', tipo: 'application/pdf', tamano: 10, estado: 'cargado' }

async function pedir(ruta, { claims, filas = [DOC], metodo = 'POST', pasarela } = {}) {
  const enviados = []
  const app = crearApp({
    db: { query: async (sql) => ({ rows: sql.startsWith('UPDATE') ? [{ ...DOC, estado: 'autenticado' }] : filas }) },
    verificar: async (t) => { if (t !== 'ok') throw new Error('firma'); return claims },
    almacen: { urlLectura: async () => 'https://storage.googleapis.com/b/k?X-Amz-Signature=1' },
    pasarela: pasarela ?? { autenticar: async (d) => { enviados.push(d); return { respuesta: 'ok' } } },
  })
  const srv = app.listen(0)
  const r = await fetch(`http://localhost:${srv.address().port}${ruta}`, { method: metodo, headers: { authorization: 'Bearer ok' } })
  srv.close()
  return { status: r.status, enviados }
}

const ana = { azp: 'portal', preferred_username: DOC.titular, cedula: '9912345678' }

test('sin token o con token de otro cliente: 401', async () => {
  assert.equal((await pedir('/documentos', { metodo: 'GET', claims: { ...ana, azp: 'otro' } })).status, 401)
})

test('documento ajeno: 403 y nada sale hacia el centralizador', async () => {
  const r = await pedir(`/documentos/${DOC.id}/autenticacion`, { claims: { ...ana, preferred_username: 'otro@carpetacolombia.co' } })
  assert.equal(r.status, 403)
  assert.equal(r.enviados.length, 0)
})

test('autenticación envía URL y metadatos, nunca el contenido (RI-01)', async () => {
  const r = await pedir(`/documentos/${DOC.id}/autenticacion`, { claims: ana })
  assert.equal(r.status, 200)
  assert.deepEqual(Object.keys(r.enviados[0]).sort(), ['idCiudadano', 'titulo', 'url'])
  assert.match(r.enviados[0].url, /^https:\/\//)
})

test('error del centralizador: 502', async () => {
  const r = await pedir(`/documentos/${DOC.id}/autenticacion`, { claims: ana, pasarela: { autenticar: async () => { throw new Error('501') } } })
  assert.equal(r.status, 502)
})
