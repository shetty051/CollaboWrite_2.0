import { Router } from 'express'
import {
  getSpotlight,
  getRecommendations,
  submitFeedback,
} from '../controllers/homeController'
import { requireAuth } from '../middleware/authMiddleware'

const router = Router()

router.get('/home/spotlight', getSpotlight)
router.get('/home/recommendations', requireAuth, getRecommendations)
router.post('/feedback', requireAuth, submitFeedback)

export default router
