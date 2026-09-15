import { Composition } from 'remotion'
import { Operacion, duracion, FPS } from './Operacion'
import datos from '../src/arquitectura/content/secuencias.json'

// Una composición por secuencia de A2: Operacion-registro, -login, -carga, -autenticacion.
export const Root = () => (
  <>
    {datos.secuencias.map((s) => (
      <Composition
        key={s.id}
        id={`Operacion-${s.id.replace('secuencia-', '')}`}
        component={Operacion}
        durationInFrames={duracion(s)}
        fps={FPS}
        width={1280}
        height={720}
        defaultProps={{ id: s.id }}
      />
    ))}
  </>
)
