import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../models/userModel'
import { Story } from '../models/storyModel'
import { calculateLeaderboardScore } from '../utils/leaderboardUtils'
import { JWT_SECRET } from '../config/jwtConfig'

export interface LeaderboardEntry {
  rank: number
  _id: string
  name: string
  firstName?: string
  lastName?: string
  avatarUrl?: string
  role: string
  compositeScore: number
  publishedStoryCount: number
  breakdown: {
    averageRating: number
    totalFollowers: number
    totalViews: number
  }
}

// GET /api/leaderboard (Public / Optional Auth)
export const getLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    // Attempt optional JWT token decoding
    let currentUserId: string | null = null
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1]
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any
        currentUserId = decoded.id || decoded._id || null
      } catch {
        // Token invalid / expired - ignore for guest leaderboard response
      }
    }

    const writers = await User.find({ role: 'writer' }).select(
      'name firstName lastName avatarUrl role followers email'
    )

    // Compute composite scores for all writers
    const allRankings: LeaderboardEntry[] = await Promise.all(
      writers.map(async (writer) => {
        const stories = await Story.find({ author: writer._id, status: 'published' })
        const totalViews = stories.reduce((sum, s) => sum + (s.viewCount || 0), 0)
        const totalRatings = stories.reduce((sum, s) => sum + (s.ratingCount || 0), 0)
        const totalRatingSum = stories.reduce(
          (sum, s) => sum + (s.averageRating || 0) * (s.ratingCount || 0),
          0
        )
        const averageRating = totalRatings > 0 ? totalRatingSum / totalRatings : 5.0
        const totalFollowers = writer.followers?.length || 0

        const compositeScore = calculateLeaderboardScore({
          averageRating,
          totalFollowers,
          totalViews,
        })

        return {
          rank: 0,
          _id: writer._id.toString(),
          name: writer.name,
          firstName: writer.firstName,
          lastName: writer.lastName,
          avatarUrl: writer.avatarUrl,
          role: writer.role,
          compositeScore,
          publishedStoryCount: stories.length,
          breakdown: {
            averageRating: Number(averageRating.toFixed(1)),
            totalFollowers,
            totalViews,
          },
        }
      })
    )

    // Sort descending by composite score
    allRankings.sort((a, b) => b.compositeScore - a.compositeScore)

    // Assign 1-based ranks
    allRankings.forEach((entry, idx) => {
      entry.rank = idx + 1
    })

    const top50 = allRankings.slice(0, 50)

    let currentUserRankData: {
      rank: number
      isTop50: boolean
      entry: LeaderboardEntry | null
    } | null = null

    if (currentUserId) {
      const userEntryIndex = allRankings.findIndex((e) => e._id === currentUserId)
      if (userEntryIndex !== -1) {
        currentUserRankData = {
          rank: userEntryIndex + 1,
          isTop50: userEntryIndex < 50,
          entry: allRankings[userEntryIndex],
        }
      }
    }

    res.status(200).json({
      success: true,
      data: {
        leaderboard: top50,
        currentUserRank: currentUserRankData,
        totalWriters: allRankings.length,
      },
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error fetching leaderboard' })
  }
}
