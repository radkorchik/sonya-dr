import greetings from '../../content/Приветствия.json'
import compliments from '../../content/Комплименты.json'
import leshaPhrases from '../../content/Что_сказал_бы_Леша.json'
import missYou from '../../content/Скучаю.json'
import moods from '../../content/Настроения_дня.json'
import tasks from '../../content/Задания_заботы.json'
import goodnight from '../../content/Перед_сном.json'

export { greetings, compliments, leshaPhrases, missYou, moods, tasks, goodnight }

export type GreetingPeriod = 'morning' | 'day' | 'evening'

export function getGreetingPool(period: GreetingPeriod): string[] {
  const g = greetings as unknown as Record<string, string[]>
  return g[period] ?? []
}

export function getComplimentsPool(): string[] {
  return (compliments as { compliments: string[] }).compliments
}

export function getLeshaPool(): string[] {
  const data = leshaPhrases as { lines?: string[]; phrases?: string[] }
  return data.lines ?? data.phrases ?? []
}

export function getMissYouPool(): string[] {
  const data = missYou as { messages?: string[]; miss_you?: string[] }
  return data.messages ?? data.miss_you ?? []
}

export function getMoodsPool(): Array<{ emoji: string; mood: string; caption: string }> {
  const data = moods as { moods?: Array<{ emoji: string; mood: string; caption: string }> }
  return data.moods ?? []
}

export function getTasksPool(): Array<{ id: string; text: string; track?: boolean }> {
  const data = tasks as { tasks?: Array<{ id: string; text: string; track?: boolean }> }
  return data.tasks ?? []
}

export function getGoodnightPool(): string[] {
  const data = goodnight as { lines?: string[] }
  return data.lines ?? []
}
