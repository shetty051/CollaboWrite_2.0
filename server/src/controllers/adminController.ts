import { Response } from 'express'
import { Feedback } from '../models/feedbackModel'
import { Report } from '../models/reportModel'
import { Story } from '../models/storyModel'
import { Comment } from '../models/commentModel'
import { User } from '../models/userModel'
import { AuthenticatedRequest } from '../middleware/authMiddleware'

// GET /api/admin/feedback (Admin only)
export const getFeedback = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status, category } = req.query
    const filter: Record<string, any> = {}

    if (status && ['open', 'reviewed'].includes(status as string)) {
      filter.status = status
    }
    if (category && ['bug', 'suggestion', 'other'].includes(category as string)) {
      filter.category = category
    }

    const feedbackList = await Feedback.find(filter)
      .populate('user', 'name firstName lastName email avatarUrl role')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      data: feedbackList,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error fetching feedback' })
  }
}

// PATCH /api/admin/feedback/:id (Admin only)
export const updateFeedbackStatus = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { status } = req.body
    if (!status || !['open', 'reviewed'].includes(status)) {
      res.status(400).json({ success: false, message: 'Status must be open or reviewed.' })
      return
    }

    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'name email')

    if (!feedback) {
      res.status(404).json({ success: false, message: 'Feedback entry not found.' })
      return
    }

    res.status(200).json({
      success: true,
      message: 'Feedback status updated.',
      data: feedback,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error updating feedback' })
  }
}

// GET /api/admin/reports (Admin only - inline target content preview)
export const getReports = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query
    const filter: Record<string, any> = {}

    if (status && ['pending', 'resolved', 'dismissed'].includes(status as string)) {
      filter.status = status
    }

    const reports = await Report.find(filter).sort({ createdAt: -1 })

    // Dynamically resolve target content inline for each report
    const reportsWithInlineContent = await Promise.all(
      reports.map(async (report) => {
        let targetContent: any = null

        if (report.targetType === 'story') {
          const story = await Story.findById(report.targetId)
            .select('title subtitle coverImageUrl status author')
            .populate('author', 'name email')
          targetContent = story ? { title: story.title, subtitle: story.subtitle, status: story.status, author: story.author } : null
        } else if (report.targetType === 'comment') {
          const comment = await Comment.findById(report.targetId)
            .populate('author', 'name email')
            .populate('story', 'title')
          targetContent = comment ? { text: comment.text, author: comment.author, storyTitle: (comment.story as any)?.title } : null
        }

        return {
          _id: report._id,
          targetType: report.targetType,
          targetId: report.targetId,
          reason: report.reason,
          status: report.status,
          actionTaken: report.actionTaken,
          createdAt: report.createdAt,
          targetContent,
        }
      })
    )

    res.status(200).json({
      success: true,
      data: reportsWithInlineContent,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error fetching reports' })
  }
}

// PATCH /api/admin/reports/:id (Admin only - resolve with action taken)
export const resolveReport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { actionTaken, status } = req.body

    if (!actionTaken || !['dismiss', 'remove_content', 'warn_user'].includes(actionTaken)) {
      res.status(400).json({ success: false, message: 'Valid action (dismiss, remove_content, warn_user) is required.' })
      return
    }

    const report = await Report.findById(req.params.id)
    if (!report) {
      res.status(404).json({ success: false, message: 'Report not found.' })
      return
    }

    // Execute moderation action
    if (actionTaken === 'remove_content') {
      if (report.targetType === 'story') {
        // Force unpublish / delete story
        await Story.findByIdAndUpdate(report.targetId, { status: 'draft' })
      } else if (report.targetType === 'comment') {
        // Delete comment
        await Comment.findByIdAndDelete(report.targetId)
      }
    }

    report.status = status || (actionTaken === 'dismiss' ? 'dismissed' : 'resolved')
    report.actionTaken = actionTaken
    await report.save()

    res.status(200).json({
      success: true,
      message: `Report resolved with action: ${actionTaken}.`,
      data: report,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error resolving report' })
  }
}

// POST /api/admin/stories/:id/remove (Admin only - force unpublish story)
export const removeStory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const story = await Story.findByIdAndUpdate(
      req.params.id,
      { status: 'draft' },
      { new: true }
    )

    if (!story) {
      res.status(404).json({ success: false, message: 'Story not found.' })
      return
    }

    res.status(200).json({
      success: true,
      message: 'Story force-unpublished by administrator override.',
      data: story,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error removing story' })
  }
}

// GET /api/admin/users (Admin only - searchable list)
export const getUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { query } = req.query
    const filter: Record<string, any> = {}

    if (query && typeof query === 'string' && query.trim()) {
      const regex = new RegExp(query.trim(), 'i')
      filter.$or = [{ firstName: regex }, { lastName: regex }, { email: regex }]
    }

    const users = await User.find(filter).select('-passwordHash').sort({ createdAt: -1 })

    // Populate user published story counts
    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const publishedCount = await Story.countDocuments({ author: u._id, status: 'published' })
        return {
          _id: u._id,
          name: u.name,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          role: u.role,
          isAdmin: u.isAdmin || false,
          isSuspended: u.isSuspended || false,
          followerCount: u.followers?.length || 0,
          publishedCount,
          createdAt: u.createdAt,
        }
      })
    )

    res.status(200).json({
      success: true,
      data: usersWithStats,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error fetching user list' })
  }
}

// PATCH /api/admin/users/:id/suspend (Admin only - toggle suspension)
export const toggleUserSuspension = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { isSuspended } = req.body
    if (typeof isSuspended !== 'boolean') {
      res.status(400).json({ success: false, message: 'isSuspended boolean is required.' })
      return
    }

    const targetUser = await User.findById(req.params.id)
    if (!targetUser) {
      res.status(404).json({ success: false, message: 'User not found.' })
      return
    }

    // Prevent suspending another admin
    if (targetUser.isAdmin) {
      res.status(400).json({ success: false, message: 'Admin accounts cannot be suspended.' })
      return
    }

    targetUser.isSuspended = isSuspended
    await targetUser.save()

    res.status(200).json({
      success: true,
      message: `User account ${isSuspended ? 'suspended' : 'unsuspended'} successfully.`,
      data: { _id: targetUser._id, isSuspended: targetUser.isSuspended },
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error updating user suspension' })
  }
}
