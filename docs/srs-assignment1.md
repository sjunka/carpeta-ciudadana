# Carpeta Ciudadana

## Software Requirements Specification

|  |  |
|---|---|
| **Versión** | 1.0 |
| **Fecha** | 10 de septiembre de 2026 |
| **Autores** | Sergio Junca · Juan José Henao Aristizábal · Samuel Cadavid Zapata — Lead Software Engineers |
| **Preparado para** | Arquitecturas Avanzadas de Software |
| **Docente** | Fabián Pinzón |
| **Periodo** | 2026-2 |

Estructura basada en el *Software Requirements Specification Template* del curso, derivado de la *IEEE Guide to Software Requirements Specification* (ANSI/IEEE Std. 830-1984).

> Generado por `npm run md` desde `src/content/*.json`. **No editar a mano.**

---

## Historial de revisiones

| Fecha | Versión | Descripción | Autor | Comentarios |
|---|---|---|---|---|
| 05 sep 2026 | 0.1 | Levantamiento de requerimientos y verificación en vivo de la API GovCarpeta. | Equipo de arquitectura | Borrador de trabajo. |
| 08 sep 2026 | 0.2 | Restricciones de diseño, requerimientos inversos y análisis de granularidad. | Equipo de arquitectura | Incorpora *3.6 y *3.7 del template. |
| 10 sep 2026 | 1.0 | Reestructuración completa al formato ANSI/IEEE Std. 830-1984 y cierre de la entrega. | Equipo de arquitectura | Primera versión entregable. |

## Aprobación del documento

La siguiente Especificación de Requerimientos de Software ha sido aceptada y aprobada por:

| Firma | Nombre impreso | Cargo | Fecha |
|---|---|---|---|
|  | Sergio Junca | Lead Software Engineer |  |
|  | Juan José Henao Aristizábal | Lead Software Engineer |  |
|  | Samuel Cadavid Zapata | Lead Software Engineer |  |
|  | Fabián Pinzón | Docente, Arquitecturas Avanzadas de Software |  |

---

# 1. Introducción

## 1.1 Propósito

Este documento especifica los requerimientos del **Operador de Carpeta Ciudadana** que vamos a construir: qué debe hacer, con qué niveles de calidad y bajo qué restricciones.

Va dirigido a tres audiencias. El **equipo de arquitectura y desarrollo**, que toma de aquí el alcance y los criterios de aceptación. El **docente del curso**, que evalúa la completitud y la trazabilidad de lo especificado. Y los **terceros con los que el operador se integra** —el centralizador de MinTIC y los demás operadores—, que necesitan saber qué esperamos de sus interfaces.

El documento especifica el **qué**, no el **cómo**. Las decisiones de diseño solo aparecen cuando son restricciones impuestas desde fuera, y en ese caso viven en *3.6 con su fuente citada.

## 1.2 Alcance

El producto que este documento especifica se llama **Operador de Carpeta Ciudadana**.

**Qué hace**

- Afilia ciudadanos, entidades públicas y empresas, verificando identidad y afiliación única antes de activar la carpeta.
- Custodia a perpetuidad los documentos certificados que las entidades emiten a nombre del ciudadano, con su firma y sus metadatos intactos.
- Enruta documentos hacia otros operadores consultando al centralizador de MinTIC solo la afiliación del destinatario.
- Media el consentimiento: ningún documento sale de la carpeta sin autorización explícita del titular.
- Notifica al ciudadano por correo y SMS, y entrega metadatos anonimizados para la analítica del Estado.
- Sostiene un modelo de negocio con servicios básicos gratuitos y servicios Premium tarifados.

**Qué no hace**

- No implementa el centralizador de MinTIC. GovCarpeta es un sistema externo que consumimos y no podemos modificar.
- No emite documentos ni los firma en nombre de una entidad. La firma la pone quien emite; nosotros la conservamos y la verificamos.
- No sustituye la Registraduría ni ninguna otra fuente de identidad: la consulta.
- No implementa los sistemas internos de las entidades ni de las empresas clientes; se integra con ellos por API.
- No ofrece garantías de tiempo real. El sistema es de mensajería asíncrona con latencia baja, no un sistema de tiempo real.

**Beneficios**

- El ciudadano deja de custodiar papel: un documento emitido una vez sirve para todos los trámites que lo pidan, sin volver a pedirlo a la entidad que lo expidió.
- La entidad receptora recibe documentos ya autenticados, con firma verificable, y se ahorra la validación manual.
- El Estado gana visibilidad agregada sobre la actividad documental del país sin acceder al contenido de ningún documento.
- El operador obtiene un canal de ingresos Premium que financia la gratuidad de los servicios básicos.

**Objetivos**

- Cubrir el 100 % de las operaciones de afiliación, custodia, transferencia y autorización que el caso de estudio describe (*3.2).
- Sostener 50 millones de carpetas con disponibilidad de lectura ≥ 99,95 % mensual (RNF-01, RNF-08).
- Mantener el tráfico hacia el centralizador en ≤ 4 transacciones por ciclo de vida de afiliación y 0 bytes de contenido documental (RNF-20, RI-01).
- Permitir el traslado completo de una carpeta entre operadores en ≤ 24 horas sin pérdida de información ni de identidad digital (RNF-22).

## 1.3 Definiciones, acrónimos y abreviaturas

| Término | Definición |
|---|---|
| Carpeta Ciudadana | Repositorio digital personal donde un ciudadano custodia de forma permanente los documentos que las entidades le han emitido. |
| Operador | Empresa autorizada que presta el servicio de carpeta con infraestructura propia. Es el sistema que este documento especifica. |
| Centralizador | Servicio de MinTIC que resuelve ante qué operador está afiliado un ciudadano y publica el directorio de operadores. No custodia documentos. |
| GovCarpeta | Implementación concreta del centralizador expuesta por MinTIC, cuyo contrato está verificado en *3.1.3. |
| MinTIC | Ministerio de Tecnologías de la Información y las Comunicaciones de Colombia. Opera el centralizador y define las reglas de interoperabilidad. |
| Registraduría | Registraduría Nacional del Estado Civil. Fuente autoritativa de la identidad de un ciudadano colombiano. |
| Documento certificado | Documento emitido y firmado digitalmente por una entidad, cuya autenticidad es verificable. Se conserva a perpetuidad. |
| Documento temporal | Documento que el ciudadano sube por su cuenta, sin firma de entidad. Está sujeto a cuota y puede eliminarse. |
| Paquete | Conjunto de documentos que el ciudadano agrupa y autoriza para entregarlo a un solicitante en un solo acto. |
| Transferencia | Entrega de documentos y metadatos de un operador a otro, directa entre pares, sin que el contenido pase por el centralizador. |
| Traslado | Cambio de operador de un ciudadano, con migración de la totalidad de su carpeta y conservación de su cuenta de correo. |
| QoS | *Quality of Service*. Expresión medible de un atributo de calidad: métrica, umbral y táctica que lo sostiene. |
| RF · RNF · RD · RI | Requerimiento funcional, requerimiento no funcional, restricción de diseño y requerimiento inverso, respectivamente. |
| Twelve-Factor App | Conjunto de doce prácticas para construir aplicaciones desechables y portables entre entornos. Es fuente de varias restricciones de *3.6. |
| Cloud native | Estilo arquitectónico basado en contenedores, servicios desacoplados, infraestructura inmutable y observabilidad desde el primer despliegue. |
| Idempotencia | Propiedad por la que repetir una operación produce el mismo resultado que ejecutarla una sola vez. Sostiene los reintentos de transferencia. |
| No repudio | Garantía de que quien firmó o autorizó algo no pueda negarlo después. |

## 1.4 Referencias

[1] MinTIC, *Enunciado del Assignment 1 — Carpeta Ciudadana*. Universidad, curso Arquitecturas Avanzadas de Software, 2026. Documento del curso.

[2] *Caso de estudio — Carpeta Ciudadana*, curso Sistemas Distribuidos. Texto completo entregado con el enunciado, 2026.

[3] MinTIC, *API GovCarpeta — contrato Swagger 2.0*. Servido por el host del centralizador. Verificado en vivo el 5 de septiembre de 2026 mediante llamadas de solo lectura.

[4] A. D. McKinnon, *Software Requirements Specification Template*. Richland, WA: Washington State Univ. Tri-Cities, CptS 322, 2005. Basado en *IEEE Guide to Software Requirements Specifications*, ANSI/IEEE Std 830-1984. Material del curso.

[5] *Arquitectura de Software Moderna — Módulo I, Secciones 1.1 y 1.2*. Material del curso, 2026. Arquitectura nativa de la nube, Twelve-Factor App y drivers de granularidad de microservicios.

[6] J. Clingan y K. Finnigan, *Kubernetes Native Microservices with Quarkus and MicroProfile*, MEAP v6. Shelter Island, NY: Manning Publications, 2021.

[7] A. Wiggins. «The Twelve-Factor App.» 12factor.net. https://12factor.net (consultado el 5 de septiembre de 2026).

[8] Congreso de Colombia, *Ley 1581 de 2012*, «Por la cual se dictan disposiciones generales para la protección de datos personales», Diario Oficial No. 48.587, 17 de octubre de 2012.

## 1.5 Visión general del documento

- La ***1** delimita para qué sirve este documento, qué producto describe y con qué vocabulario.
- La ***2** da el contexto: dónde encaja el operador entre los sistemas que lo rodean, quién lo usa, qué lo condiciona y sobre qué supuestos está escrito. No enuncia requerimientos; hace que se entiendan.
- La ***3** es el cuerpo del documento y la parte verificable: interfaces externas, los 65 requerimientos funcionales agrupados en 9 dominios, el modelo conceptual de clases, los 30 requerimientos no funcionales con sus métricas de QoS, los límites que el sistema no debe cruzar, las restricciones de diseño con su fuente y los requerimientos lógicos de datos.
- La ***4** modela lo especificado en *3 desde tres ángulos distintos: la secuencia de una transferencia entre operadores, el ciclo de vida de un documento y el flujo de datos del sistema completo.
- La ***5** define cómo se cambia este documento una vez aprobado.

# 2. Descripción general

Esta sección no enuncia requerimientos: hace que se entiendan. Dónde encaja el operador entre los sistemas que lo rodean, quién lo usa, qué lo condiciona y sobre qué supuestos está escrito lo que viene después.

## 2.1 Perspectiva del producto

El operador **no es un sistema aislado**: es una pieza de una federación nacional. Cada operador custodia las carpetas de sus propios afiliados y se comunica con los demás como par. Ningún operador ve el contenido de las carpetas de otro.

El centralizador de MinTIC es la única pieza compartida, y su papel es deliberadamente estrecho: responde **ante qué operador está afiliada una cédula** y publica el directorio de operadores. Nada más. No es un bus por donde pase el tráfico; es una guía telefónica que se consulta una vez y se cachea.

De ahí sale la asimetría que sostiene toda la arquitectura: **hacia MinTIC solo viajan identificadores; hacia otro operador viajan documentos.**

![Diagrama de contexto del Operador de Carpeta Ciudadana](../../assignment1/diagramas/contexto-sistema.png)

Versión interactiva: `diagramas/contexto-sistema.html`

**Actores**

