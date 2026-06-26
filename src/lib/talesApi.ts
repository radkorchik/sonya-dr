import {
  getAllTales as localGetAll,
  getTale as localGetTale,
  saveTale as localSave,
  deleteTale as localDelete,
  saveAudioBlob,
  saveCoverBlob,
  getAudioDuration,
  generateId,
  resolveTaleUrls,
  type Tale,
} from './storage'
import { getSupabase, isSupabaseEnabled, publicStorageUrl } from './supabase'

export type { Tale }
export { getAudioDuration, generateId }

type DbRow = {
  id: string
  title: string
  description: string
  cover_path: string | null
  audio_path: string
  audio_format: string
  duration_sec: number
  created_at: string
  updated_at: string
}

function rowToTale(row: DbRow): Tale {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    coverUrl: row.cover_path ? publicStorageUrl('tales-covers', row.cover_path) : null,
    audioUrl: publicStorageUrl('tales-audio', row.audio_path),
    audioFormat: row.audio_format,
    durationSec: row.duration_sec,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}


export async function getAllTales(): Promise<Tale[]> {
  if (isSupabaseEnabled) {
    const { data, error } = await getSupabase().from('tales').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return (data as DbRow[]).map(rowToTale)
  }
  const tales = await localGetAll()
  return Promise.all(tales.map(resolveTaleUrls))
}

export async function getTale(id: string): Promise<Tale | undefined> {
  if (isSupabaseEnabled) {
    const { data, error } = await getSupabase().from('tales').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    return data ? rowToTale(data as DbRow) : undefined
  }
  const tale = await localGetTale(id)
  return tale ? resolveTaleUrls(tale) : undefined
}

async function uploadFile(bucket: string, path: string, file: File): Promise<void> {
  const { error } = await getSupabase().storage.from(bucket).upload(path, file, { upsert: true, cacheControl: '3600' })
  if (error) throw error
}

async function removeFile(bucket: string, path: string): Promise<void> {
  await getSupabase().storage.from(bucket).remove([path])
}

export interface CreateTaleInput {
  title: string
  description: string
  audioFile: File
  coverFile?: File | null
}

export async function createTale(input: CreateTaleInput): Promise<Tale> {
  const durationSec = await getAudioDuration(input.audioFile)
  const ext = input.audioFile.name.split('.').pop()?.toLowerCase() ?? 'mp3'

  if (isSupabaseEnabled) {
    const id = crypto.randomUUID()
    const audioPath = `${id}.${ext}`
    await uploadFile('tales-audio', audioPath, input.audioFile)

    let coverPath: string | null = null
    if (input.coverFile) {
      const cext = input.coverFile.name.split('.').pop()?.toLowerCase() ?? 'jpg'
      coverPath = `${id}.${cext}`
      await uploadFile('tales-covers', coverPath, input.coverFile)
    }

    const { data, error } = await getSupabase().from('tales').insert({
      id,
      title: input.title.trim(),
      description: input.description.trim(),
      audio_path: audioPath,
      audio_format: ext,
      cover_path: coverPath,
      duration_sec: durationSec,
    }).select().single()

    if (error) throw error
    return rowToTale(data as DbRow)
  }

  const id = generateId()
  const audioUrl = await saveAudioBlob(id, input.audioFile)
  let coverUrl: string | null = null
  if (input.coverFile) coverUrl = await saveCoverBlob(id, input.coverFile)
  const now = new Date().toISOString()
  const tale: Tale = {
    id, title: input.title.trim(), description: input.description.trim(),
    coverUrl, audioUrl, audioFormat: ext, durationSec, createdAt: now, updatedAt: now,
  }
  await localSave(tale)
  return tale
}

export interface UpdateTaleInput {
  id: string
  title: string
  description: string
  audioFile?: File | null
  coverFile?: File | null
  removeCover?: boolean
}

export async function updateTale(input: UpdateTaleInput): Promise<Tale> {
  if (isSupabaseEnabled) {
    const existing = await getTale(input.id)
    if (!existing) throw new Error('Сказка не найдена')

    const { data: row } = await getSupabase().from('tales').select('*').eq('id', input.id).single()
    const dbRow = row as DbRow

    let audioPath = dbRow.audio_path
    let coverPath = dbRow.cover_path
    let durationSec = dbRow.duration_sec
    let audioFormat = dbRow.audio_format

    if (input.audioFile) {
      const ext = input.audioFile.name.split('.').pop()?.toLowerCase() ?? 'mp3'
      audioPath = `${input.id}.${ext}`
      durationSec = await getAudioDuration(input.audioFile)
      audioFormat = ext
      await uploadFile('tales-audio', audioPath, input.audioFile)
      if (dbRow.audio_path !== audioPath) await removeFile('tales-audio', dbRow.audio_path).catch(() => {})
    }

    if (input.removeCover) {
      if (coverPath) await removeFile('tales-covers', coverPath).catch(() => {})
      coverPath = null
    } else if (input.coverFile) {
      const cext = input.coverFile.name.split('.').pop()?.toLowerCase() ?? 'jpg'
      const newPath = `${input.id}.${cext}`
      if (coverPath && coverPath !== newPath) await removeFile('tales-covers', coverPath).catch(() => {})
      coverPath = newPath
      await uploadFile('tales-covers', coverPath, input.coverFile)
    }

    const { data, error } = await getSupabase().from('tales').update({
      title: input.title.trim(),
      description: input.description.trim(),
      audio_path: audioPath,
      audio_format: audioFormat,
      cover_path: coverPath,
      duration_sec: durationSec,
    }).eq('id', input.id).select().single()

    if (error) throw error
    return rowToTale(data as DbRow)
  }

  const existing = await localGetTale(input.id)
  if (!existing) throw new Error('Сказка не найдена')

  let audioUrl = existing.audioUrl
  let coverUrl = existing.coverUrl
  let durationSec = existing.durationSec
  let audioFormat = existing.audioFormat

  if (input.audioFile) {
    audioUrl = await saveAudioBlob(input.id, input.audioFile)
    durationSec = await getAudioDuration(input.audioFile)
    audioFormat = input.audioFile.name.split('.').pop() ?? 'mp3'
  }
  if (input.removeCover) coverUrl = null
  else if (input.coverFile) coverUrl = await saveCoverBlob(input.id, input.coverFile)

  const tale: Tale = {
    ...existing,
    title: input.title.trim(),
    description: input.description.trim(),
    audioUrl, coverUrl, durationSec, audioFormat,
    updatedAt: new Date().toISOString(),
  }
  await localSave(tale)
  return resolveTaleUrls(tale)
}

export async function deleteTale(id: string): Promise<void> {
  if (isSupabaseEnabled) {
    const { data } = await getSupabase().from('tales').select('audio_path, cover_path').eq('id', id).maybeSingle()
    if (data) {
      const d = data as { audio_path: string; cover_path: string | null }
      await removeFile('tales-audio', d.audio_path).catch(() => {})
      if (d.cover_path) await removeFile('tales-covers', d.cover_path).catch(() => {})
    }
    const { error } = await getSupabase().from('tales').delete().eq('id', id)
    if (error) throw error
    return
  }
  await localDelete(id)
}

export function isCloudSync(): boolean {
  return isSupabaseEnabled
}
