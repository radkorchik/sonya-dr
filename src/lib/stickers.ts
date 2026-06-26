/** Все стикеры из /public/stickers */
export const STICKERS = {
  cat: '/stickers/sticker.webp',
  bow: '/stickers/sticker2.webp',
  bouquet: '/stickers/sticker3.webp',
  lily: '/stickers/sticker4.webp',
  magnolia: '/stickers/sticker5.webp',
  deer: '/stickers/sticker6.webp',
  laceHeart: '/stickers/sticker7.webp',
  handsHeart: '/stickers/sticker8.webp',
  teddy: '/stickers/sticker9.webp',
  bunny: '/stickers/sticker10.webp',
  camera: '/stickers/sticker11.webp',
  envelope: '/stickers/sticker12.webp',
  floralBow: '/stickers/sticker13.webp',
  pearlHeart: '/stickers/sticker14.webp',
  ballet: '/stickers/sticker15.webp',
  togetherHeart: '/stickers/sticker16.webp',
} as const

export type StickerKey = keyof typeof STICKERS

/** Для падающих частиц — лёгкие декоративные */
export const FALLING_STICKERS: StickerKey[] = [
  'laceHeart', 'pearlHeart', 'bow', 'lily', 'floralBow', 'magnolia',
]

/** Предзагрузка изображений (для canvas и плавности) */
const cache = new Map<string, HTMLImageElement>()

export function preloadStickers(keys: StickerKey[] = Object.keys(STICKERS) as StickerKey[]): Promise<void> {
  return Promise.all(
    keys.map(key => {
      const src = STICKERS[key]
      if (cache.has(src)) return Promise.resolve()
      return new Promise<void>((resolve) => {
        const img = new Image()
        img.onload = () => { cache.set(src, img); resolve() }
        img.onerror = () => resolve()
        img.src = src
      })
    })
  ).then(() => {})
}

export function getStickerImage(key: StickerKey): HTMLImageElement | undefined {
  return cache.get(STICKERS[key])
}

export function stickerSrc(key: StickerKey): string {
  return STICKERS[key]
}

/** Иконки для виджетов главной */
export const WIDGET_STICKERS: Record<string, StickerKey> = {
  together: 'handsHeart',
  compliment: 'bouquet',
  mood: 'cat',
  weather: 'magnolia',
  tasks: 'pearlHeart',
  missYou: 'handsHeart',
  lesha: 'envelope',
  tales: 'envelope',
  relax: 'cat',
  game: 'ballet',
  favorites: 'laceHeart',
  goodnight: 'teddy',
}

/** Погода — стикер вместо emoji */
export const WEATHER_STICKERS: Record<string, StickerKey> = {
  rain: 'lily',
  snow: 'bunny',
  cold: 'teddy',
  hot: 'magnolia',
  clear: 'magnolia',
  cloudy: 'lily',
  storm: 'floralBow',
  wind: 'floralBow',
  chilly: 'bouquet',
  comfortable: 'magnolia',
}
