import { Response } from 'express'
import { CollabRequest } from '../models/collabRequestModel'
import { Story } from '../models/storyModel'
import { User } from '../models/userModel'
import { AuthenticatedRequest } from '../middleware/authMiddleware'
import { createAndEmitNotification } from '../utils/socket'

// GET /api/users/search (Protected - Search writers)
export const searchWriters = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { query } = req.query
    const userId = req.user?._id

    if (!query || typeof query !== 'string' || !query.trim()) {
      res.status(200).json({ success: true, data: [] })
      return
    }

    const regex = new RegExp(query.trim(), 'i')
    const writers = await User.find({
      _id: { $ne: userId },
      role: 'writer',
      $or: [{ firstName: regex }, { lastName: regex }, { email: regex }],
    })
      .select('name firstName lastName email avatarUrl role')
      .limit(10)

    res.status(200).json({
      success: true,
      data: writers,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error searching writers' })
  }
}

// POST /api/stories/:id/collab-request (Protected - Sole Author only)
export const sendCollabRequest = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { targetUserId } = req.body
    const userId = req.user?._id
    const storyId = req.params.id

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authorization required.' })
      return
    }

    if (!targetUserId) {
      res.status(400).json({ success: false, message: 'Target writer ID is required.' })
      return
    }

    const story = await Story.findById(storyId)
    if (!story) {
      res.status(404).json({ success: false, message: 'Story not found.' })
      return
    }

    // Only sole original author can send co-author invites
    if (story.author.toString() !== userId.toString()) {
      res.status(403).json({ success: false, message: 'Only the original author can invite co-authors.' })
      return
    }

    if (targetUserId.toString() === userId.toString()) {
      res.status(400).json({ success: false, message: 'You cannot invite yourself as a co-author.' })
      return
    }

    // Check if already co-author
    if (story.coAuthors.some((id) => id.toString() === targetUserId.toString())) {
      res.status(400).json({ success: false, message: 'This writer is already a co-author of this story.' })
      return
    }

    // Check if pending request exists
    const existingPending = await CollabRequest.findOne({
      story: storyId,
      fromUser: userId,
      toUser: targetUserId,
      status: 'pending',
    })

    if (existingPending) {
      res.status(400).json({ success: false, message: 'A collaboration request is already pending for this writer.' })
      return
    }

    const collabRequest = await CollabRequest.create({
      story: storyId,
      fromUser: userId,
      toUser: targetUserId,
      status: 'pending',
    })

    const populated = await CollabRequest.findById(collabRequest._id)
      .populate('fromUser', 'name firstName lastName avatarUrl role')
      .populate('toUser', 'name firstName lastName avatarUrl role')
      .populate('story', 'title shareSlug')

    const actorName = req.user?.firstName || req.user?.name || 'Someone'
    await createAndEmitNotification({
      recipient: targetUserId.toString(),
      type: 'collab_request',
      fromUser: userId.toString(),
      relatedStory: storyId,
      message: `${actorName} invited you to co-author "${story.title}".`,
    })

    res.status(201).json({
      success: true,
      message: 'Collaboration request sent successfully!',
      data: populated,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error sending collab request' })
  }
}

// GET /api/collab-requests (Protected)
export const getCollabRequests = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authorization required.' })
      return
    }

    const requests = await CollabRequest.find({
      toUser: userId,
      status: 'pending',
    })
      .populate('fromUser', 'name firstName lastName email avatarUrl role')
      .populate('story', 'title subtitle coverImageUrl status')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      data: requests,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error fetching collab requests' })
  }
}

// PATCH /api/collab-requests/:id (Protected - Recipient only)
export const respondCollabRequest = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { status } = req.body
    const userId = req.user?._id

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authorization required.' })
      return
    }

    if (!status || !['accepted', 'declined'].includes(status)) {
      res.status(400).json({ success: false, message: 'Status must be accepted or declined.' })
      return
    }

    const collabRequest = await CollabRequest.findById(req.params.id)
    if (!collabRequest) {
      res.status(404).json({ success: false, message: 'Collaboration request not found.' })
      return
    }

    if (collabRequest.toUser.toString() !== userId.toString()) {
      res.status(403).json({ success: false, message: 'You are not authorized to respond to this request.' })
      return
    }

    collabRequest.status = status
    await collabRequest.save()

    const story = await Story.findById(collabRequest.story)

    if (status === 'accepted' && story) {
      await Story.findByIdAndUpdate(collabRequest.story, {
        $addToSet: { coAuthors: userId },
      })

      const actorName = req.user?.firstName || req.user?.name || 'Someone'
      await createAndEmitNotification({
        recipient: collabRequest.fromUser.toString(),
        type: 'collab_accepted',
        fromUser: userId.toString(),
        relatedStory: story._id.toString(),
        message: `${actorName} accepted your co-authoring invitation for "${story.title}".`,
      })
    }

    res.status(200).json({
      success: true,
      message: `Collaboration request ${status}.`,
      data: collabRequest,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error responding to collab request' })
  }
}
