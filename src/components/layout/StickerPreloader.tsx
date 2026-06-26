import { useEffect, useState } from 'react'
import { preloadStickers } from '@/lib/stickers'

export function StickerPreloader({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    preloadStickers().then(() => setReady(true))
  }, [])

  if (!ready) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-cream">
        <img src="/stickers/sticker7.webp" alt="" className="w-16 h-16 animate-pulseHeart object-contain" />
      </div>
    )
  }

  return <>{children}</>
}
