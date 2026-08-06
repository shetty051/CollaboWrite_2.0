import { Response } from 'express'
import { Rating } from '../models/ratingModel'
import { Comment } from '../models/commentModel'
import { Report } from '../models/reportModel'
import { Story } from '../models/storyModel'
import { User } from '../models/userModel'
import { AuthenticatedRequest } from '../middleware/authMiddleware'
import { createAndEmitNotification } from '../utils/socket'

// POST /api/stories/:id/rate (Protected)
export const rateStory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { score } = req.body
    const userId = req.user?._id
    const storyId = req.params.id

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authorization required.' })
      return
    }

    if (!score || score < 1 || score > 5) {
      res.status(400).json({ success: false, message: 'Rating score must be between 1 and 5.' })
      return
    }

    // Upsert rating document
    await Rating.findOneAndUpdate(
      { story: storyId, user: userId },
      { score },
      { upsert: true, new: true }
    )

    // Recalculate average rating & count
    const ratings = await Rating.find({ story: storyId })
    const totalScore = ratings.reduce((sum, r) => sum + r.score, 0)
    const ratingCount = ratings.length
    const averageRating = ratingCount > 0 ? totalScore / ratingCount : 0

    const story = await Story.findByIdAndUpdate(
      storyId,
      { averageRating, ratingCount },
      { new: true }
    )

    if (story) {
      const actorName = req.user?.firstName || req.user?.name || 'Someone'
      await createAndEmitNotification({
        recipient: story.author.toString(),
        type: 'rating',
        fromUser: userId.toString(),
        relatedStory: storyId,
        message: `${actorName} rated your story "${story.title}" ${score} ★`,
      })
    }

    res.status(200).json({
      success: true,
      message: 'Rating saved successfully!',
      data: { averageRating, ratingCount, userScore: score },
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error rating story' })
  }
}

// GET /api/stories/:id/user-rating (Protected)
export const getUserRating = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id
    const storyId = req.params.id

    if (!userId) {
      res.status(200).json({ success: true, userScore: null })
      return
    }

    const rating = await Rating.findOne({ story: storyId, user: userId })
    res.status(200).json({
      success: true,
      userScore: rating ? rating.score : null,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error fetching rating' })
  }
}

// POST /api/stories/:id/comments (Protected)
export const addComment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { text } = req.body
    const userId = req.user?._id
    const storyId = req.params.id

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authorization required.' })
      return
    }

    if (!text || !text.trim()) {
      res.status(400).json({ success: false, message: 'Comment text cannot be empty.' })
      return
    }

    const comment = await Comment.create({
      story: storyId,
      author: userId,
      text: text.trim(),
    })

    const populated = await Comment.findById(comment._id).populate(
      'author',
      'name firstName lastName avatarUrl role'
    )

    const story = await Story.findById(storyId)
    if (story) {
      const actorName = req.user?.firstName || req.user?.name || 'Someone'
      await createAndEmitNotification({
        recipient: story.author.toString(),
        type: 'comment',
        fromUser: userId.toString(),
        relatedStory: storyId,
        message: `${actorName} commented on your story "${story.title}".`,
      })
    }

    res.status(201).json({
      success: true,
      message: 'Comment posted!',
      data: populated,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error posting comment' })
  }
}

// GET /api/stories/:id/comments (Public)
export const getComments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const comments = await Comment.find({ story: req.params.id })
      .populate('author', 'name firstName lastName avatarUrl role')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      data: comments,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error fetching comments' })
  }
}

// DELETE /api/comments/:id (Protected - Comment Author only)
export const deleteComment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authorization required.' })
      return
    }

    const comment = await Comment.findById(req.params.id)
    if (!comment) {
      res.status(404).json({ success: false, message: 'Comment not found.' })
      return
    }

    if (comment.author.toString() !== userId.toString()) {
      res.status(403).json({ success: false, message: 'You can only delete your own comments.' })
      return
    }

    await Comment.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: 'Comment deleted.',
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error deleting comment' })
  }
}