| Actor | Descripción | Tipo de interacción |
|---|---|---|
| Ciudadano | Titular de la carpeta. Se afilia a un operador, recibe documentos, los consulta, los comparte y autoriza su uso. | Envío y recepción de datos personales, documentos y autorizaciones. |
| Entidad pública | Emite documentos firmados dirigidos al ciudadano y le solicita documentación. MEN, Registraduría, embajadas, notarías. | Emisión de documentos firmados y radicación de peticiones. |
| Empresa privada | Usa la carpeta como canal para pedir y recibir documentos de sus clientes, típicamente vía servicios Premium como PQRS. | Peticiones de documentos e integración por API. |
| Operador de carpeta | Empresa que presta el servicio con infraestructura propia. Ofrece servicios básicos gratuitos y Premium tarifados. **Es nuestro sistema.** | Custodia documental, enrutamiento y entrega entre pares. |
| Centralizador MinTIC | Provee los servicios técnicos de base para la interoperabilidad: directorio de afiliación, directorio de operadores y autenticación de documentos. También opera GovCarpeta. | Comunicación por API: validación, registro y resolución de operador. |
| Administrador del operador | Usuario interno que gestiona el funcionamiento técnico del sistema. | Control interno de usuarios, bitácoras y soporte. |
| Estado (analítica) | Consume información agregada derivada de los metadatos para responder preguntas en notarías, educación y Registraduría. | Consumo de metadatos anonimizados, nunca de contenido. |

**Flujo de información**

1. **El ciudadano se registra** en el operador y entrega sus datos personales.
2. **El operador verifica la identidad** contra la Registraduría y consulta al centralizador que el ciudadano no esté afiliado a otro operador.
3. **El operador registra la afiliación** en el centralizador, genera la cuenta de correo inmutable y sube el documento de identidad firmado.
4. **Una entidad emite un documento firmado** dirigido al ciudadano desde su propio operador.
5. **El operador emisor pregunta al centralizador** ante qué operador está afiliado el destinatario.
6. **Los documentos viajan directamente** del operador emisor al operador destino, con sus metadatos y su firma. El contenido nunca pasa por el centralizador.
7. **El operador destino avisa al ciudadano** por correo y SMS, y el documento aparece en su carpeta.
8. **Cuando alguien pide documentos**, el ciudadano autoriza o rechaza uno por uno, y solo entonces el paquete sale firmado hacia el solicitante.

**Lógica del diagrama**

- El **operador es el núcleo**. Todo lo demás está afuera y se conecta por una interfaz.
- La **línea de automatización** separa a las personas del software. A su izquierda hay gente; a su derecha, sistemas.
- La **línea de integración** separa nuestro sistema de los sistemas ajenos que no controlamos.
- Cada flecha lleva **los datos que viajan**, no el verbo de la acción. Así se ve qué información cruza cada frontera.
- En **azul**, el flujo documental entre operadores: es el único que mueve documentos completos, y es el que hoy **no tiene contrato definido**.

**Idea central:** Todo lo que va hacia MinTIC son identificadores. Todo lo que va hacia otro operador son documentos. Esa asimetría es la decisión de arquitectura que sostiene el resto.

El centralizador responde una sola pregunta: **¿ante qué operador está afiliado esta cédula?** Con esa respuesta, nuestro operador abre una conexión directa con el operador destino y le entrega el documento. Por eso el Estado puede pedir que el centralizador maneje la mínima cantidad de transacciones: no es un bus por donde pasa el tráfico, es una guía telefónica que se consulta una vez y se cachea.

## 2.2 Funciones del producto

Resumen de los nueve dominios funcionales. El detalle —los 65 requerimientos con su prioridad y su criterio— está en *3.2; aquí solo se dice qué hace cada dominio y por qué existe.

| Dominio | Nombre | Qué resuelve | RF |
|---|---|---|---|
| RF-01 | Registro, afiliación y traslado | Alta el ciclo de vida de la afiliación: quién entra, quién sale y cómo se muda. | 10 |
| RF-02 | Gestión documental | El corazón del producto: qué se guarda, con qué metadatos y por cuánto tiempo. | 11 |
| RF-03 | Interoperabilidad entre operadores | Lo que convierte a un operador aislado en parte de una federación. | 8 |
| RF-04 | Compartición, solicitudes y autorizaciones | El consentimiento del ciudadano como puerta de todo movimiento de documentos. | 7 |
| RF-05 | Notificaciones | El canal por el que el ciudadano se entera de que algo pasó. | 4 |
| RF-06 | Servicios del centralizador | Lo que MinTIC presta, y el límite explícito de lo que no debe hacer. | 8 |
| RF-07 | Servicios Premium | La parte del modelo de negocio que financia lo gratuito. | 5 |
| RF-08 | Analítica para el Estado | Lo que el Estado quiere saber, sin tocar el contenido de los documentos. | 6 |
| RF-09 | Seguridad, identidad y auditoría | Lo que impide que el sistema se convierta en una fuga de datos nacional. | 6 |

## 2.3 Características de los usuarios

| Perfil | Descripción | Nivel técnico | Frecuencia de uso |
|---|---|---|---|
| Ciudadano | Titular de la carpeta. Cualquier persona con documento de identidad colombiano. | Muy heterogéneo, desde nulo hasta alto. La usabilidad para baja apropiación tecnológica es requisito de máxima prioridad (RNF-16). | Baja y episódica: varias veces al año, concentrada en trámites. |
| Funcionario de entidad pública | Emite documentos firmados y radica peticiones de documentación a nombre de su entidad. | Medio. Opera sistemas de trámite a diario. | Alta, en horario laboral. Genera los picos de carga de campaña (RNF-09). |
| Operador de empresa privada | Usa la carpeta como canal para pedir y recibir documentos de sus clientes, típicamente desde un caso PQRS. | Medio-alto. Integra por API cuando el volumen lo justifica (RF-07.4). | Continua, dependiente del volumen de su operación. |
| Administrador del operador | Usuario interno que gestiona usuarios, bitácoras, cuotas y soporte del propio operador. | Alto. Perfil técnico. | Diaria. |
| Analista del Estado | Consume información agregada y anonimizada para responder preguntas de política pública en notarías, educación y Registraduría. | Alto en analítica de datos, nulo en la operación del sistema. | Periódica: consultas y tableros, nunca acceso transaccional. |

## 2.4 Restricciones generales

Cuatro familias de restricciones acotan el diseño antes de empezar a diseñar. Se enuncian aquí en términos generales; el detalle con identificador y fuente citable está en *3.6.

| Familia | Qué acota | Detalle en |
|---|---|---|
| Impuestas por el caso | El centralizador de MinTIC es externo y no lo podemos modificar. El contenido de los documentos nunca pasa por él. Los servicios básicos del ciudadano son gratuitos. Estas no se negocian: son el enunciado. | RD-14, RI-01, RI-07 |
| Impuestas por el contrato existente | El contrato de GovCarpeta está congelado para nosotros: sin autenticación, sin idempotencia, sin paginación y con respuestas en prosa. El diseño tiene que absorber esas carencias en lugar de esperar que se corrijan. | RD-15, *3.1.3, *3.1.4 |
| Arquitectura nativa de la nube | El sistema se empaqueta en contenedores, se ejecuta como procesos sin estado, escala horizontalmente, saca la configuración del artefacto y trata los servicios de respaldo como recursos enchufables. Vienen del material del curso y de las doce prácticas de Twelve-Factor. | RD-01 a RD-10, RD-13 |
| Descomposición en servicios | Los servicios se separan por capacidad de negocio y ninguno comparte base de datos con otro. La granularidad concreta de cada dominio se justifica en *3.8 con su driver. | RD-11, RD-12 |

Además, el tratamiento de datos personales se rige por la Ley 1581 de 2012 (RNF-15), y la accesibilidad de las interfaces por WCAG 2.1 nivel AA (RNF-17). Ninguna de las dos es negociable por decisión del proyecto.

## 2.5 Suposiciones y dependencias

Todo lo que sigue es una decisión que tomamos **en ausencia de una definición externa**. Cada fila declara el supuesto bajo el que está escrito el requerimiento correspondiente y qué cambiaría si el supuesto resulta falso. Se listan aquí, y no dentro de los requerimientos, porque son riesgos del proyecto, no propiedades del producto.

- Se asume que **MinTIC define y publica el contrato común de transferencia entre operadores**. Mientras no exista, el operador implementa un contrato REST propio, versionado y con OpenAPI publicado, tras una capa anticorrupción. Hoy solo 16 de los 70 operadores del directorio publican dirección de transferencia.
- Se asume que **existe una autoridad certificadora y un formato de firma comunes** a la federación. El contrato actual del centralizador no publica material criptográfico de los operadores, de modo que la verificación de la firma de un par depende de un canal de confianza fuera del contrato.
- Se asume que **la Registraduría expone algún mecanismo de verificación de identidad** consumible por el operador. No hay contrato publicado; el diseño lo aísla tras un adaptador.
- Se asume que **el centralizador seguirá disponible** con el comportamiento verificado el 5 de septiembre de 2026. Es un punto único de fallo fuera de nuestro control: el operador opera con caché del directorio durante una caída.
- Se asume que **los umbrales numéricos de *3.4 son válidos** hasta que el cliente los confirme. El caso solo da criterios cualitativos —disponibilidad prácticamente total, latencia lo más baja posible, usabilidad como máxima prioridad—; todo número lo pusimos nosotros y está marcado.
- Se asume que **la retención perpetua prevalece sobre el derecho de supresión** para documentos certificados. Las dos obligaciones están en tensión y la conciliación es una decisión jurídica, no técnica.

| Ref. | Supuesto que tomamos | Qué cambia si el supuesto es falso |
|---|---|---|
| B-01 | Contrato REST propio POST /transfer/citizen y POST /documents/inbound, versionado y con OpenAPI publicado. Asumimos que sólo interoperaremos con nosotros mismos. | Contrato común → adaptadores triviales y saga estándar. Cada equipo el suyo → anti-corruption layer y N adaptadores: cambia todo el borde de integración y el modelo de despliegue. |
| B-16 | Sólo los 16 operadores con endpoint son destinos válidos; el resto se trata como no afiliable y se reporta como error de entrega. | Obligatorio → validación en el alta y un estado de operador. Opcional → el descubrimiento necesita health check propio por operador antes de cada entrega, más una política de fallback. |
| B-02 | Saga en tres fases: initTransfer → destino confirma recepción íntegra → origen desafilia → destino registra. Carpeta origen en solo-lectura, compensación por timeout de 24 h. | 2PC real → coordinador, bloqueos distribuidos, peor disponibilidad. Saga → compensaciones, idempotencia y reconciliación, con estados intermedios visibles al usuario. Son dos arquitecturas distintas. |
| B-03 | PKI simulada: firmamos con clave propia (JWS detached sobre SHA-256) y tratamos authenticateDocument como sello de tiempo simbólico, no como firma. | MinTIC como CA raíz → servicio de firma centralizado, nuevo cuello de botella en el camino crítico. Firma por operador → modelo de confianza federado y distribución de claves públicas vía un directorio que hoy no tiene ese campo. |
| B-04 | Exportación batch nocturna de metadatos anonimizados a un data lake del Estado, fuera del camino del centralizador transaccional. | Analítica federada (el Estado consulta a cada operador) exige una API analítica en cada operador. Centralizada (los operadores empujan) añade ETL, gobierno de datos y un problema de privacidad de primer orden. |
| B-05 | Básico: registro, carpeta, recepción, descarga, envío y traslado. Premium: casos PQRS, cuotas ampliadas, API B2B y retención extendida de no certificados. | Premium real → contextos acotados de medición, tarificación y facturación, más un cuarto actor externo (pasarela de pagos) que hoy no está en el diagrama. |
| B-06 | Mock de Registraduría con contrato propio y buzón SMTP real capturando nuestro dominio. | Integración real → adaptador de identidad y subsistema de correo entrante con antivirus, límites y anti-spam: dos componentes nuevos de primer nivel. |
| B-09 | mTLS más JWT firmado con la clave del operador para el tráfico entre pares; el tramo hacia el centralizador queda sin autenticar, como riesgo documentado. | Si MinTIC emitiera credenciales → flujo de onboarding y rotación de claves, y el directorio pasa a ser también almacén de claves públicas. |
| B-11 | Inmutabilidad sólo de los certificados; borrado permitido de los no certificados. El retiro del operador conserva los certificados. | Borrado obligatorio → adiós object-lock: hace falta cripto-borrado destruyendo la clave del envelope, lo que cambia el diseño de KMS y de claves por documento. |
| B-12 | Entregable documental, con las decisiones de integración ya tomadas para no rehacer el diseño después. | Si hay implementación, B-01, B-02, B-03 y B-06 pasan de observaciones a bloqueantes duros de sprint, y el contrato entre equipos hay que negociarlo la primera semana. |
| B-13 | Buzón real restringido: sólo se aceptan correos de remitentes verificados —entidades y operadores registrados—; el resto se rechaza. | Buzón abierto → subsistema de correo completo (MTA, escaneo, cuarentena) con su propio perfil de disponibilidad y seguridad. Identificador → desaparece un componente entero. |
| B-14 | Enlace de descarga prefirmado de vida corta (72 h) más código OTP, en lugar de adjuntar el documento. | Si deben ir adjuntos → cifrado S/MIME o contenedor cifrado con clave fuera de banda: un subsistema de distribución de claves adicional. |
| B-15 | 50 M de ciudadanos en la federación, 10 % de cuota para nosotros, 30 % de crecimiento anual, ≤ USD 0,15 por carpeta al mes. Todo marcado como asunción. | Un orden de magnitud menos → monolito modular con Postgres y object storage, mucho más barato. A la escala asumida → sharding, CQRS y mensajería asíncrona se vuelven obligatorios. |

