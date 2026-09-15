# Carpeta Ciudadana — documentación de arquitectura

Actúa siempre como **experto en Arquitecturas Avanzadas de Software**. Responde en español.

## Antes de tocar nada

Lee `docs/REGLAS.md`. Manda sobre cualquier criterio propio: fija el esqueleto de secciones,
el formato de los requerimientos, la gramática de los diagramas y la paleta.

## Única fuente de verdad

`src/content/*.json`. De ahí sale todo lo demás.

| Destino | Cómo se genera | ¿Se edita? |
|---|---|---|
| Sitio en GitHub Pages | `git push` a `main` | No, es salida |
| `docs/srs-assignment1.md` y `../assignment1/srs-assignment1.md` | `npm run md` | **Nunca**, son salida |
| Diagramas HTML y PNG de `../assignment1/diagramas/` | `npm run md` | **Nunca**, son salida |
| `public/srs-carpeta-ciudadana.pdf` | `npm run pdf`, y se commitea | **Nunca**, es salida |

## Cómo se cambia el contenido

**Todo el texto vive en `src/content/*.json`. Los componentes no llevan texto.**
Para cambiar un requerimiento, una tabla o un párrafo, edita el JSON. No toques el JSX.

Después de cualquier cambio de contenido:

```sh
npm run check     # valida el contenido; falla con el motivo exacto
npm run dev       # revisa en el navegador
```

`npm run build` corre `check` primero, así que un error de contenido nunca llega a publicarse.

## Qué valida `npm run check`

- Los identificadores son únicos y siguen el formato (`RF-NN.N`, `RNF-NN`, `B-NN`).
- Cada requerimiento pertenece al dominio que dice su identificador.
- La descripción empieza con sujeto explícito y termina en punto — regla 2 de `REGLAS.md`.
- La prioridad es Alta, Media o Baja.
- Toda referencia a un bloqueo apunta a un bloqueo que existe.
- Todo RNF citado en el mapeo QoS existe.
- Cada restricción de diseño cita su fuente y cada requerimiento inverso dice qué NO se hace.
- El análisis de granularidad cubre los nueve dominios y usa solo los cinco drivers de la clase.
- Los contadores de la portada cuadran con los datos reales.
- Cada par texto/fondo cumple WCAG AA en los dos temas, incluidos los diagramas, y los dos
  bloques del tema oscuro (por preferencia del sistema y por atributo) no se han desincronizado.

Si el validador se queja de una regla que ya no aplica, se cambia **la regla en `docs/REGLAS.md`
y el validador en `scripts/check-content.mjs`**, en el mismo commit. Nunca se salta la validación.

## Estructura

```
src/
  content/     JSON — única fuente de verdad de los textos
  components/  piezas reutilizables, sin texto propio
  sections/    una por sección del documento; solo compone
  diagrams/    SVG como componentes React
  hooks/       comportamiento (nav pegajosa, sección activa, pasos del diagrama)
  styles/      tokens.css · app.css · diagrams.css
docs/          reglas, contexto del curso y la entrega en markdown
scripts/       validadores de contenido y de contraste
```

## Entrega 2 · Arquitectura

A1 (`src/content`) queda congelada en v1.0 y su salida byte-idéntica. A2 es aditiva:

| Pieza | Dónde |
|---|---|
| Contenido (única fuente de verdad) | `src/arquitectura/content/*.json` |
| Página | `arquitectura/index.html` → `/carpeta-ciudadana/arquitectura/` |
| Validador, md y diagramas | `scripts/arquitectura/` (encadenados en `npm run check`, `md`, `pdf`) |
| Implementación «Mi Carpeta Segura» | `operador/` (contratos, servicios, identidad, web, infra, e2e) |
| Salidas (no se editan) | `docs/arquitectura-assignment2.md`, `../assignment2/`, `public/arquitectura/` |

Reglas de A2: parte A2 de `docs/REGLAS.md`. Entrega N: `src/<slug>/` + `<slug>/index.html` +
`scripts/<slug>/` + `assignmentN/`.

## Añadir una sección

1. Añádela a `meta.json` → `secciones`.
2. Crea `src/sections/SeccionX.jsx`.
3. Regístrala en el mapa `SECCIONES` de `App.jsx`.
4. Añade su id a `MONTABLES` en `scripts/check-content.mjs`.
5. Añade su bloque a `scripts/build-md.mjs` para que salga también en el documento.

El validador falla si te saltas el paso 3 o el 4.

## Agent skills

### Issue tracker

Los issues viven en GitHub Issues de `sjunka/carpeta-ciudadana`, vía el CLI `gh`. Ver `docs/agents/issue-tracker.md`.

### Domain docs

Repo de contexto único: `CONTEXT.md` en la raíz y ADRs en `docs/adr/`. Ver `docs/agents/domain.md`.
