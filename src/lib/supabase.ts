import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseEnabled = Boolean(url && key)

let client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!isSupabaseEnabled) throw new Error('Supabase не настроен')
  if (!client) client = createClient(url!, key!)
  return client
}

export function publicStorageUrl(bucket: string, path: string): string {
  return `${url}/storage/v1/object/public/${bucket}/${path}`
}
