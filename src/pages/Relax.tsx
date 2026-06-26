import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { PillButton } from '@/components/ui/PillButton'
import { Sticker } from '@/components/ui/Sticker'
import { FavoriteButton } from '@/components/ui/FavoriteButton'
import { fetchCatContent, type CatItem } from '@/lib/cats'

export default function Relax() {
  const [items, setItems] = useState<CatItem[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    setItems(await fetchCatContent(6))
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  return (
    <div className="page-container">
      <div className="text-center mb-4">
        <Sticker name="cat" size={44} className="mx-auto mb-2" />
        <h1 className="font-display text-2xl font-bold text-ink-900">Минутка отдыха</h1>
        <p className="text-ink-500 text-sm mt-1">Милые котики для настроения</p>
      </div>
      <PillButton onClick={load} className="w-full mb-4 flex items-center justify-center gap-2" disabled={loading}>
        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        Ещё котиков
      </PillButton>
      {loading ? (
        <GlassCard className="text-center py-12 text-ink-500 flex flex-col items-center gap-3">
          <Sticker name="cat" size={48} className="animate-pulseHeart" />
          Ищу котиков…
        </GlassCard>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {items.map(item => (
            <GlassCard key={item.id} className="p-2 relative overflow-hidden">
              <img
                src={item.url}
                alt={item.alt}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="w-full aspect-square object-cover rounded-xl bg-blush-50"
                onError={(e) => {
                  const t = e.currentTarget
                  t.onerror = null
                  t.src = '/stickers/sticker.webp'
                  t.className = 'w-full aspect-square object-contain rounded-xl bg-blush-50 p-2'
                }}
              />
              <div className="absolute top-2 right-2">
                <FavoriteButton
                  item={{
                    type: item.type === 'gif' ? 'gif' : 'image',
                    itemId: item.url,
                    title: item.alt,
                    preview: item.url,
                  }}
                  className="glass rounded-full p-1"
                />
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  )
}
