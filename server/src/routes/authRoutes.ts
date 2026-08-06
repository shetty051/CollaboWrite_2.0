import { Router } from 'express'
import {
  signup,
  login,
  logout,
  getMe,
  setRole,
} from '../controllers/authController'
import { requireAuth } from '../middleware/authMiddleware'

const router = Router()

router.post('/signup', signup)
router.post('/login', login)
router.post('/logout', logout)

// Protected routes
router.get('/me', requireAuth, getMe)
router.patch('/set-role', requireAuth, setRole)

export default router
