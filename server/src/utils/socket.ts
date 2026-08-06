import { Server } from 'socket.io'
import { Notification } from '../models/notificationModel'
import { logger } from './logger'

let io: Server | null = null

export const setSocketIO = (socketServer: Server): void => {
  io = socketServer
}

export const getSocketIO = (): Server | null => {
  return io
}

interface CreateNotificationParams {
  recipient: string
  type: 'follow' | 'rating' | 'comment' | 'collab_request' | 'collab_accepted'
  fromUser: string
  relatedStory?: string
  message: string
}

export const createAndEmitNotification = async (
  params: CreateNotificationParams
): Promise<void> => {
  try {
    // Don't send notification to oneself
    if (params.recipient.toString() === params.fromUser.toString()) {
      return
    }

    const notification = await Notification.create({
      recipient: params.recipient,
      type: params.type,
      fromUser: params.fromUser,
      relatedStory: params.relatedStory,
      message: params.message,
      isRead: false,
    })

    const populated = await Notification.findById(notification._id)
      .populate('fromUser', 'name firstName lastName avatarUrl role')
      .populate('relatedStory', 'title shareSlug')

    if (io && populated) {
      const room = `user_${params.recipient.toString()}`
      io.to(room).emit('new_notification', populated)
      logger.info(`Emitted notification event 'new_notification' to room: ${room}`)
    }
  } catch (error) {
    logger.error('Error creating or emitting notification:', error)
  }
}
