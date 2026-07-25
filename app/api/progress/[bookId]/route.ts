import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ProgressModel } from '@/models/ProgressModel';

export async function GET(
  req: Request,
  { params }: { params: { bookId: string } }
) {
  try {
    const conn = await connectToDatabase();
    if (conn) {
      const progress = await ProgressModel.findOne({ bookId: params.bookId });
      if (progress) {
        return NextResponse.json({ success: true, progress });
      }
    }
    return NextResponse.json({ success: false, message: 'Progress not found' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { bookId: string } }
) {
  try {
    const body = await req.json();
    const { currentPage, currentChapter, dailyGoal } = body;
    const today = new Date().toISOString().split('T')[0];

    const conn = await connectToDatabase();
    if (conn) {
      const existing = await ProgressModel.findOne({ bookId: params.bookId });
      const isNewDay = existing?.sessionDate !== today;
      const pagesReadToday = isNewDay ? 1 : (existing?.totalPagesReadToday || 0) + 1;
      const goal = dailyGoal || existing?.dailyGoal || 15;

      const updated = await ProgressModel.findOneAndUpdate(
        { bookId: params.bookId },
        {
          bookId: params.bookId,
          currentPage: currentPage || 1,
          currentChapter: currentChapter || 1,
          lastReadAt: new Date().toISOString(),
          totalPagesReadToday: pagesReadToday,
          dailyGoal: goal,
          goalReachedToday: pagesReadToday >= goal,
          sessionDate: today,
        },
        { upsert: true, new: true }
      );

      return NextResponse.json({
        success: true,
        progress: updated,
        pagesReadToday,
        goalReached: pagesReadToday >= goal,
      });
    }

    return NextResponse.json({ success: true, message: 'Updated locally' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
