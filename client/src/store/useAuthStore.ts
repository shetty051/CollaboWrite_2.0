import { create } from 'zustand'

export interface IUser {
  _id: string
  name: string
  email: string
  role: 'reader' | 'writer'
  isAdmin?: boolean
  isSuspended?: boolean
  avatarUrl?: string
  bio?: string
  isEmailVerified: boolean
}

interface AuthState {
  user: IUser | null
  isAuthenticated: boolean
  isHydrated: boolean
  setUser: (user: IUser | null) => void
  checkAuth: () => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isHydrated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  checkAuth: async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const json = await res.json()
        if (json.success && json.data) {
          set({ user: json.data, isAuthenticated: true })
        } else {
          set({ user: null, isAuthenticated: false })
        }
      } else {
        set({ user: null, isAuthenticated: false })
      }
    } catch {
      set({ user: null, isAuthenticated: false })
    } finally {
      set({ isHydrated: true })
    }
  },

  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      set({ user: null, isAuthenticated: false })
    }
  },
}))
