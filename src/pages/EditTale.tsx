import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { PageBack } from '@/components/ui/PageBack'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlassInput } from '@/components/ui/GlassInput'
import { PillButton } from '@/components/ui/PillButton'
import { Sticker } from '@/components/ui/Sticker'
import { useToastStore } from '@/stores/toastStore'
import { getTale, updateTale, deleteTale, type Tale } from '@/lib/talesApi'

export default function EditTale() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const showToast = useToastStore(s => s.show)
  const [tale, setTale] = useState<Tale | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [removeCover, setRemoveCover] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    getTale(id).then(t => {
      if (t) {
        setTale(t)
        setTitle(t.title)
        setDescription(t.description)
      }
    })
  }, [id])

  const handleSave = async () => {
    if (!id || !title.trim()) return
    setSaving(true)
    try {
      await updateTale({
        id,
        title,
        description,
        audioFile,
        coverFile,
        removeCover,
      })
      showToast('Сказка обновлена')
      navigate(`/tales/${id}`)
    } catch {
      showToast('Не удалось сохранить')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!id || !confirm('Удалить сказку навсегда?')) return
    try {
      await deleteTale(id)
      showToast('Сказка удалена')
      navigate('/tales')
    } catch {
      showToast('Не удалось удалить')
    }
  }

  if (!tale) {
    return <div className="page-container text-center text-ink-500">Загрузка…</div>
  }

  return (
    <div className="page-container">
      <PageBack to={`/tales/${id}`} />
      <h1 className="font-display text-2xl font-bold text-ink-900 mb-4">Редактировать</h1>

      <GlassCard pink className="mb-4 text-center">
        {removeCover ? (
          <Sticker name="envelope" size={80} className="mx-auto" />
        ) : coverFile ? (
          <img src={URL.createObjectURL(coverFile)} alt="" className="w-32 h-32 rounded-2xl object-cover mx-auto" />
        ) : tale.coverUrl ? (
          <img src={tale.coverUrl} alt="" className="w-32 h-32 rounded-2xl object-cover mx-auto" />
        ) : (
          <Sticker name="envelope" size={80} className="mx-auto" />
        )}
      </GlassCard>

      <GlassCard pink className="mb-6 space-y-3">
        <GlassInput placeholder="Название" value={title} onChange={e => setTitle(e.target.value)} />
        <GlassInput placeholder="Описание" value={description} onChange={e => setDescription(e.target.value)} />
        <label className="block">
          <span className="text-sm text-ink-500">Новое аудио (оставь пустым, чтобы не менять)</span>
          <input type="file" accept="audio/*,.mp3,.m4a,.wav,.ogg,.flac,.aac,.webm,audio/mpeg,audio/mp4,audio/x-m4a,audio/wav,audio/ogg" className="mt-1 w-full text-sm" onChange={e => setAudioFile(e.target.files?.[0] ?? null)} />
        </label>
        <label className="block">
          <span className="text-sm text-ink-500">Новая обложка</span>
          <input type="file" accept="image/*" className="mt-1 w-full text-sm" onChange={e => { setCoverFile(e.target.files?.[0] ?? null); setRemoveCover(false) }} />
        </label>
        {tale.coverUrl && (
          <label className="flex items-center gap-2 text-sm text-ink-600">
            <input type="checkbox" checked={removeCover} onChange={e => { setRemoveCover(e.target.checked); if (e.target.checked) setCoverFile(null) }} />
            Убрать обложку
          </label>
        )}
        <PillButton onClick={handleSave} disabled={saving || !title.trim()} className="w-full">
          {saving ? 'Сохраняю…' : 'Сохранить изменения'}
        </PillButton>
      </GlassCard>

      <button
        type="button"
        onClick={handleDelete}
        className="w-full flex items-center justify-center gap-2 glass rounded-2xl py-3 text-pink-500 font-medium"
      >
        <Trash2 size={18} />
        Удалить сказку
      </button>
    </div>
  )
}
