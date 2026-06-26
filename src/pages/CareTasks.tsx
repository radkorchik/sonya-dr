import { useState } from 'react'
import { PageBack } from '@/components/ui/PageBack'
import { GlassCard } from '@/components/ui/GlassCard'
import { Sticker } from '@/components/ui/Sticker'
import { getTasksPool } from '@/data/content'
import { getMoscowDateKey } from '@/lib/time'
import { isTaskDone, toggleTask } from '@/lib/localData'
import { fillPlaceholders } from '@/lib/placeholders'

export default function CareTasks() {
  const dateKey = getMoscowDateKey()
  const dailyTasks = getTasksPool().slice(0, 5)
  const [, tick] = useState(0)

  const handleToggle = (taskId: string) => {
    toggleTask(taskId, dateKey)
    tick(t => t + 1)
  }

  const done = dailyTasks.filter(t => isTaskDone(t.id, dateKey)).length

  return (
    <div className="page-container">
      <PageBack />
      <div className="flex items-center gap-2 mb-2">
        <Sticker name="pearlHeart" size={32} />
        <h1 className="font-display text-2xl font-bold text-ink-900">Задания заботы</h1>
      </div>
      <p className="text-ink-500 mb-4">{done}/{dailyTasks.length} выполнено сегодня</p>
      <div className="w-full h-2 bg-blush-100 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-pink-400 to-pink-500 rounded-full transition-all duration-300"
          style={{ width: `${(done / dailyTasks.length) * 100}%` }}
        />
      </div>
      <div className="space-y-3">
        {dailyTasks.map(task => {
          const taskDone = isTaskDone(task.id, dateKey)
          return (
            <GlassCard key={task.id} onClick={() => handleToggle(task.id)} className="flex items-start gap-3">
              <Sticker name={taskDone ? 'laceHeart' : 'pearlHeart'} size={24} className="shrink-0 mt-0.5" />
              <p className={`text-sm leading-relaxed ${taskDone ? 'line-through text-ink-500' : 'text-ink-700'}`}>
                {fillPlaceholders(task.text, dateKey + task.id)}
              </p>
            </GlassCard>
          )
        })}
      </div>
    </div>
  )
}
