import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { motion } from 'framer-motion'
import { tapSpring, popIn } from '@/components/motion/presets'

interface MediaViewerProps {
  src: string
  alt?: string
  onClose: () => void
}

function lockScroll() {
  const scrollEl = document.querySelector('.app-scroll') as HTMLElement | null
  const top = scrollEl?.scrollTop ?? window.scrollY
  document.body.dataset.viewerScroll = String(top)
  document.body.style.overflow = 'hidden'
  if (scrollEl) scrollEl.style.overflow = 'hidden'
  return () => {
    const saved = Number(document.body.dataset.viewerScroll ?? 0)
    delete document.body.dataset.viewerScroll
    document.body.style.overflow = ''
    if (scrollEl) {
      scrollEl.style.overflow = ''
      scrollEl.scrollTop = saved
    }
  }
}

export function MediaViewer({ src, alt = '', onClose }: MediaViewerProps) {
  const unlockRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    unlockRef.current = lockScroll()
    return () => {
      document.removeEventListener('keydown', onKey)
      unlockRef.current?.()
    }
  }, [onClose])

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28 }}
      className="fixed inset-0 z-[300] touch-none overscroll-none overflow-hidden"
      style={{ background: 'rgba(45, 28, 38, 0.9)' }}
      onClick={onClose}
    >
      <div
        className="pointer-events-none absolute -top-24 left-0 right-0 h-24"
        style={{ background: 'rgba(45, 28, 38, 0.9)' }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 left-0 right-0 h-24"
        style={{ background: 'rgba(45, 28, 38, 0.9)' }}
        aria-hidden
      />

      <div
        className="absolute inset-0 flex flex-col items-center justify-center px-4"
        style={{
          paddingTop: 'max(env(safe-area-inset-top), 16px)',
          paddingBottom: 'max(env(safe-area-inset-bottom), 16px)',
        }}
      >
        <motion.img
          {...popIn}
          src={src}
          alt={alt}
          draggable={false}
          className="max-w-full max-h-[min(72dvh,640px)] rounded-2xl object-contain shadow-soft select-none"
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
      </div>
    </motion.div>,
    document.body,
  )
}
