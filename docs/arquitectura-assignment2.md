# Carpeta Ciudadana · Arquitectura

*Arquitectura · v1.0 · Assignment 2*

Arquitectura del operador **Mi Carpeta Segura**: historias de usuario, microservicios, secuencias, despliegue y decisiones en plantilla UAM. Sale del SRS de la entrega 1, que no se modifica, e implementa cuatro operaciones contra GovCarpeta: registro, ingreso, carga y autenticación de documentos.

| Dato | Valor |
|---|---|
| Versión | 1.0 · 20 sep 2026 |
| Equipo | Sergio Junca, Juan José Henao, Samuel Cadavid |
| Docente | Fabián Pinzón |
| Historias | 12 · 4 implementadas |
| Microservicios | 11 · 4 implementados |
| Decisiones | 12 en plantilla UAM |
| Base | SRS v1.0 congelado |

> Documento generado desde `src/arquitectura/content/*.json` con `npm run md`. No se edita a mano.

# 01 Introducción y trazabilidad

Qué describe este documento, qué hereda del SRS y cómo cambian los supuestos abiertos de la entrega 1.

Este documento fija la arquitectura del operador **Mi Carpeta Segura** y demuestra que funciona implementando cuatro operaciones reales contra el centralizador GovCarpeta. El SRS dijo *qué* debe hacer el sistema; aquí se decide *cómo* se reparte en piezas, dónde corren y por qué.

## 1.1 Alcance

- **Arquitectura objetivo:** los once microservicios, el bus de eventos y la plataforma multi-región que exige la escala del país (RNF-08).
- **Prototipo de la entrega 2:** registro, ingreso, carga de documento temporal y autenticación vía GovCarpeta, desplegados en Docker Compose y en Cloud Run.
- **Fuera del alcance:** transferencia entre operadores, notificaciones, analítica y Premium. Quedan diseñados, no implementados.

## 1.2 Glosario

| Término | Definición |
|---|---|
| Mi Carpeta Segura | Nombre de nuestro operador ante GovCarpeta. |
| Pasarela ACL | Capa anticorrupción, el adaptador que traduce el contrato de GovCarpeta a un modelo propio y aísla sus fallos. |
| URL prefirmada | Dirección temporal firmada que da permiso para leer o escribir un objeto del almacén sin credenciales. |
| PKCE | Proof Key for Code Exchange: prueba criptográfica que impide reutilizar un código OIDC robado desde una aplicación pública. |
| UAM | Unified Architecture Method, cuya plantilla de decisión usamos en *6. |
| Cloud Run | Servicio de GCP que ejecuta contenedores sin administrar servidores y escala a cero. |

## 1.3 Qué hereda del SRS y qué cambia

| Supuesto | En el SRS | En la arquitectura |
|---|---|---|
| B-12 | No se sabía si el entregable incluía implementar el operador. | Resuelto: la entrega 2 lo pide y cuatro operaciones quedan implementadas y probadas de extremo a extremo. |
| B-03 | Sin Autoridad Certificadora ni formato de firma definidos. | Se mantiene como asunción: la respuesta de authenticateDocument se guarda como sello del centralizador, nunca como certificado. |
| B-06 | Registraduría y correo entrante: ¿integración real o simulada? | Se mantiene: la verificación de identidad es simulada y así lo dice HU-01. |
| B-09 | Sin autenticación definida hacia el centralizador. | GovCarpeta no la exige; la pasarela queda sin acceso público y exige ID token de Google a quien la llama. |
| B-10 | Sin compromiso de disponibilidad del centralizador. | Timeout, reintento y circuit breaker en la pasarela: si el centralizador cae, el registro queda pendiente y nunca se asume libre al ciudadano. |
| B-16 | 54 de 70 operadores no publican transferAPIURL. | No publicamos transferAPIURL hasta implementar RF-03. |

El SRS queda congelado en v1.0. Este documento cita sus identificadores y no los cambia: si una decisión exigiera tocar un requerimiento, entraría por el proceso de cambios del SRS (*5 de A1).

# 02 Historias de usuario

Doce historias con escenario principal y alternos. Las cuatro primeras están implementadas y cada criterio tiene su prueba.

Cada historia sigue el formato del ejemplo de la clase: quién, qué quiere y para qué, criterios verificables, escenario principal que alterna actor y sistema, y al menos un escenario alterno. El campo *Realiza* la ata a los requerimientos del SRS.

### 2.1 Mapa de historias del ciudadano

![Mapa de historias del ciudadano](../../assignment2/diagramas/mapa-historias.png)

- 1 · Afiliarse: registro implementado; traslado de operador diseñado.
- 2 · Ingresar: login implementado; consulta de accesos diseñada.
- 3 · Guardar: carga y autenticación implementadas; recepción y descarga diseñadas.
- 4 · Compartir: autorización y envío a no afiliadas, diseñadas.
- 5 · Valor: PQRS Premium y analítica para el Estado, diseñadas.

Trazabilidad: HU-01, HU-02, HU-03, HU-04, HU-05, HU-06, HU-07, HU-08, HU-09, HU-10, HU-11, HU-12

## 2.2 Historias

### HU-01 · Registro y afiliación (Implementada)

**Como** ciudadano colombiano sin operador, **quiero** registrarme en Mi Carpeta Segura con mi cédula **para** tener una carpeta digital oficial y una cuenta institucional.

**Criterios de aceptación**

- Si la cédula ya está afiliada a otro operador, el sistema rechaza el registro con 409 y dice a qué operador pertenece.
- Si el centralizador no responde, el registro queda pendiente con 503 y nunca se crea la cuenta.
- La cuenta institucional sigue el formato nombre.apellido.NNNNN@carpetacolombia.co y es única.
- Al centralizador solo viajan id, nombre, dirección, correo institucional y operador.

**Escenario principal**

1. **Ciudadano:** Abre «Crear mi carpeta» e ingresa cédula, nombre, apellido, dirección y correo de contacto.
2. **Sistema:** Valida el formato de los campos y simula la verificación de identidad (B-06).
3. **Sistema:** Consulta a GovCarpeta si la cédula ya tiene operador y recibe 204: está libre.
4. **Sistema:** Deriva la cuenta institucional y crea el usuario deshabilitado en Keycloak.
5. **Sistema:** Registra al ciudadano en GovCarpeta con operador Mi Carpeta Segura y recibe 201.
6. **Sistema:** Habilita el usuario y muestra la cuenta institucional.
7. **Ciudadano:** Define su contraseña y queda listo para ingresar.

**Escenarios alternos**

*Ya afiliado a otro operador*

- 3a. GovCarpeta responde 200 con el operador en prosa.
- 3b. El sistema extrae el nombre del operador y responde 409.
- 3c. El portal ofrece el traslado (HU-09) en lugar del registro.

*Centralizador caído*

- 3a. La pasarela agota 8 s o el circuit breaker está abierto.
- 3b. El sistema responde 503 y guarda la solicitud como pendiente.
- 3c. El portal pide intentar más tarde; no se crea ninguna cuenta.

*GovCarpeta rechaza el alta*

- 5a. GovCarpeta responde 501 o 500.
- 5b. El sistema borra el usuario de Keycloak (compensación) y responde 502.

Realiza: RF-01.1, RF-01.2, RF-01.3, RF-01.5, RF-06.2, RD-15, RNF-21, RI-03 · Prueba: `operador/e2e/registro.spec.js`

### HU-02 · Ingreso al operador (Implementada)

**Como** ciudadano afiliado, **quiero** ingresar con mi cuenta institucional y contraseña **para** ver mi carpeta sin que nadie más pueda hacerlo.

**Criterios de aceptación**

- El portal usa OIDC Authorization Code con PKCE S256; nunca maneja la contraseña.
- Tras 5 intentos fallidos la cuenta se bloquea temporalmente.
- La sesión expira tras 30 minutos de inactividad y el access token dura 5 minutos.
- «Salir» cierra la sesión en Keycloak, no solo en el navegador.

**Escenario principal**

1. **Ciudadano:** Pulsa «Ingresar».
2. **Sistema:** Redirige a Keycloak con code_challenge y state.
3. **Ciudadano:** Escribe cuenta institucional y contraseña en la página en español del operador.
4. **Sistema:** Valida credenciales y devuelve un código de autorización al portal.
5. **Sistema:** El portal canjea el código con el code_verifier y recibe los tokens.
6. **Sistema:** Muestra «Mi carpeta» con los documentos del titular.

