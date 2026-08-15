import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import dns from 'dns'
import jwt from 'jsonwebtoken'

// Prioritize IPv4 DNS resolution
dns.setDefaultResultOrder('ipv4first')
try {
  dns.setServers(['8.8.8.8', '1.1.1.1'])
} catch (err) {
  console.warn('Failed to set public DNS servers:', err)
}

import { connectDB } from './config/db'
import healthRoutes from './routes/healthRoutes'
import storyRoutes from './routes/storyRoutes'
import authRoutes from './routes/authRoutes'
import interactionRoutes from './routes/interactionRoutes'
import notificationRoutes from './routes/notificationRoutes'
import collabRoutes from './routes/collabRoutes'
import statsRoutes from './routes/statsRoutes'
import leaderboardRoutes from './routes/leaderboardRoutes'
import homeRoutes from './routes/homeRoutes'
import adminRoutes from './routes/adminRoutes'
import { errorHandler } from './middleware/errorHandler'
import { logger } from './utils/logger'
import { setSocketIO } from './utils/socket'
import { JWT_SECRET } from './config/jwtConfig'

// Load Environment Variables
dotenv.config()

const app = express()
const server = http.createServer(app)

// Port settings (Render binds process.env.PORT dynamically)
const PORT = process.env.PORT || process.env.SERVER_PORT || 5000
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

// Enable CORS
app.use(
  cors({
    origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
)

import { uploadAvatar } from './controllers/authController'
import { requireAuth } from './middleware/authMiddleware'

// Middlewares
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))
app.use(cookieParser())

// API Routes
app.post('/api/upload-avatar', requireAuth, uploadAvatar)
app.use('/api/auth', authRoutes)
app.use('/api', healthRoutes)
app.use('/api', storyRoutes)
app.use('/api', interactionRoutes)
app.use('/api', notificationRoutes)
app.use('/api', collabRoutes)
app.use('/api', statsRoutes)
app.use('/api', leaderboardRoutes)
app.use('/api', homeRoutes)
app.use('/api', adminRoutes)

// Socket.io Integration
const io = new Server(server, {
  cors: {
    origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

// Store Socket.io instance globally for controller emissions
setSocketIO(io)

// Socket authentication & room join middleware
io.use((socket, next) => {
  try {
    const rawCookie = socket.request.headers.cookie
    if (rawCookie) {
      const match = rawCookie.match(/token=([^;]+)/)
      if (match && match[1]) {
        const decoded = jwt.verify(match[1], JWT_SECRET) as any
        socket.data.user = decoded
      }
    }
    next()
  } catch (err) {
    next()
  }
})

io.on('connection', (socket) => {
  const userId = socket.data.user?.id || socket.data.user?._id
  logger.info(`User connected to socket: ${socket.id}`)

  if (userId) {
    const userRoom = `user_${userId}`
    socket.join(userRoom)
    logger.info(`Socket ${socket.id} joined private notification room: ${userRoom}`)
  }

  // Explicit user identity registration event from frontend
  socket.on('register_user', (regUserId: string) => {
    if (regUserId) {
      const room = `user_${regUserId}`
      socket.join(room)
      logger.info(`Socket ${socket.id} explicitly joined notification room: ${room}`)
    }
  })

  socket.on('document-join', (documentId: string) => {
    socket.join(documentId)
    logger.info(`Socket ${socket.id} joined document: ${documentId}`)
  })

  socket.on('document-update', (data: { documentId: string; content: string }) => {
    socket.to(data.documentId).emit('document-update-received', data.content)
  })

  socket.on('disconnect', () => {
    logger.info(`User disconnected from socket: ${socket.id}`)
  })
})

// Error Handler Middleware
app.use(errorHandler)

// Database & Server Startup
const startServer = async () => {
  try {
    await connectDB()
  } catch (error) {
    logger.error('Database connection failed on startup. Server will continue running.', error)
  }

  server.listen(PORT, () => {
    logger.info(`Express Server running on port ${PORT}`)
    logger.info(`Health check API: http://localhost:${PORT}/api/health`)
  })
}

startServer()
