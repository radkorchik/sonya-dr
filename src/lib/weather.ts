import weatherData from '../../content/Пожелания_по_погоде.json'
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

const CACHE_KEY = 'sonya_weather_v4'
const CITY_KEY = 'sonya_weather_primary_city'
const CACHE_TTL = 30 * 60 * 1000

export const WEATHER_CITIES = ['Горячий Ключ', 'Краснодар'] as const
export type WeatherCity = (typeof WEATHER_CITIES)[number]

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

export function getPrimaryCity(): WeatherCity {
  const saved = localStorage.getItem(CITY_KEY)
  if (saved === 'Краснодар' || saved === 'Горячий Ключ') return saved
  return 'Горячий Ключ'
}

export function setPrimaryCity(city: WeatherCity): void {
  localStorage.setItem(CITY_KEY, city)
  localStorage.removeItem(CACHE_KEY)
}

export function getSecondaryCity(): WeatherCity {
  return getPrimaryCity() === 'Горячий Ключ' ? 'Краснодар' : 'Горячий Ключ'
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

function fallbackWeather(cityName: WeatherCity): WeatherResult {
  const prep = cityInPrep(cityName)
  return {
    city: cityName,
    cityPrep: prep,
    temp: 0,
    code: 0,
    category: 'cloudy',
    sticker: 'lily',
    message: fillPlaceholders(`Погода в ${prep} особенная, как ты, {name}! Одевайся по настроению`, getMoscowDateKey()),
  }
}

export async function fetchWeather(): Promise<WeatherResult> {
  const primaryCity = getPrimaryCity()
  const cacheKey = `${CACHE_KEY}_${primaryCity}`
  const cached = localStorage.getItem(cacheKey)
  if (cached) {
    const parsed: WeatherCache = JSON.parse(cached)
    if (Date.now() - parsed.ts < CACHE_TTL) return parsed.data
  }

  const data = weatherData as WeatherJson

  try {
    const result = await fetchCityWeather(primaryCity, data)
    localStorage.setItem(cacheKey, JSON.stringify({ data: result, ts: Date.now() }))
    return result
  } catch {
    return fallbackWeather(primaryCity)
  }
}

export async function fetchSecondaryWeather(): Promise<WeatherResult | null> {
  const cityName = getSecondaryCity()
  const data = weatherData as WeatherJson
  if (!data.cities[cityName]) return null
  try {
    return await fetchCityWeather(cityName, data)
  } catch {
    return fallbackWeather(cityName)
  }
}

/** @deprecated use fetchSecondaryWeather */
export async function fetchKrasnodarWeather(): Promise<WeatherResult | null> {
  return fetchSecondaryWeather()
}

export function swapPrimaryCity(): WeatherCity {
  const next = getSecondaryCity()
  setPrimaryCity(next)
  return next
}
