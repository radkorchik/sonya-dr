import { useEffect, useState, useRef } from 'react'
import { RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { PillButton } from '@/components/ui/PillButton'
import { Sticker } from '@/components/ui/Sticker'
import { FavoriteButton, blobFromCanvas } from '@/components/ui/FavoriteButton'
import { fetchCatContent, cacheCatBlob, type CatItem } from '@/lib/cats'
import { catBlobKey, getMediaBlob } from '@/lib/mediaStorage'
import { FadeIn } from '@/components/motion/FadeIn'

export default function Relax() {
  const [items, setItems] = useState<CatItem[]>([])
  const [loading, setLoading] = useState(true)
  const imgRefs = useRef<Record<string, HTMLImageElement | null>>({})

  const load = async () => {
    setLoading(true)
    setItems(await fetchCatContent(6))
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleImgLoad = (item: CatItem, img: HTMLImageElement) => {
    const src = img.currentSrc || img.src
    void cacheCatBlob(item.id, src)
  }

  return (
    <div className="page-container">
      <FadeIn>
        <div className="text-center mb-4">
          <Sticker name="cat" size={44} className="mx-auto mb-2" />
          <h1 className="font-display text-2xl font-bold text-ink-900">Минутка отдыха</h1>
          <p className="text-ink-500 text-sm mt-1">Милые котики для настроения</p>
        </div>
      </FadeIn>
      <FadeIn delay={0.05}>
        <PillButton onClick={load} className="w-full mb-4 flex items-center justify-center gap-2" disabled={loading}>
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Ещё котиков
        </PillButton>
      </FadeIn>
      {loading ? (
        <GlassCard className="text-center py-12 text-ink-500 flex flex-col items-center gap-3">
          <Sticker name="cat" size={48} className="animate-pulseHeart" />
          Ищу котиков…
        </GlassCard>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {items.map((item, i) => (
            <FadeIn key={item.id} delay={0.06 + i * 0.04}>
              <GlassCard className="p-2 relative overflow-hidden" animate={false}>
                <motion.img
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 360, damping: 26, delay: 0.04 + i * 0.03 }}
                  ref={el => { imgRefs.current[item.id] = el }}
                src={item.url}
                alt={item.alt}
                loading="lazy"
                decoding="async"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                className="w-full aspect-square object-cover rounded-xl bg-blush-50"
                onLoad={e => handleImgLoad(item, e.currentTarget)}
                onError={(e) => {
                  const t = e.currentTarget
                  t.onerror = null
                  t.src = '/stickers/sticker.webp'
                  t.className = 'w-full aspect-square object-contain rounded-xl bg-blush-50 p-2'
                  void cacheCatBlob(item.id, t.src)
                }}
              />
              <div className="absolute top-2 right-2">
                <FavoriteButton
                  item={{
                    type: item.type === 'gif' ? 'gif' : 'image',
                    itemId: item.id,
                    title: item.alt,
                    preview: item.url,
                  }}
                  mediaCacheId={item.id}
                  getBlob={async () => {
                    const cached = await getMediaBlob(catBlobKey(item.id))
                    if (cached) return cached
                    const img = imgRefs.current[item.id]
                    if (!img) return null
                    const src = img.currentSrc || img.src
                    try {
                      const res = await fetch(src, { referrerPolicy: 'no-referrer', cache: 'force-cache' })
                      if (res.ok) return res.blob()
                    } catch { /* ignore */ }
                    return blobFromCanvas(img)
                  }}
                  className="glass rounded-full p-1"
                  compact
                />
              </div>
            </GlassCard>
            </FadeIn>
          ))}
        </div>
      )}
    </div>
  )
}
