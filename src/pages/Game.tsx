import { useEffect, useRef, useCallback, useState } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { PillButton } from '@/components/ui/PillButton'
import { Sticker } from '@/components/ui/Sticker'
import { getStickerImage, preloadStickers } from '@/lib/stickers'

const W = 320
const H = 420
const CAT_SIZE = 56
const ITEM_SIZE = 32

interface Item {
  x: number
  y: number
  type: 'heart' | 'bow'
  alive: boolean
}

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [playing, setPlaying] = useState(false)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(() => Number(localStorage.getItem('sonya_game_high') ?? 0))
  const [lives, setLives] = useState(3)

  const state = useRef({
    catX: W / 2 - CAT_SIZE / 2,
    items: [] as Item[],
    score: 0,
    lives: 3,
    lastSpawn: 0,
    playing: false,
  })

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const s = state.current

    // фон
    const grad = ctx.createLinearGradient(0, 0, 0, H)
    grad.addColorStop(0, '#FFF0F5')
    grad.addColorStop(0.5, '#FFE0EC')
    grad.addColorStop(1, '#FFCFE0')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)

    // предметы
    for (const item of s.items) {
      const img = getStickerImage(item.type === 'heart' ? 'laceHeart' : 'bow')
      if (img?.complete) {
        ctx.drawImage(img, item.x, item.y, ITEM_SIZE, ITEM_SIZE)
      }
    }

    // котик
    const catImg = getStickerImage('cat')
    if (catImg?.complete) {
      ctx.drawImage(catImg, s.catX, H - CAT_SIZE - 20, CAT_SIZE, CAT_SIZE)
    }
  }, [])

  const loop = useCallback((now: number) => {
    const s = state.current
    if (!s.playing) return

    if (now - s.lastSpawn > 700) {
      s.items.push({
        x: Math.random() * (W - ITEM_SIZE),
        y: -ITEM_SIZE,
        type: Math.random() > 0.3 ? 'heart' : 'bow',
        alive: true,
      })
      s.lastSpawn = now
    }

    const catCY = H - 20 - CAT_SIZE / 2
    const next: Item[] = []
    for (const item of s.items) {
      item.y += 2.8
      const cx = item.x + ITEM_SIZE / 2
      const cy = item.y + ITEM_SIZE / 2
      if (
        cy > catCY - 30 && cy < catCY + 30 &&
        cx > s.catX - 10 && cx < s.catX + CAT_SIZE + 10
      ) {
        s.score++
        continue
      }
      if (item.y > H) {
        s.lives--
        continue
      }
      next.push(item)
    }
    s.items = next

    if (s.lives <= 0) {
      s.playing = false
      setPlaying(false)
      setScore(s.score)
      setLives(0)
      if (s.score > highScore) {
        localStorage.setItem('sonya_game_high', String(s.score))
        setHighScore(s.score)
      }
      return
    }

    setScore(s.score)
    setLives(s.lives)
    draw()
    if (s.playing) requestAnimationFrame(loop)
  }, [draw, highScore])

  useEffect(() => {
    preloadStickers(['cat', 'laceHeart', 'bow', 'pearlHeart']).then(draw)
  }, [draw])

  const start = () => {
    state.current = {
      catX: W / 2 - CAT_SIZE / 2,
      items: [],
      score: 0,
      lives: 3,
      lastSpawn: performance.now(),
      playing: true,
    }
    setScore(0)
    setLives(3)
    setPlaying(true)
    requestAnimationFrame(loop)
  }

  const moveCat = (clientX: number, rect: DOMRect) => {
    const x = clientX - rect.left - CAT_SIZE / 2
    state.current.catX = Math.max(0, Math.min(W - CAT_SIZE, x))
    if (state.current.playing) draw()
  }

  return (
    <div className="page-container">
      <div className="text-center mb-4">
        <Sticker name="ballet" size={40} className="mx-auto mb-2" />
        <h1 className="font-display text-2xl font-bold text-ink-900">Лови сердечки</h1>
        <p className="text-sm text-ink-500 mt-1">Помоги котику поймать подарки</p>
      </div>

      <div className="flex justify-center gap-5 text-sm text-ink-600 mb-4">
        <span className="flex items-center gap-1"><Sticker name="laceHeart" size={18} /> {score}</span>
        <span className="flex items-center gap-1"><Sticker name="pearlHeart" size={18} /> {highScore}</span>
        <span className="flex items-center gap-1"><Sticker name="laceHeart" size={18} /> {lives}</span>
      </div>

      {!playing ? (
        <GlassCard pink className="text-center py-8">
          <Sticker name="cat" size={64} className="mx-auto mb-4" />
          <p className="text-ink-500 mb-4">Тапай по экрану — котик бежит за пальцем. Лови сердечки!</p>
          <PillButton onClick={start}>Играть</PillButton>
        </GlassCard>
      ) : (
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="mx-auto block rounded-2xl shadow-soft touch-none"
          style={{ width: W, height: H, willChange: 'contents' }}
          onTouchMove={e => { e.preventDefault(); moveCat(e.touches[0].clientX, e.currentTarget.getBoundingClientRect()) }}
          onTouchStart={e => moveCat(e.touches[0].clientX, e.currentTarget.getBoundingClientRect())}
          onMouseMove={e => { if (e.buttons) moveCat(e.clientX, e.currentTarget.getBoundingClientRect()) }}
          onClick={e => moveCat(e.clientX, e.currentTarget.getBoundingClientRect())}
        />
      )}
    </div>
  )
}