**Escenarios alternos**

*Credenciales inválidas repetidas*

- 4a. Keycloak rechaza la contraseña y muestra el error en español.
- 4b. Al quinto intento bloquea la cuenta y lo informa sin decir si el usuario existe.

*Sesión expirada*

- 6a. La custodia responde 401 por token vencido.
- 6b. El portal intenta renovar en silencio; si no puede, vuelve a pedir ingreso.

Realiza: RF-09.1, RNF-11, RNF-10 · Prueba: `operador/e2e/login.spec.js`

### HU-03 · Carga de documento temporal (Implementada)

**Como** ciudadano con sesión, **quiero** subir un PDF o una foto de un documento **para** tenerlo a mano aunque no venga firmado por una entidad.

**Criterios de aceptación**

- Se aceptan PDF, JPG y PNG de hasta 10 MB.
- Cada ciudadano tiene un tope de 20 documentos temporales y 200 MB.
- El binario va del navegador al almacén con una URL prefirmada de 5 minutos; nunca pasa por el servicio.
- Al confirmar, el servicio comprueba tamaño, tipo y SHA-256; si no cuadran, borra el objeto.

**Escenario principal**

1. **Ciudadano:** Pulsa «Subir documento», elige el archivo y le pone un título.
2. **Sistema:** Verifica tipo, tamaño y cuota, y registra el documento como pendiente.
3. **Sistema:** Entrega una URL prefirmada PUT de 5 minutos.
4. **Ciudadano:** El navegador sube el archivo directo al almacén.
5. **Sistema:** Confirma tamaño, tipo y SHA-256 y marca el documento como cargado.
6. **Ciudadano:** Ve la tarjeta del documento con estado «Temporal · sin firma».

**Escenarios alternos**

*Cuota llena*

- 2a. El ciudadano ya tiene 20 documentos o 200 MB.
- 2b. El sistema responde 422 y el portal explica cuánto espacio libre queda.

*Archivo no permitido*

- 2a. El tipo no es PDF, JPG ni PNG, o pesa más de 10 MB.
- 2b. El sistema responde 415 o 413 sin emitir URL.

*Archivo alterado tras la firma de la URL*

- 5a. El objeto subido no coincide con el tamaño o tipo declarados.
- 5b. El sistema borra el objeto y responde 422.

Realiza: RF-02.2, RF-02.3, RNF-24, RI-06 · Prueba: `operador/e2e/carga.spec.js`

### HU-04 · Autenticación vía GovCarpeta (Implementada)

**Como** ciudadano con un documento cargado, **quiero** pedir que el centralizador autentique mi documento **para** tener constancia de que el documento pasó por el centralizador.

**Criterios de aceptación**

- Al centralizador viaja una URL prefirmada GET de 15 minutos, nunca el contenido.
- Solo el titular del documento puede pedir su autenticación; otro usuario recibe 403.
- La respuesta en prosa del centralizador se normaliza y se guarda con fecha.
- El portal lo muestra como «Autenticado por el centralizador», nunca como «certificado» (B-03).

**Escenario principal**

1. **Ciudadano:** Abre el detalle del documento y pulsa «Autenticar con el centralizador».
2. **Sistema:** Comprueba que el documento es del titular y está cargado.
3. **Sistema:** Firma una URL GET de 15 minutos.
4. **Sistema:** La pasarela envía cédula, URL y título a authenticateDocument.
5. **Sistema:** Normaliza la respuesta y marca el documento como autenticado.
6. **Ciudadano:** Ve el nuevo estado con la fecha y el texto del centralizador.

**Escenarios alternos**

*Documento ajeno*

- 2a. El dueño del documento no coincide con el usuario del token.
- 2b. El sistema responde 403 sin revelar si el documento existe.

*GovCarpeta responde error*

- 4a. El centralizador responde 4xx, 5xx o no contesta en 8 s.
- 4b. El documento sigue cargado y el portal ofrece reintentar.

Realiza: RF-06.6, RF-02.5, RI-01, RNF-21 · Prueba: `operador/e2e/autenticacion.spec.js`

### HU-05 · Recepción de documento emitido (Diseñada)

**Como** ciudadano afiliado, **quiero** recibir en mi carpeta el diploma que emite mi universidad **para** no tener que ir a pedirlo en papel.

**Criterios de aceptación**

- El documento llega con su firma intacta y metadatos completos.
- Una entrega repetida no duplica el documento.
- El ciudadano recibe un aviso por correo.

**Escenario principal**

1. **Entidad:** Emite el documento firmado dirigido a la cédula.
2. **Sistema:** Recibe el documento, verifica la firma y lo guarda como vigente.
3. **Sistema:** Publica el evento de recepción y avisa al ciudadano.
4. **Ciudadano:** Encuentra el diploma en su carpeta.

**Escenarios alternos**

*Firma inválida*

- 2a. La firma no verifica.
- 2b. El documento queda rechazado y la entidad recibe el motivo.

Realiza: RF-03.2, RF-03.3, RF-05.1, RNF-05

### HU-06 · Consulta y descarga (Diseñada)

**Como** ciudadano con sesión, **quiero** buscar y descargar un documento de mi carpeta **para** presentarlo donde me lo pidan.

**Criterios de aceptación**

- La lista responde en menos de 2 s en p95.
- La descarga usa una URL prefirmada de corta vida.

**Escenario principal**

1. **Ciudadano:** Filtra su carpeta por tipo o entidad.
2. **Sistema:** Devuelve la lista desde el índice de carpeta.
3. **Ciudadano:** Pulsa «Descargar».
4. **Sistema:** Entrega una URL prefirmada GET y registra el acceso.

**Escenarios alternos**

*Almacén no disponible*

- 4a. El almacén no responde.
- 4b. El portal muestra el documento en la lista y ofrece reintentar la descarga.

Realiza: RF-02.6, RF-02.7, RNF-04, RNF-01

### HU-07 · Autorización documento a documento (Diseñada)

**Como** ciudadano que recibe una petición, **quiero** elegir qué documentos comparto con una entidad **para** controlar quién ve cada documento.

**Criterios de aceptación**

- Ningún documento sale sin autorización explícita del titular.
- La autorización tiene vigencia y se puede revocar.

**Escenario principal**

1. **Entidad:** Pide al ciudadano su diploma y su certificado laboral.
2. **Sistema:** Muestra la petición con lo que se pide y para qué.
3. **Ciudadano:** Marca solo el diploma y pulsa «Autorizar diploma».
4. **Sistema:** Registra la autorización y entrega únicamente ese documento.

**Escenarios alternos**

*Petición rechazada*

- 3a. El ciudadano pulsa «Rechazar».
- 3b. La entidad recibe el rechazo sin detalle de la carpeta.

Realiza: RF-04.3, RF-04.4, RF-04.5, RI-08

### HU-08 · Envío a entidad no afiliada (Diseñada)

**Como** ciudadano, **quiero** enviar un paquete de documentos a una entidad sin operador **para** hacer un trámite con quien no está en la federación.

**Criterios de aceptación**

- El paquete viaja como enlace de corta vida, no como adjunto.
- El envío queda en la bitácora de accesos.

**Escenario principal**

1. **Ciudadano:** Arma el paquete y escribe el correo de la entidad.
2. **Sistema:** Genera un enlace con vigencia de 72 horas.
3. **Sistema:** Envía el enlace por correo y registra el envío.

**Escenarios alternos**

*Confidencialidad en duda*

- 2a. El caso exige correo y la confidencialidad lo contradice (B-14).
- 2b. Se envía solo el enlace y el contenido nunca va adjunto.

Realiza: RF-04.1, RF-04.2, RF-03.4

### HU-09 · Traslado de operador (Diseñada)

**Como** ciudadano afiliado a otro operador, **quiero** trasladar mi carpeta a Mi Carpeta Segura **para** cambiar de proveedor sin perder documentos.

**Criterios de aceptación**

- Durante el traslado el ciudadano nunca queda afiliado a dos operadores.
- Todos los documentos llegan con su firma.

**Escenario principal**

1. **Ciudadano:** Solicita el traslado desde el portal.
2. **Sistema:** Pide al operador origen la carpeta completa.
3. **Sistema:** Recibe y verifica los documentos.
4. **Sistema:** Cambia la afiliación en GovCarpeta y confirma al origen.

