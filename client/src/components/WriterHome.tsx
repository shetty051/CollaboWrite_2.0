import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { toast } from '../store/useToastStore'
import { Video, BookOpen, Star, Eye } from 'lucide-react'

interface StoryItem {
  _id: string
  title: string
  subtitle?: string
  coverImageUrl?: string
  viewCount: number
  averageRating: number
  author?: {
    _id: string
    name: string
  }
}

const YOUTUBE_CRAFT_VIDEOS = [
  {
    id: 'vK_w0z_N--s',
    title: 'How to Write a Great Story: Plotting & Character Arcs',
    channel: 'Brandon Sanderson Masterclass',
  },
  {
    id: 'b84cZJdE8v8',
    title: 'Show, Don’t Tell: Creative Writing Rules to Live By',
    channel: 'Creative Writing Workshop',
  },
  {
    id: '0IFDuhdB2Hk',
    title: 'Worldbuilding 101: Creating Believable Settings',
    channel: 'Author Insights',
  },
  {
    id: 'wVnPyqF_aVs',
    title: 'Editing & Polishing Manuscripts for Publication',
    channel: 'Literary Editing Essentials',
  },
]

export const WriterHome = () => {
  const navigate = useNavigate()
  const [feedStories, setFeedStories] = useState<StoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    fetch('/api/home/spotlight')
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json.success) {
          setFeedStories(json.data.trendingStories || [])
        }
      })
      .catch(() => {
        if (isMounted) toast.error('Failed to load community writer feed.')
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="flex flex-col gap-10 animate-fadeIn">
      {/* Masterclass Writing Craft Section */}
      <div className="flex flex-col gap-4">
        <div className="border-b border-border/60 pb-3">
          <h2 className="text-xl font-serif font-bold flex items-center gap-2">
            <Video className="w-5 h-5 text-accent" /> Writing Craft Masterclasses
          </h2>
          <p className="text-xs text-text-muted font-sans mt-0.5">
            Curated video lectures on plotting, worldbuilding, and polishing manuscripts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {YOUTUBE_CRAFT_VIDEOS.map((vid) => (
            <Card key={vid.id} className="p-4 border border-border flex flex-col gap-3">
              <div className="w-full aspect-video rounded-xl overflow-hidden border border-border/40 bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${vid.id}`}
                  title={vid.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm text-text">{vid.title}</h3>
                <span className="text-[10px] text-text-muted font-sans block mt-0.5">
                  {vid.channel}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Community Writer Feed */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-border/60 pb-3">
          <div>
            <h2 className="text-xl font-serif font-bold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-accent" /> Peer Author Feed
            </h2>
            <p className="text-xs text-text-muted font-sans mt-0.5">
              Explore literature published by fellow authors across the platform.
            </p>
          </div>
          <Button
            onClick={() => navigate('/library')}
            variant="outline"
            className="text-xs px-3 py-1 cursor-pointer"
          >
            Browse All
          </Button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-text-muted text-xs font-sans">
            Loading writer feed...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {feedStories.map((story) => (
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
    </div>
  )
}
