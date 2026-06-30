import { useRef, useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { Volume2, VolumeX } from 'lucide-react'
import { tapSpring } from '@/components/motion/presets'

interface VolumeSliderProps {
  value: number
  onChange: (v: number) => void
  compact?: boolean
  className?: string
}

export function VolumeSlider({ value, onChange, compact, className = '' }: VolumeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const [localPct, setLocalPct] = useState<number | null>(null)
  const [prevVolume, setPrevVolume] = useState(0.85)
  const muted = value <= 0.001

  const pct = localPct ?? Math.min(100, value * 100)
  const trackH = compact ? 'h-2.5' : 'h-3'
  const thumbSize = compact ? 14 : 18
  const iconSize = compact ? 22 : 24

  const setFromClientX = useCallback((clientX: number) => {
    const track = trackRef.current
    if (!track) return
    const rect = track.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const next = Math.round(ratio * 100) / 100
    setLocalPct(ratio * 100)
    onChange(next)
  }, [onChange])

  const onPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation()
    dragging.current = true
    trackRef.current?.setPointerCapture(e.pointerId)
    setFromClientX(e.clientX)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return
    e.stopPropagation()
    setFromClientX(e.clientX)
  }

  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragging.current) return
    dragging.current = false
    setLocalPct(null)
    trackRef.current?.releasePointerCapture(e.pointerId)
  }

  const toggleMute = () => {
    if (muted) {
      const restore = prevVolume > 0 ? prevVolume : 0.85
      onChange(restore)
    } else {
      setPrevVolume(value)
      onChange(0)
    }
  }

  const widthClass = compact && !className.includes('w-') ? 'w-[72px]' : ''

  return (
    <div
      className={`flex items-center gap-1 ${widthClass} ${className}`}
      onPointerDown={e => e.stopPropagation()}
      onTouchStart={e => e.stopPropagation()}
    >
      <motion.button
        type="button"
        onClick={toggleMute}
        className="shrink-0 p-1 rounded-full text-pink-500 touch-manipulation"
        aria-label={muted ? 'Включить звук' : 'Выключить звук'}
        whileTap={tapSpring.whileTap}
        animate={{ scale: muted ? 0.92 : 1, opacity: muted ? 0.55 : 1 }}
        transition={{ type: 'spring', stiffness: 480, damping: 26 }}
      >
        {muted ? <VolumeX size={iconSize} /> : <Volume2 size={iconSize} />}
      </motion.button>

      <div
        ref={trackRef}
        className={`relative flex-1 min-w-0 rounded-full bg-blush-100/80 overflow-visible shadow-inner touch-none ${trackH}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="slider"
        aria-label="Громкость"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-pink-300 via-pink-400 to-pink-500"
          style={{ width: `${pct}%`, transition: dragging.current ? 'none' : 'width 80ms linear' }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 rounded-full bg-white border-2 border-pink-400 shadow-glow pointer-events-none"
          style={{
            width: thumbSize,
            height: thumbSize,
            left: `calc(${pct}% - ${thumbSize / 2}px)`,
            transition: dragging.current ? 'none' : 'left 80ms linear',
          }}
        />
      </div>
    </div>
  )
}
