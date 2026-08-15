import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { PenTool, ArrowRight, LogOut, Bell, CheckCheck } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { useAuthStore } from '../store/useAuthStore'
import { toast } from '../store/useToastStore'
import { useSocketNotifications, type NotificationItem } from '../hooks/useSocketNotifications'

export const Header = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const [showNotifications, setShowNotifications] = useState(false)

  const { notifications, unreadCount, markAsRead, markAllAsRead } = useSocketNotifications()

  const handleLogoClick = (e: React.MouseEvent) => {
    if (user) {
      e.preventDefault()
      navigate('/dashboard')
    } else if (location.pathname === '/') {
      e.preventDefault()
      const hero = document.getElementById('home')
      if (hero) {
        hero.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      navigate('/')
    }
  }

  // Extract first name only
  const getFirstName = () => {
    if (!user) return ''
    if (user.firstName) return user.firstName
    return (user.name || '').trim().split(/\s+/)[0] || 'User'
  }

  const handleLogout = async () => {
    await logout()
    setShowNotifications(false)
    toast.success('Successfully logged out!')
    navigate('/')
  }

  const handleNotificationClick = (item: NotificationItem) => {
    markAsRead(item._id)
    setShowNotifications(false)

    if (item.relatedStory?._id) {
      navigate(`/library/story/${item.relatedStory._id}`)
    } else if (item.fromUser?._id) {
      navigate(`/profile/${item.fromUser._id}`)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Only show nav links on landing page for unauthenticated guest sessions
  const showNavLinks = !user && location.pathname === '/'

  // Hide global header on dashboard so Dashboard handles its single top bar
  if (location.pathname === '/dashboard') {
    return null
  }

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 w-full border-b border-border bg-bg/85 backdrop-blur-md px-6 py-4 flex items-center justify-between transition-colors duration-300"
    >
      {/* Brand Logo */}
      <a
        href="/"
        onClick={handleLogoClick}
        className="flex items-center gap-2.5 group cursor-pointer"
      >
        <div className="p-2 bg-accent text-white rounded-xl shadow-md shadow-accent/10 group-hover:scale-105 transition-transform duration-300">
          <PenTool className="w-5 h-5" />
        </div>
        <span className="text-lg font-bold font-serif tracking-tight text-text">
          CollaboWrite{' '}
          <span className="text-xs font-sans font-semibold text-accent uppercase tracking-widest pl-1">
            2.0
          </span>
        </span>
      </a>

      {/* Nav Links (Only on landing page for guest sessions) */}
      {showNavLinks && (
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-text-muted font-sans">
          <a href="#home" className="hover:text-accent transition-colors duration-200">
            Home
          </a>
          <a href="#read" className="hover:text-accent transition-colors duration-200">
            Read
          </a>
          <a href="#about" className="hover:text-accent transition-colors duration-200">
            About
          </a>
          <a href="#help" className="hover:text-accent transition-colors duration-200">
            Help
          </a>
        </nav>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowNotifications((prev) => !prev)}
              className="p-2 text-text-muted hover:text-text rounded-full hover:bg-surface border border-border/60 transition-colors relative cursor-pointer"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-accent text-white text-[9px] font-bold rounded-full min-w-[18px] text-center shadow-sm animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="fixed sm:absolute top-14 sm:top-auto right-4 sm:right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-sm bg-surface border border-border rounded-2xl shadow-xl p-4 z-50 text-xs font-sans flex flex-col gap-3 max-h-96 overflow-y-auto"
                >
                  <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <div className="font-bold text-text flex items-center gap-1.5">
                      Notifications{' '}
                      {unreadCount > 0 && (
                        <span className="text-accent text-[10px]">({unreadCount} unread)</span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[10px] text-accent hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCheck className="w-3 h-3" /> Mark all read
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <div className="text-text-muted text-center py-6">
                      You are all caught up! No unread updates.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {notifications.map((n) => (
                        <div
                          key={n._id}
                          onClick={() => handleNotificationClick(n)}
                          className={`p-3 rounded-xl border transition-colors cursor-pointer flex items-start gap-3 ${
                            !n.isRead
                              ? 'bg-accent/10 border-accent/30 font-semibold'
                              : 'bg-bg/50 border-border/40 hover:bg-bg'
                          }`}
                        >
                          <div className="w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                            {n.fromUser?.name ? n.fromUser.name.charAt(0) : '🔔'}
                          </div>
                          <div className="flex-1 flex flex-col gap-0.5">
                            <p className="text-xs text-text leading-tight">{n.message}</p>
                            <span className="text-[10px] text-text-muted">
                              {new Date(n.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <ThemeToggle />

        {user ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden sm:inline text-xs font-semibold text-text font-sans">Hi {getFirstName()}</span>
            <button
              onClick={handleLogout}
              className="px-3 sm:px-4 py-1.5 sm:py-2 border border-border/70 hover:border-accent hover:text-accent text-[11px] sm:text-xs font-semibold uppercase tracking-wider rounded-full transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
            >
              <span className="hidden sm:inline">Sign Out</span>
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <Link to="/login">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-1.5 sm:py-2 bg-accent text-white hover:bg-accent-hover text-[11px] sm:text-xs font-semibold tracking-wider uppercase rounded-full shadow-sm shadow-accent/10 transition-colors cursor-pointer"
            >
              Get Started
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </Link>
        )}
      </div>
    </motion.header>
  )
}
