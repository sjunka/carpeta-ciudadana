# Carpeta Ciudadana — Entrega 1

> Generado por `npm run md` desde `src/content/*.json`. **No editar a mano.**

> Sitio: https://sjunka.github.io/carpeta-ciudadana/

> Fuentes: enunciado del assignment; *Caso de estudio — Carpeta Ciudadana, Sistemas Distribuidos* (texto completo); API GovCarpeta, **verificada en vivo el 5 de septiembre de 2026** mediante llamadas de solo lectura a `getOperators`, `validateCitizen` y a las cabeceras CORS, más el contrato Swagger 2.0 servido por el propio host. No se ejecutó ninguna escritura. El diagrama de contexto sigue el modelo de *system context artifact* presentado en clase. La sección 04 se apoya en el material del curso: *Arquitectura de Software Moderna — Módulo I* (arquitectura nativa de la nube, *Twelve-Factor App* y drivers de granularidad de microservicios) y el *Software Requirements Specification Template* basado en ANSI/IEEE Std. 830-1984, §3.6 y §3.7.

---

## 1. Requerimientos funcionales

### RF-02 · Gestión documental

El corazón del producto: qué se guarda, con qué metadatos y por cuánto tiempo.

| ID | Requerimiento | Descripción | Prioridad |
|---|---|---|---|
| RF-02.1 | Almacenamiento a perpetuidad | El sistema debe conservar de forma indefinida todos los documentos certificados, sin límite de tamaño ni de cantidad. | Alta |
| RF-02.4 | Conservación de la firma | Los documentos emitidos por entidades deben conservarse con su firma digital intacta, de modo que su autenticidad no pueda discutirse. | Alta |
| RF-02.5 | Verificación de autenticidad | El sistema debe permitir validar en cualquier momento la firma y la integridad de un documento certificado. **[BLOQUEO]** *B-03 · No hay PKI ni autoridad certificadora definida.* | Alta |
| RF-02.3 | Registro de metadatos | Todo documento debe almacenarse con los metadatos que permiten clasificarlo, identificarlo, decir qué entidad lo avala y qué fechas tiene. **[BLOQUEO]** *B-01 · No hay esquema de metadatos común definido por MinTIC.* | Alta |
| RF-02.11 | Bitácora del documento | El sistema debe registrar en una bitácora inalterable toda operación sobre cada documento: cargue, consulta, descarga, compartición y transferencia. | Alta |
| RF-02.6 | Consulta y navegación | El ciudadano debe poder listar, buscar y filtrar sus documentos por tipo, entidad emisora, fecha y estado de certificación. | Alta |
| RF-02.8 | Recepción por correo | Todo documento enviado a la cuenta institucional del ciudadano debe ingresar automáticamente a su carpeta. **[BLOQUEO]** *B-13 · Falta definir si es un buzón real de internet o un identificador.* | Alta |
| RF-02.7 | Descarga e impresión | El ciudadano debe poder descargar e imprimir cualquier documento conservando la evidencia de firma. | Alta |
| RF-02.2 | Carga de documentos temporales | El ciudadano debe poder subir documentos no certificados, sujetos a una cuota por usuario. **[ASUNCIÓN]** *El caso dice «limitada», sin cifra.* | Alta |
| RF-02.9 | Sustitución de temporal | El sistema debe permitir relacionar la versión firmada con el temporal que sustituye, conservando la trazabilidad de ambos. | Media |
| RF-02.10 | Eliminación controlada | El ciudadano debe poder eliminar documentos no certificados; los certificados solo se retiran según la política de retención. **[BLOQUEO]** *B-11 · Perpetuidad y derecho de supresión no están conciliados.* | Media |

### RF-03 · Interoperabilidad entre operadores

Lo que convierte a un operador aislado en parte de una federación.

| ID | Requerimiento | Descripción | Prioridad |
|---|---|---|---|
| RF-03.1 | Localización del operador destino | El operador debe consultar al centralizador ante qué operador está afiliado el destinatario antes de enviarle documentos. | Alta |
| RF-03.2 | Transferencia directa | El operador debe transferir los documentos y sus metadatos directamente al operador destino, sin que el contenido pase por el centralizador. | Alta |
| RF-03.3 | Recepción de documentos externos | El operador debe exponer una interfaz para que otros operadores le entreguen documentos, validando firma y metadatos antes de aceptarlos. **[BLOQUEO]** *B-01 · No existe contrato MinTIC para esta interfaz.* | Alta |
| RF-03.5 | Confirmación y reintento | Toda transferencia debe generar acuse de recibo, reintentarse ante fallas y ser idempotente. | Alta |
| RF-03.8 | Contrato común de intercambio | El operador debe implementar el contrato de servicios definido por MinTIC, idéntico para todos, para garantizar la interoperabilidad. **[BLOQUEO]** *B-01 · Hoy solo 16 de 70 operadores publican endpoint de transferencia.* | Alta |
| RF-03.7 | Emisión por parte de la entidad | Una entidad afiliada debe poder cargar documentos firmados dirigidos a un ciudadano, disparando la resolución de operador y la entrega. | Alta |
| RF-03.6 | Solicitud de documentos a entidades | El ciudadano debe poder radicar solicitudes de expedición ante entidades y consultar el estado de cada una. | Alta |
| RF-03.4 | Entrega alterna por correo | El operador debe entregar los documentos por correo electrónico, firmados, cuando el destinatario no esté afiliado a ningún operador. **[BLOQUEO]** *B-14 · El correo plano contradice el requisito de confidencialidad.* | Alta |

### RF-01 · Registro, afiliación y traslado

Alta el ciclo de vida de la afiliación: quién entra, quién sale y cómo se muda.

| ID | Requerimiento | Descripción | Prioridad |
|---|---|---|---|
| RF-01.1 | Registro de ciudadano | El operador debe permitir la inscripción de un ciudadano capturando documento, nombres, correo de contacto y teléfono móvil. | Alta |
| RF-01.3 | Validación de afiliación única | El operador debe consultar al centralizador que el ciudadano no esté afiliado a otro operador antes de completar el registro. | Alta |
| RF-01.2 | Verificación de identidad | El operador debe validar la identidad del ciudadano contra la Registraduría Nacional antes de activar la carpeta. **[ASUNCIÓN]** *No existe API de Registraduría; se asume un adaptador propio.* | Alta |
| RF-01.4 | Notificación de afiliación | El operador debe informar al centralizador que el ciudadano es ahora cliente suyo. | Alta |
| RF-01.8 | Ejecución del traslado | El operador origen debe transferir la totalidad de documentos y metadatos al destino y desafiliar al ciudadano solo tras confirmación. **[BLOQUEO]** *B-01 · El protocolo de transferencia no está especificado por MinTIC.* | Alta |
| RF-01.7 | Solicitud de traslado | El ciudadano debe poder solicitar el traslado de su carpeta hacia otro operador autorizado. | Alta |
| RF-01.5 | Asignación de cuenta de correo | El sistema debe generar una cuenta de correo institucional única e inmutable de por vida, que sobrevive al traslado de operador. **[ASUNCIÓN]** *El caso fija el ejemplo pero no la regla de derivación ni el manejo de colisiones.* | Alta |
| RF-01.6 | Carga del documento de identidad | El operador debe subir a la carpeta el documento de identidad firmado por la Registraduría al completar el registro. | Alta |
| RF-01.9 | Registro de entidades y empresas | El operador debe permitir el registro de entidades y empresas, dotándolas de una carpeta institucional con las mismas capacidades. | Alta |
| RF-01.10 | Cancelación de afiliación | El operador debe permitir dar de baja a un ciudadano o entidad, notificando al centralizador y preservando la custodia de los certificados. | Media |

### RF-04 · Compartición, solicitudes y autorizaciones

