import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { toast } from '../store/useToastStore'
import { PenTool, ArrowLeft } from 'lucide-react'

interface RecentUser {
  email: string
  firstName: string
  avatarUrl?: string
}

export const Login = () => {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const storeLoading = useAuthStore((state) => state.loading)
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isHydrated = useAuthStore((state) => state.isHydrated)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])

  // Load recent logins from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('recentLogins')
      if (stored) {
        setRecentUsers(JSON.parse(stored))
      }
    } catch {}
  }, [])

  // Redirect if already authenticated
  useEffect(() => {
    if (isHydrated && isAuthenticated && user) {
      navigate(user.role ? '/dashboard' : '/role-select')
    }
  }, [isAuthenticated, isHydrated, user, navigate])

  const saveRecentUser = (userData: { email: string; firstName?: string; name?: string; avatarUrl?: string }) => {
    try {
      const firstName = userData.firstName || (userData.name || '').split(' ')[0] || 'User'
      const stored: RecentUser[] = JSON.parse(localStorage.getItem('recentLogins') || '[]')
      const filtered = stored.filter((u) => u.email.toLowerCase() !== userData.email.toLowerCase())
      const updated = [{ email: userData.email, firstName, avatarUrl: userData.avatarUrl || '' }, ...filtered].slice(0, 5)
      localStorage.setItem('recentLogins', JSON.stringify(updated))
      setRecentUsers(updated)
    } catch {}
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please enter both email and password.')
      return
    }

    const res = await login(email, password)
    if (res.success && res.data) {
      saveRecentUser(res.data)
      toast.success('Successfully logged in!')
      navigate(res.data.role ? '/dashboard' : '/role-select')
    } else {
      toast.error(res.message || 'Login failed. Please verify credentials.')
    }
  }

  const handleSelectRecentUser = (u: RecentUser) => {
    setEmail(u.email)
    setPassword('')
    setTimeout(() => {
      const pwdInput = document.querySelector('input[type="password"]') as HTMLInputElement
      if (pwdInput) pwdInput.focus()
    }, 50)
  }

  const handleClearRecentUsers = () => {
    localStorage.removeItem('recentLogins')
    setRecentUsers([])
    toast.info('Recent accounts cleared.')
  }

  const handleForgotClick = () => {
    toast.info('Password recovery is coming soon in a future update!')
  }

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg text-text transition-colors duration-300 flex flex-col items-center justify-center p-4 sm:p-6 md:p-12 relative">
      {/* Back to Home Button */}
      <div className="w-full max-w-md sm:absolute sm:top-8 sm:left-8 mb-4 sm:mb-0">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm text-text-muted hover:text-text transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>
      </div>

      <div className="w-full max-w-md flex flex-col gap-6">
        {/* Core Auth Card */}
        <Card hoverEffect={false} className="p-8 shadow-lg border border-border/80">
          {/* Card Header Branding */}
          <div className="flex flex-col items-center text-center gap-3 pb-6 border-b border-border/50">
            <div className="p-2.5 bg-accent text-white rounded-2xl shadow-md">
              <PenTool className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold tracking-tight">CollaboWrite 2.0</h1>
              <p className="text-xs text-text-muted mt-1 font-sans">
                Sign in to access your editorial studio
              </p>
            </div>
          </div>

          {/* Recent Logged-in Accounts Card Grid */}
          {recentUsers.length > 0 && (
            <div className="flex flex-col gap-3 my-5 pb-5 border-b border-border/50">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-text-muted">
                  Recent Accounts
                </span>
                <button
                  type="button"
                  onClick={handleClearRecentUsers}
                  className="text-[10px] text-accent hover:underline cursor-pointer"
                >
                  Clear all
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {recentUsers.map((u) => (
                  <button
                    key={u.email}
                    type="button"
                    onClick={() => handleSelectRecentUser(u)}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border/70 bg-bg/60 hover:bg-bg hover:border-accent transition-all text-left group cursor-pointer"
                  >
                    {u.avatarUrl ? (
                      <img
                        src={u.avatarUrl}
                        alt={u.firstName}
                        className="w-8 h-8 rounded-full object-cover border border-border shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-accent text-white font-serif flex items-center justify-center font-bold text-xs shrink-0">
                        {u.firstName.charAt(0)}
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <span className="text-xs font-serif font-bold text-text group-hover:text-accent transition-colors block truncate">
                        {u.firstName}
                      </span>
                      <span className="text-[10px] text-text-muted font-sans block truncate">
                        {u.email}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-5 mt-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="flex flex-col gap-1.5">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={handleForgotClick}
                className="text-right text-[11px] font-sans text-accent hover:underline w-fit ml-auto cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              disabled={storeLoading}
              className="w-full justify-center cursor-pointer"
            >
              {storeLoading ? 'Signing In...' : 'Sign In'}
            </Button>

            <div className="text-center text-xs text-text-muted font-sans mt-2">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-accent font-semibold hover:underline cursor-pointer"
              >
                Sign up
              </Link>
            </div>
          </form>
        </Card>

        {/* Footer Navigation Links */}
        <div className="flex items-center justify-center gap-6 text-xs text-text-muted font-sans mt-2">
          <Link to="/legal/terms" className="hover:underline hover:text-text transition-colors">
            Terms
          </Link>
          <Link to="/legal/privacy" className="hover:underline hover:text-text transition-colors">
            Privacy
          </Link>
          <Link to="/contact" className="hover:underline hover:text-text transition-colors">
            Need Help?
          </Link>
        </div>
      </div>
    </div>
  )
}
