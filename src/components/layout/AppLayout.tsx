import { Outlet } from 'react-router-dom'
import { BottomNav } from '@/components/ui/BottomNav'
import { FallingParticles } from '@/components/effects/FallingParticles'
import { Toast } from '@/components/ui/Toast'

export function AppLayout() {
  return (
    <div className="relative min-h-dvh bg-gradient-to-b from-cream via-blush-50 to-blush-100">
      <FallingParticles />
      <Toast />
      <main className="relative z-10">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
