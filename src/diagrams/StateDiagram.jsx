export default function StateDiagram() {
  return (
    <svg className="dd" viewBox="0 0 1120 616" role="img" aria-labelledby="std-title std-desc">
    <title id="std-title">Ciclo de vida de un documento en la carpeta</title>
    <desc id="std-desc">Un documento entra por dos caminos. El certificado llega firmado por una entidad, pasa a verificado si su firma es válida y de ahí a vigente; si la firma no es válida queda rechazado y no ingresa a la carpeta. Un documento vigente solo sale de ese estado por la política de retención. El temporal lo carga el ciudadano y puede eliminarlo, o queda sustituido cuando llega la versión firmada del mismo documento, que pasa a vigente.</desc>

    <defs>
      <marker id="star" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><polygon points="0 0, 9 3.5, 0 7" className="mk-m"/></marker>
      <marker id="star-a" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><polygon points="0 0, 9 3.5, 0 7" className="mk-a"/></marker>
    </defs>

    <rect width="100%" height="100%" className="bg"/>

    {/* ZONAS: las dos naturalezas de documento tienen reglas opuestas */}
    <rect x="40" y="80" width="1000" height="184" rx="8" className="zone"/>
    <rect x="56" y="72" width="344" height="16" rx="2" className="bg"/>
    <text x="228" y="84" className="bnd-lab int">CERTIFICADO — LO EMITE Y FIRMA UNA ENTIDAD</text>

    <rect x="40" y="320" width="1000" height="184" rx="8" className="zone"/>
    <rect x="56" y="312" width="344" height="16" rx="2" className="bg"/>
    <text x="228" y="324" className="bnd-lab auto">TEMPORAL — LO SUBE EL PROPIO CIUDADANO</text>

    {/* PUNTOS INICIALES */}
    <circle cx="72" cy="128" r="8" className="per-fill"/>
    <circle cx="72" cy="376" r="8" className="per-fill"/>

    {/* 1 · LLEGA Y SE VERIFICA LA FIRMA */}
    <g className="st1">
    <path pathLength="1" className="ap ln-m" d="M 80,128 H 120" markerEnd="url(#star)"/>
    <path pathLength="1" className="ap ln-m" d="M 320,128 H 400" markerEnd="url(#star)"/>
    <rect x="320" y="104" width="76" height="20" rx="2" className="bg"/>
    <text x="358" y="117" className="alab">FIRMA VÁLIDA</text>
    </g>

    {/* 2 · PASA A VIGENTE: A PERPETUIDAD */}
    <g className="st2">
    <path pathLength="1" className="ap ln-a" d="M 600,128 H 680" markerEnd="url(#star-a)"/>
    <rect x="604" y="92" width="72" height="30" rx="2" className="bg"/>
    <text x="640" y="103" className="alab ac">METADATOS</text>
    <text x="640" y="116" className="alab ac">COMPLETOS</text>
    </g>

    {/* 3 · O SE RECHAZA EN LA PUERTA */}
    <g className="st3">
    <path pathLength="1" className="ap ln-m" d="M 224,160 V 216 Q 224,224 232,224 H 400" markerEnd="url(#star)"/>
    <rect x="244" y="200" width="120" height="20" rx="2" className="bg"/>
    <text x="304" y="213" className="alab">FIRMA INVÁLIDA</text>
    </g>

    {/* 4 · EL TEMPORAL: CUOTA Y BORRADO A VOLUNTAD */}
    <g className="st4">
    <path pathLength="1" className="ap ln-m" d="M 80,376 H 120" markerEnd="url(#star)"/>
    <path pathLength="1" className="ap ln-m" d="M 224,408 V 456 Q 224,464 232,464 H 400" markerEnd="url(#star)"/>
    <rect x="240" y="440" width="140" height="20" rx="2" className="bg"/>
    <text x="310" y="453" className="alab">ORDEN DEL TITULAR</text>
    <path pathLength="1" className="ap ln-m" d="M 320,376 H 400" markerEnd="url(#star)"/>
    <rect x="324" y="346" width="68" height="30" rx="2" className="bg"/>
    <text x="358" y="357" className="alab">LLEGA LA</text>
    <text x="358" y="370" className="alab">FIRMADA</text>
    </g>

    {/* 5 · EL ENLACE ENTRE AMBAS VIDAS, Y EL FINAL DE LA CUSTODIA */}
    <g className="st5">
    <path pathLength="1" className="ap ln-a" d="M 600,376 H 648 Q 656,376 656,368 V 152 Q 656,144 664,144 H 680" markerEnd="url(#star-a)"/>
    <rect x="600" y="352" width="88" height="20" rx="2" className="bg"/>
    <text x="644" y="365" className="alab ac">QUEDA TRAZADA</text>
    <path pathLength="1" className="ap ln-m" d="M 784,160 V 184" markerEnd="url(#star)"/>
    <rect x="800" y="166" width="140" height="20" rx="2" className="bg"/>
    <text x="870" y="179" className="alab">POLÍTICA DE RETENCIÓN</text>
    </g>

    {/* ESTADOS — certificado */}
    <rect x="128" y="96" width="192" height="64" rx="12" className="bg"/>
    <rect x="128" y="96" width="192" height="64" rx="12" className="n-sys"/>
    <text x="224" y="124" className="nname">Recibido</text>
    <text x="224" y="142" className="nsub">firma por verificar</text>

    <rect x="400" y="96" width="192" height="64" rx="12" className="bg"/>
    <rect x="400" y="96" width="192" height="64" rx="12" className="n-sys"/>
    <text x="496" y="124" className="nname">Verificado</text>
    <text x="496" y="142" className="nsub">hash y firma registrados</text>

    <rect x="680" y="96" width="208" height="64" rx="12" className="bg"/>
    <rect x="680" y="96" width="208" height="64" rx="12" className="n-sut"/>
    <text x="784" y="124" className="sut" style={{ fontSize: '13px' }}>Vigente</text>
    <text x="784" y="144" className="sut-sub">A PERPETUIDAD · INMUTABLE</text>

    <rect x="400" y="192" width="192" height="64" rx="12" className="bg"/>
    <rect x="400" y="192" width="192" height="64" rx="12" className="n-sys"/>
    <text x="496" y="220" className="nname">Rechazado</text>
    <text x="496" y="238" className="nsub">no ingresa a la carpeta</text>

    <rect x="680" y="192" width="208" height="64" rx="12" className="bg"/>
    <rect x="680" y="192" width="208" height="64" rx="12" className="n-sys"/>
    <text x="784" y="220" className="nname">Retirado</text>
    <text x="784" y="238" className="nsub">nunca por orden del titular</text>

    {/* ESTADOS — temporal */}
    <rect x="128" y="344" width="192" height="64" rx="12" className="bg"/>
    <rect x="128" y="344" width="192" height="64" rx="12" className="n-sys"/>
    <text x="224" y="372" className="nname">Cargado</text>
    <text x="224" y="390" className="nsub">consume cuota</text>

    <rect x="400" y="344" width="192" height="64" rx="12" className="bg"/>
    <rect x="400" y="344" width="192" height="64" rx="12" className="n-sys"/>
    <text x="496" y="372" className="nname">Sustituido</text>
    <text x="496" y="390" className="nsub">enlazado a la firmada</text>

    <rect x="400" y="440" width="192" height="64" rx="12" className="bg"/>
    <rect x="400" y="440" width="192" height="64" rx="12" className="n-sys"/>
    <text x="496" y="468" className="nname">Eliminado</text>
    <text x="496" y="486" className="nsub">libera cuota</text>

    {/* LEYENDA */}
    <line x1="48" y1="552" x2="1072" y2="552" className="hair"/>
    <text x="48" y="568" className="lgd-t">LEYENDA</text>
    <circle cx="136" cy="564" r="6" className="per-fill"/>
    <text x="150" y="568" className="lgd">Entrada</text>
    <rect x="240" y="558" width="14" height="10" rx="3" className="n-sys"/>
    <text x="262" y="568" className="lgd">Estado</text>
    <rect x="344" y="558" width="14" height="10" rx="3" className="n-sut"/>
    <text x="366" y="568" className="lgd">Custodia perpetua</text>
    <line x1="516" y1="563" x2="548" y2="563" className="ln-a"/>
    <text x="556" y="568" className="lgd">Transición que fija la retención a perpetuidad</text>
    </svg>
  )
}
