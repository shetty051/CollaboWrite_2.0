import { Router } from 'express'
import {
  getFeedback,
  updateFeedbackStatus,
  getReports,
  resolveReport,
  removeStory,
  getUsers,
  toggleUserSuspension,
} from '../controllers/adminController'
import { requireAuth, requireAdmin } from '../middleware/authMiddleware'

const router = Router()

// All admin routes guarded by requireAuth & requireAdmin
router.use(requireAuth, requireAdmin)

router.get('/admin/feedback', getFeedback)
router.patch('/admin/feedback/:id', updateFeedbackStatus)

router.get('/admin/reports', getReports)
router.patch('/admin/reports/:id', resolveReport)

router.post('/admin/stories/:id/remove', removeStory)

router.get('/admin/users', getUsers)
router.patch('/admin/users/:id/suspend', toggleUserSuspension)

export default router
