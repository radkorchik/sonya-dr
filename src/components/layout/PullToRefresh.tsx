import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface PullToRefreshProps {
  children: ReactNode
  scrollRef: RefObject<HTMLElement | null>
}

const TRIGGER = 112
const SHOW_AFTER = 28
const MAX_PULL = 140

export function PullToRefresh({ children, scrollRef }: PullToRefreshProps) {
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
    const el = scrollRef.current
    if (!el) return

    const atTop = () => el.scrollTop <= 1

    const onStart = (e: TouchEvent) => {
      if (refreshingRef.current || !atTop()) return
      const touch = e.touches[0]
      const rect = el.getBoundingClientRect()
      if (touch.clientY - rect.top > 96) return
      startY.current = touch.clientY
      active.current = true
    }

    const onMove = (e: TouchEvent) => {
      if (!active.current || refreshingRef.current) return
      const dy = e.touches[0].clientY - startY.current
      if (dy <= 0 || !atTop()) {
        pullRef.current = 0
        setPull(0)
        active.current = false
        return
      }
      const next = Math.min(MAX_PULL, dy * 0.32)
      pullRef.current = next
      setPull(next)
    }

    const onEnd = () => {
      if (!active.current) return
      active.current = false
      const current = pullRef.current
      pullRef.current = 0
      if (current >= TRIGGER && !refreshingRef.current) {
        setRefreshing(true)
        setPull(TRIGGER * 0.6)
        window.setTimeout(() => window.location.reload(), 350)
        return
      }
      setPull(0)
    }

    el.addEventListener('touchstart', onStart, { passive: true })
    el.addEventListener('touchmove', onMove, { passive: true })
    el.addEventListener('touchend', onEnd, { passive: true })
    el.addEventListener('touchcancel', onEnd, { passive: true })
    return () => {
      el.removeEventListener('touchstart', onStart)
      el.removeEventListener('touchmove', onMove)
      el.removeEventListener('touchend', onEnd)
      el.removeEventListener('touchcancel', onEnd)
    }
  }, [scrollRef])

  const progress = Math.min(1, pull / TRIGGER)
  const ready = progress >= 1

  return (
    <>
      <AnimatePresence>
        {(pull > SHOW_AFTER || refreshing) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            className="fixed left-0 right-0 z-[60] flex justify-center pointer-events-none px-4"
            style={{ top: 'max(calc(env(safe-area-inset-top) + 8px), 16px)' }}
          >
            <div
              className={`glass rounded-2xl px-4 py-2.5 shadow-soft flex items-center gap-3 transition-colors duration-200 ${ready ? 'ring-2 ring-pink-400/60' : ''}`}
            >
              <div className="relative w-9 h-9 shrink-0">
                <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36" aria-hidden>
                  <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,182,206,0.35)" strokeWidth="3" />
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    stroke="#f472b6"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${progress * 94} 94`}
                  />
                </svg>
                <motion.span
                  className="absolute inset-0 flex items-center justify-center text-pink-500 text-sm font-bold"
                  animate={{ rotate: refreshing ? 360 : 0 }}
                  transition={refreshing ? { repeat: Infinity, duration: 0.9, ease: 'linear' } : { duration: 0.15 }}
                >
                  ↻
                </motion.span>
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-ink-900">
                  {refreshing ? 'Обновляю…' : ready ? 'Отпусти, чтобы обновить' : 'Потяни сильнее'}
                </p>
                <p className="text-[10px] text-ink-500 mt-0.5">
                  {ready ? 'Готово' : `${Math.round(progress * 100)}%`}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  )
}
