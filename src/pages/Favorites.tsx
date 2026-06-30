import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Sticker } from '@/components/ui/Sticker'
import { SegmentTabs } from '@/components/ui/SegmentTabs'
import { MediaViewer } from '@/components/ui/MediaViewer'
import { getFavorites, saveFavorites, type FavoriteItem } from '@/lib/localData'
import { getAllTales, type Tale } from '@/lib/talesApi'
import { resolvePreviewUrl, isIdbPreview } from '@/lib/mediaStorage'
import { tapSpring } from '@/components/motion/presets'

function MediaThumb({ fav, onOpen }: { fav: FavoriteItem; onOpen: () => void }) {
  const [src, setSrc] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    resolvePreviewUrl(fav.preview, fav.itemId).then(url => {
      if (!cancelled) {
        setSrc(url)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [fav.preview, fav.itemId])

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      className="relative aspect-square w-full overflow-hidden rounded-2xl bg-blush-50 shadow-soft"
      {...tapSpring}
      whileHover={{ scale: 1.01 }}
    >
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <Sticker name="cat" size={40} className="animate-pulseHeart opacity-50" />
        </div>
      ) : src ? (
        <img src={src} alt={fav.title ?? ''} className="w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <Sticker name="cat" size={40} />
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-900/50 to-transparent p-2 pt-6">
        <p className="text-white text-xs font-semibold truncate">{fav.title ?? 'Котик'}</p>
        <p className="text-white/80 text-[10px]">{fav.type === 'gif' ? 'Гифка' : 'Фото'}</p>
      </div>
      <button
        type="button"
        onClick={e => { e.stopPropagation(); /* handled by parent remove */ }}
        className="hidden"
        aria-hidden
      />
    </motion.button>
  )
}

function TaleRow({ fav, tales, onRemove }: { fav: FavoriteItem; tales: Tale[]; onRemove: () => void }) {
  const cover = fav.preview && !isIdbPreview(fav.preview)
    ? fav.preview
    : tales.find(t => t.id === fav.itemId)?.coverUrl

  return (
    <GlassCard className="flex items-center gap-3 p-3">
      <Link to={`/tales/${fav.itemId}`} className="flex items-center gap-3 flex-1 min-w-0">
        {cover ? (
          <img src={cover} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
        ) : (
          <Sticker name="envelope" size={40} />
        )}
        <div className="min-w-0">
          <p className="font-semibold text-ink-900 truncate">
            {fav.title ?? tales.find(t => t.id === fav.itemId)?.title ?? 'Сказка'}
          </p>
          <p className="text-xs text-ink-500 mt-0.5">Сказка</p>
        </div>
      </Link>
      <button type="button" onClick={onRemove} className="p-2 text-ink-400 hover:text-pink-500 transition-colors" aria-label="Удалить">
        <Trash2 size={18} />
      </button>
    </GlassCard>
  )
}

export default function Favorites() {
  const [favs, setFavs] = useState<FavoriteItem[]>([])
  const [tales, setTales] = useState<Tale[]>([])
  const [filter, setFilter] = useState<'all' | 'tale' | 'image' | 'gif'>('all')
  const [viewer, setViewer] = useState<{ src: string; alt: string } | null>(null)

  useEffect(() => {
    setFavs(getFavorites())
    getAllTales().then(setTales)
  }, [])

  const remove = (id: string) => {
    const next = favs.filter(f => f.id !== id)
    saveFavorites(next)
    setFavs(next)
  }

  const filtered = favs.filter(f => filter === 'all' || f.type === filter)
  const talesList = filtered.filter(f => f.type === 'tale')
  const mediaList = filtered.filter(f => f.type === 'image' || f.type === 'gif')

  const openMedia = async (f: FavoriteItem) => {
    const src = await resolvePreviewUrl(f.preview, f.itemId)
    if (src) setViewer({ src, alt: f.title ?? 'Котик' })
  }

  const showTales = filter === 'all' || filter === 'tale'
  const showMedia = filter === 'all' || filter === 'image' || filter === 'gif'

  return (
    <div className="page-container">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Sticker name="laceHeart" size={32} />
        <h1 className="font-display text-2xl font-bold text-ink-900">Избранное</h1>
      </div>
      <SegmentTabs
        options={[
          { value: 'all' as const, label: 'Все' },
          { value: 'tale' as const, label: 'Сказки' },
          { value: 'image' as const, label: 'Фото' },
          { value: 'gif' as const, label: 'Гифки' },
        ]}
        value={filter}
        onChange={setFilter}
      />
      {filtered.length === 0 ? (
        <GlassCard className="text-center py-8 text-ink-500">
          Пока пусто. Добавляй сердечки в сказках и котиках
        </GlassCard>
      ) : (
        <div className="space-y-5">
          {showTales && talesList.length > 0 && (
            <section>
              {filter === 'all' && talesList.length > 0 && (
                <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-2 px-1">Сказки</p>
              )}
              <div className="space-y-2">
                {talesList.map(f => (
                  <TaleRow key={f.id} fav={f} tales={tales} onRemove={() => remove(f.id)} />
                ))}
              </div>
            </section>
          )}
          {showMedia && mediaList.length > 0 && (
            <section>
              {filter === 'all' && (
                <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-2 px-1">Фото и гифки</p>
              )}
              <div className="grid grid-cols-2 gap-3">
                {mediaList.map(f => (
                  <div key={f.id} className="relative">
                    <MediaThumb fav={f} onOpen={() => openMedia(f)} />
                    <button
                      type="button"
                      onClick={() => remove(f.id)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full glass flex items-center justify-center text-ink-500 active:scale-95 transition-transform z-10"
                      aria-label="Удалить"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
      <AnimatePresence>
        {viewer && (
          <MediaViewer key="viewer" src={viewer.src} alt={viewer.alt} onClose={() => setViewer(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}
