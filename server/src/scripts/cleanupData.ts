import path from 'path'
import dns from 'dns'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config({ path: path.join(__dirname, '../../.env') })

dns.setDefaultResultOrder('ipv4first')
try {
  dns.setServers(['8.8.8.8', '1.1.1.1'])
} catch (err) {
  console.warn('Failed to set public DNS servers:', err)
}

import { connectDB } from '../config/db'

async function cleanupData() {
  try {
    console.log('Connecting to MongoDB Atlas...')
    await connectDB()
    console.log('Connected successfully.')

    const db = mongoose.connection.db
    if (!db) {
      throw new Error('Database connection failed')
    }

    const ADMIN_EMAIL = 'aakashshetty1928@gmail.com'

    // 1. Find admin user ID
    const adminUser = await db.collection('users').findOne({ email: ADMIN_EMAIL })
    if (!adminUser) {
      console.warn(`WARNING: Admin user ${ADMIN_EMAIL} was not found in users collection!`)
    } else {
      console.log(`Found Admin User: ${adminUser.name} (${adminUser._id})`)
    }

    // 2. Delete non-admin users
    const deleteUsersRes = await db.collection('users').deleteMany({ email: { $ne: ADMIN_EMAIL } })
    console.log(`Deleted ${deleteUsersRes.deletedCount} non-admin user accounts.`)

    // 3. Reset Admin user's follower, following, and bookmark arrays
    if (adminUser) {
      await db.collection('users').updateOne(
        { _id: adminUser._id },
        { $set: { followers: [], following: [], bookmarks: [] } }
      )
      console.log(`Reset admin account followers, following, and bookmarks lists.`)
    }

    // 4. Delete all stories
    const deleteStoriesRes = await db.collection('stories').deleteMany({})
    console.log(`Deleted ${deleteStoriesRes.deletedCount} stories/manuscripts.`)

    // 5. Delete all comments
    const deleteCommentsRes = await db.collection('comments').deleteMany({})
    console.log(`Deleted ${deleteCommentsRes.deletedCount} comments.`)

    // 6. Delete all ratings
    const deleteRatingsRes = await db.collection('ratings').deleteMany({})
    console.log(`Deleted ${deleteRatingsRes.deletedCount} ratings.`)

    // 7. Delete all collab requests
    const deleteCollabRes = await db.collection('collabrequests').deleteMany({})
    console.log(`Deleted ${deleteCollabRes.deletedCount} collab requests.`)

    // 8. Delete all notifications
    const deleteNotifRes = await db.collection('notifications').deleteMany({})
    console.log(`Deleted ${deleteNotifRes.deletedCount} notifications.`)

    // 9. Delete all reports
    const deleteReportsRes = await db.collection('reports').deleteMany({})
    console.log(`Deleted ${deleteReportsRes.deletedCount} reports.`)

    // 10. Delete all contact messages
    const deleteContactRes = await db.collection('contactmessages').deleteMany({})
    console.log(`Deleted ${deleteContactRes.deletedCount} contact messages.`)

    // 11. Delete all feedback
    const deleteFeedbackRes = await db.collection('feedbacks').deleteMany({})
    console.log(`Deleted ${deleteFeedbackRes.deletedCount} feedback records.`)

    // 12. Delete all OTPs
    const deleteOtpRes = await db.collection('otps').deleteMany({})
    console.log(`Deleted ${deleteOtpRes.deletedCount} OTP tokens.`)

    console.log('Cleanup completed successfully!')
  } catch (error) {
    console.error('Cleanup error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB.')
    process.exit(0)
  }
}

cleanupData()
