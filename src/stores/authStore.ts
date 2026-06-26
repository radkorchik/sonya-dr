import { create } from 'zustand'
import { getAuth, setAuth, clearAuth } from '@/lib/localData'
import { ENTRY_PASSWORD, ADMIN_PASSWORD } from '@/lib/time'

interface AuthState {
  role: 'user' | 'admin' | null
  isReady: boolean
  init: () => void
  login: (password: string, asAdmin?: boolean) => boolean
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  role: null,
  isReady: false,
  init: () => {
    const auth = getAuth()
    set({ role: auth?.role ?? null, isReady: true })
  },
  login: (password, asAdmin) => {
    if (asAdmin && password === ADMIN_PASSWORD) {
      setAuth('admin')
      set({ role: 'admin' })
      return true
    }
    if (password === ENTRY_PASSWORD) {
      setAuth('user')
      set({ role: 'user' })
      return true
    }
    return false
  },
  logout: () => {
    clearAuth()
    set({ role: null })
  },
}))
