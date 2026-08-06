import { Schema, model, Document } from 'mongoose'

export interface IRating extends Document {
  story: Schema.Types.ObjectId
  user: Schema.Types.ObjectId
  score: number
  createdAt: Date
  updatedAt: Date
}

const ratingSchema = new Schema<IRating>(
  {
    story: {
      type: Schema.Types.ObjectId,
      ref: 'Story',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
)

// Ensure one rating per user per story
ratingSchema.index({ story: 1, user: 1 }, { unique: true })

export const Rating = model<IRating>('Rating', ratingSchema)
