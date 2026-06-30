import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Pause, SkipBack, SkipForward, X } from 'lucide-react'
import { motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion'
import type { PlayerApi } from '@/components/player/PlayerContext'
import { VolumeSlider } from '@/components/player/VolumeSlider'
import { tapSpring } from '@/components/motion/presets'

function fmt(s: number): string {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export function MiniPlayerBar({ api }: { api: PlayerApi }) {
  const navigate = useNavigate()
  const { tale, playing, current, duration, volume } = api
  const leftTapRef = useRef(0)
  const dragY = useMotionValue(0)
  const opacity = useTransform(dragY, [0, 80], [1, 0.25])

  if (!tale) return null

  const pct = duration > 0 ? (current / duration) * 100 : 0

  const handleLeft = () => {
    const now = Date.now()
    if (now - leftTapRef.current < 400) {
      api.prevTale()
      leftTapRef.current = 0
      return
    }
    leftTapRef.current = now
    setTimeout(() => {
      if (leftTapRef.current === now) api.restart()
    }, 420)
  }

  const dismiss = () => api.stop()

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 55 || info.velocity.y > 300) dismiss()
    else dragY.set(0)
  }

  return (
    <div
      className="fixed left-0 right-0 z-40 px-3 pointer-events-none"
      style={{ bottom: 'calc(5.25rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <motion.div
        style={{ y: dragY, opacity }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 100 }}
        dragElastic={0.12}
        onDragEnd={onDragEnd}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        className="max-w-lg mx-auto glass rounded-2xl shadow-soft overflow-hidden pointer-events-auto touch-pan-y"
      >
        <div className="relative h-0.5 bg-blush-100">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-300 to-pink-500 transition-[width] duration-200"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="relative px-2 py-1.5 min-h-[44px]">
          <div className="flex items-center gap-1.5 pr-[72px]">
            <motion.button type="button" onClick={() => navigate(`/tales/${tale.id}`)} className="shrink-0" {...tapSpring}>
              {tale.coverUrl ? (
                <img src={tale.coverUrl} alt="" className="w-9 h-9 rounded-lg object-cover" />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-blush-100" />
              )}
            </motion.button>

            <motion.button
              type="button"
              onClick={() => navigate(`/tales/${tale.id}`)}
              className="min-w-0 text-left py-0.5"
              {...tapSpring}
            >
              <p className="text-xs font-semibold text-ink-900 truncate leading-tight max-w-[120px]">{tale.title}</p>
              <p className="text-[10px] text-ink-500 tabular-nums leading-tight">
                {fmt(current)} / {fmt(duration || tale.durationSec)}
              </p>
            </motion.button>
          </div>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-0.5">
            <motion.button type="button" onClick={handleLeft} className="p-1 text-ink-500" aria-label="Назад" {...tapSpring}>
              <SkipBack size={15} />
            </motion.button>
            <motion.button
              type="button"
              onClick={api.toggle}
              className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center"
              aria-label={playing ? 'Пауза' : 'Играть'}
              {...tapSpring}
            >
              {playing ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
            </motion.button>
            <motion.button type="button" onClick={api.nextTale} className="p-1 text-ink-500" aria-label="Далее" {...tapSpring}>
              <SkipForward size={15} />
            </motion.button>
          </div>

          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
            <div className="w-[60px]" onClick={e => e.stopPropagation()}>
              <VolumeSlider compact value={volume} onChange={api.setVolume} className="!w-[60px]" />
            </div>
            <motion.button type="button" onClick={dismiss} className="p-1 text-ink-400" aria-label="Закрыть" {...tapSpring}>
              <X size={14} />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
