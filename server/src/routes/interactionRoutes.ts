import { Router } from 'express'
import {
  rateStory,
  getUserRating,
  addComment,
  getComments,
  deleteComment,
  followUser,
  unfollowUser,
  bookmarkStory,
  unbookmarkStory,
  getMyBookmarks,
  getUserProfile,
  createReport,
} from '../controllers/interactionController'
import { requireAuth, optionalAuth } from '../middleware/authMiddleware'

const router = Router()

// Story Rating
router.post('/stories/:id/rate', requireAuth, rateStory)
router.get('/stories/:id/user-rating', requireAuth, getUserRating)

// Story Comments
router.post('/stories/:id/comments', requireAuth, addComment)
router.get('/stories/:id/comments', getComments)
router.delete('/comments/:id', requireAuth, deleteComment)

// User Follow / Unfollow
router.post('/users/:id/follow', requireAuth, followUser)
router.delete('/users/:id/follow', requireAuth, unfollowUser)

// User Bookmarks
router.post('/stories/:id/bookmark', requireAuth, bookmarkStory)
router.delete('/stories/:id/bookmark', requireAuth, unbookmarkStory)
router.get('/users/me/bookmarks', requireAuth, getMyBookmarks)

// User Profile
router.get('/users/:id/profile', optionalAuth, getUserProfile)

// Reports & Flagging
router.post('/reports', requireAuth, createReport)

export default router