**Dependencias externas**

- **Centralizador GovCarpeta.** Sin él no hay resolución de destinatario ni garantía de afiliación única. Su contrato está congelado para nosotros (RD-15).
- **Registraduría Nacional.** Sin verificación de identidad no se activa ninguna carpeta (RF-01.2).
- **Operadores pares.** La utilidad del sistema crece con cuántos sean alcanzables; hoy el 77 % del directorio no lo es.
- **Proveedores de correo y SMS.** Son el único canal que alcanza a la población con acceso limitado a internet (RNF-18).

# 3. Requerimientos específicos

El cuerpo del documento y la parte verificable. Cada requerimiento es identificable, trazable y tiene un criterio con el que se puede escribir su prueba. Este no es el documento de diseño: donde hay una decisión técnica es porque viene impuesta desde fuera, y entonces lleva su fuente citada.

## 3.1 Requerimientos de interfaces externas

### 3.1.1 Interfaces de usuario

El sistema expone tres interfaces de usuario y un canal de notificación. Todas cumplen WCAG 2.1 nivel AA (RNF-17) y funcionan en dispositivos de gama baja.

| Interfaz | Descripción | Requerimientos |
|---|---|---|
| Portal del ciudadano | Web responsive. Consulta, búsqueda y filtrado de documentos, armado de paquetes, autorización de peticiones y solicitud de traslado. | RF-02.6, RF-02.7, RF-04.1, RF-04.4, RF-01.7 |
| Consola de entidad y empresa | Web. Emisión de documentos firmados, radicación de peticiones y seguimiento de su estado. | RF-03.7, RF-04.3, RF-04.6 |
| Consola de administración | Web de uso interno. Gestión de usuarios, cuotas, bitácoras y soporte. | RF-09.2, RF-09.4, RF-02.11 |
| Canal de notificación | Correo electrónico y SMS. Es el único canal que alcanza a ciudadanos con acceso limitado a internet; no requiere que el usuario entre al portal. | RF-05.1, RF-05.2, RNF-18 |

**Reglas que toda interfaz cumple**

- Ninguna operación crítica del ciudadano debe requerir más de cinco pasos (RNF-16).
- El estado de un documento nunca se comunica solo con color ni solo con un icono (RNF-17).
- La autorización de una compartición exige segundo factor (RNF-11) y presenta los documentos uno por uno, nunca en bloque (RF-04.4).

### 3.1.2 Interfaces de hardware

No aplica. El sistema no interactúa con dispositivos de hardware específicos: se ejecuta sobre infraestructura de nube estándar (RD-06) y se consume desde navegadores web. Los dispositivos del usuario final son navegadores de gama baja, no periféricos con protocolo propio. Esta ausencia se declara de forma explícita para que no se lea como una omisión.

### 3.1.3 Interfaces de software

El operador depende de cuatro sistemas externos. El más determinante es el centralizador GovCarpeta, cuyo contrato está **congelado** para nosotros (RD-15) y fue verificado en vivo el 5 de septiembre de 2026 con llamadas de solo lectura.

| Sistema externo | Para qué se usa | Contrato |
|---|---|---|
| Centralizador GovCarpeta (MinTIC) | Directorio de afiliación ciudadano–operador, directorio de operadores y autenticación de documentos. | REST sobre HTTP, contrato Swagger 2.0. Siete operaciones, detalladas abajo. |
| Registraduría Nacional | Verificación de identidad del ciudadano antes de activar la carpeta (RF-01.2). | No publicado. Se asume un adaptador propio contra el mecanismo que la Registraduría exponga. |
| Otros operadores de carpeta | Transferencia de documentos y traslado de carpetas entre pares (RF-03.2, RF-01.8). | Debe ser un contrato común definido por MinTIC (RF-03.8). Hoy no existe; ver *2.5. |
| Proveedores de correo y SMS | Notificación al ciudadano y entrega alterna de documentos (RF-05.1, RF-05.2, RF-03.4). | Servicios de respaldo enchufables, intercambiables sin cambio de código (RD-05). |

**Operaciones del centralizador, verificadas en vivo**

| Método | Path | Comportamiento verificado |
|---|---|---|
| `GET` | `/apis/validateCitizen/{id}` | Confirmado en vivo: 200 = ya registrado, con string en prosa y espacio final. 204 sin cuerpo = libre. |
| `POST` | `/apis/registerCitizen` | 201 creado, 501 si ya existe, 500 error de aplicación. |
| `DELETE` | `/apis/unregisterCitizen` | Datos en el body. Documenta 201 Deleted —no 200—, 204 si no existía. |
| `PUT` | `/apis/authenticateDocument` | Recibe una URL prefirmada de S3, no el binario. El centralizador no descarga el documento que dice autenticar. |
| `POST` | `/apis/registerOperator` | El contrato se contradice: required exige nameOperator y adress, que no existen en properties (name, address). |
| `PUT` | `/apis/registerTransferEndPoint` | endPointConfirm es opcional y no se persiste. |
| `GET` | `/apis/getOperators` | Devuelve 70 operadores. Campos reales: _id, operatorName, participants, transferAPIURL. Nada más. |

### 3.1.4 Interfaces de comunicaciones

Todo canal del sistema es HTTP sobre TLS 1.3 (RNF-10). Las llamadas entre operadores y con el centralizador se autentican mutuamente (RF-09.3). Sobre el contrato del centralizador tal como está hoy pesan cuatro condiciones que el diseño debe absorber.

- El contrato es **Swagger 2.0** y no declara `securityDefinitions`: el centralizador no exige credencial alguna. El operador debe asumir que cualquier respuesta suya es no autenticada y tratarla como tal.
- El **CORS es una allowlist que falla en abierto hacia el error**: un origen desconocido devuelve 500, no una denegación limpia. El cliente debe distinguir «rechazado» de «caído» por otros medios.
- No hay **idempotencia, paginación, versionado, control de tasa ni webhooks**. Descubrir cambios en el directorio solo es posible por sondeo periódico, y la idempotencia de los reintentos la debe garantizar el operador (RF-03.5).
- El directorio **no publica material criptográfico** de los operadores. Verificar la firma de un par exige un canal de confianza que hoy el contrato no ofrece.

## 3.2 Requerimientos funcionales

Los 65 requerimientos se agrupan en nueve dominios. Cada dominio lleva el desglose que pide el template: introducción, entradas, procesamiento, salidas y manejo de errores. Los cinco sub-bloques que pide el template —introducción, entradas, procesamiento, salidas y manejo de errores— se escriben una vez por dominio, y la tabla lista los requerimientos de ese dominio con su prioridad.

### 3.2.1 RF-01 · Registro, afiliación y traslado

#### 3.2.1.1 Introducción

Este dominio cubre el ciclo de vida de la afiliación: el alta de un ciudadano o de una entidad en nuestro operador, la verificación de que tiene derecho a estar aquí y no en otro sitio, y su salida, ya sea por traslado a otro operador o por cancelación. Es la puerta del sistema: sin afiliación válida no existe carpeta, y una afiliación mal resuelta contamina todo lo demás.

#### 3.2.1.2 Entradas

- Documento de identidad, nombres, correo de contacto y teléfono móvil del ciudadano (RF-01.1).
- Datos de constitución y representación de una entidad o empresa (RF-01.9).
- Respuesta de la Registraduría a la verificación de identidad (RF-01.2).
- Respuesta del centralizador sobre afiliación previa del ciudadano (RF-01.3).
- Solicitud de traslado con el operador destino elegido por el ciudadano (RF-01.7).

#### 3.2.1.3 Procesamiento

- El operador valida el formato y la completitud de los datos capturados.
- El operador verifica la identidad contra la Registraduría; si no la confirma, el registro no avanza.
- El operador consulta al centralizador que el ciudadano no esté afiliado en otro lado, y solo entonces registra la afiliación a su nombre.
- El operador deriva una cuenta de correo institucional única, la marca como inmutable de por vida y la asocia a la carpeta.
- El operador sube a la carpeta recién creada el documento de identidad firmado por la Registraduría.
- En un traslado, el operador origen transfiere la totalidad de documentos y metadatos al destino, verifica la integridad de lo recibido y solo entonces desafilia al ciudadano del centralizador.

#### 3.2.1.4 Salidas

- Carpeta activa con cuenta de correo institucional asignada y documento de identidad cargado.
- Registro de afiliación creado en el centralizador.
- Notificación de bienvenida al ciudadano por correo y SMS.
- En un traslado: carpeta íntegra en el operador destino y afiliación reasignada en el centralizador.

#### 3.2.1.5 Manejo de errores

- **Identidad no verificable.** El registro queda en estado pendiente y no se activa la carpeta; el sistema no crea afiliación en el centralizador.
- **Ciudadano ya afiliado a otro operador.** El registro se rechaza y se le ofrece la ruta de traslado (RF-01.7). Nunca se crea una segunda afiliación (RI-03).
- **Centralizador no disponible.** La solicitud se encola y se reintenta con retroceso exponencial; el ciudadano recibe estado «en trámite», no un error terminal.
- **Traslado interrumpido.** Si la verificación de integridad en destino falla, el operador origen no desafilia: la carpeta sigue siendo suya y el traslado se reintenta. Un traslado a medias es peor que uno no empezado.

#### 3.2.1.6 Requerimientos del dominio

| ID | Requerimiento | Descripción | Prioridad |
|---|---|---|---|
| RF-01.1 | Registro de ciudadano | El operador debe permitir la inscripción de un ciudadano capturando documento, nombres, correo de contacto y teléfono móvil. | Alta |
| RF-01.3 | Validación de afiliación única | El operador debe consultar al centralizador que el ciudadano no esté afiliado a otro operador antes de completar el registro. | Alta |
| RF-01.2 | Verificación de identidad | El operador debe validar la identidad del ciudadano contra la Registraduría Nacional antes de activar la carpeta. **[ASUNCIÓN]** *No existe API de Registraduría; se asume un adaptador propio.* | Alta |
| RF-01.4 | Notificación de afiliación | El operador debe informar al centralizador que el ciudadano es ahora cliente suyo. | Alta |
| RF-01.8 | Ejecución del traslado | El operador origen debe transferir la totalidad de documentos y metadatos al destino y desafiliar al ciudadano solo tras confirmación. **[SUPUESTO]** *B-01 · El protocolo de transferencia no está especificado por MinTIC.* | Alta |
| RF-01.7 | Solicitud de traslado | El ciudadano debe poder solicitar el traslado de su carpeta hacia otro operador autorizado. | Alta |
| RF-01.5 | Asignación de cuenta de correo | El sistema debe generar una cuenta de correo institucional única e inmutable de por vida, que sobrevive al traslado de operador. **[ASUNCIÓN]** *El caso fija el ejemplo pero no la regla de derivación ni el manejo de colisiones.* | Alta |
| RF-01.6 | Carga del documento de identidad | El operador debe subir a la carpeta el documento de identidad firmado por la Registraduría al completar el registro. | Alta |
| RF-01.9 | Registro de entidades y empresas | El operador debe permitir el registro de entidades y empresas, dotándolas de una carpeta institucional con las mismas capacidades. | Alta |
| RF-01.10 | Cancelación de afiliación | El operador debe permitir dar de baja a un ciudadano o entidad, notificando al centralizador y preservando la custodia de los certificados. | Media |

