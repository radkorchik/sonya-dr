import { useEffect } from 'react'
import { AppRouter } from './router'
import { useAuthStore } from './stores/authStore'
import { StickerPreloader } from './components/layout/StickerPreloader'
import './styles/index.css'

export default function App() {
  const init = useAuthStore(s => s.init)
  const isReady = useAuthStore(s => s.isReady)

  useEffect(() => { init() }, [init])

  if (!isReady) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-cream">
        <img src="/stickers/sticker7.webp" alt="" className="w-16 h-16 animate-pulseHeart object-contain" />
      </div>
    )
  }

  return (
    <StickerPreloader>
      <AppRouter />
    </StickerPreloader>
  )
}
