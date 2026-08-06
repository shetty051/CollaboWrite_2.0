import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { toast } from '../store/useToastStore'
import { PenTool, ArrowLeft } from 'lucide-react'

export const Login = () => {
  const navigate = useNavigate()
  const setUser = useAuthStore((state) => state.setUser)
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isHydrated = useAuthStore((state) => state.isHydrated)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (isHydrated && isAuthenticated && user) {
      navigate(user.role ? '/dashboard' : '/role-select')
    }
  }, [isAuthenticated, isHydrated, user, navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please enter both email and password.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const json = await res.json()
      if (res.ok && json.success) {
        setUser(json.data)
        toast.success('Successfully logged in!')
        navigate(json.data.role ? '/dashboard' : '/role-select')
      } else {
        toast.error(json.message || 'Login failed. Please verify credentials.')
      }
    } catch {
      toast.error('Server error connecting to authentication service.')
    } finally {
      setLoading(false)
    }
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
    <div className="min-h-screen bg-bg text-text transition-colors duration-300 flex flex-col items-center justify-center p-6 md:p-12 relative">
      {/* Back to Home Button */}
      <div className="absolute top-8 left-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text transition-colors cursor-pointer"
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

          <form onSubmit={handleLogin} className="flex flex-col gap-5 mt-6">
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
              disabled={loading}
              className="w-full justify-center cursor-pointer"
            >
              {loading ? 'Signing In...' : 'Sign In'}
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
