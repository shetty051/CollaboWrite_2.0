import { Request, Response } from 'express'
import { Story } from '../models/storyModel'
import { User } from '../models/userModel'
import { Rating } from '../models/ratingModel'
import { Feedback } from '../models/feedbackModel'
import { AuthenticatedRequest } from '../middleware/authMiddleware'

// GET /api/home/spotlight (Public)
export const getSpotlight = async (req: Request, res: Response): Promise<void> => {
  try {
    const trendingStories = await Story.find({ status: 'published' })
      .populate('author', 'name firstName lastName email avatarUrl bio role')
      .populate('coAuthors', 'name firstName lastName email avatarUrl role')
      .sort({ viewCount: -1, averageRating: -1 })
      .limit(6)

    const writers = await User.find({ role: 'writer' })
      .select('name firstName lastName avatarUrl bio role followers')
      .limit(20)

    const mostFollowedWriters = writers
      .map((w) => ({
        _id: w._id,
        name: w.name,
        firstName: w.firstName,
        lastName: w.lastName,
        avatarUrl: w.avatarUrl,
        bio: w.bio,
        role: w.role,
        followerCount: w.followers?.length || 0,
      }))
      .sort((a, b) => b.followerCount - a.followerCount)
      .slice(0, 4)

    res.status(200).json({
      success: true,
      data: {
        trendingStories,
        mostFollowedWriters,
      },
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error fetching spotlight data' })
  }
}

// GET /api/home/recommendations (Protected)
export const getRecommendations = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authorization required.' })
      return
    }

    const user = await User.findById(userId).populate('bookmarks')
    const highRatings = await Rating.find({ user: userId, score: { $gte: 4 } }).populate('story')

    const genreCounts: Record<string, number> = {}

    // Process rated stories
    highRatings.forEach((r: any) => {
      if (r.story && Array.isArray(r.story.genres)) {
        r.story.genres.forEach((g: string) => {
          genreCounts[g] = (genreCounts[g] || 0) + 2
        })
      }
    })

    // Process bookmarked stories
    if (user && Array.isArray(user.bookmarks)) {
      user.bookmarks.forEach((b: any) => {
        if (b && Array.isArray(b.genres)) {
          b.genres.forEach((g: string) => {
            genreCounts[g] = (genreCounts[g] || 0) + 1
          })
        }
      })
    }

    // Determine top 2-3 genres
    let topGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .map((entry) => entry[0])
      .slice(0, 3)

    if (topGenres.length === 0) {
      topGenres = ['Fiction', 'Sci-Fi', 'Memoir']
    }

    // Bookmarked IDs to exclude
    const bookmarkedIds = user && Array.isArray(user.bookmarks) ? user.bookmarks.map((b: any) => b._id) : []

    const recommendedStories = await Story.find({
      status: 'published',
      genres: { $in: topGenres },
      author: { $ne: userId },
      _id: { $nin: bookmarkedIds },
    })
      .populate('author', 'name firstName lastName email avatarUrl role')
      .populate('coAuthors', 'name firstName lastName email avatarUrl role')
      .sort({ averageRating: -1, viewCount: -1 })
      .limit(6)

    res.status(200).json({
      success: true,
      topGenres,
      data: recommendedStories,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error fetching recommendations' })
  }
}

// POST /api/feedback (Protected)
export const submitFeedback = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { message, category } = req.body
    const userId = req.user?._id

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authorization required.' })
      return
    }

    if (!message || !message.trim()) {
      res.status(400).json({ success: false, message: 'Feedback message cannot be empty.' })
      return
    }

    if (!category || !['bug', 'suggestion', 'other'].includes(category)) {
      res.status(400).json({ success: false, message: 'Valid category (bug, suggestion, other) is required.' })
      return
    }

    const feedback = await Feedback.create({
      user: userId,
      message: message.trim(),
      category,
      status: 'open',
    })

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback! We review submissions regularly.',
      data: feedback,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error submitting feedback' })
  }
}
