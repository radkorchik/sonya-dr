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
  const max = Math.max(duration, 1)
  const pct = Math.min(100, (current / max) * 100)

  return (
    <div className="mb-5">
      <div className="flex justify-between text-xs text-ink-500 mb-2 px-1 tabular-nums">
        <span>{fmt(current)}</span>
        <span>{fmt(duration)}</span>
      </div>
      <div className="relative h-3 rounded-full bg-blush-100/80 overflow-hidden shadow-inner">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-pink-300 via-pink-400 to-pink-500 transition-[width] duration-100 ease-linear"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={0}
          max={max}
          step={0.1}
          value={current}
          onChange={e => onSeek(Number(e.target.value))}
          className="audio-progress-input absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="Прогресс воспроизведения"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2 border-pink-400 shadow-glow pointer-events-none transition-[left] duration-100"
          style={{ left: `calc(${pct}% - 10px)` }}
        />
      </div>
    </div>
  )
}