El consentimiento del ciudadano como puerta de todo movimiento de documentos.

| ID | Requerimiento | Descripción | Prioridad |
|---|---|---|---|
| RF-04.4 | Autorización explícita | Ningún documento puede compartirse sin autorización expresa del titular; el sistema debe capturar la decisión de aprobar, aprobar en parte o rechazar. | Alta |
| RF-04.2 | Envío de paquetes | El paquete debe entregarse a la carpeta institucional del destinatario si está afiliado, o por correo si no lo está. En ambos casos va firmado. | Alta |
| RF-04.1 | Armado de paquetes | El ciudadano debe poder seleccionar varios documentos y agruparlos en un paquete para enviarlo a una entidad o empresa. | Alta |
| RF-04.3 | Petición de documentos | Una entidad debe poder registrar, desde su propio operador, una petición dirigida a un ciudadano indicando qué documentos requiere y con qué finalidad. | Alta |
| RF-04.5 | Vigencia y revocación | Las autorizaciones deben poder tener vigencia limitada y ser revocables por el ciudadano en cualquier momento. **[ASUNCIÓN]** *El caso no menciona vigencia; la añadimos por el requisito de confidencialidad.* | Media |
| RF-04.7 | Compleción con faltantes | El ciudadano debe poder cargar una versión temporal del documento que le falta y radicar en el mismo flujo la solicitud del definitivo. | Alta |
| RF-04.6 | Seguimiento de solicitudes | El sistema debe permitir a solicitante y ciudadano consultar el estado de cada petición: pendiente, autorizada, rechazada o entregada. | Media |

### RF-09 · Seguridad, identidad y auditoría

Lo que impide que el sistema se convierta en una fuga de datos nacional.

| ID | Requerimiento | Descripción | Prioridad |
|---|---|---|---|
| RF-09.2 | Autorización por roles y atributos | El sistema debe impedir que personas no autorizadas vean o modifiquen documentos ajenos, distinguiendo titular, delegado, entidad solicitante y administrador. | Alta |
| RF-09.1 | Autenticación de usuarios | El sistema debe autenticar a ciudadanos, funcionarios y sistemas con un mecanismo sólido, con segundo factor para operaciones sensibles. | Alta |
| RF-09.3 | Autenticación entre sistemas | Las llamadas entre operadores y con el centralizador deben autenticarse mutuamente mediante certificados o credenciales emitidas por MinTIC. **[BLOQUEO]** *B-09 · Hoy el centralizador no exige credencial alguna.* | Alta |
| RF-09.4 | Registro de auditoría | Toda operación de acceso, autorización y transferencia debe quedar registrada con usuario, fecha, origen y resultado, en un log no alterable. | Alta |
| RF-09.6 | Gestión del consentimiento | El sistema debe registrar y conservar la evidencia del consentimiento otorgado por el ciudadano para cada compartición. | Alta |
| RF-09.5 | Consulta de accesos | El ciudadano debe poder consultar quién accedió a sus documentos y bajo qué autorización. | Media |

### RF-06 · Servicios del centralizador

Lo que MinTIC presta, y el límite explícito de lo que no debe hacer.

| ID | Requerimiento | Descripción | Prioridad |
|---|---|---|---|
| RF-06.1 | Directorio ciudadano–operador | El centralizador debe mantener la asociación entre el identificador del ciudadano y su operador, y nada más que eso. | Alta |
| RF-06.4 | Consulta de afiliación | El centralizador debe devolver el operador al que pertenece un ciudadano, para habilitar el enrutamiento. | Alta |
| RF-06.2 | Registro de ciudadano | El centralizador debe exponer una operación para registrar a un ciudadano, rechazándola si ya existe afiliación vigente con otro operador. | Alta |
| RF-06.3 | Desregistro de ciudadano | El centralizador debe exponer una operación para eliminar la afiliación y habilitar el traslado. | Alta |
| RF-06.8 | No custodia de documentos | El centralizador no debe almacenar documentos ni metadatos de negocio; su información se limita al enrutamiento y la validación. | Alta |
| RF-06.5 | Directorio de operadores | El centralizador debe publicar el listado de operadores autorizados con las direcciones de sus servicios de interoperabilidad. **[BLOQUEO]** *B-16 · 54 de 70 operadores no publican endpoint y nadie lo valida.* | Alta |
| RF-06.6 | Autenticación de documentos | El centralizador debe ofrecer un servicio para registrar y verificar la autenticidad de un documento. **[BLOQUEO]** *B-03 · Hoy recibe una URL y nunca descarga el documento.* | Alta |
| RF-06.7 | Control de operadores | El centralizador debe permitir dar de alta, suspender y dar de baja operadores, verificando las condiciones técnicas exigidas. | Media |

### RF-05 · Notificaciones

El canal por el que el ciudadano se entera de que algo pasó.

| ID | Requerimiento | Descripción | Prioridad |
|---|---|---|---|
| RF-05.1 | Aviso por correo | El sistema debe notificar por correo al ciudadano cuando lleguen documentos nuevos a su carpeta. | Alta |
| RF-05.2 | Aviso por SMS | El sistema debe notificar por SMS los eventos críticos, en particular las peticiones que requieren autorización. | Alta |
| RF-05.3 | Centro de notificaciones | El sistema debe presentar el historial de notificaciones y las alertas pendientes de atención. | Media |
| RF-05.4 | Preferencias de canal | El ciudadano debe poder configurar por qué canales desea ser notificado. | Baja |

### RF-08 · Analítica para el Estado

Lo que el Estado quiere saber, sin tocar el contenido de los documentos.

| ID | Requerimiento | Descripción | Prioridad |
|---|---|---|---|
| RF-08.2 | Anonimización | El sistema debe disociar de la identidad del ciudadano todo dato entregado para análisis, salvo autorización legal expresa. | Alta |
| RF-08.1 | Consolidación de metadatos | El sistema debe consolidar periódicamente los metadatos de los documentos, nunca su contenido, en un repositorio analítico. **[BLOQUEO]** *B-04 · Choca con el mandato de mínima información en el centralizador.* | Media |
| RF-08.3 | Contexto Notarías | El sistema debe permitir responder preguntas sobre actividad notarial: volúmenes, tipos de acto y distribución geográfica y temporal. | Media |
| RF-08.4 | Contexto Educación | El sistema debe permitir responder preguntas sobre títulos y actas de grado emitidos: institución, programa, nivel y año. | Media |
| RF-08.5 | Contexto Registraduría | El sistema debe permitir responder preguntas sobre documentos de identidad y cobertura de registro de la población. | Media |
| RF-08.6 | Tableros y reportes | El sistema debe ofrecer tableros para el consumo de los resultados por MinTIC y las entidades autorizadas. | Baja |

### RF-07 · Servicios Premium

La parte del modelo de negocio que financia lo gratuito.

| ID | Requerimiento | Descripción | Prioridad |
|---|---|---|---|
| RF-07.1 | Catálogo Premium | El operador debe poder definir un catálogo de servicios Premium y permitir su contratación. **[BLOQUEO]** *B-05 · No está cerrado qué es básico y qué es Premium.* | Media |
| RF-07.4 | API para empresas | El operador debe exponer una API que permita a las empresas integrar sus sistemas de trámite con la carpeta. | Media |
| RF-07.5 | Medición y facturación | El sistema debe medir el consumo Premium y facturarlo, garantizando que los servicios básicos sigan siendo gratuitos. | Media |
| RF-07.2 | Casos de soporte PQRS | El operador debe permitir a una empresa cliente armar casos de soporte y asociarles documentos. | Media |
| RF-07.3 | Solicitud desde un caso | Desde un caso PQRS la empresa debe poder pedir documentos a sus clientes sin importar su operador. | Media |

