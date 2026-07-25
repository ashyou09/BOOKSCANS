import { NextResponse } from 'next/server';
import { PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { dynamo } from '@/lib/dynamo';

export async function PUT(
  req: Request,
  { params }: { params: { bookId: string } }
) {
  try {
    const { currentPage, currentChapter, dailyGoal } = await req.json();
    const today = new Date().toISOString().split('T')[0];

    const existing = await dynamo
      .send(
        new GetCommand({
          TableName: 'Progress',
          Key: { PK: 'USER#admin', SK: `BOOK#${params.bookId}` },
        })
      )
      .catch(() => null);

    const prev = existing?.Item;
    const isNewDay = prev?.sessionDate !== today;
    const pagesReadToday = isNewDay
      ? 1
      : (prev?.totalPagesReadToday || 0) + 1;

    const item = {
      PK: 'USER#admin',
      SK: `BOOK#${params.bookId}`,
      currentPage,
      currentChapter,
      lastReadAt: new Date().toISOString(),
      totalPagesReadToday: pagesReadToday,
      dailyGoal: dailyGoal || prev?.dailyGoal || 15,
      goalReachedToday: pagesReadToday >= (dailyGoal || prev?.dailyGoal || 15),
      sessionDate: today,
    };

    await dynamo
      .send(
        new PutCommand({
          TableName: 'Progress',
          Item: item,
        })
      )
      .catch(() => null);

    return NextResponse.json({
      success: true,
      pagesReadToday,
      goalReached: pagesReadToday >= (dailyGoal || 15),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