// POST /api/users/:id/follow (Protected)
export const followUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id
    const targetUserId = req.params.id

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authorization required.' })
      return
    }

    if (userId.toString() === targetUserId) {
      res.status(400).json({ success: false, message: 'You cannot follow yourself.' })
      return
    }

    // Add target to user's following list
    await User.findByIdAndUpdate(userId, { $addToSet: { following: targetUserId } })
    // Add user to target's followers list
    await User.findByIdAndUpdate(targetUserId, { $addToSet: { followers: userId } })

    const actorName = req.user?.firstName || req.user?.name || 'Someone'
    await createAndEmitNotification({
      recipient: targetUserId,
      type: 'follow',
      fromUser: userId.toString(),
      message: `${actorName} started following you.`,
    })

    res.status(200).json({
      success: true,
      message: 'User followed successfully.',
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error following user' })
  }
}

// DELETE /api/users/:id/follow (Protected)
export const unfollowUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id
    const targetUserId = req.params.id

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authorization required.' })
      return
    }

    await User.findByIdAndUpdate(userId, { $pull: { following: targetUserId } })
    await User.findByIdAndUpdate(targetUserId, { $pull: { followers: userId } })

    res.status(200).json({
      success: true,
      message: 'User unfollowed successfully.',
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error unfollowing user' })
  }
}

// POST /api/stories/:id/bookmark (Protected)
export const bookmarkStory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id
    const storyId = req.params.id

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authorization required.' })
      return
    }

    await User.findByIdAndUpdate(userId, { $addToSet: { bookmarks: storyId } })

    res.status(200).json({
      success: true,
      message: 'Story added to bookmarks!',
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error bookmarking story' })
  }
}

// DELETE /api/stories/:id/bookmark (Protected)
export const unbookmarkStory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id
    const storyId = req.params.id

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authorization required.' })
      return
    }

    await User.findByIdAndUpdate(userId, { $pull: { bookmarks: storyId } })

    res.status(200).json({
      success: true,
      message: 'Story removed from bookmarks.',
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error unbookmarking story' })
  }
}

// GET /api/users/me/bookmarks (Protected)
export const getMyBookmarks = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authorization required.' })
      return
    }

    const user = await User.findById(userId).populate({
      path: 'bookmarks',
      populate: {
        path: 'author',
        select: 'name firstName lastName avatarUrl role bio',
      },
    })

    res.status(200).json({
      success: true,
      data: user?.bookmarks || [],
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error fetching bookmarks' })
  }
}

// GET /api/users/:id/profile (Public)
export const getUserProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const targetUserId = req.params.id
    const currentUserId = req.user?._id

    const targetUser = await User.findById(targetUserId).select('-passwordHash')
    if (!targetUser) {
      res.status(404).json({ success: false, message: 'User not found.' })
      return
    }

    const publishedStories = await Story.find({
      author: targetUserId,
      status: 'published',
    }).sort({ publishedAt: -1 })

    const isFollowing = currentUserId
      ? targetUser.followers.some((id) => id.toString() === currentUserId.toString())
      : false

    res.status(200).json({
      success: true,
      data: {
        user: {
          _id: targetUser._id,
          firstName: targetUser.firstName,
          lastName: targetUser.lastName,
          name: targetUser.name,
          email: targetUser.email,
          role: targetUser.role,
          avatarUrl: targetUser.avatarUrl,
          bio: targetUser.bio,
          followerCount: targetUser.followers ? targetUser.followers.length : 0,
          followingCount: targetUser.following ? targetUser.following.length : 0,
        },
        publishedStories,
        isFollowing,
      },
    })
  } catch (error: any) {
    if (error.name === 'CastError') {
      res.status(404).json({ success: false, message: 'User not found.' })
      return
    }
    res.status(500).json({ success: false, message: error.message || 'Server error fetching profile' })
  }
}

// POST /api/reports (Protected)
export const createReport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { targetType, targetId, reason } = req.body
    const userId = req.user?._id

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authorization required.' })
      return
    }

    if (!targetType || !targetId || !reason || !reason.trim()) {
      res.status(400).json({ success: false, message: 'Target type, target ID, and reason are required.' })
      return
    }

    const report = await Report.create({
      reporter: userId,
      targetType,
      targetId,
      reason: reason.trim(),
      status: 'pending',
    })

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully. Thank you for helping keep CollaboWrite safe!',
      data: report,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error creating report' })
  }
}
