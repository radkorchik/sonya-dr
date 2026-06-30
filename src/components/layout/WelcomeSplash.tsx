import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getComplimentsPool } from '@/data/content'
import { fillPlaceholders } from '@/lib/placeholders'
import { STICKERS, type StickerKey } from '@/lib/stickers'

const STICKER_KEYS = Object.keys(STICKERS) as StickerKey[]

function pickRandomCompliment() {
  const pool = getComplimentsPool()
  const text = pool[Math.floor(Math.random() * pool.length)] ?? pool[0] ?? 'Ты прекрасна!'
  return fillPlaceholders(text, String(Math.random()))
}

function pickRandomSticker(): StickerKey {
  return STICKER_KEYS[Math.floor(Math.random() * STICKER_KEYS.length)]
}

export function WelcomeSplash({ onDone }: { onDone: () => void }) {
  const [visible, setVisible] = useState(true)
  const [phase, setPhase] = useState<'in' | 'out'>('in')
  const { compliment, sticker } = useMemo(() => ({
    compliment: pickRandomCompliment(),
    sticker: pickRandomSticker(),
  }), [])

  useEffect(() => {
    const hold = setTimeout(() => setPhase('out'), 2800)
    const finish = setTimeout(() => {
      setVisible(false)
      onDone()
    }, 3800)
    return () => { clearTimeout(hold); clearTimeout(finish) }
  }, [onDone])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === 'in' ? 1 : 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
          className="fixed inset-0 z-[200] flex items-center justify-center px-8"
          style={{
            background: 'rgba(255, 232, 242, 0.72)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{
              opacity: phase === 'in' ? 1 : 0,
              y: phase === 'in' ? 0 : -20,
              scale: phase === 'in' ? 1 : 0.96,
            }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center max-w-sm"
          >
            <p className="font-script text-4xl text-pink-500 mb-3 leading-tight">
              Привет, Сонечка!
            </p>
            <p className="font-display text-lg text-ink-700 leading-relaxed">
              {compliment}
            </p>
            <motion.img
              src={STICKERS[sticker]}
              alt=""
              className="w-16 h-16 mx-auto mt-4 object-contain"
              animate={{
                y: [0, -10, 0],
                rotate: [-6, 6, -6],
                scale: [1, 1.08, 1],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