## 2. Requerimientos no funcionales

| ID | Atributo de calidad | Requerimiento | Criterio de aceptación |
|---|---|---|---|
| RNF-10 | Confidencialidad | Los documentos deben ser confidenciales en tránsito y en reposo, incluso frente al personal del operador. **[Del caso]** | TLS 1.3 en todo canal; cifrado AES-256 en reposo con gestión de llaves segregada y auditada. |
| RNF-13 | No repudio | Debe ser imposible discutir la autenticidad de un certificado o negar haberlo autorizado. **[Del caso]** | Firma con sellado de tiempo verificable; verificación en cada recepción; evidencia conservada. |
| RNF-03 | Retención | Los documentos certificados se conservan a perpetuidad, sin límite de tamaño. **[Del caso]** | Mínimo 100 años contractuales. Los no certificados caducan según cuota. |
| RNF-02 | Durabilidad | Los documentos certificados deben conservarse sin pérdida ni corrupción. **[ASUNCIÓN]** | ≥ 3 réplicas en zonas independientes; verificación periódica por hash; pérdida objetivo cero. |
| RNF-01 | Disponibilidad | La consulta y descarga de documentos certificados no puede depender de un único centro de datos. **[ASUNCIÓN]** | ≥ 99,95 % mensual para lectura; ≥ 99,5 % para escritura, con degradación a modo encolado. |
| RNF-16 | Usabilidad | Todos los ciudadanos, incluidos los de baja apropiación tecnológica, deben poder usar el sistema. **[ASUNCIÓN]** | Tasa de éxito ≥ 90 % con usuarios de baja alfabetización digital; ≤ 5 pasos para autorizar; SUS ≥ 80. |
| RNF-19 | Interoperabilidad | Los operadores deben integrarse entre sí mediante contratos estándar versionados que no rompan integraciones. **[ASUNCIÓN]** | API documentada, versionada y retrocompatible; esquema común de metadatos; formatos de firma estandarizados. |
| RNF-20 | Carga mínima del centralizador | El centralizador debe manejar la mínima cantidad de transacciones y almacenar la mínima información. **[Del caso]** | ≤ 4 transacciones por ciclo de vida de afiliación y 0 bytes de contenido documental. |
| RNF-06 | Consistencia | Se admite consistencia eventual en documentos y avisos, pero la afiliación debe ser fuertemente consistente. **[ASUNCIÓN]** | Cero casos de doble afiliación; convergencia del estado documental ≤ 5 min. |
| RNF-07 | Tolerancia a fallos | La caída de un operador no debe producir pérdida de mensajes ni impedir la operación del resto. **[ASUNCIÓN]** | Entregas encoladas con reintento exponencial; operaciones idempotentes; cola de mensajes muertos. |
| RNF-08 | Escalabilidad | El sistema debe soportar la población del país, con carpeta desde el registro y volumen creciente. **[ASUNCIÓN]** | Escalado horizontal hasta 50 M de carpetas; crecimiento ≥ 30 % anual sin degradar el p95. |
| RNF-04 | Rendimiento | Las operaciones interactivas deben responder de forma fluida en carga normal y en pico. **[ASUNCIÓN]** | p95 ≤ 2 s en consulta y navegación; p95 ≤ 5 s al cargar un documento de hasta 10 MB. |
| RNF-11 | Autenticación | Debe existir un mecanismo sólido de autenticación para ciudadanos, funcionarios y sistemas. **[ASUNCIÓN]** | Segundo factor obligatorio para autorizar comparticiones; bloqueo tras intentos fallidos; sesiones con expiración. |
| RNF-12 | Autorización | El modelo debe ser expresivo para impedir accesos indebidos en escenarios de delegación. **[ASUNCIÓN]** | Cero accesos fuera de política en pruebas de penetración; toda decisión de autorización registrada. |
| RNF-14 | Trazabilidad | Toda operación relevante debe quedar registrada de forma inalterable. **[ASUNCIÓN]** | Log append-only, retención ≥ 10 años, consultable en ≤ 5 s y exportable ante requerimiento de autoridad. |
| RNF-15 | Privacidad y cumplimiento | El tratamiento de datos personales debe cumplir la normativa colombiana. **[Del caso]** | Cumplimiento verificable de la Ley 1581 de 2012; registro de consentimientos; minimización de datos. |
| RNF-22 | Portabilidad | Un ciudadano debe trasladarse de operador sin pérdida de información ni de identidad digital. **[ASUNCIÓN]** | Traslado completo ≤ 24 h; cuenta de correo conservada; verificación de integridad al finalizar. |
| RNF-09 | Capacidad | El operador debe absorber los picos de campañas públicas sin rediseño. **[ASUNCIÓN]** | 2.000 peticiones/s en horario laboral; 5.000 en pico de convocatoria. |
| RNF-05 | Latencia de mensajería | El sistema no es de tiempo real, pero la latencia entre operadores debe ser tan baja como sea posible. **[ASUNCIÓN]** | p95 de entrega entre operadores ≤ 30 s; aviso al ciudadano ≤ 2 min desde la recepción. |
| RNF-23 | Recuperabilidad | Debe existir un plan probado de continuidad ante la pérdida de una región o de un proveedor. **[ASUNCIÓN]** | RPO ≤ 5 min y RTO ≤ 30 min para el índice; pruebas de recuperación semestrales con evidencia. |
| RNF-25 | Observabilidad | El sistema debe permitir detectar y diagnosticar fallos de integración entre operadores de forma oportuna. **[ASUNCIÓN]** | Métricas, trazas distribuidas y alertas sobre latencia y tasa de error de las transferencias. |
| RNF-29 | Desplegabilidad | Un cambio debe poder llegar a producción sin interrumpir el servicio ni coordinar despliegues entre equipos. **[ASUNCIÓN]** | Despliegue independiente por servicio; cero minutos de indisponibilidad planificada; reversión en ≤ 10 min. |
| RNF-30 | Elasticidad | La capacidad debe seguir a la demanda de forma automática, sin intervención humana ni sobreaprovisionamiento permanente. **[ASUNCIÓN]** | Tiempo medio hasta la puesta en marcha de una instancia ≤ 60 s; utilización sostenida entre 50 % y 70 %. |
| RNF-26 | Modificabilidad | La arquitectura debe admitir nuevos tipos documentales sin rediseño. **[ASUNCIÓN]** | Nuevo tipo configurable con cero cambios en el núcleo; despliegues sin interrupción. |
| RNF-17 | Accesibilidad | Las interfaces deben servir a personas con discapacidad y a dispositivos de gama baja. **[ASUNCIÓN]** | WCAG 2.1 nivel AA; diseño responsive; funcionamiento en navegadores con dos versiones de antigüedad. |
| RNF-18 | Canales alternos | El sistema debe apoyarse en canales de baja fricción para llegar a población con acceso limitado. **[Del caso]** | Correo y SMS disponibles para el 100 % de los ciudadanos registrados. |
| RNF-21 | Minimización de datos | Debe minimizarse el volumen transferido entre operadores y centralizador. **[ASUNCIÓN]** | ≤ 2 KB por transacción; caché local del directorio con TTL; consultas por lotes. |
| RNF-24 | Cuotas de almacenamiento | El almacenamiento de documentos no certificados debe estar limitado por usuario. **[ASUNCIÓN]** | Máximo 20 documentos y 200 MB por ciudadano; aviso al 80 % y bloqueo al 100 %, solo para no certificados. |
| RNF-27 | Libertad tecnológica | No hay restricción sobre tecnologías ni sobre la ubicación del almacenamiento, incluida la nube fuera del país. **[Del caso]** | Arquitectura agnóstica de proveedor, sin dependencias que impidan cambiar de nube. |
| RNF-28 | Coste | El coste marginal debe sostener un modelo con servicios básicos gratuitos. **[ASUNCIÓN]** | ≤ USD 0,15 por carpeta activa al mes. |

