import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { NoteModel } from '@/models/NoteModel';

export async function DELETE(
  req: Request,
  { params }: { params: { noteId: string } }
) {
  try {
    const conn = await connectToDatabase();
    if (conn) {
      await NoteModel.findOneAndDelete({ noteId: params.noteId });
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ success: false, message: 'Database error' }, { status: 500 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
