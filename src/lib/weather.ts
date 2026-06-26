import weatherData from '../../../content/Пожелания_по_погоде.json'
import { fillPlaceholders } from './placeholders'
import { getMoscowDateKey } from './time'
import { pickBySeed } from './seed'
import { WEATHER_STICKERS, type StickerKey } from './stickers'

interface WeatherCache {
  data: WeatherResult
  ts: number
}

export interface WeatherResult {
  city: string
  cityPrep: string
  temp: number
  code: number
  category: string
  sticker: StickerKey
  message: string
}

const CACHE_KEY = 'sonya_weather_v3'
const CACHE_TTL = 30 * 60 * 1000

/** Название в предложном падеже для «в …» */
const CITY_PREP: Record<string, string> = {
  'Горячий Ключ': 'Горячем Ключе',
  'Краснодар': 'Краснодаре',
}

type CategoryData = { _prefix?: string; wishes: string[] }
type WeatherJson = {
  cities: Record<string, { lat: number; lon: number }>
  categories: Record<string, CategoryData>
}

function categorize(code: number, temp: number, wind: number): string {
  if (code >= 71 && code <= 86) return 'snow'
  if (code >= 51 && code <= 67) return 'rain'
  if (code >= 80 && code <= 82) return 'rain'
  if (code >= 95) return 'storm'
  if (wind > 30) return 'wind'
  if (temp < 0) return 'cold'
  if (temp < 12) return 'chilly'
  if (temp < 24) return 'comfortable'
  if (temp >= 28) return 'hot'
  if (code <= 1) return 'clear'
  if (code <= 3) return 'cloudy'
  return 'comfortable'
}

function stickerFor(category: string): StickerKey {
  return WEATHER_STICKERS[category] ?? 'magnolia'
}

function cityInPrep(nominative: string): string {
  return CITY_PREP[nominative] ?? nominative
}

async function fetchCityWeather(cityName: string, data: WeatherJson): Promise<WeatherResult> {
  const city = data.cities[cityName]
  const cityPrep = cityInPrep(cityName)
  const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,weather_code,wind_speed_10m&timezone=Europe%2FMoscow`
  const res = await fetch(apiUrl)
  if (!res.ok) throw new Error('weather fail')
  const json = await res.json()
  const temp = Math.round(json.current.temperature_2m)
  const code = json.current.weather_code
  const wind = json.current.wind_speed_10m
  const category = categorize(code, temp, wind)
  const cat = data.categories[category] ?? data.categories.comfortable
  const seed = getMoscowDateKey() + category + cityName
  const prefix = (cat._prefix ?? 'Сегодня в {city}, {temp}°')
    .replace('{city}', cityPrep)
    .replace('{temp}', String(temp))
  const wish = pickBySeed(cat.wishes, seed + 'w')
  const message = fillPlaceholders(`${prefix} ${wish}`, seed)

  return {
    city: cityName,
    cityPrep,
    temp,
    code,
    category,
    sticker: stickerFor(category),
    message,
  }
}

export async function fetchWeather(): Promise<WeatherResult> {
  const cached = localStorage.getItem(CACHE_KEY)
  if (cached) {
    const parsed: WeatherCache = JSON.parse(cached)
    if (Date.now() - parsed.ts < CACHE_TTL) return parsed.data
  }

  const data = weatherData as WeatherJson
  const primaryCity = 'Горячий Ключ'

  try {
    const result = await fetchCityWeather(primaryCity, data)
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data: result, ts: Date.now() }))
    return result
  } catch {
    const prep = cityInPrep(primaryCity)
    return {
      city: primaryCity,
      cityPrep: prep,
      temp: 0,
      code: 0,
      category: 'cloudy',
      sticker: 'lily',
      message: fillPlaceholders(`Погода в ${prep} особенная, как ты, {name}! Одевайся по настроению`, getMoscowDateKey()),
    }
  }
}

/** Погода для второго города (Краснодар) — для расширения */
export async function fetchKrasnodarWeather(): Promise<WeatherResult | null> {
  const data = weatherData as WeatherJson
  if (!data.cities['Краснодар']) return null
  try {
    return await fetchCityWeather('Краснодар', data)
  } catch {
    return null
  }
}
