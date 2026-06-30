import { useState, useCallback, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PageBack } from '@/components/ui/PageBack'
import { GlassCard } from '@/components/ui/GlassCard'
import { Sticker } from '@/components/ui/Sticker'
import { stickerSrc } from '@/lib/stickers'
import { StickerBurst } from '@/components/effects/StickerBurst'
import { getMoodsPool } from '@/data/content'
import { pickBySeed } from '@/lib/seed'
import { fillPlaceholders } from '@/lib/placeholders'
import { getMoscowDateKey } from '@/lib/time'
import { lightVibrate } from '@/lib/haptics'
import { playPurr, stopPurr, playRandomMeow } from '@/lib/sounds'
import { FadeIn } from '@/components/motion/FadeIn'

export default function Mood() {
  const location = useLocation()
  const dateKey = getMoscowDateKey()
  const mood = pickBySeed(getMoodsPool(), dateKey)
  const caption = fillPlaceholders(mood.caption, dateKey)
  const [petCount, setPetCount] = useState(0)
  const [pressing, setPressing] = useState(false)
  const [burstOrigin, setBurstOrigin] = useState({ x: 0, y: 0 })
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const entered = useRef(false)

  useEffect(() => {
    if (entered.current) return
    entered.current = true
    playRandomMeow()
    return () => {
      stopPurr()
      if (idleTimer.current) clearTimeout(idleTimer.current)
    }
  }, [])

  useEffect(() => {
    if (location.pathname !== '/mood') stopPurr()
  }, [location.pathname])

  const scheduleIdleMeow = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current)
    idleTimer.current = setTimeout(() => playRandomMeow(), 1500)
  }, [])

  const handlePet = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setBurstOrigin({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    setPetCount(c => c + 1)
    lightVibrate()
    playPurr()
    scheduleIdleMeow()
  }, [scheduleIdleMeow])

  return (
    <div className="page-container flex flex-col">
      <PageBack />
      <div className="flex-1 flex flex-col items-center justify-center text-center px-2 py-4">
        <div className="cat-sway relative mb-6">
          <button
            type="button"
            onClick={handlePet}
            onPointerDown={() => setPressing(true)}
            onPointerUp={() => setPressing(false)}
            onPointerLeave={() => setPressing(false)}
            className="relative touch-manipulation block"
          >
            <div
              className="transition-transform duration-150 ease-out origin-center"
              style={{ transform: pressing ? 'scale(0.93)' : 'scale(1)' }}
            >
              <img
                src={stickerSrc('cat')}
                alt="Котик"
                className="mx-auto drop-shadow-soft w-[min(78vw,340px)] h-auto object-contain select-none pointer-events-none"
                draggable={false}
              />
              <StickerBurst trigger={petCount} origin={burstOrigin} />
              {petCount > 0 && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                  className="absolute -top-2 -right-2"
                >
                  <Sticker name="laceHeart" size={36} />
                </motion.span>
              )}
            </div>
          </button>
        </div>

        <FadeIn delay={0.05}>
          <p className="text-base text-ink-500 mb-3">Сегодня ты котик-{mood.mood}</p>
        </FadeIn>
        <FadeIn delay={0.1}>
          <GlassCard pink className="text-lg w-full max-w-md">{caption}</GlassCard>
        </FadeIn>
        <FadeIn delay={0.15}>
          <p className="text-sm text-ink-500 mt-5 flex items-center justify-center gap-1.5">
            Нажми на котика, чтобы погладить
            <Sticker name="cat" size={20} />
          </p>
        </FadeIn>
      </div>
    </div>
  )
}
