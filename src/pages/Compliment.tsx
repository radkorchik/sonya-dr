import { useState } from 'react'
import { PageBack } from '@/components/ui/PageBack'
import { GlassCard } from '@/components/ui/GlassCard'
import { PillButton } from '@/components/ui/PillButton'
import { Sticker } from '@/components/ui/Sticker'
import { getComplimentsPool } from '@/data/content'
import { pickBySeed } from '@/lib/seed'
import { fillPlaceholders } from '@/lib/placeholders'
import { getMoscowDateKey } from '@/lib/time'

export default function Compliment() {
  const dateKey = getMoscowDateKey()
  const [revealed, setRevealed] = useState(false)
  const [index, setIndex] = useState(0)
  const pool = getComplimentsPool()
  const text = fillPlaceholders(pickBySeed(pool, dateKey + String(index)), dateKey + String(index))

  return (
    <div className="page-container">
      <PageBack />
      <div className="text-center">
        <Sticker name="bouquet" size={64} className="mx-auto mb-4" />
        <h1 className="font-display text-2xl font-bold text-ink-900 mb-6">Баночка комплиментов</h1>
        {!revealed ? (
          <PillButton onClick={() => setRevealed(true)}>Сегодняшний комплимент</PillButton>
        ) : (
          <div>
            <GlassCard pink className="text-lg leading-relaxed">{text}</GlassCard>
            <PillButton variant="secondary" className="mt-4" onClick={() => setIndex(i => i + 1)}>
              Ещё комплимент
            </PillButton>
          </div>
        )}
      </div>
    </div>
  )
}
