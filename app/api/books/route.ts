import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { BookModel } from '@/models/BookModel';
import { INITIAL_BOOKS } from '@/lib/mockData';

export async function GET() {
  try {
    const conn = await connectToDatabase();
    if (conn) {
      const dbBooks = await BookModel.find({}).sort({ createdAt: -1 });
      if (dbBooks.length > 0) {
        const formatted = dbBooks.map((b) => ({
          id: b.bookId,
          title: b.title,
          author: b.author,
          description: b.description,
          coverImage: b.coverImage,
          bannerImage: b.bannerImage,
          category: b.category,
          status: b.status,
          rating: b.rating,
          totalPages: b.totalPages,
          pagesPerChapter: b.pagesPerChapter,
          totalChapters: b.totalChapters,
          chapters: b.chapters,
          isBookmarked: b.isBookmarked,
          isHot: b.isHot,
          isNew: b.isNew,
          pdfUrl: b.pdfUrl,
          uploadedAt: b.uploadedAt,
        }));
        return NextResponse.json(formatted);
      }
    }
    return NextResponse.json(INITIAL_BOOKS);
  } catch (error) {
    return NextResponse.json(INITIAL_BOOKS);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const bookId = body.id || `book-${Date.now()}`;

    const conn = await connectToDatabase();
    if (conn) {
      const created = await BookModel.create({
        bookId,
        ...body,
        uploadedAt: new Date().toISOString(),
      });
      return NextResponse.json({ success: true, item: created });
    }

    return NextResponse.json({ success: true, item: body });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
