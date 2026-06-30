import { useState } from 'react'
import { PageBack } from '@/components/ui/PageBack'
import { GlassCard } from '@/components/ui/GlassCard'
import { PillButton } from '@/components/ui/PillButton'
import { Sticker } from '@/components/ui/Sticker'
import { getComplimentsPool } from '@/data/content'
import { pickPhrase, pickRandomPhrase } from '@/lib/placeholders'
import { getMoscowDateKey } from '@/lib/time'
import { PhraseRevealCard } from '@/components/motion/PhraseReveal'

export default function Compliment() {
  const dateKey = getMoscowDateKey()
  const pool = getComplimentsPool()
  const [revealed, setRevealed] = useState(false)
  const [text, setText] = useState('')

  const handleReveal = () => {
    setText(pickPhrase(pool, dateKey, dateKey))
    setRevealed(true)
  }

  const handleAnother = () => {
    setText(pickRandomPhrase(pool))
  }

  return (
    <div className="page-container">
      <PageBack />
      <div className="text-center">
        <Sticker name="bouquet" size={64} className="mx-auto mb-4" />
        <h1 className="font-display text-2xl font-bold text-ink-900 mb-6">Букетик комплиментов</h1>
        {!revealed ? (
          <PillButton onClick={handleReveal}>Сегодняшний комплимент</PillButton>
        ) : (
          <div>
            <PhraseRevealCard text={text}>
              <GlassCard pink className="text-lg leading-relaxed" animate={false}>
                {text}
              </GlassCard>
            </PhraseRevealCard>
            <PillButton variant="secondary" className="mt-4" onClick={handleAnother}>
              Ещё комплимент
            </PillButton>
          </div>
        )}
      </div>
    </div>
  )
}
