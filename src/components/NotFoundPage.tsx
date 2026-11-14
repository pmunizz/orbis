import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="not-found">
      <span className="eyebrow">OPS, ESSA PÁGINA NÃO EXISTE</span>
      <h1>Vamos encontrar<br />o caminho de volta.</h1>
      <Link className="button button-primary" to="/">Ir para o início <ArrowRight size={16} /></Link>
    </div>
  )
}
