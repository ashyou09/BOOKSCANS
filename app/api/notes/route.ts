import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { NoteModel } from '@/models/NoteModel';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get('bookId');
    const chapterNumber = searchParams.get('chapterNumber');

    await connectToDatabase();

    const query: any = {};
    if (bookId) query.bookId = bookId;
    if (chapterNumber) query.chapterNumber = Number(chapterNumber);

    const notes = await NoteModel.find(query).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      notes: notes.map((n) => ({
        id: n.noteId,
        bookId: n.bookId,
        chapterNumber: n.chapterNumber,
        text: n.text,
        createdAt: n.createdAt,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { bookId, chapterNumber, text } = body;

    await connectToDatabase();

    const newNote = await NoteModel.create({
      noteId: `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      bookId,
      chapterNumber: Number(chapterNumber),
      text,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      note: {
        id: newNote.noteId,
        bookId: newNote.bookId,
        chapterNumber: newNote.chapterNumber,
        text: newNote.text,
        createdAt: newNote.createdAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