### 3.2.2 RF-02 · Gestión documental

#### 3.2.2.1 Introducción

Es el corazón del producto: qué se guarda, con qué metadatos, por cuánto tiempo y bajo qué evidencia. Distingue dos naturalezas de documento con reglas opuestas —el certificado, que se conserva a perpetuidad y no se puede alterar, y el temporal, que el ciudadano sube y puede borrar— y sostiene la bitácora que hace auditable todo lo que le pasa a un documento.

#### 3.2.2.2 Entradas

- Documento firmado por una entidad emisora, con sus metadatos (RF-02.4).
- Documento no certificado cargado por el ciudadano, sujeto a cuota (RF-02.2).
- Documento que llega a la cuenta de correo institucional del ciudadano (RF-02.8).
- Criterios de búsqueda y filtro: tipo, entidad emisora, fecha y estado de certificación (RF-02.6).

#### 3.2.2.3 Procesamiento

- El sistema valida la firma digital del documento entrante y rechaza el que no la tenga íntegra.
- El sistema extrae y persiste los metadatos que clasifican el documento, identifican a su emisor y fijan su vigencia.
- El sistema calcula y almacena el hash del contenido para poder verificar su integridad en cualquier momento posterior.
- El sistema replica el contenido en al menos tres zonas independientes (RNF-02) y verifica periódicamente que las réplicas siguen coincidiendo con el hash.
- El sistema contabiliza el consumo de cuota del ciudadano cuando el documento es temporal, y bloquea la carga al alcanzar el límite.
- El sistema anota en la bitácora inalterable toda operación sobre el documento: cargue, consulta, descarga, compartición y eliminación.

#### 3.2.2.4 Salidas

- Documento almacenado, indexado y visible en la carpeta del titular.
- Resultado de verificación de autenticidad: firma válida o inválida, con su sello de tiempo.
- Listado paginado y filtrado de documentos del ciudadano.
- Copia descargable o imprimible que conserva la evidencia de firma.
- Entradas de bitácora, en modo solo-anexar.

#### 3.2.2.5 Manejo de errores

- **Firma inválida o ausente en un documento que se declara certificado.** El documento se rechaza y no ingresa a la carpeta; se notifica al emisor, no al ciudadano.
- **Cuota de documentos temporales agotada.** Se avisa al 80 % y se bloquea la carga al 100 %. La cuota nunca aplica a documentos certificados (RI-05).
- **Divergencia entre réplicas.** El sistema restaura desde la réplica cuyo hash coincide con el registrado y levanta una alerta de durabilidad.
- **Intento de eliminar un documento certificado.** La operación se rechaza: los certificados solo se retiran por política de retención, nunca por decisión del titular (RF-02.10).

#### 3.2.2.6 Requerimientos del dominio

| ID | Requerimiento | Descripción | Prioridad |
|---|---|---|---|
| RF-02.1 | Almacenamiento a perpetuidad | El sistema debe conservar de forma indefinida todos los documentos certificados, sin límite de tamaño ni de cantidad. | Alta |
| RF-02.4 | Conservación de la firma | Los documentos emitidos por entidades deben conservarse con su firma digital intacta, de modo que su autenticidad no pueda discutirse. | Alta |
| RF-02.5 | Verificación de autenticidad | El sistema debe permitir validar en cualquier momento la firma y la integridad de un documento certificado. **[SUPUESTO]** *B-03 · No hay PKI ni autoridad certificadora definida.* | Alta |
| RF-02.3 | Registro de metadatos | Todo documento debe almacenarse con los metadatos que permiten clasificarlo, identificarlo, decir qué entidad lo avala y qué fechas tiene. **[SUPUESTO]** *B-01 · No hay esquema de metadatos común definido por MinTIC.* | Alta |
| RF-02.11 | Bitácora del documento | El sistema debe registrar en una bitácora inalterable toda operación sobre cada documento: cargue, consulta, descarga, compartición y transferencia. | Alta |
| RF-02.6 | Consulta y navegación | El ciudadano debe poder listar, buscar y filtrar sus documentos por tipo, entidad emisora, fecha y estado de certificación. | Alta |
| RF-02.8 | Recepción por correo | Todo documento enviado a la cuenta institucional del ciudadano debe ingresar automáticamente a su carpeta. **[SUPUESTO]** *B-13 · Falta definir si es un buzón real de internet o un identificador.* | Alta |
| RF-02.7 | Descarga e impresión | El ciudadano debe poder descargar e imprimir cualquier documento conservando la evidencia de firma. | Alta |
| RF-02.2 | Carga de documentos temporales | El ciudadano debe poder subir documentos no certificados, sujetos a una cuota por usuario. **[ASUNCIÓN]** *El caso dice «limitada», sin cifra.* | Alta |
| RF-02.9 | Sustitución de temporal | El sistema debe permitir relacionar la versión firmada con el temporal que sustituye, conservando la trazabilidad de ambos. | Media |
| RF-02.10 | Eliminación controlada | El ciudadano debe poder eliminar documentos no certificados; los certificados solo se retiran según la política de retención. **[SUPUESTO]** *B-11 · Perpetuidad y derecho de supresión no están conciliados.* | Media |

### 3.2.3 RF-03 · Interoperabilidad entre operadores

#### 3.2.3.1 Introducción

Es lo que convierte a un operador aislado en parte de una federación. Cubre cómo se localiza al operador de un destinatario, cómo viaja un documento de un operador a otro sin pasar por el centro, y cómo se garantiza que ese viaje termine exactamente una vez. Es el dominio con más dependencia externa y el que más riesgo concentra.

#### 3.2.3.2 Entradas

- Documento firmado con destinatario identificado por su número de documento (RF-03.7).
- Respuesta del centralizador con el operador destino y su dirección de transferencia (RF-03.1).
- Documento entrante enviado por otro operador (RF-03.3).
- Acuse de recibo del operador destino (RF-03.5).

#### 3.2.3.3 Procesamiento

- El operador consulta al centralizador ante qué operador está afiliado el destinatario y cachea la respuesta con tiempo de vida acotado (RNF-21).
- El operador abre una conexión directa con el operador destino, autenticada mutuamente, y le entrega el documento con sus metadatos y su firma. El contenido nunca pasa por el centralizador (RI-01).
- El operador marca cada transferencia con una clave de idempotencia, de modo que un reintento no duplique la entrega.
- Al recibir un documento de otro operador, el operador valida la firma y la conformidad de los metadatos antes de aceptarlo.
- Si el destinatario no está afiliado a ningún operador, el operador entrega el documento firmado por correo electrónico (RF-03.4).

#### 3.2.3.4 Salidas

- Documento entregado en la carpeta del destinatario, en su operador.
- Acuse de recibo hacia el operador emisor.
- Documento entregado por correo, cuando la ruta alterna aplica.
- Traza distribuida de la transferencia, con latencia y resultado (RNF-25).

#### 3.2.3.5 Manejo de errores

- **El destinatario no está en el directorio.** Se activa la entrega alterna por correo (RF-03.4) y se registra el caso.
- **El operador destino no publica dirección de transferencia.** La entrega no es posible por el canal federado; el documento queda en cola y se escala. Hoy afecta a 54 de los 70 operadores del directorio (ver *2.5).
- **El operador destino no responde o responde con error.** Reintento con retroceso exponencial; tras agotar los reintentos, el mensaje pasa a la cola de mensajes fallidos y se alerta. Nunca se descarta (RNF-07).
- **Acuse duplicado o entrega repetida.** La clave de idempotencia hace que la segunda entrega sea un no-op verificable, no un documento duplicado.
- **Firma inválida en un documento entrante.** Se rechaza con motivo explícito hacia el operador emisor y se registra en auditoría.

#### 3.2.3.6 Requerimientos del dominio

| ID | Requerimiento | Descripción | Prioridad |
|---|---|---|---|
| RF-03.1 | Localización del operador destino | El operador debe consultar al centralizador ante qué operador está afiliado el destinatario antes de enviarle documentos. | Alta |
| RF-03.2 | Transferencia directa | El operador debe transferir los documentos y sus metadatos directamente al operador destino, sin que el contenido pase por el centralizador. | Alta |
| RF-03.3 | Recepción de documentos externos | El operador debe exponer una interfaz para que otros operadores le entreguen documentos, validando firma y metadatos antes de aceptarlos. **[SUPUESTO]** *B-01 · No existe contrato MinTIC para esta interfaz.* | Alta |
| RF-03.5 | Confirmación y reintento | Toda transferencia debe generar acuse de recibo, reintentarse ante fallas y ser idempotente. | Alta |
| RF-03.8 | Contrato común de intercambio | El operador debe implementar el contrato de servicios definido por MinTIC, idéntico para todos, para garantizar la interoperabilidad. **[SUPUESTO]** *B-01 · Hoy solo 16 de 70 operadores publican endpoint de transferencia.* | Alta |
| RF-03.7 | Emisión por parte de la entidad | Una entidad afiliada debe poder cargar documentos firmados dirigidos a un ciudadano, disparando la resolución de operador y la entrega. | Alta |
| RF-03.6 | Solicitud de documentos a entidades | El ciudadano debe poder radicar solicitudes de expedición ante entidades y consultar el estado de cada una. | Alta |
| RF-03.4 | Entrega alterna por correo | El operador debe entregar los documentos por correo electrónico, firmados, cuando el destinatario no esté afiliado a ningún operador. **[SUPUESTO]** *B-14 · El correo plano contradice el requisito de confidencialidad.* | Alta |

### 3.2.4 RF-04 · Compartición, solicitudes y autorizaciones

#### 3.2.4.1 Introducción

Aquí vive el consentimiento del ciudadano, que es la puerta de todo movimiento de documentos hacia afuera. Cubre el armado de paquetes, la petición que una entidad radica sobre un ciudadano, la autorización documento por documento y su revocación. Ningún otro dominio puede saltarse este.

#### 3.2.4.2 Entradas

- Selección de documentos que el ciudadano agrupa en un paquete (RF-04.1).
- Petición de una entidad indicando qué documentos necesita y de quién (RF-04.3).
- Decisión del ciudadano —aprobar o rechazar— sobre cada documento pedido (RF-04.4).
- Orden de revocación de una autorización vigente (RF-04.5).

#### 3.2.4.3 Procesamiento

- El sistema notifica al ciudadano la petición recibida por correo y SMS, porque es un evento que exige acción suya (RF-05.2).
- El sistema presenta los documentos pedidos uno por uno y captura la decisión individual del titular, con segundo factor de autenticación.
- El sistema registra la evidencia del consentimiento —qué, a quién, cuándo y con qué vigencia— de forma inalterable (RF-09.6).
- El sistema arma el paquete solo con los documentos aprobados y lo firma antes de entregarlo.
- El sistema entrega el paquete a la carpeta institucional del solicitante si está afiliado, o por correo si no lo está.
- Si al ciudadano le falta un documento, el sistema le permite cargar una versión temporal y radicar en el mismo flujo la solicitud de expedición ante la entidad competente (RF-04.7).

#### 3.2.4.4 Salidas

