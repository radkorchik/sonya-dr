import { openDB, type DBSchema, type IDBPDatabase } from 'idb'

export interface Tale {
  id: string
  title: string
  description: string
  coverUrl: string | null
  audioUrl: string
  audioFormat: string
  durationSec: number
  createdAt: string
  updatedAt: string
}

interface SonyaDB extends DBSchema {
  tales: {
    key: string
    value: Tale
    indexes: { 'by-created': string }
  }
  audioBlobs: {
    key: string
    value: { id: string; blob: Blob }
  }
  coverBlobs: {
    key: string
    value: { id: string; blob: Blob }
  }
}

let dbPromise: Promise<IDBPDatabase<SonyaDB>> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<SonyaDB>('sonya-gift', 1, {
      upgrade(db) {
        const tales = db.createObjectStore('tales', { keyPath: 'id' })
        tales.createIndex('by-created', 'createdAt')
        db.createObjectStore('audioBlobs', { keyPath: 'id' })
        db.createObjectStore('coverBlobs', { keyPath: 'id' })
      },
    })
  }
  return dbPromise
}

export async function getAllTales(): Promise<Tale[]> {
  const db = await getDB()
  const tales = await db.getAll('tales')
  return tales.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function getTale(id: string): Promise<Tale | undefined> {
  const db = await getDB()
  return db.get('tales', id)
}

export async function saveTale(tale: Tale): Promise<void> {
  const db = await getDB()
  await db.put('tales', tale)
}

export async function deleteTale(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('tales', id)
  await db.delete('audioBlobs', id)
  await db.delete('coverBlobs', id)
}

export async function saveAudioBlob(id: string, blob: Blob): Promise<string> {
  const db = await getDB()
  await db.put('audioBlobs', { id, blob })
  return URL.createObjectURL(blob)
}

export async function saveCoverBlob(id: string, blob: Blob): Promise<string> {
  const db = await getDB()
  await db.put('coverBlobs', { id, blob })
  return URL.createObjectURL(blob)
}

export async function getAudioUrl(id: string, fallback: string): Promise<string> {
  const db = await getDB()
  const rec = await db.get('audioBlobs', id)
  if (rec) return URL.createObjectURL(rec.blob)
  return fallback
}

export async function getCoverUrl(id: string, fallback: string | null): Promise<string | null> {
  const db = await getDB()
  const rec = await db.get('coverBlobs', id)
  if (rec) return URL.createObjectURL(rec.blob)
  return fallback
}

export async function resolveTaleUrls(tale: Tale): Promise<Tale> {
  return {
    ...tale,
    audioUrl: await getAudioUrl(tale.id, tale.audioUrl),
    coverUrl: await getCoverUrl(tale.id, tale.coverUrl),
  }
}

export function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const audio = document.createElement('audio')
    audio.preload = 'metadata'
    audio.onloadedmetadata = () => {
      resolve(Math.round(audio.duration) || 0)
      URL.revokeObjectURL(audio.src)
    }
    audio.onerror = () => resolve(0)
    audio.src = URL.createObjectURL(file)
  })
}

export function generateId(): string {
  return crypto.randomUUID()
}
