import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { apiFetch } from '../api/apiClient'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { toast } from '../store/useToastStore'
import { PenTool, BookOpen, Sparkles } from 'lucide-react'

export const RoleSelect = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const setUser = useAuthStore((state) => state.setUser)
  const [loading, setLoading] = useState(false)

  // Redirect logic
  useEffect(() => {
    if (isHydrated) {
      if (!isAuthenticated) {
        navigate('/login')
      } else if (user?.role) {
        navigate('/dashboard')
      }
    }
  }, [isAuthenticated, isHydrated, user, navigate])

  const handleRoleSelection = async (selectedRole: 'reader' | 'writer') => {
    setLoading(true)
    try {
      const res = await apiFetch('/api/auth/set-role', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole }),
      })

      const json = await res.json()
      if (res.ok && json.success) {
        setUser(json.data)
        toast.success(`Welcome to CollaboWrite as a ${selectedRole}!`)
        navigate('/dashboard')
      } else {
        toast.error(json.message || 'Failed to select account role.')
      }
    } catch {
      toast.error('Server error updating account role.')
    } finally {
      setLoading(false)
    }
  }

  if (!isHydrated || !isAuthenticated || user?.role) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg text-text transition-colors duration-300 flex flex-col items-center justify-center p-6 md:p-12">
      <div className="w-full max-w-2xl flex flex-col gap-6">
        <div className="text-center">
          <Badge
            variant="primary"
            className="flex items-center gap-1.5 px-4 py-1 mx-auto w-fit mb-3"
          >
            <Sparkles className="w-3.5 h-3.5" /> Onboarding Stage
          </Badge>
          <h2 className="text-3xl font-serif font-bold tracking-tight text-text">
            Choose Your Account Type
          </h2>
          <p className="text-sm text-text-muted mt-2 max-w-md mx-auto leading-relaxed">
            Configure your workspace profile. You can explore literature or collaborate on
            manuscripts in real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Reader Card */}
          <Card
            hoverEffect={true}
            className="p-8 flex flex-col justify-between items-center text-center gap-6 border-border/80 shadow-md"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-accent/5 text-accent border border-accent/25 rounded-2xl animate-pulse">
                <BookOpen className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold text-text">The Reader</h3>
                <p className="text-xs text-text-muted leading-relaxed font-sans mt-3 px-2">
                  Explore the public library catalog, bookmark active manuscripts, rate published
                  stories, and follow your favorite co-authors.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => handleRoleSelection('reader')}
              disabled={loading}
              className="w-full justify-center border-accent/25 hover:bg-accent/5 text-accent font-bold cursor-pointer"
            >
              Join as Reader
            </Button>
          </Card>

          {/* Writer Card */}
          <Card
            hoverEffect={true}
            className="p-8 flex flex-col justify-between items-center text-center gap-6 border-border/80 shadow-md"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-accent/5 text-accent border border-accent/25 rounded-2xl animate-pulse">
                <PenTool className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold text-text">The Writer</h3>
                <p className="text-xs text-text-muted leading-relaxed font-sans mt-3 px-2">
                  Draft novels, compile poetry journals, write with co-authors in real-time syncing
                  rooms, and publish manuscripts to the library.
                </p>
              </div>
            </div>
            <Button
              onClick={() => handleRoleSelection('writer')}
              disabled={loading}
              className="w-full justify-center font-bold cursor-pointer"
            >
              Join as Writer
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
