import Section, { SubTitulo } from '../../components/Section.jsx'
import DataTable from '../../components/DataTable.jsx'
import DiagramFrame from '../../components/DiagramFrame.jsx'
import Plegable from '../../components/Plegable.jsx'
import Refs from '../../components/Refs.jsx'
import Rich from '../../components/Rich.jsx'
import Diagrama from '../diagramas/Diagrama.jsx'
import { buscarRef, PATRON } from '../lib/refs.js'
import rnf from '../../content/requerimientos-no-funcionales.json'
import intro from '../content/intro.json'
import historias from '../content/historias.json'
import microservicios from '../content/microservicios.json'
import componentes from '../content/componentes.json'
import secuencias from '../content/secuencias.json'
import despliegue from '../content/despliegue.json'
import decisiones from '../content/decisiones.json'
import implementacion from '../content/implementacion.json'

// Las siete secciones de A2. Solo componen: el texto vive en src/arquitectura/content/.
const R = ({ texto }) => <Refs texto={texto} buscar={buscarRef} patron={PATRON} />
const BASE = import.meta.env?.BASE_URL ?? '/'

function Figura({ d, comprimido }) {
  return (
    <div id={d.id}>
      <SubTitulo num={d.num} texto={d.titulo} />
      {!comprimido && d.introduccion && <p className="lede">{d.introduccion}</p>}
      <DiagramFrame id={`d-${d.id}`} pasos={d.pasos}>
        <Diagrama d={d} />
      </DiagramFrame>
      {d.cierre && <Rich as="p" className="pull" html={d.cierre} />}
      {d.video && (
        <video className="a2-video" controls muted playsInline preload="metadata" poster={`${BASE}${d.video.poster}`}>
          <source src={`${BASE}${d.video.mp4}`} type="video/mp4" />
        </video>
      )}
      <Plegable titulo={`${d.num} · Lectura paso a paso`} comprimido={comprimido}>
        <ul className="logic">
          {d.pasos.map((p) => <li key={p}>{p}</li>)}
        </ul>
      </Plegable>
      <p className="lede">
        Trazabilidad: <R texto={d.realiza ?? d.hu} />
      </p>
    </div>
  )
}

export function SeccionIntro({ meta, comprimido }) {
  return (
    <Section meta={meta} comprimido={comprimido}>
      <Rich as="p" className="lede" html={intro.proposito} />
      <SubTitulo num="1.1" texto="Alcance" />
      <ul className="logic">
        {intro.alcance.map((a) => <Rich key={a} as="li" html={a} />)}
      </ul>
      <Plegable titulo="1.2 · Glosario" comprimido={comprimido}>
        {!comprimido && <SubTitulo num="1.2" texto="Glosario" />}
        <DataTable
          columnas={[
            { clave: 'termino', cabecera: 'Término', ancho: '200px', clase: 'nm' },
            { clave: 'definicion', cabecera: 'Definición' },
          ]}
          filas={intro.glosario}
        />
      </Plegable>
      <SubTitulo num="1.3" texto="Qué hereda del SRS y qué cambia" />
      <DataTable
        columnas={[
          { clave: 'ref', cabecera: 'Supuesto', ancho: '90px', clase: 'nm' },
          { clave: 'a1', cabecera: 'En el SRS' },
          { clave: 'a2', cabecera: 'En la arquitectura' },
        ]}
        filas={intro.herencia}
      />
      <Rich as="p" className="pull" html={intro.congelado} />
      <Figura d={intro.contexto} comprimido={comprimido} />
    </Section>
  )
}

