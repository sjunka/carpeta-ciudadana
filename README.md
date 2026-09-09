# Carpeta Ciudadana — Documentación de arquitectura

Documentación viva del **Operador de Carpeta Ciudadana** para el curso de Arquitecturas
Avanzadas de Software. Requerimientos, atributos de calidad, contexto del sistema y los
bloqueos abiertos con el enunciado.

**Sitio publicado:** https://sjunka.github.io/carpeta-ciudadana/

## Qué contiene

| Sección | Contenido |
|---|---|
| 1 · Funcionales | 65 requerimientos en 9 dominios, con prioridad |
| 2 · No funcionales | 30 atributos de calidad con criterio de aceptación |
| 3 · Mapeo QoS | Métrica, umbral, táctica y el precio de cada táctica |
| 4 · Restricciones | 15 restricciones de diseño, 8 requerimientos inversos y el análisis de granularidad |
| 5 · Contexto | Actores, flujo y diagrama *system context artifact* |
| 6 · Casos de uso | Once casos, cada uno citando los requerimientos que realiza |
| 7 · En palabras simples | El proyecto explicado sin jerga |
| 8 · Evidencia API | La API de GovCarpeta probada en vivo |
| 9 · Bloqueos | 16 preguntas abiertas, 3 ya cerradas |

La sección 4 sale del material del curso: el *template* de especificación basado en
ANSI/IEEE Std. 830 (§3.6 y §3.7) y el módulo de arquitectura nativa de la nube
—*Twelve-Factor App*, pilares cloud native y drivers de granularidad de microservicios.

## Empezar

```sh
npm install
npm run dev
```

## Cambiar el contenido

Todo el texto está en `src/content/*.json`. Los componentes no llevan texto.
Edita el JSON, y antes de subir:

```sh
npm run check
```

El validador comprueba identificadores duplicados, referencias a bloqueos inexistentes,
prioridades inválidas, contadores desincronizados y las reglas de redacción. `npm run build`
lo ejecuta primero, así que un error de contenido no puede llegar al sitio.

## Publicación

Cada push a `main` construye y publica en GitHub Pages mediante `.github/workflows/deploy.yml`.

### Documento en markdown

`docs/entrega-1.md` y `../assignment1/simulacion-borrador.md` se **generan** desde el mismo JSON:

```sh
npm run md
```

`npm run build` lo ejecuta, así que el documento nunca se queda atrás del sitio. Ninguno de
los dos se edita a mano.

### Espejo para compartir

Existe un espejo del sitio como Artifact de Claude, útil para pasarle un enlace privado al
equipo sin darles el repositorio.

```sh
npm run artifact     # genera dist/artifact.html
```

**El espejo no se edita nunca.** Es salida del build, igual que `dist/`. Se regenera desde
`src/content/*.json` y se republica sobre la misma URL para conservar el enlace. Si algo hay
que cambiar, se cambia en el JSON y se vuelve a generar.

## Material de referencia

`docs/referencias/` no se versiona: contiene material de terceros (el documento de un
compañero y fotos de clase con nombres visibles). Se conserva solo en local.

## Reglas del proyecto

`docs/REGLAS.md` fija el esqueleto de secciones, el formato de los requerimientos y la
gramática de los diagramas. Se lee antes de cambiar nada.
