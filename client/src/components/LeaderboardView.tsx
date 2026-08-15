import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from './ui/Card'
import { Badge } from './ui/Badge'
import { Skeleton } from './ui/Skeleton'
import { useAuthStore } from '../store/useAuthStore'
import { toast } from '../store/useToastStore'
import { apiFetch } from '../api/apiClient'
import { Trophy, Award, Crown } from 'lucide-react'

interface LeaderboardEntry {
  rank: number
  _id: string
  name: string
  firstName?: string
  lastName?: string
  avatarUrl?: string
  role: string
  compositeScore: number
  publishedStoryCount: number
  breakdown: {
    averageRating: number
    totalFollowers: number
    totalViews: number
  }
}

interface CurrentUserRankData {
  rank: number
  isTop50: boolean
  entry: LeaderboardEntry | null
}

export const LeaderboardView = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [currentUserRank, setCurrentUserRank] = useState<CurrentUserRankData | null>(null)
  const [totalWriters, setTotalWriters] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    apiFetch('/api/leaderboard')
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json.success) {
          setLeaderboard(json.data.leaderboard || [])
          setCurrentUserRank(json.data.currentUserRank || null)
          setTotalWriters(json.data.totalWriters || 0)
        }
      })
      .catch(() => {
        if (isMounted) toast.error('Failed to load leaderboard rankings.')
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-8 animate-fadeIn">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-44" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-44 w-full" />
        </div>
        <Card className="p-6 border border-border flex flex-col gap-4">
          <Skeleton className="h-6 w-48" />
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </Card>
      </div>
    )
  }

  const topThree = leaderboard.slice(0, 3)

  return (
    <div className="flex flex-col gap-8 animate-fadeIn">
      {/* Header & User Rank Callout */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold">Community Author Leaderboard</h2>
          <p className="text-xs text-text-muted mt-0.5 font-sans">
            Writers ranked by composite impact score: ratings, followers, and readership reach.
          </p>
        </div>

        {/* Current User Rank Badge */}
        {user?.role === 'writer' && currentUserRank && (
          <div className="p-3 bg-accent/10 border border-accent/30 rounded-2xl flex items-center gap-3 shrink-0">
            <Trophy className="w-5 h-5 text-accent" />
            <div className="text-xs font-sans">
              <span className="font-bold text-text">Your Rank: </span>
              <strong className="text-accent font-serif font-bold text-sm">
                #{currentUserRank.rank}
              </strong>{' '}
              <span className="text-text-muted text-[11px]">out of {totalWriters} writers</span>
            </div>
          </div>
        )}
      </div>

      {/* Top 3 Podium Highlights */}
      {topThree.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          {/* #2 Rank (Silver) */}
          {topThree[1] && (
            <Card
              onClick={() => navigate(`/profile/${topThree[1]._id}`)}
              className="p-6 border border-border/80 bg-surface/60 hover:border-accent transition-all cursor-pointer flex flex-col items-center text-center gap-3 order-2 md:order-1"
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-slate-300 text-slate-800 font-serif flex items-center justify-center text-2xl font-bold border-2 border-slate-400">
                  {topThree[1].name.charAt(0)}
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-300 text-slate-900 text-xs font-bold flex items-center justify-center border border-white">
                  2
                </span>
              </div>

              <div>
                <h3 className="font-serif font-bold text-base text-text">{topThree[1].name}</h3>
                <span className="text-[11px] text-accent font-bold font-sans">
                  {topThree[1].compositeScore} pts
                </span>
              </div>

              <div className="flex items-center gap-3 text-[10px] text-text-muted font-sans border-t border-border/40 pt-3 w-full justify-center">
                <span>{topThree[1].breakdown.averageRating} ★</span>
                <span>•</span>
                <span>{topThree[1].breakdown.totalFollowers} followers</span>
              </div>
            </Card>
          )}

          {/* #1 Rank (Gold Crown) */}
          {topThree[0] && (
            <Card
              onClick={() => navigate(`/profile/${topThree[0]._id}`)}
              className="p-8 border-2 border-accent bg-accent/5 hover:bg-accent/10 transition-all cursor-pointer flex flex-col items-center text-center gap-3 order-1 md:order-2 shadow-lg shadow-accent/10 scale-105"
            >
              <div className="relative">
                <Crown className="w-6 h-6 text-accent absolute -top-5 left-1/2 -translate-x-1/2" />
                <div className="w-20 h-20 rounded-full bg-accent text-white font-serif flex items-center justify-center text-3xl font-bold border-4 border-amber-300">
                  {topThree[0].name.charAt(0)}
                </div>
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center border border-white">
                  1
                </span>
              </div>

              <div>
                <Badge
                  variant="primary"
                  className="text-[9px] uppercase tracking-widest font-bold mb-1"
                >
                  Top Author
                </Badge>
                <h3 className="font-serif font-bold text-lg text-text">{topThree[0].name}</h3>
                <span className="text-xs font-bold text-accent font-sans">
                  {topThree[0].compositeScore} pts
                </span>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-text-muted font-sans border-t border-accent/20 pt-3 w-full justify-center">
                <span className="font-bold text-text">{topThree[0].breakdown.averageRating} ★</span>
                <span>•</span>
                <span>{topThree[0].breakdown.totalFollowers} followers</span>
                <span>•</span>
                <span>{topThree[0].breakdown.totalViews} views</span>
              </div>
            </Card>
          )}

          {/* #3 Rank (Bronze) */}
          {topThree[2] && (
            <Card
              onClick={() => navigate(`/profile/${topThree[2]._id}`)}
              className="p-6 border border-border/80 bg-surface/60 hover:border-accent transition-all cursor-pointer flex flex-col items-center text-center gap-3 order-3 md:order-3"
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-amber-700 text-white font-serif flex items-center justify-center text-2xl font-bold border-2 border-amber-600">
                  {topThree[2].name.charAt(0)}
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-700 text-white text-xs font-bold flex items-center justify-center border border-white">
                  3
                </span>
              </div>

              <div>
                <h3 className="font-serif font-bold text-base text-text">{topThree[2].name}</h3>
                <span className="text-[11px] text-accent font-bold font-sans">
                  {topThree[2].compositeScore} pts
                </span>
              </div>

              <div className="flex items-center gap-3 text-[10px] text-text-muted font-sans border-t border-border/40 pt-3 w-full justify-center">
                <span>{topThree[2].breakdown.averageRating} ★</span>
                <span>•</span>
                <span>{topThree[2].breakdown.totalFollowers} followers</span>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Top 50 Rankings Table */}
      <Card className="p-6 border border-border flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-accent" />
            <h3 className="text-base font-serif font-bold">Top 50 Community Rankings</h3>
          </div>
          <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold font-sans">
            Score = (Rating×20) + (Followers×2) + (Views×0.1)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead>
              <tr className="border-b border-border/60 text-text-muted uppercase text-[10px] tracking-wider font-bold">
                <th className="py-3 px-4 w-16">Rank</th>
                <th className="py-3 px-4">Author</th>
                <th className="py-3 px-4 text-right">Impact Score</th>
                <th className="py-3 px-4 text-right">Published</th>
                <th className="py-3 px-4 text-right">Avg Rating</th>
                <th className="py-3 px-4 text-right">Followers</th>
                <th className="py-3 px-4 text-right">Views</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {leaderboard.map((entry) => {
                const isCurrentUser = user?._id === entry._id
                return (
                  <tr
                    key={entry._id}
                    onClick={() => navigate(`/profile/${entry._id}`)}
                    className={`transition-colors cursor-pointer ${
                      isCurrentUser
                        ? 'bg-accent/10 border-l-4 border-accent font-semibold'
                        : 'hover:bg-surface/60'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-serif font-bold text-text">
                      {entry.rank <= 3 ? (
                        <span className="text-accent flex items-center gap-1 font-bold">
                          <Trophy className="w-3.5 h-3.5" /> #{entry.rank}
                        </span>
                      ) : (
                        `#${entry.rank}`
                      )}
                    </td>

                    <td className="py-3.5 px-4 flex items-center gap-3">
                      {entry.avatarUrl ? (
                        <img
                          src={entry.avatarUrl}
                          alt={entry.name}
                          className="w-8 h-8 rounded-full object-cover border border-border/60"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-accent text-white font-serif flex items-center justify-center text-xs font-bold">
                          {entry.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <span className="font-serif font-bold text-text block hover:text-accent transition-colors">
                          {entry.name} {isCurrentUser && '(You)'}
                        </span>
                        <span className="text-[10px] text-text-muted uppercase font-sans">
                          {entry.role}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-accent font-serif text-sm">
                      {entry.compositeScore}
                    </td>

                    <td className="py-3.5 px-4 text-right text-text font-sans">
                      {entry.publishedStoryCount}
                    </td>

                    <td className="py-3.5 px-4 text-right text-text font-sans">
                      {entry.breakdown.averageRating} ★
                    </td>

                    <td className="py-3.5 px-4 text-right text-text font-sans">
                      {entry.breakdown.totalFollowers}
                    </td>

                    <td className="py-3.5 px-4 text-right text-text-muted font-sans">
                      {entry.breakdown.totalViews.toLocaleString()}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
