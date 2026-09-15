#!/usr/bin/env bash
# Renderiza los 4 videos de secuencia de A2 en un proyecto Remotion desechable.
# Remotion no es dependencia del sitio: se instala fuera del repo.
# Uso: bash animaciones/render.sh [directorio-temporal]
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
TMP="${1:-$(mktemp -d)}/mcs-video"
DESTINO="$REPO/public/arquitectura/video"

if [ ! -d "$TMP/node_modules" ]; then
  mkdir -p "$(dirname "$TMP")"
  (cd "$(dirname "$TMP")" && npx --yes create-video@latest --yes --blank --no-tailwind mcs-video)
  (cd "$TMP" && npm i && npm i react@18 react-dom@18)
fi

# Misma estructura de carpetas que el repo, para que los import relativos funcionen igual.
rm -rf "$TMP/animaciones" "$TMP/src"
mkdir -p "$TMP/src/arquitectura" "$TMP/src/styles"
cp -R "$REPO/animaciones" "$TMP/animaciones"
cp -R "$REPO/src/arquitectura/diagramas" "$REPO/src/arquitectura/content" "$REPO/src/arquitectura/arquitectura.css" "$TMP/src/arquitectura/"
cp "$REPO/src/styles/tokens.css" "$REPO/src/styles/diagrams.css" "$TMP/src/styles/"

mkdir -p "$DESTINO"
for op in registro login carga autenticacion; do
  (cd "$TMP" && npx remotion render animaciones/index.ts "Operacion-$op" "$DESTINO/$op.mp4" --codec=h264 --crf=26)
  # Póster: el cuadro final, con el diagrama completo y la frase de cierre.
  ffmpeg -y -loglevel error -sseof -1 -i "$DESTINO/$op.mp4" -frames:v 1 -q:v 4 "$DESTINO/$op.jpg"
done
ls -lh "$DESTINO"
