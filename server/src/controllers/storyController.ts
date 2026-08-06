import { Request, Response } from 'express'
import { Story } from '../models/storyModel'
import '../models/userModel'
import { AuthenticatedRequest } from '../middleware/authMiddleware'

// Helper to generate unique share slug
const generateUniqueSlug = (title: string): string => {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
  const randomSuffix = Math.random().toString(36).substring(2, 7)
  return `${baseSlug || 'story'}-${randomSuffix}`
}

// GET /api/stories
export const getStories = async (req: Request, res: Response): Promise<void> => {
  try {
    const { genre, search, page = '1', limit = '10' } = req.query

    const query: any = { status: 'published' }

    if (genre) {
      query.genres = genre as string
    }

    if (search) {
      query.title = { $regex: search as string, $options: 'i' }
    }

    const pageNumber = parseInt(page as string, 10)
    const limitNumber = parseInt(limit as string, 10)
    const skip = (pageNumber - 1) * limitNumber

    const stories = await Story.find(query)
      .populate('author', 'name firstName lastName email avatarUrl bio role')
      .populate('coAuthors', 'name firstName lastName email avatarUrl role')
      .skip(skip)
      .limit(limitNumber)
      .sort({ publishedAt: -1 })

    const total = await Story.countDocuments(query)

    res.status(200).json({
      success: true,
      data: stories,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        pages: Math.ceil(total / limitNumber),
      },
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error fetching stories' })
  }
}

// GET /api/stories/my-stories (Protected)
export const getMyStories = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authorization required.' })
      return
    }

    const stories = await Story.find({
      $or: [{ author: userId }, { coAuthors: userId }],
    })
      .populate('author', 'name firstName lastName email avatarUrl bio role')
      .populate('coAuthors', 'name firstName lastName email avatarUrl role')
      .sort({ updatedAt: -1 })

    res.status(200).json({
      success: true,
      data: stories,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error fetching writer stories' })
  }
}

// GET /api/stories/:id
export const getStoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const story = await Story.findById(req.params.id)
      .populate('author', 'name firstName lastName email avatarUrl bio role')
      .populate('coAuthors', 'name firstName lastName email avatarUrl role')

    if (!story || story.status !== 'published') {
      res.status(404).json({ success: false, message: 'Story not found or unavailable' })
      return
    }

    // Unique view count incrementation
    const authReq = req as AuthenticatedRequest
    const userId = authReq.user?._id

    if (userId) {
      const alreadyViewed = story.viewedBy?.some((id) => id.toString() === userId.toString())
      if (!alreadyViewed) {
        if (!story.viewedBy) story.viewedBy = []
        story.viewedBy.push(userId)
        story.viewCount += 1
        await story.save()
      }
    } else {
      story.viewCount += 1
      await story.save()
    }

    res.status(200).json({
      success: true,
      data: story,
    })
  } catch (error: any) {
    if (error.name === 'CastError') {
      res.status(404).json({ success: false, message: 'Story not found or unavailable' })
      return
    }
    res.status(500).json({ success: false, message: error.message || 'Server error fetching story details' })
  }
}

// GET /api/stories/share/:shareSlug
export const getStoryBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const story = await Story.findOne({ shareSlug: req.params.shareSlug })
      .populate('author', 'name firstName lastName email avatarUrl bio role')
      .populate('coAuthors', 'name firstName lastName email avatarUrl role')

    if (!story || story.status !== 'published' || !story.isPubliclyShareable) {
      res.status(404).json({ success: false, message: 'Shareable story not found or unavailable' })
      return
    }

    // Increment view count
    story.viewCount += 1
    await story.save()

    res.status(200).json({
      success: true,
      data: story,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error fetching shareable story' })
  }
}

// GET /api/stories/genres
export const getGenres = async (req: Request, res: Response): Promise<void> => {
  try {
    const genres = await Story.find({ status: 'published' }).distinct('genres')
    res.status(200).json({
      success: true,
      data: genres.filter(Boolean),
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error fetching distinct genres' })
  }
}

// POST /api/stories (Protected)
export const createStory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, subtitle, genres, tags, content, coverImageUrl, status = 'draft' } = req.body
    const userId = req.user?._id

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authorization required.' })
      return
    }

    if (!title) {
      res.status(400).json({ success: false, message: 'Story title is required.' })
      return
    }

    const isPublished = status === 'published'
    const shareSlug = isPublished ? generateUniqueSlug(title) : undefined

    const story = new Story({
      title,
      subtitle: subtitle || '',
      author: userId,
      coAuthors: [],
      genres: Array.isArray(genres) ? genres : genres ? [genres] : [],
      tags: Array.isArray(tags) ? tags : tags ? [tags] : [],
      content: content || {},
      coverImageUrl: coverImageUrl || '',
      status: isPublished ? 'published' : 'draft',
      isPubliclyShareable: isPublished,
      shareSlug,
      publishedAt: isPublished ? new Date() : undefined,
    })

    await story.save()

    const populated = await Story.findById(story._id)
      .populate('author', 'name firstName lastName email avatarUrl bio role')
      .populate('coAuthors', 'name firstName lastName email avatarUrl role')

    res.status(201).json({
      success: true,
      message: isPublished ? 'Story published successfully!' : 'Draft saved successfully.',
      data: populated,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error creating story' })
  }
}

