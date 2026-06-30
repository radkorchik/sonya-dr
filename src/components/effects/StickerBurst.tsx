import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { STICKERS, type StickerKey } from '@/lib/stickers'

const BURST_KEYS = Object.keys(STICKERS) as StickerKey[]

interface Particle {
  id: number
  key: StickerKey
  angle: number
  distance: number
  rotation: number
  size: number
  ox: number
  oy: number
}

interface StickerBurstProps {
  trigger: number
  origin?: { x: number; y: number }
}

let nextId = 0

export function StickerBurst({ trigger, origin }: StickerBurstProps) {
  const [particles, setParticles] = useState<Particle[]>([])
  const ox = origin?.x ?? 0
  const oy = origin?.y ?? 0

  useEffect(() => {
    if (trigger === 0) return
    const count = 14
    const batch: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: ++nextId,
      key: BURST_KEYS[Math.floor(Math.random() * BURST_KEYS.length)],
      angle: (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 1.2,
      distance: 70 + Math.random() * 160,
      rotation: Math.random() * 360,
      size: 18 + Math.random() * 28,
      ox,
      oy,
    }))
    setParticles(prev => [...prev, ...batch])
  }, [trigger, ox, oy])

  const removeParticle = (id: number) => {
    setParticles(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible z-10">
      <AnimatePresence>
        {particles.map(p => (
          <motion.img
            key={p.id}
            src={STICKERS[p.key]}
            alt=""
            initial={{ x: p.ox, y: p.oy, scale: 0, opacity: 1, rotate: 0 }}
            animate={{
              x: p.ox + Math.cos(p.angle) * p.distance,
              y: p.oy + Math.sin(p.angle) * p.distance,
              scale: [0, 1.2, 0.7],
              opacity: [1, 1, 0],
              rotate: p.rotation,
            }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
            onAnimationComplete={() => removeParticle(p.id)}
            className="absolute object-contain"
            style={{ width: p.size, height: p.size, left: 0, top: 0 }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
