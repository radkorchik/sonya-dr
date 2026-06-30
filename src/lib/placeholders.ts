import { hashSeed, pickBySeed, pickRandom } from '@/lib/seed'
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

/** Adds a pet name to phrases that only use «ты» without {name} */
export function personalizePhrase(text: string, seed: string): string {
  const hadPlaceholder = /\{name\}|\{Name\}/.test(text)
  let result = fillPlaceholders(text, seed)
  if (hadPlaceholder) return result

  const name = getPetName(seed + ':vocative')
  const cap = name.charAt(0).toUpperCase() + name.slice(1)

  if (/^Ты\b/u.test(result)) {
    return result.replace(/^Ты\b/u, `${cap}, ты`)
  }
  if (/^ты\b/u.test(result)) {
    return result.replace(/^ты\b/u, `${name}, ты`)
  }
  return `${cap}, ${result.charAt(0).toLowerCase()}${result.slice(1)}`
}

export function pickPhrase(pool: string[], phraseSeed: string, nameSeed?: string): string {
  if (pool.length === 0) return personalizePhrase('Ты самая лучшая!', nameSeed ?? phraseSeed)
  const phrase = pickBySeed(pool, phraseSeed)
  return personalizePhrase(phrase, nameSeed ?? phraseSeed)
}

export function pickRandomPhrase(pool: string[]): string {
  if (pool.length === 0) return personalizePhrase('Ты самая лучшая!', randomPhraseSeed('n'))
  return personalizePhrase(pickRandom(pool), randomPhraseSeed('n'))
}

export function randomPhraseSeed(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