## 3. Mapeo de requerimientos no funcionales vs QoS

| RNF | Atributo de QoS | Métrica o indicador | Objetivo / umbral | Táctica arquitectónica | Punto de fricción |
|---|---|---|---|---|---|
| RNF-10, 11, 12 | Seguridad | % cifrado · accesos fuera de política | 100 % cifrado · cero accesos indebidos | Cifrado por sobre con gestión de llaves, autorización por atributos con alcance por documento, URL prefirmadas de vida corta. | El segundo factor obligatorio es el mayor enemigo de la usabilidad en población de baja apropiación tecnológica. |
| RNF-13 | No repudio | % de documentos con firma verificable | 100 % | Firma sobre el documento con sellado de tiempo y verificación en la frontera de entrada. | Sin autoridad certificadora definida, «firmado» es decorativo. Es el bloqueo B-03. |
| RNF-01, 02, 03 | Disponibilidad | Uptime mensual, MTTR | ≥ 99,95 % lectura · MTTR ≤ 30 min | Redundancia activa multizona, circuit breaker hacia operadores externos, degradación a solo lectura. | El techo real lo pone el centralizador de MinTIC, que no controlamos y que estuvo caído el 5 de septiembre. |
| RNF-16, 17, 18 | Usabilidad | Tasa de éxito de tarea · SUS · WCAG | ≥ 90 % · SUS ≥ 80 · nivel AA | Asistentes paso a paso, valores por defecto seguros, canal SMS, lenguaje claro y deshacer. | Cada control de seguridad que añadimos resta un punto de usabilidad. El caso pone la usabilidad como máxima prioridad. |
| RNF-19, 22 | Interoperabilidad | % de transferencias automáticas | 100 % hacia operadores del directorio | Capa anticorrupción por operador, contrato versionado, saga de transferencia con confirmación. | Hoy imposible: solo 16 de 70 operadores publican endpoint. Es el bloqueo B-01. |
| RNF-20, 21 | Eficiencia del centralizador | Transacciones y bytes hacia el centro | ≤ 4 transacciones · ≤ 2 KB | El centralizador como directorio, no como bus: solo índices y punteros, entrega entre pares, caché local con TTL. | Menos tráfico al centro es menos observabilidad para el Estado, que la necesita para RF-08. |
| RNF-06, 07 | Fiabilidad | Casos de doble afiliación · tasa de entrega | Cero dobles afiliaciones · entrega eventual 100 % | Afiliación con consistencia fuerte contra el centralizador; documentos por mensajería asíncrona con outbox e idempotencia. | La asincronía hace más difícil dar respuesta clara al ciudadano. Choca de frente con RNF-16. |
| RNF-08, 09 | Escalabilidad | Carpetas soportadas · peticiones/s | 50 M de carpetas · 5.000 pet./s en pico | Servicios sin estado con autoescalado, partición por identificación del ciudadano, almacenamiento desacoplado del cómputo. | Particionar por cédula complica las consultas analíticas transversales que pide RF-08. |
| RNF-04, 05 | Rendimiento | p95 y p99 de latencia | p95 ≤ 2 s en consulta · p95 ≤ 30 s entre operadores | CQRS con vista materializada del índice de carpeta, CDN para descargas, URL prefirmadas. | Consistencia eventual: un documento recién llegado puede tardar en verse. Aceptable porque el caso descarta el tiempo real. |
| RNF-14, 15 | Auditoría y cumplimiento | Eventos auditados/s · hallazgos de auditoría | Consulta ≤ 5 s · cero hallazgos críticos | Log append-only en almacenamiento inmutable separado, clasificación y minimización de datos. | El volumen de auditoría puede superar al documental. Y la perpetuidad choca con el derecho de supresión. |
| RNF-23 | Recuperabilidad | RPO · RTO | RPO ≤ 5 min · RTO ≤ 30 min | Copias continuas con recuperación a un punto en el tiempo, réplicas entre regiones, ensayos semestrales. | Un RTO de 30 minutos es incompatible con recuperar petabytes. Solo aplica al índice, no al contenido. |
| RNF-25, 26 | Mantenibilidad | Cambios por tipo documental · MTTD | Cero cambios en el núcleo · detección ≤ 5 min | Esquemas de metadatos declarativos y versionados, métricas y trazas distribuidas por transferencia. | Un esquema flexible dificulta las consultas analíticas fuertemente tipadas. |
| RNF-29, 30 | Agilidad operativa | Tiempo de entrega de un cambio · MTTS | Despliegue sin corte · arranque ≤ 60 s | Contenedores inmutables con despliegue progresivo, procesos sin estado y autoescalado por métrica de carga. | Arrancar rápido obliga a no cargar datos al inicio, y eso traslada latencia a la primera petición de cada instancia. |
| RNF-27 | Portabilidad | Dependencias propietarias | Cero bloqueos de proveedor | Abstracción del almacenamiento de objetos y de la mensajería tras interfaces propias. | Ser agnóstico cuesta: se renuncia a servicios gestionados que serían más baratos y rápidos. |
| RNF-24, 28 | Coste | USD por carpeta activa al mes | ≤ USD 0,15 | Almacenamiento por niveles, deduplicación y compresión, con cuota para los no certificados. | El nivel de archivo frío rompe la disponibilidad: recuperar tarda horas. «A perpetuidad y siempre disponible» es caro por definición. |

## 4. Restricciones de arquitectura

Lo que acota el diseño antes de diseñar: las restricciones que impone la plataforma, los límites que el sistema no debe cruzar y el tamaño que deberían tener las piezas. Sale del template del curso (§3.6 y §3.7) y del material de arquitectura nativa de la nube.

### 4.1 Restricciones de diseño

Lo que acota las opciones del diseño antes de empezar a diseñar. Cada restricción cita de dónde sale: el caso de estudio, un factor de la metodología *Twelve-Factor App* o un pilar de arquitectura nativa de la nube vistos en clase.

