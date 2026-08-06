import { Router } from 'express'
import {
  searchWriters,
  sendCollabRequest,
  getCollabRequests,
  respondCollabRequest,
} from '../controllers/collabController'
import { requireAuth } from '../middleware/authMiddleware'

const router = Router()

router.get('/users/search', requireAuth, searchWriters)
router.post('/stories/:id/collab-request', requireAuth, sendCollabRequest)
router.get('/collab-requests', requireAuth, getCollabRequests)
router.patch('/collab-requests/:id', requireAuth, respondCollabRequest)

export default router
