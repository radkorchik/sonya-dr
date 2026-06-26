import { type ReactNode } from 'react'
import { type StickerKey, stickerSrc } from '@/lib/stickers'

interface StickerProps {
  name: StickerKey
  size?: number
  className?: string
  alt?: string
}

export function Sticker({ name, size = 32, className = '', alt = '' }: StickerProps) {
  return (
    <img
      src={stickerSrc(name)}
      alt={alt}
      width={size}
      height={size}
      className={`object-contain inline-block select-none pointer-events-none ${className}`}
      draggable={false}
      loading="eager"
      decoding="async"
    />
  )
}

interface WidgetGridProps {
  children: ReactNode[]
}

/** Сетка 2 колонки; последний нечётный элемент — по центру */
export function WidgetGrid({ children }: WidgetGridProps) {
  const items = children.filter(Boolean)
  const hasOddLast = items.length % 2 === 1
  const main = hasOddLast ? items.slice(0, -1) : items
  const last = hasOddLast ? items[items.length - 1] : null

  return (
    <div className="grid grid-cols-2 gap-3">
      {main}
      {last && (
        <div className="col-span-2 flex justify-center">
          <div className="w-[calc(50%-0.375rem)]">{last}</div>
        </div>
      )}
    </div>
  )
}
