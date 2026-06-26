import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Play, Pause, SkipBack, SkipForward, Pencil, Trash2 } from 'lucide-react'
import { getTale, deleteTale, type Tale } from '@/lib/talesApi'
import { getPlayHistory, savePlayPosition } from '@/lib/localData'
import { GlassCard } from '@/components/ui/GlassCard'
import { PageBack } from '@/components/ui/PageBack'
import { FavoriteButton } from '@/components/ui/FavoriteButton'
import { Sticker } from '@/components/ui/Sticker'
import { AudioProgress } from '@/components/player/AudioProgress'
import { useToastStore } from '@/stores/toastStore'

const SPEEDS = [0.75, 1, 1.25]

export default function TalePlayer() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const showToast = useToastStore(s => s.show)
  const [tale, setTale] = useState<Tale | null>(null)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [speedIdx, setSpeedIdx] = useState(1)
  const [sleepMin, setSleepMin] = useState<number | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (!id) return
    getTale(id).then(t => {
      if (t) {
        setTale(t)
        const hist = getPlayHistory()[id]
        if (hist) setCurrent(hist.positionSec)
      }
    })
  }, [id])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.playbackRate = SPEEDS[speedIdx]
  }, [speedIdx])

  useEffect(() => {
    if (!sleepMin || !playing) return
    const t = setTimeout(() => {
      audioRef.current?.pause()
      setPlaying(false)
      setSleepMin(null)
    }, sleepMin * 60 * 1000)
    return () => clearTimeout(t)
  }, [sleepMin, playing])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) audio.pause()
    else audio.play().catch(() => {})
    setPlaying(!playing)
  }

  const seek = (delta: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = Math.max(0, Math.min(audio.duration || 0, audio.currentTime + delta))
  }

  const handleDelete = async () => {
    if (!tale || !confirm('Удалить сказку?')) return
    await deleteTale(tale.id)
    showToast('Сказка удалена')
    navigate('/tales')
  }

  if (!tale) {
    return <div className="page-container text-center text-ink-500">Загрузка…</div>
  }

  const duration = tale.durationSec || audioRef.current?.duration || 0

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-2">
        <PageBack to="/tales" />
        <div className="flex gap-1">
          <Link to={`/tales/${tale.id}/edit`} className="glass rounded-full p-2 text-ink-600" aria-label="Редактировать">
            <Pencil size={18} />
          </Link>
          <button type="button" onClick={handleDelete} className="glass rounded-full p-2 text-pink-500" aria-label="Удалить">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <GlassCard pink className="text-center mb-6">
        {tale.coverUrl ? (
          <img src={tale.coverUrl} alt="" className="w-48 h-48 rounded-2xl object-cover mx-auto shadow-soft" />
        ) : (
          <Sticker name="envelope" size={120} className="mx-auto" />
        )}
        <h1 className="font-display text-xl font-bold text-ink-900 mt-4">{tale.title}</h1>
        <p className="text-sm text-ink-500 mt-2">{tale.description}</p>
      </GlassCard>

      <audio
        ref={audioRef}
        src={tale.audioUrl}
        onTimeUpdate={() => {
          const a = audioRef.current
          if (a) {
            setCurrent(a.currentTime)
            if (Math.floor(a.currentTime) % 5 === 0) savePlayPosition(tale.id, Math.floor(a.currentTime))
          }
        }}
        onEnded={() => setPlaying(false)}
      />

      <AudioProgress
        current={current}
        duration={duration}
        onSeek={v => {
          setCurrent(v)
          if (audioRef.current) audioRef.current.currentTime = v
        }}
      />

      <div className="flex items-center justify-center gap-6 mb-6">
        <button type="button" onClick={() => seek(-15)} className="p-2 text-ink-600"><SkipBack size={24} /></button>
        <button
          type="button"
          onClick={togglePlay}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-400 to-pink-500 text-white flex items-center justify-center shadow-glow active:scale-95 transition-transform"
        >
          {playing ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
        </button>
        <button type="button" onClick={() => seek(15)} className="p-2 text-ink-600"><SkipForward size={24} /></button>
      </div>

      <div className="flex flex-wrap gap-2 justify-center items-center">
        <button type="button" onClick={() => setSpeedIdx(i => (i + 1) % SPEEDS.length)} className="glass rounded-full px-4 py-2 text-sm">
          {SPEEDS[speedIdx]}x
        </button>
        {[15, 30, 45].map(m => (
          <button key={m} type="button" onClick={() => setSleepMin(m)} className={`glass rounded-full px-4 py-2 text-sm ${sleepMin === m ? 'ring-2 ring-pink-400' : ''}`}>
            {m} мин
          </button>
        ))}
        <div className="glass rounded-full pl-3 pr-4 py-1 flex items-center gap-1">
          <FavoriteButton item={{ type: 'tale', itemId: tale.id, title: tale.title, preview: tale.coverUrl ?? undefined }} />
          <span className="text-sm">Избранное</span>
        </div>
      </div>
    </div>
  )
}