| ID | Restricción | Descripción | Origen |
|---|---|---|---|
| RD-14 | Centralizador externo no modificable | El sistema debe adaptarse al centralizador de MinTIC tal como está: no podemos cambiar su contrato, su disponibilidad ni su modelo de datos. **[Del caso]** | Caso de estudio |
| RD-15 | Contrato GovCarpeta congelado | El sistema debe consumir la API GovCarpeta tal como se verificó: Swagger 2.0, sin definiciones de seguridad y sin versionado en la ruta. **[Del caso]** | Evidencia de la API · sección 08 |
| RD-12 | Descomposición por capacidad de negocio | El sistema debe partirse en cortes verticales de negocio — afiliación, documento, entrega, autorización — y no en capas técnicas de presentación, lógica y datos. **[ASUNCIÓN]** | Microservicios · Capacidades de negocio |
| RD-11 | Sin base de datos compartida | El sistema no debe integrar dos servicios a través de un esquema de datos común: la integración ocurre por interfaz publicada o por mensajería. **[ASUNCIÓN]** | Microservicios · Persistencia políglota |
| RD-08 | Diseño API-first | El sistema debe definir y publicar el contrato de sus interfaces antes de implementar la funcionalidad que las sirve, empezando por la interfaz federada entre operadores. **[ASUNCIÓN]** | Cloud native · API-first design |
| RD-02 | Procesos sin estado | El sistema debe ejecutarse como procesos sin estado, de modo que cualquier instancia pueda atender cualquier petición sin sesiones pegajosas. **[ASUNCIÓN]** | Twelve-Factor VI · Processes |
| RD-03 | Escalado horizontal | El sistema debe crecer añadiendo instancias y no ampliando la memoria o la CPU de las existentes. **[ASUNCIÓN]** | Twelve-Factor VIII · Concurrency |
| RD-06 | Empaquetado en contenedores | El sistema debe distribuirse como imágenes de contenedor versionadas, de forma que desarrollo, pruebas y producción ejecuten el mismo artefacto. **[ASUNCIÓN]** | Cloud native · Containers · Twelve-Factor X |
| RD-04 | Infraestructura inmutable | El sistema no debe parchear un entorno de ejecución en caliente: un cambio se aplica reemplazando la instancia por una construida de nuevo. **[ASUNCIÓN]** | Cloud native · Immutable infrastructure |
| RD-13 | Observabilidad desde el primer despliegue | El sistema debe emitir métricas, trazas distribuidas y eventos desde su primera versión desplegada, y no añadirlos cuando aparezca el primer incidente. **[ASUNCIÓN]** | Cloud native · Observability |
| RD-05 | Servicios de respaldo enchufables | El sistema debe tratar la base de datos, el almacén de objetos y la mensajería como recursos adjuntos, intercambiables cambiando configuración y sin tocar el código. **[ASUNCIÓN]** | Twelve-Factor IV · Backing services |
| RD-01 | Configuración fuera del artefacto | El sistema debe leer toda su configuración del entorno de ejecución, sin puertos, credenciales ni direcciones de otros operadores escritos en el código. **[ASUNCIÓN]** | Twelve-Factor III · Config |
| RD-07 | Separación de construcción y ejecución | El sistema debe construirse una vez y desplegarse muchas, sin que la etapa de ejecución pueda alterar el artefacto construido. **[ASUNCIÓN]** | Twelve-Factor V · Build, release, run |
| RD-09 | Registros como flujo de eventos | El sistema no debe escribir ni rotar ficheros de registro: emite eventos a la salida estándar y el entorno de ejecución los recoge. **[ASUNCIÓN]** | Twelve-Factor XI · Logs |
| RD-10 | Tareas de administración separadas | El sistema debe ejecutar las migraciones de datos y las cargas masivas como procesos puntuales aparte, con la misma versión y configuración que el servicio. **[ASUNCIÓN]** | Twelve-Factor XII · Admin processes |

### 4.2 Requerimientos inversos

Lo que el sistema **no** debe hacer. El template del curso los pide aparte (§3.6) porque un límite explícito evita que alguien lo cruce creyendo que mejora el producto.

| ID | Límite | El sistema no debe… |
|---|---|---|
| RI-01 | Sin contenido por el centralizador | El sistema no debe hacer pasar el contenido de ningún documento por el centralizador de MinTIC; solo consulta y actualiza el directorio de afiliación. **[Del caso]** |
| RI-03 | Sin doble afiliación | El sistema no debe permitir que un ciudadano quede afiliado a dos operadores a la vez, ni siquiera de forma transitoria durante un traslado. **[Del caso]** |
| RI-08 | Sin entrega no autorizada | El sistema no debe entregar un documento a un tercero sin autorización explícita del ciudadano titular para esa petición concreta. **[Del caso]** |
| RI-06 | Sin lectura por el operador | El operador no debe poder leer el contenido de un documento del ciudadano sin una autorización registrada y auditable del titular. **[ASUNCIÓN]** |
| RI-05 | Sin cuota para certificados | El sistema no debe limitar la cantidad ni el tamaño de los documentos certificados; la cuota aplica únicamente a los no certificados. **[Del caso]** |
| RI-02 | Sin garantías de tiempo real | El sistema no debe prometer entrega en tiempo real entre operadores, porque MinTIC descartó explícitamente ese requisito. **[Del caso]** |
| RI-04 | Sin cambio de cuenta de correo | El sistema no debe permitir modificar la cuenta de correo institucional después del primer registro del ciudadano. **[Del caso]** |
| RI-07 | Sin cobro por servicios básicos | El operador no debe cobrar por las funciones que el caso define como servicios básicos; el cobro se limita a los servicios Premium. **[Del caso]** |

### 4.3 Drivers de granularidad

Los nueve dominios funcionales pasados por los desintegradores de granularidad de la clase: alcance y función, volatilidad del código, escalabilidad y rendimiento, tolerancia a fallos y extensibilidad. Todavía no es una descomposición en servicios — es la evidencia que justificará esa decisión en la siguiente entrega.

| Dominio | Driver dominante | Veredicto | Por qué |
|---|---|---|---|
| RF-02 · Gestión documental | Escalabilidad y rendimiento | Partir en dos | El índice de la carpeta se consulta miles de veces por cada escritura de contenido. Índice y almacenamiento tienen perfiles de carga opuestos y deben escalar por separado. |
| RF-03 · Interoperabilidad | Tolerancia a fallos | Aislar | Habla con 70 operadores ajenos de fiabilidad desconocida. Un fallo en cascada aquí no puede tumbar la consulta de la carpeta propia. |
| RF-01 · Afiliación | Tolerancia a fallos | Aislar | Es el único dominio que exige consistencia fuerte contra el centralizador. Mezclarlo con el resto arrastraría la carpeta entera a la disponibilidad de MinTIC. |
| RF-04 · Autorizaciones | Alcance y función | Aislar | Cohesión muy alta alrededor de una sola idea — el consentimiento — y es el punto que toda operación de entrega tiene que consultar. |
| RF-09 · Seguridad y auditoría | Alcance y función | Partir en dos | Identidad y bitácora no tienen nada en común: una está en el camino crítico de cada petición, la otra solo escribe. No hay cohesión que las mantenga juntas. |
| RF-06 · Centralizador | No aplica | Fuera del alcance | Es sistema externo. Aquí solo se diseña el adaptador con capa anticorrupción que lo consume. |
| RF-05 · Notificaciones | Escalabilidad y extensibilidad | Mantener unido | Correo y SMS son dos modos del mismo propósito: avisar. Es el ejemplo de la clase — hay cohesión, así que un solo servicio hace tres cosas. |
| RF-08 · Analítica | Escalabilidad y rendimiento | Aislar | Consultas largas sobre metadatos de millones de carpetas. Compartir motor con lo transaccional pondría en riesgo el p95 de la carpeta. |
| RF-07 · Premium | Volatilidad del código | Aislar | Es la parte que más cambia, porque la manda el mercado y no la norma. Encerrarla evita volver a probar el núcleo con cada cambio comercial. |

## 5. Diagrama de contexto

Sigue el modelo de *system context artifact*: el sistema en construcción al centro, las personas a un lado, los sistemas al otro, y en cada flecha los datos que viajan.

Archivo: `diagramas/contexto-sistema.html`

### 5.1 Actores

| Actor | Descripción | Tipo de interacción |
|---|---|---|
| Ciudadano | Titular de la carpeta. Se afilia a un operador, recibe documentos, los consulta, los comparte y autoriza su uso. | Envío y recepción de datos personales, documentos y autorizaciones. |
| Entidad pública | Emite documentos firmados dirigidos al ciudadano y le solicita documentación. MEN, Registraduría, embajadas, notarías. | Emisión de documentos firmados y radicación de peticiones. |
| Empresa privada | Usa la carpeta como canal para pedir y recibir documentos de sus clientes, típicamente vía servicios Premium como PQRS. | Peticiones de documentos e integración por API. |
| Operador de carpeta | Empresa que presta el servicio con infraestructura propia. Ofrece servicios básicos gratuitos y Premium tarifados. **Es nuestro sistema.** | Custodia documental, enrutamiento y entrega entre pares. |
| Centralizador MinTIC | Provee los servicios técnicos de base para la interoperabilidad: directorio de afiliación, directorio de operadores y autenticación de documentos. También opera GovCarpeta. | Comunicación por API: validación, registro y resolución de operador. |
| Administrador del operador | Usuario interno que gestiona el funcionamiento técnico del sistema. | Control interno de usuarios, bitácoras y soporte. |
| Estado (analítica) | Consume información agregada derivada de los metadatos para responder preguntas en notarías, educación y Registraduría. | Consumo de metadatos anonimizados, nunca de contenido. |

