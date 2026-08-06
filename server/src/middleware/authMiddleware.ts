import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { User, IUser } from '../models/userModel'
import { JWT_SECRET } from '../config/jwtConfig'

export interface AuthenticatedRequest extends Request {
  user?: IUser
}

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1]

    if (!token) {
      res.status(401).json({ success: false, message: 'Authentication required.' })
      return
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    const user = await User.findById(decoded.id || decoded._id)

    if (!user) {
      res.status(401).json({ success: false, message: 'User not found.' })
      return
    }

    if (user.isSuspended) {
      res.status(403).json({ success: false, message: 'Your account has been suspended by an administrator.' })
      return
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token.' })
  }
}

export const requireAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user || !req.user.isAdmin) {
    res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' })
    return
  }
  next()
}
