import mongoose, { Schema, Document } from 'mongoose';

export interface IBookDocument extends Document {
  bookId: string;
  title: string;
  author?: string;
  description: string;
  coverImage: string;
  bannerImage?: string;
  category: string;
  status: string;
  rating: number;
  totalPages: number;
  pagesPerChapter: number;
  totalChapters: number;
  chapters: any[];
  isBookmarked: boolean;
  isHot?: boolean;
  pdfUrl?: string;
  uploadedAt: string;
}

const BookSchema = new Schema(
  {
    bookId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    author: { type: String },
    description: { type: String, default: '' },
    coverImage: { type: String, required: true },
    bannerImage: { type: String },
    category: { type: String, required: true },
    status: { type: String, default: 'ONGOING' },
    rating: { type: Number, default: 5.0 },
    totalPages: { type: Number, required: true },
    pagesPerChapter: { type: Number, required: true },
    totalChapters: { type: Number, required: true },
    chapters: [],
    isBookmarked: { type: Boolean, default: false },
    isHot: { type: Boolean, default: false },
    pdfUrl: { type: String },
    uploadedAt: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: true }
);

export const BookModel = mongoose.models.Book || mongoose.model<IBookDocument>('Book', BookSchema);
