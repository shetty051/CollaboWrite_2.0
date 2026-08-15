import { useState, useEffect } from 'react'
import { Card } from './ui/Card'
import { Badge } from './ui/Badge'
import { Skeleton } from './ui/Skeleton'
import { toast } from '../store/useToastStore'
import { apiFetch } from '../api/apiClient'
import {
  Eye,
  Users,
  Star,
  MessageSquare,
  ArrowUpDown,
  TrendingUp,
  BarChart2,
  BookOpen,
} from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts'

interface StoryStatItem {
  _id: string
  title: string
  status: 'draft' | 'published'
  viewCount: number
  averageRating: number
  ratingCount: number
  commentCount: number
  updatedAt: string
}

interface StatsData {
  summary: {
    totalViews: number
    totalRatings: number
    overallAverageRating: number
    totalComments: number
    totalFollowers: number
  }
  viewsHistory: Array<{ date: string; views: number }>
  perStoryBreakdown: StoryStatItem[]
}

type SortKey = 'viewCount' | 'averageRating' | 'commentCount' | 'title' | 'updatedAt'
type SortOrder = 'asc' | 'desc'

export const WriterStats = () => {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState<SortKey>('viewCount')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  useEffect(() => {
    let isMounted = true
    apiFetch('/api/users/me/stats')
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json.success) {
          setStats(json.data)
        }
      })
      .catch(() => {
        if (isMounted) toast.error('Failed to load analytics data.')
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortOrder('desc')
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-8 animate-fadeIn">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="py-20 text-center text-text-muted text-xs font-sans">
        No analytics data available yet.
      </div>
    )
  }

  const { summary, viewsHistory, perStoryBreakdown } = stats

  // Sorted story breakdown table items
  const sortedStories = [...perStoryBreakdown].sort((a, b) => {
    let valA = a[sortKey]
    let valB = b[sortKey]

    if (typeof valA === 'string') valA = valA.toLowerCase()
    if (typeof valB === 'string') valB = valB.toLowerCase()

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1
    return 0
  })

  // Data for story rating comparison bar chart
  const barChartData = perStoryBreakdown
    .filter((s) => s.status === 'published')
    .map((s) => ({
      title: s.title.length > 15 ? `${s.title.substring(0, 15)}...` : s.title,
      rating: Number(s.averageRating.toFixed(1)),
    }))

  return (
    <div className="flex flex-col gap-8 animate-fadeIn">
      {/* Overview Header */}
      <div>
        <h2 className="text-xl font-serif font-bold">Writing Analytics & Insights</h2>
        <p className="text-xs text-text-muted mt-0.5">
          Real-time metrics on readership, rating distributions, and manuscript reach.
        </p>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="p-5 border border-border flex items-center gap-4">
          <div className="p-3 bg-accent/10 text-accent rounded-2xl border border-accent/20">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
              Total Views
            </span>
            <span className="text-2xl font-serif font-bold text-text">
              {summary.totalViews.toLocaleString()}
            </span>
          </div>
        </Card>

        <Card className="p-5 border border-border flex items-center gap-4">
          <div className="p-3 bg-accent/10 text-accent rounded-2xl border border-accent/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
              Followers
            </span>
            <span className="text-2xl font-serif font-bold text-text">
              {summary.totalFollowers.toLocaleString()}
            </span>
          </div>
        </Card>

        <Card className="p-5 border border-border flex items-center gap-4">
          <div className="p-3 bg-accent/10 text-accent rounded-2xl border border-accent/20">
            <Star className="w-6 h-6 fill-current" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
              Avg Rating
            </span>
            <span className="text-2xl font-serif font-bold text-text">
              {summary.overallAverageRating.toFixed(1)} ★
            </span>
          </div>
        </Card>

        <Card className="p-5 border border-border flex items-center gap-4">
          <div className="p-3 bg-accent/10 text-accent rounded-2xl border border-accent/20">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
              Total Comments
            </span>
            <span className="text-2xl font-serif font-bold text-text">
              {summary.totalComments.toLocaleString()}
            </span>
          </div>
        </Card>
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 30-Day Readership Line Chart */}
        <Card className="p-6 border border-border flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-serif font-bold">30-Day Readership Trend</h3>
            </div>
            <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">
              Daily Views
            </span>
          </div>

          <div className="w-full h-64 font-sans text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={viewsHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="currentColor" opacity={0.5} />
                <YAxis tick={{ fontSize: 10 }} stroke="currentColor" opacity={0.5} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    borderRadius: '12px',
                    fontSize: '11px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="#c59b27"
                  strokeWidth={3}
                  dot={{ r: 3, fill: '#c59b27' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Story Rating Comparison Bar Chart */}
        <Card className="p-6 border border-border flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-serif font-bold">Rating Comparison by Story</h3>
            </div>
            <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">
              Average Score
            </span>
          </div>

          <div className="w-full h-64 font-sans text-xs">
            {barChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-text-muted text-xs italic">
                Publish manuscripts to view rating comparison.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis
                    dataKey="title"
                    tick={{ fontSize: 10 }}
                    stroke="currentColor"
                    opacity={0.5}
                  />
                  <YAxis
                    domain={[0, 5]}
                    tick={{ fontSize: 10 }}
                    stroke="currentColor"
                    opacity={0.5}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      borderRadius: '12px',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="rating" fill="#c59b27" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* Sortable Story Performance Table */}
      <Card className="p-6 border border-border flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-accent" />
          <h3 className="text-base font-serif font-bold">Individual Story Performance</h3>
        </div>

        {sortedStories.length === 0 ? (
          <div className="py-8 text-center text-text-muted text-xs">No manuscripts found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-sans">
              <thead>
                <tr className="border-b border-border/60 text-text-muted uppercase text-[10px] tracking-wider font-bold">
                  <th className="py-3 px-4">
                    <button
                      onClick={() => handleSort('title')}
                      className="flex items-center gap-1 hover:text-text cursor-pointer"
                    >
                      Manuscript Title <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleSort('viewCount')}
                      className="flex items-center gap-1 justify-end ml-auto hover:text-text cursor-pointer"
                    >
                      Views <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleSort('averageRating')}
                      className="flex items-center gap-1 justify-end ml-auto hover:text-text cursor-pointer"
                    >
                      Avg Rating <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleSort('commentCount')}
                      className="flex items-center gap-1 justify-end ml-auto hover:text-text cursor-pointer"
                    >
                      Comments <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleSort('updatedAt')}
                      className="flex items-center gap-1 justify-end ml-auto hover:text-text cursor-pointer"
                    >
                      Last Updated <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {sortedStories.map((story) => (
                  <tr key={story._id} className="hover:bg-surface/50 transition-colors">
                    <td className="py-3.5 px-4 font-serif font-bold text-text">{story.title}</td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={story.status === 'published' ? 'primary' : 'outline'}
                        className="text-[10px] uppercase tracking-wider"
                      >
                        {story.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-text">
                      {story.viewCount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-text">
                      {story.averageRating ? `${story.averageRating.toFixed(1)} ★` : '5.0 ★'} (
                      {story.ratingCount})
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-text">
                      {story.commentCount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right text-text-muted">
                      {new Date(story.updatedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
