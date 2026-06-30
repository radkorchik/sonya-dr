import { useEffect, useRef, useState, useCallback, useContext, createContext, useMemo, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { savePlayPosition } from '@/lib/localData'
import { MiniPlayerBar } from '@/components/player/MiniPlayerBar'

export interface PlayerTale {
  id: string
  title: string
  coverUrl: string | null
  audioUrl: string
  durationSec: number
}

interface PlayerState {
  tale: PlayerTale | null
  playing: boolean
  current: number
  duration: number
  volume: number
  speed: number
}

export interface PlayerApi extends PlayerState {
  loadTale: (tale: PlayerTale, opts?: { autoplay?: boolean; seekTo?: number }) => void
  setTalesList: (tales: PlayerTale[]) => void
  toggle: () => void
  play: () => void
  pause: () => void
  seek: (sec: number) => void
  restart: () => void
  nextTale: () => void
  prevTale: () => void
  setVolume: (v: number) => void
  setSpeed: (s: number) => void
  stop: () => void
}

const SPEEDS = [0.75, 1, 1.25]
const VOLUME_KEY = 'sonya_volume'

const PlayerContext = createContext<PlayerApi | null>(null)

export function PlayerProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const audioRef = useRef<HTMLAudioElement>(null)
  const lastSave = useRef(0)
  const taleIdRef = useRef<string | null>(null)
  const talesListRef = useRef<PlayerTale[]>([])
  const [state, setState] = useState<PlayerState>(() => ({
    tale: null,
    playing: false,
    current: 0,
    duration: 0,
    volume: Number(localStorage.getItem(VOLUME_KEY) ?? 0.85),
    speed: 1,
  }))

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = state.volume
  }, [state.volume])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.playbackRate = state.speed
  }, [state.speed])

  const setTalesList = useCallback((tales: PlayerTale[]) => {
    talesListRef.current = tales
  }, [])

  const loadTale = useCallback((tale: PlayerTale, opts?: { autoplay?: boolean; seekTo?: number }) => {
    const audio = audioRef.current
    if (!audio) return

    taleIdRef.current = tale.id

    setState(prev => {
      const same = prev.tale?.id === tale.id
      if (same) {
        if (opts?.seekTo != null) audio.currentTime = opts.seekTo
        if (opts?.autoplay) void audio.play().catch(() => {})
        return {
          ...prev,
          tale,
          playing: opts?.autoplay ? true : prev.playing,
          current: opts?.seekTo ?? audio.currentTime,
        }
      }

      audio.src = tale.audioUrl
      const seek = opts?.seekTo ?? 0
      const applySeek = () => { audio.currentTime = seek }
      if (audio.readyState >= 1) applySeek()
      else audio.addEventListener('loadedmetadata', applySeek, { once: true })
      audio.load()

      if (opts?.autoplay) void audio.play().catch(() => {})

      return {
        ...prev,
        tale,
        playing: !!opts?.autoplay,
        current: seek,
        duration: tale.durationSec,
      }
    })
  }, [])

  const play = useCallback(() => {
    void audioRef.current?.play().catch(() => {})
    setState(p => ({ ...p, playing: true }))
  }, [])

  const pause = useCallback(() => {
    audioRef.current?.pause()
    setState(p => ({ ...p, playing: false }))
  }, [])

  const toggle = useCallback(() => {
    setState(p => {
      if (p.playing) {
        audioRef.current?.pause()
        return { ...p, playing: false }
      }
      void audioRef.current?.play().catch(() => {})
      return { ...p, playing: true }
    })
  }, [])

  const seek = useCallback((sec: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = sec
    setState(p => ({ ...p, current: sec }))
  }, [])

  const restart = useCallback(() => {
    seek(0)
    play()
  }, [seek, play])

  const goSibling = useCallback((dir: -1 | 1) => {
    const tales = talesListRef.current
    const currentId = taleIdRef.current
    if (!currentId || tales.length === 0) return
    const idx = tales.findIndex(t => t.id === currentId)
    if (idx < 0) return
    const next = tales[(idx + dir + tales.length) % tales.length]
    navigate(`/tales/${next.id}`)
  }, [navigate])

  const nextTale = useCallback(() => goSibling(1), [goSibling])
  const prevTale = useCallback(() => goSibling(-1), [goSibling])

  const setVolume = useCallback((v: number) => {
    localStorage.setItem(VOLUME_KEY, String(v))
    if (audioRef.current) audioRef.current.volume = v
    setState(p => ({ ...p, volume: v }))
  }, [])

  const setSpeed = useCallback((s: number) => {
    if (audioRef.current) audioRef.current.playbackRate = s
    setState(p => ({ ...p, speed: s }))
  }, [])

  const stop = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
    }
    taleIdRef.current = null
    setState(p => ({ ...p, tale: null, playing: false, current: 0, duration: 0 }))
  }, [])

  const api = useMemo<PlayerApi>(() => ({
    ...state,
    loadTale,
    setTalesList,
    toggle,
    play,
    pause,
    seek,
    restart,
    nextTale,
    prevTale,
    setVolume,
    setSpeed,
    stop,
  }), [state, loadTale, setTalesList, toggle, play, pause, seek, restart, nextTale, prevTale, setVolume, setSpeed, stop])

  return (
    <PlayerContext.Provider value={api}>
      <audio
        ref={audioRef}
        playsInline
        preload="metadata"
        onTimeUpdate={() => {
          const a = audioRef.current
          const tid = taleIdRef.current
          if (!a || !tid) return
          setState(p => ({ ...p, current: a.currentTime, duration: a.duration || p.duration }))
          const sec = Math.floor(a.currentTime)
          if (sec !== lastSave.current && sec % 5 === 0) {
            lastSave.current = sec
            savePlayPosition(tid, sec)
          }
        }}
        onPlay={() => setState(p => ({ ...p, playing: true }))}
        onPause={() => setState(p => ({ ...p, playing: false }))}
        onEnded={() => setState(p => ({ ...p, playing: false }))}
      />
      {children}
      <MiniPlayerBar api={api} />
    </PlayerContext.Provider>
  )
}

export function usePlayer(): PlayerApi {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayer outside PlayerProvider')
  return ctx
}

export function usePlayerOptional(): PlayerApi | null {
  return useContext(PlayerContext)
}

export { SPEEDS as PLAYER_SPEEDS }