**Escenarios alternos**

*Operador origen sin transferAPIURL*

- 2a. El operador origen no publica dirección (B-16).
- 2b. El traslado queda pendiente y se informa al ciudadano.

Realiza: RF-01.7, RF-01.8, RI-03, RNF-22

### HU-10 · Caso PQRS Premium (Diseñada)

**Como** empresa cliente Premium, **quiero** abrir un caso y pedir desde él los documentos de un ciudadano **para** resolver trámites sin papel.

**Criterios de aceptación**

- La petición desde el caso sigue la autorización de HU-07.
- El uso se mide para facturar.

**Escenario principal**

1. **Empresa:** Abre un caso PQRS.
2. **Sistema:** Crea el caso y habilita la petición de documentos.
3. **Empresa:** Pide los documentos al ciudadano.
4. **Sistema:** Lanza el flujo de autorización y mide el uso.

**Escenarios alternos**

*Empresa sin plan*

- 2a. La empresa no tiene plan Premium activo.
- 2b. El sistema ofrece el catálogo sin crear el caso.

Realiza: RF-07.2, RF-07.3, RI-07

### HU-11 · Consulta de accesos (Diseñada)

**Como** ciudadano con sesión, **quiero** ver quién consultó mis documentos **para** detectar un acceso indebido.

**Criterios de aceptación**

- Cada acceso muestra quién, cuándo y qué documento.
- La bitácora no se puede alterar.

**Escenario principal**

1. **Ciudadano:** Abre «Actividad de mi carpeta».
2. **Sistema:** Consulta la auditoría filtrada por titular.
3. **Ciudadano:** Revisa la lista de accesos.

**Escenarios alternos**

*Acceso sospechoso*

- 3a. El ciudadano no reconoce un acceso.
- 3b. Pulsa «No fui yo» y el sistema cierra sus sesiones.

Realiza: RF-09.5, RF-09.4, RNF-14

### HU-12 · Analítica anonimizada (Diseñada)

**Como** analista del Estado, **quiero** consultar cuántos diplomas se emitieron por región **para** planear política educativa con datos.

**Criterios de aceptación**

- Ningún resultado permite identificar a un ciudadano.
- Las consultas no afectan el rendimiento de la carpeta.

**Escenario principal**

1. **Analista:** Abre el tablero de educación.
2. **Sistema:** Consulta metadatos anonimizados en el almacén analítico.
3. **Analista:** Filtra por región y año.

**Escenarios alternos**

*Grupo demasiado pequeño*

- 2a. El filtro deja menos de 10 personas.
- 2b. El sistema suprime el valor para evitar reidentificación.

Realiza: RF-08.1, RF-08.2, RF-08.6, RNF-15

# 03 Microservicios y componentes

Once microservicios que salen del análisis de granularidad del SRS, en dos vistas lógicas y dos técnicas.

## 3.1 Microservicios y responsabilidades

La tabla sale del análisis de granularidad del SRS (*4.3 de A1): donde el veredicto fue **Partir en dos** hay dos microservicios; donde fue **Aislar** o **Mantener unido**, uno; el centralizador, **Fuera del alcance**, solo tiene su pasarela.

| ID | Microservicio | Responsabilidad | Dominio · veredicto | API | Eventos | Datos | Estado |
|---|---|---|---|---|---|---|---|
| MS-01 | Identidad y acceso | Autentica a ciudadanos y servicios y emite los tokens que el resto valida. | RF-09 · Partir en dos | OIDC · Admin REST de Keycloak | Emite: sesión iniciada, cuenta bloqueada | PostgreSQL keycloak | Implementado |
| MS-02 | Auditoría | Guarda de forma inalterable quién hizo qué sobre cada carpeta. | RF-09 · Partir en dos | GET /accesos | Consume: todos los eventos de acceso | Bucket WORM + BigQuery | Diseñado |
| MS-03 | Afiliación | Registra ciudadanos garantizando afiliación única contra el centralizador. | RF-01 · Aislar | POST /ciudadanos | Emite: ciudadano afiliado | PostgreSQL afiliacion | Implementado |
| MS-04 | Custodia documental | Guarda el contenido de los documentos y controla quién puede leerlo o escribirlo. | RF-02 · Partir en dos | POST /documentos · confirmacion · autenticacion | Emite: documento cargado, documento autenticado | PostgreSQL custodia + almacén S3 | Implementado |
| MS-05 | Índice de carpeta | Sirve las consultas de la carpeta separadas de las escrituras de contenido. | RF-02 · Partir en dos | GET /carpeta | Consume: documento cargado, recibido, autenticado | Réplica de lectura + caché | Diseñado. En el prototipo la lista la sirve MS-04. Se separa si las lecturas superan 100 por escritura o el p95 pasa de 2 s (RNF-04). |
| MS-06 | Autorizaciones | Decide si un documento puede salir hacia un tercero según el consentimiento del titular. | RF-04 · Aislar | POST /autorizaciones · DELETE /autorizaciones/{id} | Emite: autorización concedida, revocada | PostgreSQL autorizaciones | Diseñado |
| MS-07 | Interoperabilidad | Envía y recibe documentos de otros operadores y entidades con reintento idempotente. | RF-03 · Aislar | POST /transferencias | Emite: documento recibido | PostgreSQL bandeja de salida | Diseñado |
| MS-08 | Pasarela del centralizador | Traduce el contrato de GovCarpeta a un modelo propio y aísla sus fallos. | RF-06 · Fuera del alcance | GET/POST /centralizador/ciudadanos · PUT /centralizador/documentos/autenticacion | Ninguno | Sin base de datos | Implementado |
| MS-09 | Notificaciones | Avisa al ciudadano por el canal que prefiera. | RF-05 · Mantener unido | Sin API síncrona | Consume: documento recibido, ciudadano afiliado | Preferencias en Firestore | Diseñado. Función serverless: tráfico esporádico y procesos cortos, como indicó el profesor el 12 de septiembre. |
| MS-10 | Analítica | Consolida metadatos anonimizados para los tableros del Estado. | RF-08 · Aislar | GET /tableros | Consume: metadatos anonimizados | BigQuery en proyecto aparte | Diseñado. Nunca comparte motor con la base transaccional. |
| MS-11 | Premium | Gestiona el catálogo, los casos PQRS y la medición de uso de las empresas. | RF-07 · Aislar | POST /casos | Emite: uso medido | PostgreSQL premium | Diseñado |

## 3.2 Componentes lógicos y 3.3 técnicos

Dos vistas lógicas dicen qué piezas hay y qué se piden entre sí, sin tecnología. Dos vistas técnicas dicen con qué están hechas. Las flechas son dependencias: van de quien llama a quien responde. El <a href="mapa-tecnico.html">mapa técnico explorable</a> recorre las cuatro operaciones y el despliegue; los controles del visor están en inglés porque archify solo ofrece inglés y chino.

### 3.2.1 Componentes lógicos · núcleo

Las piezas que atienden al ciudadano en las cuatro operaciones implementadas.

![Componentes lógicos · núcleo](../../assignment2/diagramas/logico-nucleo.png)

> Solo la pasarela habla con GovCarpeta: el resto del sistema no conoce su contrato.

- 1 · El portal autentica al ciudadano contra Identidad y acceso.
- 2 · Afiliación crea el usuario y verifica identidad (simulada, B-06).
- 3 · Afiliación consulta y registra en GovCarpeta solo a través de la pasarela.
- 4 · Custodia guarda documentos y manda al centralizador una URL, nunca el contenido.
- 5 · Custodia alimenta el índice de carpeta y la auditoría.

Trazabilidad: RF-01, RF-02, RF-06, RF-09, RD-11, RD-12

### 3.2.2 Componentes lógicos · federación y valor

Las piezas diseñadas que hablan con otros operadores, con entidades y con el Estado. Se comunican por eventos.

![Componentes lógicos · federación y valor](../../assignment2/diagramas/logico-federacion.png)

> El bus desacopla: si Notificaciones cae, los documentos siguen llegando.

- 1 · Interoperabilidad recibe de entidades y entrega a operadores pares.
- 2 · Ningún documento sale sin consultar Autorizaciones.
- 3 · Todo hecho de negocio se publica en el bus de eventos.
- 4 · Custodia consume la recepción y guarda el documento.
- 5 · Notificaciones y Analítica reaccionan sin estar en el camino crítico.

