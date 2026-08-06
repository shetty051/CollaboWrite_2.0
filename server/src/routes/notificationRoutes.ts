import { Router } from 'express'
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from '../controllers/notificationController'
import { requireAuth } from '../middleware/authMiddleware'

const router = Router()

router.get('/notifications', requireAuth, getNotifications)
router.patch('/notifications/read-all', requireAuth, markAllAsRead)
router.patch('/notifications/:id/read', requireAuth, markAsRead)

export default router
