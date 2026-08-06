import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, Info, AlertCircle } from 'lucide-react'
import { useToastStore } from '../../store/useToastStore'

export const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore()

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    info: <Info className="w-5 h-5 text-accent" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500" />,
  }

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 10, transition: { duration: 0.15 } }}
            className="pointer-events-auto flex items-start gap-3 p-4 bg-surface border border-border rounded-xl shadow-lg shadow-shadow text-text font-sans text-sm w-full"
          >
            <div className="mt-0.5">{icons[toast.type]}</div>
            <div className="flex-1 font-medium">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-text-muted hover:text-text cursor-pointer transition-colors p-0.5 rounded-full hover:bg-bg border border-transparent hover:border-border"
              aria-label="Dismiss Notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
