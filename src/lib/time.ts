export const MSK = 'Europe/Moscow'
export const RELATIONSHIP_START = new Date('2026-01-12T00:00:00+03:00')
export const ENTRY_PASSWORD = '120126'
export const ADMIN_PASSWORD = 'lesha2026'

export type TimePeriod = 'morning' | 'day' | 'evening'

export function getMoscowNow(): Date {
  const str = new Date().toLocaleString('en-US', { timeZone: MSK })
  return new Date(str)
}

export function getMoscowDateKey(): string {
  return getMoscowNow().toLocaleDateString('sv-SE', { timeZone: MSK })
}

export function getTimePeriod(): TimePeriod {
  const hour = getMoscowNow().getHours()
  if (hour >= 6 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'day'
  return 'evening'
}

export function isEvening(): boolean {
  const hour = getMoscowNow().getHours()
  return hour >= 20 || hour < 6
}

export function formatMoscowDate(): string {
  const formatted = new Intl.DateTimeFormat('ru-RU', {
    timeZone: MSK,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export function getTogetherDuration() {
  const now = getMoscowNow()
  const start = RELATIONSHIP_START
  let years = now.getFullYear() - start.getFullYear()
  let months = now.getMonth() - start.getMonth()
  let days = now.getDate() - start.getDate()
  let hours = now.getHours() - start.getHours()
  let minutes = now.getMinutes() - start.getMinutes()
  let seconds = now.getSeconds() - start.getSeconds()

  if (seconds < 0) { seconds += 60; minutes-- }
  if (minutes < 0) { minutes += 60; hours-- }
  if (hours < 0) { hours += 24; days-- }
  if (days < 0) {
    const prev = new Date(now.getFullYear(), now.getMonth(), 0)
    days += prev.getDate()
    months--
  }
  if (months < 0) { months += 12; years-- }

  return { years: Math.max(0, years), months: Math.max(0, months), days: Math.max(0, days), hours, minutes, seconds }
}
