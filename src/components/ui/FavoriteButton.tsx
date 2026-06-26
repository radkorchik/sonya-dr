import { useState } from 'react'
import { Heart } from 'lucide-react'
import { isFavorite, toggleFavorite, type FavoriteItem } from '@/lib/localData'
import { useToastStore } from '@/stores/toastStore'
import { HeartBurst } from '@/components/effects/HeartBurst'

interface FavoriteButtonProps {
  item: Omit<FavoriteItem, 'id' | 'createdAt'>
  className?: string
  size?: number
}

export function FavoriteButton({ item, className = '', size = 22 }: FavoriteButtonProps) {
  const [fav, setFav] = useState(() => isFavorite(item.type, item.itemId))
  const [burst, setBurst] = useState(0)
  const [pop, setPop] = useState(false)
  const showToast = useToastStore(s => s.show)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const added = toggleFavorite(item)
    setFav(added)
    setBurst(b => b + 1)
    setPop(true)
    setTimeout(() => setPop(false), 350)
    showToast(added ? 'Добавлено в избранное' : 'Убрано из избранного')
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`relative shrink-0 p-2 transition-transform duration-200 ${pop ? 'scale-125' : 'scale-100'} ${className}`}
      aria-label={fav ? 'Убрать из избранного' : 'В избранное'}
    >
      <Heart
        size={size}
        className={`transition-colors duration-200 ${fav ? 'text-pink-500 fill-pink-500' : 'text-ink-300'}`}
      />
      <HeartBurst trigger={burst} />
    </button>
  )
}
