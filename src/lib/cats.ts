import { saveMediaBlob, catBlobKey } from './mediaStorage'

export interface CatItem {
  id: string
  type: 'photo' | 'gif' | 'sticker'
  url: string
  alt: string
}

const LOCAL_CATS = [
  { url: '/stickers/sticker.webp', alt: 'Милый котик' },
  { url: '/stickers/sticker10.webp', alt: 'Зайчик' },
  { url: '/stickers/sticker6.webp', alt: 'Оленёнок' },
  { url: '/stickers/sticker9.webp', alt: 'Мишка' },
  { url: '/stickers/sticker.webp', alt: 'Котик с бантиком' },
  { url: '/stickers/sticker10.webp', alt: 'Angel bunny' },
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export async function cacheCatBlob(id: string, src: string): Promise<boolean> {
  try {
    const res = await fetch(src, { referrerPolicy: 'no-referrer', cache: 'force-cache' })
    if (!res.ok) return false
    const blob = await res.blob()
    await saveMediaBlob(catBlobKey(id), blob)
    return true
  } catch {
    return false
  }
}

async function tryFetchCat(i: number): Promise<CatItem | null> {
  const ts = Date.now() + i * 997
  const id = `cat-${ts}`
  const isGif = i % 3 === 0
  const url = isGif
    ? `https://cataas.com/cat/gif?${ts}`
    : `https://cataas.com/cat?${ts}`

  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.referrerPolicy = 'no-referrer'
    img.onload = () => {
      const loadedSrc = img.currentSrc || img.src
      void cacheCatBlob(id, loadedSrc)
      resolve({ id, type: isGif ? 'gif' : 'photo', url: loadedSrc, alt: 'Милый котик' })
    }
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

  const fallback = shuffle(LOCAL_CATS).map((c, i) => {
    const id = `local-${Date.now()}-${i}`
    void cacheCatBlob(id, c.url)
    return { id, type: 'sticker' as const, url: c.url, alt: c.alt }
  })

  return [...loaded, ...fallback].slice(0, count)
}
