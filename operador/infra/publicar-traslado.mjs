#!/usr/bin/env node
// Publica en GovCarpeta dónde recibe traslados «Mi Carpeta Segura» (registerTransferEndPoint).
// Solo tiene sentido con custodia en una URL pública https (Cloud Run); en local nadie la alcanza.
// Uso: OPERADOR_ID=<id> URL_PUBLICA=https://<custodia> node operador/infra/publicar-traslado.mjs
const GOV = 'https://govcarpeta-apis-4905ff3c005b.herokuapp.com'
const { OPERADOR_ID, URL_PUBLICA } = process.env

if (!OPERADOR_ID || !URL_PUBLICA?.startsWith('https://')) {
  console.error('Faltan OPERADOR_ID o una URL_PUBLICA https.')
  process.exit(1)
}
const r = await fetch(`${GOV}/apis/registerTransferEndPoint`, {
  method: 'PUT',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    idOperator: OPERADOR_ID,
    endPoint: `${URL_PUBLICA}/api/transferCitizen`,
    endPointConfirm: `${URL_PUBLICA}/api/transferCitizenConfirm`,
  }),
})
console.log(`registerTransferEndPoint ${r.status}: ${await r.text()}`)
