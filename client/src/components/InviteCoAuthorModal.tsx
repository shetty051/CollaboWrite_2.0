import React, { useState, useEffect } from 'react'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'
import { toast } from '../store/useToastStore'
import { Search, UserPlus, Users } from 'lucide-react'

interface WriterUser {
  _id: string
  name: string
  firstName?: string
  lastName?: string
  email: string
  avatarUrl?: string
  role: string
}

interface InviteCoAuthorModalProps {
  isOpen: boolean
  onClose: () => void
  storyId: string
  storyTitle: string
  existingCoAuthors?: WriterUser[]
}

export const InviteCoAuthorModal: React.FC<InviteCoAuthorModalProps> = ({
  isOpen,
  onClose,
  storyId,
  storyTitle,
  existingCoAuthors = [],
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<WriterUser[]>([])
  const [searching, setSearching] = useState(false)
  const [invitingId, setInvitingId] = useState<string | null>(null)

  // Search writers effect with debouncing
  useEffect(() => {
    if (!searchQuery.trim()) return

    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/users/search?query=${encodeURIComponent(searchQuery.trim())}`)
        const json = await res.json()
        if (res.ok && json.success) {
          setResults(json.data || [])
        }
      } catch {
        // silent catch
      } finally {
        setSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleSearchChange = (val: string) => {
    setSearchQuery(val)
    if (!val.trim()) {
      setResults([])
    }
  }

  const handleSendInvite = async (targetUserId: string, targetName: string) => {
    setInvitingId(targetUserId)
    try {
      const res = await fetch(`/api/stories/${storyId}/collab-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId }),
      })

      const json = await res.json()
      if (res.ok && json.success) {
        toast.success(`Invitation sent to ${targetName}!`)
        onClose()
      } else {
        toast.error(json.message || 'Failed to send invitation.')
      }
    } catch {
      toast.error('Error sending collaboration request.')
    } finally {
      setInvitingId(null)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite Co-Author">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-xs text-text-muted bg-surface p-3 rounded-xl border border-border">
          <Users className="w-4 h-4 text-accent shrink-0" />
          <span>
            Invite a writer to co-author <strong className="text-text">{storyTitle}</strong>
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search writers by name or email..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-bg border border-border rounded-xl text-xs focus:border-accent outline-none font-sans"
            autoFocus
          />
        </div>

        {/* Search Results List */}
        <div className="min-h-[160px] max-h-60 overflow-y-auto flex flex-col gap-2">
          {searching ? (
            <div className="text-xs text-text-muted text-center py-6">Searching writers...</div>
          ) : searchQuery.trim() && results.length === 0 ? (
            <div className="text-xs text-text-muted text-center py-6">
              No matching writer accounts found.
            </div>
          ) : results.length > 0 ? (
            results.map((writer) => {
              const isAlreadyCoAuthor = existingCoAuthors.some((ca) => ca._id === writer._id)
              return (
                <div
                  key={writer._id}
                  className="p-3 bg-bg border border-border rounded-xl flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    {writer.avatarUrl ? (
                      <img
                        src={writer.avatarUrl}
                        alt={writer.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-accent text-white font-serif flex items-center justify-center text-xs font-bold">
                        {writer.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <span className="font-bold text-xs text-text block">{writer.name}</span>
                      <span className="text-[10px] text-text-muted font-sans">{writer.email}</span>
                    </div>
                  </div>

                  {isAlreadyCoAuthor ? (
                    <span className="text-[10px] font-bold text-green-500 uppercase">
                      Co-Author
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      disabled={invitingId === writer._id}
                      onClick={() => handleSendInvite(writer._id, writer.name)}
                      className="text-[11px] px-3 py-1 flex items-center gap-1 cursor-pointer"
                    >
                      <UserPlus className="w-3 h-3" /> Invite
                    </Button>
                  )}
                </div>
              )
            })
          ) : (
            <div className="text-xs text-text-muted text-center py-6 italic font-sans">
              Type a writer's name or email to search.
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-border/50">
          <Button variant="outline" onClick={onClose} className="text-xs">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}
