import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { popIn, tapSpring } from '@/components/motion/presets'

interface GlassCardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  pink?: boolean
  animate?: boolean
}

export function GlassCard({ children, className = '', onClick, pink, animate = true }: GlassCardProps) {
  const base = pink ? 'glass-pink' : 'glass'
  const motionAnim = animate ? { initial: popIn.initial, animate: popIn.animate, transition: popIn.transition } : {}

  if (onClick) {
    return (
      <motion.button
        type="button"
        className={`${base} rounded-2xl p-4 cursor-pointer text-left w-full ${className}`}
        onClick={onClick}
        {...motionAnim}
        whileTap={tapSpring.whileTap}
      >
        {children}
      </motion.button>
    )
  }
  return (
    <motion.div className={`${base} rounded-2xl p-4 ${className}`} {...motionAnim}>
      {children}
    </motion.div>
  )
}
