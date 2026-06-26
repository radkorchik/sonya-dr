const PET_NAMES = [
  'Сонечка', 'Соняша', 'Соня', 'Любимая', 'Милая', 'кошечка', 'принцесса',
  'принцессочка', 'девочка', 'солнышко', 'зайка', 'родная', 'душа моя', 'милая',
  'Утитюти', 'Моё Солнышко', 'Моя Кошечка', 'Моя Принцессочка', 'Моя Девочка',
]

export function getPetName(seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0
  return PET_NAMES[Math.abs(h) % PET_NAMES.length]
}

export function fillPlaceholders(text: string, seed: string): string {
  const name = getPetName(seed)
  return text
    .replace(/\{name\}/g, name)
    .replace(/\{Name\}/g, name.charAt(0).toUpperCase() + name.slice(1))
    .replace(/\{date\}/g, new Date().toLocaleDateString('ru-RU', { timeZone: 'Europe/Moscow' }))
}
