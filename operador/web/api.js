import { UserManager, WebStorageStateStore } from 'oidc-client-ts'

// En local apunta a compose; en producción, Vite toma las URL de Cloud Run de .env.production.
const env = import.meta.env
export const URLS = {
  keycloak: env.VITE_MCS_KEYCLOAK ?? 'http://localhost:8081',
  afiliacion: env.VITE_MCS_AFILIACION ?? 'http://localhost:8082',
  custodia: env.VITE_MCS_CUSTODIA ?? 'http://localhost:8083',
}

const aqui = `${window.location.origin}${import.meta.env.BASE_URL}operador/`

export const sesion = new UserManager({
  authority: `${URLS.keycloak}/realms/carpeta`,
  client_id: 'portal',
  redirect_uri: aqui,
  post_logout_redirect_uri: aqui,
  scope: 'openid',
  ui_locales: 'es',
  userStore: new WebStorageStateStore({ store: window.sessionStorage }),
  automaticSilentRenew: false,
})

export class ErrorServicio extends Error {
  constructor(status, titulo, detalle) {
    super(detalle || titulo)
    this.status = status
    this.titulo = titulo
  }
}

async function pedir(url, opciones = {}) {
  let r
  try {
    r = await fetch(url, opciones)
  } catch {
    throw new ErrorServicio(0, 'Sin conexión', 'No pudimos comunicarnos con el operador. Revisa tu conexión e intenta de nuevo.')
  }
  const cuerpo = await r.json().catch(() => ({}))
  if (!r.ok) throw new ErrorServicio(r.status, cuerpo.title ?? 'No se pudo completar', cuerpo.detail)
  return cuerpo
}

export const registrar = (datos) =>
  pedir(`${URLS.afiliacion}/ciudadanos`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(datos),
  })

async function conSesion(ruta, opciones = {}) {
  const usuario = await sesion.getUser()
  if (!usuario || usuario.expired) {
    await sesion.signinRedirect({ state: window.location.hash })
    return new Promise(() => {})
  }
  return pedir(`${URLS.custodia}${ruta}`, {
    ...opciones,
    headers: { authorization: `Bearer ${usuario.access_token}`, 'content-type': 'application/json', ...opciones.headers },
  })
}

export const listar = () => conSesion('/documentos')

export async function subir({ titulo, archivo }, alAvanzar) {
  alAvanzar('reservando')
  const { id, urlCarga } = await conSesion('/documentos', {
    method: 'POST', body: JSON.stringify({ titulo, tipo: archivo.type, tamano: archivo.size }),
  })
  alAvanzar('subiendo')
  const put = await fetch(urlCarga, { method: 'PUT', headers: { 'content-type': archivo.type }, body: archivo }).catch(() => null)
  if (!put?.ok) throw new ErrorServicio(0, 'No se pudo subir el archivo', 'La carga se interrumpió. Intenta de nuevo.')
  alAvanzar('verificando')
  return conSesion(`/documentos/${id}/confirmacion`, { method: 'POST' })
}

export const autenticar = (id) => conSesion(`/documentos/${id}/autenticacion`, { method: 'POST' })

export const operadores = () => conSesion('/operadores')

export const trasladar = (operadorId) =>
  conSesion('/traslados', { method: 'POST', body: JSON.stringify({ operadorId }) })
