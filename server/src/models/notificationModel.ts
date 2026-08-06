import { Schema, model, Document } from 'mongoose'

export interface INotification extends Document {
  recipient: Schema.Types.ObjectId
  type: 'follow' | 'rating' | 'comment' | 'collab_request' | 'collab_accepted'
  fromUser: Schema.Types.ObjectId
  relatedStory?: Schema.Types.ObjectId
  message: string
  isRead: boolean
  createdAt: Date
  updatedAt: Date
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['follow', 'rating', 'comment', 'collab_request', 'collab_accepted'],
      required: true,
    },
    fromUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    relatedStory: {
      type: Schema.Types.ObjectId,
      ref: 'Story',
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

export const Notification = model<INotification>('Notification', notificationSchema)
