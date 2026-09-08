export default function ContextDiagram() {
  return (
    <svg className="dd" viewBox="0 0 1120 760" role="img" aria-labelledby="ctx2-title ctx2-desc" >
    <title id="ctx2-title">Contexto del sistema: Operador de Carpeta Ciudadana</title>
    <desc id="ctx2-desc">El Operador de Carpeta Ciudadana es el sistema en construcción. A la izquierda de la línea de automatización están las personas que lo usan: el ciudadano y el funcionario de una entidad. A la derecha, tras la línea de integración, están los sistemas con los que se comunica: el centralizador de MinTIC, la Registraduría, los demás operadores y el canal de notificaciones. Cada flecha indica los datos que viajan en ese sentido.</desc>
    
    <defs>
      <marker id="c2ar" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" className="mk-m"/></marker>
      <marker id="c2ar-a" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" className="mk-a"/></marker>
    </defs>
    
    <rect width="100%" height="100%" className="bg"/>
    
    {/* BOUNDARY LINES */}
    <line x1="296" y1="72" x2="296" y2="656" className="bnd-auto"/>
    <line x1="784" y1="72" x2="784" y2="656" className="bnd-int"/>
    <rect x="176" y="708" width="240" height="16" rx="2" className="bg"/>
    <text x="296" y="720" className="bnd-lab auto">LÍNEA DE AUTOMATIZACIÓN</text>
    <rect x="696" y="48" width="176" height="16" rx="2" className="bg"/>
    <text x="784" y="60" className="bnd-lab int">INTEGRACIÓN CON…</text>
    
    {/* ARROWS: people */}
    <path pathLength="1" className="st1 ap ln-m" d="M 184,184 H 240 Q 248,184 248,192 V 312 Q 248,320 256,320 H 423" markerEnd="url(#c2ar)"/>
    <path pathLength="1" className="st5 ap ln-m" d="M 413,344 H 224 Q 216,344 216,336 V 224 Q 216,216 208,216 H 184" markerEnd="url(#c2ar)"/>
    <path pathLength="1" className="st2 ap ln-m" d="M 184,552 H 240 Q 248,552 248,544 V 440 Q 248,432 256,432 H 423" markerEnd="url(#c2ar)"/>
    <path pathLength="1" className="st5 ap ln-m" d="M 413,408 H 224 Q 216,408 216,416 V 512 Q 216,520 208,520 H 184" markerEnd="url(#c2ar)"/>
    
    {/* ARROWS: IT systems */}
    <path pathLength="1" className="st1 ap ln-m" d="M 598,296 H 656 Q 664,296 664,288 V 128 Q 664,120 672,120 H 832" markerEnd="url(#c2ar)"/>
    <path pathLength="1" className="st3 ap ln-m" d="M 832,152 H 688 Q 680,152 680,160 V 312 Q 680,320 672,320 H 617" markerEnd="url(#c2ar)"/>
    <path pathLength="1" className="st1 ap ln-m" d="M 627,344 H 688 Q 696,344 696,336 V 296 Q 696,288 704,288 H 832" markerEnd="url(#c2ar)"/>
    <path pathLength="1" className="st1 ap ln-m" d="M 832,320 H 720 Q 712,320 712,328 V 352 Q 712,360 704,360 H 631" markerEnd="url(#c2ar)"/>
    <path pathLength="1" className="st4 ap ln-a" d="M 627,408 H 752 Q 760,408 760,416 V 440 Q 760,448 768,448 H 832" markerEnd="url(#c2ar-a)"/>
    <path pathLength="1" className="st4 ap ln-a" d="M 832,480 H 752 Q 744,480 744,472 V 464 Q 744,456 736,456 H 598" markerEnd="url(#c2ar-a)"/>
    <path pathLength="1" className="st5 ap ln-m" d="M 520,488 V 600 Q 520,608 528,608 H 832" markerEnd="url(#c2ar)"/>
    
    {/* LABELS: people */}
    <g className="st1">
    <rect x="260" y="278" width="160" height="34" rx="2" className="bg"/>
    <text x="340" y="290" className="alab">DATOS DE IDENTIDAD</text>
    <text x="340" y="303" className="alab">DOCUMENTOS TEMPORALES</text>
    </g>
    
    <g className="st5">
    <rect x="236" y="352" width="164" height="20" rx="2" className="bg"/>
    <text x="318" y="365" className="alab">ESTADO Y AVISOS DE LA CARPETA</text>
    </g>
    
    <g className="st2">
    <rect x="260" y="440" width="160" height="34" rx="2" className="bg"/>
    <text x="340" y="452" className="alab">DOCUMENTOS FIRMADOS</text>
    <text x="340" y="465" className="alab">PETICIÓN DE DOCUMENTOS</text>
    </g>
    
    <g className="st5">
    <rect x="236" y="380" width="164" height="20" rx="2" className="bg"/>
    <text x="318" y="393" className="alab">ACUSE Y ESTADO DE LA PETICIÓN</text>
    </g>
    
    {/* LABELS: IT systems */}
    <g className="st1">
    <rect x="672" y="78" width="160" height="34" rx="2" className="bg"/>
    <text x="752" y="90" className="alab">CÉDULA · ID OPERADOR</text>
    <text x="752" y="103" className="alab">HUELLA DEL DOCUMENTO</text>
    </g>
    
    <g className="st3">
    <rect x="690" y="160" width="140" height="34" rx="2" className="bg"/>
    <text x="760" y="172" className="alab">OPERADOR DESTINO</text>
    <text x="760" y="185" className="alab">DIRECTORIO</text>
    </g>
    
    <g className="st1">
    <rect x="700" y="246" width="130" height="20" rx="2" className="bg"/>
    <text x="765" y="259" className="alab">CÉDULA A VERIFICAR</text>
    </g>
    
    <g className="st1">
    <rect x="722" y="328" width="108" height="20" rx="2" className="bg"/>
    <text x="776" y="341" className="alab">IDENTIDAD FIRMADA</text>
    </g>
    
    <g className="st4">
    <rect x="644" y="418" width="136" height="20" rx="2" className="bg"/>
    <text x="712" y="431" className="alab ac">DOCUMENTOS · METADATOS</text>
    </g>
    
    <g className="st4">
    <rect x="602" y="464" width="128" height="20" rx="2" className="bg"/>
    <text x="666" y="477" className="alab ac">ACUSE DE RECIBO</text>
    </g>
    
    <g className="st5">
    <rect x="600" y="574" width="160" height="20" rx="2" className="bg"/>
    <text x="680" y="587" className="alab">AVISO A ENVIAR</text>
    </g>
    
    {/* LEFT: PEOPLE */}
    <circle cx="136" cy="200" r="48" className="bg"/>
    <circle cx="136" cy="200" r="48" className="n-per"/>
    <circle cx="136" cy="186" r="13" className="per-fill"/>
    <path d="M 116,222 a 20,17 0 0 1 40,0 z" className="per-fill"/>
    <text x="136" y="272" className="nname">Ciudadano</text>
    <text x="136" y="288" className="nsub">titular de la carpeta</text>
    
    <circle cx="136" cy="536" r="48" className="bg"/>
    <circle cx="136" cy="536" r="48" className="n-per"/>
    <circle cx="136" cy="522" r="13" className="per-fill"/>
    <path d="M 116,558 a 20,17 0 0 1 40,0 z" className="per-fill"/>
    <text x="136" y="608" className="nname">Funcionario</text>
    <text x="136" y="624" className="nsub">MEN · embajada · telco</text>
    
    {/* CENTER: SYSTEM UNDER CONSTRUCTION */}
    <circle cx="520" cy="376" r="112" className="bg"/>
    <circle cx="520" cy="376" r="112" className="n-sut"/>
    <text x="520" y="360" className="sut">Operador</text>
    <text x="520" y="388" className="sut">Carpeta Ciudadana</text>
    <text x="520" y="416" className="sut-sub">SISTEMA EN CONSTRUCCIÓN</text>
    
    {/* RIGHT: IT SYSTEMS */}
    <rect x="832" y="88" width="224" height="96" rx="4" className="bg"/>
    <rect x="832" y="88" width="224" height="96" rx="4" className="n-sys"/>
    <text x="944" y="126" className="nname">Centralizador MinTIC</text>
    <text x="944" y="144" className="nsub">directorio de afiliación</text>
    <text x="944" y="160" className="nsub">+ opera GovCarpeta</text>
    
    <rect x="832" y="264" width="224" height="80" rx="4" className="bg"/>
    <rect x="832" y="264" width="224" height="80" rx="4" className="n-sys"/>
    <text x="944" y="300" className="nname">Registraduría</text>
    <text x="944" y="318" className="nsub">verificación de identidad</text>
    
    <rect x="832" y="424" width="224" height="80" rx="4" className="bg"/>
    <rect x="832" y="424" width="224" height="80" rx="4" className="n-sys"/>
    <text x="944" y="460" className="nname">Otros Operadores</text>
    <text x="944" y="478" className="nsub">MiCarpeta · PQCarpeta</text>
    
    <rect x="832" y="568" width="224" height="80" rx="4" className="bg"/>
    <rect x="832" y="568" width="224" height="80" rx="4" className="n-sys"/>
    <text x="944" y="604" className="nname">Canal de notificación</text>
    <text x="944" y="622" className="nsub">correo · SMS</text>
    
    {/* LEGEND */}
    <line x1="48" y1="672" x2="1072" y2="672" className="hair"/>
    <text x="48" y="688" className="lgd-t">LEYENDA</text>
    <circle cx="136" cy="684" r="6" className="n-per"/>
    <text x="150" y="688" className="lgd">Persona</text>
    <circle cx="228" cy="684" r="6" className="n-sut"/>
    <text x="242" y="688" className="lgd">Sistema en construcción</text>
    <rect x="416" y="678" width="14" height="10" rx="2" className="n-sys"/>
    <text x="438" y="688" className="lgd">Sistema externo</text>
    <line x1="576" y1="683" x2="608" y2="683" className="ln-a"/>
    <text x="616" y="688" className="lgd">Flujo documental entre operadores</text>
    </svg>
  )
}
