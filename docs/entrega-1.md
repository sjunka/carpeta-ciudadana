# Carpeta Ciudadana — Entrega 1

> Estructura y estilo gobernados por `REGLAS.md`. Artefacto publicado: https://claude.ai/code/artifact/982b7935-109f-4e5e-982e-a0503f2a6dbc

> Fuentes: enunciado; caso de estudio (PDF completo); API GovCarpeta **verificada en vivo el 2026-09-05** con llamadas de solo lectura; lámina de *system context artifact* del curso.


---

## 1. Requerimientos funcionales


### RF-01 · Registro, afiliación y traslado

Alta el ciclo de vida de la afiliación: quién entra, quién sale y cómo se muda.

| ID | Requerimiento | Descripción | Prioridad |
|---|---|---|---|
| RF-01.1 | Registro de ciudadano | El operador debe permitir la inscripción de un ciudadano capturando documento, nombres, correo de contacto y teléfono móvil. | Alta |
| RF-01.2 | Verificación de identidad | El operador debe validar la identidad del ciudadano contra la Registraduría Nacional antes de activar la carpeta. **[ASUNCIÓN]** *No existe API de Registraduría; se asume un adaptador propio.* | Alta |
| RF-01.3 | Validación de afiliación única | El operador debe consultar al centralizador que el ciudadano no esté afiliado a otro operador antes de completar el registro. | Alta |
| RF-01.4 | Notificación de afiliación | El operador debe informar al centralizador que el ciudadano es ahora cliente suyo. | Alta |
| RF-01.5 | Asignación de cuenta de correo | El sistema debe generar una cuenta de correo institucional única e inmutable de por vida, que sobrevive al traslado de operador. **[ASUNCIÓN]** *El caso fija el ejemplo pero no la regla de derivación ni el manejo de colisiones.* | Alta |
| RF-01.6 | Carga del documento de identidad | El operador debe subir a la carpeta el documento de identidad firmado por la Registraduría al completar el registro. | Alta |
| RF-01.7 | Solicitud de traslado | El ciudadano debe poder solicitar el traslado de su carpeta hacia otro operador autorizado. | Alta |
| RF-01.8 | Ejecución del traslado | El operador origen debe transferir la totalidad de documentos y metadatos al destino y desafiliar al ciudadano solo tras confirmación. **[BLOQUEO]** *B-01 · El protocolo de transferencia no está especificado por MinTIC.* | Alta |
| RF-01.9 | Registro de entidades y empresas | El operador debe permitir el registro de entidades y empresas, dotándolas de una carpeta institucional con las mismas capacidades. | Alta |
| RF-01.10 | Cancelación de afiliación | El operador debe permitir dar de baja a un ciudadano o entidad, notificando al centralizador y preservando la custodia de los certificados. | Media |

### RF-02 · Gestión documental

El corazón del producto: qué se guarda, con qué metadatos y por cuánto tiempo.

| ID | Requerimiento | Descripción | Prioridad |
|---|---|---|---|
| RF-02.1 | Almacenamiento a perpetuidad | El sistema debe conservar de forma indefinida todos los documentos certificados, sin límite de tamaño ni de cantidad. | Alta |
| RF-02.2 | Carga de documentos temporales | El ciudadano debe poder subir documentos no certificados, sujetos a una cuota por usuario. **[ASUNCIÓN]** *El caso dice «limitada», sin cifra.* | Alta |
| RF-02.3 | Registro de metadatos | Todo documento debe almacenarse con los metadatos que permiten clasificarlo, identificarlo, decir qué entidad lo avala y qué fechas tiene. **[BLOQUEO]** *B-01 · No hay esquema de metadatos común definido por MinTIC.* | Alta |
| RF-02.4 | Conservación de la firma | Los documentos emitidos por entidades deben conservarse con su firma digital intacta, de modo que su autenticidad no pueda discutirse. | Alta |
| RF-02.5 | Verificación de autenticidad | El sistema debe permitir validar en cualquier momento la firma y la integridad de un documento certificado. **[BLOQUEO]** *B-03 · No hay PKI ni autoridad certificadora definida.* | Alta |
| RF-02.6 | Consulta y navegación | El ciudadano debe poder listar, buscar y filtrar sus documentos por tipo, entidad emisora, fecha y estado de certificación. | Alta |
| RF-02.7 | Descarga e impresión | El ciudadano debe poder descargar e imprimir cualquier documento conservando la evidencia de firma. | Alta |
| RF-02.8 | Recepción por correo | Todo documento enviado a la cuenta institucional del ciudadano debe ingresar automáticamente a su carpeta. **[BLOQUEO]** *B-13 · Falta definir si es un buzón real de internet o un identificador.* | Alta |
| RF-02.9 | Sustitución de temporal | Cuando llegue la versión firmada de un documento cargado como temporal, el sistema debe relacionarlas y reemplazarlo conservando la trazabilidad. | Media |
| RF-02.10 | Eliminación controlada | El ciudadano debe poder eliminar documentos no certificados; los certificados solo se retiran según la política de retención. **[BLOQUEO]** *B-11 · Perpetuidad y derecho de supresión no están conciliados.* | Media |
| RF-02.11 | Bitácora del documento | El sistema debe registrar en una bitácora inalterable toda operación sobre cada documento: cargue, consulta, descarga, compartición y transferencia. | Alta |

### RF-03 · Interoperabilidad entre operadores

Lo que convierte a un operador aislado en parte de una federación.

