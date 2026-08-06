import { Response } from 'express'
import { Notification } from '../models/notificationModel'
import { AuthenticatedRequest } from '../middleware/authMiddleware'

// GET /api/notifications (Protected)
export const getNotifications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authorization required.' })
      return
    }

    const notifications = await Notification.find({ recipient: userId })
      .populate('fromUser', 'name firstName lastName avatarUrl role')
      .populate('relatedStory', 'title shareSlug')
      .sort({ createdAt: -1 })
      .limit(30)

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    })

    res.status(200).json({
      success: true,
      data: notifications,
      unreadCount,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error fetching notifications' })
  }
}

// PATCH /api/notifications/:id/read (Protected)
export const markAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authorization required.' })
      return
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: userId },
      { isRead: true },
      { new: true }
    )

    if (!notification) {
      res.status(404).json({ success: false, message: 'Notification not found.' })
      return
    }

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    })

    res.status(200).json({
      success: true,
      data: notification,
      unreadCount,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error updating notification' })
  }
}

// PATCH /api/notifications/read-all (Protected)
export const markAllAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authorization required.' })
      return
    }

    await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true })

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read.',
      unreadCount: 0,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error marking notifications read' })
  }
}