function Historia({ h }) {
  return (
    <article className="a2-card" id={h.id.toLowerCase()}>
      <header className="a2-head">
        <span className="a2-id">{h.id}</span>
        <h4>{h.titulo}</h4>
        <span className={h.estado === 'Implementada' ? 'flag f-firme' : 'flag f-asum'}>{h.estado}</span>
      </header>
      <p className="a2-frase">
        <b>Como</b> {h.rol}, <b>quiero</b> {h.accion} <b>para</b> {h.beneficio}.
      </p>
      <h5>Criterios de aceptación</h5>
      <ul className="logic">
        {h.criterios.map((c) => <li key={c}>{c}</li>)}
      </ul>
      <h5>Escenario principal</h5>
      <ol className="a2-esc">
        {h.principal.map((p, i) => (
          <li key={i}><span className="a2-quien">{p.quien}</span> {p.paso}</li>
        ))}
      </ol>
      <h5>Escenarios alternos</h5>
      {h.alternos.map((a) => (
        <div key={a.titulo} className="a2-alt">
          <p className="a2-alt-t">{a.titulo}</p>
          <ul className="a2-alt-p">
            {a.pasos.map((p) => <li key={p}>{p}</li>)}
          </ul>
        </div>
      ))}
      <p className="lede">
        Realiza: <R texto={h.realiza} />
        {h.prueba && <> · Prueba: <code>{h.prueba}</code></>}
      </p>
    </article>
  )
}

export function SeccionHistorias({ meta, comprimido }) {
  return (
    <Section meta={meta} comprimido={comprimido}>
      {!comprimido && <Rich as="p" className="lede" html={historias.intro} />}
      <Figura d={{ ...historias.mapa, num: '2.1', realiza: historias.historias.map((h) => h.id).join(', ') }} comprimido={comprimido} />
      <SubTitulo num="2.2" texto="Historias" />
      {historias.historias.map((h) =>
        h.estado === 'Implementada' || !comprimido
          ? <Historia key={h.id} h={h} />
          : (
            <Plegable key={h.id} titulo={`${h.id} · ${h.titulo} · ${h.estado}`} comprimido>
              <Historia h={h} />
            </Plegable>
          ),
      )}
    </Section>
  )
}

export function SeccionMicroservicios({ meta, comprimido }) {
  const [log1, log2, paquetes, tec1, tec2, entidades] = componentes.diagramas
  return (
    <Section meta={meta} comprimido={comprimido}>
      <SubTitulo num="3.1" texto="Microservicios y responsabilidades" />
      {!comprimido && <Rich as="p" className="lede" html={microservicios.intro} />}
      <DataTable
        ancha
        columnas={[
          { clave: 'id', cabecera: 'ID', ancho: '70px', celda: (m) => <R texto={m.id} /> },
          { clave: 'nombre', cabecera: 'Microservicio', ancho: '240px', celda: (m) => (<><b>{m.nombre}</b><span className="note">{m.responsabilidad}</span></>) },
          { clave: 'dominio', cabecera: 'Dominio · veredicto', ancho: '150px', celda: (m) => (<><R texto={m.dominio} /> · {m.veredicto}</>) },
          { clave: 'historias', cabecera: 'Historias', ancho: '150px', celda: (m) => <R texto={m.historias} /> },
          { clave: 'api', cabecera: 'Interfaces y eventos', celda: (m) => (<><code>{m.api}</code><span className="note">Requiere: {m.depende}</span><span className="note">{m.eventos}</span></>) },
          { clave: 'datos', cabecera: 'Datos propios', ancho: '150px' },
          { clave: 'estado', cabecera: 'Estado', ancho: '170px', celda: (m) => (<>{m.estado}{m.nota && <span className="note">{m.nota}</span>}</>) },
        ]}
        filas={microservicios.filas}
      />
      <Rich as="p" className="lede" html={microservicios.persistencia} />
      <Rich as="p" className="lede" html={componentes.intro} />
      <Figura d={log1} comprimido={comprimido} />
      <Figura d={log2} comprimido={comprimido} />
      <Figura d={paquetes} comprimido={comprimido} />
      <Figura d={tec1} comprimido={comprimido} />
      <Figura d={tec2} comprimido={comprimido} />
      <Plegable titulo="3.3.3 · Tecnología y versión por componente" comprimido={comprimido}>
        {!comprimido && <SubTitulo num="3.3.3" texto="Tecnología y versión por componente" />}
        <DataTable
          columnas={[
            { clave: 'componente', cabecera: 'Componente', ancho: '180px', clase: 'nm' },
            { clave: 'tecnologia', cabecera: 'Tecnología' },
            { clave: 'version', cabecera: 'Versión', ancho: '180px' },
            { clave: 'rol', cabecera: 'Rol' },
          ]}
          filas={componentes.tecnologias}
        />
      </Plegable>
      <Figura d={entidades} comprimido={comprimido} />
    </Section>
  )
}

