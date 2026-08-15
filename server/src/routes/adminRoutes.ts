import { Router } from 'express'
import {
  getFeedback,
  updateFeedbackStatus,
  getReports,
  resolveReport,
  removeStory,
  getUsers,
  toggleUserSuspension,
  getContactMessages,
  markContactMessageRead,
} from '../controllers/adminController'
import { requireAuth, requireAdmin } from '../middleware/authMiddleware'

const router = Router()

// All admin routes guarded by requireAuth & requireAdmin
router.use('/admin', requireAuth, requireAdmin)

router.get('/admin/feedback', getFeedback)
router.patch('/admin/feedback/:id', updateFeedbackStatus)

router.get('/admin/reports', getReports)
router.patch('/admin/reports/:id', resolveReport)

router.post('/admin/stories/:id/remove', removeStory)

router.get('/admin/users', getUsers)
router.patch('/admin/users/:id/suspend', toggleUserSuspension)

router.get('/admin/contact-messages', getContactMessages)
router.patch('/admin/contact-messages/:id/read', markContactMessageRead)

export default router