| ID | Requerimiento | Descripción | Prioridad |
|---|---|---|---|
| RF-03.1 | Localización del operador destino | El operador debe consultar al centralizador ante qué operador está afiliado el destinatario antes de enviarle documentos. | Alta |
| RF-03.2 | Transferencia directa | La transferencia de documentos y metadatos debe hacerse directamente entre operador origen y destino, sin que el contenido pase por el centralizador. | Alta |
| RF-03.3 | Recepción de documentos externos | El operador debe exponer una interfaz para que otros operadores le entreguen documentos, validando firma y metadatos antes de aceptarlos. **[BLOQUEO]** *B-01 · No existe contrato MinTIC para esta interfaz.* | Alta |
| RF-03.4 | Entrega alterna por correo | Si el destinatario no está afiliado a ningún operador, los documentos deben entregarse por correo electrónico, firmados. **[BLOQUEO]** *B-14 · El correo plano contradice el requisito de confidencialidad.* | Alta |
| RF-03.5 | Confirmación y reintento | Toda transferencia debe generar acuse de recibo, reintentarse ante fallas y ser idempotente. | Alta |
| RF-03.6 | Solicitud de documentos a entidades | El ciudadano debe poder radicar solicitudes de expedición ante entidades y consultar el estado de cada una. | Alta |
| RF-03.7 | Emisión por parte de la entidad | Una entidad afiliada debe poder cargar documentos firmados dirigidos a un ciudadano, disparando la resolución de operador y la entrega. | Alta |
| RF-03.8 | Contrato común de intercambio | Todos los operadores deben implementar el mismo contrato de servicios definido por MinTIC para garantizar la interoperabilidad. **[BLOQUEO]** *B-01 · Hoy solo 16 de 70 operadores publican endpoint de transferencia.* | Alta |

### RF-04 · Compartición, solicitudes y autorizaciones

El consentimiento del ciudadano como puerta de todo movimiento de documentos.

| ID | Requerimiento | Descripción | Prioridad |
|---|---|---|---|
| RF-04.1 | Armado de paquetes | El ciudadano debe poder seleccionar varios documentos y agruparlos en un paquete para enviarlo a una entidad o empresa. | Alta |
| RF-04.2 | Envío de paquetes | El paquete debe entregarse a la carpeta institucional del destinatario si está afiliado, o por correo si no lo está. En ambos casos va firmado. | Alta |
| RF-04.3 | Petición de documentos | Una entidad debe poder registrar, desde su propio operador, una petición dirigida a un ciudadano indicando qué documentos requiere y con qué finalidad. | Alta |
| RF-04.4 | Autorización explícita | Ningún documento puede compartirse sin autorización expresa del titular; el sistema debe capturar la decisión de aprobar, aprobar en parte o rechazar. | Alta |
| RF-04.5 | Vigencia y revocación | Las autorizaciones deben poder tener vigencia limitada y ser revocables por el ciudadano en cualquier momento. **[ASUNCIÓN]** *El caso no menciona vigencia; la añadimos por el requisito de confidencialidad.* | Media |
| RF-04.6 | Seguimiento de solicitudes | Solicitante y ciudadano deben poder consultar el estado de cada petición: pendiente, autorizada, rechazada o entregada. | Media |
| RF-04.7 | Compleción con faltantes | Si el ciudadano no tiene un documento solicitado, debe poder cargar una versión temporal y radicar en el mismo flujo la solicitud del definitivo. | Alta |

### RF-05 · Notificaciones

El canal por el que el ciudadano se entera de que algo pasó.

| ID | Requerimiento | Descripción | Prioridad |
|---|---|---|---|
| RF-05.1 | Aviso por correo | El sistema debe notificar por correo al ciudadano cuando lleguen documentos nuevos a su carpeta. | Alta |
| RF-05.2 | Aviso por SMS | El sistema debe notificar por SMS los eventos críticos, en particular las peticiones que requieren autorización. | Alta |
| RF-05.3 | Centro de notificaciones | La interfaz debe presentar el historial de notificaciones y las alertas pendientes de atención. | Media |
| RF-05.4 | Preferencias de canal | El ciudadano debe poder configurar por qué canales desea ser notificado. | Baja |

### RF-06 · Servicios del centralizador

Lo que MinTIC presta, y el límite explícito de lo que no debe hacer.

| ID | Requerimiento | Descripción | Prioridad |
|---|---|---|---|
| RF-06.1 | Directorio ciudadano–operador | El centralizador debe mantener la asociación entre el identificador del ciudadano y su operador, y nada más que eso. | Alta |
| RF-06.2 | Registro de ciudadano | El centralizador debe exponer una operación para registrar a un ciudadano, rechazándola si ya existe afiliación vigente con otro operador. | Alta |
| RF-06.3 | Desregistro de ciudadano | El centralizador debe exponer una operación para eliminar la afiliación y habilitar el traslado. | Alta |
| RF-06.4 | Consulta de afiliación | El centralizador debe devolver el operador al que pertenece un ciudadano, para habilitar el enrutamiento. | Alta |
| RF-06.5 | Directorio de operadores | El centralizador debe publicar el listado de operadores autorizados con las direcciones de sus servicios de interoperabilidad. **[BLOQUEO]** *B-16 · 54 de 70 operadores no publican endpoint y nadie lo valida.* | Alta |
| RF-06.6 | Autenticación de documentos | El centralizador debe ofrecer un servicio para registrar y verificar la autenticidad de un documento. **[BLOQUEO]** *B-03 · Hoy recibe una URL y nunca descarga el documento.* | Alta |
| RF-06.7 | Control de operadores | El centralizador debe permitir dar de alta, suspender y dar de baja operadores, verificando las condiciones técnicas exigidas. | Media |
| RF-06.8 | No custodia de documentos | El centralizador no debe almacenar documentos ni metadatos de negocio; su información se limita al enrutamiento y la validación. | Alta |

### RF-07 · Servicios Premium

La parte del modelo de negocio que financia lo gratuito.

| ID | Requerimiento | Descripción | Prioridad |
|---|---|---|---|
| RF-07.1 | Catálogo Premium | El operador debe poder definir un catálogo de servicios Premium y permitir su contratación. **[BLOQUEO]** *B-05 · No está cerrado qué es básico y qué es Premium.* | Media |
| RF-07.2 | Casos de soporte PQRS | El operador debe permitir a una empresa cliente armar casos de soporte y asociarles documentos. | Media |
| RF-07.3 | Solicitud desde un caso | Desde un caso PQRS la empresa debe poder pedir documentos a sus clientes sin importar su operador. | Media |
| RF-07.4 | API para empresas | El operador debe exponer una API que permita a las empresas integrar sus sistemas de trámite con la carpeta. | Media |
| RF-07.5 | Medición y facturación | El sistema debe medir el consumo Premium y facturarlo, garantizando que los servicios básicos sigan siendo gratuitos. | Media |

### RF-08 · Analítica para el Estado

Lo que el Estado quiere saber, sin tocar el contenido de los documentos.

