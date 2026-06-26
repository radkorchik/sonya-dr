import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlassInput } from '@/components/ui/GlassInput'
import { PillButton } from '@/components/ui/PillButton'
import {
  getAllTales, saveTale, deleteTale, saveAudioBlob, saveCoverBlob,
  getAudioDuration, generateId, type Tale,
} from '@/lib/storage'
import { useEffect } from 'react'
import { getTaskProgress } from '@/lib/localData'

export default function AdminTales() {
  const navigate = useNavigate()
  const [tales, setTales] = useState<Tale[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [stats, setStats] = useState<{ date: string; done: number; total: number }[]>([])

  const load = () => getAllTales().then(setTales)
  useEffect(() => { load() }, [])

  useEffect(() => {
    const tasks = getTaskProgress()
    const byDate: Record<string, { done: number; total: number }> = {}
    for (const t of tasks) {
      if (!byDate[t.date]) byDate[t.date] = { done: 0, total: 0 }
      byDate[t.date].total++
      if (t.done) byDate[t.date].done++
    }
    setStats(Object.entries(byDate).map(([date, v]) => ({ date, ...v })).sort((a, b) => b.date.localeCompare(a.date)))
  }, [])

  const handleSave = async () => {
    if (!title.trim() || !audioFile) return
    setSaving(true)
    const id = generateId()
    const durationSec = await getAudioDuration(audioFile)
    const audioUrl = await saveAudioBlob(id, audioFile)
    let coverUrl: string | null = null
    if (coverFile) coverUrl = await saveCoverBlob(id, coverFile)
    const now = new Date().toISOString()
    const tale: Tale = {
      id, title: title.trim(), description: description.trim(),
      coverUrl, audioUrl, audioFormat: audioFile.name.split('.').pop() ?? 'mp3',
      durationSec, createdAt: now, updatedAt: now,
    }
    await saveTale(tale)
    setTitle('')
    setDescription('')
    setAudioFile(null)
    setCoverFile(null)
    await load()
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить сказку?')) return
    await deleteTale(id)
    await load()
  }

  return (
    <div className="page-container">
      <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-ink-500 mb-4">
        <ArrowLeft size={18} /> Назад
      </button>
      <h1 className="font-display text-2xl font-bold text-ink-900 mb-4">Админ-панель 🔧</h1>

      <GlassCard pink className="mb-6 space-y-3">
        <h2 className="font-semibold text-ink-900">Добавить сказку</h2>
        <GlassInput placeholder="Название" value={title} onChange={e => setTitle(e.target.value)} />
        <GlassInput placeholder="Описание" value={description} onChange={e => setDescription(e.target.value)} />
        <label className="block">
          <span className="text-sm text-ink-500">Аудио (mp3, m4a, wav…)</span>
          <input type="file" accept="audio/*" className="mt-1 w-full text-sm" onChange={e => setAudioFile(e.target.files?.[0] ?? null)} />
        </label>
        <label className="block">
          <span className="text-sm text-ink-500">Обложка (опционально)</span>
          <input type="file" accept="image/*" className="mt-1 w-full text-sm" onChange={e => setCoverFile(e.target.files?.[0] ?? null)} />
        </label>
        <PillButton onClick={handleSave} disabled={saving || !title || !audioFile} className="w-full">
          {saving ? 'Сохраняю…' : 'Сохранить'}
        </PillButton>
      </GlassCard>

      <h2 className="font-semibold text-ink-900 mb-2">Сказки ({tales.length})</h2>
      <div className="space-y-2 mb-8">
        {tales.map(t => (
          <GlassCard key={t.id} className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{t.title}</p>
              <p className="text-xs text-ink-500">{Math.floor(t.durationSec / 60)}:{(t.durationSec % 60).toString().padStart(2, '0')}</p>
            </div>
            <button type="button" onClick={() => handleDelete(t.id)} className="p-2 text-pink-500"><Trash2 size={18} /></button>
          </GlassCard>
        ))}
      </div>

      <h2 className="font-semibold text-ink-900 mb-2">Статистика заботы</h2>
      {stats.length === 0 ? (
        <GlassCard className="text-ink-500 text-sm">Пока нет данных</GlassCard>
      ) : (
        stats.slice(0, 14).map(s => (
          <GlassCard key={s.date} className="flex justify-between mb-2 text-sm">
            <span>{s.date}</span>
            <span className="text-pink-500">{s.done}/{s.total} ✓</span>
          </GlassCard>
        ))
      )}
    </div>
  )
}