// PATCH /api/stories/:id (Protected - Author / Co-Author only)
export const updateStory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authorization required.' })
      return
    }

    const story = await Story.findById(req.params.id)
    if (!story) {
      res.status(404).json({ success: false, message: 'Story not found.' })
      return
    }

    // Check edit permissions
    const isAuthor = story.author.toString() === userId.toString()
    const isCoAuthor = story.coAuthors.some((id) => id.toString() === userId.toString())

    if (!isAuthor && !isCoAuthor) {
      res.status(403).json({ success: false, message: 'Forbidden. Only the author or accepted co-authors can edit.' })
      return
    }

    const { title, subtitle, genres, tags, content, coverImageUrl, status } = req.body

    if (title !== undefined) story.title = title
    if (subtitle !== undefined) story.subtitle = subtitle
    if (genres !== undefined) story.genres = Array.isArray(genres) ? genres : [genres]
    if (tags !== undefined) story.tags = Array.isArray(tags) ? tags : [tags]
    if (content !== undefined) story.content = content
    if (coverImageUrl !== undefined) story.coverImageUrl = coverImageUrl

    if (status !== undefined) {
      story.status = status
      if (status === 'published') {
        story.isPubliclyShareable = true
        if (!story.publishedAt) story.publishedAt = new Date()
        if (!story.shareSlug) story.shareSlug = generateUniqueSlug(story.title)
      }
    }

    await story.save()

    const populated = await Story.findById(story._id)
      .populate('author', 'name firstName lastName email avatarUrl bio role')
      .populate('coAuthors', 'name firstName lastName email avatarUrl role')

    res.status(200).json({
      success: true,
      message: 'Story updated successfully.',
      data: populated,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error updating story' })
  }
}

// DELETE /api/stories/:id (Protected - Sole Author only)
export const deleteStory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authorization required.' })
      return
    }

    const story = await Story.findById(req.params.id)
    if (!story) {
      res.status(404).json({ success: false, message: 'Story not found.' })
      return
    }

    // Only sole author can delete
    if (story.author.toString() !== userId.toString()) {
      res.status(403).json({ success: false, message: 'Only the author can delete this story.' })
      return
    }

    if (story.coAuthors && story.coAuthors.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Cannot delete a co-authored story without co-author consent.',
      })
      return
    }

    await Story.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: 'Story deleted successfully.',
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error deleting story' })
  }
}

// POST /api/stories/:id/publish (Protected)
export const publishStory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authorization required.' })
      return
    }

    const story = await Story.findById(req.params.id)
    if (!story) {
      res.status(404).json({ success: false, message: 'Story not found.' })
      return
    }

    const isAuthor = story.author.toString() === userId.toString()
    const isCoAuthor = story.coAuthors.some((id) => id.toString() === userId.toString())

    if (!isAuthor && !isCoAuthor) {
      res.status(403).json({ success: false, message: 'Forbidden. Only authors can publish.' })
      return
    }

    story.status = 'published'
    story.isPubliclyShareable = true
    if (!story.publishedAt) story.publishedAt = new Date()
    if (!story.shareSlug) story.shareSlug = generateUniqueSlug(story.title)

    await story.save()

    const populated = await Story.findById(story._id)
      .populate('author', 'name firstName lastName email avatarUrl bio role')
      .populate('coAuthors', 'name firstName lastName email avatarUrl role')

    res.status(200).json({
      success: true,
      message: 'Story published successfully!',
      data: populated,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error publishing story' })
  }
}

// POST /api/upload-image (Protected)
export const uploadImage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { image } = req.body

    if (!image) {
      res.status(400).json({ success: false, message: 'No image data provided.' })
      return
    }

    // Return image URL / Data URI directly as fallback
    res.status(200).json({
      success: true,
      url: image,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error uploading image' })
  }
}
