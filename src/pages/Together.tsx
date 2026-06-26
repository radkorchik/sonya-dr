import { useEffect, useState } from 'react'
import { PageBack } from '@/components/ui/PageBack'
import { GlassCard } from '@/components/ui/GlassCard'
import { Sticker, WidgetGrid } from '@/components/ui/Sticker'
import { getTogetherDuration } from '@/lib/time'

export default function Together() {
  const [dur, setDur] = useState(getTogetherDuration())

  useEffect(() => {
    const id = setInterval(() => setDur(getTogetherDuration()), 1000)
    return () => clearInterval(id)
  }, [])

  const units = [
    { label: 'Лет', value: dur.years, show: dur.years > 0 },
    { label: 'Месяцев', value: dur.months, show: dur.months > 0 || dur.years > 0 },
    { label: 'Дней', value: dur.days, show: true },
    { label: 'Часов', value: dur.hours, show: true },
    { label: 'Минут', value: dur.minutes, show: true },
    { label: 'Секунд', value: dur.seconds, show: true },
  ].filter(u => u.show)

  return (
    <div className="page-container">
      <PageBack />
      <div className="text-center">
        <div className="mb-4 animate-pulseHeart inline-block">
          <Sticker name="togetherHeart" size={80} className="mx-auto" />
        </div>
        <h1 className="font-display text-2xl font-bold text-ink-900 mb-6">Мы вместе уже</h1>
        <WidgetGrid>
          {units.map(u => (
            <GlassCard key={u.label} pink>
              <p className="font-display text-3xl font-bold text-pink-500 tabular-nums">{u.value}</p>
              <p className="text-sm text-ink-500 mt-1">{u.label}</p>
            </GlassCard>
          ))}
        </WidgetGrid>
        <p className="font-script text-xl text-ink-700 mt-8 flex items-center justify-center gap-2">
          И я хочу быть с тобой всю жизнь
          <Sticker name="laceHeart" size={24} />
        </p>
      </div>
    </div>
  )
}
