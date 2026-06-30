import { openDB, type DBSchema, type IDBPDatabase } from 'idb'

interface MediaDB extends DBSchema {
  blobs: {
    key: string
    value: { id: string; blob: Blob }
  }
}

const DB_NAME = 'sonya-media'
const STORE = 'blobs'

let dbPromise: Promise<IDBPDatabase<MediaDB>> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<MediaDB>(DB_NAME, 1, {
      upgrade(db) {
        db.createObjectStore(STORE, { keyPath: 'id' })
      },
    })
  }
  return dbPromise
}

export async function saveMediaBlob(id: string, blob: Blob): Promise<void> {
  const db = await getDB()
  await db.put(STORE, { id, blob })
}

export async function getMediaBlob(id: string): Promise<Blob | undefined> {
  const db = await getDB()
  return (await db.get(STORE, id))?.blob
}

export async function getMediaBlobUrl(id: string): Promise<string | null> {
  const blob = await getMediaBlob(id)
  return blob ? URL.createObjectURL(blob) : null
}

export async function deleteMediaBlob(id: string): Promise<void> {
  const db = await getDB()
  await db.delete(STORE, id)
}

export async function copyMediaBlob(fromKey: string, toKey: string): Promise<boolean> {
  const blob = await getMediaBlob(fromKey)
  if (!blob) return false
  await saveMediaBlob(toKey, blob)
  return true
}

export const IDB_PREFIX = 'idb:'

export function isIdbPreview(preview?: string): boolean {
  return !!preview?.startsWith(IDB_PREFIX)
}

export function idbPreviewKey(preview: string): string {
  return preview.slice(IDB_PREFIX.length)
}

export function toIdbPreview(id: string): string {
  return `${IDB_PREFIX}${id}`
}

/** Кэш котиков при загрузке — ключ cat-{id} */
export function catBlobKey(id: string): string {
  return `cat-${id}`
}

/** Избранное — ключ fav-{id} */
export function favBlobKey(id: string): string {
  return `fav-${id}`
}

export async function resolvePreviewUrl(preview?: string, itemId?: string): Promise<string | undefined> {
  if (preview && isIdbPreview(preview)) {
    const url = await getMediaBlobUrl(favBlobKey(idbPreviewKey(preview)))
    return url ?? undefined
  }
  if (!preview) {
    if (!itemId) return undefined
    const url = await getMediaBlobUrl(favBlobKey(itemId))
    return url ?? undefined
  }
  return preview
}
