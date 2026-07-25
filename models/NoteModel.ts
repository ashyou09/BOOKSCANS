import mongoose, { Schema, Document } from 'mongoose';
import { ChapterNote } from '@/types';

export interface INoteDocument extends Omit<ChapterNote, 'id'>, Document {
  noteId: string;
}

const NoteSchema = new Schema<INoteDocument>(
  {
    noteId: { type: String, required: true, unique: true },
    bookId: { type: String, required: true },
    chapterNumber: { type: Number, required: true },
    text: { type: String, required: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: true }
);

export const NoteModel = mongoose.models.Note || mongoose.model<INoteDocument>('Note', NoteSchema);
