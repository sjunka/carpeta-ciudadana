# Carpeta Ciudadana — SRS

Especificación de requerimientos del **Operador de Carpeta Ciudadana**, en el formato
ANSI/IEEE Std. 830-1984 del curso de Arquitecturas Avanzadas de Software.

- **Sitio:** https://sjunka.github.io/carpeta-ciudadana/
- **PDF:** https://sjunka.github.io/carpeta-ciudadana/srs-carpeta-ciudadana.pdf
- **Documento en markdown:** [`docs/srs-assignment1.md`](docs/srs-assignment1.md)

## Instalar y correr — un solo prompt

Abre Claude Code en la carpeta donde quieras el proyecto y pégale esto tal cual:

```
Clona https://github.com/sjunka/carpeta-ciudadana, entra en la carpeta,
lee docs/REGLAS.md y CLAUDE.md, instala las dependencias con npm install,
corre npm run check para validar el contenido y luego npm run dev.
Dime en qué URL quedó el sitio y explícame en cinco líneas de qué va el proyecto.
```

Eso es todo. Claude hace el resto.

## Cómo proponer un cambio

**Todo el texto vive en `src/content/*.json`. Nada más.** Los componentes no llevan texto,
y el sitio, el markdown y el PDF se generan desde ahí. Nunca edites el documento generado:
se sobrescribe en la siguiente construcción.

Pídeselo a Claude así:

```
Quiero cambiar <lo que sea> en el SRS.
Lee docs/REGLAS.md primero, edita el JSON que corresponda en src/content/,
corre npm run check, y si pasa, crea una rama, commitea y abre un pull request.
```

Claude conoce las reglas del entregable —cómo se redacta un requerimiento, qué numeración
usar, qué se puede tocar sin permiso— porque están en `docs/REGLAS.md` y las lee antes de
escribir. Si tu cambio rompe una regla, el validador lo dice con el motivo exacto.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Levanta el sitio en local |
| `npm run check` | Valida el contenido: identificadores, redacción, contraste, render |
| `npm run md` | Regenera el documento en markdown, los diagramas y sus PNG |
| `npm run pdf` | Regenera el PDF. Necesita `pandoc` y Google Chrome |
| `npm run build` | `check` + `md` + construcción del sitio |

## Cómo se versiona

Cada push a `main` construye y publica el sitio con GitHub Actions. El PDF **no** se
construye en CI —el runner no tiene pandoc ni Chrome—, así que se versiona ya hecho en
`public/`. Si cambias el JSON, regenera el PDF con `npm run pdf` y commitéalo en el mismo
cambio: así el documento publicado nunca se separa de la fuente.

## Dónde está cada cosa

```
src/content/    JSON — la única fuente de verdad de los textos
src/sections/   una por sección del SRS; solo componen
src/diagrams/   los diagramas como SVG en React
scripts/        validadores y generadores de markdown, PNG y PDF
docs/REGLAS.md  las reglas del entregable; se leen antes de tocar nada
public/         el PDF que descarga el botón de la barra
```

## Requisitos

Node 20 o superior. Para el PDF, además `pandoc` (`brew install pandoc`) y Google Chrome.
