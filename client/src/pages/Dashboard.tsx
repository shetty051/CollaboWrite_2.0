import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { apiFetch } from '../api/apiClient'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Input } from '../components/ui/Input'
import { Library } from './Library'
import { StoryEditor } from '../components/StoryEditor'
import { WriterStats } from '../components/WriterStats'
import { LeaderboardView } from '../components/LeaderboardView'
import { ReaderHome } from '../components/ReaderHome'
import { WriterHome } from '../components/WriterHome'
import { FeedbackView } from '../components/FeedbackView'
import { AdminDashboard } from './AdminDashboard'
import { Sidebar } from '../components/Sidebar'
import { ProfileView } from '../components/ProfileView'
import { ThemeToggle } from '../components/ThemeToggle'
import { useSocketNotifications, type NotificationItem } from '../hooks/useSocketNotifications'
import { toast } from '../store/useToastStore'
import {
  PenTool,
  Plus,
  Search as SearchIcon,
  Pencil,
  Trash2,
  Eye,
  Star,
  Bookmark as BookmarkIcon,
  Users,
  Check,
  X,
  Menu,
  Bell,
  CheckCheck,
  LogOut,
} from 'lucide-react'

interface WriterStoryItem {
  _id: string
  title: string
  subtitle?: string
  genres?: string[]
  tags?: string[]
  content?: Record<string, unknown>
  coverImageUrl?: string
  status: 'draft' | 'published'
  viewCount?: number
  averageRating?: number
  updatedAt: string
  author?: {
    _id: string
    name: string
  }
  coAuthors?: Array<{
    _id: string
    name: string
    email: string
    avatarUrl?: string
    role: string
  }>
}

interface CollabRequestItem {
  _id: string
  story?: {
    _id: string
    title: string
    subtitle?: string
  }
  fromUser?: {
    _id: string
    name: string
    email: string
  }
  createdAt: string
}

