import { useEffect, useState } from 'react'

import { Link } from 'react-router-dom'

import { motion } from 'framer-motion'

import { Search, Plus, Pencil, Trash2 } from 'lucide-react'

import { GlassCard } from '@/components/ui/GlassCard'

import { GlassInput } from '@/components/ui/GlassInput'

import { Sticker } from '@/components/ui/Sticker'

import { FavoriteButton } from '@/components/ui/FavoriteButton'

import { getAllTales, deleteTale, type Tale } from '@/lib/talesApi'

import { useToastStore } from '@/stores/toastStore'

import { FadeIn } from '@/components/motion/FadeIn'

import { tapSpring } from '@/components/motion/presets'



const PAGE_SIZE = 6



function formatDuration(sec: number): string {

  const m = Math.floor(sec / 60)

  const s = sec % 60

  return `${m}:${s.toString().padStart(2, '0')}`

}



export default function Tales() {

  const [tales, setTales] = useState<Tale[]>([])

  const [search, setSearch] = useState('')

  const [page, setPage] = useState(0)

  const showToast = useToastStore(s => s.show)



  const load = () => getAllTales().then(setTales)

  useEffect(() => { load() }, [])



  const handleDelete = async (id: string) => {

    if (!confirm('Удалить сказку?')) return

    await deleteTale(id)

    showToast('Сказка удалена')

    load()

  }



  const filtered = tales.filter(t => {

    const q = search.toLowerCase().trim()

    return !q || t.title.toLowerCase().includes(q)

  })



  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  const pageItems = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)



  return (

    <div className="page-container">

      <div className="flex items-center justify-between mb-4">

          <div className="flex items-center gap-2 min-w-0">

            <Sticker name="envelope" size={28} />

            <h1 className="font-display text-2xl font-bold text-ink-900 truncate">Сказки</h1>

          </div>

          <Link
            to="/tales/add"
            className="glass rounded-full p-2.5 text-pink-500 shrink-0 inline-flex items-center justify-center active:scale-95 transition-transform"
            aria-label="Добавить сказку"
          >

            <Plus size={20} />

          </Link>

        </div>

      <FadeIn delay={0.05}>

        <div className="relative mb-4">

          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />

          <GlassInput

            className="pl-10"

            placeholder="Поиск по названию…"

            value={search}

            onChange={e => { setSearch(e.target.value); setPage(0) }}

          />

        </div>

      </FadeIn>

      {pageItems.length === 0 ? (

        <GlassCard className="text-center text-ink-500 py-8">

          {tales.length === 0 ? 'Сказок пока нет — нажми + и добавь первую' : 'Ничего не найдено'}

        </GlassCard>

      ) : (

        <div className="space-y-3">

          {pageItems.map((tale, i) => (

            <FadeIn key={tale.id} delay={0.08 + i * 0.04}>

              <GlassCard className="flex gap-2 items-center" animate={false}>

                <Link to={`/tales/${tale.id}`} className="flex flex-1 gap-3 items-center min-w-0">

                  {tale.coverUrl ? (

                    <img src={tale.coverUrl} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />

                  ) : (

                    <Sticker name="envelope" size={48} />

                  )}

                  <div className="flex-1 min-w-0">

                    <p className="font-semibold text-ink-900 truncate">{tale.title}</p>

                    <p className="text-xs text-ink-500 line-clamp-2 mt-0.5">{tale.description}</p>

                    <p className="text-xs text-pink-500 mt-1">{formatDuration(tale.durationSec)} · {new Date(tale.createdAt).toLocaleDateString('ru-RU')}</p>

                  </div>

                </Link>

                <div className="flex items-center shrink-0">

                  <motion.div {...tapSpring}>

                    <Link to={`/tales/${tale.id}/edit`} className="p-2 text-ink-400 inline-flex" aria-label="Редактировать">

                      <Pencil size={16} />

                    </Link>

                  </motion.div>

                  <motion.button type="button" onClick={() => handleDelete(tale.id)} className="p-2 text-pink-400" aria-label="Удалить" {...tapSpring}>

                    <Trash2 size={16} />

                  </motion.button>

                  <FavoriteButton

                    item={{ type: 'tale', itemId: tale.id, title: tale.title, preview: tale.coverUrl ?? undefined }}

                  />

                </div>

              </GlassCard>

            </FadeIn>

          ))}

        </div>

      )}

      {totalPages > 1 && (

        <div className="flex justify-center gap-2 mt-4">

          <motion.button type="button" disabled={page === 0} onClick={() => setPage(p => p - 1)} className="glass rounded-full px-4 py-2 text-sm disabled:opacity-40" {...tapSpring}>←</motion.button>

          <span className="text-sm text-ink-500 self-center">{page + 1} / {totalPages}</span>

          <motion.button type="button" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="glass rounded-full px-4 py-2 text-sm disabled:opacity-40" {...tapSpring}>→</motion.button>

        </div>

      )}

    </div>

  )

}