### 5.2 Flujo de información

1. **El ciudadano se registra** en el operador y entrega sus datos personales.
2. **El operador verifica la identidad** contra la Registraduría y consulta al centralizador que el ciudadano no esté afiliado a otro operador.
3. **El operador registra la afiliación** en el centralizador, genera la cuenta de correo inmutable y sube el documento de identidad firmado.
4. **Una entidad emite un documento firmado** dirigido al ciudadano desde su propio operador.
5. **El operador emisor pregunta al centralizador** ante qué operador está afiliado el destinatario.
6. **Los documentos viajan directamente** del operador emisor al operador destino, con sus metadatos y su firma. El contenido nunca pasa por el centralizador.
7. **El operador destino avisa al ciudadano** por correo y SMS, y el documento aparece en su carpeta.
8. **Cuando alguien pide documentos**, el ciudadano autoriza o rechaza uno por uno, y solo entonces el paquete sale firmado hacia el solicitante.

### 5.3 Lógica del diagrama

- El **operador es el núcleo**. Todo lo demás está afuera y se conecta por una interfaz.
- La **línea de automatización** separa a las personas del software. A su izquierda hay gente; a su derecha, sistemas.
- La **línea de integración** separa nuestro sistema de los sistemas ajenos que no controlamos.
- Cada flecha lleva **los datos que viajan**, no el verbo de la acción. Así se ve qué información cruza cada frontera.
- En <b style="color:var(--primary)">azul</b>, el flujo documental entre operadores: es el único que mueve documentos completos, y es el que hoy **no tiene contrato definido**.

**Idea central:** Todo lo que va hacia MinTIC son identificadores. Todo lo que va hacia otro operador son documentos. Esa asimetría es la decisión de arquitectura que sostiene el resto.

El centralizador responde una sola pregunta: **¿ante qué operador está afiliado esta cédula?** Con esa respuesta, nuestro operador abre una conexión directa con el operador destino y le entrega el documento. Por eso el Estado puede pedir que el centralizador maneje la mínima cantidad de transacciones: no es un bus por donde pasa el tráfico, es una guía telefónica que se consulta una vez y se cachea.

## 6. Casos de uso *(referencia interna, no se entrega)*

Archivo: `diagramas/casos-de-uso.html`

| Bloque | Caso de uso | Requerimientos que realiza |
|---|---|---|
| Lo que hace el ciudadano | Afiliarme a un operador | RF-01.1 · RF-01.5 · RF-01.6 · RNF-06 |
|  | Trasladarme a otro operador | RF-01.7 · RF-01.8 · RNF-22 |
|  | Ver y descargar mis documentos | RF-02.6 · RF-02.7 · RNF-04 |
|  | Subir un documento temporal | RF-02.2 · RF-02.9 · RNF-24 |
|  | Compartir un paquete | RF-04.1 · RF-04.2 · RNF-11 |
|  | Autorizar o rechazar una petición | RF-04.4 · RF-09.6 · RNF-14 |
| Lo que hace la entidad | Emitir un documento firmado | RF-03.7 · RF-02.4 · RNF-11 |
|  | Pedir documentos a un ciudadano | RF-04.3 · RF-07.3 · RNF-17 |
| Lo que el operador hace por debajo | Verificar identidad | RF-01.2 · RF-01.3 |
|  | Enrutar y entregar | RF-03.1 · RF-03.2 |
|  | Notificar | RF-05.1 · RF-05.2 |

Once casos de uso. Los seis del ciudadano son la interfaz visible del producto; los dos de la entidad son los que hacen que la carpeta se llene; los tres de abajo son la fontanería que el usuario nunca ve y que concentra toda la dificultad arquitectónica.

## 7. El proyecto en palabras simples

**¿Qué problema resolvemos?**

Hoy, cuando el Estado te pide un papel, tú eres el mensajero. Vas a la universidad por el diploma, lo llevas a una notaría para autenticarlo, y de ahí a la entidad que te lo pidió. Cada trámite te cuesta días y plata, y el papel puede perderse o falsificarse.

La Carpeta Ciudadana invierte eso: **los documentos van solos de una entidad a otra**, y tú solo das permiso. La frase que abre el caso lo dice completo: *«el ciudadano no debe ser el mensajero del Estado»*.

**¿Qué es exactamente una carpeta?**

Una caja fuerte digital, tuya y para toda la vida, donde se guardan los documentos que te conciernen: cédula, diplomas, escrituras, declaraciones de renta. Cada documento viene **firmado digitalmente** por la entidad que lo emitió.

La firma digital es el equivalente electrónico del sello de la notaría: una operación matemática que solo la entidad emisora puede hacer, y que cualquiera puede comprobar. Si alguien altera una coma del documento, la firma deja de cuadrar. Por eso el diploma que sale de tu carpeta vale sin necesidad de apostilla.

**¿Por qué hay varios operadores y no uno solo del Estado?**

Porque el Estado reconoció que no puede pagar ni administrar una plataforma de ese tamaño. Igual que pasó con el RUNT o la planilla de aportes, abre el juego a empresas privadas que ponen su propia infraestructura.

Un **operador** es la empresa que te guarda la carpeta. Tú eliges el tuyo, solo puedes tener uno a la vez, y puedes mudarte cuando quieras llevándote todo. Los operadores cobran por servicios adicionales, pero lo básico —tener carpeta, recibir, consultar y compartir— es gratis.

**Nosotros vamos a construir uno de esos operadores.** Ese es el alcance del proyecto.

**Si cada operador es independiente, ¿cómo se hablan entre ellos?**

Ahí entra MinTIC con el **centralizador**. Piénsalo como un directorio telefónico nacional: lo único que sabe es qué ciudadano está en qué operador. No guarda documentos.

Ejemplo real del caso. El Ministerio de Educación quiere mandarle el diploma a Andrés. El MEN trabaja con el operador GovCarpeta, pero Andrés está en Mi Carpeta. Entonces GovCarpeta le pregunta al centralizador «¿dónde está la cédula 1234?», el centralizador contesta «en Mi Carpeta», y **GovCarpeta le manda el diploma directamente a Mi Carpeta**. El documento nunca pasa por MinTIC.

Eso no es un detalle: es una exigencia explícita del caso. El centralizador debe mover la menor cantidad posible de datos y de transacciones.

**¿Cómo se protege la privacidad?**

Con una regla sencilla: **nada sale de tu carpeta sin que tú lo autorices**, documento por documento.

Cuando Andrés pide una visa, el funcionario de la embajada no entra a husmear. Registra una petición —cédula, pasaporte, carta laboral, extractos—, a Andrés le llega un SMS, él entra y decide qué manda y qué no. Si le falta un documento, sube una versión temporal sin firmar y en el mismo paso le pide el definitivo a la entidad que lo expide.

**¿Qué es lo verdaderamente difícil aquí?**

No es guardar archivos. Eso está resuelto hace veinte años. Lo difícil son cuatro cosas:

**Uno, que dos operadores se entiendan.** Si cada equipo inventa su propio formato de intercambio, la federación no existe. Hoy el centralizador solo publica una URL por operador, sin decir qué mandar a esa URL. Y de 70 operadores registrados, 54 ni siquiera publican esa URL.

**Dos, mudarse de operador sin romper nada.** Mover toda una carpeta de una empresa a otra sin que el ciudadano quede un segundo con dos operadores ni con ninguno. Eso es una transacción distribuida, y no hay forma limpia de hacerla.

