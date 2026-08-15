import React, { useState } from 'react'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'
import { toast } from '../store/useToastStore'
import { apiFetch } from '../api/apiClient'
import { Flag } from 'lucide-react'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  targetType: 'story' | 'comment'
  targetId: string
  targetTitle?: string
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle,
}) => {
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) {
      toast.error('Please provide a reason for flagging this content.')
      return
    }

    setSubmitting(true)
    try {
      const res = await apiFetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType,
          targetId,
          reason: reason.trim(),
        }),
      })

      const json = await res.json()
      if (res.ok && json.success) {
        toast.success('Report submitted successfully. Our team will review this item.')
        setReason('')
        onClose()
      } else {
        toast.error(json.message || 'Failed to submit report.')
      }
    } catch {
      toast.error('Server error submitting report.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Report ${targetType === 'story' ? 'Story' : 'Comment'}`}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-xs text-text-muted bg-surface p-3 rounded-xl border border-border">
          <Flag className="w-4 h-4 text-accent shrink-0" />
          <span>
            Reporting {targetType}: <strong className="text-text">{targetTitle || targetId}</strong>
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-text">
            Reason for Report
          </label>
          <textarea
            rows={4}
            placeholder="Explain why this content violates community standards..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full p-3 bg-bg border border-border rounded-xl text-xs focus:border-accent outline-none font-sans"
            required
          />
        </div>

        <div className="flex justify-end gap-3 mt-2">
          <Button type="button" variant="outline" onClick={onClose} className="text-xs">
            Cancel
          </Button>
          <Button type="submit" disabled={submitting} className="text-xs">
            {submitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
