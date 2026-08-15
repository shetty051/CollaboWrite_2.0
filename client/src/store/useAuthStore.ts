import { create } from 'zustand'
import { apiFetch } from '../api/apiClient'

export interface IUser {
  id?: string
  _id: string
  firstName?: string
  lastName?: string
  name: string
  email: string
  role: 'reader' | 'writer' | ''
  isAdmin?: boolean
  isSuspended?: boolean
  avatarUrl?: string
  bio?: string
  followerCount?: number
  followingCount?: number
}

interface AuthState {
  user: IUser | null
  isAuthenticated: boolean
  isHydrated: boolean
  loading: boolean
  setUser: (user: IUser | null) => void
  clearUser: () => void
  checkAuth: () => Promise<void>
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; data?: IUser }>
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string; data?: IUser }>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isHydrated: false,
  loading: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  clearUser: () => set({ user: null, isAuthenticated: false }),

  checkAuth: async () => {
    try {
      const res = await apiFetch('/api/auth/me')
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

  login: async (email, password) => {
    set({ loading: true })
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const json = await res.json()
      if (res.ok && json.success) {
        set({ user: json.data, isAuthenticated: true })
        return { success: true, data: json.data }
      } else {
        return { success: false, message: json.message || 'Login failed' }
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error during login' }
    } finally {
      set({ loading: false })
    }
  },

  signup: async (name, email, password) => {
    set({ loading: true })
    try {
      const res = await apiFetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const json = await res.json()
      if (res.ok && json.success) {
        set({ user: json.data, isAuthenticated: true })
        return { success: true, data: json.data }
      } else {
        return { success: false, message: json.message || 'Signup failed' }
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error during signup' }
    } finally {
      set({ loading: false })
    }
  },

  logout: async () => {
    set({ loading: true })
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' })
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      set({ user: null, isAuthenticated: false, loading: false })
    }
  },
}))
