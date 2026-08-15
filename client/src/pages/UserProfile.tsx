import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { toast } from '../store/useToastStore'
import { useAuthStore } from '../store/useAuthStore'
import { apiFetch } from '../api/apiClient'
import { ArrowLeft, User, Heart, Check, BookOpen, Star, Eye } from 'lucide-react'

interface UserProfileData {
  user: {
    _id: string
    firstName: string
    lastName: string
    name: string
    email: string
    role: string
    avatarUrl?: string
    bio?: string
    followerCount: number
    followingCount: number
  }
  publishedStories: Array<{
    _id: string
    title: string
    subtitle?: string
    genres: string[]
    averageRating: number
    viewCount: number
    coverImageUrl?: string
    publishedAt: string
  }>
  isFollowing: boolean
}

export const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const currentUser = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const { data, isLoading, isError, refetch } = useQuery<{
    success: boolean
    data: UserProfileData
  }>({
    queryKey: ['userProfile', userId],
    queryFn: async () => {
      const res = await apiFetch(`/api/users/${userId}/profile`)
      if (!res.ok) throw new Error('User profile not found.')
      return res.json()
    },
    enabled: !!userId,
  })

  const [optimisticFollowing, setOptimisticFollowing] = useState<boolean | null>(null)
  const [optimisticCountDelta, setOptimisticCountDelta] = useState<number>(0)

  const profileData = data?.data
  const isOwnProfile = currentUser?._id === userId
  const isFollowing =
    optimisticFollowing !== null ? optimisticFollowing : profileData?.isFollowing || false
  const followerCount = (profileData?.user?.followerCount || 0) + optimisticCountDelta

  const checkAuth = useAuthStore((state) => state.checkAuth)

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      toast.info('🔒 Please sign in to follow writers.')
      navigate('/login')
      return
    }

    const nextFollowingState = !isFollowing
    // Optimistically update UI instantly!
    setOptimisticFollowing(nextFollowingState)
    setOptimisticCountDelta((prev) => (nextFollowingState ? prev + 1 : prev - 1))

    try {
      const endpoint = `/api/users/${userId}/follow`
      const method = isFollowing ? 'DELETE' : 'POST'

      const res = await apiFetch(endpoint, { method })
      const json = await res.json()

      if (res.ok && json.success) {
        toast.success(
          nextFollowingState
            ? `Following ${profileData?.user.name}!`
            : `Unfollowed ${profileData?.user.name}`,
        )
        await refetch()
        setOptimisticFollowing(null)
        setOptimisticCountDelta(0)
        await checkAuth()
      } else {
        // Rollback optimistic state on error
        setOptimisticFollowing(!nextFollowingState)
        setOptimisticCountDelta((prev) => (nextFollowingState ? prev - 1 : prev + 1))
        toast.error(json.message || 'Failed to update follow status.')
      }
    } catch {
      // Rollback optimistic state on error
      setOptimisticFollowing(!nextFollowingState)
      setOptimisticCountDelta((prev) => (nextFollowingState ? prev - 1 : prev + 1))
      toast.error('Error updating follow status.')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs uppercase tracking-widest text-text-muted">
          Loading Profile...
        </span>
      </div>
    )
  }

  if (isError || !profileData) {
    return (
      <div className="min-h-screen bg-bg p-8 flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-serif font-bold">User Not Found</h2>
        <p className="text-xs text-text-muted">
          The requested profile does not exist or is unavailable.
        </p>
        <Button onClick={() => navigate('/library')} className="text-xs">
          Return to Library
        </Button>
      </div>
    )
  }

  const { user, publishedStories } = profileData

  return (
    <div className="min-h-screen bg-bg text-text transition-colors duration-300 py-8 px-6 md:px-12">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        {/* Navigation Toolbar */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted hover:text-text transition-colors cursor-pointer w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* User Banner Header */}
        <Card className="p-8 border border-border flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex items-center gap-5">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-20 h-20 rounded-full border border-border object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-accent text-white font-serif flex items-center justify-center text-3xl font-bold border border-border">
                {user.name.charAt(0)}
              </div>
            )}

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-serif font-bold">{user.name}</h1>
                <Badge variant="primary" className="text-[10px] uppercase font-semibold">
                  {user.role}
                </Badge>
              </div>

              <p className="text-xs text-text-muted font-sans max-w-md">
                {user.bio || 'This writer has not added a bio yet.'}
              </p>

              <div className="flex items-center gap-6 mt-2 text-xs text-text-muted font-sans">
                <div>
                  <strong className="text-text font-bold">{followerCount}</strong> Followers
                </div>
                <div>
                  <strong className="text-text font-bold">{user.followingCount}</strong> Following
                </div>
                <div>
                  <strong className="text-text font-bold">{publishedStories.length}</strong>{' '}
                  Manuscripts
                </div>
              </div>
            </div>
          </div>

          {!isOwnProfile && (
            <Button
              onClick={handleFollowToggle}
              variant={isFollowing ? 'outline' : 'primary'}
              className="text-xs flex items-center gap-2 cursor-pointer"
            >
              {isFollowing ? (
                <>
                  <Check className="w-4 h-4 text-accent" /> Following
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4" /> Follow Author
                </>
              )}
            </Button>
          )}
        </Card>

        {/* Published Stories Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-serif font-bold">
              Published Manuscripts ({publishedStories.length})
            </h2>
          </div>

          {publishedStories.length === 0 ? (
            <div className="p-12 border border-border/80 bg-surface/30 rounded-2xl text-center flex flex-col items-center gap-3">
              <User className="w-8 h-8 text-accent opacity-40" />
              <p className="text-xs text-text-muted font-sans">
                This author has not published any public manuscripts yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {publishedStories.map((story) => (
                <Card
                  key={story._id}
                  className="p-6 border border-border flex flex-col gap-4 justify-between cursor-pointer hover:border-accent transition-colors"
                  onClick={() => navigate(`/library/story/${story._id}`)}
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
                    <Badge variant="primary" className="text-[10px] mb-2">
                      {story.genres[0] || 'Uncategorized'}
                    </Badge>
                    <h3 className="text-lg font-serif font-bold">{story.title}</h3>
                    {story.subtitle && (
                      <p className="text-xs text-text-muted mt-1 leading-relaxed line-clamp-2">
                        {story.subtitle}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-border/50 pt-3 mt-2 text-xs text-text-muted">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 font-semibold text-text">
                        <Star className="w-3.5 h-3.5 text-accent fill-current" />
                        {story.averageRating > 0 ? story.averageRating.toFixed(1) : '—'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" /> {story.viewCount}
                      </span>
                    </div>
                    <span className="text-accent font-bold hover:underline">Read Story →</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
