import { useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BottomNav } from '@/components/ui/BottomNav'
import { FallingParticles } from '@/components/effects/FallingParticles'
import { Toast } from '@/components/ui/Toast'
import { WelcomeSplash } from '@/components/layout/WelcomeSplash'
import { PullToRefresh } from '@/components/layout/PullToRefresh'
import { PlayerProvider, usePlayerOptional } from '@/components/player/PlayerContext'
import { pageTransition } from '@/components/motion/presets'

function AnimatedOutlet() {
  const location = useLocation()
  return (
    <motion.div
      key={location.pathname}
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      transition={pageTransition.transition}
    >
      <Outlet />
    </motion.div>
  )
}

function LayoutBody() {
  const scrollRef = useRef<HTMLElement>(null)
  const [splashDone, setSplashDone] = useState(false)
  const player = usePlayerOptional()
  const hasMiniPlayer = !!player?.tale && player.miniVisible

  return (
    <>
      <FallingParticles />
      <Toast />
      {!splashDone && <WelcomeSplash onDone={() => setSplashDone(true)} />}
      <PullToRefresh scrollRef={scrollRef}>
        <main
          ref={scrollRef}
          className={`app-scroll relative z-10 ${hasMiniPlayer ? 'has-mini-player' : ''}`}
        >
          <AnimatedOutlet />
        </main>
      </PullToRefresh>
      <BottomNav />
    </>
  )
}

export function AppLayout() {
  return (
    <div className="app-shell">
      <div className="app-bg" aria-hidden />
      <PlayerProvider>
        <LayoutBody />
      </PlayerProvider>
    </div>
  )
}
