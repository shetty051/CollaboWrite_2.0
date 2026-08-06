import React, { useState, useEffect, useRef } from 'react'
import { Card } from './ui/Card'
import { Input } from './ui/Input'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import { TiptapEditor } from './TiptapEditor'
import { InviteCoAuthorModal } from './InviteCoAuthorModal'
import { toast } from '../store/useToastStore'
import { useAuthStore } from '../store/useAuthStore'
import {
  ArrowLeft,
  Save,
  Send,
  Image as ImageIcon,
  CheckCircle,
  RefreshCw,
  X,
  UserPlus,
  Users,
} from 'lucide-react'

export interface StoryData {
  _id?: string
  title?: string
  subtitle?: string
  genres?: string[]
  tags?: string[]
  coverImageUrl?: string
  content?: Record<string, unknown>
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

interface StoryEditorProps {
  initialStory?: StoryData | null
  onBack: () => void
  onSaved: () => void
}

const AVAILABLE_GENRES = [
  'Fiction',
  'Sci-Fi',
  'Memoir',
  'Mystery',
  'Poetry',
  'Historical',
  'Drama',
  'Fantasy',
  'Romance',
]

export const StoryEditor: React.FC<StoryEditorProps> = ({ initialStory, onBack, onSaved }) => {
  const currentUser = useAuthStore((state) => state.user)
  const [storyId, setStoryId] = useState<string | null>(initialStory?._id || null)
  const [title, setTitle] = useState(initialStory?.title || '')
  const [subtitle, setSubtitle] = useState(initialStory?.subtitle || '')
  const [genres, setGenres] = useState<string[]>(initialStory?.genres || ['Fiction'])
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>(initialStory?.tags || ['editorial'])
  const [coverImageUrl, setCoverImageUrl] = useState(initialStory?.coverImageUrl || '')
  const [content, setContent] = useState<Record<string, unknown>>(
    initialStory?.content || {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Write your story content here...' }],
        },
      ],
    },
  )

  const [saving, setSaving] = useState(false)
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)

  const isOriginalAuthor =
    !initialStory || !initialStory.author || initialStory.author._id === currentUser?._id

  // References to keep current values for autosave interval closure
  const formDataRef = useRef({ title, subtitle, genres, tags, content, coverImageUrl, storyId })
  useEffect(() => {
    formDataRef.current = { title, subtitle, genres, tags, content, coverImageUrl, storyId }
  }, [title, subtitle, genres, tags, content, coverImageUrl, storyId])

  // 30-Second Autosave Effect
  useEffect(() => {
    const timer = setInterval(async () => {
      const currentData = formDataRef.current
      if (currentData.storyId && currentData.title.trim()) {
        setAutosaveStatus('saving')
        try {
          const res = await fetch(`/api/stories/${currentData.storyId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: currentData.title,
              subtitle: currentData.subtitle,
              genres: currentData.genres,
              tags: currentData.tags,
              content: currentData.content,
              coverImageUrl: currentData.coverImageUrl,
              status: 'draft',
            }),
          })
          if (res.ok) {
            setAutosaveStatus('saved')
            setTimeout(() => setAutosaveStatus('idle'), 3000)
          }
        } catch {
          setAutosaveStatus('idle')
        }
      }
    }, 30000)

    return () => clearInterval(timer)
  }, [])

  // Genre selection handler
  const toggleGenre = (g: string) => {
    if (genres.includes(g)) {
      if (genres.length > 1) {
        setGenres(genres.filter((item) => item !== g))
      }
    } else {
      setGenres([...genres, g])
    }
  }

  // Tag creation
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      const newTag = tagInput.trim().toLowerCase()
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag])
      }
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  // Image Upload Handler
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64 = reader.result as string
      try {
        const res = await fetch('/api/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64 }),
        })
        const json = await res.json()
        if (res.ok && json.success) {
          setCoverImageUrl(json.url)
          toast.success('Cover image uploaded!')
        } else {
          toast.error(json.message || 'Image upload failed.')
        }
      } catch {
        toast.error('Error uploading image.')
      } finally {
        setUploadingImage(false)
      }
    }
    reader.readAsDataURL(file)
  }

  // Save as Draft
  const handleSaveDraft = async () => {
    if (!title.trim()) {
      toast.error('Please provide a story title.')
      return
    }

    setSaving(true)
    try {
      const endpoint = storyId ? `/api/stories/${storyId}` : '/api/stories'
      const method = storyId ? 'PATCH' : 'POST'

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          subtitle,
          genres,
          tags,
          content,
          coverImageUrl,
          status: 'draft',
        }),
      })

      const json = await res.json()
      if (res.ok && json.success) {
        setStoryId(json.data._id)
        toast.success(json.message || 'Draft saved successfully!')
        onSaved()
      } else {
        toast.error(json.message || 'Failed to save draft.')
      }
    } catch {
      toast.error('Server error saving manuscript.')
    } finally {
      setSaving(false)
    }
  }

  // Publish Story
  const handlePublish = async () => {
    if (!title.trim()) {
      toast.error('Please provide a story title before publishing.')
      return
    }

    setSaving(true)
    try {
      // First ensure it exists in DB
      let targetId = storyId
      if (!targetId) {
        const createRes = await fetch('/api/stories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            subtitle,
            genres,
            tags,
            content,
            coverImageUrl,
            status: 'draft',
          }),
        })
        const createJson = await createRes.json()
        if (!createRes.ok || !createJson.success) {
          toast.error(createJson.message || 'Failed to save story.')
          setSaving(false)
          return
        }
        targetId = createJson.data._id
        setStoryId(targetId)
      }

      // Publish endpoint
      const pubRes = await fetch(`/api/stories/${targetId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const pubJson = await pubRes.json()

      if (pubRes.ok && pubJson.success) {
        toast.success('Story published to the Public Library!')
        onSaved()
      } else {
        toast.error(pubJson.message || 'Failed to publish story.')
      }
    } catch {
      toast.error('Server error publishing manuscript.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* Editor Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-surface border border-border/70 rounded-xl transition-colors cursor-pointer text-text-muted hover:text-text"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-xl font-serif font-bold">
              {storyId ? 'Edit Manuscript' : 'New Manuscript'}
            </h2>
            <p className="text-xs text-text-muted">
              Draft your story, format headers, and publish to the library.
            </p>
          </div>
        </div>

        {/* Action Controls & Autosave Indicator */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          {autosaveStatus === 'saving' && (
            <span className="text-[11px] text-text-muted font-sans flex items-center gap-1.5 animate-pulse">
              <RefreshCw className="w-3 h-3 animate-spin text-accent" /> Autosaving...
            </span>
          )}
          {autosaveStatus === 'saved' && (
            <span className="text-[11px] text-green-500 font-sans flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Saved
            </span>
          )}

          {isOriginalAuthor && storyId && (
            <Button
              variant="outline"
              onClick={() => setInviteModalOpen(true)}
              className="text-xs flex items-center gap-1.5 cursor-pointer border-accent/40 text-accent hover:bg-accent/10"
            >
              <UserPlus className="w-3.5 h-3.5" /> Invite Co-Author
            </Button>
          )}

          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={saving}
            className="text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" /> Save Draft
          </Button>

          <Button
            onClick={handlePublish}
            disabled={saving}
            className="text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" /> Publish
          </Button>
        </div>
      </div>

      {/* Story Metadata Form */}
      <Card className="p-6 border border-border flex flex-col gap-5">
        {/* Active Co-Authors Banner if present */}
        {initialStory?.coAuthors && initialStory.coAuthors.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-surface border border-border rounded-xl text-xs">
            <Users className="w-4 h-4 text-accent shrink-0" />
            <span className="text-text-muted font-sans">
              Co-authors:{' '}
              <strong className="text-text">
                {initialStory.coAuthors.map((ca) => ca.name).join(', ')}
              </strong>
            </span>
          </div>
        )}

        <Input
          label="Story Title"
          type="text"
          placeholder="e.g. The Sign of The Burnt Petals"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <Input
          label="Subtitle / Brief Abstract"
          type="text"
          placeholder="A short overview or summary statement..."
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
        />

        {/* Cover Image Upload */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-text">
            Cover Image
          </label>
          <div className="flex items-center gap-4">
            {coverImageUrl ? (
              <div className="relative w-24 h-16 rounded-xl overflow-hidden border border-border group">
                <img src={coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setCoverImageUrl('')}
                  className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded-full hover:bg-red-600 transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="w-24 h-16 rounded-xl border border-dashed border-border bg-surface flex items-center justify-center text-text-muted">
                <ImageIcon className="w-6 h-6 opacity-40" />
              </div>
            )}

            <label className="px-4 py-2 border border-border/80 hover:border-accent text-xs font-semibold uppercase tracking-wider rounded-xl cursor-pointer transition-colors bg-surface">
              {uploadingImage ? 'Uploading...' : 'Choose Image'}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Genres multi-select */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-text">Genres</label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_GENRES.map((g) => (
              <button
                type="button"
                key={g}
                onClick={() => toggleGenre(g)}
                className={`px-3 py-1 text-xs rounded-full border transition-all cursor-pointer ${
                  genres.includes(g)
                    ? 'bg-accent text-white border-accent font-bold'
                    : 'bg-surface border-border text-text-muted hover:border-accent'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-text">Tags</label>
          <div className="flex flex-wrap items-center gap-2">
            {tags.map((t) => (
              <Badge key={t} variant="primary" className="flex items-center gap-1 text-xs">
                #{t}
                <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(t)} />
              </Badge>
            ))}
            <input
              type="text"
              placeholder="Add tag + press Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="px-3 py-1 bg-bg border border-border rounded-xl text-xs focus:border-accent outline-none font-sans"
            />
          </div>
        </div>
      </Card>

      {/* Rich Text Editor Body */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-text">
          Story Content
        </label>
        <TiptapEditor content={content} onChange={(newContent) => setContent(newContent)} />
      </div>

      {/* Invite Co-Author Modal */}
      {storyId && (
        <InviteCoAuthorModal
          isOpen={inviteModalOpen}
          onClose={() => setInviteModalOpen(false)}
          storyId={storyId}
          storyTitle={title || 'Manuscript'}
          existingCoAuthors={initialStory?.coAuthors}
        />
      )}
    </div>
  )
}
