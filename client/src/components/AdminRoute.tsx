import React, { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { toast } from '../store/useToastStore'

interface AdminRouteProps {
  children: React.ReactNode
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isAuthenticated, isHydrated } = useAuthStore()

  useEffect(() => {
    if (isHydrated && (!isAuthenticated || !user?.isAdmin)) {
      toast.error('Access denied: Admin privileges required.')
    }
  }, [isHydrated, isAuthenticated, user])

  if (!isHydrated) {
    return (
      <div className="flex justify-center items-center h-screen bg-bg text-text-muted text-xs font-sans">
        Verifying administrator credentials...
      </div>
    )
  }

  if (!isAuthenticated || !user?.isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
