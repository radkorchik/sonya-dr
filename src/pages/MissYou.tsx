import { useState } from 'react'
import { PageBack } from '@/components/ui/PageBack'
import { GlassCard } from '@/components/ui/GlassCard'
import { PillButton } from '@/components/ui/PillButton'
import { Sticker } from '@/components/ui/Sticker'
import { getMissYouPool } from '@/data/content'
import { pickRandomPhrase } from '@/lib/placeholders'

export default function MissYou() {
  const [shown, setShown] = useState(false)
  const [message, setMessage] = useState('')
  const pool = getMissYouPool()

  const handleClick = () => {
    setMessage(pickRandomPhrase(pool))
    setShown(true)
  }

  return (
    <div className="page-container">
      <PageBack />
      <div className="text-center">
        <Sticker name="handsHeart" size={48} className="mx-auto mb-3" />
        <h1 className="font-display text-2xl font-bold text-ink-900 mb-6">Нажми, если скучаешь</h1>
        {!shown ? (
          <PillButton onClick={handleClick}>Я скучаю…</PillButton>
        ) : (
          <div>
            <img src="/stickers/sticker8.webp" alt="Обнимашки" className="rounded-2xl mx-auto max-h-48 object-contain mb-4" />
            <GlassCard pink className="text-lg mb-4 leading-relaxed" animate={false} key={message}>{message}</GlassCard>
            <PillButton variant="secondary" className="mt-4" onClick={handleClick}>Ещё раз</PillButton>
          </div>
        )}
      </div>
    </div>
  )
}
