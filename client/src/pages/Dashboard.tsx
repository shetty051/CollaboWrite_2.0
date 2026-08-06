import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
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
import { toast } from '../store/useToastStore'
import {
  PenTool,
  BookOpen,
  Plus,
  Calendar,
  Mail,
  Search as SearchIcon,
  Home as HomeIcon,
  BookMarked,
  BarChart3,
  Trophy,
  User as UserIcon,
  MessageSquareQuote,
  Pencil,
  Trash2,
  Eye,
  Star,
  Bookmark as BookmarkIcon,
  Users,
  Check,
  X,
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
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isHydrated = useAuthStore((state) => state.isHydrated)

  // Role detection
  const isWriter = user?.role === 'writer'

  // Writer Tabs: Search, Home, Read, Write, Bookmarks, Stats, Leaderboard, Profile
  const writerTabs = [
    'Search',
    'Home',
    'Read',
    'Write',
    'Bookmarks',
    'Stats',
    'Leaderboard',
    'Profile',
  ]
  // Reader Tabs: Search, Home, Read, Bookmarks, Feedback, Leaderboard, Profile
  const readerTabs = ['Search', 'Home', 'Read', 'Bookmarks', 'Feedback', 'Leaderboard', 'Profile']

  const activeTabsList = isWriter ? writerTabs : readerTabs

  const [activeTab, setActiveTab] = useState<string>('Home')
  const [searchTerm, setSearchTerm] = useState('')

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
        fetch('/api/stories/my-stories'),
        fetch('/api/collab-requests'),
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
      const res = await fetch('/api/users/me/bookmarks')
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
      Promise.all([fetch('/api/stories/my-stories'), fetch('/api/collab-requests')])
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
      const res = await fetch(`/api/collab-requests/${requestId}`, {
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
      const res = await fetch(`/api/stories/${storyId}/bookmark`, { method: 'DELETE' })
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
      const res = await fetch(`/api/stories/${storyId}`, {
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

  // Helper icon for tabs
  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'Search':
        return <SearchIcon className="w-3.5 h-3.5" />
      case 'Home':
        return <HomeIcon className="w-3.5 h-3.5" />
      case 'Read':
        return <BookMarked className="w-3.5 h-3.5" />
      case 'Write':
        return <PenTool className="w-3.5 h-3.5" />
      case 'Bookmarks':
        return <BookmarkIcon className="w-3.5 h-3.5" />
      case 'Stats':
        return <BarChart3 className="w-3.5 h-3.5" />
      case 'Feedback':
        return <MessageSquareQuote className="w-3.5 h-3.5" />
      case 'Leaderboard':
        return <Trophy className="w-3.5 h-3.5" />
      case 'Profile':
        return <UserIcon className="w-3.5 h-3.5" />
      default:
        return null
    }
  }

  const firstName = user.firstName || (user.name || '').trim().split(/\s+/)[0] || 'User'

  return (
    <div className="min-h-screen bg-bg text-text transition-colors duration-300 py-6 px-4 md:px-12">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* Workspace Hub Banner */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border/60">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight">
              {isWriter ? 'Author Workspace' : 'Reader Hub'}
            </h1>
            <p className="text-xs text-text-muted mt-1 font-sans">
              Welcome back, <strong className="text-text">{firstName}</strong>. Manage your
              literature & studio tabs below.
            </p>
          </div>
          <Badge
            variant="primary"
            className="flex items-center gap-1.5 px-4 py-1.5 font-sans font-semibold uppercase tracking-wider text-xs"
          >
            {isWriter ? (
              <>
                <PenTool className="w-3.5 h-3.5" /> Writer Account
              </>
            ) : (
              <>
                <BookOpen className="w-3.5 h-3.5" /> Reader Account
              </>
            )}
          </Badge>
        </div>

        {/* Client-side Tab Switcher */}
        <div className="flex border-b border-border/40 overflow-x-auto scrollbar-none gap-2">
          {activeTabsList.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all duration-200 shrink-0 flex items-center gap-2 cursor-pointer ${
                activeTab === tab
                  ? 'border-accent text-accent font-bold bg-accent/5 rounded-t-lg'
                  : 'border-transparent text-text-muted hover:text-text'
              }`}
            >
              {getTabIcon(tab)}
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content Views */}
        <div className="mt-2 min-h-[450px]">
          {/* READ TAB: Live Authenticated Library Component */}
          {activeTab === 'Read' && (
            <div className="animate-fadeIn">
              <Library />
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

          {/* PROFILE TAB */}
          {activeTab === 'Profile' && (
            <div className="max-w-2xl mx-auto flex flex-col gap-6 animate-fadeIn">
              <Card className="p-8 border border-border flex flex-col gap-6">
                <div className="flex items-center gap-4 border-b border-border/50 pb-6">
                  <div className="w-16 h-16 rounded-full bg-accent text-white font-serif flex items-center justify-center text-2xl font-bold border border-border">
                    {firstName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-bold">
                      {user.firstName} {user.lastName || ''}
                    </h3>
                    <p className="text-xs text-text-muted font-sans mt-0.5">{user.email}</p>
                    <Badge
                      variant="primary"
                      className="mt-2 text-[10px] uppercase tracking-wider font-semibold"
                    >
                      {user.role} profile
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col gap-4 text-xs font-sans">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-text-muted shrink-0" />
                    <div>
                      <span className="font-bold text-text">Email Address:</span>
                      <p className="text-text-muted mt-0.5">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <UserIcon className="w-4 h-4 text-text-muted shrink-0" />
                    <div>
                      <span className="font-bold text-text">Account Role:</span>
                      <p className="text-text-muted mt-0.5">
                        {user.role === 'writer'
                          ? 'Writer (Full drafting & publishing access)'
                          : 'Reader (Library & reviews access)'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-text-muted shrink-0" />
                    <div>
                      <span className="font-bold text-text">Platform Status:</span>
                      <p className="text-text-muted mt-0.5">Active Account</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