Trazabilidad: RF-03, RF-04, RF-05, RF-07, RF-08, RNF-07

### 3.3.1 Componentes técnicos · prototipo

Lo que corre hoy: una SPA, Keycloak y tres servicios Express, con PostgreSQL y un almacén compatible con S3.

![Componentes técnicos · prototipo](../../assignment2/diagramas/tecnico-prototipo.png)

> El binario va del navegador al almacén: ningún servicio lo carga en memoria.

- 1 · La SPA inicia sesión con Keycloak por OIDC y PKCE.
- 2 · afiliacion crea el usuario en Keycloak y guarda la afiliación en su base.
- 3 · afiliacion llega a GovCarpeta a través de la pasarela.
- 4 · La SPA sube el binario directo al almacén con la URL que firma custodia.
- 5 · custodia pide la autenticación a la pasarela con un ID token.

Trazabilidad: RD-02, RD-05, RD-06, RD-08, RNF-10

### 3.3.2 Componentes técnicos · plataforma objetivo

La plataforma para todo el país: borde global, eventos gestionados, datos en alta disponibilidad y analítica separada.

![Componentes técnicos · plataforma objetivo](../../assignment2/diagramas/tecnico-objetivo.png)

> Kafka es la columna: todo lo que no es camino crítico cuelga de él.

- 1 · El borde global filtra y reparte el tráfico.
- 2 · Los servicios guardan en Cloud SQL HA y en Cloud Storage dual-region.
- 3 · Cada hecho de negocio sale a Kafka como CloudEvent.
- 4 · Las funciones de notificación consumen sin tocar el camino crítico.
- 5 · BigQuery recibe metadatos para la analítica del Estado.

Trazabilidad: RNF-01, RNF-07, RNF-08, RNF-23, RNF-30

### 3.3.3 Tecnología y versión por componente

| Componente | Tecnología | Versión | Rol |
|---|---|---|---|
| Portal | React + oidc-client-ts + lucide-react | React 18.3 · oidc-client-ts 3 | SPA estática en GitHub Pages |
| MS-01 Identidad | Keycloak | 26.x | Proveedor OIDC, usuarios, bloqueo por fuerza bruta |
| MS-03 · MS-04 · MS-08 | Node.js + Express | Node 22 LTS · Express 5 | Servicios REST sin estado |
| Validación de tokens | jose | 5.x | JWT RS256 con JWKS en caché |
| Persistencia | PostgreSQL + pg | 16 · pg 8 | Una base por servicio |
| Almacén de objetos | MinIO local · Cloud Storage con HMAC | @aws-sdk/client-s3 3 | URL prefirmadas V4 |
| Cómputo | Cloud Run | gen2 | Contenedores OCI multi-arquitectura |
| Eventos (objetivo) | Confluent Cloud Kafka + Schema Registry | Kafka 3.x | CloudEvents 1.0 |

# 04 Secuencias

Las cuatro operaciones implementadas, mensaje a mensaje. Cada mensaje dice qué datos viajan y con qué operación del contrato.

Cuatro secuencias, una por operación implementada. El mismo JSON dibuja el diagrama del sitio, el PNG del documento y el video. Cada mensaje lleva arriba los datos que viajan y debajo la operación del contrato.

### 4.1 Registro y afiliación

La afiliación única exige consistencia fuerte con el centralizador. Por eso el usuario nace deshabilitado y solo se habilita cuando GovCarpeta confirma.

![Registro y afiliación](../../assignment2/diagramas/secuencia-registro.png)

> Si GovCarpeta rechaza en el paso 10, Afiliación borra el usuario: no queda una cuenta sin afiliación.

- 1 · El portal envía los datos y Afiliación simula la verificación de identidad.
- 2 · La pasarela pregunta a GovCarpeta y traduce el 204 a «libre».
- 3 · Afiliación crea el usuario deshabilitado en Keycloak.
- 4 · GovCarpeta registra al ciudadano con el mínimo de datos.
- 5 · Afiliación habilita el usuario y devuelve la cuenta institucional.

Trazabilidad: HU-01

### 4.2 Ingreso con OIDC y PKCE

El portal es una aplicación pública: no puede guardar secretos. PKCE hace que un código robado no sirva sin el verificador que solo tiene el navegador que lo pidió.

![Ingreso con OIDC y PKCE](../../assignment2/diagramas/secuencia-login.png)

> La contraseña solo la ve Keycloak; los servicios solo ven tokens firmados.

- 1 · El portal redirige a Keycloak con el reto PKCE.
- 2 · El ciudadano se autentica en Keycloak y el portal recibe un código.
- 3 · El portal canjea código y verificador por los tokens.
- 4 · Custodia valida la firma del token con las llaves en caché.
- 5 · El ciudadano ve su carpeta.

Trazabilidad: HU-02

### 4.3 Carga de documento temporal

Custodia autoriza la subida pero no la transporta. El navegador escribe directo en el almacén con una URL que caduca en 5 minutos.

![Carga de documento temporal](../../assignment2/diagramas/secuencia-carga.png)

> El servicio nunca carga el binario en memoria: escala por peticiones, no por megas.

- 1 · Custodia valida tipo, tamaño y cuota y registra el documento pendiente.
- 2 · Custodia firma una URL PUT de 5 minutos, sin llamar al almacén.
- 3 · El navegador sube el binario directo al almacén.
- 4 · Custodia comprueba el objeto subido y calcula su SHA-256.
- 5 · El documento queda cargado.

Trazabilidad: HU-03

### 4.4 Autenticación vía GovCarpeta

El centralizador autentica documentos que no custodia. Recibe una URL de lectura de 15 minutos: puede ir a buscar el documento, pero el contenido nunca viaja por él.

![Autenticación vía GovCarpeta](../../assignment2/diagramas/secuencia-autenticacion.png)

> URL, nunca el documento (RI-01). La pasarela convierte la prosa de GovCarpeta en un resultado con estado.

- 1 · El titular pide autenticar su documento.
- 2 · Custodia comprueba que es el dueño y firma una URL de lectura.
- 3 · Al centralizador viaja la URL, nunca el contenido.
- 4 · La pasarela normaliza la respuesta en prosa.
- 5 · El documento queda autenticado por el centralizador.

Trazabilidad: HU-04

# 05 Despliegue

Dónde corre cada pieza, con qué tecnología, por qué protocolo y en qué formato. Primero el prototipo real, después la plataforma objetivo.

Hoy el prototipo corre en Docker Compose local y el documento se publica en GitHub Pages. El despliegue 5.1 en GCP `us-east1` es el siguiente paso: usa las mismas imágenes y solo cambia la configuración. La plataforma objetivo añade borde global, eventos y alta disponibilidad. La tabla de conectores cierra lo que los diagramas no alcanzan a rotular.

### 5.1 Despliegue del prototipo

Tres servicios Node y Keycloak en Cloud Run, datos en Cloud SQL y Cloud Storage. Las mismas imágenes corren en Docker Compose.

![Despliegue del prototipo](../../assignment2/diagramas/despliegue-prototipo.png)

> El mismo artefacto corre en local y en nube: solo cambia la configuración (RD-01, RD-07).

- 1 · La SPA se sirve desde GitHub Pages y llama a Cloud Run por HTTPS.
- 2 · Los servicios llegan a Cloud SQL a través del Auth Proxy.
- 3 · Custodia firma URL con HMAC; el navegador sube directo al bucket.
- 4 · La pasarela es la única salida hacia GovCarpeta.

Trazabilidad: RD-01, RD-04, RD-06, RD-07, RNF-29

### 5.2 Despliegue de la plataforma objetivo

Borde global con Cloud Armor, cómputo mixto, datos en alta disponibilidad y Kafka gestionado.

![Despliegue de la plataforma objetivo](../../assignment2/diagramas/despliegue-objetivo.png)

> Los certificados viven en un bucket con Bucket Lock: ni un administrador puede borrarlos (RNF-02, RNF-13).

- 1 · El balanceador global reparte hacia Cloud Run y Keycloak.
- 2 · Los datos van a Cloud SQL HA y a Cloud Storage dual-region.
- 3 · Los servicios publican CloudEvents en Kafka.
- 4 · Los consumidores en GKE procesan los eventos.

Trazabilidad: RNF-01, RNF-02, RNF-08, RNF-23, RNF-30

## 5.3 Conectores: protocolo, formato y autenticación

