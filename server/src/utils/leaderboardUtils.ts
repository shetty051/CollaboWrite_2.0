export interface ScoreParams {
  averageRating: number
  totalFollowers: number
  totalViews: number
}

/**
 * Calculates a composite writer leaderboard score.
 * Formula: (averageRating * 20) + (totalFollowers * 2) + (totalViews * 0.1)
 */
export const calculateLeaderboardScore = ({
  averageRating,
  totalFollowers,
  totalViews,
}: ScoreParams): number => {
  const ratingWeight = averageRating * 20
  const followerWeight = totalFollowers * 2
  const viewWeight = totalViews * 0.1

  const totalScore = ratingWeight + followerWeight + viewWeight
  return Math.round(totalScore * 10) / 10
}
