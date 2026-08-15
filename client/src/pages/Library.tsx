import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { apiFetch } from '../api/apiClient'
import { useAuthStore } from '../store/useAuthStore'
import { toast } from '../store/useToastStore'
import { GENRES_LIST } from '../constants/genres'
import {
  ArrowLeft,
  BookOpen,
  Star,
  Search,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

interface LibraryProps {
  hideBackButton?: boolean
}

interface AuthorInfo {
  _id: string
  name: string
  email: string
  role: string
  avatarUrl?: string
}

interface StoryItem {
  _id: string
  title: string
  subtitle?: string
  author: AuthorInfo
  genres: string[]
  averageRating: number
  ratingCount: number
  viewCount: number
  coverImageUrl?: string
}

interface StoriesResponse {
  success: boolean
  data: StoryItem[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Visual Cover backgrounds mapped to indices
const COVER_GRADIENTS = [
  'from-amber-200/40 via-orange-100/30 to-red-200/40',
  'from-indigo-300/30 via-slate-200/20 to-violet-300/30',
  'from-emerald-200/30 via-stone-100/30 to-teal-200/40',
  'from-rose-300/30 via-orange-100/20 to-amber-300/35',
  'from-fuchsia-200/35 via-violet-100/25 to-pink-200/35',
  'from-cyan-200/30 via-sky-100/35 to-blue-200/35',
]

export const Library: React.FC<LibraryProps> = ({ hideBackButton = false }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const isDashboardView = hideBackButton || location.pathname === '/dashboard'

  // Search & Filter state
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('')
  const [page, setPage] = useState(1)
  const [tooltipUser, setTooltipUser] = useState<string | null>(null)

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1) // Reset to first page when search changes
    }, 450)
    return () => clearTimeout(handler)
  }, [search])

  // Fetch unique genres in use
  const { data: genresData } = useQuery<string[]>({
    queryKey: ['genres'],
    queryFn: async () => {
      const res = await apiFetch('/api/stories/genres')
      if (!res.ok) throw new Error('Failed to load genres')
      const json = await res.json()
      return json.data || []
    },
  })

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  // Combine static genre catalog with any dynamic custom database genres
  const allGenres = Array.from(new Set([...GENRES_LIST, ...(genresData || [])])).sort()

  // Fetch stories with query parameters
  const { data: storiesResponse, isLoading } = useQuery<StoriesResponse>({
    queryKey: ['stories', debouncedSearch, selectedGenre, page],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (debouncedSearch) params.append('search', debouncedSearch)
      if (selectedGenre) params.append('genre', selectedGenre)
      params.append('page', page.toString())
      params.append('limit', '6') // 6 items per page looks excellent in a grid

      const res = await apiFetch(`/api/stories?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch stories')
      return res.json()
    },
  })

  const stories = storiesResponse?.data || []
  const pagination = storiesResponse?.pagination

  return (
    <div className="min-h-screen bg-bg text-text transition-colors duration-300 p-6 md:p-12">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        {/* Header Block */}
        <div>
          {!isDashboardView && (
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
          )}
          <div className="flex items-center gap-2.5 text-accent text-xs font-semibold uppercase tracking-widest pl-1 mb-2">
            <BookOpen className="w-4 h-4" />
            STORY ARCHIVE
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">The Library</h1>
          <p className="text-text-muted mt-2 max-w-xl text-sm leading-relaxed">
            Browse our curated catalog of public documents and collaborative writings.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-surface border border-border p-4 rounded-2xl shadow-xs">
          {/* Search Box */}
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search stories by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-bg border border-border rounded-xl focus:border-accent focus:ring-1 focus:ring-accent/15 outline-none transition-all duration-200"
            />
          </div>

          {/* Genre select */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-text-muted hidden md:block" />
            <select
              onChange={(e) => {
                setSelectedGenre(e.target.value)
                setPage(1)
              }}
              className="w-full md:w-48 px-3 py-2 text-sm bg-bg border border-border rounded-xl focus:border-accent outline-none transition-all duration-200"
            >
              <option value="">All Genres</option>
              {allGenres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Stories Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="w-full h-80 rounded-2xl bg-surface border border-border animate-pulse"
              />
            ))}
          </div>
        ) : stories.length === 0 ? (
          <div className="py-16 px-6 bg-surface/40 border border-border border-dashed rounded-3xl text-center flex flex-col items-center gap-6 max-w-xl mx-auto w-full my-4">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <BookOpen className="w-8 h-8" />
            </div>
            <div className="flex flex-col gap-2 max-w-md">
              <h3 className="text-2xl font-serif font-bold text-text">No stories yet — be the first to share your writing.</h3>
              <p className="text-xs text-text-muted font-sans leading-relaxed">
                Our library catalog is waiting for its first manuscript. Sign in or register to publish your work and contribute to the community.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-1">
              <Button
                variant="primary"
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
                className="flex items-center gap-2 cursor-pointer text-xs"
              >
                {isAuthenticated ? 'Go to Studio to Write' : 'Login to Contribute'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stories.map((story, idx) => {
              const coverGradient = COVER_GRADIENTS[idx % COVER_GRADIENTS.length]

              return (
                <Card
                  key={story._id}
                  className="flex flex-col justify-between gap-4 cursor-pointer"
                  onClick={() => navigate(`/library/story/${story._id}`)}
                >
                  <div>
                    {/* Cover Image or Fallback Gradient */}
                    {story.coverImageUrl ? (
                      <div className="w-full h-36 rounded-xl border border-border/40 overflow-hidden mb-3">
                        <img
                          src={story.coverImageUrl}
                          alt={story.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div
                        className={`w-full h-36 rounded-xl bg-gradient-to-tr ${coverGradient} border border-border/40 relative flex items-center justify-center p-4 overflow-hidden mb-3`}
                      >
                        <span className="font-serif italic font-semibold text-text/80 text-sm text-center line-clamp-2">
                          {story.title}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="primary">{story.genres[0] || 'Uncategorized'}</Badge>
                      <div className="flex items-center gap-3 text-xs text-text-muted">
                        <div className="flex items-center gap-0.5 text-amber-500 font-semibold font-sans">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          {story.averageRating > 0 ? story.averageRating.toFixed(1) : '—'}
                        </div>
                        <div className="flex items-center gap-0.5 font-sans">
                          <Eye className="w-3.5 h-3.5" />
                          {story.viewCount}
                        </div>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold font-serif leading-tight hover:text-accent transition-colors line-clamp-2">
                      {story.title}
                    </h3>

                    {/* Interactive Author block (Tooltip triggers only for guests) */}
                    <div
                      className="relative inline-block mt-2"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (isAuthenticated) {
                          navigate(`/profile/${story.author._id}`)
                        } else {
                          toast.info('🔒 Please sign in to view author profiles.')
                          navigate('/login')
                        }
                      }}
                      onMouseEnter={() => !isAuthenticated && setTooltipUser(story._id)}
                      onMouseLeave={() => setTooltipUser(null)}
                    >
                      <span className="text-xs text-accent hover:underline cursor-pointer">
                        by {story.author.name}
                      </span>

                      {/* Floating Tooltip for Guests */}
                      {!isAuthenticated && tooltipUser === story._id && (
                        <div className="absolute left-0 bottom-full mb-2 z-50 bg-neutral-900 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-1.5 rounded shadow-lg whitespace-nowrap">
                          🔒 Login to view profiles
                        </div>
                      )}
                    </div>

                    {story.subtitle && (
                      <p className="text-xs text-text-muted leading-relaxed font-sans mt-3 line-clamp-2">
                        {story.subtitle}
                      </p>
                    )}
                  </div>

                  <div className="border-t border-border/40 pt-3 flex items-center justify-between">
                    <button className="text-xs font-bold text-accent hover:underline flex items-center gap-1">
                      Read Manuscript →
                    </button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {/* End-of-Library Call-To-Action Card */}
        {stories.length > 0 && (!pagination || page >= pagination.pages) && (
          <div className="mt-8 p-8 bg-surface/60 border border-border border-dashed rounded-3xl text-center flex flex-col items-center gap-4 animate-fadeIn">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="max-w-md flex flex-col gap-1">
              <h3 className="text-lg font-serif font-bold text-text">That's all we have for now!</h3>
              <p className="text-xs text-text-muted font-sans leading-relaxed">
                Want to see more stories? Contribute to our community and be the first to write something amazing.
              </p>
            </div>
            {isAuthenticated ? (
              <Button
                variant="primary"
                onClick={() => navigate('/dashboard', { state: { tab: 'Write' } })}
                className="mt-1 flex items-center gap-2 cursor-pointer"
              >
                Go to Studio to Write
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => navigate('/signup')}
                className="mt-1 flex items-center gap-2 cursor-pointer"
              >
                Login to Create a Story
              </Button>
            )}
          </div>
        )}

        {/* Pagination Toolbar */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2.5 mt-8 border-t border-border/50 pt-6">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </Button>

            {Array.from({ length: pagination.pages }).map((_, i) => {
              const pageIdx = i + 1
              return (
                <button
                  key={pageIdx}
                  onClick={() => setPage(pageIdx)}
                  className={`w-9 h-9 text-xs font-bold rounded-xl border transition-all duration-200 ${
                    page === pageIdx
                      ? 'bg-accent border-accent text-white shadow-sm'
                      : 'bg-surface border-border text-text-muted hover:border-text hover:text-text'
                  }`}
                >
                  {pageIdx}
                </button>
              )
            })}

            <Button
              variant="outline"
              size="sm"
              disabled={page === pagination.pages}
              onClick={() => setPage((p) => Math.min(p + 1, pagination.pages))}
              className="flex items-center gap-1.5"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
