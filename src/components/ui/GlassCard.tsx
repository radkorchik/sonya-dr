import type { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  pink?: boolean
}

export function GlassCard({ children, className = '', onClick, pink }: GlassCardProps) {
  const base = pink ? 'glass-pink' : 'glass'
  if (onClick) {
    return (
      <button
        type="button"
        className={`${base} rounded-2xl p-4 cursor-pointer text-left w-full active:scale-[0.98] transition-transform duration-150 ${className}`}
        onClick={onClick}
      >
        {children}
      </button>
    )
  }
  return (
    <div className={`${base} rounded-2xl p-4 ${className}`}>
      {children}
    </div>
  )
}
