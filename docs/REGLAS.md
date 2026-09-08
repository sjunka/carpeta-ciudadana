# Reglas del entregable — Carpeta Ciudadana

Este archivo manda. Se lee **antes** de tocar `simulacion-borrador.md` o el artefacto.
Si una instrucción del usuario contradice una regla de aquí, gana el usuario y la regla se actualiza en el mismo turno.

---

## 1. Regla de estructura (la más importante)

**El esqueleto no se toca sin que el usuario lo pida explícitamente.**

Secciones fijas, en este orden y con esta numeración:

| # | Sección | Qué contiene |
|---|---|---|
| 1 | Requerimientos Funcionales | Tabla por dominio |
| 2 | Requerimientos No Funcionales | Tabla única |
| 3 | Mapeo RNF vs QoS | Tabla única |
| 4 | Diagrama de Contexto | Actores, flujo, diagrama, lógica |
| 5 | Casos de Uso | Referencia interna, no se entrega |
| 6 | El proyecto en palabras simples | Prosa |
| 7 | Evidencia de la API | Tabla + hallazgos |
| 8 | Bloqueos y preguntas | Fichas |

**Comportamiento fijo de las tablas.** La cabecera de cada tabla queda fija bajo la navegación
mientras se recorren sus filas, y se suelta al terminar esa tabla. Se consigue con `position:sticky`
en `thead th` anclado a `--navh`, que se mide en runtime. Para que funcione, `.tw` **no puede** crear
un contenedor de scroll: por encima de 1060 px lleva `overflow-x:visible`; por debajo vuelve a
`auto` para que las tablas anchas se puedan desplazar en horizontal. No revertir sin pedirlo.

Cambios permitidos sin preguntar: **contenido dentro de una sección** — añadir filas, corregir texto, mejorar un diagrama, reordenar filas de una tabla.

Cambios que requieren permiso: añadir o quitar una sección, renumerar, cambiar el orden, cambiar la paleta, cambiar la tipografía, cambiar el layout de la página.

---

## 2. Cómo se escribe un requerimiento

Formato copiado del material de referencia del curso. Es el que el profesor está leyendo, así que es el que usamos.

**Funcional** — cuatro columnas:

| ID | Requerimiento | Descripción | Prioridad |
|---|---|---|---|
| RF-01.1 | Registro de ciudadano | El operador debe permitir la inscripción de un ciudadano capturando sus datos básicos. | Alta |

**No funcional** — cuatro columnas:

| ID | Atributo de calidad | Requerimiento | Criterio de aceptación |
|---|---|---|---|

**Mapeo QoS** — cinco columnas:

| ID | Requerimiento No Funcional | Atributo de QoS | Métrica o indicador | Objetivo / umbral |
|---|---|---|---|---|

Reglas de redacción:

- **Una frase por requerimiento.** Si necesitas dos, son dos requerimientos.
- **Sujeto explícito y siempre el mismo**: «El sistema debe…», «El operador debe…», «El ciudadano debe poder…», «El centralizador debe…». Nunca «se debe» ni «hay que».
- **Verbo en presente, obligación con "debe".** Nada de «debería», «podría», «se recomienda».
- **La columna Requerimiento es un nombre corto**, dos a cuatro palabras, sin verbo: «Validación de afiliación única», «Carga inicial del documento de identidad».
- **La descripción no repite el nombre.** Explica el qué y el porqué, no el cómo.
- **Cero jerga sin traducir.** Si entra un término técnico, la primera vez lleva su explicación entre comas.
- **Los números van en el criterio de aceptación, no en la descripción.**
- **Prioridad: Alta / Media / Baja.** Alta = sin esto no hay MVP.

---

## 3. Numeración

- Funcionales jerárquicos por dominio: `RF-01.1`, `RF-01.2`, … donde `RF-01` es el dominio.
- No funcionales planos: `RNF-01`, `RNF-02`, …
- Casos de uso: `CU-01`, y cada uno cita los RF y RNF que realiza.
- Bloqueos: `B-01`, …
- **Los identificadores nunca se reciclan.** Si un requerimiento muere, su ID muere con él.

---

## 4. Cómo se marca lo que no está confirmado

Tres marcas, y solo tres:

| Marca | Significado |
|---|---|
| **Del PDF** | Sale literal del caso de estudio. |
| **Asunción** | Lo pusimos nosotros. Todo número inventado lleva esta marca. |
| **Bloqueo B-xx** | No se puede decidir; está escalado al profesor. |

Un requerimiento sin marca es un requerimiento confirmado. No se marca nada «por si acaso».

---

## 5. Cómo se hace un diagrama

**Modelo de referencia: el *system context artifact* de la lámina del profesor (IBM).** Se copia su gramática:

- El sistema en construcción es **un círculo** en el centro.
- **Personas a la izquierda**, separadas por una línea roja punteada vertical rotulada **«Línea de automatización»**.
- **Sistemas TI a la derecha**, separados por una línea punteada vertical rotulada **«Integración con…»**.
- Las flechas se rotulan con **los datos que viajan**, en lista apilada de sustantivos: «Detalles del pedido / Datos de pago». Nunca con verbos.
- Una flecha por sentido. Nada de flechas de doble punta.

Reglas técnicas, heredadas del skill `diagram-design`:

- Conectores en ángulo recto redondeado. Diagonales, no.
- Toda etiqueta lleva máscara opaca detrás y **6–10 px de aire** respecto a su línea.
- Máximo **9 nodos y 12 flechas** por diagrama. Si te pasas, son dos diagramas.
  - *Excepción única:* el diagrama de casos de uso. Su gramática son bloques, no nodos sueltos: se cuentan los **bloques** (máximo 3), y cada actor se conecta al bloque, nunca a cada elipse. Así el lector procesa tres cosas, no once.
- Acento de color en **1 o 2 elementos**, nunca más.
- Coordenadas y tamaños múltiplos de 4.
- Leyenda en tira horizontal abajo, nunca flotando dentro del dibujo.
- Verificar con `self_check.py` y `verify-geometry.py` antes de publicar.

---

## 6. Cómo se explica algo

Para las secciones de prosa (4, 6 y los pies de diagrama):

- **Frases cortas.** Si una frase pasa de dos líneas, se parte.
- **Primero la idea, después el detalle.** El primer párrafo tiene que servir solo.
- **Se explica con el ejemplo del caso**, no en abstracto: Andrés, el MEN, la embajada.
- **Analogía antes que definición** cuando el concepto es nuevo.
- Se mantiene el término técnico exacto, pero **se traduce la primera vez**.
- **Nada de relleno**: sin «cabe destacar», «es importante mencionar», «en el mundo actual».
- **Sin listas de tres por costumbre.** Si hay dos cosas, van dos.
- Pie de diagrama: **lo más corto posible**. El diagrama ya explicó; el texto solo cierra.

---

## 7. Qué no se hace nunca

- Inventar un número sin marcarlo como asunción.
- Copiar texto del documento de un compañero. Se toma la idea y se reescribe con estas reglas.
- Añadir un requerimiento que el caso no sostiene, para rellenar.
- Tocar la paleta, la tipografía o el layout del artefacto.
- Publicar un diagrama sin pasar las dos verificaciones.
- Dejar el artefacto y `simulacion-borrador.md` desincronizados.

---

## 8. Sistema de diseño — Notion

Los tokens viven en `src/styles/tokens.css`. `docs/DESIGN.md` es el sistema de diseño del
**producto** Carpeta Ciudadana: manda en color, contraste, iconografía y tema, y de ahí salen
las reglas transversales que este documento también cumple.
**En las hojas de estilo no se escribe ningún hex.** Todo sale de un token.

Las siete reglas que no se rompen:

1. **Un solo acento estructural: el azul `--primary`.** Pinta acciones, enlaces, el indicador
   de sección activa y el foco. Nada más lo usa.
2. **La paleta de stickers solo decora y marca estado.** Nunca pinta una acción ni una
   estructura. Aquí se usa para: `--st-caso` verde (confirmado), `--st-asuncion` naranja
   (lo inventamos), `--st-bloqueo` morado (escalado al profesor).
3. **La jerarquía la lleva el peso, no el color.** La prioridad Alta es una píldora de tinta
   sólida, Media es contorno, Baja es tinta tenue. Tres colores para tres niveles sería ruido.
4. **La página vive en papel cálido `--canvas-soft`; las tarjetas son blancas `--surface`.**
   Ese contraste crea figura y fondo sin necesidad de sombras.
5. **La elevación es filete más `--e-1`.** Nunca una sombra dura. El único momento invertido
   de la página es la portada, con la banda noche `--secondary`. No se repite en ninguna otra.
6. **Los dos temas cumplen AA, y lo comprueba `npm run check`.** Un token de relleno no vale
   como color de texto sobre ese mismo relleno al invertir el tema: para eso están
   `--primary-text`, `--on-accent` y `--ink-faint-text`. `--ink-faint` solo pinta líneas.
7. **Los iconos son Lucide, nunca emojis.** 20px y trazo 1.75 en controles, `aria-hidden`
   cuando van con texto. Un estado nunca se comunica solo con color ni solo con un icono.

Radios: campos 4px, botones utilitarios 8px, tarjetas 12px, contenedores grandes 16px,
píldoras y avatares `--r-full`. Los campos de formulario nunca llevan radio de píldora.

Tipografía: **Inter** en todo, sustituyendo a NotionInter. Los titulares van en 700 con
tracking negativo explícito, que se hace más negativo cuanto mayor es el tamaño. El cuerpo
se queda en 400. **IBM Plex Mono** solo para identificadores, rutas y código.

En los diagramas: el sistema en construcción va en `--ink-secondary` con texto claro; el flujo
crítico usa `--primary`; la línea de automatización usa `--accent-orange` porque marca una
frontera, no una acción.