| Origen | Destino | Protocolo | Formato | Autenticación | Modo | Estado |
|---|---|---|---|---|---|---|
| SPA | Keycloak | HTTPS · OIDC Authorization Code + PKCE | JWT RS256 | PKCE S256 | Síncrono | Prototipo |
| SPA | afiliacion · custodia | HTTPS TLS 1.3 · REST | JSON · application/problem+json (RFC 9457) | Bearer JWT (custodia) · límite por IP (afiliación) | Síncrono | Prototipo |
| SPA | Cloud Storage | HTTPS · URL prefirmada S3 V4 | Binario PDF · JPG · PNG | Firma HMAC en la URL, 5 min | Síncrono | Prototipo |
| afiliacion | Keycloak Admin | HTTPS · REST | JSON | Client credentials afiliacion-admin | Síncrono | Prototipo |
| afiliacion · custodia | pasarela | HTTPS · REST | JSON | ID token de Google (run.invoker) | Síncrono | Prototipo |
| pasarela | GovCarpeta | HTTPS · REST | JSON de entrada · texto en prosa de salida | Ninguna (el contrato no la exige) | Síncrono | Prototipo |
| Servicios | Cloud SQL | PostgreSQL wire vía Cloud SQL Auth Proxy | SQL | IAM de la cuenta de servicio | Síncrono | Prototipo |
| custodia | Cloud Storage | HTTPS · API XML S3 V4 | Binario | Clave HMAC en Secret Manager | Síncrono | Prototipo |
| Servicios | Kafka | Kafka SASL/SSL | CloudEvents 1.0 JSON con esquema registrado | API key por servicio | Asíncrono | Objetivo |
| Kafka | BigQuery | Conector gestionado | Avro · filas anonimizadas | Cuenta de servicio | Asíncrono | Objetivo |

# 06 Decisiones de arquitectura

Doce decisiones con la plantilla *Architectural Decision* de UAM: cuatro de despliegue y ocho de selección de tecnologías.

Cada decisión sigue la plantilla *Architectural Decision* de UAM. Los criterios salen solo de los atributos no funcionales del SRS, el coste y la regulación. La comparación dice Cumple, Parcial o No cumple con su motivo: no hay puntajes.

## 6.1 Criterios de despliegue: nube, on-premise, híbrido o edge

### AD-01 · Modelo de despliegue por componente

**Decisión.** Todo el operador se despliega en **nube pública**. Ningún componente va on-premise ni en edge; la matriz por clase fija cómo se protege cada uno.

**Impactos e implicaciones**

- El equipo no compra ni opera hardware.
- La custodia perpetua depende de un proveedor: se mitiga con API S3 estándar y exportación.
- La transferencia internacional de datos personales debe justificarse ante la Ley 1581.

**Problema.** Decidir, componente por componente, si corre en nube pública, en un centro de datos propio, en un modelo híbrido o en el borde.

**Contexto.** Un operador nacional debe custodiar documentos a perpetuidad (RNF-03) y absorber picos de campañas (RNF-09) con un modelo de servicios básicos gratuitos (RNF-28, RI-07).

**Alcance.** Todos los componentes de *3: prototipo y plataforma objetivo.

**Restricciones**

- RD-06: todo se empaqueta en contenedores.
- RD-04: infraestructura inmutable.
- Ley 1581 de 2012 sobre datos personales.

**Supuestos**

- El crédito de GCP del curso cubre el prototipo.
- B-15 sigue abierto: no hay cifra de población objetivo.

**Arquitectura de la solución.** Nube pública para las siete clases de componente. Las diferencias están en el mecanismo de protección, no en la ubicación.

| Clase de componente | Modelo | Motivo |
|---|---|---|
| SPA | Nube pública · CDN | Contenido estático, sin datos personales. |
| Servicios sin estado | Nube pública · Cloud Run | Escala por peticiones y a cero (RD-02, RD-03). |
| Custodia perpetua | Nube pública · dual-region con Bucket Lock | Durabilidad sin segundo centro propio (RNF-02). |
| Identidad y llaves | Nube pública · Secret Manager y KMS | Rotación y auditoría gestionadas. |
| Auditoría | Nube pública · bucket WORM | Inalterable por diseño (RNF-14). |
| Analítica | Nube pública · proyecto separado | Aislada del OLTP (RF-08). |
| Integraciones | Nube pública · pasarela | GovCarpeta ya vive en nube pública. |
| Edge | No aplica | No hay requisito de tiempo real (RI-02). |

**Análisis comparativo**

| Criterio | Nube pública (elegida) | On-premise | Híbrido |
|---|---|---|---|
| RNF-02 Durabilidad | **Cumple.** Cloud Storage dual-region replica entre regiones. | **Parcial.** Exige un segundo centro propio. | **Cumple.** Custodia en nube. |
| RNF-30 Elasticidad | **Cumple.** Escala sola hacia arriba y a cero. | **No cumple.** La capacidad se compra para el pico. | **Parcial.** Solo la parte en nube escala. |
| Coste | **Cumple.** Pago por uso y crédito del curso. | **No cumple.** Inversión inicial en hardware. | **Parcial.** Dos plataformas que operar. |
| Regulación | **Parcial.** Hay transferencia internacional; la SIC la admite hacia países con nivel adecuado. | **Cumple.** Los datos no salen de Colombia. | **Cumple.** Identidad y datos personales en local. |

**Justificación.** La nube pública cumple durabilidad, elasticidad y coste. Su único punto parcial, la regulación, se resuelve con la Circular Externa 005 de 2017 de la SIC (AD-02). El modelo híbrido duplica la operación para ganar solo en ese criterio.

**Consenso.** Acordado por el equipo en la sesión del 14 de septiembre.

**Disenso.** Se planteó mantener la identidad on-premise por soberanía. Se descartó porque el caso no lo exige y la Ley 1581 admite la transferencia con nivel adecuado.

**Decisiones relacionadas:** AD-02, AD-03, AD-04

### AD-02 · Proveedor y región

**Decisión.** **Google Cloud** en la región `us-east1`, con `us-central1` como par para recuperación.

**Impactos e implicaciones**

- Se usa el crédito de USD 300 del curso.
- Los datos personales residen en EE. UU.

**Problema.** Elegir proveedor de nube y región principal.

**Contexto.** GovCarpeta corre en Heroku, en EE. UU. El curso entrega crédito de GCP y usará Kafka en GCP en la próxima sesión.

**Alcance.** Prototipo y plataforma objetivo.

**Restricciones**

- Ley 1581 de 2012 y Circular Externa 005 de 2017 de la SIC.
- Presupuesto: crédito del curso.

**Supuestos**

- La latencia desde Colombia a us-east1 es aceptable para RNF-04.

**Arquitectura de la solución.** Proyecto GCP único para el prototipo en us-east1; en el objetivo, recursos regionales duplicados en us-central1.

**Análisis comparativo**

| Criterio | GCP us-east1 (elegida) | AWS us-east-1 | GCP southamerica-east1 |
|---|---|---|---|
| Coste | **Cumple.** Crédito del curso y precios de nivel 1. | **Parcial.** Sin crédito del curso. | **Parcial.** Región de precio mayor que nivel 1. |
| RNF-04 Rendimiento | **Cumple.** Cerca de GovCarpeta: menos viajes largos por operación. | **Cumple.** Misma cercanía a GovCarpeta. | **Parcial.** Cerca del ciudadano, lejos del centralizador. |
| Regulación | **Cumple.** La SIC reconoce a EE. UU. con nivel adecuado. | **Cumple.** Mismo país. | **Parcial.** Hay que verificar el nivel de protección de Brasil ante la SIC. |
| RNF-23 Recuperabilidad | **Cumple.** us-central1 como región par. | **Cumple.** us-west-2 como par. | **Cumple.** southamerica-west1 como par. |

**Justificación.** us-east1 es la única opción que cumple los cuatro criterios. AWS empata en técnica pero pierde el crédito; São Paulo gana en cercanía al ciudadano pero cada operación viaja dos veces al norte para hablar con GovCarpeta.

**Consenso.** Acordado por el equipo.

**Disenso.** Se defendió São Paulo por percepción de soberanía; pesó más la cercanía al centralizador.

**Decisiones relacionadas:** AD-01, AD-03

### AD-03 · Plataforma de cómputo

**Decisión.** **Cloud Run** para los servicios y Keycloak del prototipo. En el objetivo, Keycloak y los consumidores de Kafka pasan a **GKE Autopilot** y las notificaciones a **Cloud Run functions**.