| ID | Requerimiento | Descripción | Prioridad |
|---|---|---|---|
| RF-08.1 | Consolidación de metadatos | El sistema debe consolidar periódicamente los metadatos de los documentos, nunca su contenido, en un repositorio analítico. **[BLOQUEO]** *B-04 · Choca con el mandato de mínima información en el centralizador.* | Media |
| RF-08.2 | Anonimización | Los datos entregados para análisis deben estar disociados de la identidad del ciudadano, salvo autorización legal expresa. | Alta |
| RF-08.3 | Contexto Notarías | El sistema debe permitir responder preguntas sobre actividad notarial: volúmenes, tipos de acto y distribución geográfica y temporal. | Media |
| RF-08.4 | Contexto Educación | El sistema debe permitir responder preguntas sobre títulos y actas de grado emitidos: institución, programa, nivel y año. | Media |
| RF-08.5 | Contexto Registraduría | El sistema debe permitir responder preguntas sobre documentos de identidad y cobertura de registro de la población. | Media |
| RF-08.6 | Tableros y reportes | El sistema debe ofrecer tableros para el consumo de los resultados por MinTIC y las entidades autorizadas. | Baja |

### RF-09 · Seguridad, identidad y auditoría

Lo que impide que el sistema se convierta en una fuga de datos nacional.

| ID | Requerimiento | Descripción | Prioridad |
|---|---|---|---|
| RF-09.1 | Autenticación de usuarios | El sistema debe autenticar a ciudadanos, funcionarios y sistemas con un mecanismo sólido, con segundo factor para operaciones sensibles. | Alta |
| RF-09.2 | Autorización por roles y atributos | El sistema debe impedir que personas no autorizadas vean o modifiquen documentos ajenos, distinguiendo titular, delegado, entidad solicitante y administrador. | Alta |
| RF-09.3 | Autenticación entre sistemas | Las llamadas entre operadores y con el centralizador deben autenticarse mutuamente mediante certificados o credenciales emitidas por MinTIC. **[BLOQUEO]** *B-09 · Hoy el centralizador no exige credencial alguna.* | Alta |
| RF-09.4 | Registro de auditoría | Toda operación de acceso, autorización y transferencia debe quedar registrada con usuario, fecha, origen y resultado, en un log no alterable. | Alta |
| RF-09.5 | Consulta de accesos | El ciudadano debe poder consultar quién accedió a sus documentos y bajo qué autorización. | Media |
| RF-09.6 | Gestión del consentimiento | El sistema debe registrar y conservar la evidencia del consentimiento otorgado por el ciudadano para cada compartición. | Alta |

---

## 2. Requerimientos no funcionales

