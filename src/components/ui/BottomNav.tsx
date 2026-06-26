import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, BookOpen, Cat, Gamepad2, Heart } from 'lucide-react'

const items = [
  { to: '/', icon: Home, label: 'Главная' },
  { to: '/tales', icon: BookOpen, label: 'Сказки' },
  { to: '/relax', icon: Cat, label: 'Отдых' },
  { to: '/game', icon: Gamepad2, label: 'Игра' },
  { to: '/favorites', icon: Heart, label: 'Избранное' },
]

export function BottomNav() {
  const { pathname } = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/60 pb-safe">
      <div className="max-w-lg mx-auto flex justify-around items-center px-2 py-2">
        {items.map(({ to, icon: Icon, label }) => {
          const active = to === '/' ? pathname === '/' : pathname.startsWith(to)
          return (
            <NavLink key={to} to={to} className="flex flex-col items-center min-w-[56px] min-h-[44px] justify-center">
              <motion.div
                animate={{ scale: active ? 1.15 : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className={active ? 'text-pink-500 drop-shadow-glow' : 'text-ink-500'}
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 2} fill={active ? 'currentColor' : 'none'} />
              </motion.div>
              <span className={`text-[10px] mt-0.5 ${active ? 'text-pink-500 font-semibold' : 'text-ink-500'}`}>
                {label}
              </span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
