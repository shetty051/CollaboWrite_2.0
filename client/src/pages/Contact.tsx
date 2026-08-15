import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { toast } from '../store/useToastStore'
import { ArrowLeft, MailOpen } from 'lucide-react'

import { apiFetch } from '../api/apiClient'

export const Contact = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Please fill in all fields (name, email, message).')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      toast.error('Please enter a valid email address.')
      return
    }

    setSubmitting(true)
    try {
      const res = await apiFetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
        }),
      })
      const json = await res.json()

      if (res.ok && json.success) {
        toast.success(json.message || 'Your message has been sent successfully!')
        setName('')
        setEmail('')
        setMessage('')
      } else {
        toast.error(json.message || 'Failed to send message. Please try again.')
      }
    } catch {
      toast.error('Error sending message. Please check your connection.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg text-text transition-colors duration-300 flex items-center justify-center p-6 relative">
      <div className="absolute top-6 left-6">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm text-text-muted hover:text-text transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>

      <Card className="w-full max-w-lg p-8 flex flex-col gap-6" hoverEffect={false}>
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="p-3 bg-accent/10 rounded-xl text-accent border border-accent/20">
            <MailOpen className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold font-serif tracking-tight mt-2">Contact Us</h1>
          <p className="text-text-muted text-xs font-sans">
            Have questions about the platform? Send us a message and we'll reply shortly.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Your Name"
            placeholder="Alistair Cole"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="alistair@bookstore.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="flex flex-col gap-1.5 font-sans">
            <label className="text-xs font-semibold tracking-wider uppercase text-text-muted">
              Message
            </label>
            <textarea
              rows={4}
              placeholder="How can we help you?"
              className="px-4 py-2.5 rounded-xl border border-border bg-bg/50 text-text placeholder:text-text-muted/40 focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent transition-all duration-300 w-full text-sm resize-none"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <Button type="submit" variant="primary" disabled={submitting} className="w-full mt-2">
            {submitting ? 'Sending...' : 'Send Message'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
