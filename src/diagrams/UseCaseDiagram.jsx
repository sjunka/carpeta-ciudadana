export default function UseCaseDiagram() {
  return (
    <svg className="dd" viewBox="0 0 1200 800" role="img" aria-labelledby="uc-title uc-desc" >
    <title id="uc-title">Casos de uso del Operador de Carpeta Ciudadana</title>
    <desc id="uc-desc">Once casos de uso agrupados en tres bloques. El ciudadano dispara seis: afiliarse, trasladarse, ver documentos, subir un temporal, compartir un paquete y autorizar peticiones. La entidad dispara dos: emitir un documento firmado y pedir documentos. El operador ejecuta tres por debajo: verificar identidad y afiliación, enrutar entregas entre operadores y notificar. Cada caso cita los requerimientos funcionales y no funcionales que realiza.</desc>
    
    <defs>
      <marker id="ucar" markerWidth="7" markerHeight="6" refX="6" refY="3" orient="auto"><polygon points="0 0, 7 3, 0 6" className="mk-m"/></marker>
    </defs>
    <rect width="100%" height="100%" className="bg"/>
    
    {/* SYSTEM BOUNDARY */}
    <rect x="272" y="72" width="656" height="616" rx="8" className="sys-bnd"/>
    <rect x="296" y="60" width="240" height="16" rx="2" className="bg"/>
    <text x="304" y="72" className="bnd-lab int" style={{ textAnchor: "start" }}>OPERADOR CARPETA CIUDADANA</text>
    
    {/* ZONES */}
    <rect x="296" y="112" width="608" height="248" rx="6" className="zone"/>
    <rect x="308" y="104" width="132" height="14" rx="2" className="bg"/>
    <text x="316" y="115" className="zlab" style={{ textAnchor: "start" }}>LO QUE HACE EL CIUDADANO</text>
    
    <rect x="296" y="392" width="608" height="104" rx="6" className="zone"/>
    <rect x="308" y="384" width="116" height="14" rx="2" className="bg"/>
    <text x="316" y="395" className="zlab" style={{ textAnchor: "start" }}>LO QUE HACE LA ENTIDAD</text>
    
    <rect x="296" y="520" width="608" height="136" rx="6" className="zone"/>
    <rect x="308" y="512" width="180" height="14" rx="2" className="bg"/>
    <text x="316" y="523" className="zlab" style={{ textAnchor: "start" }}>LO QUE EL OPERADOR HACE POR DEBAJO</text>
    
    {/* ACTOR LINKS */}
    <line className="st1 ap ln-m" pathLength="1" x1="168" y1="236" x2="290" y2="236" markerEnd="url(#ucar)"/>
    <line className="st2 ap ln-m" pathLength="1" x1="168" y1="444" x2="290" y2="444" markerEnd="url(#ucar)"/>
    <line className="st3 ap ln-m" pathLength="1" x1="1028" y1="544" x2="910" y2="544" markerEnd="url(#ucar)"/>
    <line className="st3 ap ln-m" pathLength="1" x1="1028" y1="632" x2="910" y2="632" markerEnd="url(#ucar)"/>
    
    {/* USE CASES: ciudadano */}
    <ellipse className="st1 bg" cx="448" cy="168" rx="136" ry="30"/><ellipse className="st1 uc" cx="448" cy="168" rx="136" ry="30"/>
    <text x="448" y="164" className="st1 ucn">Afiliarme a un operador</text>
    <text x="448" y="180" className="st1 uct">RF-01.1 → 01.6 · RNF-06</text>
    
    <ellipse className="st1 bg" cx="752" cy="168" rx="136" ry="30"/><ellipse className="st1 uc" cx="752" cy="168" rx="136" ry="30"/>
    <text x="752" y="164" className="st1 ucn">Trasladarme a otro operador</text>
    <text x="752" y="180" className="st1 uct">RF-01.7 · RF-01.8 · RNF-20</text>
    
    <ellipse className="st1 bg" cx="448" cy="240" rx="136" ry="30"/><ellipse className="st1 uc" cx="448" cy="240" rx="136" ry="30"/>
    <text x="448" y="236" className="st1 ucn">Ver y descargar mis documentos</text>
    <text x="448" y="252" className="st1 uct">RF-02.6 · RF-02.7 · RNF-04</text>
    
    <ellipse className="st1 bg" cx="752" cy="240" rx="136" ry="30"/><ellipse className="st1 uc" cx="752" cy="240" rx="136" ry="30"/>
    <text x="752" y="236" className="st1 ucn">Subir un documento temporal</text>
    <text x="752" y="252" className="st1 uct">RF-02.2 · RF-02.9 · RNF-22</text>
    
    <ellipse className="st1 bg" cx="448" cy="312" rx="136" ry="30"/><ellipse className="st1 uc" cx="448" cy="312" rx="136" ry="30"/>
    <text x="448" y="308" className="st1 ucn">Compartir un paquete</text>
    <text x="448" y="324" className="st1 uct">RF-04.1 · RF-04.2 · RNF-11</text>
    
    <ellipse className="st1 bg" cx="752" cy="312" rx="136" ry="30"/><ellipse className="st1 uc foc" cx="752" cy="312" rx="136" ry="30"/>
    <text x="752" y="308" className="st1 ucn">Autorizar o rechazar una petición</text>
    <text x="752" y="324" className="st1 uct ac">RF-04.4 · RF-09.6 · RNF-14</text>
    
    {/* USE CASES: entidad */}
    <ellipse className="st2 bg" cx="448" cy="444" rx="136" ry="30"/><ellipse className="st2 uc" cx="448" cy="444" rx="136" ry="30"/>
    <text x="448" y="440" className="st2 ucn">Emitir un documento firmado</text>
    <text x="448" y="456" className="st2 uct">RF-03.7 · RF-02.4 · RNF-11</text>
    
    <ellipse className="st2 bg" cx="752" cy="444" rx="136" ry="30"/><ellipse className="st2 uc" cx="752" cy="444" rx="136" ry="30"/>
    <text x="752" y="440" className="st2 ucn">Pedir documentos a un ciudadano</text>
    <text x="752" y="456" className="st2 uct">RF-04.3 · RF-07.3 · RNF-17</text>
    
    {/* USE CASES: operador */}
    <ellipse className="st3 bg" cx="396" cy="588" rx="92" ry="30"/><ellipse className="st3 uc" cx="396" cy="588" rx="92" ry="30"/>
    <text x="396" y="584" className="st3 ucn sm">Verificar identidad</text>
    <text x="396" y="600" className="st3 uct">RF-01.2 · RF-01.3</text>
    
    <ellipse className="st3 bg" cx="600" cy="588" rx="92" ry="30"/><ellipse className="st3 uc foc" cx="600" cy="588" rx="92" ry="30"/>
    <text x="600" y="584" className="st3 ucn sm">Enrutar y entregar</text>
    <text x="600" y="600" className="st3 uct ac">RF-03.1 · RF-03.2</text>
    
    <ellipse className="st3 bg" cx="804" cy="588" rx="92" ry="30"/><ellipse className="st3 uc" cx="804" cy="588" rx="92" ry="30"/>
    <text x="804" y="584" className="st3 ucn sm">Notificar</text>
    <text x="804" y="600" className="st3 uct">RF-05.1 · RF-05.2</text>
    
    {/* ACTORS */}
    <circle cx="128" cy="236" r="40" className="bg"/><circle cx="128" cy="236" r="40" className="n-per"/>
    <circle cx="128" cy="224" r="11" className="per-fill"/><path d="M 111,244 a 17,14 0 0 1 34,0 z" className="per-fill"/>
    <text x="128" y="296" className="nname">Ciudadano</text>
    
    <circle cx="128" cy="444" r="40" className="bg"/><circle cx="128" cy="444" r="40" className="n-per"/>
    <circle cx="128" cy="432" r="11" className="per-fill"/><path d="M 111,452 a 17,14 0 0 1 34,0 z" className="per-fill"/>
    <text x="128" y="504" className="nname">Entidad</text>
    <text x="128" y="520" className="nsub">MEN · embajada · telco</text>
    
    <rect x="1028" y="512" width="140" height="64" rx="4" className="bg"/><rect x="1028" y="512" width="140" height="64" rx="4" className="n-sys"/>
    <text x="1098" y="540" className="nname">MinTIC</text>
    <text x="1098" y="558" className="nsub">centralizador</text>
    
    <rect x="1028" y="600" width="140" height="64" rx="4" className="bg"/><rect x="1028" y="600" width="140" height="64" rx="4" className="n-sys"/>
    <text x="1098" y="628" className="nname">Otros</text>
    <text x="1098" y="646" className="nsub">operadores</text>
    
    {/* LEGEND */}
    <line x1="48" y1="720" x2="1152" y2="720" className="hair"/>
    <text x="48" y="736" className="lgd-t">LEYENDA</text>
    <ellipse cx="140" cy="732" rx="14" ry="7" className="uc"/>
    <text x="162" y="736" className="lgd">Caso de uso</text>
    <ellipse cx="284" cy="732" rx="14" ry="7" className="uc foc"/>
    <text x="306" y="736" className="lgd">Caso crítico del caso de estudio</text>
    <text x="560" y="736" className="lgd">RF-xx · RNF-xx = requerimientos que el caso realiza</text>
    </svg>
  )
}
