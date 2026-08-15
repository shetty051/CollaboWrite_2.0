import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { ReportModal } from '../components/ReportModal'
import { toast } from '../store/useToastStore'
import { apiFetch } from '../api/apiClient'
import {
  ArrowLeft,
  Star,
  Eye,
  Share2,
  Lock,
  Heart,
  MessageSquare,
  Check,
  Send,
  Bookmark,
  Flag,
  Trash2,
} from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'

interface AuthorInfo {
  _id: string
  name: string
  firstName?: string
  lastName?: string
  email: string
  role: string
  avatarUrl?: string
  bio?: string
}

interface TiptapMark {
  type: string
  attrs?: Record<string, unknown>
}

interface TiptapNode {
  type: string
  text?: string
  marks?: TiptapMark[]
  attrs?: {
    level?: number
    textAlign?: string
    [key: string]: unknown
  }
  content?: TiptapNode[]
}

interface TiptapDoc {
  type: string
  content?: TiptapNode[]
}

interface StoryDetailItem {
  _id: string
  title: string
  subtitle?: string
  author: AuthorInfo
  coAuthors: AuthorInfo[]
  genres: string[]
  tags: string[]
  content: TiptapDoc | Record<string, unknown> | string
  coverImageUrl?: string
  viewCount: number
  averageRating: number
  ratingCount: number
  shareSlug?: string
  isPubliclyShareable: boolean
}

interface CommentItem {
  _id: string
  text: string
  author: AuthorInfo
  createdAt: string
}