| ID | Atributo de calidad | Requerimiento | Criterio de aceptación |
|---|---|---|---|
| RNF-01 | Disponibilidad | La consulta y descarga de documentos certificados no puede depender de un único centro de datos. **[ASUNCIÓN]** | ≥ 99,95 % mensual para lectura; ≥ 99,5 % para escritura, con degradación a modo encolado. |
| RNF-02 | Durabilidad | Los documentos certificados deben conservarse sin pérdida ni corrupción. **[ASUNCIÓN]** | ≥ 3 réplicas en zonas independientes; verificación periódica por hash; pérdida objetivo cero. |
| RNF-03 | Retención | Los documentos certificados se conservan a perpetuidad, sin límite de tamaño. **[Del caso]** | Mínimo 100 años contractuales. Los no certificados caducan según cuota. |
| RNF-04 | Rendimiento | Las operaciones interactivas deben responder de forma fluida en carga normal y en pico. **[ASUNCIÓN]** | p95 ≤ 2 s en consulta y navegación; p95 ≤ 5 s al cargar un documento de hasta 10 MB. |
| RNF-05 | Latencia de mensajería | El sistema no es de tiempo real, pero la latencia entre operadores debe ser tan baja como sea posible. **[ASUNCIÓN]** | p95 de entrega entre operadores ≤ 30 s; aviso al ciudadano ≤ 2 min desde la recepción. |
| RNF-06 | Consistencia | Se admite consistencia eventual en documentos y avisos, pero la afiliación debe ser fuertemente consistente. **[ASUNCIÓN]** | Cero casos de doble afiliación; convergencia del estado documental ≤ 5 min. |
| RNF-07 | Tolerancia a fallos | La caída de un operador no debe producir pérdida de mensajes ni impedir la operación del resto. **[ASUNCIÓN]** | Entregas encoladas con reintento exponencial; operaciones idempotentes; cola de mensajes muertos. |
| RNF-08 | Escalabilidad | El sistema debe soportar la población del país, con carpeta desde el registro y volumen creciente. **[ASUNCIÓN]** | Escalado horizontal hasta 50 M de carpetas; crecimiento ≥ 30 % anual sin degradar el p95. |
| RNF-09 | Capacidad | El operador debe absorber los picos de campañas públicas sin rediseño. **[ASUNCIÓN]** | 2.000 peticiones/s en horario laboral; 5.000 en pico de convocatoria. |
| RNF-10 | Confidencialidad | Los documentos deben ser confidenciales en tránsito y en reposo, incluso frente al personal del operador. **[Del caso]** | TLS 1.3 en todo canal; cifrado AES-256 en reposo con gestión de llaves segregada y auditada. |
| RNF-11 | Autenticación | Debe existir un mecanismo sólido de autenticación para ciudadanos, funcionarios y sistemas. **[ASUNCIÓN]** | Segundo factor obligatorio para autorizar comparticiones; bloqueo tras intentos fallidos; sesiones con expiración. |
| RNF-12 | Autorización | El modelo debe ser expresivo para impedir accesos indebidos en escenarios de delegación. **[ASUNCIÓN]** | Cero accesos fuera de política en pruebas de penetración; toda decisión de autorización registrada. |
| RNF-13 | No repudio | Debe ser imposible discutir la autenticidad de un certificado o negar haberlo autorizado. **[Del caso]** | Firma con sellado de tiempo verificable; verificación en cada recepción; evidencia conservada. |
| RNF-14 | Trazabilidad | Toda operación relevante debe quedar registrada de forma inalterable. **[ASUNCIÓN]** | Log append-only, retención ≥ 10 años, consultable en ≤ 5 s y exportable ante requerimiento de autoridad. |
| RNF-15 | Privacidad y cumplimiento | El tratamiento de datos personales debe cumplir la normativa colombiana. **[Del caso]** | Cumplimiento verificable de la Ley 1581 de 2012; registro de consentimientos; minimización de datos. |
| RNF-16 | Usabilidad | Todos los ciudadanos, incluidos los de baja apropiación tecnológica, deben poder usar el sistema. **[ASUNCIÓN]** | Tasa de éxito ≥ 90 % con usuarios de baja alfabetización digital; ≤ 5 pasos para autorizar; SUS ≥ 80. |
| RNF-17 | Accesibilidad | Las interfaces deben servir a personas con discapacidad y a dispositivos de gama baja. **[ASUNCIÓN]** | WCAG 2.1 nivel AA; diseño responsive; funcionamiento en navegadores con dos versiones de antigüedad. |
| RNF-18 | Canales alternos | El sistema debe apoyarse en canales de baja fricción para llegar a población con acceso limitado. **[Del caso]** | Correo y SMS disponibles para el 100 % de los ciudadanos registrados. |
| RNF-19 | Interoperabilidad | Los operadores deben integrarse entre sí mediante contratos estándar versionados que no rompan integraciones. **[ASUNCIÓN]** | API documentada, versionada y retrocompatible; esquema común de metadatos; formatos de firma estandarizados. |
| RNF-20 | Carga mínima del centralizador | El centralizador debe manejar la mínima cantidad de transacciones y almacenar la mínima información. **[Del caso]** | ≤ 4 transacciones por ciclo de vida de afiliación y 0 bytes de contenido documental. |
| RNF-21 | Minimización de datos | Debe minimizarse el volumen transferido entre operadores y centralizador. **[ASUNCIÓN]** | ≤ 2 KB por transacción; caché local del directorio con TTL; consultas por lotes. |
| RNF-22 | Portabilidad | Un ciudadano debe trasladarse de operador sin pérdida de información ni de identidad digital. **[ASUNCIÓN]** | Traslado completo ≤ 24 h; cuenta de correo conservada; verificación de integridad al finalizar. |
| RNF-23 | Recuperabilidad | Debe existir un plan probado de continuidad ante la pérdida de una región o de un proveedor. **[ASUNCIÓN]** | RPO ≤ 5 min y RTO ≤ 30 min para el índice; pruebas de recuperación semestrales con evidencia. |
| RNF-24 | Cuotas de almacenamiento | El almacenamiento de documentos no certificados debe estar limitado por usuario. **[ASUNCIÓN]** | Máximo 20 documentos y 200 MB por ciudadano; aviso al 80 % y bloqueo al 100 %, solo para no certificados. |
| RNF-25 | Observabilidad | El sistema debe permitir detectar y diagnosticar fallos de integración entre operadores de forma oportuna. **[ASUNCIÓN]** | Métricas, trazas distribuidas y alertas sobre latencia y tasa de error de las transferencias. |
| RNF-26 | Modificabilidad | La arquitectura debe admitir nuevos tipos documentales sin rediseño. **[ASUNCIÓN]** | Nuevo tipo configurable con cero cambios en el núcleo; despliegues sin interrupción. |
| RNF-27 | Libertad tecnológica | No hay restricción sobre tecnologías ni sobre la ubicación del almacenamiento, incluida la nube fuera del país. **[Del caso]** | Arquitectura agnóstica de proveedor, sin dependencias que impidan cambiar de nube. |
| RNF-28 | Coste | El coste marginal debe sostener un modelo con servicios básicos gratuitos. **[ASUNCIÓN]** | ≤ USD 0,15 por carpeta activa al mes. |

---

## 3. Mapeo RNF vs QoS

