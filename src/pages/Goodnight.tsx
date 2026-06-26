import { PageBack } from '@/components/ui/PageBack'
import { GlassCard } from '@/components/ui/GlassCard'
import { Sticker } from '@/components/ui/Sticker'
import { getGoodnightPool } from '@/data/content'
import { pickBySeed } from '@/lib/seed'
import { fillPlaceholders } from '@/lib/placeholders'
import { getMoscowDateKey } from '@/lib/time'

export default function Goodnight() {
  const dateKey = getMoscowDateKey()
  const phrase = fillPlaceholders(pickBySeed(getGoodnightPool(), dateKey), dateKey)

  return (
    <div className="page-container">
      <PageBack />
      <div className="text-center">
        <Sticker name="teddy" size={72} className="mx-auto mb-4" />
        <h1 className="font-display text-2xl font-bold text-ink-900 mb-6">Спокойной ночи</h1>
        <GlassCard pink className="text-lg mb-6 leading-relaxed">{phrase}</GlassCard>
        <p className="font-script text-xl text-ink-700 flex items-center justify-center gap-2">
          Сладких снов, моя принцесса
          <Sticker name="laceHeart" size={22} />
        </p>
      </div>
    </div>
  )
}
