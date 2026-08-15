import { Schema, model, Document } from 'mongoose';

export interface IContactMessage extends Document {
  name: string;
  email: string;
  message: string;
  status: 'unread' | 'read';
  createdAt: Date;
  updatedAt: Date;
}

const contactMessageSchema = new Schema<IContactMessage>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    message: { type: String, required: true, trim: true },
    status: { type: String, enum: ['unread', 'read'], default: 'unread' },
  },
  { timestamps: true }
);

export const ContactMessage = model<IContactMessage>('ContactMessage', contactMessageSchema);
