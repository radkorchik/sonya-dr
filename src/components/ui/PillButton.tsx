import type { ReactNode } from 'react'

interface PillButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  className?: string
  disabled?: boolean
  type?: 'button' | 'submit'
}

export function PillButton({
  children, onClick, variant = 'primary', className = '', disabled, type = 'button',
}: PillButtonProps) {
  const variants = {
    primary: 'bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-soft',
    secondary: 'glass text-ink-700',
    ghost: 'bg-transparent text-pink-500',
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-full px-6 py-3 font-semibold text-base min-h-[44px] active:scale-[0.97] transition-transform duration-100 ${variants[variant]} ${disabled ? 'opacity-50' : ''} ${className}`}
    >
      {children}
    </button>
  )
}
