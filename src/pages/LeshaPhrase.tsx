import { useState } from 'react'
import { PageBack } from '@/components/ui/PageBack'
import { GlassCard } from '@/components/ui/GlassCard'
import { PillButton } from '@/components/ui/PillButton'
import { Sticker } from '@/components/ui/Sticker'
import { getLeshaPool } from '@/data/content'
import { pickPhrase, randomPhraseSeed } from '@/lib/placeholders'

export default function LeshaPhrase() {
  const [seed, setSeed] = useState<string | null>(null)
  const pool = getLeshaPool()
  const phrase = seed ? pickPhrase(pool, seed, seed) : ''

  return (
    <div className="page-container">
      <PageBack />
      <div className="text-center">
        <Sticker name="camera" size={56} className="mx-auto mb-3" />
        <h1 className="font-display text-2xl font-bold text-ink-900 mb-6">Что сказал бы Лёша?</h1>
        <PillButton onClick={() => setSeed(randomPhraseSeed('lesha'))}>Узнать</PillButton>
        {phrase && (
          <GlassCard pink className="text-lg font-script text-xl mt-6 leading-relaxed" animate={false}>{phrase}</GlassCard>
        )}
      </div>
    </div>
  )
}
