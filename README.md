# Carpeta Ciudadana — Documentación de arquitectura

Documentación viva del **Operador de Carpeta Ciudadana** para el curso de Arquitecturas
Avanzadas de Software. Requerimientos, atributos de calidad, contexto del sistema y los
bloqueos abiertos con el enunciado.

**Sitio publicado:** https://sjunka.github.io/carpeta-ciudadana/

## Qué contiene

| Sección | Contenido |
|---|---|
| 1 · Funcionales | 65 requerimientos en 9 dominios, con prioridad |
| 2 · No funcionales | 28 atributos de calidad con criterio de aceptación |
| 3 · Mapeo QoS | Métrica, umbral, táctica y el precio de cada táctica |
| 4 · Contexto | Actores, flujo y diagrama *system context artifact* |
| 5 · Casos de uso | Once casos, cada uno citando los requerimientos que realiza |
| 6 · En palabras simples | El proyecto explicado sin jerga |
| 7 · Evidencia API | La API de GovCarpeta probada en vivo |
| 8 · Bloqueos | 16 preguntas abiertas, 3 ya cerradas |

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

## Material de referencia

`docs/referencias/` no se versiona: contiene material de terceros (el documento de un
compañero y fotos de clase con nombres visibles). Se conserva solo en local.

## Reglas del proyecto

`docs/REGLAS.md` fija el esqueleto de secciones, el formato de los requerimientos y la
gramática de los diagramas. Se lee antes de cambiar nada.