- Paquete firmado y entregado al solicitante.
- Registro de consentimiento con su vigencia.
- Estado de la petición visible para ambas partes: pendiente, autorizada, rechazada o vencida.
- Solicitud de expedición radicada ante la entidad, cuando aplica.

#### 3.2.4.5 Manejo de errores

- **El ciudadano rechaza un documento del paquete.** El paquete se entrega incompleto con la lista explícita de lo no autorizado. Nunca se entrega lo rechazado (RI-08).
- **La autorización vence antes de la entrega.** La entrega se detiene y se exige nueva autorización.
- **Autorización revocada tras la entrega.** La revocación no puede deshacer lo entregado; queda registrada y se notifica al solicitante. El sistema no promete lo que no puede cumplir.
- **Segundo factor no superado.** La autorización no se captura y el intento queda en auditoría.

#### 3.2.4.6 Requerimientos del dominio

| ID | Requerimiento | Descripción | Prioridad |
|---|---|---|---|
| RF-04.4 | Autorización explícita | Ningún documento puede compartirse sin autorización expresa del titular; el sistema debe capturar la decisión de aprobar, aprobar en parte o rechazar. | Alta |
| RF-04.2 | Envío de paquetes | El paquete debe entregarse a la carpeta institucional del destinatario si está afiliado, o por correo si no lo está. En ambos casos va firmado. | Alta |
| RF-04.1 | Armado de paquetes | El ciudadano debe poder seleccionar varios documentos y agruparlos en un paquete para enviarlo a una entidad o empresa. | Alta |
| RF-04.3 | Petición de documentos | Una entidad debe poder registrar, desde su propio operador, una petición dirigida a un ciudadano indicando qué documentos requiere y con qué finalidad. | Alta |
| RF-04.5 | Vigencia y revocación | Las autorizaciones deben poder tener vigencia limitada y ser revocables por el ciudadano en cualquier momento. **[ASUNCIÓN]** *El caso no menciona vigencia; la añadimos por el requisito de confidencialidad.* | Media |
| RF-04.7 | Compleción con faltantes | El ciudadano debe poder cargar una versión temporal del documento que le falta y radicar en el mismo flujo la solicitud del definitivo. | Alta |
| RF-04.6 | Seguimiento de solicitudes | El sistema debe permitir a solicitante y ciudadano consultar el estado de cada petición: pendiente, autorizada, rechazada o entregada. | Media |

### 3.2.5 RF-05 · Notificaciones

#### 3.2.5.1 Introducción

Es el canal por el que el ciudadano se entera de que algo pasó. Existe porque buena parte de la población objetivo no entra al portal por iniciativa propia: si el sistema no la busca, el documento se queda sin leer y el trámite se cae. Correo y SMS no son un adorno, son el requisito de alcance (RNF-18).

#### 3.2.5.2 Entradas

- Evento de documento nuevo recibido en la carpeta.
- Evento de petición que requiere autorización del titular.
- Preferencias de canal configuradas por el ciudadano (RF-05.4).

#### 3.2.5.3 Procesamiento

- El sistema traduce el evento de negocio a un mensaje por cada canal habilitado, respetando las preferencias del ciudadano.
- El sistema encola el envío y lo reintenta ante fallo del proveedor, sin bloquear la operación que lo originó.
- El sistema clasifica el evento por criticidad: los que exigen acción del titular van también por SMS (RF-05.2).
- El sistema acumula el historial de notificaciones y marca las que siguen pendientes de atención.

#### 3.2.5.4 Salidas

- Correo electrónico entregado al ciudadano.
- SMS entregado en eventos críticos.
- Entrada en el centro de notificaciones, con su estado.
- Métrica de latencia entre la recepción del documento y el aviso (RNF-05).

#### 3.2.5.5 Manejo de errores

- **Proveedor de correo o SMS caído.** El mensaje permanece encolado y se reintenta; el documento ya está en la carpeta, de modo que el fallo de aviso no es pérdida de información.
- **Dirección o número inválido.** Se marca el canal como no entregable, se avisa por el canal restante y se pide al ciudadano actualizar sus datos.
- **Todos los canales fallan.** La notificación queda visible en el centro de notificaciones y se levanta alerta operativa.

#### 3.2.5.6 Requerimientos del dominio

| ID | Requerimiento | Descripción | Prioridad |
|---|---|---|---|
| RF-05.1 | Aviso por correo | El sistema debe notificar por correo al ciudadano cuando lleguen documentos nuevos a su carpeta. | Alta |
| RF-05.2 | Aviso por SMS | El sistema debe notificar por SMS los eventos críticos, en particular las peticiones que requieren autorización. | Alta |
| RF-05.3 | Centro de notificaciones | El sistema debe presentar el historial de notificaciones y las alertas pendientes de atención. | Media |
| RF-05.4 | Preferencias de canal | El ciudadano debe poder configurar por qué canales desea ser notificado. | Baja |

### 3.2.6 RF-06 · Servicios del centralizador

#### 3.2.6.1 Introducción

Este dominio describe lo que el centralizador de MinTIC presta y, con la misma importancia, el límite explícito de lo que no debe hacer. No lo construimos nosotros: lo consumimos. Está en el documento porque nuestros requerimientos dependen de él y porque el límite —no custodiar documentos— es la decisión que hace viable toda la federación.

#### 3.2.6.2 Entradas

- Identificador del ciudadano cuya afiliación se consulta o registra.
- Datos de alta, suspensión o baja de un operador.
- Referencia de un documento cuya autenticidad se quiere registrar o verificar.

#### 3.2.6.3 Procesamiento

- El centralizador mantiene la asociación entre el identificador del ciudadano y su operador, y nada más que eso.
- El centralizador rechaza un registro cuando ya existe afiliación vigente para ese identificador, garantizando unicidad.
- El centralizador elimina la afiliación cuando se le solicita, habilitando el traslado.
- El centralizador publica el listado de operadores autorizados con la dirección de sus servicios de interoperabilidad.
- El centralizador registra y verifica la autenticidad de documentos, sin almacenar su contenido.

#### 3.2.6.4 Salidas

- Operador al que pertenece un ciudadano, o la indicación de que está libre.
- Directorio de operadores autorizados con sus direcciones de transferencia.
- Confirmación de registro o desregistro de afiliación.
- Resultado de autenticación de un documento.

#### 3.2.6.5 Manejo de errores

- **Afiliación ya existente.** El registro se rechaza; es el comportamiento correcto y sostiene RI-03.
- **Centralizador no disponible.** El operador opera con la caché del directorio mientras dure la caída y encola lo que exija escritura. Es un punto único de fallo fuera de nuestro control (*2.5).
- **Respuesta en prosa en lugar de datos estructurados.** El operador debe parsear la frase de respuesta; cualquier cambio de redacción del centralizador rompe la integración, y el diseño debe aislarlo tras un adaptador.

#### 3.2.6.6 Requerimientos del dominio

| ID | Requerimiento | Descripción | Prioridad |
|---|---|---|---|
| RF-06.1 | Directorio ciudadano–operador | El centralizador debe mantener la asociación entre el identificador del ciudadano y su operador, y nada más que eso. | Alta |
| RF-06.4 | Consulta de afiliación | El centralizador debe devolver el operador al que pertenece un ciudadano, para habilitar el enrutamiento. | Alta |
| RF-06.2 | Registro de ciudadano | El centralizador debe exponer una operación para registrar a un ciudadano, rechazándola si ya existe afiliación vigente con otro operador. | Alta |
| RF-06.3 | Desregistro de ciudadano | El centralizador debe exponer una operación para eliminar la afiliación y habilitar el traslado. | Alta |
| RF-06.8 | No custodia de documentos | El centralizador no debe almacenar documentos ni metadatos de negocio; su información se limita al enrutamiento y la validación. | Alta |
| RF-06.5 | Directorio de operadores | El centralizador debe publicar el listado de operadores autorizados con las direcciones de sus servicios de interoperabilidad. **[SUPUESTO]** *B-16 · 54 de 70 operadores no publican endpoint y nadie lo valida.* | Alta |
| RF-06.6 | Autenticación de documentos | El centralizador debe ofrecer un servicio para registrar y verificar la autenticidad de un documento. **[SUPUESTO]** *B-03 · Hoy recibe una URL y nunca descarga el documento.* | Alta |
| RF-06.7 | Control de operadores | El centralizador debe permitir dar de alta, suspender y dar de baja operadores, verificando las condiciones técnicas exigidas. | Media |

### 3.2.7 RF-07 · Servicios Premium

#### 3.2.7.1 Introducción

Es la parte del modelo de negocio que financia lo gratuito. El caso obliga a que los servicios básicos del ciudadano no tengan costo (RI-07), de modo que el ingreso tiene que venir de las empresas: catálogo Premium, casos de soporte tipo PQRS e integración por API con sus sistemas de trámite.

#### 3.2.7.2 Entradas

- Definición del catálogo de servicios Premium y sus tarifas.
- Contratación de un servicio Premium por parte de una empresa.
- Caso de soporte abierto por una empresa, con documentos asociados.
- Llamadas de la empresa a la API de integración (RF-07.4).

#### 3.2.7.3 Procesamiento

- El operador publica el catálogo y gestiona su contratación por empresa.
- El operador asocia documentos y peticiones a un caso de soporte, sin importar en qué operador esté afiliado el cliente final.
- El operador mide el consumo de cada servicio Premium por cliente.
- El operador factura el consumo medido, verificando que ninguna operación básica del ciudadano entre en la factura.

#### 3.2.7.4 Salidas

- Catálogo Premium contratable.
- Caso PQRS con sus documentos y peticiones asociadas.
- Registro de consumo y factura por empresa cliente.
- Credenciales y cuotas de la API de integración.

#### 3.2.7.5 Manejo de errores

- **Cuota de API excedida.** Se limita la tasa de la empresa cliente y se le notifica, sin degradar el servicio de los ciudadanos.
- **Intento de facturar una operación básica.** La medición la rechaza; es una invariante del sistema, no una regla de negocio configurable (RI-07).
- **Cliente final en otro operador.** La petición se enruta por el canal federado (RF-03), no falla.

#### 3.2.7.6 Requerimientos del dominio

| ID | Requerimiento | Descripción | Prioridad |
|---|---|---|---|
| RF-07.1 | Catálogo Premium | El operador debe poder definir un catálogo de servicios Premium y permitir su contratación. **[SUPUESTO]** *B-05 · No está cerrado qué es básico y qué es Premium.* | Media |
| RF-07.4 | API para empresas | El operador debe exponer una API que permita a las empresas integrar sus sistemas de trámite con la carpeta. | Media |
| RF-07.5 | Medición y facturación | El sistema debe medir el consumo Premium y facturarlo, garantizando que los servicios básicos sigan siendo gratuitos. | Media |
| RF-07.2 | Casos de soporte PQRS | El operador debe permitir a una empresa cliente armar casos de soporte y asociarles documentos. | Media |
| RF-07.3 | Solicitud desde un caso | Desde un caso PQRS la empresa debe poder pedir documentos a sus clientes sin importar su operador. | Media |

### 3.2.8 RF-08 · Analítica para el Estado

#### 3.2.8.1 Introducción

Cubre lo que el Estado quiere saber sin tocar el contenido de ningún documento: volúmenes notariales, títulos emitidos, cobertura de registro. La restricción que lo define es que la analítica opera sobre metadatos disociados de la identidad, nunca sobre el contenido ni sobre la persona.

#### 3.2.8.2 Entradas

- Metadatos de los documentos custodiados: tipo, entidad emisora, fecha, ubicación geográfica.
- Definición de las preguntas de negocio de cada contexto: notarías, educación, Registraduría.
- Autorización legal expresa, cuando una consulta exige dato identificado (RF-08.2).

#### 3.2.8.3 Procesamiento

