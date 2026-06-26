import { useToastStore } from '@/stores/toastStore'
import { Sticker } from '@/components/ui/Sticker'

export function Toast() {
  const message = useToastStore(s => s.message)
  const visible = useToastStore(s => s.visible)

  if (!visible || !message) return null

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] flex justify-center pointer-events-none"
      style={{ paddingTop: 'max(env(safe-area-inset-top), 12px)' }}
    >
      <div className="glass-pink rounded-full px-5 py-2.5 flex items-center gap-2 shadow-soft animate-[slideDown_0.35s_ease-out] mx-4 max-w-sm">
        <Sticker name="laceHeart" size={22} />
        <span className="text-sm font-semibold text-ink-900">{message}</span>
      </div>
    </div>
  )
}
