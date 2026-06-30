import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, BookOpen, Cat, Gamepad2, Heart } from 'lucide-react'
import { tapSpring } from '@/components/motion/presets'

const items = [
  { to: '/relax', icon: Cat, label: 'Отдых' },
  { to: '/tales', icon: BookOpen, label: 'Сказки' },
  { to: '/', icon: Home, label: 'Главная' },
  { to: '/game', icon: Gamepad2, label: 'Игра' },
  { to: '/favorites', icon: Heart, label: 'Избранное' },
]

export function BottomNav() {
  const { pathname } = useLocation()

  return (
    <nav
      className="app-nav fixed bottom-0 left-0 right-0 z-50 pb-safe touch-none"
      style={{
        background: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        boxShadow: '0 -1px 0 rgba(255, 255, 255, 0.5)',
      }}
    >
      <div className="max-w-lg mx-auto flex justify-around items-center px-1 py-1.5">
        {items.map(({ to, icon: Icon, label }) => {
          const active = to === '/' ? pathname === '/' : pathname.startsWith(to)
          return (
            <NavLink key={to} to={to} className="flex flex-col items-center min-w-[56px] min-h-[44px] justify-center touch-manipulation">
              <motion.div
                animate={{ scale: active ? 1.12 : 1 }}
                whileTap={tapSpring.whileTap}
                transition={{ type: 'spring', stiffness: 420, damping: 22 }}
                className={active ? 'text-pink-500 drop-shadow-glow' : 'text-ink-500'}
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 2} fill={active ? 'currentColor' : 'none'} />
              </motion.div>
              <motion.span
                animate={{ opacity: active ? 1 : 0.75, y: active ? 0 : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                className={`text-[10px] mt-0.5 ${active ? 'text-pink-500 font-semibold' : 'text-ink-500'}`}
              >
                {label}
              </motion.span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
