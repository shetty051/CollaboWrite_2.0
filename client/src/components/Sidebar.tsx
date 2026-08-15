import React from 'react'
import { motion as m, AnimatePresence as AP } from 'framer-motion'
import {
  Search,
  Home,
  BookMarked,
  PenTool,
  Bookmark,
  BarChart3,
  MessageSquareQuote,
  Trophy,
  ShieldAlert,
  User as UserIcon,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react'
import { Badge } from './ui/Badge'

interface SidebarProps {
  activeTab: string
  onSelectTab: (tab: string) => void
  tabs: string[]
  isCollapsed: boolean
  onToggleCollapse: () => void
  isMobileOpen: boolean
  onCloseMobile: () => void
  user: {
    name?: string
    firstName?: string
    email?: string
    role?: string
    isAdmin?: boolean
    avatarUrl?: string
  } | null
  onLogout: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  tabs,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  user,
  onLogout,
}) => {
  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'Search':
        return <Search className="w-5 h-5" />
      case 'Home':
        return <Home className="w-5 h-5" />
      case 'Read':
        return <BookMarked className="w-5 h-5" />
      case 'Write':
        return <PenTool className="w-5 h-5" />
      case 'Bookmarks':
        return <Bookmark className="w-5 h-5" />
      case 'Stats':
        return <BarChart3 className="w-5 h-5" />
      case 'Feedback':
        return <MessageSquareQuote className="w-5 h-5" />
      case 'Leaderboard':
        return <Trophy className="w-5 h-5" />
      case 'Admin':
        return <ShieldAlert className="w-5 h-5 text-red-500" />
      case 'Profile':
        return <UserIcon className="w-5 h-5" />
      default:
        return null
    }
  }

  const firstName = user?.firstName || (user?.name || '').trim().split(/\s+/)[0] || 'User'

  const handleTabClick = (tab: string) => {
    onSelectTab(tab)
    onCloseMobile()
  }

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <AP>
        {isMobileOpen && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          />
        )}
      </AP>

      {/* Mobile Off-Canvas Drawer */}
      <AP>
        {isMobileOpen && (
          <m.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 bottom-0 w-[80%] max-w-xs bg-surface border-r border-border z-50 flex flex-col justify-between p-4 shadow-2xl lg:hidden"
          >
            <div className="flex flex-col gap-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-border/60 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-accent text-white rounded-xl shadow-md">
                    <PenTool className="w-4 h-4" />
                  </div>
                  <span className="font-serif font-bold text-lg text-text">CollaboWrite</span>
                </div>
                <button
                  onClick={onCloseMobile}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-bg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Profile Mini Badge */}
              {user && (
                <div className="flex items-center gap-3 p-3 bg-bg/60 rounded-xl border border-border/50">
                  <div className="w-10 h-10 rounded-full bg-accent text-white font-serif flex items-center justify-center font-bold text-sm border border-border">
                    {firstName.charAt(0)}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-serif font-bold text-sm text-text truncate">
                      {user.firstName ? `${user.firstName} ${user.name?.split(' ')[1] || ''}` : user.name}
                    </h4>
                    <span className="text-[10px] text-text-muted font-sans uppercase tracking-wider block">
                      {user.role || 'Member'}
                    </span>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <nav className="flex flex-col gap-1.5">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab
                  return (
                    <button
                      key={tab}
                      onClick={() => handleTabClick(tab)}
                      className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                        isActive
                          ? 'bg-accent/15 text-accent border border-accent/20 font-bold shadow-xs'
                          : 'text-text-muted hover:text-text hover:bg-bg/70'
                      }`}
                    >
                      {getTabIcon(tab)}
                      <span>{tab}</span>
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Logout Footer */}
            <div className="border-t border-border/60 pt-4">
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </m.aside>
        )}
      </AP>

      {/* Desktop Sticky Sidebar */}
      <aside
        className={`hidden lg:flex flex-col justify-between bg-surface/80 backdrop-blur-md border-r border-border transition-all duration-300 relative shrink-0 ${
          isCollapsed ? 'w-20 p-3' : 'w-64 p-5'
        }`}
      >
        {/* Toggle Collapse Button */}
        <button
          onClick={onToggleCollapse}
          className="absolute -right-3.5 top-6 w-7 h-7 rounded-full bg-surface border border-border text-text-muted hover:text-text shadow-sm flex items-center justify-center transition-transform hover:scale-110 z-20 cursor-pointer"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        <div className="flex flex-col gap-6">
          {/* Brand Header */}
          <div className={`flex items-center gap-3 border-b border-border/60 pb-4 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="p-2 bg-accent text-white rounded-xl shadow-md shrink-0">
              <PenTool className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <span className="font-serif font-bold text-lg text-text block leading-none">
                  CollaboWrite
                </span>
                <span className="text-[10px] font-sans font-semibold text-accent uppercase tracking-widest block mt-1">
                  Studio 2.0
                </span>
              </div>
            )}
          </div>

          {/* User Account Role Info */}
          {!isCollapsed && user && (
            <div className="flex items-center gap-3 p-2.5 bg-bg/50 rounded-xl border border-border/50">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={firstName}
                  className="w-9 h-9 rounded-full object-cover border border-border shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-accent text-white font-serif flex items-center justify-center font-bold text-sm shrink-0">
                  {firstName.charAt(0)}
                </div>
              )}
              <div className="overflow-hidden">
                <span className="font-serif font-bold text-xs text-text block truncate">
                  {firstName}
                </span>
                <Badge variant="primary" className="text-[9px] uppercase tracking-wider py-0 px-1.5 mt-0.5">
                  {user.role}
                </Badge>
              </div>
            </div>
          )}

          {/* Desktop Nav Items */}
          <nav className="flex flex-col gap-1.5">
            {tabs.map((tab) => {
              const isActive = activeTab === tab
              return (
                <button
                  key={tab}
                  onClick={() => onSelectTab(tab)}
                  className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    isCollapsed ? 'justify-center' : ''
                  } ${
                    isActive
                      ? 'bg-accent/15 text-accent border border-accent/25 font-bold shadow-xs'
                      : 'text-text-muted hover:text-text hover:bg-bg/70'
                  }`}
                  title={isCollapsed ? tab : undefined}
                >
                  <span className="shrink-0">{getTabIcon(tab)}</span>
                  {!isCollapsed && <span>{tab}</span>}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Footer Logout */}
        <div className="border-t border-border/60 pt-4">
          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title={isCollapsed ? 'Sign Out' : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
