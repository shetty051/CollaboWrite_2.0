import { Router } from 'express'
import {
  getSpotlight,
  getRecommendations,
  submitFeedback,
  submitContactMessage,
} from '../controllers/homeController'
import { requireAuth } from '../middleware/authMiddleware'

const router = Router()

router.get('/home/spotlight', getSpotlight)
router.get('/home/recommendations', requireAuth, getRecommendations)
router.post('/feedback', requireAuth, submitFeedback)
router.post('/contact', submitContactMessage)

export default router
