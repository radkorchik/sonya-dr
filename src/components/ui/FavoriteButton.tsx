import { useState } from 'react'
import { Heart } from 'lucide-react'
import { isFavorite, toggleFavorite, saveFavorites, getFavorites, type FavoriteItem } from '@/lib/localData'
import { useToastStore } from '@/stores/toastStore'
import { HeartBurst } from '@/components/effects/HeartBurst'
import {
  catBlobKey, favBlobKey, copyMediaBlob, saveMediaBlob, toIdbPreview,
  getMediaBlob,
} from '@/lib/mediaStorage'

interface FavoriteButtonProps {
  item: Omit<FavoriteItem, 'id' | 'createdAt'>
  className?: string
  size?: number
  mediaCacheId?: string
  getBlob?: () => Promise<Blob | null>
  compact?: boolean
}

async function blobFromCanvas(img: HTMLImageElement): Promise<Blob | null> {
  try {
    const w = img.naturalWidth || img.width
    const h = img.naturalHeight || img.height
    if (!w || !h) return null
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(img, 0, 0, w, h)
    return await new Promise(resolve => {
      canvas.toBlob(b => resolve(b), 'image/jpeg', 0.92)
    })
  } catch {
    return null
  }
}

async function resolveBlobForFavorite(
  item: Omit<FavoriteItem, 'id' | 'createdAt'>,
  mediaCacheId?: string,
  getBlob?: () => Promise<Blob | null>,
): Promise<Blob | null> {
  if (mediaCacheId) {
    const cached = await getMediaBlob(catBlobKey(mediaCacheId))
    if (cached) return cached
  }
  if (getBlob) {
    const direct = await getBlob()
    if (direct) return direct
  }
  const src = item.preview ?? item.itemId
  if (src.startsWith('data:')) {
    const res = await fetch(src)
    return res.blob()
  }
  if (src.startsWith('http') || src.startsWith('/')) {
    try {
      const res = await fetch(src, { referrerPolicy: 'no-referrer', cache: 'force-cache' })
      if (res.ok) return res.blob()
    } catch { /* ignore */ }
  }
  return null
}

export function FavoriteButton({ item, className = '', size = 22, mediaCacheId, getBlob, compact }: FavoriteButtonProps) {
  const [fav, setFav] = useState(() => isFavorite(item.type, item.itemId))
  const [burst, setBurst] = useState(0)
  const [pop, setPop] = useState(false)
  const [saving, setSaving] = useState(false)
  const showToast = useToastStore(s => s.show)

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (saving) return

    const currentlyFav = isFavorite(item.type, item.itemId)
    if (currentlyFav) {
      toggleFavorite(item)
      setFav(false)
      showToast('Убрано из избранного')
    } else {
      setSaving(true)
      let preview = item.preview

      if (item.type === 'image' || item.type === 'gif') {
        if (mediaCacheId) {
          const copied = await copyMediaBlob(catBlobKey(mediaCacheId), favBlobKey(item.itemId))
          if (copied) {
            preview = toIdbPreview(item.itemId)
          }
        }
        if (!preview?.startsWith('idb:')) {
          const blob = await resolveBlobForFavorite(item, mediaCacheId, getBlob)
          if (!blob) {
            showToast('Подожди — картинка ещё загружается')
            setSaving(false)
            return
          }
          await saveMediaBlob(favBlobKey(item.itemId), blob)
          preview = toIdbPreview(item.itemId)
        }
      }

      const favs = getFavorites()
      favs.push({
        ...item,
        preview,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      })
      saveFavorites(favs)
      setFav(true)
      showToast('Добавлено в избранное')
      setSaving(false)
    }
    setBurst(b => b + 1)
    setPop(true)
    setTimeout(() => setPop(false), 350)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={saving}
      className={`relative shrink-0 transition-transform duration-200 ${compact ? 'p-1' : 'p-2'} ${pop ? 'scale-125' : 'scale-100'} ${saving ? 'opacity-60' : ''} ${className}`}
      aria-label={fav ? 'Убрать из избранного' : 'В избранное'}
    >
      <Heart
        size={size}
        className={`transition-colors duration-200 ${fav ? 'text-pink-500 fill-pink-500' : 'text-ink-300'}`}
      />
      {!compact && <HeartBurst trigger={burst} />}
    </button>
  )
}

export { blobFromCanvas }