- El sistema consolida periódicamente los metadatos en un repositorio analítico separado del operacional, nunca el contenido de los documentos (RF-08.1).
- El sistema disocia de la identidad del ciudadano todo dato entregado para análisis.
- El sistema agrega por dimensiones de negocio: tipo de acto, institución, programa, nivel, año y territorio.
- El sistema publica los resultados en tableros para MinTIC y las entidades autorizadas.

#### 3.2.8.4 Salidas

- Repositorio analítico de metadatos anonimizados.
- Respuestas agregadas a las preguntas de los tres contextos.
- Tableros y reportes para las entidades autorizadas.

#### 3.2.8.5 Manejo de errores

- **Riesgo de reidentificación por agregación fina.** El sistema suprime las celdas cuyo conteo esté por debajo del umbral de anonimato en lugar de publicarlas.
- **Consulta que exige dato identificado sin autorización legal.** Se rechaza y se registra en auditoría.
- **Desfase entre el repositorio operacional y el analítico.** Se admite: la analítica es eventualmente consistente por diseño (RNF-06) y cada tablero declara su fecha de corte.

#### 3.2.8.6 Requerimientos del dominio

| ID | Requerimiento | Descripción | Prioridad |
|---|---|---|---|
| RF-08.2 | Anonimización | El sistema debe disociar de la identidad del ciudadano todo dato entregado para análisis, salvo autorización legal expresa. | Alta |
| RF-08.1 | Consolidación de metadatos | El sistema debe consolidar periódicamente los metadatos de los documentos, nunca su contenido, en un repositorio analítico. **[SUPUESTO]** *B-04 · Choca con el mandato de mínima información en el centralizador.* | Media |
| RF-08.3 | Contexto Notarías | El sistema debe permitir responder preguntas sobre actividad notarial: volúmenes, tipos de acto y distribución geográfica y temporal. | Media |
| RF-08.4 | Contexto Educación | El sistema debe permitir responder preguntas sobre títulos y actas de grado emitidos: institución, programa, nivel y año. | Media |
| RF-08.5 | Contexto Registraduría | El sistema debe permitir responder preguntas sobre documentos de identidad y cobertura de registro de la población. | Media |
| RF-08.6 | Tableros y reportes | El sistema debe ofrecer tableros para el consumo de los resultados por MinTIC y las entidades autorizadas. | Baja |

### 3.2.9 RF-09 · Seguridad, identidad y auditoría

#### 3.2.9.1 Introducción

Es lo que impide que el sistema se convierta en una fuga de datos nacional. Cubre quién es cada quien (autenticación de personas y de sistemas), qué puede hacer (autorización por roles y atributos), qué queda registrado (auditoría) y cómo se conserva la evidencia del consentimiento. Atraviesa todos los demás dominios.

#### 3.2.9.2 Entradas

- Credenciales de ciudadanos, funcionarios y administradores.
- Certificados o credenciales de servicio de operadores pares y del centralizador.
- Política de acceso: rol, atributo, relación de delegación.
- Evento auditable generado por cualquier dominio.

#### 3.2.9.3 Procesamiento

- El sistema autentica a personas y sistemas, exigiendo segundo factor en toda operación de autorización de compartición.
- El sistema evalúa cada acceso contra la política, distinguiendo titular, delegado, entidad emisora y solicitante.
- El sistema autentica mutuamente toda llamada entre operadores y hacia el centralizador (RF-09.3).
- El sistema escribe cada operación de acceso, autorización y transferencia en un registro solo-anexar, con usuario, fecha, origen y resultado.
- El sistema conserva la evidencia del consentimiento asociada a cada compartición.

#### 3.2.9.4 Salidas

- Sesión autenticada, con su nivel de aseguramiento.
- Decisión de autorización: permitido o denegado, con el motivo.
- Registro de auditoría inalterable, consultable y exportable.
- Vista de accesos para el ciudadano: quién vio qué y bajo qué autorización (RF-09.5).

#### 3.2.9.5 Manejo de errores

- **Credenciales inválidas repetidas.** Bloqueo temporal de la cuenta y registro del intento.
- **Acceso fuera de política.** Se deniega, se registra con el motivo y se alerta si el patrón se repite.
- **Certificado de operador par vencido o no verificable.** La conexión se rechaza. Hoy el directorio del centralizador no publica claves públicas, de modo que esta verificación depende de un canal de confianza fuera del contrato (*2.5).
- **Fallo al escribir en la bitácora.** La operación de negocio no se confirma. Una operación sin rastro auditable equivale a una operación no realizada.

#### 3.2.9.6 Requerimientos del dominio

| ID | Requerimiento | Descripción | Prioridad |
|---|---|---|---|
| RF-09.2 | Autorización por roles y atributos | El sistema debe impedir que personas no autorizadas vean o modifiquen documentos ajenos, distinguiendo titular, delegado, entidad solicitante y administrador. | Alta |
| RF-09.1 | Autenticación de usuarios | El sistema debe autenticar a ciudadanos, funcionarios y sistemas con un mecanismo sólido, con segundo factor para operaciones sensibles. | Alta |
| RF-09.3 | Autenticación entre sistemas | Las llamadas entre operadores y con el centralizador deben autenticarse mutuamente mediante certificados o credenciales emitidas por MinTIC. **[SUPUESTO]** *B-09 · Hoy el centralizador no exige credencial alguna.* | Alta |
| RF-09.4 | Registro de auditoría | Toda operación de acceso, autorización y transferencia debe quedar registrada con usuario, fecha, origen y resultado, en un log no alterable. | Alta |
| RF-09.6 | Gestión del consentimiento | El sistema debe registrar y conservar la evidencia del consentimiento otorgado por el ciudadano para cada compartición. | Alta |
| RF-09.5 | Consulta de accesos | El ciudadano debe poder consultar quién accedió a sus documentos y bajo qué autorización. | Media |

## 3.3 Clases y objetos

Modelo conceptual del dominio, no de la implementación. Cada clase existe porque algún requerimiento la necesita, y lo cita. No hay tablas, ni claves foráneas, ni tecnología: eso es diseño y no pertenece a este documento. La regla que ordena el modelo es la del caso: **la carpeta pertenece al ciudadano, no al operador**, de modo que todo lo que sobrevive a un traslado cuelga del ciudadano y no de nosotros.

### 3.3.1 Ciudadano

Titular de una carpeta. Es la raíz de identidad del modelo: todo lo demás existe respecto a él.

**Atributos**

- documentoIdentidad — identificador nacional, inmutable, clave de resolución ante el centralizador
- nombres, apellidos
- correoContacto, telefonoMovil — canales de notificación
- cuentaInstitucional — correo asignado por el sistema, único e inmutable de por vida
- estadoAfiliacion — pendiente, activa o cancelada
- operadorActual

**Funciones**

- verificarIdentidad() — contra la Registraduría, antes de activar la carpeta
- solicitarTraslado(operadorDestino)
- autorizar(peticion, decisionPorDocumento)
- revocar(autorizacion)

**Realiza:** RF-01.1, RF-01.2, RF-01.5, RF-01.7, RF-04.4, RF-04.5

### 3.3.2 Carpeta

Contenedor de los documentos de un titular. Existe una por ciudadano y una por entidad registrada.

**Atributos**

- titular — Ciudadano o Entidad
- fechaApertura
- cuotaTemporales — límite de documentos y bytes no certificados
- consumoTemporales

**Funciones**

- listar(filtros) — por tipo, emisor, fecha y estado de certificación
- incorporar(documento)
- retirar(documento) — solo si no es certificado
- exportarIntegra() — para el traslado a otro operador

**Realiza:** RF-02.6, RF-02.2, RF-02.10, RF-01.8, RF-01.9

### 3.3.3 Documento

Unidad de custodia. Se especializa en dos naturalezas con reglas de vida opuestas.

**Atributos**

- identificador
- contenido — nunca sale del operador sin autorización
- hashIntegridad
- metadatos — Metadatos
- estado — recibido, vigente, sustituido o retirado
- esCertificado — decide retención, cuota y derecho de eliminación

**Funciones**

- verificarIntegridad() — recalcula el hash contra el registrado
- descargar() — conservando la evidencia de firma
- sustituirPor(documentoFirmado) — enlaza el temporal con la versión certificada

**Especializaciones**

- **DocumentoCertificado** — Lleva Firma, se conserva a perpetuidad, no consume cuota y no puede eliminarlo el titular (RF-02.1, RI-05).
- **DocumentoTemporal** — Sin firma de entidad, consume cuota, caduca y el titular puede eliminarlo (RF-02.2, RF-02.10).

**Realiza:** RF-02.1, RF-02.5, RF-02.7, RF-02.9

### 3.3.4 Metadatos

Lo que hace clasificable, buscable y analizable a un documento. Es lo único que se entrega a la analítica del Estado.

**Atributos**

- tipoDocumental
- entidadEmisora
- fechaEmision, fechaVigencia
- territorio
- estadoCertificacion

**Funciones**

- anonimizar() — disocia el metadato de la identidad del titular
- coincideCon(filtros)

**Realiza:** RF-02.3, RF-08.1, RF-08.2

### 3.3.5 Firma

Evidencia criptográfica de quién emitió el documento y de que no ha sido alterado. Sostiene el no repudio.

**Atributos**

- emisor
- selloDeTiempo
- algoritmo
- valor

**Funciones**

- verificar() — devuelve válida o inválida, con motivo
- conservar() — la firma sobrevive intacta a la custodia y al traslado

**Realiza:** RF-02.4, RF-02.5, RF-06.6, RNF-13

### 3.3.6 Afiliación

Relación vigente entre un ciudadano y un operador. Es la única información que el centralizador guarda de una persona.

**Atributos**

- ciudadano
- operador
- fechaInicio
- estado — vigente o terminada

**Funciones**

- registrar() — en el centralizador, tras verificar unicidad
- resolverOperador(documentoIdentidad)
- terminar() — solo cuando el destino confirmó la recepción íntegra

**Realiza:** RF-01.3, RF-01.4, RF-06.1, RF-06.4, RI-03

### 3.3.7 Operador

Par de la federación. Nuestro sistema es uno de ellos; los demás son externos y se conocen por el directorio.

**Atributos**

- identificador, nombre
- direccionTransferencia — sin ella el operador es inalcanzable
- estado — autorizado, suspendido o dado de baja

**Funciones**

- transferir(documento, operadorDestino)
- recibir(documento) — valida firma y metadatos antes de aceptar
- confirmarRecepcion(transferencia)

**Realiza:** RF-03.1, RF-03.2, RF-03.3, RF-06.5, RF-06.7

### 3.3.8 Transferencia

Un envío de documentos entre dos operadores. Se modela como entidad propia porque tiene estado, reintentos y acuse: no es una llamada, es un proceso.

**Atributos**

- claveIdempotencia — hace que un reintento no duplique la entrega
- origen, destino
- documentos
- estado — encolada, enviada, confirmada o fallida
- intentos

**Funciones**

- enviar()
- reintentar() — con retroceso exponencial
- confirmar(acuse)
- descartarAFallidos() — a la cola de mensajes fallidos, nunca al vacío

**Realiza:** RF-03.2, RF-03.5, RNF-07

### 3.3.9 Petición

Solicitud de documentos que un tercero radica sobre un ciudadano. Es el disparador de todo el flujo de consentimiento.

**Atributos**

- solicitante — Entidad o Empresa
- ciudadanoDestinatario
- documentosSolicitados
- estado — pendiente, autorizada, rechazada o vencida
- fechaLimite

**Funciones**

- radicar()
- consultarEstado()
- cerrar(paquete)

**Realiza:** RF-04.3, RF-04.6, RF-03.6

### 3.3.10 Autorización

Evidencia del consentimiento del titular sobre un documento concreto y un destinatario concreto. Sin ella nada sale de la carpeta.

**Atributos**

- documento, destinatario
- otorgadaEn
- vigencia
- estado — vigente, vencida o revocada
- evidencia — registro inalterable de la decisión

**Funciones**

