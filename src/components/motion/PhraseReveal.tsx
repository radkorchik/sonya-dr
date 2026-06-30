import { motion, AnimatePresence } from 'framer-motion'
import type { ReactNode } from 'react'
import { popIn } from './presets'

interface PhraseRevealProps {
  text: string
  className?: string
  children?: ReactNode
}

export function PhraseReveal({ text, className = '', children }: PhraseRevealProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={text}
        className={className}
        initial={{ opacity: 0, y: 18, scale: 0.94, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -10, scale: 0.97, filter: 'blur(2px)' }}
        transition={{ type: 'spring', stiffness: 360, damping: 28 }}
      >
        {children ?? text}
      </motion.div>
    </AnimatePresence>
  )
}

export function PhraseRevealCard({ text, children }: { text: string; children: ReactNode }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={text}
        {...popIn}
        transition={{ type: 'spring', stiffness: 340, damping: 26 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
