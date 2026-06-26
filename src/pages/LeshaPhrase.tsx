import { useState } from 'react'
import { PageBack } from '@/components/ui/PageBack'
import { GlassCard } from '@/components/ui/GlassCard'
import { PillButton } from '@/components/ui/PillButton'
import { Sticker } from '@/components/ui/Sticker'
import { getLeshaPool } from '@/data/content'
import { pickBySeed } from '@/lib/seed'
import { fillPlaceholders } from '@/lib/placeholders'

export default function LeshaPhrase() {
  const [count, setCount] = useState(0)
  const phrase = count > 0
    ? fillPlaceholders(pickBySeed(getLeshaPool(), String(count)), String(count))
    : ''

  return (
    <div className="page-container">
      <PageBack />
      <div className="text-center">
        <Sticker name="camera" size={56} className="mx-auto mb-3" />
        <h1 className="font-display text-2xl font-bold text-ink-900 mb-6">Что сказал бы Лёша?</h1>
        <PillButton onClick={() => setCount(c => c + 1)}>Узнать</PillButton>
        {count > 0 && (
          <GlassCard pink className="text-lg font-script text-xl mt-6">{phrase}</GlassCard>
        )}
      </div>
    </div>
  )
}