- otorgar() — exige segundo factor
- revocar()
- estaVigente()

**Realiza:** RF-04.4, RF-04.5, RF-09.6, RI-08

### 3.3.11 Paquete

Conjunto de documentos autorizados que se entrega en un solo acto firmado.

**Atributos**

- documentos — solo los autorizados
- destinatario
- firmaOperador
- faltantes — lo pedido y no autorizado, declarado explícitamente

**Funciones**

- armar(autorizaciones)
- entregar() — a la carpeta del destinatario o por correo si no está afiliado

**Realiza:** RF-04.1, RF-04.2, RF-04.7

### 3.3.12 EventoAuditoría

Registro solo-anexar de todo lo que pasó. Es la clase que hace verificable el resto del modelo.

**Atributos**

- actor, fecha, origen
- operacion
- recursoAfectado
- resultado — permitido o denegado, con motivo

**Funciones**

- anexar() — nunca actualizar ni borrar
- consultar(filtros)
- exportar()

**Realiza:** RF-02.11, RF-09.4, RF-09.5, RNF-14

Tres relaciones sostienen el modelo. **Ciudadano–Afiliación–Operador** es la que el centralizador conoce y la única que viaja fuera. **Carpeta–Documento–Firma** es la que nunca sale del operador sin pasar por Autorización. Y **Petición–Autorización–Paquete** es la secuencia del consentimiento: sin las tres, no hay entrega.

## 3.4 Requerimientos no funcionales

Los 30 requerimientos se reparten en los seis atributos de calidad del template más uno añadido, la usabilidad, que el caso declara máxima prioridad. Cada uno lleva el criterio con el que se verifica; los marcados como asunción llevan un número que pusimos nosotros.

### 3.4.1 Desempeño

Cuánto tarda y cuánto aguanta. El caso solo dice «latencia lo más baja posible»; los umbrales de aquí son nuestros y hay que validarlos.

| ID | Atributo | Requerimiento | Criterio de aceptación |
|---|---|---|---|
| RNF-08 | Escalabilidad | El sistema debe soportar la población del país, con carpeta desde el registro y volumen creciente. **[ASUNCIÓN]** | Escalado horizontal hasta 50 M de carpetas; crecimiento ≥ 30 % anual sin degradar el p95. |
| RNF-04 | Rendimiento | Las operaciones interactivas deben responder de forma fluida en carga normal y en pico. **[ASUNCIÓN]** | p95 ≤ 2 s en consulta y navegación; p95 ≤ 5 s al cargar un documento de hasta 10 MB. |
| RNF-09 | Capacidad | El operador debe absorber los picos de campañas públicas sin rediseño. **[ASUNCIÓN]** | 2.000 peticiones/s en horario laboral; 5.000 en pico de convocatoria. |
| RNF-05 | Latencia de mensajería | El sistema no es de tiempo real, pero la latencia entre operadores debe ser tan baja como sea posible. **[ASUNCIÓN]** | p95 de entrega entre operadores ≤ 30 s; aviso al ciudadano ≤ 2 min desde la recepción. |
| RNF-30 | Elasticidad | La capacidad debe seguir a la demanda de forma automática, sin intervención humana ni sobreaprovisionamiento permanente. **[ASUNCIÓN]** | Tiempo medio hasta la puesta en marcha de una instancia ≤ 60 s; utilización sostenida entre 50 % y 70 %. |
| RNF-21 | Minimización de datos | Debe minimizarse el volumen transferido entre operadores y centralizador. **[ASUNCIÓN]** | ≤ 2 KB por transacción; caché local del directorio con TTL; consultas por lotes. |

### 3.4.2 Confiabilidad

Que lo que se guardó siga estando y que lo que se envió llegue exactamente una vez. La afiliación es el único punto donde exigimos consistencia fuerte.

| ID | Atributo | Requerimiento | Criterio de aceptación |
|---|---|---|---|
| RNF-13 | No repudio | Debe ser imposible discutir la autenticidad de un certificado o negar haberlo autorizado. **[Del caso]** | Firma con sellado de tiempo verificable; verificación en cada recepción; evidencia conservada. |
| RNF-02 | Durabilidad | Los documentos certificados deben conservarse sin pérdida ni corrupción. **[ASUNCIÓN]** | ≥ 3 réplicas en zonas independientes; verificación periódica por hash; pérdida objetivo cero. |
| RNF-06 | Consistencia | Se admite consistencia eventual en documentos y avisos, pero la afiliación debe ser fuertemente consistente. **[ASUNCIÓN]** | Cero casos de doble afiliación; convergencia del estado documental ≤ 5 min. |
| RNF-07 | Tolerancia a fallos | La caída de un operador no debe producir pérdida de mensajes ni impedir la operación del resto. **[ASUNCIÓN]** | Entregas encoladas con reintento exponencial; operaciones idempotentes; cola de mensajes muertos. |
| RNF-23 | Recuperabilidad | Debe existir un plan probado de continuidad ante la pérdida de una región o de un proveedor. **[ASUNCIÓN]** | RPO ≤ 5 min y RTO ≤ 30 min para el índice; pruebas de recuperación semestrales con evidencia. |

### 3.4.3 Disponibilidad

Que el ciudadano pueda llegar a sus documentos cuando los necesita, y que el centro de la federación no se convierta en el cuello de botella de todos.

| ID | Atributo | Requerimiento | Criterio de aceptación |
|---|---|---|---|
| RNF-03 | Retención | Los documentos certificados se conservan a perpetuidad, sin límite de tamaño. **[Del caso]** | Mínimo 100 años contractuales. Los no certificados caducan según cuota. |
| RNF-01 | Disponibilidad | La consulta y descarga de documentos certificados no puede depender de un único centro de datos. **[ASUNCIÓN]** | ≥ 99,95 % mensual para lectura; ≥ 99,5 % para escritura, con degradación a modo encolado. |
| RNF-20 | Carga mínima del centralizador | El centralizador debe manejar la mínima cantidad de transacciones y almacenar la mínima información. **[Del caso]** | ≤ 4 transacciones por ciclo de vida de afiliación y 0 bytes de contenido documental. |
| RNF-24 | Cuotas de almacenamiento | El almacenamiento de documentos no certificados debe estar limitado por usuario. **[ASUNCIÓN]** | Máximo 20 documentos y 200 MB por ciudadano; aviso al 80 % y bloqueo al 100 %, solo para no certificados. |

### 3.4.4 Seguridad

Confidencialidad, identidad, autorización y rastro. El sistema custodia documentos de toda la población: el fallo aquí no es una incidencia, es una fuga nacional.

| ID | Atributo | Requerimiento | Criterio de aceptación |
|---|---|---|---|
| RNF-10 | Confidencialidad | Los documentos deben ser confidenciales en tránsito y en reposo, incluso frente al personal del operador. **[Del caso]** | TLS 1.3 en todo canal; cifrado AES-256 en reposo con gestión de llaves segregada y auditada. |
| RNF-11 | Autenticación | Debe existir un mecanismo sólido de autenticación para ciudadanos, funcionarios y sistemas. **[ASUNCIÓN]** | Segundo factor obligatorio para autorizar comparticiones; bloqueo tras intentos fallidos; sesiones con expiración. |
| RNF-12 | Autorización | El modelo debe ser expresivo para impedir accesos indebidos en escenarios de delegación. **[ASUNCIÓN]** | Cero accesos fuera de política en pruebas de penetración; toda decisión de autorización registrada. |
| RNF-14 | Trazabilidad | Toda operación relevante debe quedar registrada de forma inalterable. **[ASUNCIÓN]** | Log append-only, retención ≥ 10 años, consultable en ≤ 5 s y exportable ante requerimiento de autoridad. |
| RNF-15 | Privacidad y cumplimiento | El tratamiento de datos personales debe cumplir la normativa colombiana. **[Del caso]** | Cumplimiento verificable de la Ley 1581 de 2012; registro de consentimientos; minimización de datos. |

### 3.4.5 Mantenibilidad

Que el sistema se pueda diagnosticar, cambiar y desplegar sin parar, y que su coste marginal sostenga la gratuidad de lo básico.

| ID | Atributo | Requerimiento | Criterio de aceptación |
|---|---|---|---|
| RNF-25 | Observabilidad | El sistema debe permitir detectar y diagnosticar fallos de integración entre operadores de forma oportuna. **[ASUNCIÓN]** | Métricas, trazas distribuidas y alertas sobre latencia y tasa de error de las transferencias. |
| RNF-29 | Desplegabilidad | Un cambio debe poder llegar a producción sin interrumpir el servicio ni coordinar despliegues entre equipos. **[ASUNCIÓN]** | Despliegue independiente por servicio; cero minutos de indisponibilidad planificada; reversión en ≤ 10 min. |
| RNF-26 | Modificabilidad | La arquitectura debe admitir nuevos tipos documentales sin rediseño. **[ASUNCIÓN]** | Nuevo tipo configurable con cero cambios en el núcleo; despliegues sin interrupción. |
| RNF-28 | Coste | El coste marginal debe sostener un modelo con servicios básicos gratuitos. **[ASUNCIÓN]** | ≤ USD 0,15 por carpeta activa al mes. |

### 3.4.6 Portabilidad

Que el ciudadano pueda cambiar de operador y que el operador pueda cambiar de nube. Son la misma propiedad en dos escalas.

| ID | Atributo | Requerimiento | Criterio de aceptación |
|---|---|---|---|
| RNF-19 | Interoperabilidad | Los operadores deben integrarse entre sí mediante contratos estándar versionados que no rompan integraciones. **[ASUNCIÓN]** | API documentada, versionada y retrocompatible; esquema común de metadatos; formatos de firma estandarizados. |
| RNF-22 | Portabilidad | Un ciudadano debe trasladarse de operador sin pérdida de información ni de identidad digital. **[ASUNCIÓN]** | Traslado completo ≤ 24 h; cuenta de correo conservada; verificación de integridad al finalizar. |
| RNF-27 | Libertad tecnológica | No hay restricción sobre tecnologías ni sobre la ubicación del almacenamiento, incluida la nube fuera del país. **[Del caso]** | Arquitectura agnóstica de proveedor, sin dependencias que impidan cambiar de nube. |

### 3.4.7 Usabilidad y accesibilidad

Se añade a los seis atributos del template porque el caso declara la usabilidad como máxima prioridad: un sistema que la población objetivo no sabe usar no cumple su función, por muy disponible que esté.

| ID | Atributo | Requerimiento | Criterio de aceptación |
|---|---|---|---|
| RNF-16 | Usabilidad | Todos los ciudadanos, incluidos los de baja apropiación tecnológica, deben poder usar el sistema. **[ASUNCIÓN]** | Tasa de éxito ≥ 90 % con usuarios de baja alfabetización digital; ≤ 5 pasos para autorizar; SUS ≥ 80. |
| RNF-17 | Accesibilidad | Las interfaces deben servir a personas con discapacidad y a dispositivos de gama baja. **[ASUNCIÓN]** | WCAG 2.1 nivel AA; diseño responsive; funcionamiento en navegadores con dos versiones de antigüedad. |
| RNF-18 | Canales alternos | El sistema debe apoyarse en canales de baja fricción para llegar a población con acceso limitado. **[Del caso]** | Correo y SMS disponibles para el 100 % de los ciudadanos registrados. |

### 3.4.8 Mapeo de requerimientos no funcionales contra QoS

Cada atributo de calidad con su métrica, su umbral y la táctica que lo sostiene. La última columna es el precio de esa táctica: es lo que hay que poder defender.

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

## 3.5 Requerimientos inversos

Lo que el sistema **no** debe hacer. El template del curso los pide aparte (*3.6) porque un límite explícito evita que alguien lo cruce creyendo que mejora el producto.

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

## 3.6 Restricciones de diseño

