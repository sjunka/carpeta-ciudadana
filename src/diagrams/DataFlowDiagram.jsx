export default function DataFlowDiagram() {
  return (
    <svg className="dd" viewBox="0 0 1120 720" role="img" aria-labelledby="dfd-title dfd-desc">
    <title id="dfd-title">Diagrama de flujo de datos, nivel 1</title>
    <desc id="dfd-desc">Cuatro procesos componen el operador: afiliación, custodia documental, autorización e interoperabilidad. El ciudadano entrega datos de identidad a afiliación y decisiones de consentimiento a autorización. La entidad emisora entrega documentos firmados a custodia documental, que los deposita en el almacén de la carpeta. Interoperabilidad intercambia documentos con los operadores pares y consulta al centralizador de MinTIC, al que solo llegan identificadores.</desc>

    <defs>
      <marker id="dfar" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><polygon points="0 0, 9 3.5, 0 7" className="mk-m"/></marker>
      <marker id="dfar-a" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><polygon points="0 0, 9 3.5, 0 7" className="mk-a"/></marker>
    </defs>

    <rect width="100%" height="100%" className="bg"/>

    {/* FRONTERA DEL SISTEMA */}
    <rect x="328" y="48" width="456" height="600" rx="8" className="sys-bnd"/>
    <rect x="440" y="40" width="232" height="16" rx="2" className="bg"/>
    <text x="556" y="52" className="bnd-lab int">OPERADOR CARPETA CIUDADANA</text>

    {/* 1 · ENTRADAS DEL CIUDADANO */}
    <g className="st1">
    <path pathLength="1" className="ap ln-m" d="M 240,128 H 392" markerEnd="url(#dfar)"/>
    <rect x="248" y="100" width="144" height="20" rx="2" className="bg"/>
    <text x="320" y="113" className="alab">DATOS DE IDENTIDAD</text>
    <path pathLength="1" className="ap ln-m" d="M 240,160 H 288 Q 296,160 296,168 V 440 Q 296,448 304,448 H 392" markerEnd="url(#dfar)"/>
    <rect x="40" y="424" width="212" height="20" rx="2" className="bg"/>
    <text x="146" y="437" className="alab">DECISIÓN DE AUTORIZACIÓN</text>
    </g>

    {/* 2 · IDENTIFICADORES HACIA EL CENTRALIZADOR */}
    <g className="st2">
    <path pathLength="1" className="ap ln-m" d="M 712,120 H 864" markerEnd="url(#dfar)"/>
    <rect x="716" y="92" width="144" height="20" rx="2" className="bg"/>
    <text x="788" y="105" className="alab">CÉDULA · ALTA AFILIACIÓN</text>
    <path pathLength="1" className="ap ln-m" d="M 872,140 H 808 Q 800,140 800,148 V 552 Q 800,560 792,560 H 720" markerEnd="url(#dfar)"/>
    <rect x="714" y="532" width="148" height="20" rx="2" className="bg"/>
    <text x="788" y="545" className="alab">OPERADOR DEL DESTINATARIO</text>
    </g>

    {/* 3 · EMISIÓN Y CUSTODIA */}
    <g className="st3">
    <path pathLength="1" className="ap ln-m" d="M 240,296 H 392" markerEnd="url(#dfar)"/>
    <rect x="248" y="260" width="144" height="34" rx="2" className="bg"/>
    <text x="320" y="272" className="alab">DOCUMENTO FIRMADO</text>
    <text x="320" y="285" className="alab">+ METADATOS</text>
    <path pathLength="1" className="ap ln-m" d="M 712,288 H 864" markerEnd="url(#dfar)"/>
    <rect x="716" y="260" width="144" height="20" rx="2" className="bg"/>
    <text x="788" y="273" className="alab">CONTENIDO · HASH · FIRMA</text>
    <path pathLength="1" className="ap ln-m" d="M 872,320 H 720" markerEnd="url(#dfar)"/>
    <rect x="716" y="296" width="144" height="20" rx="2" className="bg"/>
    <text x="788" y="309" className="alab">DOCUMENTO Y SU FIRMA</text>
    </g>

    {/* 4 · EL CONSENTIMIENTO, POR DENTRO */}
    <g className="st4">
    <path pathLength="1" className="ap ln-m" d="M 556,336 V 392" markerEnd="url(#dfar)"/>
    <rect x="560" y="344" width="152" height="20" rx="2" className="bg"/>
    <text x="636" y="357" className="alab">DOCUMENTO A COMPARTIR</text>
    <path pathLength="1" className="ap ln-m" d="M 556,496 V 528" markerEnd="url(#dfar)"/>
    <rect x="560" y="500" width="152" height="20" rx="2" className="bg"/>
    <text x="636" y="513" className="alab">PAQUETE AUTORIZADO</text>
    <path pathLength="1" className="ap ln-m" d="M 400,584 H 272 Q 264,584 264,576 V 328 Q 264,320 272,320 H 392" markerEnd="url(#dfar)"/>
    <rect x="264" y="560" width="124" height="20" rx="2" className="bg"/>
    <text x="326" y="573" className="alab">DOCUMENTO RECIBIDO</text>
    </g>

    {/* 5 · CONTENIDO ENTRE PARES */}
    <g className="st5">
    <path pathLength="1" className="ap ln-a" d="M 712,592 H 864" markerEnd="url(#dfar-a)"/>
    <rect x="716" y="556" width="144" height="32" rx="2" className="bg"/>
    <text x="788" y="568" className="alab ac">DOCUMENTOS · METADATOS</text>
    <text x="788" y="581" className="alab ac">CON FIRMA</text>
    <path pathLength="1" className="ap ln-a" d="M 872,624 H 720" markerEnd="url(#dfar-a)"/>
    <rect x="716" y="600" width="144" height="20" rx="2" className="bg"/>
    <text x="788" y="613" className="alab ac">DOCUMENTOS ENTRANTES</text>
    </g>

    {/* ENTIDADES EXTERNAS */}
    <rect x="48" y="96" width="192" height="80" rx="4" className="bg"/>
    <rect x="48" y="96" width="192" height="80" rx="4" className="n-per"/>
    <circle cx="144" cy="124" r="12" className="per-fill"/>
    <path d="M 126,146 a 18,15 0 0 1 36,0 z" className="per-fill"/>
    <text x="144" y="168" className="nsub">Ciudadano · titular</text>

    <rect x="48" y="256" width="192" height="80" rx="4" className="bg"/>
    <rect x="48" y="256" width="192" height="80" rx="4" className="n-sys"/>
    <text x="144" y="292" className="nname">Entidad emisora</text>
    <text x="144" y="310" className="nsub">MEN · notaría · embajada</text>

    <rect x="864" y="80" width="208" height="80" rx="4" className="bg"/>
    <rect x="864" y="80" width="208" height="80" rx="4" className="n-sys"/>
    <text x="968" y="116" className="nname">Centralizador MinTIC</text>
    <text x="968" y="134" className="nsub">solo identificadores</text>

    <rect x="864" y="576" width="208" height="80" rx="4" className="bg"/>
    <rect x="864" y="576" width="208" height="80" rx="4" className="n-sys"/>
    <text x="968" y="612" className="nname">Operadores pares</text>
    <text x="968" y="630" className="nsub">federación</text>

    {/* ALMACÉN DE DATOS */}
    <rect x="864" y="264" width="208" height="80" rx="4" className="bg"/>
    <rect x="864" y="264" width="208" height="80" rx="4" className="zone"/>
    <line x1="864" y1="292" x2="1072" y2="292" className="hair"/>
    <text x="876" y="285" className="tag" style={{ textAnchor: 'start' }}>D1</text>
    <text x="968" y="316" className="nname">Carpeta</text>
    <text x="968" y="334" className="nsub">documentos y metadatos</text>

    {/* PROCESOS */}
    <rect x="392" y="88" width="320" height="80" rx="16" className="bg"/>
    <rect x="392" y="88" width="320" height="80" rx="16" className="uc"/>
    <text x="552" y="124" className="ucn">1 · Afiliación</text>
    <text x="552" y="146" className="uct">RF-01 · RF-06</text>

    <rect x="392" y="256" width="320" height="80" rx="16" className="bg"/>
    <rect x="392" y="256" width="320" height="80" rx="16" className="uc"/>
    <text x="552" y="292" className="ucn">2 · Custodia documental</text>
    <text x="552" y="314" className="uct">RF-02 · RF-05</text>

    <rect x="392" y="392" width="320" height="104" rx="16" className="bg"/>
    <rect x="392" y="392" width="320" height="104" rx="16" className="uc foc"/>
    <text x="552" y="428" className="ucn">3 · Autorización</text>
    <text x="552" y="450" className="ucn sm">del titular</text>
    <text x="552" y="474" className="uct ac">RF-04 · RF-09</text>

    <rect x="392" y="528" width="320" height="104" rx="16" className="bg"/>
    <rect x="392" y="528" width="320" height="104" rx="16" className="uc"/>
    <text x="552" y="566" className="ucn">4 · Interoperabilidad</text>
    <text x="552" y="588" className="ucn sm">entre operadores</text>
    <text x="552" y="612" className="uct">RF-03 · RF-07 · RF-08</text>

    {/* LEYENDA */}
    <line x1="48" y1="676" x2="1072" y2="676" className="hair"/>
    <text x="48" y="692" className="lgd-t">LEYENDA</text>
    <rect x="136" y="682" width="14" height="10" rx="5" className="uc"/>
    <text x="158" y="692" className="lgd">Proceso</text>
    <rect x="248" y="682" width="14" height="10" rx="2" className="zone"/>
    <text x="270" y="692" className="lgd">Almacén de datos</text>
    <rect x="404" y="682" width="14" height="10" rx="2" className="n-sys"/>
    <text x="426" y="692" className="lgd">Entidad externa</text>
    <line x1="564" y1="687" x2="596" y2="687" className="ln-a"/>
    <text x="604" y="692" className="lgd">Contenido documental entre pares — el único que sale del operador</text>
    </svg>
  )
}
