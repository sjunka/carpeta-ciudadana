#!/usr/bin/env node
// Genera el espejo del sitio como un único archivo autocontenido, listo para
// publicarse como Artifact de Claude.
//
// El espejo NO se edita nunca. Se regenera desde el build del repositorio, que
// es la única fuente de verdad. Si algo hay que cambiar, se cambia en
// src/content/*.json y se vuelve a generar.
//
// Restricciones del entorno de Artifacts que este script respeta:
//  · Sin <!doctype>, <html>, <head> ni <body>: el contenido va suelto.
//  · Solo se admiten hojas de estilo externas desde fonts.googleapis.com.
//  · Todo el JavaScript y el CSS propios van embebidos.

import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(RAIZ, 'dist')
const SALIDA = join(DIST, 'artifact.html')

const indice = readFileSync(join(DIST, 'index.html'), 'utf8')
const assets = readdirSync(join(DIST, 'assets'))

const uno = (ext, nombre) => {
  const encontrados = assets.filter((f) => f.endsWith(ext))
  if (encontrados.length !== 1) {
    console.error(`✗ Se esperaba exactamente un archivo ${ext} en dist/assets, hay ${encontrados.length}.`)
    console.error(`  El espejo solo sabe embeber un bundle. Revisa la configuración de Vite (${nombre}).`)
    process.exit(1)
  }
  return readFileSync(join(DIST, 'assets', encontrados[0]), 'utf8')
}

const css = uno('.css', 'CSS')
const js = uno('.js', 'JavaScript')

// El <title> y la etiqueta de fuentes se toman del index real para no duplicarlos aquí.
const titulo = indice.match(/<title>([^<]*)<\/title>/)?.[1] ?? 'Carpeta Ciudadana'
const fuentes = indice.match(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]*>/)?.[0] ?? ''

if (!fuentes) {
  console.error('✗ No se encontró el enlace a Google Fonts en dist/index.html.')
  process.exit(1)
}

const marca = new Date().toISOString().slice(0, 10)

const salida = `<title>${titulo}</title>
${fuentes}
<!--
  Espejo generado. NO EDITAR.
  Fuente de verdad: https://github.com/sjunka/carpeta-ciudadana
  Sitio: https://sjunka.github.io/carpeta-ciudadana/
  Regenerar con: npm run artifact
  Generado el ${marca}
-->
<style>
${css}
</style>
<div id="root"></div>
<script type="module">
${js}
</script>
`

writeFileSync(SALIDA, salida)

const kb = (n) => (n / 1024).toFixed(1) + ' kB'
console.log(`✓ Espejo generado — ${SALIDA.replace(RAIZ + '/', '')} · ${kb(salida.length)}`)
console.log(`  CSS ${kb(css.length)} · JS ${kb(js.length)}`)
console.log('  Publícalo como Artifact con la URL existente para conservar el enlace.')
