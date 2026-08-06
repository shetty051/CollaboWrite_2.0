import { create } from 'zustand'

export type ToastType = 'success' | 'info' | 'error'

export interface ToastMessage {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastState {
  toasts: ToastMessage[]
  addToast: (message: string, type?: ToastType, duration?: number) => void
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (message, type = 'success', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9)
    set((state) => ({
      toasts: [...state.toasts, { id, message, type, duration }],
    }))

    // Auto-remove after duration
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }))
    }, duration)
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}))

// Export a quick helper function to use anywhere
export const toast = {
  success: (msg: string, duration?: number) =>
    useToastStore.getState().addToast(msg, 'success', duration),
  info: (msg: string, duration?: number) =>
    useToastStore.getState().addToast(msg, 'info', duration),
  error: (msg: string, duration?: number) =>
    useToastStore.getState().addToast(msg, 'error', duration),
}
