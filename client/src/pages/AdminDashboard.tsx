import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { ThemeToggle } from '../components/ThemeToggle'
import { toast } from '../store/useToastStore'
import { apiFetch } from '../api/apiClient'
import { ShieldAlert, MessageSquare, Flag, Users, Search, ArrowLeft, Mail, CheckCircle, Trash2 } from 'lucide-react'

interface ContactMessageItem {
  _id: string
  name: string
  email: string
  message: string
  status: 'unread' | 'read'
  createdAt: string
}

interface FeedbackItem {
  _id: string
  user: {
    _id: string
    name: string
    email: string
  }
  category: 'bug' | 'suggestion' | 'other'
  message: string
  status: 'open' | 'reviewed'
  createdAt: string
}

interface ReportItem {
  _id: string
  targetType: 'story' | 'comment'
  targetId: string
  reason: string
  status: 'pending' | 'resolved' | 'dismissed'
  actionTaken?: 'dismiss' | 'remove_content' | 'warn_user' | null
  createdAt: string
  targetContent?: {
    title?: string
    subtitle?: string
    text?: string
    status?: string
    author?: { name: string; email: string }
    storyTitle?: string
  }
}

interface UserItem {
  _id: string
  name: string
  firstName?: string
  lastName?: string
  email: string
  role: string
  isAdmin: boolean
  isSuspended: boolean
  followerCount: number
  publishedCount: number
  createdAt: string
}

