export interface FavoriteItem {
  id: string
  type: 'tale' | 'image' | 'gif'
  itemId: string
  title?: string
  preview?: string
  createdAt: string
}

export interface PlayHistory {
  taleId: string
  positionSec: number
  updatedAt: string
}

export interface TaskProgress {
  taskId: string
  date: string
  done: boolean
  completedAt?: string
}

const FAV_KEY = 'sonya_favorites'
const HISTORY_KEY = 'sonya_play_history'
const TASKS_KEY = 'sonya_tasks'
const AUTH_KEY = 'sonya_auth'

export function getAuth(): { role: 'user' | 'admin'; token: string } | null {
  const raw = localStorage.getItem(AUTH_KEY)
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

export function setAuth(role: 'user' | 'admin'): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify({ role, token: crypto.randomUUID() }))
}

export function clearAuth(): void {
  localStorage.removeItem(AUTH_KEY)
}

export function getFavorites(): FavoriteItem[] {
  try { return JSON.parse(localStorage.getItem(FAV_KEY) ?? '[]') } catch { return [] }
}

export function saveFavorites(items: FavoriteItem[]): void {
  localStorage.setItem(FAV_KEY, JSON.stringify(items))
}

export function toggleFavorite(item: Omit<FavoriteItem, 'id' | 'createdAt'>): boolean {
  const favs = getFavorites()
  const idx = favs.findIndex(f => f.type === item.type && f.itemId === item.itemId)
  if (idx >= 0) {
    favs.splice(idx, 1)
    saveFavorites(favs)
    return false
  }
  favs.push({ ...item, id: crypto.randomUUID(), createdAt: new Date().toISOString() })
  saveFavorites(favs)
  return true
}

export function isFavorite(type: string, itemId: string): boolean {
  return getFavorites().some(f => f.type === type && f.itemId === itemId)
}

export function getPlayHistory(): Record<string, PlayHistory> {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '{}') } catch { return {} }
}

export function savePlayPosition(taleId: string, positionSec: number): void {
  const h = getPlayHistory()
  h[taleId] = { taleId, positionSec, updatedAt: new Date().toISOString() }
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h))
}

export function getTaskProgress(): TaskProgress[] {
  try { return JSON.parse(localStorage.getItem(TASKS_KEY) ?? '[]') } catch { return [] }
}

export function toggleTask(taskId: string, date: string): boolean {
  const tasks = getTaskProgress()
  const idx = tasks.findIndex(t => t.taskId === taskId && t.date === date)
  if (idx >= 0) {
    tasks[idx].done = !tasks[idx].done
    tasks[idx].completedAt = tasks[idx].done ? new Date().toISOString() : undefined
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
    return tasks[idx].done
  }
  tasks.push({ taskId, date, done: true, completedAt: new Date().toISOString() })
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
  return true
}

export function isTaskDone(taskId: string, date: string): boolean {
  return getTaskProgress().some(t => t.taskId === taskId && t.date === date && t.done)
}
