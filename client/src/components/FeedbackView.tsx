import React, { useState } from 'react'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { toast } from '../store/useToastStore'
import { apiFetch } from '../api/apiClient'
import { MessageSquareHeart, Send, CheckCircle, Bug, Sparkles, HelpCircle } from 'lucide-react'

export const FeedbackView = () => {
  const [category, setCategory] = useState<'bug' | 'suggestion' | 'other'>('suggestion')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) {
      toast.error('Please write a message before submitting.')
      return
    }

    setSubmitting(true)
    try {
      const res = await apiFetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, message: message.trim() }),
      })
      const json = await res.json()
      if (res.ok && json.success) {
        setSubmitted(true)
        setMessage('')
        toast.success('Feedback submitted successfully!')
      } else {
        toast.error(json.message || 'Failed to submit feedback.')
      }
    } catch {
      toast.error('Error submitting feedback.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-12 animate-fadeIn">
        <Card className="p-10 border border-border text-center flex flex-col items-center gap-4 bg-surface/50">
          <div className="p-4 bg-green-500/10 text-green-500 rounded-full border border-green-500/20">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-serif font-bold">Feedback Received!</h2>
          <p className="text-xs text-text-muted max-w-md leading-relaxed font-sans">
            Thank you for helping us refine CollaboWrite_2.0. Our product and development team
            reviews every suggestion carefully.
          </p>
          <Button
            onClick={() => setSubmitted(false)}
            variant="outline"
            className="text-xs mt-2 cursor-pointer"
          >
            Submit Another Response
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 animate-fadeIn">
      <div>
        <h2 className="text-xl font-serif font-bold flex items-center gap-2">
          <MessageSquareHeart className="w-5 h-5 text-accent" /> Reader Feedback & Suggestions
        </h2>
        <p className="text-xs text-text-muted mt-0.5 font-sans">
          Notice a bug, have an idea for a feature, or want to share your experience? Let us know!
        </p>
      </div>

      <Card className="p-8 border border-border">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Category Select */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-text font-sans">
              Feedback Category
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setCategory('suggestion')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  category === 'suggestion'
                    ? 'bg-accent text-white border-accent'
                    : 'bg-bg border-border text-text-muted hover:border-accent'
                }`}
              >
                <Sparkles className="w-4 h-4" /> Feature Suggestion
              </button>

              <button
                type="button"
                onClick={() => setCategory('bug')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  category === 'bug'
                    ? 'bg-accent text-white border-accent'
                    : 'bg-bg border-border text-text-muted hover:border-accent'
                }`}
              >
                <Bug className="w-4 h-4" /> Bug Report
              </button>

              <button
                type="button"
                onClick={() => setCategory('other')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  category === 'other'
                    ? 'bg-accent text-white border-accent'
                    : 'bg-bg border-border text-text-muted hover:border-accent'
                }`}
              >
                <HelpCircle className="w-4 h-4" /> Other
              </button>
            </div>
          </div>

          {/* Message Textarea */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-text font-sans">
              Your Message
            </label>
            <textarea
              rows={6}
              placeholder="Describe your feedback in detail..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-4 bg-bg border border-border rounded-xl text-xs focus:border-accent outline-none font-sans leading-relaxed resize-none"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="text-xs py-2.5 flex items-center justify-center gap-2 cursor-pointer w-full"
          >
            <Send className="w-4 h-4" /> {submitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
