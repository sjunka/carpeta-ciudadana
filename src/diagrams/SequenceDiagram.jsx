export default function SequenceDiagram() {
  return (
    <svg className="dd" viewBox="0 0 1120 616" role="img" aria-labelledby="seq-title seq-desc">
    <title id="seq-title">Secuencia de una transferencia de documento entre operadores</title>
    <desc id="seq-desc">Una entidad emite un documento firmado en su operador. El operador emisor pregunta al centralizador de MinTIC ante qué operador está afiliado el destinatario, recibe la dirección de ese operador y le entrega el documento directamente, con sus metadatos y su firma. El operador destino confirma la recepción, avisa al ciudadano por correo y SMS, y el ciudadano consulta el documento en su carpeta. El contenido del documento nunca pasa por el centralizador.</desc>

    <defs>
      <marker id="sqar" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" className="mk-m"/></marker>
      <marker id="sqar-a" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" className="mk-a"/></marker>
    </defs>

    <rect width="100%" height="100%" className="bg"/>

    {/* ZONAS: lo nuestro contra lo ajeno */}
    <rect x="240" y="32" width="208" height="488" rx="8" className="zone"/>
    <rect x="248" y="24" width="176" height="16" rx="2" className="bg"/>
    <text x="336" y="36" className="bnd-lab int">NUESTRO OPERADOR</text>

    {/* LIFELINES */}
    <line x1="128" y1="112" x2="128" y2="504" className="hair"/>
    <line x1="344" y1="112" x2="344" y2="504" className="hair"/>
    <line x1="560" y1="112" x2="560" y2="504" className="hair"/>
    <line x1="776" y1="112" x2="776" y2="504" className="hair"/>
    <line x1="992" y1="112" x2="992" y2="504" className="hair"/>

    {/* HEADS */}
    <rect x="40" y="44" width="176" height="64" rx="4" className="n-sys"/>
    <text x="128" y="72" className="nname">Entidad emisora</text>
    <text x="128" y="90" className="nsub">MEN · notaría · embajada</text>

    <rect x="256" y="44" width="176" height="64" rx="4" className="n-sut"/>
    <text x="344" y="76" className="sut" style={{ fontSize: '13px' }}>Operador emisor</text>
    <text x="344" y="94" className="sut-sub">NUESTRO SISTEMA</text>

    <rect x="472" y="44" width="176" height="64" rx="4" className="n-sys"/>
    <text x="560" y="72" className="nname">Centralizador</text>
    <text x="560" y="90" className="nsub">MinTIC · GovCarpeta</text>

    <rect x="688" y="44" width="176" height="64" rx="4" className="n-sys"/>
    <text x="776" y="72" className="nname">Operador destino</text>
    <text x="776" y="90" className="nsub">otro par de la federación</text>

    <rect x="904" y="44" width="176" height="64" rx="4" className="bg"/>
    <rect x="904" y="44" width="176" height="64" rx="4" className="n-per"/>
    <circle cx="992" cy="66" r="11" className="per-fill"/>
    <path d="M 976,86 a 16,13 0 0 1 32,0 z" className="per-fill"/>
    <text x="992" y="102" className="nsub">Ciudadano destinatario</text>

    {/* 1 · EMISIÓN */}
    <g className="st1">
    <path pathLength="1" className="ap ln-m" d="M 128,160 H 336" markerEnd="url(#sqar)"/>
    <rect x="152" y="136" width="176" height="20" rx="2" className="bg"/>
    <text x="236" y="149" className="alab">DOCUMENTO FIRMADO · CÉDULA</text>
    </g>

    {/* 2 · RESOLUCIÓN */}
    <g className="st2">
    <path pathLength="1" className="ap ln-m" d="M 344,208 H 552" markerEnd="url(#sqar)"/>
    <rect x="376" y="184" width="152" height="20" rx="2" className="bg"/>
    <text x="452" y="197" className="alab">CÉDULA DEL DESTINATARIO</text>
    <path pathLength="1" className="ap ln-m" d="M 560,248 H 352" markerEnd="url(#sqar)"/>
    <rect x="368" y="224" width="168" height="20" rx="2" className="bg"/>
    <text x="452" y="237" className="alab">OPERADOR DESTINO · URL</text>
    </g>

    {/* 3 · TRANSFERENCIA DIRECTA */}
    <g className="st3">
    <path pathLength="1" className="ap ln-a" d="M 344,304 H 768" markerEnd="url(#sqar-a)"/>
    <rect x="452" y="280" width="208" height="20" rx="2" className="bg"/>
    <text x="556" y="293" className="alab ac">DOCUMENTOS · METADATOS · FIRMA</text>
    <path pathLength="1" className="ap ln-a" d="M 776,344 H 352" markerEnd="url(#sqar-a)"/>
    <rect x="484" y="320" width="144" height="20" rx="2" className="bg"/>
    <text x="556" y="333" className="alab ac">ACUSE IDEMPOTENTE</text>
    </g>

    {/* 4 · AVISO */}
    <g className="st4">
    <path pathLength="1" className="ap ln-m" d="M 776,400 H 984" markerEnd="url(#sqar)"/>
    <rect x="808" y="376" width="152" height="20" rx="2" className="bg"/>
    <text x="884" y="389" className="alab">AVISO POR CORREO Y SMS</text>
    </g>

    {/* 5 · CONSULTA */}
    <g className="st5">
    <path pathLength="1" className="ap ln-m" d="M 992,448 H 784" markerEnd="url(#sqar)"/>
    <rect x="820" y="424" width="128" height="20" rx="2" className="bg"/>
    <text x="884" y="437" className="alab">CONSULTA AUTENTICADA</text>
    <path pathLength="1" className="ap ln-m" d="M 776,488 H 984" markerEnd="url(#sqar)"/>
    <rect x="804" y="464" width="160" height="20" rx="2" className="bg"/>
    <text x="884" y="477" className="alab">DOCUMENTO CON SU FIRMA</text>
    </g>

    {/* NÚMERO DE CADA MENSAJE: el diagrama se sigue sin leer el pie */}
    <g className="st1"><circle cx="140" cy="160" r="9" className="bg"/><circle cx="140" cy="160" r="9" className="n-sys"/><text x="140" y="163" className="tag">1</text></g>
    <g className="st2"><circle cx="356" cy="208" r="9" className="bg"/><circle cx="356" cy="208" r="9" className="n-sys"/><text x="356" y="211" className="tag">2</text></g>
    <g className="st2"><circle cx="548" cy="248" r="9" className="bg"/><circle cx="548" cy="248" r="9" className="n-sys"/><text x="548" y="251" className="tag">3</text></g>
    <g className="st3"><circle cx="356" cy="304" r="9" className="bg"/><circle cx="356" cy="304" r="9" className="n-sys"/><text x="356" y="307" className="tag">4</text></g>
    <g className="st3"><circle cx="764" cy="344" r="9" className="bg"/><circle cx="764" cy="344" r="9" className="n-sys"/><text x="764" y="347" className="tag">5</text></g>
    <g className="st4"><circle cx="788" cy="400" r="9" className="bg"/><circle cx="788" cy="400" r="9" className="n-sys"/><text x="788" y="403" className="tag">6</text></g>
    <g className="st5"><circle cx="980" cy="448" r="9" className="bg"/><circle cx="980" cy="448" r="9" className="n-sys"/><text x="980" y="451" className="tag">7</text></g>
    <g className="st5"><circle cx="788" cy="488" r="9" className="bg"/><circle cx="788" cy="488" r="9" className="n-sys"/><text x="788" y="491" className="tag">8</text></g>

    {/* LEGEND */}
    <line x1="40" y1="536" x2="1080" y2="536" className="hair"/>
    <text x="40" y="552" className="lgd-t">LEYENDA</text>
    <line x1="128" y1="547" x2="160" y2="547" className="ln-m"/>
    <text x="168" y="552" className="lgd">Identificadores y avisos</text>
    <line x1="336" y1="547" x2="368" y2="547" className="ln-a"/>
    <text x="376" y="552" className="lgd">Contenido documental — nunca pasa por el centralizador</text>
    <rect x="800" y="541" width="14" height="10" rx="2" className="n-sut"/>
    <text x="822" y="552" className="lgd">Nuestro operador</text>
    </svg>
  )
}
