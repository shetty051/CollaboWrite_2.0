import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from './ui/Card'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'
import { toast } from '../store/useToastStore'
import { Sparkles, TrendingUp, Users, Star, Eye, BookOpen, Compass } from 'lucide-react'

interface StoryItem {
  _id: string
  title: string
  subtitle?: string
  genres?: string[]
  coverImageUrl?: string
  viewCount: number
  averageRating: number
  ratingCount: number
  author?: {
    _id: string
    name: string
    avatarUrl?: string
  }
}

interface WriterItem {
  _id: string
  name: string
  avatarUrl?: string
  bio?: string
  role: string
  followerCount: number
}

export const ReaderHome = () => {
  const navigate = useNavigate()

  const [spotlight, setSpotlight] = useState<{
    trendingStories: StoryItem[]
    mostFollowedWriters: WriterItem[]
  } | null>(null)
  const [recommendations, setRecommendations] = useState<StoryItem[]>([])
  const [topGenres, setTopGenres] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    Promise.all([fetch('/api/home/spotlight'), fetch('/api/home/recommendations')])
      .then(async ([spotRes, recRes]) => {
        const spotJson = await spotRes.json()
        const recJson = await recRes.json()

        if (isMounted) {
          if (spotJson.success) setSpotlight(spotJson.data)
          if (recJson.success) {
            setRecommendations(recJson.data || [])
            setTopGenres(recJson.topGenres || [])
          }
        }
      })
      .catch(() => {
        if (isMounted) toast.error('Failed to load homepage feeds.')
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
      <div className="py-20 text-center text-text-muted text-xs font-sans">
        Loading personalized library home...
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-10 animate-fadeIn">
      {/* Recommended For You Section */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-border/60 pb-3">
          <div>
            <h2 className="text-xl font-serif font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" /> Recommended For You
            </h2>
            <p className="text-xs text-text-muted font-sans mt-0.5">
              Personalized selection tailored to your ratings & bookmarked genres.
            </p>
          </div>
          {topGenres.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
                Top Genres:
              </span>
              {topGenres.map((g) => (
                <Badge key={g} variant="primary" className="text-[10px]">
                  {g}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {recommendations.length === 0 ? (
          <div className="p-8 border border-border/60 bg-surface/40 rounded-2xl text-center flex flex-col items-center gap-3">
            <Compass className="w-8 h-8 text-accent opacity-50" />
            <p className="text-xs text-text-muted font-sans max-w-sm">
              Rate stories or add manuscripts to your bookmarks to unlock personalized AI
              recommendations!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendations.map((story) => (
              <Card
                key={story._id}
                onClick={() => navigate(`/library/story/${story._id}`)}
                className="p-6 border border-border flex flex-col justify-between gap-4 cursor-pointer hover:border-accent transition-all group"
              >
                <div>
                  {story.coverImageUrl ? (
                    <div className="w-full h-36 rounded-xl border border-border/40 overflow-hidden mb-3">
                      <img
                        src={story.coverImageUrl}
                        alt={story.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-36 rounded-xl border border-border/40 bg-accent/5 flex items-center justify-center mb-3">
                      <BookOpen className="w-8 h-8 text-accent opacity-40" />
                    </div>
                  )}
                  <h3 className="text-base font-serif font-bold group-hover:text-accent transition-colors">
                    {story.title}
                  </h3>
                  {story.author && (
                    <span className="text-xs text-accent block font-sans mt-0.5">
                      by {story.author.name}
                    </span>
                  )}
                  {story.subtitle && (
                    <p className="text-xs text-text-muted mt-2 leading-relaxed line-clamp-2">
                      {story.subtitle}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-border/50 pt-3 mt-2 text-xs font-sans text-text-muted">
                  <span className="flex items-center gap-1 font-bold text-text">
                    <Star className="w-3.5 h-3.5 text-accent fill-current" />
                    {story.averageRating ? story.averageRating.toFixed(1) : '5.0'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {story.viewCount} views
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Community Spotlight Section */}
      {spotlight && (
        <div className="flex flex-col gap-8">
          {/* Trending Reads Grid */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-border/60 pb-3">
              <div>
                <h2 className="text-xl font-serif font-bold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-accent" /> Trending Reads
                </h2>
                <p className="text-xs text-text-muted font-sans mt-0.5">
                  Most active manuscripts across the platform this week.
                </p>
              </div>
              <Button
                onClick={() => navigate('/library')}
                variant="outline"
                className="text-xs px-3 py-1 cursor-pointer"
              >
                View All
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {spotlight.trendingStories.map((story) => (
                <Card
                  key={story._id}
                  onClick={() => navigate(`/library/story/${story._id}`)}
                  className="p-6 border border-border flex flex-col justify-between gap-4 cursor-pointer hover:border-accent transition-all group"
                >
                  <div>
                    {story.coverImageUrl ? (
                      <div className="w-full h-36 rounded-xl border border-border/40 overflow-hidden mb-3">
                        <img
                          src={story.coverImageUrl}
                          alt={story.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-36 rounded-xl border border-border/40 bg-accent/5 flex items-center justify-center mb-3">
                        <BookOpen className="w-8 h-8 text-accent opacity-40" />
                      </div>
                    )}
                    <h3 className="text-base font-serif font-bold group-hover:text-accent transition-colors">
                      {story.title}
                    </h3>
                    {story.author && (
                      <span className="text-xs text-accent block font-sans mt-0.5">
                        by {story.author.name}
                      </span>
                    )}
                    {story.subtitle && (
                      <p className="text-xs text-text-muted mt-2 leading-relaxed line-clamp-2">
                        {story.subtitle}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-border/50 pt-3 mt-2 text-xs font-sans text-text-muted">
                    <span className="flex items-center gap-1 font-bold text-text">
                      <Star className="w-3.5 h-3.5 text-accent fill-current" />
                      {story.averageRating ? story.averageRating.toFixed(1) : '5.0'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {story.viewCount} views
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Most Followed Authors Row */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-border/60 pb-3">
              <div>
                <h2 className="text-xl font-serif font-bold flex items-center gap-2">
                  <Users className="w-5 h-5 text-accent" /> Featured Writers
                </h2>
                <p className="text-xs text-text-muted font-sans mt-0.5">
                  Top authors with active reader followings.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {spotlight.mostFollowedWriters.map((writer) => (
                <Card
                  key={writer._id}
                  onClick={() => navigate(`/profile/${writer._id}`)}
                  className="p-5 border border-border flex flex-col items-center text-center gap-3 cursor-pointer hover:border-accent transition-all"
                >
                  {writer.avatarUrl ? (
                    <img
                      src={writer.avatarUrl}
                      alt={writer.name}
                      className="w-14 h-14 rounded-full object-cover border border-border"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-accent text-white font-serif flex items-center justify-center text-xl font-bold border border-border">
                      {writer.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-serif font-bold text-sm text-text">{writer.name}</h3>
                    <span className="text-[10px] text-text-muted uppercase font-sans block mt-0.5">
                      {writer.followerCount} Followers
                    </span>
                  </div>
                  <Button variant="outline" className="text-[11px] px-3 py-1 w-full cursor-pointer">
                    View Profile
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
