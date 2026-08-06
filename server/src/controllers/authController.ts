import { Response } from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../models/userModel'
import { AuthenticatedRequest } from '../middleware/authMiddleware'
import { JWT_SECRET } from '../config/jwtConfig'

// POST /api/auth/signup
export const signup = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Please provide name, email, and password.' })
      return
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail })
    if (existingUser) {
      res.status(400).json({ success: false, message: 'User with this email already exists.' })
      return
    }

    // Split name into firstName and lastName
    const nameParts = name.trim().split(/\s+/)
    const firstName = nameParts[0] || 'Writer'
    const lastName = nameParts.slice(1).join(' ') || 'User'

    // Create user with empty role initially
    const user = new User({
      firstName,
      lastName,
      email: normalizedEmail,
      passwordHash: password,
      role: '',
    })
    await user.save()

    // Generate JWT
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' })

    // Set in HttpOnly Cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    res.status(201).json({
      success: true,
      message: 'Signup successful. Logged in.',
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
      },
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error during signup' })
  }
}

// POST /api/auth/login
export const login = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide email and password.' })
      return
    }

    const normalizedEmail = email.toLowerCase().trim()

    const user = await User.findOne({ email: normalizedEmail })
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' })
      return
    }

    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' })
      return
    }

    if (user.isSuspended) {
      res.status(403).json({ success: false, message: 'Your account has been suspended by an administrator.' })
      return
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' })

    // Set in HttpOnly Cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin || false,
        isSuspended: user.isSuspended || false,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
      },
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error during login' })
  }
}

// POST /api/auth/logout
export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    })
    res.status(200).json({ success: true, message: 'Logged out successfully.' })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error during logout' })
  }
}

// GET /api/auth/me
export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    res.status(200).json({
      success: true,
      data: req.user,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error fetching user details' })
  }
}

// PATCH /api/auth/set-role
export const setRole = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { role } = req.body

    if (!role || (role !== 'reader' && role !== 'writer')) {
      res.status(400).json({ success: false, message: "Role must be 'reader' or 'writer'." })
      return
    }

    const userId = req.user?._id
    const user = await User.findByIdAndUpdate(userId, { role }, { new: true }).select('-passwordHash')

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' })
      return
    }

    res.status(200).json({
      success: true,
      message: `Account role set to ${role} successfully.`,
      data: user,
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error setting role' })
  }
}
