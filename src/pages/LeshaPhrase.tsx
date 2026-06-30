import { useState } from 'react'
import { PageBack } from '@/components/ui/PageBack'
import { GlassCard } from '@/components/ui/GlassCard'
import { PillButton } from '@/components/ui/PillButton'
import { Sticker } from '@/components/ui/Sticker'
import { getLeshaPool } from '@/data/content'
import { pickRandomPhrase } from '@/lib/placeholders'
import { PhraseRevealCard } from '@/components/motion/PhraseReveal'

export default function LeshaPhrase() {
  const [phrase, setPhrase] = useState('')
  const pool = getLeshaPool()

  return (
    <div className="page-container">
      <PageBack />
      <div className="text-center">
        <Sticker name="camera" size={56} className="mx-auto mb-3" />
        <h1 className="font-display text-2xl font-bold text-ink-900 mb-6">Что сказал бы Лёша?</h1>
        <PillButton onClick={() => setPhrase(pickRandomPhrase(pool))}>Узнать</PillButton>
        {phrase && (
          <PhraseRevealCard text={phrase}>
            <GlassCard pink className="text-lg font-script text-xl mt-6 leading-relaxed" animate={false}>
              {phrase}
            </GlassCard>
          </PhraseRevealCard>
        )}
      </div>
    </div>
  )
}
