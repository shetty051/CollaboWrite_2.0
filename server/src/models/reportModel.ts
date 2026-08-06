import { Schema, model, Document } from 'mongoose'

export interface IReport extends Document {
  reporter: Schema.Types.ObjectId
  targetType: 'story' | 'comment'
  targetId: Schema.Types.ObjectId
  reason: string
  status: 'pending' | 'resolved' | 'dismissed'
  actionTaken?: 'dismiss' | 'remove_content' | 'warn_user' | null
  createdAt: Date
  updatedAt: Date
}

const reportSchema = new Schema<IReport>(
  {
    reporter: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetType: {
      type: String,
      enum: ['story', 'comment'],
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    reason: {
      type: String,
      required: [true, 'Report reason is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'resolved', 'dismissed'],
      default: 'pending',
    },
    actionTaken: {
      type: String,
      enum: ['dismiss', 'remove_content', 'warn_user', null],
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

export const Report = model<IReport>('Report', reportSchema)
