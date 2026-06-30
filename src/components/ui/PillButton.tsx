import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { tapSpring } from '@/components/motion/presets'

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
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-full px-6 py-3 font-semibold text-base min-h-[44px] ${variants[variant]} ${disabled ? 'opacity-50' : ''} ${className}`}
      {...tapSpring}
    >
      {children}
    </motion.button>
  )
}