**Impactos e implicaciones**

- Sin servidores que parchear.
- Arranque en frío en servicios con cero instancias.
- Keycloak queda con una sola instancia en el prototipo.

**Problema.** Elegir dónde se ejecutan los contenedores.

**Contexto.** Criterios de la clase del 12 de septiembre: duración de los procesos, arranque en frío, carga operativa, dependencia del proveedor y tráfico sostenido frente a esporádico.

**Alcance.** Servicios, identidad y funciones.

**Restricciones**

- RD-02: procesos sin estado.
- RD-03: escalado horizontal.

**Supuestos**

- El tráfico del prototipo es esporádico.

**Arquitectura de la solución.** Manifiestos Knative declarativos por servicio. Identidad con `min-instances=1` y sidecar Cloud SQL Auth Proxy; servicios Node con `min-instances=0`; pasarela sin acceso público.

**Análisis comparativo**

| Criterio | Cloud Run (elegida) | GKE Autopilot | Compute Engine | Cloud Run functions |
|---|---|---|---|---|
| RNF-30 Elasticidad | **Cumple.** Escala por peticiones y a cero. | **Cumple.** Escalado de pods y nodos gestionado. | **No cumple.** Grupos de instancias lentos para escalar. | **Cumple.** Escala por evento. |
| RNF-29 Desplegabilidad | **Cumple.** Revisiones con tráfico dividido. | **Cumple.** Rolling update. | **Parcial.** Imágenes y scripts propios. | **Cumple.** Despliegue por función. |
| Coste | **Cumple.** Sin costo sin tráfico. | **Parcial.** Costo base del clúster siempre encendido. | **No cumple.** Se paga encendida. | **Cumple.** Pago por invocación. |
| RNF-04 Rendimiento | **Parcial.** Arranque en frío; Keycloak lo evita con una instancia mínima. | **Cumple.** Pods calientes. | **Cumple.** Sin arranque en frío. | **Parcial.** Arranque en frío y límite de duración. |

**Justificación.** Los servicios hacen procesos cortos con tráfico esporádico: es el caso de Cloud Run. GKE se reserva para lo que necesita estar siempre caliente o consumir colas de forma continua. Las funciones encajan con notificaciones, como indicó el profesor.

**Consenso.** Acordado por el equipo, siguiendo los criterios de la clase.

**Disenso.** Kubernetes para todo, como en la clase. Se pospone: el prototipo no justifica el costo base del clúster.

**Decisiones relacionadas:** AD-01, AD-06, AD-12

### AD-04 · Ubicación de datos y custodia

**Decisión.** Contenido en **Cloud Storage** y metadatos en **Cloud SQL PostgreSQL**. En el objetivo, los certificados van a un bucket dual-region con **Bucket Lock**; los temporales, a un bucket borrable.

**Impactos e implicaciones**

- Los certificados no se pueden borrar ni por un administrador.
- El derecho de supresión aplica solo a temporales (B-11).

**Problema.** Decidir dónde viven el contenido y los metadatos de los documentos.

**Contexto.** Los certificados se conservan a perpetuidad y sin alteración (RNF-02, RNF-03, RNF-13); los temporales tienen cuota y se pueden eliminar (RNF-24, RF-02.10).

**Alcance.** MS-04 y MS-02.

**Restricciones**

- RD-05: servicios de respaldo enchufables.
- RD-11: sin base de datos compartida.

**Supuestos**

- B-11 se resuelve separando certificados de temporales.

**Arquitectura de la solución.** Un objeto por documento, nombrado por identificador; metadatos, dueño, estado y SHA-256 en la base de custodia.

**Análisis comparativo**

| Criterio | Cloud Storage + Cloud SQL (elegida) | NAS + PostgreSQL on-premise | BLOB en la base de datos |
|---|---|---|---|
| RNF-02 Durabilidad | **Cumple.** Réplica dual-region. | **Parcial.** Depende de copias propias. | **Parcial.** Respaldos de base enormes. |
| RNF-03 Retención | **Cumple.** Bucket Lock con retención indefinida. | **Parcial.** WORM por software. | **No cumple.** Sin retención inalterable. |
| RNF-13 No repudio | **Cumple.** Objeto inmutable y hash guardado. | **Parcial.** Un administrador puede alterar. | **Parcial.** Un DBA puede alterar filas. |
| Coste | **Cumple.** Clases frías para documentos viejos. | **No cumple.** Hardware y operación. | **No cumple.** Almacenamiento de base más caro que objetos. |

**Justificación.** Separar contenido de metadatos deja cada dato en el motor hecho para él. Solo Cloud Storage ofrece retención inalterable gestionada.

**Consenso.** Acordado por el equipo.

**Disenso.** Ninguno registrado.

**Decisiones relacionadas:** AD-01, AD-08

## 6.2 Selección de tecnologías

### AD-05 · Estilo arquitectónico y comunicación

**Decisión.** **Microservicios** según la granularidad del SRS. Las cuatro operaciones del prototipo son **REST síncrono**; en el objetivo los hechos de negocio viajan por **Kafka**.

**Impactos e implicaciones**

- Cada servicio se despliega y escala solo.
- Aparece consistencia eventual en avisos y analítica.

**Problema.** Elegir estilo y forma de comunicación entre piezas.

**Contexto.** El SRS ya dio veredicto por dominio (*4.3 de A1). La afiliación exige consistencia fuerte; el resto admite eventual (RNF-06).

**Alcance.** Todo el operador.

**Restricciones**

- RD-12: descomposición por capacidad de negocio.
- RD-11: sin base de datos compartida.

**Supuestos**

- Kafka no es necesario para las cuatro operaciones implementadas.

**Arquitectura de la solución.** Llamadas REST con timeout donde el usuario espera respuesta; eventos CloudEvents donde basta con enterarse.

**Análisis comparativo**

| Criterio | Microservicios, REST y eventos (elegida) | Monolito modular | Microservicios solo síncronos |
|---|---|---|---|
| RNF-07 Tolerancia a fallos | **Cumple.** Fallos aislados y colas que absorben caídas. | **No cumple.** Un fallo tumba todo. | **Parcial.** Cascadas de timeouts. |
| RNF-26 Modificabilidad | **Cumple.** Cada dominio cambia solo. | **Parcial.** Módulos acoplados en el despliegue. | **Cumple.** Cada dominio cambia solo. |
| RNF-06 Consistencia | **Parcial.** Eventual en avisos; fuerte en afiliación. | **Cumple.** Transacción local. | **Cumple.** Respuesta inmediata. |
| Coste | **Parcial.** Más piezas que operar. | **Cumple.** Una sola pieza. | **Parcial.** Más piezas que operar. |

**Justificación.** La tolerancia a fallos con 70 operadores ajenos pesa más que la simplicidad del monolito. Kafka se deja fuera del prototipo porque ninguna de sus cuatro operaciones lo necesita.

**Consenso.** Acordado por el equipo.

**Disenso.** Monolito modular para el prototipo. Se descartó porque no demostraría la arquitectura que se entrega.

**Decisiones relacionadas:** AD-09, AD-10

### AD-06 · Identidad

**Decisión.** **Keycloak 26** con OIDC Authorization Code y PKCE para el portal y client credentials entre servicios.

**Impactos e implicaciones**

- Hay que operar Keycloak y su base.
- Los servicios solo validan JWT con llaves públicas.

**Problema.** Elegir cómo se autentican ciudadanos y servicios.

**Contexto.** RNF-11 exige autenticación sólida y RNF-12 un modelo expresivo de autorización. El portal es una aplicación pública sin secretos.

**Alcance.** MS-01 y todos sus clientes.

**Restricciones**

- RD-01: configuración fuera del artefacto.

**Supuestos**

- MFA se activa en el objetivo, no en el prototipo.

**Arquitectura de la solución.** Realm `carpeta` importado con variables, cliente público `portal` con PKCE S256, audiencia `custodia`, bloqueo tras 5 intentos, sesión inactiva de 30 minutos, tema en español.

**Análisis comparativo**