export function SeccionSecuencias({ meta, comprimido }) {
  return (
    <Section meta={meta} comprimido={comprimido}>
      {!comprimido && <Rich as="p" className="lede" html={secuencias.intro} />}
      {secuencias.secuencias.map((s) => <Figura key={s.id} d={s} comprimido={comprimido} />)}
    </Section>
  )
}

export function SeccionDespliegue({ meta, comprimido }) {
  return (
    <Section meta={meta} comprimido={comprimido}>
      {!comprimido && <Rich as="p" className="lede" html={despliegue.intro} />}
      {despliegue.diagramas.map((d) => <Figura key={d.id} d={d} comprimido={comprimido} />)}
      <SubTitulo num="5.3" texto="Conectores: protocolo, formato y autenticación" />
      <DataTable
        ancha
        columnas={[
          { clave: 'origen', cabecera: 'Origen', ancho: '130px', clase: 'nm' },
          { clave: 'destino', cabecera: 'Destino', ancho: '130px', clase: 'nm' },
          { clave: 'protocolo', cabecera: 'Protocolo' },
          { clave: 'formato', cabecera: 'Formato' },
          { clave: 'autenticacion', cabecera: 'Autenticación' },
          { clave: 'modo', cabecera: 'Modo', ancho: '90px' },
          { clave: 'estado', cabecera: 'Estado', ancho: '90px' },
        ]}
        filas={despliegue.conectores}
      />
    </Section>
  )
}

const EV = { Cumple: 'ev ev-c', Parcial: 'ev ev-p', 'No cumple': 'ev ev-n' }
const atributo = Object.fromEntries(rnf.requerimientos.map((r) => [r.id, r.atributo]))
const nombreCriterio = (c) => (atributo[c] ? `${c} · ${atributo[c]}` : c)

function Decision({ ad, comprimido }) {
  const filas = ad.criterios.map((c, j) => ({ criterio: c, eval: ad.alternativas.map((a) => a.eval[j]) }))
  return (
    <article className="a2-card" id={ad.id.toLowerCase()}>
      <header className="a2-head">
        <span className="a2-id">{ad.id}</span>
        <h4>{ad.titulo}</h4>
      </header>
      <Rich as="p" className="pull" html={ad.decision} />
      <Plegable titulo={`${ad.id} · Ver la decisión completa`} comprimido={comprimido}>
        <h5>Impactos e implicaciones</h5>
        <ul className="logic">{ad.impactos.map((x) => <li key={x}>{x}</li>)}</ul>
        <dl className="a2-dl">
          <div><dt>Problema</dt><dd>{ad.problema}</dd></div>
          <div><dt>Contexto</dt><dd><R texto={ad.contexto} /></dd></div>
          <div><dt>Alcance</dt><dd>{ad.alcance}</dd></div>
          <div><dt>Restricciones</dt><dd><ul>{ad.restricciones.map((x) => <li key={x}><R texto={x} /></li>)}</ul></dd></div>
          <div><dt>Supuestos</dt><dd><ul>{ad.supuestos.map((x) => <li key={x}>{x}</li>)}</ul></dd></div>
        </dl>
        <h5>Arquitectura de la solución</h5>
        <Rich as="p" html={ad.solucion} />
        {ad.matriz && (
          <DataTable
            columnas={[
              { clave: 'clase', cabecera: 'Clase de componente', ancho: '170px', clase: 'nm' },
              { clave: 'modelo', cabecera: 'Modelo' },
              { clave: 'motivo', cabecera: 'Motivo', celda: (f) => <R texto={f.motivo} /> },
            ]}
            filas={ad.matriz}
          />
        )}
        <h5>Análisis comparativo</h5>
        <DataTable
          ancha
          columnas={[
            { clave: 'criterio', cabecera: 'Criterio', ancho: '150px', clase: 'nm', celda: (f) => <R texto={nombreCriterio(f.criterio)} /> },
            ...ad.alternativas.map((a, i) => ({
              clave: `a${i}`,
              cabecera: a.elegida ? `${a.nombre} · elegida` : a.nombre,
              celda: (f) => (<><span className={EV[f.eval[i][0]]}>{f.eval[i][0]}</span><span className="note">{f.eval[i][1]}</span></>),
            })),
          ]}
          filas={filas}
        />
        <h5>Justificación</h5>
        <Rich as="p" html={ad.justificacion} />
        <dl className="a2-dl">
          <div><dt>Consenso</dt><dd>{ad.consenso}</dd></div>
          <div><dt>Disenso</dt><dd>{ad.disenso}</dd></div>
        </dl>
      </Plegable>
      <p className="lede">Decisiones relacionadas: <R texto={ad.relacionadas.join(', ')} /></p>
    </article>
  )
}

