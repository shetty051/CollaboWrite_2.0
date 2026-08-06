import { Router } from 'express'
import {
  getStories,
  getMyStories,
  getStoryById,
  getStoryBySlug,
  getGenres,
  createStory,
  updateStory,
  deleteStory,
  publishStory,
  uploadImage,
} from '../controllers/storyController'
import { requireAuth } from '../middleware/authMiddleware'

const router = Router()

// Public read endpoints
router.get('/stories', getStories)
router.get('/stories/genres', getGenres)
router.get('/stories/share/:shareSlug', getStoryBySlug)

// Protected endpoints (Order matters so /my-stories is matched before /:id!)
router.get('/stories/my-stories', requireAuth, getMyStories)
router.get('/stories/:id', getStoryById)
router.post('/stories', requireAuth, createStory)
router.patch('/stories/:id', requireAuth, updateStory)
router.delete('/stories/:id', requireAuth, deleteStory)
router.post('/stories/:id/publish', requireAuth, publishStory)
router.post('/upload-image', requireAuth, uploadImage)

export default router
