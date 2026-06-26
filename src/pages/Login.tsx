import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlassInput } from '@/components/ui/GlassInput'
import { PillButton } from '@/components/ui/PillButton'
import { Sticker } from '@/components/ui/Sticker'
import { useAuthStore } from '@/stores/authStore'
import { FallingParticles } from '@/components/effects/FallingParticles'

export default function Login() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [adminMode, setAdminMode] = useState(false)
  const [tapCount, setTapCount] = useState(0)
  const login = useAuthStore(s => s.login)
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const ok = login(password, adminMode)
    if (ok) navigate('/', { replace: true })
    else {
      setError(true)
      setPassword('')
      setTimeout(() => setError(false), 600)
    }
  }

  const handleHeartTap = () => {
    const next = tapCount + 1
    setTapCount(next)
    if (next >= 5) setAdminMode(true)
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 bg-gradient-to-b from-cream via-blush-50 to-blush-100 relative">
      <FallingParticles />
      <div className="relative z-10 w-full max-w-sm">
        <GlassCard className="text-center">
          <button type="button" onClick={handleHeartTap} className="mx-auto mb-4 block">
            <Sticker name="pearlHeart" size={64} className="mx-auto animate-pulseHeart" />
          </button>
          <h1 className="font-display text-3xl font-bold text-ink-900 mb-1">Соне</h1>
          <p className="text-ink-500 mb-6 font-script text-xl">
            {adminMode ? 'Вход для Лёши' : 'Добро пожаловать, моя принцесса'}
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className={error ? 'animate-shake' : ''}>
              <GlassInput
                type="password"
                inputMode="numeric"
                placeholder="Пароль"
                value={password}
                onChange={e => setPassword(e.target.value)}
                error={error}
                autoComplete="current-password"
              />
            </div>
            {error && <p className="text-pink-500 text-sm">Неверный пароль</p>}
            <PillButton type="submit" className="w-full">Войти</PillButton>
          </form>
        </GlassCard>
      </div>
    </div>
  )
}
