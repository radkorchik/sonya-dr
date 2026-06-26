import { STICKERS } from './stickers'

export interface CatItem {
  id: string
  type: 'photo' | 'gif' | 'sticker'
  url: string
  alt: string
}

const LOCAL_CATS = [
  { url: STICKERS.cat, alt: 'Милый котик' },
  { url: STICKERS.bunny, alt: 'Зайчик' },
  { url: STICKERS.deer, alt: 'Оленёнок' },
  { url: STICKERS.teddy, alt: 'Мишка' },
  { url: STICKERS.cat, alt: 'Котик с бантиком' },
  { url: STICKERS.bunny, alt: 'Аngel bunny' },
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

async function tryFetchCat(i: number): Promise<CatItem | null> {
  const ts = Date.now() + i
  const isGif = i % 3 === 0
  const url = isGif
    ? `https://cataas.com/cat/gif?${ts}`
    : `https://cataas.com/cat?${ts}`

  return new Promise((resolve) => {
    const img = new Image()
    img.referrerPolicy = 'no-referrer'
    img.onload = () => resolve({
      id: `cat-${ts}`,
      type: isGif ? 'gif' : 'photo',
      url,
      alt: 'Милый котик',
    })
    img.onerror = () => resolve(null)
    img.src = url
  })
}

export async function fetchCatContent(count = 6): Promise<CatItem[]> {
  const online = await Promise.all(
    Array.from({ length: count }, (_, i) => tryFetchCat(i))
  )
  const loaded = online.filter((x): x is CatItem => x !== null)

  if (loaded.length >= count) return loaded.slice(0, count)

  const fallback = shuffle(LOCAL_CATS).map((c, i) => ({
    id: `local-${Date.now()}-${i}`,
    type: 'sticker' as const,
    url: c.url,
    alt: c.alt,
  }))

  return [...loaded, ...fallback].slice(0, count)
}
