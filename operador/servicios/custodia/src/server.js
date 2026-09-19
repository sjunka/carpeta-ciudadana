import pg from 'pg'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import { crearApp } from './app.js'
import { crearAlmacen } from './almacen.js'
import { crearPasarela } from './pasarela.js'
import { crearAfiliacion } from './afiliacion.js'
import { crearTraslados } from './traslado.js'

const env = process.env
const db = new pg.Pool({ connectionString: env.DATABASE_URL })

if (process.argv.includes('--migrar')) {
  // RD-10: las migraciones corren como proceso aparte.
  await db.query(`CREATE TABLE IF NOT EXISTS documentos (
    id uuid PRIMARY KEY,
    titular text NOT NULL,
    clave text NOT NULL UNIQUE,
    titulo text NOT NULL,
    tipo text NOT NULL,
    tamano bigint NOT NULL,
    sha256 text,
    estado text NOT NULL CHECK (estado IN ('pendiente', 'cargado', 'autenticado')),
    autenticado_en timestamptz,
    respuesta_centralizador text,
    creado timestamptz NOT NULL DEFAULT now()
  )`)
  await db.query('CREATE INDEX IF NOT EXISTS documentos_titular ON documentos (titular)')
  await db.query(`CREATE TABLE IF NOT EXISTS traslados (
    cedula text NOT NULL,
    sentido text NOT NULL CHECK (sentido IN ('saliente', 'entrante')),
    estado text NOT NULL CHECK (estado IN ('enviado', 'recibiendo', 'completado', 'fallido')),
    operador text,
    actualizado timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (cedula, sentido)
  )`)
  console.log(JSON.stringify({ nivel: 'info', mensaje: 'migración de custodia aplicada' }))
  await db.end()
} else {
  // El JWKS se lee por la URL interna, pero el emisor es el público (el que ve el navegador).
  const jwks = createRemoteJWKSet(new URL(env.KEYCLOAK_JWKS_URL))
  const verificar = async (token) =>
    (await jwtVerify(token, jwks, { issuer: env.KEYCLOAK_ISSUER, audience: 'custodia' })).payload

  const almacen = crearAlmacen({
    endpoint: env.S3_ENDPOINT, endpointPublico: env.S3_ENDPOINT_PUBLICO, region: env.S3_REGION ?? 'auto',
    bucket: env.S3_BUCKET, accessKeyId: env.S3_ACCESS_KEY, secretAccessKey: env.S3_SECRET_KEY,
  })
  const pasarela = crearPasarela({ url: env.PASARELA_URL, audiencia: env.AUDIENCIA_PASARELA })
  const app = crearApp({
    db,
    verificar,
    almacen,
    pasarela,
    traslados: crearTraslados({
      db, almacen, pasarela,
      afiliacion: crearAfiliacion({ url: env.AFILIACION_URL, clave: env.CLAVE_INTERNA }),
      operador: { id: env.OPERADOR_ID, nombre: env.OPERADOR_NOMBRE ?? 'Mi Carpeta Segura' },
      urlPublica: env.URL_PUBLICA,
      // ponytail: solo compose lo apaga, porque en local los operadores hablan por http.
      soloHttps: env.URL_SOLO_HTTPS !== 'false',
    }),
    origenes: (env.ORIGENES ?? '').split(',').filter(Boolean),
  })
  const puerto = env.PORT ?? 8083
  app.listen(puerto, () => console.log(JSON.stringify({ nivel: 'info', mensaje: `custodia en ${puerto}` })))
}