| RNF | Atributo de QoS | Métrica o indicador | Objetivo / umbral | Táctica arquitectónica | Punto de fricción |
|---|---|---|---|---|---|
| RNF-01, 02, 03 | Disponibilidad | Uptime mensual, MTTR | ≥ 99,95 % lectura · MTTR ≤ 30 min | Redundancia activa multizona, circuit breaker hacia operadores externos, degradación a solo lectura. | El techo real lo pone el centralizador de MinTIC, que no controlamos y que estuvo caído el 5 de septiembre. |
| RNF-04, 05 | Rendimiento | p95 y p99 de latencia | p95 ≤ 2 s en consulta · p95 ≤ 30 s entre operadores | CQRS con vista materializada del índice de carpeta, CDN para descargas, URL prefirmadas. | Consistencia eventual: un documento recién llegado puede tardar en verse. Aceptable porque el caso descarta el tiempo real. |
| RNF-06, 07 | Fiabilidad | Casos de doble afiliación · tasa de entrega | Cero dobles afiliaciones · entrega eventual 100 % | Afiliación con consistencia fuerte contra el centralizador; documentos por mensajería asíncrona con outbox e idempotencia. | La asincronía hace más difícil dar respuesta clara al ciudadano. Choca de frente con RNF-16. |
| RNF-08, 09 | Escalabilidad | Carpetas soportadas · peticiones/s | 50 M de carpetas · 5.000 pet./s en pico | Servicios sin estado con autoescalado, partición por identificación del ciudadano, almacenamiento desacoplado del cómputo. | Particionar por cédula complica las consultas analíticas transversales que pide RF-08. |
| RNF-10, 11, 12 | Seguridad | % cifrado · accesos fuera de política | 100 % cifrado · cero accesos indebidos | Cifrado por sobre con gestión de llaves, autorización por atributos con alcance por documento, URL prefirmadas de vida corta. | El segundo factor obligatorio es el mayor enemigo de la usabilidad en población de baja apropiación tecnológica. |
| RNF-13 | No repudio | % de documentos con firma verificable | 100 % | Firma sobre el documento con sellado de tiempo y verificación en la frontera de entrada. | Sin autoridad certificadora definida, «firmado» es decorativo. Es el bloqueo B-03. |
| RNF-14, 15 | Auditoría y cumplimiento | Eventos auditados/s · hallazgos de auditoría | Consulta ≤ 5 s · cero hallazgos críticos | Log append-only en almacenamiento inmutable separado, clasificación y minimización de datos. | El volumen de auditoría puede superar al documental. Y la perpetuidad choca con el derecho de supresión. |
| RNF-16, 17, 18 | Usabilidad | Tasa de éxito de tarea · SUS · WCAG | ≥ 90 % · SUS ≥ 80 · nivel AA | Asistentes paso a paso, valores por defecto seguros, canal SMS, lenguaje claro y deshacer. | Cada control de seguridad que añadimos resta un punto de usabilidad. El caso pone la usabilidad como máxima prioridad. |
| RNF-19, 22 | Interoperabilidad | % de transferencias automáticas | 100 % hacia operadores del directorio | Capa anticorrupción por operador, contrato versionado, saga de transferencia con confirmación. | Hoy imposible: solo 16 de 70 operadores publican endpoint. Es el bloqueo B-01. |
| RNF-20, 21 | Eficiencia del centralizador | Transacciones y bytes hacia el centro | ≤ 4 transacciones · ≤ 2 KB | El centralizador como directorio, no como bus: solo índices y punteros, entrega entre pares, caché local con TTL. | Menos tráfico al centro es menos observabilidad para el Estado, que la necesita para RF-08. |
| RNF-23 | Recuperabilidad | RPO · RTO | RPO ≤ 5 min · RTO ≤ 30 min | Copias continuas con recuperación a un punto en el tiempo, réplicas entre regiones, ensayos semestrales. | Un RTO de 30 minutos es incompatible con recuperar petabytes. Solo aplica al índice, no al contenido. |
| RNF-24, 28 | Coste | USD por carpeta activa al mes | ≤ USD 0,15 | Almacenamiento por niveles, deduplicación y compresión, con cuota para los no certificados. | El nivel de archivo frío rompe la disponibilidad: recuperar tarda horas. «A perpetuidad y siempre disponible» es caro por definición. |
| RNF-25, 26 | Mantenibilidad | Cambios por tipo documental · MTTD | Cero cambios en el núcleo · detección ≤ 5 min | Esquemas de metadatos declarativos y versionados, métricas y trazas distribuidas por transferencia. | Un esquema flexible dificulta las consultas analíticas fuertemente tipadas. |
| RNF-27 | Portabilidad | Dependencias propietarias | Cero bloqueos de proveedor | Abstracción del almacenamiento de objetos y de la mensajería tras interfaces propias. | Ser agnóstico cuesta: se renuncia a servicios gestionados que serían más baratos y rápidos. |

---

## 4. Diagrama de contexto

Modelo: *system context artifact*. Sistema en construcción al centro, personas a la izquierda de la **línea de automatización**, sistemas TI a la derecha de la **línea de integración**, y en cada flecha los **datos** que viajan.

Archivo: `diagramas/contexto-sistema.html`

### 4.1 Actores

| Actor | Descripción | Tipo de interacción |
|---|---|---|
| Ciudadano | Titular de la carpeta. Se afilia, recibe, consulta, comparte y autoriza. | Datos personales, documentos y autorizaciones. |
| Entidad pública | Emite documentos firmados y solicita documentación. MEN, Registraduría, embajadas, notarías. | Emisión de documentos firmados y radicación de peticiones. |
| Empresa privada | Usa la carpeta para pedir y recibir documentos de sus clientes, vía Premium. | Peticiones de documentos e integración por API. |
| Operador de carpeta | Empresa que presta el servicio con infraestructura propia. **Es nuestro sistema.** | Custodia documental, enrutamiento y entrega entre pares. |
| Centralizador MinTIC | Directorio de afiliación, directorio de operadores y autenticación documental. También opera GovCarpeta. | API: validación, registro y resolución de operador. |
| Administrador del operador | Usuario interno que gestiona el funcionamiento técnico. | Control de usuarios, bitácoras y soporte. |
| Estado (analítica) | Consume metadatos agregados para notarías, educación y Registraduría. | Metadatos anonimizados, nunca contenido. |

### 4.2 Flujo de información

1. El ciudadano se registra en el operador y entrega sus datos personales.
2. El operador verifica la identidad contra la Registraduría y consulta al centralizador que no haya afiliación previa.
3. El operador registra la afiliación, genera la cuenta de correo inmutable y sube el documento de identidad firmado.
4. Una entidad emite un documento firmado dirigido al ciudadano desde su propio operador.
5. El operador emisor pregunta al centralizador ante qué operador está el destinatario.
6. Los documentos viajan directamente de operador a operador. El contenido nunca pasa por el centralizador.
7. El operador destino avisa al ciudadano por correo y SMS.
8. Ante una petición, el ciudadano autoriza o rechaza documento por documento antes de que el paquete salga.

### 4.3 Lógica del diagrama

- El operador es el núcleo; todo lo demás se conecta por una interfaz.
- La línea de automatización separa personas de software.
- La línea de integración separa nuestro sistema de los sistemas ajenos.
- Cada flecha lleva los datos que viajan, no el verbo de la acción.
- En rojo, el flujo documental entre operadores: el único que mueve documentos completos y el único sin contrato definido.

**Idea central:** todo lo que va hacia MinTIC son identificadores; todo lo que va hacia otro operador son documentos. Esa asimetría es la decisión de arquitectura que sostiene el resto.

---

## 5. Casos de uso *(referencia interna, no se entrega)*

Archivo: `diagramas/casos-de-uso.html` — once casos de uso, cada uno citando los RF y RNF que realiza.

| Bloque | Casos de uso |
|---|---|
| Lo que hace el ciudadano | Afiliarme · Trasladarme · Ver y descargar · Subir temporal · Compartir paquete · Autorizar petición |
| Lo que hace la entidad | Emitir documento firmado · Pedir documentos a un ciudadano |
| Lo que el operador hace por debajo | Verificar identidad · Enrutar y entregar · Notificar |

---

## 6. El proyecto en palabras simples

Ver la sección 6 del artefacto. Resumen: hoy el ciudadano es el mensajero del Estado; la Carpeta Ciudadana hace que los documentos viajen solos entre entidades y el ciudadano solo dé permiso. Nosotros construimos **uno de los operadores** que custodian esas carpetas. MinTIC no guarda documentos: solo responde «¿ante qué operador está esta cédula?», y con esa respuesta los operadores se hablan directo.