export function SeccionDecisiones({ meta, comprimido }) {
  return (
    <Section meta={meta} comprimido={comprimido}>
      {!comprimido && <Rich as="p" className="lede" html={decisiones.intro} />}
      {decisiones.grupos.map((g) => (
        <div key={g.num}>
          <SubTitulo num={g.num} texto={g.titulo} />
          {g.decisiones.map((ad) => <Decision key={ad.id} ad={ad} comprimido={comprimido} />)}
        </div>
      ))}
    </Section>
  )
}

export function SeccionImplementacion({ meta, comprimido }) {
  return (
    <Section meta={meta} comprimido={comprimido}>
      <Rich as="p" className="lede" html={implementacion.intro} />
      <SubTitulo num="7.1" texto="Operaciones implementadas" />
      <DataTable
        columnas={[
          { clave: 'hu', cabecera: 'Historia', ancho: '80px', celda: (o) => <R texto={o.hu} /> },
          { clave: 'operacion', cabecera: 'Operación', ancho: '170px', clase: 'nm' },
          { clave: 'endpoints', cabecera: 'Endpoints', celda: (o) => <code>{o.endpoints}</code> },
          { clave: 'prueba', cabecera: 'Prueba', celda: (o) => <code>{o.prueba}</code> },
        ]}
        filas={implementacion.operaciones}
      />
      <SubTitulo num="7.2" texto="Cómo se levanta" />
      <ol className="a2-esc">
        {implementacion.correr.map((p) => <Rich key={p} as="li" html={p} />)}
      </ol>
      <SubTitulo num="7.3" texto="Estado y evidencia" />
      <DataTable
        columnas={[
          { clave: 'item', cabecera: 'Verificación', ancho: '260px', clase: 'nm' },
          { clave: 'valor', cabecera: 'Resultado', celda: (f) => <Rich html={f.valor} /> },
        ]}
        filas={implementacion.estado}
      />
      <SubTitulo num="7.4" texto="Evidencia visual" />
      <Rich as="p" className="lede" html={implementacion.evidencia.intro} />
      <div className="a2-evidencias">
        {implementacion.evidencia.capturas.map((c, i) => (
          <figure key={c.archivo}>
            <img src={`${BASE}arquitectura/evidencias/${c.archivo}`} alt={`${c.titulo}: captura del operador en ejecución`} loading="lazy" />
            <figcaption>{i + 1} · {c.titulo} (<R texto={c.hu} />)</figcaption>
          </figure>
        ))}
      </div>
      <SubTitulo num="7.5" texto="Fuera del prototipo" />
      <ul className="logic">
        {implementacion.pendientes.map((p) => <li key={p}><R texto={p} /></li>)}
      </ul>
    </Section>
  )
}
