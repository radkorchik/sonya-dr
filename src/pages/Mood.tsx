import { useState } from 'react'
import { PageBack } from '@/components/ui/PageBack'
import { GlassCard } from '@/components/ui/GlassCard'
import { Sticker } from '@/components/ui/Sticker'
import { getMoodsPool } from '@/data/content'
import { pickBySeed } from '@/lib/seed'
import { fillPlaceholders } from '@/lib/placeholders'
import { getMoscowDateKey } from '@/lib/time'
import { lightVibrate } from '@/lib/haptics'

export default function Mood() {
  const dateKey = getMoscowDateKey()
  const mood = pickBySeed(getMoodsPool(), dateKey)
  const caption = fillPlaceholders(mood.caption, dateKey)
  const [petted, setPetted] = useState(false)

  const handlePet = () => {
    setPetted(true)
    lightVibrate()
  }

  return (
    <div className="page-container">
      <PageBack />
      <div className="text-center">
        <button
          type="button"
          onClick={handlePet}
          className="relative inline-block mb-4 transition-transform duration-150 active:scale-95"
          style={{ animation: petted ? undefined : 'float 3s ease-in-out infinite' }}
        >
          <Sticker name="cat" size={120} className="mx-auto drop-shadow-soft" alt="Котик" />
          {petted && (
            <span className="absolute -top-2 -right-2 animate-pulse">
              <Sticker name="laceHeart" size={28} />
            </span>
          )}
        </button>
        <p className="text-sm text-ink-500 mb-2">Сегодня ты котик-{mood.mood}</p>
        <GlassCard pink className="text-lg">{caption}</GlassCard>
        <p className="text-xs text-ink-500 mt-4 flex items-center justify-center gap-1">
          Нажми на котика, чтобы погладить
          <Sticker name="cat" size={18} />
        </p>
      </div>
    </div>
  )
}