export const StoryDetail = () => {
  const { id, shareSlug } = useParams<{ id?: string; shareSlug?: string }>()
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)

  // Interactive local states
  const [userRating, setUserRating] = useState<number | null>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [commentsList, setCommentsList] = useState<CommentItem[]>([])

  // Report Modal states
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [reportTarget, setReportTarget] = useState<{
    type: 'story' | 'comment'
    id: string
    title?: string
  }>({
    type: 'story',
    id: '',
  })

  // Fetch story details by ID or shareSlug
  const {
    data,
    isLoading,
    isError,
    refetch: refetchStory,
  } = useQuery<{ success: boolean; data: StoryDetailItem }>({
    queryKey: ['storyDetail', id, shareSlug],
    queryFn: async () => {
      let endpoint = `/api/stories/${id}`
      if (shareSlug) {
        endpoint = `/api/stories/share/${shareSlug}`
      }
      const res = await apiFetch(endpoint)
      if (!res.ok) throw new Error('Failed to load story details.')
      return res.json()
    },
    enabled: !!id || !!shareSlug,
  })

  const story = data?.data

  // Fetch existing user rating, bookmark state, follow status, and comments
  useEffect(() => {
    if (story?._id) {
      // Fetch comments
      apiFetch(`/api/stories/${story._id}/comments`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success) setCommentsList(json.data)
        })
        .catch(() => {})

      // Fetch user rating if authenticated
      if (isAuthenticated) {
        apiFetch(`/api/stories/${story._id}/user-rating`)
          .then((res) => res.json())
          .then((json) => {
            if (json.success) setUserRating(json.userScore)
          })
          .catch(() => {})

        // Check if user bookmarks include this story
        apiFetch('/api/users/me/bookmarks')
          .then((res) => res.json())
          .then((json) => {
            if (json.success && Array.isArray(json.data)) {
              setIsBookmarked(json.data.some((b: { _id: string }) => b._id === story._id))
            }
          })
          .catch(() => {})
      }

      // Check author follow status
      if (story.author?._id) {
        apiFetch(`/api/users/${story.author._id}/profile`)
          .then((res) => res.json())
          .then((json) => {
            if (json.success && json.data) {
              setIsFollowing(json.data.isFollowing)
            }
          })
          .catch(() => {})
      }
    }
  }, [story?._id, story?.author?._id, isAuthenticated])

  // Open Graph & Page Title sync
  useEffect(() => {
    if (story) {
      document.title = `${story.title} - CollaboWrite`
    }
  }, [story])

  // Restricted Action Handler for Guests
  const handleGuestAction = (actionName: string) => {
    toast.info(`🔒 Please sign in to ${actionName}.`)
    navigate('/login')
  }

  // Submit Rating
  const handleRate = async (value: number) => {
    if (!isAuthenticated) {
      handleGuestAction('rate this story')
      return
    }
    if (!story) return

    try {
      const res = await apiFetch(`/api/stories/${story._id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: value }),
      })
      const json = await res.json()
      if (res.ok && json.success) {
        setUserRating(value)
        setShowRatingModal(false)
        toast.success(`You rated this story ${value} ★ stars!`)
        refetchStory()
      } else {
        toast.error(json.message || 'Failed to submit rating.')
      }
    } catch {
      toast.error('Error submitting rating.')
    }
  }

  // Toggle Bookmark
  const handleBookmarkToggle = async () => {
    if (!isAuthenticated) {
      handleGuestAction('bookmark stories')
      return
    }
    if (!story) return

    try {
      const endpoint = `/api/stories/${story._id}/bookmark`
      const method = isBookmarked ? 'DELETE' : 'POST'

      const res = await apiFetch(endpoint, { method })
      const json = await res.json()

      if (res.ok && json.success) {
        const nextState = !isBookmarked
        setIsBookmarked(nextState)
        toast.success(nextState ? 'Story saved to your Bookmarks!' : 'Removed from Bookmarks.')
      } else {
        toast.error(json.message || 'Failed to update bookmark.')
      }
    } catch {
      toast.error('Error updating bookmark.')
    }
  }

  // Follow / Unfollow Author
  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      handleGuestAction('follow this author')
      return
    }
    if (!story?.author?._id) return

    try {
      const endpoint = `/api/users/${story.author._id}/follow`
      const method = isFollowing ? 'DELETE' : 'POST'

      const res = await apiFetch(endpoint, { method })
      const json = await res.json()

      if (res.ok && json.success) {
        const nextState = !isFollowing
        setIsFollowing(nextState)
        toast.success(
          nextState ? `Following ${story.author.name}!` : `Unfollowed ${story.author.name}`,
        )
      } else {
        toast.error(json.message || 'Failed to update follow status.')
      }
    } catch {
      toast.error('Error updating follow status.')
    }
  }

  // Post Comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      handleGuestAction('add comments')
      return
    }
    if (!story || !commentText.trim()) return

    try {
      const res = await apiFetch(`/api/stories/${story._id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: commentText.trim() }),
      })
      const json = await res.json()
      if (res.ok && json.success) {
        setCommentsList([json.data, ...commentsList])
        setCommentText('')
        toast.success('Comment posted!')
      } else {
        toast.error(json.message || 'Failed to post comment.')
      }
    } catch {
      toast.error('Error posting comment.')
    }
  }

  // Delete Comment
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    try {
      const res = await apiFetch(`/api/comments/${commentId}`, { method: 'DELETE' })
      const json = await res.json()
      if (res.ok && json.success) {
        setCommentsList(commentsList.filter((c) => c._id !== commentId))
        toast.success('Comment deleted.')
      } else {
        toast.error(json.message || 'Failed to delete comment.')
      }
    } catch {
      toast.error('Error deleting comment.')
    }
  }

  // Open Report Modal
  const openReport = (type: 'story' | 'comment', id: string, title?: string) => {
    if (!isAuthenticated) {
      handleGuestAction('report content')
      return
    }
    setReportTarget({ type, id, title })
    setReportModalOpen(true)
  }

  // Copy Share Link
  const handleShare = () => {
    if (!story || !story.shareSlug || !story.isPubliclyShareable) {
      toast.error('This story is not configured for public sharing.')
      return
    }
    const shareUrl = `${window.location.origin}/library/story/share/${story.shareSlug}`
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => toast.success('Public share link copied to clipboard!'))
      .catch(() => toast.error('Failed to copy link to clipboard.'))
  }

  // Tiptap JSON node structure parser and renderer
  const renderRichText = (doc?: TiptapDoc | Record<string, unknown> | string | null) => {
    if (!doc) {
      return <p className="text-text-muted">No content logged for this draft.</p>
    }

    if (typeof doc === 'string') {
      return <p className="font-sans text-sm md:text-base text-text-muted leading-relaxed mb-5">{doc}</p>
    }

    const contentArray = (doc as TiptapDoc).content
    if (!contentArray || !Array.isArray(contentArray) || contentArray.length === 0) {
      return <p className="text-text-muted">No content logged for this draft.</p>
    }

    const getAlignClass = (textAlign?: string) => {
      switch (textAlign) {
        case 'center':
          return 'text-center'
        case 'right':
          return 'text-right'
        case 'justify':
          return 'text-justify'
        case 'left':
        default:
          return 'text-left'
      }
    }

    const renderInlineContent = (nodes?: TiptapNode[]): React.ReactNode => {
      if (!nodes || !Array.isArray(nodes)) return null

      return nodes.map((node, i) => {
        if (node.type === 'text') {
          let element: React.ReactNode = node.text || ''

          if (node.marks && node.marks.length > 0) {
            node.marks.forEach((mark) => {
              switch (mark.type) {
                case 'bold':
                  element = <strong>{element}</strong>
                  break
                case 'italic':
                  element = <em>{element}</em>
                  break
                case 'underline':
                  element = <u>{element}</u>
                  break
                case 'strike':
                  element = <s>{element}</s>
                  break
                case 'code':
                  element = (
                    <code className="bg-surface px-1.5 py-0.5 rounded text-accent font-mono text-xs border border-border">
                      {element}
                    </code>
                  )
                  break
              }
            })
          }
          return <React.Fragment key={i}>{element}</React.Fragment>
        }

        if (node.type === 'hardBreak') {
          return <br key={i} />
        }

        return null
      })
    }

    const renderNode = (node: TiptapNode, key: number | string): React.ReactNode => {
      const alignClass = getAlignClass(node.attrs?.textAlign)

      switch (node.type) {
        case 'heading': {
          const level = node.attrs?.level || 1
          const HeadingTag = (`h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6')
          const sizeClasses =
            level === 1
              ? 'text-2xl md:text-3xl font-bold mt-8 mb-4 border-b border-border/40 pb-2'
              : level === 2
                ? 'text-xl md:text-2xl font-bold mt-6 mb-3'
                : 'text-lg md:text-xl font-semibold mt-4 mb-2'

          return (
            <HeadingTag
              key={key}
              className={`font-serif tracking-tight text-text ${sizeClasses} ${alignClass}`}
            >
              {renderInlineContent(node.content)}
            </HeadingTag>
          )
        }
        case 'paragraph': {
          return (
            <p
              key={key}
              className={`font-sans text-sm md:text-base text-text-muted leading-relaxed mb-5 ${alignClass}`}
            >
              {renderInlineContent(node.content)}
            </p>
          )
        }
        case 'bulletList': {
          return (
            <ul key={key} className={`list-disc list-outside ml-6 my-4 space-y-1.5 text-text-muted text-sm ${alignClass}`}>
              {node.content?.map((child, idx) => renderNode(child, idx))}
            </ul>
          )
        }
        case 'orderedList': {
          return (
            <ol key={key} className={`list-decimal list-outside ml-6 my-4 space-y-1.5 text-text-muted text-sm ${alignClass}`}>
              {node.content?.map((child, idx) => renderNode(child, idx))}
            </ol>
          )
        }
        case 'listItem': {
          return (
            <li key={key} className="pl-1">
              {node.content?.map((child, idx) => renderNode(child, idx))}
            </li>
          )
        }
        case 'blockquote': {
          return (
            <blockquote
              key={key}
              className={`border-l-4 border-accent pl-4 py-2 my-5 italic text-text-muted bg-surface/40 rounded-r-lg font-serif ${alignClass}`}
            >
              {node.content?.map((child, idx) => renderNode(child, idx))}
            </blockquote>
          )
        }
        case 'codeBlock': {
          const codeText = node.content?.map((t) => t.text).join('') || ''
          return (
            <pre key={key} className="bg-surface p-4 rounded-xl font-mono text-xs border border-border my-5 overflow-x-auto text-text">
              <code>{codeText}</code>
            </pre>
          )
        }
        case 'horizontalRule': {
          return <hr key={key} className="my-8 border-border/60" />
        }
        default:
          return null
      }
    }

    return contentArray.map((node, idx) => renderNode(node, idx))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg text-text p-6 md:p-12 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        <span className="text-xs uppercase tracking-widest font-semibold text-text-muted">
          Loading Manuscript...
        </span>
      </div>
    )
  }

  if (isError || !story) {
    return (
      <div className="min-h-screen bg-bg text-text p-6 md:p-12 flex flex-col items-center justify-center gap-6">
        <h2 className="text-2xl font-serif font-bold">Manuscript Unavailable</h2>
        <p className="text-sm text-text-muted max-w-md text-center">
          The requested story does not exist, is in private draft mode, or has invalid permissions.
        </p>
        <Button onClick={() => navigate('/library')}>Return to Library</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg text-text transition-colors duration-300 py-8 px-6 md:px-12">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        {/* Navigation Toolbar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted hover:text-text transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleBookmarkToggle}
              className={`p-2 border rounded-xl transition-all cursor-pointer ${
                isBookmarked
                  ? 'bg-accent text-white border-accent'
                  : 'border-border/70 hover:border-accent text-text-muted hover:text-accent'
              }`}
              title={isBookmarked ? 'Bookmarked' : 'Add to Bookmarks'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={() => openReport('story', story._id, story.title)}
              className="p-2 border border-border/70 hover:border-red-500 hover:text-red-500 text-text-muted rounded-xl transition-colors cursor-pointer"
              title="Report Story"
            >
              <Flag className="w-4 h-4" />
            </button>

            {story.isPubliclyShareable && (
              <Button
                variant="outline"
                onClick={handleShare}
                className="text-xs flex items-center gap-2 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" /> Share Public Link
              </Button>
            )}
          </div>
        </div>

        {/* Cover Image Banner */}
        {story.coverImageUrl && (
          <div className="w-full h-64 md:h-80 rounded-2xl overflow-hidden border border-border shadow-md">
            <img
              src={story.coverImageUrl}
              alt={story.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Story Metadata Block */}
        <div className="flex flex-col gap-4 border-b border-border pb-8">
          <div className="flex flex-wrap items-center gap-2">
            {story.genres.map((g) => (
              <Badge key={g} variant="primary">
                {g}
              </Badge>
            ))}
          </div>

          <h1 className="text-3xl md:text-5xl font-serif font-bold tracking-tight leading-tight">
            {story.title}
          </h1>

          {story.subtitle && (
            <p className="text-base text-text-muted font-sans leading-relaxed">{story.subtitle}</p>
          )}

          {/* Metrics Row */}
          <div className="flex flex-wrap items-center gap-6 text-xs text-text-muted pt-2">
            <div className="flex items-center gap-1.5 font-semibold text-text">
              <Star className="w-4 h-4 text-accent fill-current" />
              <span>
                {userRating || story.averageRating.toFixed(1)} (
                {userRating ? story.ratingCount : story.ratingCount} ratings)
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-text-muted" />
              <span>{story.viewCount} Views</span>
            </div>
          </div>
        </div>

        {/* Story Rich Text Content Card */}
        <Card hoverEffect={false} className="p-8 md:p-12 shadow-sm border border-border">
          <article className="prose dark:prose-invert max-w-none">
            {renderRichText(story.content)}
          </article>
        </Card>

        {/* Reader Interactions Section */}
        <div className="flex flex-col gap-4 bg-surface border border-border p-6 rounded-2xl shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/40">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-text">
                Reader Interactions
              </span>
              <span className="text-[11px] text-text-muted font-sans block mt-0.5">
                {isAuthenticated
                  ? 'Submit ratings and comment on this story'
                  : 'Sign in to rate or comment'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (!isAuthenticated) handleGuestAction('rate this story')
                  else setShowRatingModal((prev) => !prev)
                }}
                className={`flex items-center gap-1.5 px-4 py-2 border text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                  userRating
                    ? 'bg-accent/10 border-accent text-accent'
                    : 'border-border/70 hover:border-accent hover:text-accent'
                }`}
              >
                {isAuthenticated ? (
                  <Star className="w-3.5 h-3.5 text-accent fill-current" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-accent/80" />
                )}
                {userRating ? `${userRating} ★ Rated` : 'Rate'}
              </button>

              <button
                onClick={() => {
                  if (!isAuthenticated) handleGuestAction('add comments')
                  else {
                    const el = document.getElementById('comment-input')
                    el?.focus()
                  }
                }}
                className="flex items-center gap-1.5 px-4 py-2 border border-border/70 hover:border-accent text-xs font-bold uppercase tracking-wider rounded-xl hover:text-accent transition-colors cursor-pointer"
              >
                {isAuthenticated ? (
                  <MessageSquare className="w-3.5 h-3.5 text-accent" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-accent/80" />
                )}
                Comment ({commentsList.length})
              </button>
            </div>
          </div>

          {/* Rating picker popover */}
          {showRatingModal && isAuthenticated && (
            <div className="flex items-center gap-2 py-2 bg-bg p-3 rounded-xl border border-border w-fit animate-fadeIn">
              <span className="text-xs font-bold text-text mr-2">Select Rating:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRate(star)}
                  className="p-1 hover:scale-125 transition-transform text-accent cursor-pointer"
                >
                  <Star
                    className={`w-5 h-5 ${userRating && userRating >= star ? 'fill-current' : ''}`}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Comment Form & Feed */}
          {isAuthenticated ? (
            <div className="flex flex-col gap-4 pt-2">
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  id="comment-input"
                  type="text"
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-bg border border-border rounded-xl text-xs focus:border-accent outline-none font-sans"
                />
                <Button
                  type="submit"
                  className="text-xs px-4 py-2 flex items-center gap-1 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> Post
                </Button>
              </form>

              <div className="flex flex-col gap-3 mt-2">
                {commentsList.length === 0 ? (
                  <div className="text-xs text-text-muted italic py-2">
                    No comments yet. Be the first to start the discussion!
                  </div>
                ) : (
                  commentsList.map((c) => {
                    const isMyComment = user?._id === c.author?._id
                    return (
                      <div
                        key={c._id}
                        className="p-3.5 bg-bg border border-border/60 rounded-xl flex flex-col gap-1 group"
                      >
                        <div className="flex justify-between items-center text-[11px]">
                          <Link
                            to={`/profile/${c.author?._id}`}
                            className="font-bold text-text hover:text-accent transition-colors"
                          >
                            {c.author?.name || 'Anonymous Reader'}
                          </Link>
                          <div className="flex items-center gap-2 text-text-muted">
                            <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                            <button
                              onClick={() => openReport('comment', c._id, c.text.substring(0, 30))}
                              className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity p-0.5"
                              title="Report Comment"
                            >
                              <Flag className="w-3 h-3" />
                            </button>
                            {isMyComment && (
                              <button
                                onClick={() => handleDeleteComment(c._id)}
                                className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity p-0.5"
                                title="Delete Comment"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-text-muted font-sans mt-0.5">{c.text}</p>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          ) : (
            <div className="text-xs text-text-muted italic py-1">
              Sign in to view and participate in community discussions.
            </div>
          )}
        </div>

        {/* Author Bio Card */}
        <Card
          hoverEffect={false}
          className="p-6 bg-surface/50 flex flex-col md:flex-row gap-6 items-start"
        >
          <div className="flex flex-col items-center text-center">
            {story.author.avatarUrl ? (
              <img
                src={story.author.avatarUrl}
                alt={story.author.name}
                className="w-16 h-16 rounded-full border border-border/60 p-0.5 bg-bg object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full border border-border/60 bg-accent text-white font-serif flex items-center justify-center text-xl font-bold">
                {story.author.name.charAt(0)}
              </div>
            )}
            <span className="text-[10px] font-bold text-accent uppercase tracking-widest mt-2">
              {story.author.role}
            </span>
          </div>

          <div className="flex-1 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Link
                to={`/profile/${story.author._id}`}
                className="font-serif italic font-bold text-lg text-text hover:text-accent transition-colors"
              >
                Written by {story.author.name}
              </Link>

              {user?._id !== story.author._id && (
                <button
                  onClick={handleFollowToggle}
                  className={`flex items-center gap-1.5 text-[10px] font-bold border px-3 py-1 uppercase rounded-full transition-all cursor-pointer ${
                    isFollowing
                      ? 'bg-accent text-white border-accent'
                      : 'text-accent border-accent/20 hover:border-accent hover:bg-accent/5'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <Check className="w-3 h-3" /> Following
                    </>
                  ) : isAuthenticated ? (
                    <>
                      <Heart className="w-3 h-3 text-accent fill-current" /> Follow
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3 text-accent" /> Follow
                    </>
                  )}
                </button>
              )}
            </div>

            <p className="text-xs text-text-muted leading-relaxed font-sans">
              {story.author.bio ||
                'This author has not yet written a biography. Read and share their collaborative manuscripts!'}
            </p>

            {story.coAuthors && story.coAuthors.length > 0 && (
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/30">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  Co-Authors:
                </span>
                <div className="flex items-center gap-2">
                  {story.coAuthors.map((ca) => (
                    <Link
                      key={ca._id}
                      to={`/profile/${ca._id}`}
                      className="text-xs font-semibold text-text hover:underline"
                    >
                      {ca.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Flag / Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetType={reportTarget.type}
        targetId={reportTarget.id}
        targetTitle={reportTarget.title}
      />
    </div>
  )
}
