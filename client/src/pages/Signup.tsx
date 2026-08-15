import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { toast } from '../store/useToastStore'
import { PenTool, ArrowLeft } from 'lucide-react'

export const Signup = () => {
  const navigate = useNavigate()
  const signup = useAuthStore((state) => state.signup)
  const storeLoading = useAuthStore((state) => state.loading)
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isHydrated = useAuthStore((state) => state.isHydrated)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Redirect if already authenticated and role is set
  useEffect(() => {
    if (isHydrated && isAuthenticated && user) {
      navigate(user.role ? '/dashboard' : '/role-select')
    }
  }, [isAuthenticated, isHydrated, user, navigate])

  // Action: Register Credentials
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password) {
      toast.error('Please fill in all sign-up fields.')
      return
    }

    const res = await signup(name, email, password)
    if (res.success && res.data) {
      toast.success('Registration successful!')
      navigate('/role-select')
    } else {
      toast.error(res.message || 'Signup failed.')
    }
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
      {/* Back Button */}
      <div className="w-full max-w-md sm:absolute sm:top-8 sm:left-8 mb-4 sm:mb-0">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm text-text-muted hover:text-text transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>
      </div>

      <div className="w-full max-w-md flex flex-col gap-6">
        <Card hoverEffect={false} className="p-8 shadow-lg border border-border/80">
          <div className="flex flex-col items-center text-center gap-3 pb-6 border-b border-border/50">
            <div className="p-2.5 bg-accent text-white rounded-2xl shadow-md">
              <PenTool className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold tracking-tight">Create Account</h1>
              <p className="text-xs text-text-muted mt-1 font-sans">
                Start writing and sharing collaborative manuscripts
              </p>
            </div>
          </div>

          <form onSubmit={handleSignupSubmit} className="flex flex-col gap-5 mt-6">
            <Input
              label="Full Name"
              type="text"
              placeholder="Aakash Shetty"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              disabled={storeLoading}
              className="w-full justify-center mt-2 cursor-pointer"
            >
              {storeLoading ? 'Creating...' : 'Register'}
            </Button>

            <div className="text-center text-xs text-text-muted font-sans mt-2">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-accent font-semibold hover:underline cursor-pointer"
              >
                Sign in
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
