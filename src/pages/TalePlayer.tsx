import { useEffect, useState, useRef } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, Pause, SkipBack, SkipForward, Pencil, Trash2 } from 'lucide-react'
import { getTale, deleteTale, getAllTales, type Tale } from '@/lib/talesApi'
import { getFavorites, getPlayHistory } from '@/lib/localData'
import { GlassCard } from '@/components/ui/GlassCard'
import { PageBack } from '@/components/ui/PageBack'
import { FavoriteButton } from '@/components/ui/FavoriteButton'
import { Sticker } from '@/components/ui/Sticker'
import { AudioProgress } from '@/components/player/AudioProgress'
import { VolumeSlider } from '@/components/player/VolumeSlider'
import { usePlayer, PLAYER_SPEEDS, type PlayerTale, type PlaylistMode } from '@/components/player/PlayerContext'
import { useToastStore } from '@/stores/toastStore'
import { FadeIn } from '@/components/motion/FadeIn'
import { tapSpring } from '@/components/motion/presets'

type NavState = { autoplay?: boolean; playlistMode?: PlaylistMode; fromFavorites?: boolean } | null

function toPlayerTale(t: Tale): PlayerTale {
  return {
    id: t.id,
    title: t.title,
    coverUrl: t.coverUrl,
    audioUrl: t.audioUrl,
    durationSec: t.durationSec,
  }
}

