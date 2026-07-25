import mongoose, { Schema, Document } from 'mongoose';

export interface IProgressDocument extends Document {
  bookId: string;
  currentPage: number;
  currentChapter: number;
  lastReadAt: string;
  totalPagesReadToday: number;
  dailyGoal: number;
  goalReachedToday: boolean;
  sessionDate: string;
}

const ProgressSchema = new Schema(
  {
    bookId: { type: String, required: true, unique: true },
    currentPage: { type: Number, default: 1 },
    currentChapter: { type: Number, default: 1 },
    lastReadAt: { type: String, default: () => new Date().toISOString() },
    totalPagesReadToday: { type: Number, default: 0 },
    dailyGoal: { type: Number, default: 15 },
    goalReachedToday: { type: Boolean, default: false },
    sessionDate: { type: String },
  },
  { timestamps: true }
);

export const ProgressModel = mongoose.models.Progress || mongoose.model<IProgressDocument>('Progress', ProgressSchema);
