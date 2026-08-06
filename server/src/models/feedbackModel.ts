import { Schema, model, Document } from 'mongoose'

export interface IFeedback extends Document {
  user: Schema.Types.ObjectId
  message: string
  category: 'bug' | 'suggestion' | 'other'
  status: 'open' | 'reviewed'
  createdAt: Date
  updatedAt: Date
}

const feedbackSchema = new Schema<IFeedback>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['bug', 'suggestion', 'other'],
      required: true,
    },
    status: {
      type: String,
      enum: ['open', 'reviewed'],
      default: 'open',
    },
  },
  {
    timestamps: true,
  }
)

export const Feedback = model<IFeedback>('Feedback', feedbackSchema)