export default function TalePlayer() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const showToast = useToastStore(s => s.show)
  const player = usePlayer()
  const [tale, setTale] = useState<Tale | null>(null)
  const [allTales, setAllTales] = useState<Tale[]>([])
  const [previewSeek, setPreviewSeek] = useState<number | null>(null)
  const [sleepMin, setSleepMin] = useState<number | null>(null)
  const [speedIdx, setSpeedIdx] = useState(() => {
    const idx = PLAYER_SPEEDS.indexOf(player.speed as typeof PLAYER_SPEEDS[number])
    return idx >= 0 ? idx : 1
  })
  const leftTapRef = useRef(0)

  useEffect(() => {
    getAllTales().then(tales => {
      setAllTales(tales)
      player.setTalesList(tales.map(toPlayerTale))
      const favIds = getFavorites().filter(f => f.type === 'tale').map(f => f.itemId)
      const favTales = favIds
        .map(fid => tales.find(t => t.id === fid))
        .filter((t): t is Tale => !!t)
        .map(toPlayerTale)
      player.setFavoritesList(favTales)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!id) return
    setPreviewSeek(null)
    getTale(id).then(t => {
      if (!t) return
      setTale(t)
      const nav = location.state as NavState
      if (nav?.autoplay) {
        const hist = getPlayHistory()[id]
        const seekTo = hist?.positionSec ?? 0
        player.loadTale(toPlayerTale(t), {
          seekTo,
          autoplay: true,
          playlistMode: nav.playlistMode ?? (nav.fromFavorites ? 'favorites' : 'all'),
        })
        navigate(location.pathname, { replace: true, state: nav.fromFavorites ? { fromFavorites: true } : null })
      }
    })
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  const resolvePlaylistMode = (): PlaylistMode => {
    const nav = location.state as NavState
    if (nav?.playlistMode) return nav.playlistMode
    if (nav?.fromFavorites) return 'favorites'
    return 'all'
  }

  const handleToggle = () => {
    if (!tale) return
    if (!player.tale || player.tale.id !== tale.id) {
      const hist = getPlayHistory()[tale.id]
      const seekTo = previewSeek ?? hist?.positionSec ?? 0
      player.loadTale(toPlayerTale(tale), {
        seekTo,
        autoplay: true,
        playlistMode: resolvePlaylistMode(),
      })
      return
    }
    player.toggle()
  }

  useEffect(() => {
    player.setSpeed(PLAYER_SPEEDS[speedIdx])
  }, [speedIdx]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!sleepMin) return
    const deadline = Date.now() + sleepMin * 60 * 1000
    const timer = window.setInterval(() => {
      if (Date.now() >= deadline) {
        player.pause()
        player.disableAutoplay()
        setSleepMin(null)
      }
    }, 500)
    return () => clearInterval(timer)
  }, [sleepMin]) // eslint-disable-line react-hooks/exhaustive-deps

  const goBrowse = (dir: -1 | 1) => {
    if (!tale || allTales.length === 0) return
    const idx = allTales.findIndex(t => t.id === tale.id)
    if (idx < 0) return
    const next = allTales[(idx + dir + allTales.length) % allTales.length]
    const nav = location.state as NavState
    navigate(`/tales/${next.id}`, { state: nav?.fromFavorites ? { fromFavorites: true } : null })
  }

  const handleNext = () => {
    if (player.tale?.id === tale?.id) player.nextTale()
    else goBrowse(1)
  }

  const handlePrev = () => {
    if (player.tale?.id === tale?.id) player.prevTale()
    else goBrowse(-1)
  }

  const handleLeft = () => {
    const now = Date.now()
    if (now - leftTapRef.current < 400) {
      handlePrev()
      leftTapRef.current = 0
      return
    }
    leftTapRef.current = now
    setTimeout(() => {
      if (leftTapRef.current === now) {
        if (player.tale?.id === tale?.id) player.restart()
        else setPreviewSeek(0)
      }
    }, 420)
  }

  const handleSleepTimer = (m: number) => {
    setSleepMin(prev => {
      if (prev === m) {
        showToast('Таймер сна отменён')
        return null
      }
      showToast(`Сказка остановится через ${m} мин`)
      return m
    })
  }

  const handleDelete = async () => {
    if (!tale || !confirm('Удалить сказку?')) return
    if (player.tale?.id === tale.id) player.stop()
    await deleteTale(tale.id)
    showToast('Сказка удалена')
    navigate('/tales')
  }

  if (!tale) {
    return <div className="page-container page-container--fit text-center text-ink-500">Загрузка…</div>
  }

  const isActiveTale = player.tale?.id === tale.id
  const savedPosition = getPlayHistory()[tale.id]?.positionSec ?? 0
  const current = isActiveTale ? player.current : (previewSeek ?? savedPosition)
  const duration = (isActiveTale ? player.duration : null) || tale.durationSec
  const playing = isActiveTale && player.playing

  return (
    <div className="page-container page-container--fit">
      <div className="flex items-center justify-between mb-2">
        <PageBack to="/tales" />
        <div className="flex gap-1">
          <motion.div {...tapSpring}>
            <Link to={`/tales/${tale.id}/edit`} className="glass rounded-full p-2 text-ink-600 inline-flex" aria-label="Редактировать">
              <Pencil size={18} />
            </Link>
          </motion.div>
          <motion.button type="button" onClick={handleDelete} className="glass rounded-full p-2 text-pink-500" aria-label="Удалить" {...tapSpring}>
            <Trash2 size={18} />
          </motion.button>
        </div>
      </div>

      <FadeIn>
        <GlassCard pink className="text-center mb-5 overflow-visible" animate={false}>
          {tale.coverUrl ? (
            <motion.img
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              src={tale.coverUrl}
              alt=""
              className="w-44 h-44 rounded-2xl object-cover mx-auto shadow-soft"
            />
          ) : (
            <Sticker name="envelope" size={100} className="mx-auto" />
          )}
          <h1 className="font-display text-xl font-bold text-ink-900 mt-4 break-words">{tale.title}</h1>
          {tale.description ? (
            <p className="text-sm text-ink-500 mt-2 text-left break-words whitespace-pre-wrap leading-relaxed w-full">
              {tale.description}
            </p>
          ) : null}
        </GlassCard>
      </FadeIn>

      <AudioProgress
        current={current}
        duration={duration}
        onSeek={sec => {
          if (!isActiveTale) {
            setPreviewSeek(sec)
            return
          }
          player.seek(sec)
        }}
      />

      <div className="flex items-center justify-center gap-5 mb-5">
        <motion.button type="button" onClick={handleLeft} className="p-2 text-ink-600" aria-label="Сначала / двойной тап — предыдущая" {...tapSpring}>
          <SkipBack size={24} />
        </motion.button>
        <motion.button
          type="button"
          onClick={handleToggle}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-400 to-pink-500 text-white flex items-center justify-center shadow-glow"
          {...tapSpring}
        >
          {playing ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
        </motion.button>
        <motion.button type="button" onClick={handleNext} className="p-2 text-ink-600" aria-label="Следующая сказка" {...tapSpring}>
          <SkipForward size={24} />
        </motion.button>
      </div>

      <div className="flex flex-wrap gap-2 justify-center items-center mb-4">
        <motion.button type="button" onClick={() => setSpeedIdx(i => (i + 1) % PLAYER_SPEEDS.length)} className="glass rounded-full px-4 py-2 text-sm min-h-[44px]" {...tapSpring}>
          {PLAYER_SPEEDS[speedIdx]}x
        </motion.button>
        {[15, 30, 45].map(m => (
          <motion.button
            key={m}
            type="button"
            onClick={() => handleSleepTimer(m)}
            className={`glass rounded-full px-4 py-2 text-sm min-h-[44px] ${sleepMin === m ? 'ring-2 ring-pink-400' : ''}`}
            {...tapSpring}
          >
            {m} мин
          </motion.button>
        ))}
        <div className="glass rounded-full px-4 py-2 text-sm min-h-[44px] flex items-center gap-1.5">
          <FavoriteButton
            item={{ type: 'tale', itemId: tale.id, title: tale.title, preview: tale.coverUrl ?? undefined }}
            size={18}
            compact
          />
          <span>Избранное</span>
        </div>
      </div>

      <div className="glass rounded-2xl px-4 py-3 mb-2">
        <p className="text-xs text-ink-500 mb-2">Громкость</p>
        <VolumeSlider value={player.volume} onChange={player.setVolume} />
      </div>
    </div>
  )
}
