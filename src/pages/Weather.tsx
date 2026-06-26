import { useEffect, useState } from 'react'
import { PageBack } from '@/components/ui/PageBack'
import { GlassCard } from '@/components/ui/GlassCard'
import { Sticker } from '@/components/ui/Sticker'
import { fetchWeather, fetchKrasnodarWeather, type WeatherResult } from '@/lib/weather'

export default function Weather() {
  const [weather, setWeather] = useState<WeatherResult | null>(null)
  const [krasnodar, setKrasnodar] = useState<WeatherResult | null>(null)

  useEffect(() => {
    fetchWeather().then(setWeather)
    fetchKrasnodarWeather().then(setKrasnodar)
  }, [])

  return (
    <div className="page-container">
      <PageBack />
      <h1 className="font-display text-2xl font-bold text-ink-900 mb-4 text-center">Погода</h1>
      {weather ? (
        <GlassCard pink className="text-center mb-4">
          <Sticker name={weather.sticker} size={56} className="mx-auto" />
          <p className="text-3xl font-bold text-pink-500 mt-2">{weather.temp}°</p>
          <p className="text-ink-500 mt-1">в {weather.cityPrep}</p>
          <p className="text-ink-700 mt-4 leading-relaxed">{weather.message}</p>
        </GlassCard>
      ) : (
        <GlassCard className="text-center text-ink-500 flex flex-col items-center gap-2 mb-4">
          <Sticker name="magnolia" size={40} className="animate-pulse" />
          Загружаю погоду…
        </GlassCard>
      )}
      {krasnodar && (
        <GlassCard className="text-center">
          <p className="text-2xl font-bold text-pink-500">{krasnodar.temp}°</p>
          <p className="text-ink-500 text-sm mt-1">в {krasnodar.cityPrep}</p>
        </GlassCard>
      )}
    </div>
  )
}
