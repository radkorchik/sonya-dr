import { useRef, useCallback, useState } from 'react'

interface AudioProgressProps {
  current: number
  duration: number
  onSeek: (sec: number) => void
}

function fmt(s: number): string {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export function AudioProgress({ current, duration, onSeek }: AudioProgressProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const [localPct, setLocalPct] = useState<number | null>(null)

  const max = Math.max(duration, 1)
  const pct = localPct ?? Math.min(100, (current / max) * 100)
  const thumbSize = 20

  const setFromClientX = useCallback((clientX: number) => {
    const track = trackRef.current
    if (!track) return
    const rect = track.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const sec = Math.round(ratio * max * 10) / 10
    setLocalPct(ratio * 100)
    onSeek(sec)
  }, [max, onSeek])

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true
    trackRef.current?.setPointerCapture(e.pointerId)
    setFromClientX(e.clientX)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return
    setFromClientX(e.clientX)
  }

  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragging.current) return
    dragging.current = false
    setLocalPct(null)
    trackRef.current?.releasePointerCapture(e.pointerId)
  }

  return (
    <div className="mb-5">
      <div className="flex justify-between text-xs text-ink-500 mb-2 px-1 tabular-nums">
        <span>{fmt(current)}</span>
        <span>{fmt(duration)}</span>
      </div>
      <div
        ref={trackRef}
        className="relative h-3 rounded-full bg-blush-100/80 overflow-visible shadow-inner touch-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="slider"
        aria-label="Прогресс воспроизведения"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={Math.round(current)}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-pink-300 via-pink-400 to-pink-500 pointer-events-none"
          style={{
            width: `${pct}%`,
            transition: dragging.current ? 'none' : 'width 80ms linear',
          }}
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