Lo difícil no es guardar archivos: es (1) que dos operadores se entiendan sin contrato común, (2) mudar una carpeta sin dejar al ciudadano con dos operadores o ninguno, (3) que la firma valga sin autoridad certificadora, y (4) ser usable para población de baja apropiación tecnológica mientras se exige segundo factor.

---

## 7. Evidencia de la API GovCarpeta

**Estado el 2026-09-05: en línea y verificada.** Contrato: **Swagger 2.0** (no OpenAPI 3), `basePath: /`, sin bloque `securityDefinitions`.
Los hallazgos de abajo salen de llamadas reales de solo lectura, no de leer el repo.

### 7.1 Superficie real de la API (7 endpoints, base `/apis`)

| Método | Path | Body / params | Comportamiento verificado |
|---|---|---|---|
| `GET` | `/apis/validateCitizen/{id}` | path `id` (number) | **Confirmado en vivo:** `200` = **ya registrado** con string en prosa `"El ciudadano con id: X se encuentra registrado en el operador: Y "`; **`204` sin cuerpo = libre**. |
| `POST` | `/apis/registerCitizen` | `{id, name, address, email, operatorId, operatorName}` | `201` creado; `501` si ya existe; `500` error de aplicación. |
| `DELETE` | `/apis/unregisterCitizen` | `{id, operatorId, operatorName}` en **body** | Documenta **`201` Deleted** (no 200), `204` si no existía, `501` parámetros erróneos. |
| `PUT` | `/apis/authenticateDocument` | `{idCitizen, UrlDocument, documentTitle}` | Recibe una **URL prefirmada de S3** (así lo muestra el ejemplo del contrato), no el binario. Devuelve `200 ok`. |
| `POST` | `/apis/registerOperator` | `{name, address, contactMail, participants[]}` | `201` creado. **El contrato se contradice**: `required` exige `nameOperator` y `adress`, campos que **no existen** en `properties` (`name`, `address`). |
| `PUT` | `/apis/registerTransferEndPoint` | `{idOperator, endPoint, endPointConfirm}` | Sólo `idOperator` y `endPoint` son `required`; `endPointConfirm` es opcional **y no se persiste**. |
| `GET` | `/apis/getOperators` | — | Devuelve **70 operadores**. Campos reales: `_id`, `operatorName`, `participants`, `transferAPIURL`. Nada más. |

### 7.2 Dónde la API NO alcanza (hallazgos verificados en vivo)

1. **No existe NINGÚN endpoint de documentos.** Ni subir, ni transferir, ni consultar metadatos. El centralizador es **puramente un directorio de identidad**. Todo el flujo documental del caso queda fuera de la API, a cargo de contratos entre operadores que nadie especifica.
2. **Sólo 16 de los 70 operadores registrados publican `transferAPIURL`.** Los otros 54 son inalcanzables: no hay forma de transferirles un ciudadano ni de entregarles un documento. **El 77 % del directorio es inerte.** El campo no es obligatorio en el contrato y nadie lo verifica.
3. **`transferAPIURLConfirm` no existe en la respuesta.** No es que venga vacío: `getOperators` **no proyecta el campo en absoluto**, y ninguno de los 70 operadores lo trae. El protocolo de confirmación de transferencia es inobservable desde fuera. *(Corrige la lectura anterior del repo, que asumía proyección con valor vacío.)*
4. **`validateCitizen` devuelve prosa, no datos.** Verificado: `"El ciudadano con id: 1234567890 se encuentra registrado en el operador: Operador Ciudadano "` — string JSON, con **espacio final**. Para localizar el operador destino hay que parsear la frase con expresiones regulares, y el `operatorName` extraído (con su espacio) es la única clave de join contra `getOperators`, que no garantiza unicidad de nombre.
5. **Semántica de `validateCitizen`: RESUELTA.** `200` = ocupado, `204` = libre. Confirmado con cinco identificaciones distintas. La ambigüedad del repo queda cerrada; el riesgo de invertir la lógica desaparece.
6. **`authenticateDocument` recibe una URL, no el documento.** El centralizador no puede firmar un contenido que nunca descarga: como mucho sella una referencia. El no repudio del caso sigue sin soporte real.
7. **Cero autenticación.** Verificado: `GET /apis/getOperators` responde `200` **sin ninguna credencial** — no hay API key, OAuth ni mTLS, y el contrato Swagger no declara `securityDefinitions`. Cualquiera en internet puede llamar `DELETE /apis/unregisterCitizen` y desafiliar a cualquier ciudadano.
8. **CORS es una allowlist que se cae, no `'*'`.** Verificado: sin `Origin` → `200`; `Origin: http://localhost:3000` → `200`; `Origin: https://evil.example` → **`500 Internal Server Error`**, no una denegación CORS limpia. El middleware lanza y nadie captura. Un frontend servido desde un origen no listado recibe un error de servidor. *(Corrige la lectura anterior, que daba el CORS por abierto.)*
9. **El directorio no publica claves públicas.** `getOperators` devuelve nombre, id y participantes. Sin material criptográfico no hay forma de verificar la firma de un operador par: **la confianza federada no es construible con este contrato** (refuerza B-03).
10. **El contrato de `registerOperator` es inconsistente consigo mismo**: la lista `required` nombra `nameOperator` y `adress`, que no están entre las `properties` declaradas (`name`, `address`). Un cliente generado desde el Swagger falla.
11. `DELETE` con body: semántica no garantizada por muchos proxies y clientes HTTP.
12. **Sin idempotencia, sin paginación, sin versionado (`/v1`), sin rate limiting y sin webhooks.** Los 70 operadores llegan en una sola respuesta de 11 KB; descubrir cambios sólo es posible por polling.
13. `operatorId` es un `ObjectId` de MongoDB: detalle de implementación filtrado al contrato público, sin formato documentado.
14. **Punto único de fallo.** Un dyno de Heroku con una Mongo Atlas. Estuvo en `503` ese mismo día antes de volver: la caída no fue hipotética. RNF-01 sigue acotado por este servicio.

---

## 8. Bloqueos y preguntas al profesor

Ordenados por impacto arquitectónico. Todos surgieron al intentar escribir la solución, no al leer.

