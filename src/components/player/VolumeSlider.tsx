interface VolumeSliderProps {
  value: number
  onChange: (v: number) => void
  compact?: boolean
  className?: string
}

export function VolumeSlider({ value, onChange, compact, className = '' }: VolumeSliderProps) {
  const pct = Math.min(100, value * 100)
  const trackH = compact ? 'h-2' : 'h-3'
  const thumbSize = compact ? 12 : 16
  const widthClass = compact && !className.includes('w-') ? 'w-[148px]' : ''

  return (
    <div className={`flex items-center gap-1.5 ${widthClass} ${className}`}>
      <svg
        width={compact ? 14 : 20}
        height={compact ? 14 : 20}
        viewBox="0 0 24 24"
        fill="none"
        className="shrink-0 text-pink-500"
        aria-hidden
      >
        <path
          d="M11 5L6 9H3v6h3l5 4V5z"
          fill="currentColor"
          opacity={value > 0 ? 1 : 0.35}
        />
        {value > 0.25 && (
          <path
            d="M15.5 8.5a5 5 0 010 7"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        )}
        {value > 0.55 && (
          <path
            d="M18 6a8.5 8.5 0 010 12"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        )}
      </svg>
      <div className={`relative flex-1 min-w-0 rounded-full bg-blush-100/80 overflow-hidden shadow-inner ${trackH}`}>
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-pink-300 via-pink-400 to-pink-500 transition-[width] duration-100"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="audio-progress-input absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="Громкость"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 rounded-full bg-white border-2 border-pink-400 shadow-glow pointer-events-none transition-[left] duration-100"
          style={{
            width: thumbSize,
            height: thumbSize,
            left: `calc(${pct}% - ${thumbSize / 2}px)`,
          }}
        />
      </div>
    </div>
  )
}
