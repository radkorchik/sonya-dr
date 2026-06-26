import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { AppLayout } from '@/components/layout/AppLayout'

const Login = lazy(() => import('@/pages/Login'))
const Home = lazy(() => import('@/pages/Home'))
const Tales = lazy(() => import('@/pages/Tales'))
const TalePlayer = lazy(() => import('@/pages/TalePlayer'))
const Relax = lazy(() => import('@/pages/Relax'))
const Game = lazy(() => import('@/pages/Game'))
const Favorites = lazy(() => import('@/pages/Favorites'))
const Together = lazy(() => import('@/pages/Together'))
const Compliment = lazy(() => import('@/pages/Compliment'))
const Mood = lazy(() => import('@/pages/Mood'))
const Weather = lazy(() => import('@/pages/Weather'))
const Goodnight = lazy(() => import('@/pages/Goodnight'))
const MissYou = lazy(() => import('@/pages/MissYou'))
const LeshaPhrase = lazy(() => import('@/pages/LeshaPhrase'))
const CareTasks = lazy(() => import('@/pages/CareTasks'))
const AddTale = lazy(() => import('@/pages/AddTale'))
const EditTale = lazy(() => import('@/pages/EditTale'))

function Loading() {
  return (
    <div className="min-h-dvh flex items-center justify-center">
      <img src="/stickers/sticker7.webp" alt="" className="w-12 h-12 animate-pulseHeart object-contain" />
    </div>
  )
}

function LoginRoute() {
  const role = useAuthStore(s => s.role)
  if (role) return <Navigate to="/" replace />
  return <Login />
}

function Protected({ children }: { children: React.ReactNode }) {
  const role = useAuthStore(s => s.role)
  if (!role) return <Navigate to="/login" replace />
  return <>{children}</>
}


export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route element={<Protected><AppLayout /></Protected>}>
            <Route index element={<Home />} />
            <Route path="tales" element={<Tales />} />
            <Route path="tales/add" element={<AddTale />} />
            <Route path="tales/:id/edit" element={<EditTale />} />
            <Route path="tales/:id" element={<TalePlayer />} />
            <Route path="relax" element={<Relax />} />
            <Route path="game" element={<Game />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="together" element={<Together />} />
            <Route path="compliment" element={<Compliment />} />
            <Route path="mood" element={<Mood />} />
            <Route path="weather" element={<Weather />} />
            <Route path="goodnight" element={<Goodnight />} />
            <Route path="miss-you" element={<MissYou />} />
            <Route path="lesha" element={<LeshaPhrase />} />
            <Route path="tasks" element={<CareTasks />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}