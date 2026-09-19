// Cliente de la pasarela. En Cloud Run la pasarela es privada: se adjunta un ID token de Google
// obtenido del servidor de metadatos cuando AUDIENCIA_PASARELA está definida.
export class ErrorPasarela extends Error {
  constructor(status, detalle) {
    super(detalle)
    this.status = status
  }
}

async function idToken(audiencia) {
  const r = await fetch(
    `http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity?audience=${audiencia}`,
    { headers: { 'Metadata-Flavor': 'Google' } })
  return r.text()
}

export function crearPasarela({ url, audiencia }) {
  async function llamar(metodo, ruta, cuerpo) {
    const headers = { 'content-type': 'application/json' }
    if (audiencia) headers.authorization = `Bearer ${await idToken(audiencia)}`
    const r = await fetch(url + ruta, {
      method: metodo, headers, body: cuerpo ? JSON.stringify(cuerpo) : undefined, signal: AbortSignal.timeout(30_000),
    })
    const json = await r.json().catch(() => ({}))
    if (!r.ok) throw new ErrorPasarela(r.status, json.detail ?? json.title ?? `pasarela ${r.status}`)
    return json
  }
  return {
    consultar: (cedula) => llamar('GET', `/centralizador/ciudadanos/${cedula}`),
    registrar: (c) => llamar('POST', '/centralizador/ciudadanos', c),
    autenticar: (d) => llamar('PUT', '/centralizador/documentos/autenticacion', d),
    consultar: (cedula) => llamar('GET', `/centralizador/ciudadanos/${cedula}`),
    registrar: (c) => llamar('POST', '/centralizador/ciudadanos', c),
    desafiliar: (cedula) => llamar('DELETE', `/centralizador/ciudadanos/${cedula}`),
    operadores: () => llamar('GET', '/centralizador/operadores'),
  }
}