| Criterio | Keycloak (elegida) | Identity Platform | Servicio propio |
|---|---|---|---|
| RNF-11 Autenticación | **Cumple.** OIDC, fuerza bruta y MFA. | **Cumple.** OIDC y MFA gestionados. | **Parcial.** Reinventar seguridad. |
| RNF-12 Autorización | **Cumple.** Roles y mapeadores de atributos. | **Parcial.** Claims propios vía funciones. | **Parcial.** Todo por construir. |
| Coste | **Parcial.** Hay que operarlo. | **Cumple.** Pago por usuario activo, sin operación. | **No cumple.** Desarrollo y auditoría. |
| RNF-27 Libertad tecnológica | **Cumple.** Estándar abierto que corre en cualquier nube. | **No cumple.** Atado a GCP. | **Cumple.** Sin proveedor. |

**Justificación.** Keycloak es el único que cumple autenticación, autorización expresiva y portabilidad a la vez. Su costo operativo se acota con una instancia en el prototipo y HA en GKE en el objetivo.

**Consenso.** Acordado por el equipo.

**Disenso.** Identity Platform ahorra operación; se rechazó por dependencia del proveedor.

**Decisiones relacionadas:** AD-03, AD-07

### AD-07 · Runtime de los servicios

**Decisión.** **Node.js 22 LTS con Express 5** en JavaScript ESM.

**Impactos e implicaciones**

- Imágenes pequeñas y arranque rápido.
- Sin tipos estáticos: la validación de entrada es explícita.

**Problema.** Elegir lenguaje y framework de los microservicios.

**Contexto.** Los servicios del prototipo son casi solo entrada y salida: base de datos, Keycloak, almacén y GovCarpeta.

**Alcance.** MS-03, MS-04 y MS-08.

**Restricciones**

- RD-02: procesos sin estado.
- RD-09: registros como flujo de eventos.

**Supuestos**

- El equipo domina JavaScript por los talleres del curso.

**Arquitectura de la solución.** Un servicio Express por microservicio, configuración por entorno, errores problem+json y pruebas con `node --test`.

**Análisis comparativo**

| Criterio | Node 22 + Express 5 (elegida) | Quarkus | Spring Boot | Go |
|---|---|---|---|---|
| RNF-04 Rendimiento | **Cumple.** E/S no bloqueante; aquí casi todo es E/S. | **Cumple.** Compilación nativa con arranque rápido. | **Parcial.** Arranque en frío lento en Cloud Run. | **Cumple.** Binario rápido. |
| Coste | **Cumple.** Lenguaje de los talleres: sin curva. | **Parcial.** Nuevo para el equipo. | **Parcial.** Conocido por parte del equipo. | **No cumple.** Nadie del equipo lo ha usado. |
| RNF-29 Desplegabilidad | **Cumple.** Imagen pequeña. | **Cumple.** Imagen nativa pequeña. | **Parcial.** Imagen pesada. | **Cumple.** Imagen mínima. |

**Justificación.** Node iguala en rendimiento a Quarkus y Go para cargas de E/S y es el único sin curva para el equipo en una semana de entrega.

**Consenso.** Acordado por el equipo.

**Disenso.** Quarkus aparece en el material del curso sobre microservicios nativos de Kubernetes. Queda como alternativa si un servicio pasa a ser intensivo en CPU.

**Decisiones relacionadas:** AD-03, AD-12

### AD-08 · Persistencia

**Decisión.** **PostgreSQL 16, una base por servicio**, y almacén de objetos por **API S3**: MinIO en local y Cloud Storage con claves HMAC en nube.

**Impactos e implicaciones**

- Un solo código S3 para local y nube.
- Cada servicio migra su esquema por separado.

**Problema.** Elegir motor de datos y cómo se reparte entre servicios.

**Contexto.** Cuota y estados de documentos necesitan transacciones. Cloud Storage acepta URL prefirmadas AWS V4 con HMAC.

**Alcance.** MS-03, MS-04 y Keycloak.

**Restricciones**

- RD-11: sin base de datos compartida.
- RD-10: migraciones como proceso aparte.

**Supuestos**

- Una instancia Cloud SQL con tres bases basta para el prototipo.

**Arquitectura de la solución.** Bases `afiliacion`, `custodia` y `keycloak` con usuarios distintos; bucket privado con CORS para el portal.

**Análisis comparativo**

| Criterio | PostgreSQL por servicio + S3 (elegida) | MongoDB compartido | Firestore + Cloud Storage |
|---|---|---|---|
| RNF-06 Consistencia | **Cumple.** Transacciones para cuota y estados. | **Parcial.** Transacciones multi-documento con costo. | **Parcial.** Transacciones limitadas. |
| RNF-26 Modificabilidad | **Cumple.** Migraciones por servicio. | **Parcial.** Esquema compartido que acopla. | **Cumple.** Sin esquema rígido. |
| RNF-27 Libertad tecnológica | **Cumple.** MinIO en local y GCS en nube con el mismo SDK. | **Cumple.** Corre en cualquier nube. | **No cumple.** Solo GCP. |
| Coste | **Parcial.** Cloud SQL tiene costo base. | **Parcial.** Clúster gestionado de pago. | **Cumple.** Pago por operación. |

**Justificación.** PostgreSQL da transacciones y aislamiento por base; la API S3 evita escribir dos adaptadores de almacén.

**Consenso.** Acordado por el equipo.

**Disenso.** Firestore reduce costo fijo; se rechazó por dependencia del proveedor.

**Decisiones relacionadas:** AD-04, AD-05

### AD-09 · Integración con el centralizador

**Decisión.** Una **pasarela anticorrupción dedicada** (MS-08) con timeout de 8 s, reintento con backoff solo en operaciones idempotentes y circuit breaker.

**Impactos e implicaciones**

- Un salto de red más.
- El resto del sistema no conoce la prosa ni los códigos de GovCarpeta.

**Problema.** Decidir cómo hablan los servicios con GovCarpeta.

**Contexto.** El contrato devuelve prosa, se contradice en registerOperator y no tiene compromiso de disponibilidad (B-10). El centralizador debe recibir la mínima carga (RNF-20).

**Alcance.** MS-03, MS-04 y MS-08.

**Restricciones**

- RD-14: centralizador externo no modificable.
- RD-15: contrato GovCarpeta congelado.
- RI-01: sin contenido por el centralizador.

**Supuestos**

- GovCarpeta no exige autenticación (B-09).

**Arquitectura de la solución.** Tres operaciones propias que traducen a validateCitizen, registerCitizen y authenticateDocument. Rechaza cuerpos de más de 2 KB y URL que no sean https, para que ningún contenido pueda viajar.

**Análisis comparativo**

| Criterio | Pasarela dedicada (elegida) | Librería compartida | Llamada directa |
|---|---|---|---|
| RNF-07 Tolerancia a fallos | **Cumple.** Timeout, reintento y circuit breaker en un solo lugar. | **Parcial.** Cada servicio la configura. | **No cumple.** Sin protección. |
| RNF-20 Carga mínima del centralizador | **Cumple.** Un solo punto controla el ritmo hacia el centralizador. | **Parcial.** Reintentos sin coordinar entre servicios. | **No cumple.** Reintentos sin control. |
| RNF-26 Modificabilidad | **Cumple.** Si cambia el contrato cambia un servicio. | **Parcial.** Hay que redesplegar todos. | **No cumple.** El contrato se filtra a todo el código. |
| RNF-25 Observabilidad | **Cumple.** Todas las llamadas en un mismo registro. | **Parcial.** Registros repartidos. | **No cumple.** Sin punto de observación. |

**Justificación.** Es la aplicación directa del veredicto del SRS para RF-06: fuera del alcance, solo el adaptador. El salto extra cuesta milisegundos frente a los segundos que tarda GovCarpeta.

**Consenso.** Acordado por el equipo.

**Disenso.** Librería compartida para ahorrar un servicio; se rechazó porque no protege al centralizador de reintentos cruzados.

**Decisiones relacionadas:** AD-05, AD-10

### AD-10 · Contratos y formatos

**Decisión.** **OpenAPI 3.1** antes del código, errores **application/problem+json** (RFC 9457) y eventos **CloudEvents 1.0**.

**Impactos e implicaciones**

- El validador comprueba que cada endpoint de una secuencia existe en el contrato.
- Los errores son legibles por máquina y por persona.

**Problema.** Elegir cómo se describen APIs, errores y eventos.

**Contexto.** RD-08 exige diseño API-first y RNF-19 contratos estándar entre operadores.

**Alcance.** Todas las API propias y eventos.

**Restricciones**

- RD-08: diseño API-first.

**Supuestos**