Lo que acota las opciones del diseño antes de empezar a diseñar. Cada restricción cita de dónde sale: el caso de estudio, un factor de la metodología *Twelve-Factor App* o un pilar de arquitectura nativa de la nube vistos en clase.

| ID | Restricción | Descripción | Origen |
|---|---|---|---|
| RD-14 | Centralizador externo no modificable | El sistema debe adaptarse al centralizador de MinTIC tal como está: no podemos cambiar su contrato, su disponibilidad ni su modelo de datos. **[Del caso]** | Caso de estudio |
| RD-15 | Contrato GovCarpeta congelado | El sistema debe consumir la API GovCarpeta tal como se verificó: Swagger 2.0, sin definiciones de seguridad y sin versionado en la ruta. **[Del caso]** | Evidencia de la API · *3.1.3 |
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

## 3.7 Requerimientos lógicos de base de datos

Qué información persiste el sistema, con qué volumen, durante cuánto tiempo y bajo qué reglas de integridad. No dice con qué motor ni con qué esquema: eso es diseño, y además está deliberadamente abierto (RD-11, RNF-27).

| Entidad de datos | Formato | Volumen | Retención | Integridad |
|---|---|---|---|---|
| Afiliación | Identificador de ciudadano, identificador de operador, fechas y estado. Sin datos de negocio. | Hasta 50 millones de registros. ≤ 200 bytes por registro. | Mientras la afiliación esté vigente, más 10 años de histórico para auditoría. | Unicidad estricta por identificador de ciudadano. Es la única invariante del sistema que exige consistencia fuerte (RNF-06). |
| Documento certificado | Objeto binario opaco más su firma y su hash. El sistema no interpreta el contenido. | Sin límite por ciudadano. Estimado de 20 a 200 documentos por carpeta activa; tamaño típico ≤ 10 MB. | Perpetua, con mínimo contractual de 100 años (RNF-03). | Inmutable tras la recepción. ≥ 3 réplicas en zonas independientes, verificadas periódicamente contra el hash registrado (RNF-02). |
| Documento temporal | Objeto binario sin firma de entidad. | Máximo 20 documentos y 200 MB por ciudadano (RNF-24). | Hasta que el ciudadano lo elimine, lo sustituya una versión certificada o caduque la cuota. | Mutable y eliminable por el titular. Nunca cuenta para la retención perpetua. |
| Metadatos | Registro estructurado: tipo documental, entidad emisora, fechas, territorio y estado de certificación. | Uno por documento. ≤ 2 KB por registro. | Igual que el documento que describe. | Obligatorios y completos: un documento sin metadatos no es indexable ni analizable, de modo que no se acepta (RF-02.3). |
| Autorización y consentimiento | Registro estructurado con documento, destinatario, vigencia, decisión y evidencia del segundo factor. | Crece con el uso; estimado de decenas por ciudadano al año. | Mínimo 10 años, para poder demostrar bajo qué consentimiento salió cada documento (RNF-14). | Inmutable una vez otorgada. La revocación crea un registro nuevo; no altera el anterior. |
| Bitácora y auditoría | Flujo solo-anexar de eventos con actor, fecha, origen, operación y resultado. | El de mayor cardinalidad del sistema: varios eventos por operación de negocio. | ≥ 10 años, consultable en ≤ 5 s y exportable (RNF-14). | Solo-anexar. Ninguna operación del sistema puede actualizar ni borrar un evento ya escrito. |
| Directorio de operadores (caché) | Copia local del directorio publicado por el centralizador. | Decenas de registros. Hoy 70 operadores, ≈ 11 KB en total. | Tiempo de vida acotado; se refresca por sondeo porque el centralizador no ofrece webhooks (*3.1.4). | Es caché, no fuente de verdad: ante discrepancia manda el centralizador. Sostiene la operación durante una caída del centro (RNF-07). |
| Repositorio analítico | Metadatos agregados y disociados de la identidad. Nunca contenido documental. | Proporcional al de metadatos, comprimido por agregación. | Histórico completo; el dato agregado no caduca. | Eventualmente consistente respecto al operacional. Cada corte declara su fecha, y las celdas por debajo del umbral de anonimato se suprimen (RF-08.2). |

**Reglas transversales de los datos**

- **Ningún dato de negocio vive en el centralizador.** Su almacenamiento se limita al enrutamiento y la validación de identidad (RF-06.8, RI-01).
- **Cada servicio es dueño de sus datos.** No hay base compartida entre servicios: la integración es por contrato, no por tabla (RD-11).
- **Lo que sobrevive al traslado cuelga del ciudadano**, no del operador: documentos, metadatos, autorizaciones históricas y la cuenta de correo institucional.
- **El dato que se destruye no se puede recuperar.** La política de retención perpetua de certificados y el derecho de supresión de datos personales están en tensión declarada; ver *2.5.

## 3.8 Otros requerimientos — granularidad de los servicios

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

# 4. Modelos de análisis

Tres modelos, tres preguntas distintas sobre lo mismo. La secuencia responde **en qué orden pasan las cosas** cuando un documento cruza la federación. El diagrama de estados responde **qué le puede pasar a un documento** a lo largo de su vida. El flujo de datos responde **qué información cruza cada frontera** del sistema. Ninguno introduce requerimientos nuevos: cada uno cita los que representa.

## 4.1 Diagrama de secuencia — transferencia entre operadores

El caso más importante del sistema y el que más partes involucra: una entidad emite un documento para un ciudadano que está afiliado a otro operador. Se eligió este escenario porque es donde se ve la decisión de arquitectura que sostiene todo lo demás.

![Diagrama de secuencia — transferencia entre operadores](../../assignment1/diagramas/secuencia-transferencia.png)

Versión interactiva: `diagramas/secuencia-transferencia.html`

- La entidad entrega el documento firmado a su operador, identificando al destinatario solo por su cédula. No sabe ni necesita saber dónde está afiliado.
- El operador emisor le hace al centralizador **una sola pregunta**: ante qué operador está esa cédula. La respuesta trae el operador y su dirección de transferencia, y se cachea.
- Con esa respuesta, el operador emisor abre una conexión **directa** con el operador destino y le entrega el documento con sus metadatos y su firma. Es el único tramo por el que viaja contenido, y es azul en el diagrama por eso.
- El destino confirma con un acuse idempotente: si el emisor reintenta, la segunda entrega no duplica nada.
- El operador destino avisa al ciudadano por correo y SMS. Cuando el ciudadano entra, consulta el documento con su firma intacta.

Lo que el diagrama demuestra es una ausencia: entre el paso 2 y el paso 3 el centralizador desaparece. Nunca toca el documento.

**Trazabilidad:** RF-03.1, RF-03.2, RF-03.3, RF-03.5, RF-03.7, RF-05.1, RF-05.2, RF-06.4, RI-01, RNF-05, RNF-07, RNF-20

## 4.2 Diagrama de transición de estados — ciclo de vida de un documento

Un documento entra a la carpeta por uno de dos caminos, y el camino decide sus derechos: si se puede borrar, si consume cuota y cuánto tiempo se conserva. Modelarlo como máquina de estados es lo que hace verificables los requerimientos de retención y de eliminación.

![Diagrama de transición de estados — ciclo de vida de un documento](../../assignment1/diagramas/estados-documento.png)

Versión interactiva: `diagramas/estados-documento.html`

- El **documento certificado** llega firmado por una entidad y entra como *recibido*. Si la firma es válida pasa a *verificado*, con su hash registrado; si no lo es queda *rechazado* y no ingresa a la carpeta.
- Con metadatos completos pasa a *vigente*, que es el estado terminal de custodia: inmutable, sin cuota y a perpetuidad. Solo la política de retención lo mueve a *retirado*; el titular no puede.
- El **documento temporal** lo carga el ciudadano, entra como *cargado* y consume cuota. Puede eliminarlo cuando quiera.
- Cuando llega la versión firmada del mismo documento, el temporal pasa a *sustituido* y queda enlazado a la certificada, que sigue el camino de arriba hasta *vigente*. Ese enlace es lo que conserva la trazabilidad entre ambas.

La asimetría del dibujo es intencionada: la fila de arriba no tiene ninguna transición que dependa de la voluntad del ciudadano, y la de abajo casi solo tiene de esas.

**Trazabilidad:** RF-02.1, RF-02.2, RF-02.3, RF-02.4, RF-02.5, RF-02.9, RF-02.10, RNF-02, RNF-03, RNF-24, RI-05

## 4.3 Diagrama de flujo de datos — nivel 1

El diagrama de contexto de *2.1 trata al operador como una caja. Este lo abre en cuatro procesos y muestra qué dato cruza cada frontera. Los cuatro procesos coinciden con la partición de servicios que sugiere el análisis de granularidad de *3.8, y no es casualidad: el mismo criterio los separó.

![Diagrama de flujo de datos — nivel 1](../../assignment1/diagramas/flujo-datos.png)

Versión interactiva: `diagramas/flujo-datos.html`

- **1 · Afiliación** recibe los datos de identidad del ciudadano y es el único proceso que escribe en el centralizador. Lo que le manda son identificadores, nunca documentos.
- **2 · Custodia documental** recibe los documentos firmados de las entidades y es el único que escribe en el almacén de la carpeta. Todo lo demás pasa por él para leer.
- **3 · Autorización** es el cuello por diseño: recibe la decisión del ciudadano y es lo único que convierte un documento almacenado en un paquete que puede salir. Está resaltado porque ningún flujo hacia afuera lo esquiva.
- **4 · Interoperabilidad** habla con los operadores pares y consulta al centralizador la afiliación del destinatario. Es la frontera por la que entra y sale contenido.

Las dos flechas azules son las únicas del sistema por las que viaja contenido documental hacia afuera. Las cuatro que van al centralizador solo llevan identificadores: esa es, otra vez, la asimetría de *2.1.

**Trazabilidad:** RF-01, RF-02, RF-03, RF-04, RF-06, RF-08, RF-09, RD-11, RD-12, RI-01, RI-08

# 5. Proceso de gestión de cambios

Una vez aprobada la versión 1.0, este documento deja de editarse libremente. Todo cambio sigue el procedimiento de abajo. La razón es la trazabilidad: si un requerimiento cambia sin dejar rastro, ningún criterio de aceptación vuelve a ser confiable.

| Paso | En qué consiste |
|---|---|
| 1 · Solicitud | Cualquier interesado —equipo, docente, entidad integrada— radica la solicitud por escrito, indicando el identificador del requerimiento afectado y la razón del cambio. |
| 2 · Análisis de impacto | El Lead Software Engineer evalúa qué otros requerimientos, restricciones y modelos de *4 dependen del que se toca, usando la trazabilidad de identificadores del documento. |
| 3 · Aprobación | Un cambio de alcance o de criterio de aceptación exige la firma del Lead Software Engineer y del docente. Una corrección de redacción que no altera el significado la aprueba solo el primero. |
| 4 · Incorporación | El cambio se aplica a la fuente de contenido, nunca al documento generado, y se regenera el documento completo. |
| 5 · Registro | Se incrementa la versión y se añade una fila al historial de revisiones, con fecha, descripción y autor. |

Este documento es **salida**: se genera desde archivos de contenido estructurado y no se edita a mano. Esa restricción es lo que impide que dos copias del mismo requerimiento se desincronicen.

---

Fuentes: enunciado del assignment y *Caso de estudio — Carpeta Ciudadana* (texto completo); API GovCarpeta, **verificada en vivo el 5 de septiembre de 2026** mediante llamadas de solo lectura a `getOperators`, `validateCitizen` y a las cabeceras CORS, más el contrato Swagger 2.0 servido por el propio host —no se ejecutó ninguna escritura—; *Software Requirements Specification Template*, WSU-TC CptS 322, basado en ANSI/IEEE Std. 830-1984; y el material del curso *Arquitectura de Software Moderna — Módulo I* para arquitectura nativa de la nube, *Twelve-Factor App* y drivers de granularidad. Referencias completas en *1.4.

