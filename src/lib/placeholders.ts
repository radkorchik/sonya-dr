import { hashSeed, pickBySeed } from '@/lib/seed'
import { getPetNamesPool } from '@/data/content'

const FALLBACK_PET_NAMES = [
  'Сонечка',
  'Любимая',
  'моя Принцесса',
  'моя Кошечка',
  'моя Малышка',
  'моя Девочка',
  'моё Солнышко',
  'моя Утитюти',
  'Зай',
  'Любимка',
  'Соняша',
  'Соня',
  'Милая',
  'зайка',
  'родная',
]

export function getPetName(seed: string): string {
  const pool = getPetNamesPool()
  const names = pool.length > 0 ? pool : FALLBACK_PET_NAMES
  return names[hashSeed(seed + ':name') % names.length]
}

export function fillPlaceholders(text: string, seed: string): string {
  const name = getPetName(seed)
  const capitalized = name.charAt(0).toUpperCase() + name.slice(1)
  return text
    .replace(/\{name\}/g, name)
    .replace(/\{Name\}/g, capitalized)
    .replace(/\{date\}/g, new Date().toLocaleDateString('ru-RU', { timeZone: 'Europe/Moscow' }))
}

export function pickPhrase(pool: string[], phraseSeed: string, nameSeed?: string): string {
  if (pool.length === 0) return 'Ты самая лучшая, {name}!'
  const phrase = pickBySeed(pool, phraseSeed)
  return fillPlaceholders(phrase, nameSeed ?? phraseSeed)
}

export function randomPhraseSeed(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
