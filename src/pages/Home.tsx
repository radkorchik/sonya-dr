import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { motion } from 'framer-motion'
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
import { FadeIn } from '@/components/motion/FadeIn'
import { tapSpring } from '@/components/motion/presets'
import { useAuthStore } from '@/stores/authStore'

const FALLBACK_GREETING = 'Привет, Сонечка! Я тебя очень люблю. Сегодня у тебя будет хороший день!'

export default function Home() {
  const navigate = useNavigate()
  const logout = useAuthStore(s => s.logout)
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

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="page-container space-y-4">
      <FadeIn>
        <p className="text-sm text-ink-500 text-center">{formatMoscowDate()}</p>
      </FadeIn>

      <div
        className="sticky z-20 -mx-1 px-1 pb-2"
        style={{ top: 'max(env(safe-area-inset-top), 8px)' }}
      >
        <GlassCard pink className="text-center shadow-soft" animate={false}>
          <p className="font-display text-xl font-bold text-ink-900 leading-relaxed whitespace-pre-line">{greeting}</p>
        </GlassCard>
      </div>

      <WidgetGrid>
        {widgets.map((w, i) => (
          <FadeIn key={w.to} delay={0.04 + i * 0.03} className="h-full">
            <Link to={w.to} className="block h-full">
              <motion.div className="h-full" whileTap={tapSpring.whileTap}>
                <GlassCard className="h-full" animate={false}>
                  <Sticker name={w.sticker} size={36} className="mb-1" />
                  <p className="font-semibold text-ink-900 text-sm">{w.title}</p>
                  <p className="text-xs text-ink-500 mt-0.5 line-clamp-2">{w.sub}</p>
                </GlassCard>
              </motion.div>
            </Link>
          </FadeIn>
        ))}
      </WidgetGrid>

      {isEvening() && (
        <FadeIn delay={0.2}>
          <GlassCard pink className="text-center mt-8" animate={false}>
            <Sticker name={WIDGET_STICKERS.goodnight} size={40} className="mx-auto mb-2" />
            <p className="font-semibold text-ink-900">Спокойной ночи</p>
            <p className="text-sm text-ink-500 mt-1">{goodnightPhrase}</p>
          </GlassCard>
        </FadeIn>
      )}

      <div className="grid grid-cols-2 gap-3">
        {quickLinks.map((l, i) => (
          <FadeIn key={l.to} delay={0.15 + i * 0.04}>
            <Link to={l.to} className="block">
              <PillButton variant="secondary" className="w-full h-12 text-sm flex items-center justify-center gap-2 px-4">
                <span className="w-6 h-6 flex items-center justify-center shrink-0">
                  <Sticker name={l.sticker} size={22} />
                </span>
                <span className="truncate">{l.label}</span>
              </PillButton>
            </Link>
          </FadeIn>
        ))}
      </div>

      <FadeIn delay={0.25}>
        <motion.button
          type="button"
          onClick={handleLogout}
          className="w-full mt-2 mb-2 flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold text-red-500 bg-red-50/80 border border-red-200/80 active:scale-[0.97] transition-transform"
          whileTap={tapSpring.whileTap}
        >
          <LogOut size={16} />
          Выйти из аккаунта
        </motion.button>
      </FadeIn>
    </div>
  )
}
