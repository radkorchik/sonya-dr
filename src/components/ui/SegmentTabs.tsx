import { motion } from 'framer-motion'

interface SegmentTabsProps<T extends string> {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}

export function SegmentTabs<T extends string>({ options, value, onChange }: SegmentTabsProps<T>) {
  const idx = options.findIndex(o => o.value === value)

  return (
    <div className="relative w-full rounded-full bg-white/40 backdrop-blur-md p-1 mb-4">
      <motion.div
        className="absolute top-1 bottom-1 rounded-full bg-pink-500 shadow-soft"
        layout
        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
        style={{
          width: `calc((100% - 8px) / ${options.length})`,
          left: `calc(4px + ${idx} * ((100% - 8px) / ${options.length}))`,
        }}
      />
      <div className="relative grid" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
        {options.map(o => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`relative z-10 py-2.5 text-sm font-medium transition-colors duration-200 rounded-full ${
              value === o.value ? 'text-white' : 'text-ink-600'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}
