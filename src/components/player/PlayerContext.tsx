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

export type PlaylistMode = 'all' | 'favorites'

interface PlayerState {
  tale: PlayerTale | null
  playing: boolean
  current: number
  duration: number
  volume: number
  speed: number
  miniVisible: boolean
}

export interface PlayerApi extends PlayerState {
  loadTale: (tale: PlayerTale, opts?: { autoplay?: boolean; seekTo?: number; playlistMode?: PlaylistMode }) => void
  setTalesList: (tales: PlayerTale[]) => void
  setFavoritesList: (tales: PlayerTale[]) => void
  toggle: () => void
  play: () => void
  pause: () => void
  seek: (sec: number) => void
  restart: () => void
  nextTale: () => void
  prevTale: () => void
  setVolume: (v: number) => void
  setSpeed: (s: number) => void
  hideMini: () => void
  stop: () => void
  disableAutoplay: () => void
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
  const favoritesListRef = useRef<PlayerTale[]>([])
  const taleRef = useRef<PlayerTale | null>(null)
  const autoplayEnabledRef = useRef(false)
  const playlistModeRef = useRef<PlaylistMode>('all')
  const [state, setState] = useState<PlayerState>(() => ({
    tale: null,
    playing: false,
    current: 0,
    duration: 0,
    volume: Number(localStorage.getItem(VOLUME_KEY) ?? 0.85),
    speed: 1,
    miniVisible: false,
  }))

  useEffect(() => {
    taleRef.current = state.tale
  }, [state.tale])

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

  const setFavoritesList = useCallback((tales: PlayerTale[]) => {
    favoritesListRef.current = tales
  }, [])

  const ensureAudioLoaded = useCallback((tale: PlayerTale, seekTo = 0) => {
    const audio = audioRef.current
    if (!audio) return false

    const needsLoad = taleIdRef.current !== tale.id || !audio.src
    if (!needsLoad) {
      if (seekTo > 0) audio.currentTime = seekTo
      return true
    }

    taleIdRef.current = tale.id
    audio.src = tale.audioUrl
    const applySeek = () => { audio.currentTime = seekTo }
    if (audio.readyState >= 1) applySeek()
    else audio.addEventListener('loadedmetadata', applySeek, { once: true })
    audio.load()
    return true
  }, [])

  const loadTale = useCallback((tale: PlayerTale, opts?: { autoplay?: boolean; seekTo?: number; playlistMode?: PlaylistMode }) => {
    const audio = audioRef.current
    if (!audio) return

    const seek = opts?.seekTo ?? 0
    const same = taleIdRef.current === tale.id && !!audio.src

    if (!same && taleIdRef.current && audio.src) {
      savePlayPosition(taleIdRef.current, Math.floor(audio.currentTime))
      audio.pause()
    }

    if (opts?.autoplay) {
      autoplayEnabledRef.current = true
      if (opts.playlistMode) playlistModeRef.current = opts.playlistMode
    }

    if (same) {
      if (opts?.seekTo != null) audio.currentTime = opts.seekTo
      if (opts?.autoplay) void audio.play().catch(() => {})
      setState(prev => ({
        ...prev,
        tale,
        miniVisible: opts?.autoplay ? true : prev.miniVisible,
        playing: opts?.autoplay ? true : prev.playing,
        current: opts?.seekTo ?? audio.currentTime,
      }))
      return
    }

    ensureAudioLoaded(tale, seek)
    if (opts?.autoplay) void audio.play().catch(() => {})

    setState(prev => ({
      ...prev,
      tale,
      miniVisible: !!opts?.autoplay,
      playing: !!opts?.autoplay,
      current: seek,
      duration: tale.durationSec,
    }))
  }, [ensureAudioLoaded])

  const playNextInPlaylist = useCallback(() => {
    if (!autoplayEnabledRef.current) {
      setState(p => ({ ...p, playing: false }))
      return
    }

    const mode = playlistModeRef.current
    const list = mode === 'favorites' ? favoritesListRef.current : talesListRef.current
    const currentId = taleIdRef.current
    if (!currentId || list.length === 0) {
      setState(p => ({ ...p, playing: false }))
      return
    }

    const idx = list.findIndex(t => t.id === currentId)
    if (idx < 0 || idx >= list.length - 1) {
      setState(p => ({ ...p, playing: false }))
      return
    }

    const next = list[idx + 1]
    loadTale(next, { autoplay: true, seekTo: 0, playlistMode: mode })
    navigate(`/tales/${next.id}`, { replace: true, state: { autoplay: true, playlistMode: mode } })
  }, [loadTale, navigate])

  const playNextRef = useRef(playNextInPlaylist)
  useEffect(() => { playNextRef.current = playNextInPlaylist }, [playNextInPlaylist])

  const play = useCallback(() => {
    const audio = audioRef.current
    const tale = taleRef.current
    if (audio && tale && !audio.src) ensureAudioLoaded(tale, audio.currentTime || 0)
    void audio?.play().catch(() => {})
    setState(p => ({ ...p, playing: true, miniVisible: true }))
  }, [ensureAudioLoaded])

  const pause = useCallback(() => {
    audioRef.current?.pause()
    setState(p => ({ ...p, playing: false }))
  }, [])

  const toggle = useCallback(() => {
    setState(p => {
      const audio = audioRef.current
      const tale = taleRef.current
      if (p.playing) {
        audio?.pause()
        return { ...p, playing: false }
      }
      if (audio && tale && !audio.src) ensureAudioLoaded(tale, audio.currentTime || p.current)
      void audio?.play().catch(() => {})
      return { ...p, playing: true, miniVisible: true }
    })
  }, [ensureAudioLoaded])

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
    const mode = playlistModeRef.current
    const list = mode === 'favorites' ? favoritesListRef.current : talesListRef.current
    const currentId = taleIdRef.current
    if (!currentId || list.length === 0) return
    const idx = list.findIndex(t => t.id === currentId)
    if (idx < 0) return
    const next = list[(idx + dir + list.length) % list.length]
    const wasPlaying = !!audioRef.current && !audioRef.current.paused
    navigate(`/tales/${next.id}`, { state: { autoplay: wasPlaying, playlistMode: mode } })
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

  const hideMini = useCallback(() => {
    audioRef.current?.pause()
    setState(p => ({ ...p, playing: false, miniVisible: false }))
  }, [])

  const disableAutoplay = useCallback(() => {
    autoplayEnabledRef.current = false
  }, [])

  const stop = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
    }
    taleIdRef.current = null
    autoplayEnabledRef.current = false
    playlistModeRef.current = 'all'
    setState(p => ({ ...p, tale: null, playing: false, current: 0, duration: 0, miniVisible: false }))
  }, [])

  const api = useMemo<PlayerApi>(() => ({
    ...state,
    loadTale,
    setTalesList,
    setFavoritesList,
    toggle,
    play,
    pause,
    seek,
    restart,
    nextTale,
    prevTale,
    setVolume,
    setSpeed,
    hideMini,
    stop,
    disableAutoplay,
  }), [state, loadTale, setTalesList, setFavoritesList, toggle, play, pause, seek, restart, nextTale, prevTale, setVolume, setSpeed, hideMini, stop, disableAutoplay])

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
        onPlay={() => setState(p => ({ ...p, playing: true, miniVisible: true }))
        }
        onPause={() => setState(p => ({ ...p, playing: false }))}
        onEnded={() => {
          const tid = taleIdRef.current
          if (tid) savePlayPosition(tid, 0)
          playNextRef.current()
        }}
      />
      {children}
      {state.tale && state.miniVisible && <MiniPlayerBar api={api} />}
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
