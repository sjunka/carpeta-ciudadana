// Cliente de las rutas internas de afiliación (MS-03) que usa el traslado.
// ponytail: clave compartida en cabecera; en Cloud Run, ID token de Google como con la pasarela.
export function crearAfiliacion({ url, clave, fetch = globalThis.fetch }) {
  async function llamar(metodo, ruta, cuerpo) {
    const r = await fetch(url + ruta, {
      method: metodo,
      headers: { 'content-type': 'application/json', 'x-clave-interna': clave },
      body: cuerpo ? JSON.stringify(cuerpo) : undefined,
      signal: AbortSignal.timeout(30_000),
    })
    const json = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(json.detail ?? json.title ?? `afiliacion ${r.status}`)
    return json
  }
  return {
    ciudadano: (cedula) => llamar('GET', `/internos/ciudadanos/${cedula}`),
    crear: (c) => llamar('POST', '/internos/ciudadanos', c),
    borrar: (cedula) => llamar('DELETE', `/internos/ciudadanos/${cedula}`),
  }
}