export const Dashboard = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isHydrated = useAuthStore((state) => state.isHydrated)

  // Role & Admin detection
  const isWriter = user?.role === 'writer'
  const isAdmin = !!user?.isAdmin

  // Writer Tabs: Search, Home, Read, Write, Bookmarks, Stats, Leaderboard, Admin (if admin), Profile
  const writerTabs = [
    'Search',
    'Home',
    'Read',
    'Write',
    'Bookmarks',
    'Stats',
    'Leaderboard',
    ...(isAdmin ? ['Admin'] : []),
    'Profile',
  ]
  // Reader Tabs: Search, Home, Read, Bookmarks, Feedback, Leaderboard, Admin (if admin), Profile
  const readerTabs = [
    'Search',
    'Home',
    'Read',
    'Bookmarks',
    'Feedback',
    'Leaderboard',
    ...(isAdmin ? ['Admin'] : []),
    'Profile',
  ]

  const activeTabsList = isWriter ? writerTabs : readerTabs

  const [activeTab, setActiveTab] = useState<string>(location.state?.tab || 'Home')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab)
    }
  }, [location.state])

  // Writer story management states inside Write tab
  const [writerStories, setWriterStories] = useState<WriterStoryItem[]>([])
  const [loadingStories, setLoadingStories] = useState(true)
  const [editingStory, setEditingStory] = useState<WriterStoryItem | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)

  // Bookmarks state
  const [bookmarks, setBookmarks] = useState<WriterStoryItem[]>([])
  const [loadingBookmarks, setLoadingBookmarks] = useState(false)

  // Collab requests state
  const [collabRequests, setCollabRequests] = useState<CollabRequestItem[]>([])

  // Fetch writer stories and collab requests
  const refreshMyStories = async () => {
    setLoadingStories(true)
    try {
      const [storiesRes, collabRes] = await Promise.all([
        apiFetch('/api/stories/my-stories'),
        apiFetch('/api/collab-requests'),
      ])
      const storiesJson = await storiesRes.json()
      const collabJson = await collabRes.json()

      if (storiesRes.ok && storiesJson.success) {
        setWriterStories(storiesJson.data)
      }
      if (collabRes.ok && collabJson.success) {
        setCollabRequests(collabJson.data || [])
      }
    } catch {
      toast.error('Failed to load your manuscripts.')
    } finally {
      setLoadingStories(false)
    }
  }

  // Fetch bookmarks
  const fetchBookmarks = async () => {
    setLoadingBookmarks(true)
    try {
      const res = await apiFetch('/api/users/me/bookmarks')
      const json = await res.json()
      if (res.ok && json.success) {
        setBookmarks(json.data)
      }
    } catch {
      toast.error('Failed to load bookmarks.')
    } finally {
      setLoadingBookmarks(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    if (isAuthenticated && isWriter) {
      Promise.all([apiFetch('/api/stories/my-stories'), apiFetch('/api/collab-requests')])
        .then(async ([sRes, cRes]) => {
          const sJson = await sRes.json()
          const cJson = await cRes.json()
          if (isMounted) {
            if (sJson.success) setWriterStories(sJson.data)
            if (cJson.success) setCollabRequests(cJson.data || [])
          }
        })
        .catch(() => {
          if (isMounted) toast.error('Failed to load your manuscripts.')
        })
        .finally(() => {
          if (isMounted) setLoadingStories(false)
        })
    }
    return () => {
      isMounted = false
    }
  }, [isAuthenticated, isWriter])

  // Respond to collab request (Accept/Decline)
  const handleRespondCollab = async (requestId: string, status: 'accepted' | 'declined') => {
    try {
      const res = await apiFetch(`/api/collab-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const json = await res.json()
      if (res.ok && json.success) {
        toast.success(`Collaboration request ${status}!`)
        refreshMyStories()
      } else {
        toast.error(json.message || 'Failed to update request.')
      }
    } catch {
      toast.error('Error responding to collaboration request.')
    }
  }

  // Scroll to top on tab change
  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName)
    setIsEditorOpen(false)
    setEditingStory(null)
    if (tabName === 'Bookmarks') {
      fetchBookmarks()
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Remove Bookmark
  const handleRemoveBookmark = async (storyId: string) => {
    try {
      const res = await apiFetch(`/api/stories/${storyId}/bookmark`, { method: 'DELETE' })
      const json = await res.json()
      if (res.ok && json.success) {
        setBookmarks(bookmarks.filter((b) => b._id !== storyId))
        toast.success('Removed from bookmarks.')
      } else {
        toast.error(json.message || 'Failed to remove bookmark.')
      }
    } catch {
      toast.error('Error removing bookmark.')
    }
  }

  // Open editor for new or existing story
  const openNewStoryEditor = () => {
    setEditingStory(null)
    setIsEditorOpen(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openEditStoryEditor = (story: WriterStoryItem) => {
    setEditingStory(story)
    setIsEditorOpen(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Delete story handler
  const handleDeleteStory = async (storyId: string) => {
    if (!confirm('Are you sure you want to delete this manuscript?')) return

    try {
      const res = await apiFetch(`/api/stories/${storyId}`, {
        method: 'DELETE',
      })
      const json = await res.json()
      if (res.ok && json.success) {
        toast.success('Story deleted successfully.')
        refreshMyStories()
      } else {
        toast.error(json.message || 'Failed to delete story.')
      }
    } catch {
      toast.error('Error deleting story.')
    }
  }

  // Redirect if not authenticated or role is missing
  useEffect(() => {
    if (isHydrated) {
      if (!isAuthenticated) {
        navigate('/login')
      } else if (!user?.role) {
        navigate('/role-select')
      }
    }
  }, [isAuthenticated, isHydrated, user, navigate])

  if (!isHydrated || !isAuthenticated || !user?.role) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }



  const logout = useAuthStore((state) => state.logout)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const { notifications, unreadCount, markAsRead, markAllAsRead } = useSocketNotifications()

  const handleLogout = async () => {
    await logout()
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
  }

  const firstName = user.firstName || (user.name || '').trim().split(/\s+/)[0] || 'User'

  // Issue 5: Prompt user when pressing browser back button while on dashboard
  useEffect(() => {
    window.history.pushState({ isDashboard: true }, '', window.location.href)

    const handlePopState = () => {
      const confirmLogout = window.confirm(
        'Are you sure you want to log out and leave your active workspace?',
      )
      if (confirmLogout) {
        handleLogout()
      } else {
        window.history.pushState({ isDashboard: true }, '', window.location.href)
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  return (
    <div className="min-h-screen bg-bg text-text transition-colors duration-300 flex overflow-hidden">
      {/* Collapsible Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(t) => setActiveTab(t)}
        tabs={activeTabsList}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Workspace Surface */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Option A Top Header Bar */}
        <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-md border-b border-border/80 px-4 md:px-8 py-3 flex items-center justify-between relative">
          {/* Left: Hamburger Toggle Only */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setIsMobileSidebarOpen(true)
                } else {
                  setIsSidebarCollapsed((prev) => !prev)
                }
              }}
              className="p-2 text-text-muted hover:text-text hover:bg-bg rounded-xl transition-colors cursor-pointer"
              title="Toggle Navigation Menu"
              aria-label="Toggle Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Center: Workspace Heading & Subtext */}
          <div className="flex-1 text-center px-2 min-w-0">
            <h1 className="text-sm md:text-base font-serif font-bold text-text leading-tight truncate">
              {isWriter ? 'Author Workspace' : 'Reader Hub'}
            </h1>
            <p className="text-[11px] text-text-muted font-sans hidden sm:block truncate">
              Welcome, <strong className="text-text">{firstName}</strong>
            </p>
          </div>

          {/* Right: Controls & Actions */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications((prev) => !prev)}
                className="p-2 text-text-muted hover:text-text rounded-full hover:bg-bg border border-border/60 transition-colors relative cursor-pointer"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-accent text-white text-[9px] font-bold rounded-full min-w-[18px] text-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="fixed sm:absolute top-14 sm:top-auto right-4 sm:right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-sm bg-surface border border-border rounded-2xl shadow-xl p-4 z-50 text-xs font-sans flex flex-col gap-3 max-h-96 overflow-y-auto">
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
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Greeting */}
            <span className="text-xs font-semibold text-text font-sans hidden md:inline-block">
              Hi {firstName}
            </span>

            {/* Sign Out Button */}
            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 border border-border/80 hover:border-accent hover:text-accent text-xs font-semibold uppercase tracking-wider rounded-full transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
            >
              <span className="hidden sm:inline">Sign Out</span>
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Tab Content View Container */}
        <main className="p-4 md:p-8 max-w-6xl mx-auto w-full">
          {/* READ TAB: Live Authenticated Library Component */}
          {activeTab === 'Read' && (
            <div className="animate-fadeIn">
              <Library hideBackButton={true} />
            </div>
          )}

          {/* SEARCH TAB */}
          {activeTab === 'Search' && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              <div className="flex flex-col gap-2">
                <h2 className="text-xl font-serif font-bold">Search Catalog & Authors</h2>
                <p className="text-xs text-text-muted">
                  Find manuscripts, genre collections, or authors across CollaboWrite.
                </p>
              </div>

              <div className="relative max-w-xl">
                <SearchIcon className="absolute left-3.5 top-3 w-4 h-4 text-text-muted" />
                <Input
                  type="text"
                  placeholder="Search by title, genre, or keyword..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="p-8 border border-border/60 bg-surface/40 rounded-2xl text-center flex flex-col items-center gap-3">
                <SearchIcon className="w-8 h-8 text-accent opacity-60" />
                <p className="text-xs text-text-muted font-sans">
                  {searchTerm
                    ? `Searching for "${searchTerm}"... Switch to the "Read" tab for full filtered grids.`
                    : 'Type a query above or navigate to the "Read" tab to browse live stories.'}
                </p>
              </div>
            </div>
          )}

          {/* HOME TAB */}
          {activeTab === 'Home' && (
            <div className="animate-fadeIn">{isWriter ? <WriterHome /> : <ReaderHome />}</div>
          )}

          {/* WRITE TAB (Writer Only) */}
          {activeTab === 'Write' && isWriter && (
            <div className="animate-fadeIn flex flex-col gap-6">
              {/* Incoming Collaboration Requests Section */}
              {collabRequests.length > 0 && !isEditorOpen && (
                <div className="p-5 border border-accent/30 bg-accent/5 rounded-2xl flex flex-col gap-3">
                  <div className="flex items-center gap-2 font-bold text-xs text-accent uppercase tracking-wider">
                    <Users className="w-4 h-4" /> Collaboration Requests ({collabRequests.length})
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {collabRequests.map((req) => (
                      <div
                        key={req._id}
                        className="p-4 bg-bg border border-border rounded-xl flex items-center justify-between gap-3"
                      >
                        <div>
                          <span className="text-xs font-bold text-text block">
                            {req.fromUser?.name || 'A writer'} invited you to co-author:
                          </span>
                          <span className="text-xs font-serif font-bold text-accent mt-0.5 block">
                            "{req.story?.title}"
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleRespondCollab(req._id, 'accepted')}
                            className="p-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
                            title="Accept Request"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRespondCollab(req._id, 'declined')}
                            className="p-1.5 bg-surface border border-border text-text-muted hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                            title="Decline Request"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isEditorOpen ? (
                <StoryEditor
                  initialStory={editingStory}
                  onBack={() => {
                    setIsEditorOpen(false)
                    setEditingStory(null)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  onSaved={() => {
                    refreshMyStories()
                    setIsEditorOpen(false)
                    setEditingStory(null)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                />
              ) : (
                <div className="flex flex-col gap-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-serif font-bold">My Manuscripts Studio</h2>
                      <p className="text-xs text-text-muted mt-0.5">
                        Manage your drafts, co-authored stories, and published literature.
                      </p>
                    </div>
                    <Button
                      onClick={openNewStoryEditor}
                      className="flex items-center gap-2 text-xs py-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> New Story
                    </Button>
                  </div>

                  {loadingStories ? (
                    <div className="py-12 text-center text-text-muted text-xs">
                      Loading your manuscripts...
                    </div>
                  ) : writerStories.length === 0 ? (
                    <div className="p-12 border border-border/80 bg-surface/30 rounded-2xl text-center flex flex-col items-center gap-4">
                      <PenTool className="w-8 h-8 text-accent opacity-60" />
                      <h3 className="text-lg font-serif font-bold">No Manuscripts Created Yet</h3>
                      <p className="text-xs text-text-muted max-w-sm font-sans">
                        Start drafting your first manuscript using the rich text Tiptap editor!
                      </p>
                      <Button onClick={openNewStoryEditor} className="text-xs cursor-pointer">
                        Create First Story
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {writerStories.map((story) => {
                        const isSoleAuthor = story.author?._id === user._id
                        return (
                          <Card
                            key={story._id}
                            className="p-6 border border-border flex flex-col gap-4 justify-between shadow-xs"
                          >
                            <div>
                              {story.coverImageUrl && (
                                <div className="w-full h-32 rounded-xl border border-border/40 overflow-hidden mb-3">
                                  <img
                                    src={story.coverImageUrl}
                                    alt={story.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${
                                      story.status === 'published'
                                        ? 'text-green-500 bg-green-500/5 border-green-500/15'
                                        : 'text-accent bg-accent/5 border-accent/15'
                                    }`}
                                  >
                                    {story.status}
                                  </span>
                                  {!isSoleAuthor && (
                                    <span className="text-[10px] bg-accent/10 text-accent font-semibold px-2 py-0.5 rounded border border-accent/20 flex items-center gap-1">
                                      <Users className="w-3 h-3" /> Co-authored with{' '}
                                      {story.author?.name}
                                    </span>
                                  )}
                                </div>

                                <span className="text-[10px] text-text-muted">
                                  {new Date(story.updatedAt).toLocaleDateString()}
                                </span>
                              </div>

                              <h3 className="text-lg font-serif font-bold mt-2">{story.title}</h3>
                              {story.subtitle && (
                                <p className="text-xs text-text-muted mt-1 leading-relaxed line-clamp-2">
                                  {story.subtitle}
                                </p>
                              )}

                              {story.genres && story.genres.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-3">
                                  {story.genres.map((g: string) => (
                                    <Badge key={g} variant="primary" className="text-[10px]">
                                      {g}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between border-t border-border/50 pt-4 mt-2">
                              <div className="flex items-center gap-3 text-[11px] text-text-muted">
                                {story.status === 'published' ? (
                                  <>
                                    <span className="flex items-center gap-1 font-semibold text-text">
                                      <Star className="w-3.5 h-3.5 text-accent fill-current" />
                                      {story.averageRating ? story.averageRating.toFixed(1) : '5.0'}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Eye className="w-3.5 h-3.5" />
                                      {story.viewCount}
                                    </span>
                                  </>
                                ) : (
                                  <span>Draft Mode</span>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                {story.status === 'published' && (
                                  <button
                                    onClick={() => navigate(`/library/story/${story._id}`)}
                                    className="p-1.5 text-text-muted hover:text-text hover:bg-surface rounded-lg transition-colors cursor-pointer"
                                    title="View Published Story"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => openEditStoryEditor(story)}
                                  className="p-1.5 text-text-muted hover:text-accent hover:bg-accent/5 rounded-lg transition-colors cursor-pointer"
                                  title="Edit Manuscript"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                {isSoleAuthor && (
                                  <button
                                    onClick={() => handleDeleteStory(story._id)}
                                    className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-colors cursor-pointer"
                                    title="Delete Manuscript"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </Card>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* BOOKMARKS TAB */}
          {activeTab === 'Bookmarks' && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-serif font-bold">My Bookmarked Stories</h2>
                  <p className="text-xs text-text-muted mt-0.5">
                    Quick access to manuscripts you have saved to read.
                  </p>
                </div>
              </div>

              {loadingBookmarks ? (
                <div className="py-12 text-center text-text-muted text-xs">
                  Loading bookmarks...
                </div>
              ) : bookmarks.length === 0 ? (
                <div className="p-12 border border-border/80 bg-surface/30 rounded-2xl text-center flex flex-col items-center gap-3">
                  <BookmarkIcon className="w-8 h-8 text-accent opacity-40" />
                  <h3 className="text-lg font-serif font-bold">No Bookmarks Saved Yet</h3>
                  <p className="text-xs text-text-muted max-w-sm font-sans">
                    Browse the library and click the bookmark icon on any story to save it here!
                  </p>
                  <Button
                    onClick={() => handleTabChange('Read')}
                    className="text-xs cursor-pointer"
                  >
                    Browse Library
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {bookmarks.map((story) => (
                    <Card
                      key={story._id}
                      className="p-6 border border-border flex flex-col gap-4 justify-between"
                    >
                      <div>
                        {story.coverImageUrl && (
                          <div className="w-full h-32 rounded-xl border border-border/40 overflow-hidden mb-3">
                            <img
                              src={story.coverImageUrl}
                              alt={story.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <h3 className="text-lg font-serif font-bold">{story.title}</h3>
                        {story.author && (
                          <span className="text-xs text-accent font-sans block mt-0.5">
                            by {story.author.name}
                          </span>
                        )}
                        {story.subtitle && (
                          <p className="text-xs text-text-muted mt-2 leading-relaxed line-clamp-2">
                            {story.subtitle}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between border-t border-border/50 pt-3 mt-2">
                        <Button
                          onClick={() => navigate(`/library/story/${story._id}`)}
                          className="text-xs px-3 py-1 cursor-pointer"
                        >
                          Read Story
                        </Button>
                        <button
                          onClick={() => handleRemoveBookmark(story._id)}
                          className="text-xs text-text-muted hover:text-red-500 font-semibold transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STATS TAB (Writer Only) */}
          {activeTab === 'Stats' && isWriter && <WriterStats />}

          {/* FEEDBACK TAB (Reader Only) */}
          {activeTab === 'Feedback' && !isWriter && <FeedbackView />}

          {/* LEADERBOARD TAB */}
          {activeTab === 'Leaderboard' && <LeaderboardView />}

          {/* ADMIN TAB (Admin Only) */}
          {activeTab === 'Admin' && isAdmin && <AdminDashboard isEmbedded={true} />}

          {/* PROFILE TAB */}
          {activeTab === 'Profile' && <ProfileView />}
        </main>
      </div>
    </div>
  )
}