**Tres, que la firma valga.** Sin una autoridad que emita y respalde los certificados, «documento firmado» es un adorno. Hoy ese servicio del centralizador ni siquiera descarga el documento que dice autenticar.

**Cuatro, ser usable.** El sistema tiene que funcionar para gente que apenas usa un celular, y al mismo tiempo pedir segundo factor para autorizar. Cada control de seguridad que añadimos le resta usabilidad, y el caso pone la usabilidad como prioridad máxima. Ese pulso no se resuelve, se administra.

**¿Y qué vamos a entregar nosotros?**

En esta entrega, cuatro piezas: los requerimientos funcionales, los no funcionales, el mapeo de esos no funcionales contra atributos de calidad con métricas, y el diagrama de contexto.

Nuestro aporte diferencial no son las tablas. Es que **probamos la API del centralizador de verdad** y encontramos que varias cosas que el caso da por hechas no existen. Eso está en la sección 7, y las preguntas que salen de ahí están en la 8.

## 8. Evidencia de la API GovCarpeta

En línea el 05-09-2026 y **verificada en vivo** con llamadas de solo lectura. Contrato Swagger 2.0, sin `securityDefinitions`.

| Método | Path | Comportamiento verificado |
|---|---|---|
| `GET` | `/apis/validateCitizen/{id}` | Confirmado en vivo: 200 = ya registrado, con string en prosa y espacio final. 204 sin cuerpo = libre. |
| `POST` | `/apis/registerCitizen` | 201 creado, 501 si ya existe, 500 error de aplicación. |
| `DELETE` | `/apis/unregisterCitizen` | Datos en el body. Documenta 201 Deleted —no 200—, 204 si no existía. |
| `PUT` | `/apis/authenticateDocument` | Recibe una URL prefirmada de S3, no el binario. El centralizador no descarga el documento que dice autenticar. |
| `POST` | `/apis/registerOperator` | El contrato se contradice: required exige nameOperator y adress, que no existen en properties (name, address). |
| `PUT` | `/apis/registerTransferEndPoint` | endPointConfirm es opcional y no se persiste. |
| `GET` | `/apis/getOperators` | Devuelve 70 operadores. Campos reales: _id, operatorName, participants, transferAPIURL. Nada más. |

**Hallazgos verificados contra el servicio real**

01. No existe ningún endpoint de documentos. Ni subir, ni transferir, ni consultar metadatos. El centralizador es puramente un directorio de identidad: todo el flujo documental del caso queda fuera de la API.
02. Sólo 16 de los 70 operadores publican transferAPIURL. Los otros 54 son inalcanzables: no hay forma de transferirles un ciudadano ni de entregarles un documento. El 77 % del directorio es inerte, el campo no es obligatorio y nadie lo verifica.
03. transferAPIURLConfirm no existe en la respuesta. No viene vacío: getOperators no proyecta el campo en absoluto y ninguno de los 70 lo trae. El protocolo de confirmación es inobservable desde fuera.
04. validateCitizen devuelve prosa, no datos. «El ciudadano con id: 1234567890 se encuentra registrado en el operador: Operador Ciudadano » — con espacio final. Hay que parsear la frase, y el nombre extraído es la única clave de join contra un directorio que no garantiza unicidad.
05. Semántica de validateCitizen: resuelta. 200 = ocupado, 204 = libre, confirmado con cinco identificaciones distintas. La ambigüedad del repositorio queda cerrada.
06. authenticateDocument recibe una URL, no el documento. El centralizador no puede firmar un contenido que nunca descarga: como mucho sella una referencia. El no repudio del caso sigue sin soporte real.
07. Cero autenticación. getOperators responde 200 sin ninguna credencial y el Swagger no declara securityDefinitions. Cualquiera en internet puede desafiliar a cualquier ciudadano con un DELETE.
08. El CORS es una allowlist que se cae, no '*'. Sin Origin → 200; localhost:3000 → 200; un origen desconocido → 500 Internal Server Error, no una denegación limpia. El middleware lanza y nadie captura.
09. El directorio no publica claves públicas. Sólo nombre, id y participantes. Sin material criptográfico no hay forma de verificar la firma de un operador par: la confianza federada no es construible con este contrato.
10. Sin idempotencia, sin paginación, sin versionado, sin rate limiting y sin webhooks. Los 70 operadores llegan en una sola respuesta de 11 KB; descubrir cambios sólo es posible por polling.
11. DELETE con body y operatorId como ObjectId de MongoDB: detalles de implementación filtrados al contrato público.
12. Punto único de fallo. Un dyno de Heroku con una Mongo Atlas. Estuvo en 503 ese mismo día antes de volver: la caída no fue hipotética.

## 9. Bloqueos y preguntas al profesor

**B-01 — ¿Existe un contrato común de transferencia entre operadores, o cada equipo define el suyo?**

- *Por qué bloquea:* Es el corazón del caso y hoy es literalmente indefinible. Dato nuevo: sólo 16 de los 70 operadores del directorio publican endpoint de transferencia — el 77 % es inalcanzable, así que la federación ya no interopera de hecho.
- *Asunción provisional:* Contrato REST propio POST /transfer/citizen y POST /documents/inbound, versionado y con OpenAPI publicado. Asumimos que sólo interoperaremos con nosotros mismos.
- *Qué cambia según la respuesta:* Contrato común → adaptadores triviales y saga estándar. Cada equipo el suyo → anti-corruption layer y N adaptadores: cambia todo el borde de integración y el modelo de despliegue.

**B-16 — ¿Publicar transferAPIURL es obligatorio para operar? 54 de 70 operadores no lo tienen.**

- *Por qué bloquea:* Define si el directorio lista operadores operativos o es sólo un registro de equipos del curso. Cambia a quién podemos entregar documentos y qué significa «operador registrado». Nadie valida el campo en el alta.
- *Asunción provisional:* Sólo los 16 operadores con endpoint son destinos válidos; el resto se trata como no afiliable y se reporta como error de entrega.
- *Qué cambia según la respuesta:* Obligatorio → validación en el alta y un estado de operador. Opcional → el descubrimiento necesita health check propio por operador antes de cada entrega, más una política de fallback.

**B-02 — ¿Qué significa endPointConfirm? ¿2PC, saga con compensación o un simple ACK?**

- *Por qué bloquea:* Determina si la transferencia es atómica o eventualmente consistente, y por tanto si puede haber doble afiliación o ciudadano sin operador. Verificado: getOperators no devuelve el campo en absoluto y ninguno de los 70 operadores lo trae.
- *Asunción provisional:* Saga en tres fases: initTransfer → destino confirma recepción íntegra → origen desafilia → destino registra. Carpeta origen en solo-lectura, compensación por timeout de 24 h.
- *Qué cambia según la respuesta:* 2PC real → coordinador, bloqueos distribuidos, peor disponibilidad. Saga → compensaciones, idempotencia y reconciliación, con estados intermedios visibles al usuario. Son dos arquitecturas distintas.

**B-03 — ¿Quién es la Autoridad Certificadora y qué formato de firma se usa?**

- *Por qué bloquea:* Todo el valor del sistema —autenticidad no discutible, sustituir apostillas— descansa en la firma. Verificado: authenticateDocument recibe una URL, no el binario, y el directorio no publica ninguna clave pública. La confianza federada no es construible con este contrato.
- *Asunción provisional:* PKI simulada: firmamos con clave propia (JWS detached sobre SHA-256) y tratamos authenticateDocument como sello de tiempo simbólico, no como firma.
- *Qué cambia según la respuesta:* MinTIC como CA raíz → servicio de firma centralizado, nuevo cuello de botella en el camino crítico. Firma por operador → modelo de confianza federado y distribución de claves públicas vía un directorio que hoy no tiene ese campo.

