import { Router } from 'express'
import { getWriterStats } from '../controllers/statsController'
import { requireAuth } from '../middleware/authMiddleware'

const router = Router()

router.get('/users/me/stats', requireAuth, getWriterStats)

export default router
