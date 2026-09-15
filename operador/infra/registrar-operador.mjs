#!/usr/bin/env node
// Registra «Mi Carpeta Segura» en GovCarpeta UNA sola vez. El contrato se contradice
// (required pide nameOperator/adress, properties define name/address), así que se envían ambos.
// Uso: CONTACTO=correo@dominio node operador/infra/registrar-operador.mjs
const GOV = 'https://govcarpeta-apis-4905ff3c005b.herokuapp.com'
const NOMBRE = 'Mi Carpeta Segura'
const PARTICIPANTES = ['Sergio Junca', 'Juan José Henao', 'Samuel Cadavid']

const operadores = async () => (await fetch(`${GOV}/apis/getOperators`)).json()

const previos = (await operadores()).filter((o) => o.operatorName === NOMBRE)
if (previos.length) {
  console.log(`Ya existe: ${JSON.stringify(previos)}. No se repite el registro.`)
  process.exit(0)
}
if (!process.env.CONTACTO) {
  console.error('Falta CONTACTO=<correo de contacto>.')
  process.exit(1)
}

const direccion = 'https://sjunka.github.io/carpeta-ciudadana/operador/'
const r = await fetch(`${GOV}/apis/registerOperator`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    name: NOMBRE, nameOperator: NOMBRE, address: direccion, adress: direccion,
    contactMail: process.env.CONTACTO, participants: PARTICIPANTES,
  }),
})
console.log(`registerOperator ${r.status}: ${await r.text()}`)

const nuestros = (await operadores()).filter((o) => o.operatorName === NOMBRE)
console.log(`Entradas con el nombre «${NOMBRE}»: ${nuestros.length}`)
if (nuestros.length === 1) console.log(`OPERADOR_ID=${nuestros[0]._id}  ← cópialo a operador/.env`)
