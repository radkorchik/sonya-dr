import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface PullToRefreshProps {
  children: ReactNode
}

const THRESHOLD = 68

export function PullToRefresh({ children }: PullToRefreshProps) {
  const [pull, setPull] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startY = useRef(0)
  const active = useRef(false)
  const pullRef = useRef(0)
  const refreshingRef = useRef(false)

  useEffect(() => {
    refreshingRef.current = refreshing
  }, [refreshing])

  useEffect(() => {
    const atTop = () => window.scrollY <= 1

    const onStart = (e: TouchEvent) => {
      if (refreshingRef.current || !atTop()) return
      startY.current = e.touches[0].clientY
      active.current = true
    }

    const onMove = (e: TouchEvent) => {
      if (!active.current || refreshingRef.current) return
      const dy = e.touches[0].clientY - startY.current
      if (dy <= 0 || !atTop()) {
        pullRef.current = 0
        setPull(0)
        return
      }
      const next = Math.min(96, dy * 0.42)
      pullRef.current = next
      setPull(next)
    }

    const onEnd = () => {
      if (!active.current) return
      active.current = false
      const current = pullRef.current
      pullRef.current = 0
      setPull(0)
      if (current >= THRESHOLD) {
        setRefreshing(true)
        window.location.reload()
      }
    }

    document.addEventListener('touchstart', onStart, { passive: true })
    document.addEventListener('touchmove', onMove, { passive: true })
    document.addEventListener('touchend', onEnd, { passive: true })
    document.addEventListener('touchcancel', onEnd, { passive: true })
    return () => {
      document.removeEventListener('touchstart', onStart)
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend', onEnd)
      document.removeEventListener('touchcancel', onEnd)
    }
  }, [])

  const progress = Math.min(1, pull / THRESHOLD)

  return (
    <>
      <AnimatePresence>
        {(pull > 8 || refreshing) && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="fixed left-0 right-0 z-[60] flex justify-center pointer-events-none"
            style={{ top: 'max(env(safe-area-inset-top), 10px)' }}
          >
            <div className="glass rounded-full px-3 py-1.5 text-xs font-semibold text-pink-500 shadow-soft flex items-center gap-2">
              <motion.span
                animate={{ rotate: refreshing ? 360 : progress * 180 }}
                transition={refreshing ? { repeat: Infinity, duration: 0.8, ease: 'linear' } : { duration: 0.1 }}
                className="inline-block"
              >
                ↻
              </motion.span>
              {refreshing ? 'Обновляю…' : progress >= 1 ? 'Отпусти' : 'Потяни вниз'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  )
}
