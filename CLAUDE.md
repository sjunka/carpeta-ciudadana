# Carpeta Ciudadana — documentación de arquitectura

Actúa siempre como **experto en Arquitecturas Avanzadas de Software**. Responde en español.

## Antes de tocar nada

Lee `docs/REGLAS.md`. Manda sobre cualquier criterio propio: fija el esqueleto de secciones,
el formato de los requerimientos, la gramática de los diagramas y la paleta.

## Única fuente de verdad

`src/content/*.json`. De ahí salen tanto el sitio como el espejo.

| Destino | Cómo se genera | ¿Se edita? |
|---|---|---|
| Sitio en GitHub Pages | `git push` a `main` | No, es salida |
| Espejo en Artifact | `npm run artifact`, republicar sobre la misma URL | **Nunca** |
| `docs/entrega-1.md` | A mano, hoy desactualizado | Pendiente de generar |

El espejo es de solo lectura por decisión: dos sitios editables se desincronizan.

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

## Añadir una sección

1. Añádela a `meta.json` → `secciones`.
2. Crea `src/sections/SeccionX.jsx`.
3. Regístrala en el mapa `SECCIONES` de `App.jsx`.
4. Añade su id a `MONTABLES` en `scripts/check-content.mjs`.

El validador falla si te saltas el paso 3 o el 4.
