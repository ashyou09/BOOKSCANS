import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { BookModel } from '@/models/BookModel';

export async function PUT(
  req: Request,
  { params }: { params: { bookId: string } }
) {
  try {
    const body = await req.json();
    const { isBookmarked } = body;

    const conn = await connectToDatabase();
    if (conn) {
      const updated = await BookModel.findOneAndUpdate(
        { bookId: params.bookId },
        { isBookmarked },
        { new: true }
      );
      if (updated) {
        return NextResponse.json({ success: true, book: updated });
      }
    }
    return NextResponse.json({ success: false, message: 'Book not found' }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
