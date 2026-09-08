export default function Nota({ children }) {
  if (!children) return null
  return <span className="note">{children}</span>
}
