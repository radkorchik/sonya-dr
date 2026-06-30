import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { motion } from 'framer-motion'
import { tapSpring, popIn } from '@/components/motion/presets'

interface MediaViewerProps {
  src: string
  alt?: string
  onClose: () => void
}

export function MediaViewer({ src, alt = '', onClose }: MediaViewerProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28 }}
        className="fixed inset-0 z-[300] flex flex-col items-center justify-center px-4 pt-[max(env(safe-area-inset-top),12px)]"
        style={{
          minHeight: '100dvh',
          height: '100dvh',
          background: 'rgba(45, 28, 38, 0.78)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          paddingBottom: 'calc(5.5rem + env(safe-area-inset-bottom, 0px))',
        }}
        onClick={onClose}
      >
        <motion.img
          {...popIn}
          src={src}
          alt={alt}
          className="max-w-full max-h-[min(calc(100dvh-11rem),640px)] rounded-2xl object-contain shadow-soft"
          onClick={e => e.stopPropagation()}
        />
        <motion.button
          type="button"
          onClick={onClose}
          className="mt-4 glass rounded-full px-5 py-2 text-sm font-semibold text-ink-700 flex items-center gap-2"
          aria-label="Закрыть"
          initial={popIn.initial}
          animate={popIn.animate}
          transition={{ ...popIn.transition, delay: 0.06 }}
          whileTap={tapSpring.whileTap}
        >
          <X size={16} />
          Закрыть
        </motion.button>
    </motion.div>,
    document.body,
  )
}
