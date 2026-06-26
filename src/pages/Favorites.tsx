import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Sticker } from '@/components/ui/Sticker'
import { getFavorites, saveFavorites, type FavoriteItem } from '@/lib/localData'
import { getAllTales, type Tale } from '@/lib/talesApi'

export default function Favorites() {
  const [favs, setFavs] = useState<FavoriteItem[]>([])
  const [tales, setTales] = useState<Tale[]>([])
  const [filter, setFilter] = useState<'all' | 'tale' | 'image' | 'gif'>('all')

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

  return (
    <div className="page-container">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Sticker name="laceHeart" size={32} />
        <h1 className="font-display text-2xl font-bold text-ink-900">Избранное</h1>
      </div>
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {(['all', 'tale', 'image', 'gif'] as const).map(f => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm ${filter === f ? 'bg-pink-500 text-white' : 'glass'}`}
          >
            {{ all: 'Все', tale: 'Сказки', image: 'Фото', gif: 'Гифки' }[f]}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <GlassCard className="text-center py-8 text-ink-500">
          Пока пусто. Добавляй сердечки в сказках и котиках
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {filtered.map(f => (
            <GlassCard key={f.id} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                {f.type === 'tale' ? (
                  <Link to={`/tales/${f.itemId}`} className="flex items-center gap-3">
                    <Sticker name="envelope" size={32} />
                    <div>
                      <p className="font-semibold text-ink-900">{f.title ?? tales.find(t => t.id === f.itemId)?.title ?? 'Сказка'}</p>
                      <p className="text-xs text-ink-500">Сказка</p>
                    </div>
                  </Link>
                ) : (
                  <a href={f.preview ?? f.itemId} target="_blank" rel="noreferrer" className="flex items-center gap-3">
                    {f.preview && <img src={f.preview} alt="" className="w-12 h-12 rounded-lg object-cover" />}
                    <div>
                      <p className="font-semibold text-ink-900">{f.title ?? 'Котик'}</p>
                      <p className="text-xs text-ink-500">{f.type === 'gif' ? 'Гифка' : 'Фото'}</p>
                    </div>
                  </a>
                )}
              </div>
              <button type="button" onClick={() => remove(f.id)} className="p-2 text-ink-500" aria-label="Удалить">
                <Trash2 size={18} />
              </button>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  )
}
