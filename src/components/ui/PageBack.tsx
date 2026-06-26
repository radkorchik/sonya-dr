import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export function PageBack({ to = '/' }: { to?: string }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1 text-ink-500 mb-4 min-h-[44px] self-start"
    >
      <ArrowLeft size={18} />
      <span>Назад</span>
    </Link>
  )
}
