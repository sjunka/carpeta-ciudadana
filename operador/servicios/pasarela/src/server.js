import { crearApp } from './app.js'
import { crearCliente } from './govcarpeta.js'

const env = process.env
const app = crearApp({
  cliente: crearCliente({ base: env.GOVCARPETA_URL ?? 'https://govcarpeta-apis-4905ff3c005b.herokuapp.com' }),
  operador: { id: env.OPERADOR_ID, nombre: env.OPERADOR_NOMBRE ?? 'Mi Carpeta Segura' },
  // ponytail: solo compose lo apaga, porque MinIO local no tiene TLS.
  soloHttps: env.URL_SOLO_HTTPS !== 'false',
})
const puerto = env.PORT ?? 8084
app.listen(puerto, () => console.log(JSON.stringify({ nivel: 'info', mensaje: `pasarela en ${puerto}` })))
