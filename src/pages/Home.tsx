import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { GlassCard } from '@/components/ui/GlassCard'
import { PillButton } from '@/components/ui/PillButton'
import { Sticker, WidgetGrid } from '@/components/ui/Sticker'
import { formatMoscowDate, getTimePeriod, getMoscowDateKey, isEvening } from '@/lib/time'
import { pickBySeed } from '@/lib/seed'
import { fillPlaceholders } from '@/lib/placeholders'
import { getGreetingPool, getMoodsPool, getComplimentsPool, getTasksPool, getGoodnightPool } from '@/data/content'
import { fetchWeather, type WeatherResult } from '@/lib/weather'
import { isTaskDone } from '@/lib/localData'
import { WIDGET_STICKERS, type StickerKey } from '@/lib/stickers'

const FALLBACK_GREETING = 'Привет, Сонечка! Я тебя очень люблю. Сегодня у тебя будет хороший день!'

export default function Home() {
  const dateKey = getMoscowDateKey()
  const period = getTimePeriod()
  const pool = getGreetingPool(period)
  const greeting = pool.length
    ? fillPlaceholders(pickBySeed(pool, dateKey + period), dateKey)
    : fillPlaceholders(FALLBACK_GREETING, dateKey)
  const moodItem = pickBySeed(getMoodsPool(), dateKey)
  const mood = fillPlaceholders(moodItem.caption, dateKey)
  const compliment = fillPlaceholders(pickBySeed(getComplimentsPool(), dateKey + 'compl'), dateKey)
  const goodnightPhrase = fillPlaceholders(pickBySeed(getGoodnightPool(), dateKey), dateKey)
  const [weather, setWeather] = useState<WeatherResult | null>(null)
  const tasks = getTasksPool().slice(0, 5)
  const doneCount = tasks.filter(t => isTaskDone(t.id, dateKey)).length

  useEffect(() => { fetchWeather().then(setWeather) }, [])

  const widgets: { to: string; sticker: StickerKey; title: string; sub: string }[] = [
    { to: '/together', sticker: WIDGET_STICKERS.together, title: 'Мы вместе', sub: 'Наш счётчик любви' },
    { to: '/compliment', sticker: WIDGET_STICKERS.compliment, title: 'Комплимент', sub: compliment.slice(0, 45) + (compliment.length > 45 ? '…' : '') },
    { to: '/mood', sticker: WIDGET_STICKERS.mood, title: 'Настроение', sub: mood.slice(0, 45) + (mood.length > 45 ? '…' : '') },
    { to: '/weather', sticker: weather?.sticker ?? WIDGET_STICKERS.weather, title: 'Погода', sub: weather ? `${weather.temp}° · ${weather.cityPrep}` : 'Загрузка...' },
    { to: '/tasks', sticker: WIDGET_STICKERS.tasks, title: 'Задания', sub: `${doneCount}/${tasks.length} выполнено` },
    { to: '/miss-you', sticker: WIDGET_STICKERS.missYou, title: 'Скучаю?', sub: 'Нажми, если скучаешь' },
    { to: '/lesha', sticker: WIDGET_STICKERS.lesha, title: 'Лёша', sub: 'Что сказал бы Лёша?' },
  ]

  const quickLinks: { to: string; sticker: StickerKey; label: string }[] = [
    { to: '/tales', sticker: WIDGET_STICKERS.tales, label: 'Сказки' },
    { to: '/relax', sticker: WIDGET_STICKERS.relax, label: 'Отдых' },
    { to: '/game', sticker: WIDGET_STICKERS.game, label: 'Игра' },
    { to: '/favorites', sticker: WIDGET_STICKERS.favorites, label: 'Избранное' },
  ]

  return (
    <div className="page-container space-y-4">
      <p className="text-sm text-ink-500 text-center">{formatMoscowDate()}</p>

      <div
        className="sticky z-20 -mx-1 px-1 pb-2"
        style={{ top: 'max(env(safe-area-inset-top), 8px)' }}
      >
        <GlassCard pink className="text-center shadow-soft">
          <p className="font-display text-xl font-bold text-ink-900 leading-relaxed whitespace-pre-line">{greeting}</p>
        </GlassCard>
      </div>

      <WidgetGrid>
        {widgets.map(w => (
          <Link key={w.to} to={w.to} className="block h-full">
            <GlassCard className="h-full">
              <Sticker name={w.sticker} size={36} className="mb-1" />
              <p className="font-semibold text-ink-900 text-sm">{w.title}</p>
              <p className="text-xs text-ink-500 mt-0.5 line-clamp-2">{w.sub}</p>
            </GlassCard>
          </Link>
        ))}
      </WidgetGrid>

      {isEvening() && (
        <GlassCard pink className="text-center mt-8">
          <Sticker name={WIDGET_STICKERS.goodnight} size={40} className="mx-auto mb-2" />
          <p className="font-semibold text-ink-900">Спокойной ночи</p>
          <p className="text-sm text-ink-500 mt-1">{goodnightPhrase}</p>
        </GlassCard>
      )}

      <div className="grid grid-cols-2 gap-3">
        {quickLinks.map(l => (
          <Link key={l.to} to={l.to}>
            <PillButton variant="secondary" className="w-full text-sm flex items-center justify-center gap-2">
              <Sticker name={l.sticker} size={22} />
              {l.label}
            </PillButton>
          </Link>
        ))}
      </div>
    </div>
  )
}
