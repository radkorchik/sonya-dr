import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeftRight } from 'lucide-react'
import { PageBack } from '@/components/ui/PageBack'
import { GlassCard } from '@/components/ui/GlassCard'
import { Sticker } from '@/components/ui/Sticker'
import { fetchWeather, fetchSecondaryWeather, swapPrimaryCity, type WeatherResult } from '@/lib/weather'
import { tapSpring } from '@/components/motion/presets'

export default function Weather() {
  const [weather, setWeather] = useState<WeatherResult | null>(null)
  const [secondary, setSecondary] = useState<WeatherResult | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const [primary, sec] = await Promise.all([fetchWeather(), fetchSecondaryWeather()])
    setWeather(primary)
    setSecondary(sec)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleSwap = () => {
    swapPrimaryCity()
    load()
  }

  return (
    <div className="page-container">
      <PageBack />
      <h1 className="font-display text-2xl font-bold text-ink-900 mb-4 text-center">Погода</h1>
      {loading && !weather ? (
        <GlassCard className="text-center text-ink-500 flex flex-col items-center gap-2 mb-4">
          <Sticker name="magnolia" size={40} className="animate-pulse" />
          Загружаю погоду…
        </GlassCard>
      ) : weather ? (
        <GlassCard pink className="text-center mb-4">
          <Sticker name={weather.sticker} size={56} className="mx-auto" />
          <p className="text-3xl font-bold text-pink-500 mt-2">{weather.temp}°</p>
          <p className="text-ink-500 mt-1">в {weather.cityPrep}</p>
          <p className="text-ink-700 mt-4 leading-relaxed">{weather.message}</p>
        </GlassCard>
      ) : null}
      {secondary && (
        <motion.button
          type="button"
          onClick={handleSwap}
          className="w-full text-left"
          {...tapSpring}
        >
          <GlassCard className="text-center flex items-center justify-center gap-3" animate={false}>
            <div className="flex-1">
              <p className="text-2xl font-bold text-pink-500">{secondary.temp}°</p>
              <p className="text-ink-500 text-sm mt-1">в {secondary.cityPrep}</p>
            </div>
            <div className="flex items-center gap-1.5 text-ink-500 text-xs shrink-0">
              <ArrowLeftRight size={16} />
              <span>Нажми, чтобы<br />поменять</span>
            </div>
          </GlassCard>
        </motion.button>
      )}
    </div>
  )
}
