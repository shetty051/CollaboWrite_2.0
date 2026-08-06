import { Schema, model, Document } from 'mongoose';

export interface IStory extends Document {
  title: string;
  subtitle?: string;
  author: Schema.Types.ObjectId;
  coAuthors: Schema.Types.ObjectId[];
  genres: string[];
  tags: string[];
  content: Record<string, any>;
  coverImageUrl?: string;
  status: 'draft' | 'published';
  isPubliclyShareable: boolean;
  shareSlug?: string;
  viewCount: number;
  viewedBy: Schema.Types.ObjectId[];
  averageRating: number;
  ratingCount: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const storySchema = new Schema<IStory>(
  {
    title: {
      type: String,
      required: [true, 'Story title is required'],
      trim: true,
    },
    subtitle: {
      type: String,
      default: '',
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    coAuthors: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    genres: [
      {
        type: String,
        trim: true,
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    content: {
      type: Schema.Types.Mixed,
      default: {},
    },
    coverImageUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    isPubliclyShareable: {
      type: Boolean,
      default: false,
    },
    shareSlug: {
      type: String,
      unique: true,
      sparse: true, // Allow multiple nulls/undefined for draft stories without unique errors
      trim: true,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    viewedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Indexing for search performance
storySchema.index({ title: 'text', subtitle: 'text' });

export const Story = model<IStory>('Story', storySchema);
