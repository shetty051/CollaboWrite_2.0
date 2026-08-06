import { Schema, model, Document } from 'mongoose'

export interface IOtp extends Document {
  email: string
  otpHash: string
  type: 'signup' | 'forgot-password'
  createdAt: Date
}

const otpSchema = new Schema<IOtp>(
  {
    email: {
      type: String,
      required: [true, 'Email is required for OTP mapping'],
      lowercase: true,
      trim: true,
    },
    otpHash: {
      type: String,
      required: [true, 'OTP Hash is required'],
    },
    type: {
      type: String,
      enum: ['signup', 'forgot-password'],
      required: [true, 'OTP verification type is required'],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
)

// TTL Index: automatically delete the OTP document 10 minutes (600 seconds) after creation
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 })

export const Otp = model<IOtp>('Otp', otpSchema)