**B-04 — Analítica del Estado o centralizador mínimo: ¿cuál gana?**

- *Por qué bloquea:* El PDF exige que el Estado analice los metadatos y que el centralizador almacene y transfiera lo mínimo. Son objetivos mutuamente excluyentes. Es la mayor incógnita de alcance del entregable.
- *Asunción provisional:* Exportación batch nocturna de metadatos anonimizados a un data lake del Estado, fuera del camino del centralizador transaccional.
- *Qué cambia según la respuesta:* Analítica federada (el Estado consulta a cada operador) exige una API analítica en cada operador. Centralizada (los operadores empujan) añade ETL, gobierno de datos y un problema de privacidad de primer orden.

**B-05 — ¿Qué servicios son básicos gratuitos y cuáles Premium?**

- *Por qué bloquea:* Afecta el alcance, el modelo de dominio (cuotas, medición, facturación) y decide si hay que diseñar metering y tenancy Premium. El PDF sólo da el ejemplo de PQRS.
- *Asunción provisional:* Básico: registro, carpeta, recepción, descarga, envío y traslado. Premium: casos PQRS, cuotas ampliadas, API B2B y retención extendida de no certificados.
- *Qué cambia según la respuesta:* Premium real → contextos acotados de medición, tarificación y facturación, más un cuarto actor externo (pasarela de pagos) que hoy no está en el diagrama.

**B-06 — Registraduría y correo entrante: ¿integración real o mocks?**

- *Por qué bloquea:* RF-02, RF-06 y RF-07 son requisitos explícitos sin ningún medio de implementación. Cambia el esfuerzo y qué se puede demostrar.
- *Asunción provisional:* Mock de Registraduría con contrato propio y buzón SMTP real capturando nuestro dominio.
- *Qué cambia según la respuesta:* Integración real → adaptador de identidad y subsistema de correo entrante con antivirus, límites y anti-spam: dos componentes nuevos de primer nivel.

**B-07 · Resuelto — MinTIC gestiona GovCarpeta. Prevalece el README sobre el PDF.**

- *Cómo se cerró:* Confirmado: el Ministerio opera GovCarpeta además de prestar los servicios de interoperabilidad. La lectura del PDF —GovCarpeta como operador privado con convenio del MEN— queda descartada.
- *Qué cambia en el diagrama:* MinTIC pasa a tener doble rol: centralizador y operador de carpetas. GovCarpeta sale de «Otros Operadores» y se anota dentro del actor MinTIC.
- *Lo que sigue abierto:* Si el centralizador también opera carpetas hay conflicto de interés y asimetría competitiva frente a los operadores privados. Falta definir si esa rama operadora puede leer lo que pasa por el directorio.

**B-08 · Resuelto — Semántica de validateCitizen: 200 = ocupado, 204 = libre.**

- *Cómo se cerró:* Confirmado en vivo con cinco identificaciones distintas contra el servicio real. Ya no hace falta asumir nada ni arriesgarse a invertir la lógica de afiliación.
- *Residual:* Sigue devolviendo una frase en español con espacio final en lugar de datos tipados, así que el anti-corruption layer con parseo se mantiene.
- *Qué haría falta para cerrarlo del todo:* Que MinTIC devolviera JSON con operatorId. Ese día el adaptador de parseo desaparece.

**B-09 — ¿Hay autenticación entre operadores y hacia el centralizador?**

- *Por qué bloquea:* Verificado: responde 200 sin credencial alguna y el Swagger no declara securityDefinitions. El CORS no es abierto: es una allowlist que devuelve 500 ante un origen desconocido en vez de denegar limpiamente.
- *Asunción provisional:* mTLS más JWT firmado con la clave del operador para el tráfico entre pares; el tramo hacia el centralizador queda sin autenticar, como riesgo documentado.
- *Qué cambia según la respuesta:* Si MinTIC emitiera credenciales → flujo de onboarding y rotación de claves, y el directorio pasa a ser también almacén de claves públicas.

**B-10 · Resuelto con reserva — El centralizador ya responde. ¿Hay compromiso de disponibilidad para la sustentación?**

- *Cómo se cerró:* La API volvió y toda la evidencia se revalidó contra ella. Pero estuvo caída ese mismo día: un solo dyno de Heroku sin redundancia. La caída no es hipotética.
- *Asunción provisional:* Réplica local del repositorio del centralizador tras un feature flag, como contingencia para la demostración.
- *Qué cambia según la respuesta:* Sin compromiso → caché local del directorio con TTL y modo degradado offline: la unicidad de afiliación pasa de consistencia fuerte a eventual.

**B-11 — ¿«A perpetuidad» convive con el derecho de supresión de datos personales?**

- *Por qué bloquea:* Perpetuidad más almacenamiento inmutable es técnicamente incompatible con el borrado. Determina si el almacenamiento puede ser WORM o debe ser reversible.
- *Asunción provisional:* Inmutabilidad sólo de los certificados; borrado permitido de los no certificados. El retiro del operador conserva los certificados.
- *Qué cambia según la respuesta:* Borrado obligatorio → adiós object-lock: hace falta cripto-borrado destruyendo la clave del envelope, lo que cambia el diseño de KMS y de claves por documento.

**B-12 — ¿El entregable es sólo documental o incluye implementar el operador?**

- *Por qué bloquea:* El README lista cuatro artefactos documentales pero el paréntesis dice que cada equipo «implementará» una solución. Cambia por completo la profundidad exigida.
- *Asunción provisional:* Entregable documental, con las decisiones de integración ya tomadas para no rehacer el diseño después.
- *Qué cambia según la respuesta:* Si hay implementación, B-01, B-02, B-03 y B-06 pasan de observaciones a bloqueantes duros de sprint, y el contrato entre equipos hay que negociarlo la primera semana.

**B-13 — ¿El correo del ciudadano es un buzón real de internet o un identificador interno?**

- *Por qué bloquea:* Un buzón real implica MX propios, antivirus, anti-spam, cuotas y una superficie de ataque enorme. Un identificador no implica casi nada. Son varios componentes de diferencia.
- *Asunción provisional:* Buzón real restringido: sólo se aceptan correos de remitentes verificados —entidades y operadores registrados—; el resto se rechaza.
- *Qué cambia según la respuesta:* Buzón abierto → subsistema de correo completo (MTA, escaneo, cuarentena) con su propio perfil de disponibilidad y seguridad. Identificador → desaparece un componente entero.

**B-14 — Enviar documentos por email a entidades no afiliadas contradice la confidencialidad. ¿Cómo se resuelve?**

- *Por qué bloquea:* El correo es un canal no confiable; adjuntar documentos personales contradice RNF-12, que sale del propio PDF.
- *Asunción provisional:* Enlace de descarga prefirmado de vida corta (72 h) más código OTP, en lugar de adjuntar el documento.
- *Qué cambia según la respuesta:* Si deben ir adjuntos → cifrado S/MIME o contenedor cifrado con clave fuera de banda: un subsistema de distribución de claves adicional.

**B-15 — ¿Cuántos ciudadanos y documentos hay que soportar, y con qué presupuesto?**

- *Por qué bloquea:* El PDF sólo dice «un país entero». Sin cifras los RNF no son verificables y el mapeo a QoS es retórica. Además determina si la arquitectura es monolito modular o distribuida.
- *Asunción provisional:* 50 M de ciudadanos en la federación, 10 % de cuota para nosotros, 30 % de crecimiento anual, ≤ USD 0,15 por carpeta al mes. Todo marcado como asunción.
- *Qué cambia según la respuesta:* Un orden de magnitud menos → monolito modular con Postgres y object storage, mucho más barato. A la escala asumida → sharding, CQRS y mensajería asíncrona se vuelven obligatorios.

