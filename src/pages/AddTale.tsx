import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageBack } from '@/components/ui/PageBack'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlassInput } from '@/components/ui/GlassInput'
import { PillButton } from '@/components/ui/PillButton'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'
import { createTale, isCloudSync } from '@/lib/talesApi'
import { getTaskProgress } from '@/lib/localData'

export default function AddTale() {
  const navigate = useNavigate()
  const isAdmin = useAuthStore(s => s.role) === 'admin'
  const showToast = useToastStore(s => s.show)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [stats, setStats] = useState<{ date: string; done: number; total: number }[]>([])

  useEffect(() => {
    if (!isAdmin) return
    const tasks = getTaskProgress()
    const byDate: Record<string, { done: number; total: number }> = {}
    for (const t of tasks) {
      if (!byDate[t.date]) byDate[t.date] = { done: 0, total: 0 }
      byDate[t.date].total++
      if (t.done) byDate[t.date].done++
    }
    setStats(Object.entries(byDate).map(([date, v]) => ({ date, ...v })).sort((a, b) => b.date.localeCompare(a.date)))
  }, [isAdmin])

  const handleSave = async () => {
    if (!title.trim() || !audioFile) return
    setSaving(true)
    try {
      await createTale({ title, description, audioFile, coverFile })
      showToast('Сказка добавлена')
      navigate('/tales')
    } catch {
      showToast('Не удалось сохранить')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-container">
      <PageBack to="/tales" />
      <h1 className="font-display text-2xl font-bold text-ink-900 mb-4">Добавить сказку</h1>

      {!isCloudSync() && (
        <p className="text-xs text-ink-500 mb-3 glass rounded-xl px-3 py-2">
          Сейчас сказки только в этом браузере. Подключи Supabase — см. файл supabase/schema.sql
        </p>
      )}

      <GlassCard pink className="mb-6 space-y-3">
        <GlassInput placeholder="Название" value={title} onChange={e => setTitle(e.target.value)} />
        <GlassInput placeholder="Описание" value={description} onChange={e => setDescription(e.target.value)} />
        <label className="block">
          <span className="text-sm text-ink-500">Аудио (mp3, m4a, wav…)</span>
          <input type="file" accept="audio/*,.mp3,.m4a,.wav,.ogg,.flac,.aac,.webm,audio/mpeg,audio/mp4,audio/x-m4a,audio/wav,audio/ogg" className="mt-1 w-full text-sm" onChange={e => setAudioFile(e.target.files?.[0] ?? null)} />
        </label>
        <label className="block">
          <span className="text-sm text-ink-500">Обложка (опционально)</span>
          <input type="file" accept="image/*" className="mt-1 w-full text-sm" onChange={e => setCoverFile(e.target.files?.[0] ?? null)} />
        </label>
        <PillButton onClick={handleSave} disabled={saving || !title || !audioFile} className="w-full">
          {saving ? 'Сохраняю…' : 'Сохранить'}
        </PillButton>
      </GlassCard>

      {isAdmin && (
        <>
          <h2 className="font-semibold text-ink-900 mb-2">Статистика заботы</h2>
          {stats.length === 0 ? (
            <GlassCard className="text-ink-500 text-sm">Пока нет данных</GlassCard>
          ) : (
            stats.slice(0, 14).map(s => (
              <GlassCard key={s.date} className="flex justify-between mb-2 text-sm">
                <span>{s.date}</span>
                <span className="text-pink-500">{s.done}/{s.total}</span>
              </GlassCard>
            ))
          )}
        </>
      )}
    </div>
  )
}
