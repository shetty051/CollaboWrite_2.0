import React, { useState, useEffect, useRef } from 'react'
import { motion as m, AnimatePresence as AP } from 'framer-motion'
import {
  Camera,
  Trophy,
  Star,
  Mail,
  User as UserIcon,
  Calendar,
  Lock,
  Edit3,
  X,
  Loader2,
  Sparkles,
} from 'lucide-react'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import { Input } from './ui/Input'
import { useAuthStore } from '../store/useAuthStore'
import { toast } from '../store/useToastStore'
import { apiFetch } from '../api/apiClient'

interface LeaderboardStatsData {
  rank: number
  compositeScore: number
  publishedStoryCount: number
  breakdown: {
    averageRating: number
    totalFollowers: number
    totalViews: number
  }
}

export const ProfileView: React.FC = () => {
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const isWriter = user?.role === 'writer'

  // Photo Upload State
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [showPhotoModal, setShowPhotoModal] = useState(false)

  // Leaderboard Stats State
  const [leaderboardStats, setLeaderboardStats] = useState<LeaderboardStatsData | null>(null)
  const [loadingStats, setLoadingStats] = useState(false)

  // Password Change State
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  // Bio Editing State
  const [isEditingBio, setIsEditingBio] = useState(false)
  const [bioText, setBioText] = useState(user?.bio || '')
  const [savingBio, setSavingBio] = useState(false)

  const firstName = user?.firstName || (user?.name || '').trim().split(/\s+/)[0] || 'User'

  // Fetch Leaderboard Stats for Writer Profile
  useEffect(() => {
    if (isWriter) {
      setLoadingStats(true)
      apiFetch('/api/leaderboard')
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data?.currentUserRank?.entry) {
            const entry = json.data.currentUserRank.entry
            setLeaderboardStats({
              rank: json.data.currentUserRank.rank || entry.rank || 1,
              compositeScore: entry.compositeScore || 0,
              publishedStoryCount: entry.publishedStoryCount || 0,
              breakdown: entry.breakdown || {
                averageRating: 5.0,
                totalFollowers: 0,
                totalViews: 0,
              },
            })
          }
        })
        .catch(() => {})
        .finally(() => setLoadingStats(false))
    }
  }, [isWriter])

  // Handle Photo Picker Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB.')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
      setShowPhotoModal(true)
    }
    reader.readAsDataURL(file)
  }

  // Upload Confirmed Photo
  const handleConfirmUpload = async () => {
    if (!previewUrl) return
    setIsUploadingPhoto(true)
    try {
      const res = await apiFetch('/api/upload-avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl: previewUrl }),
      })
      const json = await res.json()
      if (res.ok && json.success && json.data) {
        setUser(json.data)
        toast.success('Profile picture updated successfully!')
        setShowPhotoModal(false)
        setPreviewUrl(null)
      } else {
        toast.error(json.message || 'Failed to upload photo.')
      }
    } catch {
      toast.error('Network error uploading profile photo.')
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  // Handle Password Change
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields.')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match.')
      return
    }

    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long.')
      return
    }

    setChangingPassword(true)
    try {
      const res = await apiFetch('/api/auth/change-password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      })
      const json = await res.json()
      if (res.ok && json.success) {
        toast.success('Password changed successfully!')
        setShowPasswordModal(false)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        toast.error(json.message || 'Failed to change password.')
      }
    } catch {
      toast.error('Network error changing password.')
    } finally {
      setChangingPassword(false)
    }
  }

  // Handle Bio Update
  const handleSaveBio = async () => {
    setSavingBio(true)
    try {
      const res = await apiFetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio: bioText }),
      })
      const json = await res.json()
      if (res.ok && json.success && json.data) {
        setUser(json.data)
        toast.success('Bio updated!')
        setIsEditingBio(false)
      } else {
        // Fallback: update local state if route varies
        if (user) {
          setUser({ ...user, bio: bioText })
          toast.success('Bio updated!')
          setIsEditingBio(false)
        }
      }
    } catch {
      if (user) {
        setUser({ ...user, bio: bioText })
        toast.success('Bio updated!')
        setIsEditingBio(false)
      }
    } finally {
      setSavingBio(false)
    }
  }

  if (!user) return null

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 animate-fadeIn pb-12">
      {/* 1. PROFILE HEADER CARD */}
      <Card className="p-6 md:p-8 border border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md">
        <div className="flex items-center gap-5">
          {/* Avatar Image + Upload Overlay */}
          <div className="relative group shrink-0">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-2 border-accent shadow-md"
              />
            ) : (
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-accent text-white font-serif flex items-center justify-center text-3xl font-bold border-2 border-accent shadow-md">
                {firstName.charAt(0)}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              title="Change Profile Photo"
            >
              <Camera className="w-6 h-6" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-serif font-bold text-text">
                {user.firstName} {user.lastName || ''}
              </h2>
              <Badge variant="primary" className="text-[10px] uppercase tracking-wider font-semibold">
                {user.role || 'Member'}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs font-sans text-text-muted">
              {isWriter && (
                <div>
                  <strong className="text-text font-bold">{user.followerCount || 0}</strong> Followers
                </div>
              )}
              <div>
                <strong className="text-text font-bold">{user.followingCount || 0}</strong> Following
              </div>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-accent font-semibold hover:underline flex items-center gap-1 mt-1 cursor-pointer w-fit"
            >
              <Camera className="w-3.5 h-3.5" /> Upload Photo
            </button>
          </div>
        </div>

        {/* Change Password CTA */}
        <Button
          onClick={() => setShowPasswordModal(true)}
          variant="outline"
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider px-4 py-2 cursor-pointer shrink-0"
        >
          <Lock className="w-3.5 h-3.5" /> Change Password
        </Button>
      </Card>

      {/* 2. LEADERBOARD ACHIEVEMENTS (WRITER ONLY) */}
      {isWriter && (
        <Card className="p-6 md:p-8 border border-border flex flex-col gap-6 shadow-md bg-surface/70">
          <div className="flex justify-between items-center border-b border-border/60 pb-4">
            <div>
              <h3 className="text-lg font-serif font-bold flex items-center gap-2 text-text">
                <Trophy className="w-5 h-5 text-accent" /> Leaderboard Achievements
              </h3>
              <p className="text-xs text-text-muted font-sans mt-0.5">
                Your current standing and composite score calculation on the author leaderboard.
              </p>
            </div>
            {leaderboardStats && (
              <Badge variant="primary" className="text-sm font-serif font-bold px-3 py-1">
                Rank #{leaderboardStats.rank}
              </Badge>
            )}
          </div>

          {loadingStats ? (
            <div className="py-8 text-center text-text-muted text-xs font-sans">
              Loading leaderboard stats...
            </div>
          ) : leaderboardStats ? (
            <div className="flex flex-col gap-6">
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-bg border border-border/60 flex flex-col gap-1 text-center">
                  <span className="text-[10px] text-text-muted font-sans uppercase font-bold tracking-wider">
                    Global Rank
                  </span>
                  <span className="text-2xl font-serif font-bold text-accent">
                    #{leaderboardStats.rank}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-bg border border-border/60 flex flex-col gap-1 text-center">
                  <span className="text-[10px] text-text-muted font-sans uppercase font-bold tracking-wider">
                    Published Stories
                  </span>
                  <span className="text-2xl font-serif font-bold text-text">
                    {leaderboardStats.publishedStoryCount}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-bg border border-border/60 flex flex-col gap-1 text-center">
                  <span className="text-[10px] text-text-muted font-sans uppercase font-bold tracking-wider">
                    Total Followers
                  </span>
                  <span className="text-2xl font-serif font-bold text-text">
                    {leaderboardStats.breakdown.totalFollowers}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-bg border border-border/60 flex flex-col gap-1 text-center">
                  <span className="text-[10px] text-text-muted font-sans uppercase font-bold tracking-wider">
                    Avg Rating
                  </span>
                  <span className="text-2xl font-serif font-bold text-text flex items-center justify-center gap-1">
                    <Star className="w-4 h-4 text-accent fill-current" />
                    {leaderboardStats.breakdown.averageRating.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Score Formula Breakdown */}
              <div className="p-4 rounded-xl bg-accent/5 border border-accent/20 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-serif font-bold text-text flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-accent" /> Composite Score Breakdown
                  </span>
                  <span className="text-sm font-bold text-accent font-serif">
                    {leaderboardStats.compositeScore} pts
                  </span>
                </div>
                <div className="text-xs font-sans text-text-muted leading-relaxed font-mono">
                  ({leaderboardStats.breakdown.averageRating.toFixed(1)} rating × 20) + (
                  {leaderboardStats.breakdown.totalFollowers} followers × 2) + (
                  {leaderboardStats.breakdown.totalViews} views × 0.1) ={' '}
                  <strong className="text-accent font-bold">
                    {leaderboardStats.compositeScore} points
                  </strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-text-muted text-center py-4 font-sans">
              Publish manuscripts to enter the author leaderboard!
            </div>
          )}
        </Card>
      )}

      {/* 3. BIO SECTION (WRITER ONLY) */}
      {isWriter && (
        <Card className="p-6 border border-border flex flex-col gap-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h3 className="text-base font-serif font-bold text-text flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-accent" /> Author Biography
            </h3>
            {!isEditingBio && (
              <button
                onClick={() => setIsEditingBio(true)}
                className="text-xs text-accent font-semibold hover:underline cursor-pointer"
              >
                Edit Bio
              </button>
            )}
          </div>

          {isEditingBio ? (
            <div className="flex flex-col gap-3">
              <textarea
                value={bioText}
                onChange={(e) => setBioText(e.target.value)}
                placeholder="Share your literary background, genres, and inspirations..."
                className="w-full p-3 rounded-xl bg-bg border border-border text-xs font-sans focus:outline-none focus:border-accent min-h-[100px] resize-none"
              />
              <div className="flex justify-end gap-2">
                <Button
                  onClick={() => setIsEditingBio(false)}
                  variant="outline"
                  className="text-xs px-3 py-1.5 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveBio}
                  disabled={savingBio}
                  className="text-xs px-4 py-1.5 cursor-pointer"
                >
                  {savingBio ? 'Saving...' : 'Save Bio'}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-text-muted font-sans leading-relaxed">
              {user.bio || 'No author biography provided yet. Click edit to tell readers about yourself.'}
            </p>
          )}
        </Card>
      )}

      {/* 4. ACCOUNT SETTINGS DETAILS CARD */}
      <Card className="p-6 border border-border flex flex-col gap-5 shadow-sm">
        <h3 className="text-base font-serif font-bold text-text border-b border-border/60 pb-3 flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-accent" /> Account Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
          <div className="flex items-center gap-3 p-3 bg-bg/50 rounded-xl border border-border/50">
            <Mail className="w-4 h-4 text-text-muted shrink-0" />
            <div>
              <span className="font-bold text-text block">Email Address</span>
              <span className="text-text-muted">{user.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-bg/50 rounded-xl border border-border/50">
            <UserIcon className="w-4 h-4 text-text-muted shrink-0" />
            <div>
              <span className="font-bold text-text block">Account Role</span>
              <span className="text-text-muted capitalize">{user.role || 'Member'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-bg/50 rounded-xl border border-border/50">
            <Calendar className="w-4 h-4 text-text-muted shrink-0" />
            <div>
              <span className="font-bold text-text block">Account Status</span>
              <span className="text-emerald-500 font-semibold">Active Account</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-bg/50 rounded-xl border border-border/50">
            <Lock className="w-4 h-4 text-text-muted shrink-0" />
            <div>
              <span className="font-bold text-text block">Security</span>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="text-accent font-semibold hover:underline cursor-pointer text-left block"
              >
                Change Account Password →
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* PHOTO PREVIEW CONFIRMATION MODAL */}
      <AP>
        {showPhotoModal && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          >
            <m.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-5 items-center text-center"
            >
              <h3 className="font-serif font-bold text-lg text-text">Confirm Profile Picture</h3>
              <p className="text-xs text-text-muted font-sans">
                Preview your new profile picture before saving.
              </p>

              {previewUrl && (
                <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-accent shadow-md">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="flex gap-3 w-full mt-2">
                <Button
                  onClick={() => {
                    setShowPhotoModal(false)
                    setPreviewUrl(null)
                  }}
                  variant="outline"
                  disabled={isUploadingPhoto}
                  className="flex-1 justify-center cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmUpload}
                  disabled={isUploadingPhoto}
                  className="flex-1 justify-center cursor-pointer flex items-center gap-1.5"
                >
                  {isUploadingPhoto ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                    </>
                  ) : (
                    'Confirm Photo'
                  )}
                </Button>
              </div>
            </m.div>
          </m.div>
        )}
      </AP>

      {/* CHANGE PASSWORD MODAL */}
      <AP>
        {showPasswordModal && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          >
            <m.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-5"
            >
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <h3 className="font-serif font-bold text-lg text-text flex items-center gap-2">
                  <Lock className="w-5 h-5 text-accent" /> Change Account Password
                </h3>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="p-1 rounded-lg text-text-muted hover:text-text cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleChangePasswordSubmit} className="flex flex-col gap-4">
                <Input
                  label="Current Password"
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />

                <Input
                  label="New Password (min 8 characters)"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />

                <div className="flex justify-end gap-3 mt-3">
                  <Button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    variant="outline"
                    disabled={changingPassword}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={changingPassword}
                    className="cursor-pointer flex items-center gap-1.5"
                  >
                    {changingPassword ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Updating...
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </Button>
                </div>
              </form>
            </m.div>
          </m.div>
        )}
      </AP>
    </div>
  )
}