| # | Pregunta | Por qué bloquea | Qué asumimos mientras tanto | Qué cambia en la arquitectura según la respuesta |
|---|---|---|---|---|
| **B-01** | ¿Existe (o va a existir) un **contrato común de transferencia entre operadores**, o cada equipo define el suyo? MinTIC solo publica una URL, no un esquema. | Es el corazón del caso (transferencia de ciudadano + envío de documentos "directo, sin pasar por el centralizador") y **es literalmente indefinible hoy**. Sin contrato no hay interoperabilidad. **Dato duro nuevo: sólo 16 de los 70 operadores del directorio publican `transferAPIURL`** — el 77 % es inalcanzable, así que hoy la federación ya no interopera de hecho. | Definimos nuestro propio contrato REST `POST /transfer/citizen` + `POST /documents/inbound` (JSON + URLs prefirmadas), versionado, y publicamos su OpenAPI. Asumimos que **solo interoperaremos con nosotros mismos**. | Si el curso fija un contrato común → adaptadores triviales y saga estándar. Si cada equipo inventa → hace falta un **anti-corruption layer y N adaptadores por operador**, lo que cambia el diseño de todo el borde de integración y el modelo de despliegue. |
| **B-02** | ¿Cuál es la semántica de `endPointConfirm` y del protocolo de transferencia? ¿Es un 2PC, una saga con compensación, o un simple ACK? Además, verificado en vivo: **`getOperators` no devuelve el campo `transferAPIURLConfirm` en absoluto** y ninguno de los 70 operadores lo trae; en el contrato el campo es opcional, no `required`. | Determina si la transferencia es **atómica o eventualmente consistente**, y por tanto si puede haber ventanas de doble afiliación o de ciudadano sin operador (violando la unicidad que el PDF exige). | Saga en 3 fases: `initTransfer` → destino confirma recepción íntegra → origen llama `unregisterCitizen` → destino llama `registerCitizen`. Carpeta origen en **solo lectura** durante la ventana. Compensación por timeout de 24 h. | Con 2PC real: coordinador de transacciones, bloqueos distribuidos, peor disponibilidad. Con saga: hay que diseñar **compensaciones, idempotencia y reconciliación**, y aceptar estados intermedios visibles al usuario. Son dos arquitecturas distintas. |
| **B-03** | ¿Quién es la **Autoridad Certificadora** y qué formato de firma se usa (XAdES/PAdES/CAdES/JWS)? `authenticateDocument` recibe una **URL prefirmada**, no el binario: el centralizador no puede firmar lo que nunca descarga. Y **el directorio no publica ninguna clave pública** de los operadores. | Todo el valor del sistema ("autenticidad no discutible", sustituir apostillas) descansa en la firma. Sin PKI, el sistema **no cumple su propósito de negocio** y RNF-15 es indemostrable. | Asumimos PKI simulada: nuestro operador firma con su propia clave (JWS detached sobre el hash SHA-256) y trata `authenticateDocument` como un **sello de tiempo simbólico**, no como firma. | Si MinTIC es la CA raíz → servicio de firma centralizado, nuevo cuello de botella y nueva dependencia en el camino crítico (impacta RNF-01 y RNF-07). Si cada operador firma → hace falta un **modelo de confianza federado** y distribución de claves públicas vía el directorio, que hoy no tiene ese campo. |
| **B-04** | **Contradicción explícita del PDF:** exige que el Estado analice los metadatos documentales (Notarías, Educación, Registraduría) **y a la vez** que el centralizador "maneje la mínima cantidad de transacciones y almacene la mínima cantidad de información" y que se minimice el dato transferido operador↔centralizador. ¿Cuál gana? | Son objetivos **mutuamente excluyentes**. La respuesta define si construimos un pipeline analítico, si exportamos metadatos por lotes o si no construimos nada. Es la mayor incógnita de alcance del entregable. | Asumimos **exportación batch nocturna de metadatos anonimizados/agregados** a un data lake del Estado, fuera del camino del centralizador transaccional. Lo declaramos como asunción explícita en el entregable. | Analítica federada (el Estado consulta a cada operador) vs. centralizada (los operadores empujan al Estado) son arquitecturas opuestas: la primera obliga a exponer una API analítica en cada operador; la segunda añade un pipeline ETL, gobierno de datos y un problema de privacidad de primer orden. |
| **B-05** | ¿Qué servicios son **básicos gratuitos** y cuáles **Premium**? El PDF solo da un ejemplo (PQRS de PQCarpeta) y no cierra la lista. | Afecta el alcance del entregable, el modelo de dominio (cuotas, medición, facturación) y decide si hay que diseñar *metering* y *tenancy* Premium. | Básico = registro, carpeta, recepción, descarga, envío a entidades, traslado. Premium = casos PQRS, cuotas ampliadas, API B2B para entidades, retención extendida de no certificados. | Si hay Premium real → aparecen contextos acotados de **medición, tarificación y facturación**, y un cuarto actor externo (pasarela de pagos) que hoy no está en el diagrama de contexto. |
| **B-06** | ¿Hay que implementar de verdad la **integración con Registraduría** y el correo entrante, o basta con mocks? No existe ninguna API para ninguno de los dos. | RF-02, RF-06 y RF-07 son requisitos explícitos del PDF sin ningún medio de implementación. Cambia el esfuerzo y qué se puede demostrar. | Mock de Registraduría con contrato propio (`GET /identity/{cedula}` → datos + PDF firmado) y buzón SMTP real capturando `@nuestrodominio`. | Si hay que integrar de verdad → aparecen un adaptador de identidad y un subsistema de correo entrante con antivirus, límites de tamaño y anti-spam: dos componentes nuevos de primer nivel. |
| ~~**B-07**~~ **RESUELTO** | ~~¿GovCarpeta es MinTIC u operador privado?~~ **MinTIC gestiona GovCarpeta.** Prevalece el README sobre el PDF. | — | Confirmado, no asumido. | MinTIC tiene **doble rol**: centralizador de interoperabilidad y operador de carpetas. El diagrama de contexto lo refleja como un actor con dos sombreros, y GovCarpeta sale de «Otros Operadores». Queda vivo el asunto de fondo: si el centralizador también opera carpetas hay **conflicto de interés y asimetría competitiva** frente a los operadores privados, y hay que definir si esa rama operadora puede leer lo que pasa por el directorio. |
| ~~**B-08**~~ **RESUELTO** | ~~¿Cuál es la semántica de `validateCitizen`?~~ Verificado en vivo: **`200` = ocupado, `204` = libre**. | — | Confirmado, no asumido. | Residual menor: sigue devolviendo prosa con espacio final, así que el anti-corruption layer con parseo se mantiene. Si MinTIC lo pasara a JSON tipado, desaparece. |
| **B-09** | ¿Hay algún mecanismo de **autenticación entre operadores y hacia el centralizador**? Verificado: `getOperators` responde `200` sin credencial alguna y el Swagger no declara `securityDefinitions`. Cualquiera puede desafiliar a cualquier ciudadano. | Contradice frontalmente el requerimiento de seguridad del PDF ("mecanismo sólido de autenticación", "complejos sistemas de autorización"). No se puede diseñar la seguridad de la federación si su raíz de confianza es abierta. | Diseñamos **mTLS + JWT firmado con la clave del operador** para el tráfico operador↔operador, y aceptamos que el tramo hacia el centralizador queda sin autenticar (riesgo documentado y aceptado). | Si MinTIC emitiera credenciales de operador → aparece un **flujo de onboarding y rotación de claves** y el directorio pasa a ser también un almacén de claves públicas. Si no → hay que documentar el riesgo residual como limitación conocida del sistema. |
| ~~**B-10**~~ **RESUELTO (con reserva)** | El centralizador ya responde. Queda la pregunta de fondo: ¿hay compromiso de disponibilidad para la sustentación, o instancia alterna? | Estuvo caído ese mismo día antes de volver: un dyno de Heroku sin redundancia. La caída no es hipotética. | Réplica local del repo tras un feature flag, como contingencia. | Si no hay compromiso → caché local del directorio con TTL y modo degradado offline: la unicidad de afiliación pasa de consistencia fuerte a eventual. |
| **B-11** | ¿"A perpetuidad" convive con el derecho de **supresión** de datos personales (habeas data / Ley 1581)? ¿Un ciudadano puede eliminar su carpeta o un documento? | Perpetuidad + almacenamiento inmutable (WORM) es **técnicamente incompatible** con el borrado. Determina si el almacenamiento puede ser inmutable o debe ser reversible. | Asumimos **inmutabilidad de los certificados** y borrado permitido solo de los no certificados; el retiro del operador conserva los certificados. | Si el borrado es obligatorio → adiós object-lock; hace falta **cripto-borrado por clave** (destruir la clave del envelope), lo que cambia el diseño de KMS y de gestión de claves por documento. |
| **B-12** | ¿El **alcance del entregable** es solo la documentación (RF/RNF/QoS/contexto) o incluye la implementación del operador? El README lista 4 artefactos, pero el paréntesis dice "cada equipo **implementará** una solución de un Operador". | Cambia por completo la profundidad exigida: un diagrama de contexto no requiere resolver B-01..B-03, una implementación sí. | Asumimos que **este entregable es documental** y que la implementación viene después, pero dejamos las decisiones de integración ya tomadas para no rehacer el diseño. | Si es implementación → los bloqueos B-01, B-02, B-03 y B-06 pasan de ser observaciones a ser **bloqueantes duros de sprint**, y hay que negociar el contrato entre equipos en la primera semana. |
| **B-13** | ¿La cuenta de correo del ciudadano es un **buzón real** (recibe correo de todo internet) o solo un identificador interno? El PDF dice "todos los documentos que se le envíen a esa dirección aparecerán en la carpeta". | Un buzón real implica MX propios, antivirus, anti-spam, cuotas y una superficie de ataque enorme; un identificador no implica casi nada. Es una diferencia de varios componentes. | Asumimos **buzón real restringido**: solo se aceptan correos de remitentes verificados (entidades y operadores registrados); el resto se rechaza. | Buzón abierto → subsistema de correo completo (MTA, escaneo, cuarentena) y su propio perfil de disponibilidad y seguridad. Identificador interno → desaparece un componente entero del diagrama. |
| **B-14** | El PDF dice que la entidad no afiliada recibe los documentos "por correo electrónico, firmados". ¿Cómo se garantiza confidencialidad y no repudio **fuera** del sistema, dado RNF-12? | El correo es un canal no confiable; enviar documentos personales por email contradice el requerimiento de confidencialidad del propio PDF. | Asumimos **enlace de descarga prefirmado de vida corta (72 h) + código OTP**, en lugar de adjuntar el documento al correo. | Si deben ir adjuntos → hace falta cifrado S/MIME o contenedor cifrado con clave fuera de banda: un subsistema de distribución de claves adicional. |
| **B-15** | ¿Cuántos ciudadanos/documentos hay que soportar y con qué presupuesto? El PDF solo dice "un país entero". Todos los números de la Sección 2 son invención nuestra. | Sin cifras, los RNF **no son verificables** y el mapeo a QoS es retórica. Además determina si la arquitectura es monolito modular o microservicios distribuidos. | 50 M de ciudadanos en la federación, 10 % de cuota para nosotros (5 M de carpetas), 30 % de crecimiento anual, ≤ USD 0,15/carpeta/mes. Todo marcado **[ASUNCIÓN]**. | Un orden de magnitud menos → un **monolito modular** con Postgres y almacenamiento de objetos es suficiente y mucho más barato. A la escala asumida → sharding, CQRS y mensajería asíncrona se vuelven obligatorios. |
| **B-16** *(nuevo)* | ¿Publicar `transferAPIURL` es obligatorio para operar? 54 de 70 operadores registrados no lo tienen, y nadie lo verifica. | Define si el directorio es una lista de operadores **operativos** o un simple registro de equipos del curso. Cambia a quién podemos entregar documentos y qué significa «operador registrado». | Asumimos que sólo los 16 con endpoint son destinos válidos; los demás se tratan como no afiliables. | Si es obligatorio → hace falta validación en el alta y un estado de operador. Si es opcional → el descubrimiento necesita un **health check propio por operador** antes de intentar cualquier entrega, más una política de fallback. |
