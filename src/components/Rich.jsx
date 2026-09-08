// Renderiza el marcado ligero que traen los JSON (<b>, <i>, <code>).
// El contenido es nuestro y vive en el repo, no viene de fuera.
export default function Rich({ as: Tag = 'span', html, ...rest }) {
  return <Tag {...rest} dangerouslySetInnerHTML={{ __html: html }} />
}