interface AdminDashboardProps {
  isEmbedded?: boolean
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isEmbedded = false }) => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'Contact' | 'Feedback' | 'Reports' | 'Users'>('Contact')

  // Contact Messages State
  const [contactList, setContactList] = useState<ContactMessageItem[]>([])
  const [contactStatusFilter, setContactStatusFilter] = useState<'all' | 'unread' | 'read'>('all')

  // Feedback State
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([])
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState<'all' | 'open' | 'reviewed'>('open')

  // Reports State
  const [reportsList, setReportsList] = useState<ReportItem[]>([])
  const [reportStatusFilter, setReportStatusFilter] = useState<'all' | 'pending' | 'resolved' | 'dismissed'>('pending')

  // Users State
  const [usersList, setUsersList] = useState<UserItem[]>([])
  const [userQuery, setUserQuery] = useState<string>('')

  // Scroll to top on tab change
  const handleTabChange = (tab: 'Contact' | 'Feedback' | 'Reports' | 'Users') => {
    setActiveTab(tab)
    if (!isEmbedded) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Fetch Contact Messages
  const fetchContactMessages = useCallback(() => {
    const url =
      contactStatusFilter !== 'all'
        ? `/api/admin/contact-messages?status=${contactStatusFilter}`
        : '/api/admin/contact-messages'
    apiFetch(url)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setContactList(json.data || [])
      })
      .catch(() => toast.error('Failed to load contact messages.'))
  }, [contactStatusFilter])

  // Fetch Feedback
  const fetchFeedback = useCallback(() => {
    const url =
      feedbackStatusFilter !== 'all'
        ? `/api/admin/feedback?status=${feedbackStatusFilter}`
        : '/api/admin/feedback'
    apiFetch(url)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setFeedbackList(json.data || [])
      })
      .catch(() => toast.error('Failed to load feedback list.'))
  }, [feedbackStatusFilter])

  // Fetch Reports
  const fetchReports = useCallback(() => {
    const url =
      reportStatusFilter !== 'all'
        ? `/api/admin/reports?status=${reportStatusFilter}`
        : '/api/admin/reports'
    apiFetch(url)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setReportsList(json.data || [])
      })
      .catch(() => toast.error('Failed to load content reports.'))
  }, [reportStatusFilter])

  // Fetch Users
  const fetchUsers = useCallback(() => {
    const url = userQuery.trim()
      ? `/api/admin/users?query=${encodeURIComponent(userQuery.trim())}`
      : '/api/admin/users'
    apiFetch(url)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setUsersList(json.data || [])
      })
      .catch(() => toast.error('Failed to load users.'))
  }, [userQuery])

  useEffect(() => {
    fetchContactMessages()
    fetchFeedback()
    fetchReports()
    fetchUsers()
  }, [fetchContactMessages, fetchFeedback, fetchReports, fetchUsers])

  // Mark Contact Message Read
  const handleMarkContactRead = async (id: string) => {
    try {
      const res = await apiFetch(`/api/admin/contact-messages/${id}/read`, {
        method: 'PATCH',
      })
      const json = await res.json()
      if (res.ok && json.success) {
        toast.success('Contact message marked as read.')
        fetchContactMessages()
      } else {
        toast.error(json.message || 'Failed to update message status.')
      }
    } catch {
      toast.error('Error updating contact message status.')
    }
  }

  // Mark Feedback Reviewed
  const handleMarkFeedbackReviewed = async (id: string) => {
    try {
      const res = await apiFetch(`/api/admin/feedback/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'reviewed' }),
      })
      const json = await res.json()
      if (res.ok && json.success) {
        toast.success('Feedback marked as reviewed.')
        fetchFeedback()
      } else {
        toast.error(json.message || 'Failed to update feedback.')
      }
    } catch {
      toast.error('Error updating feedback status.')
    }
  }

  // Resolve Report
  const handleResolveReport = async (
    id: string,
    actionTaken: 'dismiss' | 'remove_content' | 'warn_user',
  ) => {
    try {
      const res = await apiFetch(`/api/admin/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionTaken }),
      })
      const json = await res.json()
      if (res.ok && json.success) {
        toast.success(`Report resolved (${actionTaken}).`)
        fetchReports()
      } else {
        toast.error(json.message || 'Failed to resolve report.')
      }
    } catch {
      toast.error('Error resolving report.')
    }
  }

  // Toggle User Suspension
  const handleToggleSuspension = async (userId: string, currentSuspendedState: boolean) => {
    try {
      const res = await apiFetch(`/api/admin/users/${userId}/suspend`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSuspended: !currentSuspendedState }),
      })
      const json = await res.json()
      if (res.ok && json.success) {
        toast.success(`User ${!currentSuspendedState ? 'suspended' : 'unsuspended'}!`)
        fetchUsers()
      } else {
        toast.error(json.message || 'Failed to update suspension status.')
      }
    } catch {
      toast.error('Error updating user suspension.')
    }
  }

  return (
    <div className={isEmbedded ? 'flex flex-col gap-6 animate-fadeIn' : 'min-h-screen bg-bg text-text font-sans pb-20'}>
      {/* Admin Header (Only when standalone) */}
      {!isEmbedded && (
        <header className="border-b border-border/60 bg-surface/80 backdrop-blur sticky top-0 z-40 py-4 px-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-serif font-bold text-lg leading-none">
                  Admin Moderation Console
                </h1>
                <span className="text-[10px] text-text-muted font-sans uppercase tracking-wider">
                  CollaboWrite_2.0 Control Panel
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
              </Button>
            </div>
          </div>
        </header>
      )}

      <main className={isEmbedded ? 'flex flex-col gap-6' : 'max-w-6xl mx-auto px-6 pt-8 flex flex-col gap-6'}>
        {/* Navigation Sub-Tabs */}
        <div className="flex border-b border-border/60 gap-4 md:gap-8 overflow-x-auto pb-1">
          <button
            onClick={() => handleTabChange('Contact')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 border-b-2 cursor-pointer shrink-0 ${
              activeTab === 'Contact'
                ? 'border-accent text-accent'
                : 'border-transparent text-text-muted hover:text-text'
            }`}
          >
            <Mail className="w-4 h-4" /> Contact Messages
          </button>

          <button
            onClick={() => handleTabChange('Feedback')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 border-b-2 cursor-pointer shrink-0 ${
              activeTab === 'Feedback'
                ? 'border-accent text-accent'
                : 'border-transparent text-text-muted hover:text-text'
            }`}
          >
            <MessageSquare className="w-4 h-4" /> Feedback Submissions
          </button>

          <button
            onClick={() => handleTabChange('Reports')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 border-b-2 cursor-pointer shrink-0 ${
              activeTab === 'Reports'
                ? 'border-accent text-accent'
                : 'border-transparent text-text-muted hover:text-text'
            }`}
          >
            <Flag className="w-4 h-4" /> Content Reports
          </button>

          <button
            onClick={() => handleTabChange('Users')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 border-b-2 cursor-pointer shrink-0 ${
              activeTab === 'Users'
                ? 'border-accent text-accent'
                : 'border-transparent text-text-muted hover:text-text'
            }`}
          >
            <Users className="w-4 h-4" /> User Accounts
          </button>
        </div>

        {/* CONTACT MESSAGES TAB */}
        {activeTab === 'Contact' && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-serif font-bold">Public Contact Form Messages</h2>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-text-muted">Filter:</span>
                <select
                  value={contactStatusFilter}
                  onChange={(e) => setContactStatusFilter(e.target.value as 'all' | 'unread' | 'read')}
                  className="bg-surface border border-border rounded-lg px-3 py-1 text-xs outline-none"
                >
                  <option value="all">All Messages</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                </select>
              </div>
            </div>

            <Card className="p-6 border border-border">
              {contactList.length === 0 ? (
                <div className="py-12 text-center text-text-muted text-xs">
                  No contact messages match the current filter.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border/60 text-text-muted uppercase text-[10px] tracking-wider font-bold">
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Sender</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Message</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {contactList.map((msg) => (
                        <tr key={msg._id} className="hover:bg-surface/50">
                          <td className="py-3.5 px-4 text-text-muted whitespace-nowrap">
                            {new Date(msg.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-text whitespace-nowrap">
                            {msg.name}
                          </td>
                          <td className="py-3.5 px-4 text-text-muted whitespace-nowrap">
                            <a href={`mailto:${msg.email}`} className="text-accent hover:underline">
                              {msg.email}
                            </a>
                          </td>
                          <td className="py-3.5 px-4 max-w-sm text-text leading-relaxed">
                            {msg.message}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                msg.status === 'read'
                                  ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                                  : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                              }`}
                            >
                              {msg.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            {msg.status === 'unread' && (
                              <Button
                                onClick={() => handleMarkContactRead(msg._id)}
                                variant="outline"
                                className="text-[10px] px-2.5 py-1 cursor-pointer flex items-center gap-1 ml-auto"
                              >
                                <CheckCircle className="w-3 h-3 text-green-500" /> Mark as Read
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* FEEDBACK TAB */}
        {activeTab === 'Feedback' && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-serif font-bold">Reader Feedback & Bug Reports</h2>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-text-muted">Filter:</span>
                <select
                  value={feedbackStatusFilter}
                  onChange={(e) => setFeedbackStatusFilter(e.target.value as 'all' | 'open' | 'reviewed')}
                  className="bg-surface border border-border rounded-lg px-3 py-1 text-xs outline-none"
                >
                  <option value="all">All Submissions</option>
                  <option value="open">Open</option>
                  <option value="reviewed">Reviewed</option>
                </select>
              </div>
            </div>

            <Card className="p-6 border border-border">
              {feedbackList.length === 0 ? (
                <div className="py-12 text-center text-text-muted text-xs">
                  No feedback submissions match the current filter.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border/60 text-text-muted uppercase text-[10px] tracking-wider font-bold">
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Message</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {feedbackList.map((fb) => (
                        <tr key={fb._id} className="hover:bg-surface/50">
                          <td className="py-3.5 px-4 text-text-muted whitespace-nowrap">
                            {new Date(fb.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-text">
                            {fb.user?.name || 'Anonymous'}
                            <span className="block text-[10px] text-text-muted font-normal">
                              {fb.user?.email}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge
                              variant={fb.category === 'bug' ? 'warning' : 'primary'}
                              className="text-[9px] uppercase"
                            >
                              {fb.category}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-4 max-w-xs text-text leading-relaxed">
                            {fb.message}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                fb.status === 'reviewed'
                                  ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                                  : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                              }`}
                            >
                              {fb.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {fb.status === 'open' && (
                              <Button
                                onClick={() => handleMarkFeedbackReviewed(fb._id)}
                                variant="outline"
                                className="text-[10px] px-2.5 py-1 cursor-pointer"
                              >
                                Mark Reviewed
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* REPORTS TAB */}
        {activeTab === 'Reports' && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-serif font-bold">Content Moderation & Flagged Reports</h2>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-text-muted">Filter:</span>
                <select
                  value={reportStatusFilter}
                  onChange={(e) => setReportStatusFilter(e.target.value as 'all' | 'pending' | 'resolved' | 'dismissed')}
                  className="bg-surface border border-border rounded-lg px-3 py-1 text-xs outline-none"
                >
                  <option value="all">All Reports</option>
                  <option value="pending">Pending</option>
                  <option value="resolved">Resolved</option>
                  <option value="dismissed">Dismissed</option>
                </select>
              </div>
            </div>

            <Card className="p-6 border border-border">
              {reportsList.length === 0 ? (
                <div className="py-12 text-center text-text-muted text-xs">
                  No content reports match the current filter.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border/60 text-text-muted uppercase text-[10px] tracking-wider font-bold">
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Content Preview</th>
                        <th className="py-3 px-4">Reason</th>
                        <th className="py-3 px-4">Status / Action</th>
                        <th className="py-3 px-4 text-right">Resolve Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {reportsList.map((rp) => (
                        <tr key={rp._id} className="hover:bg-surface/50">
                          <td className="py-3.5 px-4 font-bold uppercase text-[10px] text-text-muted">
                            <Badge variant="outline" className="text-[9px]">
                              {rp.targetType}
                            </Badge>
                          </td>

                          {/* Inline Content Preview */}
                          <td className="py-3.5 px-4 max-w-sm">
                            {rp.targetContent ? (
                              <div className="p-2.5 bg-surface rounded-lg border border-border/40 flex flex-col gap-1">
                                <span className="font-bold text-text font-serif">
                                  {rp.targetType === 'story'
                                    ? rp.targetContent.title
                                    : rp.targetContent.storyTitle || 'Comment Flag'}
                                </span>
                                <p className="text-[11px] text-text-muted line-clamp-2">
                                  {rp.targetType === 'story'
                                    ? rp.targetContent.subtitle || 'Story manuscript flagged'
                                    : rp.targetContent.text}
                                </p>
                                {rp.targetContent.author && (
                                  <span className="text-[10px] text-accent">
                                    Author: {rp.targetContent.author.name} (
                                    {rp.targetContent.author.email})
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-text-muted italic">[Content Deleted]</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-text font-medium">{rp.reason}</td>

                          <td className="py-3.5 px-4">
                            <div className="flex flex-col gap-1">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase w-fit ${
                                  rp.status === 'resolved'
                                    ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                                    : rp.status === 'dismissed'
                                      ? 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                                      : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                }`}
                              >
                                {rp.status}
                              </span>
                              {rp.actionTaken && (
                                <span className="text-[10px] text-text-muted uppercase">
                                  Action: {rp.actionTaken}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            {rp.status === 'pending' ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  onClick={() => handleResolveReport(rp._id, 'dismiss')}
                                  variant="outline"
                                  className="text-[10px] px-2 py-1 cursor-pointer"
                                >
                                  Dismiss
                                </Button>

                                <Button
                                  onClick={() => handleResolveReport(rp._id, 'warn_user')}
                                  variant="outline"
                                  className="text-[10px] px-2 py-1 cursor-pointer text-amber-500 hover:border-amber-500"
                                >
                                  Warn User
                                </Button>

                                <Button
                                  onClick={() => handleResolveReport(rp._id, 'remove_content')}
                                  variant="primary"
                                  className="text-[10px] px-2 py-1 bg-red-600 hover:bg-red-700 cursor-pointer flex items-center gap-1"
                                >
                                  <Trash2 className="w-3 h-3" /> Remove Content
                                </Button>
                              </div>
                            ) : (
                              <span className="text-text-muted text-[11px]">Completed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'Users' && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-lg font-serif font-bold">User Account Moderation</h2>
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search name or email..."
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-surface border border-border rounded-xl text-xs outline-none focus:border-accent"
                />
              </div>
            </div>

            <Card className="p-6 border border-border">
              {usersList.length === 0 ? (
                <div className="py-12 text-center text-text-muted text-xs">
                  No user accounts found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border/60 text-text-muted uppercase text-[10px] tracking-wider font-bold">
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4 text-right">Published</th>
                        <th className="py-3 px-4 text-right">Followers</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {usersList.map((usr) => (
                        <tr key={usr._id} className="hover:bg-surface/50">
                          <td className="py-3.5 px-4 font-bold text-text">
                            {usr.name}{' '}
                            {usr.isAdmin && (
                              <Badge variant="primary" className="text-[9px] ml-1">
                                ADMIN
                              </Badge>
                            )}
                            <span className="block text-[10px] text-text-muted font-normal">
                              {usr.email}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 uppercase text-[10px] text-text-muted">
                            {usr.role}
                          </td>

                          <td className="py-3.5 px-4 text-right font-bold">{usr.publishedCount}</td>

                          <td className="py-3.5 px-4 text-right font-bold">{usr.followerCount}</td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                usr.isSuspended
                                  ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                                  : 'bg-green-500/10 text-green-500 border border-green-500/20'
                              }`}
                            >
                              {usr.isSuspended ? 'Suspended' : 'Active'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            {!usr.isAdmin && (
                              <Button
                                onClick={() => handleToggleSuspension(usr._id, usr.isSuspended)}
                                variant="outline"
                                className={`text-[10px] px-2.5 py-1 cursor-pointer ${
                                  usr.isSuspended
                                    ? 'text-green-500 border-green-500/40 hover:bg-green-500/10'
                                    : 'text-red-500 border-red-500/40 hover:bg-red-500/10'
                                }`}
                              >
                                {usr.isSuspended ? 'Unsuspend' : 'Suspend'}
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
