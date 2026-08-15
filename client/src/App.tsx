import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './api/queryClient'
import { Header } from './components/Header'
import { Home } from './pages/Home'
import { ThemeProvider } from './components/ThemeProvider'
import { ToastContainer } from './components/ui/ToastContainer'
import { DesignSystem } from './pages/DesignSystem'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { RoleSelect } from './pages/RoleSelect'
import { Dashboard } from './pages/Dashboard'
import { Library } from './pages/Library'
import { StoryDetail } from './pages/StoryDetail'
import { UserProfile } from './pages/UserProfile'
import { Contact } from './pages/Contact'
import { Legal } from './pages/Legal'
import { NotFound } from './pages/NotFound'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminRoute } from './components/AdminRoute'
import { ErrorBoundary } from './components/ErrorBoundary'
import { useAuthStore } from './store/useAuthStore'

// Helper component that scrolls window to top on path route changes
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <Router>
            <ScrollToTop />
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/design-system" element={<DesignSystem />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/role-select" element={<RoleSelect />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <Navigate to="/dashboard" state={{ tab: 'Admin' }} replace />
                  </AdminRoute>
                }
              />
              <Route path="/library" element={<Library />} />
              <Route path="/library/story/:id" element={<StoryDetail />} />
              <Route path="/library/story/share/:shareSlug" element={<StoryDetail />} />
              <Route path="/profile/:userId" element={<UserProfile />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/legal/privacy" element={<Legal />} />
              <Route path="/legal/terms" element={<Legal />} />
              <Route path="/legal/cookies" element={<Legal />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <ToastContainer />
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