- Los operadores pares aceptan JSON sobre HTTPS.

**Arquitectura de la solución.** Un archivo `operador/contratos/*.openapi.yaml` por servicio.

**Análisis comparativo**

| Criterio | OpenAPI + RFC 9457 + CloudEvents (elegida) | gRPC + Protobuf | Formatos propios |
|---|---|---|---|
| RNF-19 Interoperabilidad | **Cumple.** Estándares abiertos que cualquier operador lee. | **Parcial.** El navegador necesita un proxy. | **No cumple.** Cada par los tendría que aprender. |
| RNF-26 Modificabilidad | **Cumple.** Contrato primero, código después. | **Cumple.** Esquema estricto. | **Parcial.** Sin herramienta que los valide. |
| RNF-25 Observabilidad | **Cumple.** Errores con type e instance correlacionables. | **Parcial.** Errores menos legibles fuera de gRPC. | **No cumple.** Errores sin estructura. |

**Justificación.** Son los estándares que ya entienden navegadores, gateways y herramientas de observabilidad.

**Consenso.** Acordado por el equipo.

**Disenso.** Ninguno registrado.

**Decisiones relacionadas:** AD-05, AD-09

### AD-11 · Frontend

**Decisión.** **SPA React estática** publicada en GitHub Pages, sin renderizado en servidor.

**Impactos e implicaciones**

- La interfaz sigue en línea aunque caigan los servicios.
- El primer render depende de JavaScript.

**Problema.** Elegir cómo se construye y sirve el portal del ciudadano.

**Contexto.** RNF-16 y RNF-17 piden interfaz usable y accesible. El sitio de arquitectura ya es React en GitHub Pages.

**Alcance.** Portal Mi Carpeta Segura.

**Restricciones**

- docs/DESIGN.md manda en color, contraste e iconos.

**Supuestos**

- El portal no necesita SEO.

**Arquitectura de la solución.** React 18 con oidc-client-ts y vistas por hash, sin router; tokens verdes de DESIGN.md en claro y oscuro.

**Análisis comparativo**

| Criterio | SPA estática (elegida) | SSR con Next.js | App móvil nativa |
|---|---|---|---|
| Coste | **Cumple.** GitHub Pages sin servidor. | **Parcial.** Servidor Node que operar. | **No cumple.** Dos plataformas que mantener. |
| RNF-16 Usabilidad | **Cumple.** Flujos cortos de pocas pantallas. | **Cumple.** Mismo diseño posible. | **Parcial.** Hay que instalarla. |
| RNF-17 Accesibilidad | **Cumple.** axe en e2e y AA en los dos temas. | **Cumple.** Misma accesibilidad. | **Parcial.** Accesibilidad por plataforma. |
| RNF-01 Disponibilidad | **Cumple.** CDN independiente de los servicios. | **Parcial.** Si cae el servidor cae la interfaz. | **Cumple.** Funciona sin la web. |

**Justificación.** La SPA cumple los cuatro criterios sin servidor que operar.

**Consenso.** Acordado por el equipo.

**Disenso.** Ninguno registrado.

**Decisiones relacionadas:** AD-06

### AD-12 · Empaquetado, registro, IaC y observabilidad

**Decisión.** Imágenes **OCI multi-arquitectura** publicadas en **Docker Hub** y tomadas por Cloud Run a través de un **repositorio remoto de Artifact Registry**; infraestructura como manifiestos **Knative YAML**; logs JSON a stdout y chequeos de salud.

**Impactos e implicaciones**

- El mismo artefacto corre en local y en nube (RD-07).
- Sin estado de Terraform que custodiar.

**Problema.** Decidir cómo se construye, publica, despliega y observa cada servicio.

**Contexto.** El profesor pidió Docker Hub en el entorno académico e IaC declarativa. Cloud Run solo toma Docker Hub directamente para imágenes oficiales.

**Alcance.** Todos los servicios del prototipo.

**Restricciones**

- RD-04: infraestructura inmutable.
- RD-07: separación de construcción y ejecución.
- RD-13: observabilidad desde el primer despliegue.

**Supuestos**

- El límite de descargas de Docker Hub se evita con el repositorio remoto y credenciales.

**Arquitectura de la solución.** `docker buildx` para amd64 y arm64, `gcloud run services replace` con un YAML por servicio y `bootstrap.sh` idempotente para lo que se crea una sola vez.

**Análisis comparativo**

| Criterio | Docker Hub + Artifact Registry remoto + YAML Knative (elegida) | Artifact Registry + Terraform | Despliegue desde código fuente |
|---|---|---|---|
| RNF-29 Desplegabilidad | **Cumple.** Mismo artefacto en local y nube. | **Cumple.** Plan y aplicación reproducibles. | **Parcial.** Cada despliegue reconstruye. |
| RNF-25 Observabilidad | **Cumple.** Logs JSON que Cloud Logging indexa. | **Cumple.** Mismos logs. | **Parcial.** Sin control del artefacto. |
| Coste | **Cumple.** Registro gratuito y sin estado de IaC. | **Parcial.** Curva y backend de estado. | **Cumple.** Nada que configurar. |
| RNF-27 Libertad tecnológica | **Cumple.** Imágenes que corren en cualquier plataforma. | **Parcial.** Registro atado a GCP. | **No cumple.** Sin imagen portable. |

**Justificación.** Cumple lo que pidió el profesor y los cuatro criterios. Terraform se reserva para la plataforma objetivo, donde el número de recursos lo justifica.

**Consenso.** Acordado por el equipo.

**Disenso.** Terraform desde el inicio. Se pospuso por tiempo de entrega; los YAML de Knative ya son declarativos.

**Decisiones relacionadas:** AD-03, AD-07

# 07 Implementación

Qué se construyó, cómo se levanta y qué evidencia lo respalda.

Cuatro operaciones implementadas de extremo a extremo contra GovCarpeta real. El código vive en `operador/` del repositorio.

## 7.1 Operaciones implementadas

| Historia | Operación | Endpoints | Prueba |
|---|---|---|---|
| HU-01 | Registro y afiliación | `POST /ciudadanos · pasarela GET y POST /centralizador/ciudadanos` | `operador/e2e/flujos.spec.js · HU-01` |
| HU-02 | Ingreso | `OIDC de Keycloak · GET /documentos` | `operador/e2e/flujos.spec.js · HU-02` |
| HU-03 | Carga de documento | `POST /documentos · POST /documentos/{id}/confirmacion` | `operador/e2e/flujos.spec.js · HU-03` |
| HU-04 | Autenticación | `POST /documentos/{id}/autenticacion · pasarela PUT /centralizador/documentos/autenticacion` | `operador/e2e/flujos.spec.js · HU-04` |

## 7.2 Cómo se levanta

1. Copiar `operador/.env.example` a `operador/.env` y cambiar las claves.
2. `cd operador && docker compose up -d --build` levanta PostgreSQL, MinIO, Keycloak, las migraciones y los tres servicios.
3. `npx vite --port 4173` desde la raíz abre el portal en `http://localhost:4173/carpeta-ciudadana/operador/`.
4. `npm --prefix operador/e2e test` recorre las operaciones por la interfaz; con `GOVCARPETA_ESCRITURA=1` incluye registro y autenticación.

## 7.3 Estado y evidencia

| Verificación | Resultado |
|---|---|
| Pruebas unitarias | 17 de 17 en verde (pasarela, afiliación, custodia) |
| e2e local | 7 de 7 en verde contra GovCarpeta real: registro, ingreso, carga, autenticación y 3 alternos; 0 violaciones axe |
| Despliegue en Cloud Run | Planeado: por ahora el prototipo corre solo en Docker Compose local |
| Registro de Mi Carpeta Segura en GovCarpeta | Registrado el 14 sep 2026 (operatorId 6aa8afa3bcc6df0002eb66e5) |

## 7.4 Fuera del prototipo

- Transferencia entre operadores (RF-03) y publicación de transferAPIURL.
- Kafka, notificaciones, analítica y Premium: diseñados en *3 y *6.

---

Fuentes: SRS de Carpeta Ciudadana v1.0 (entrega 1); contrato Swagger de GovCarpeta, leído con GET el 14 de septiembre de 2026; plantilla *Architectural Decision* de Unified Architecture Method; documentación oficial de Keycloak 26, Cloud Run y Cloud Storage; material del curso *Arquitecturas Avanzadas de Software*.
