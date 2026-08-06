import { Schema, model, Document } from 'mongoose'

export interface ICollabRequest extends Document {
  story: Schema.Types.ObjectId
  fromUser: Schema.Types.ObjectId
  toUser: Schema.Types.ObjectId
  status: 'pending' | 'accepted' | 'declined'
  createdAt: Date
  updatedAt: Date
}

const collabRequestSchema = new Schema<ICollabRequest>(
  {
    story: {
      type: Schema.Types.ObjectId,
      ref: 'Story',
      required: true,
      index: true,
    },
    fromUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    toUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
)

export const CollabRequest = model<ICollabRequest>('CollabRequest', collabRequestSchema)
