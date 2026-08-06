import { Schema, model, Document } from 'mongoose'

export interface IComment extends Document {
  story: Schema.Types.ObjectId
  author: Schema.Types.ObjectId
  text: string
  createdAt: Date
  updatedAt: Date
}

const commentSchema = new Schema<IComment>(
  {
    story: {
      type: Schema.Types.ObjectId,
      ref: 'Story',
      required: true,
      index: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

export const Comment = model<IComment>('Comment', commentSchema)
